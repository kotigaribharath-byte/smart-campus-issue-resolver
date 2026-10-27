import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';
import { chatCache } from '../utils/chatCache.js';

const NVIDIA_API_KEY =
  process.env.NVIDIA_API_KEY ||
  '';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'openai/gpt-oss-20b';

/**
 * @desc    Chat with CampusFix AI Assistant using NVIDIA NIM with Caching
 * @route   POST /api/chat
 * @access  Private
 */
export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const currentUser = req.user;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required.',
      });
    }

    const currentUserId = currentUser.id || currentUser._id;

    // 1. Fetch user's active / recent issues for live database context
    const userIssues = await prisma.issue.findMany({
      where: currentUser.role === 'staff'
        ? { assignedToId: currentUserId }
        : currentUser.role === 'admin'
        ? {}
        : { reportedById: currentUserId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        assignedTo: {
          select: { name: true, staffId: true, phone: true },
        },
        department: {
          select: { name: true },
        },
        timeline: {
          take: 2,
          orderBy: { createdAt: 'desc' },
          select: {
            newStatus: true,
            comment: true,
            createdAt: true,
          },
        },
      },
    });

    const formattedIssues = userIssues.map((issue) => ({
      id: issue.id,
      complaintId: issue.complaintId,
      title: issue.title,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
      location: issue.location,
      createdAt: issue.createdAt,
      resolvedAt: issue.resolvedAt,
      assignedTechnician: issue.assignedTo?.name || 'Pending assignment',
      department: issue.department?.name || 'General Maintenance',
      latestRemark: issue.timeline?.[0]?.comment || 'No remarks logged yet.',
    }));

    // Find any complaint ID specifically mentioned in user message (e.g. SRM-2026-XXXX or #1234)
    const upperMsg = message.toUpperCase();
    const matchedIssues = formattedIssues.filter(
      (iss) =>
        upperMsg.includes(iss.complaintId.toUpperCase()) ||
        upperMsg.includes(iss.title.toUpperCase()) ||
        (iss.complaintId.split('-')[2] && upperMsg.includes(iss.complaintId.split('-')[2]))
    );

    // ─── Smart Cache Evaluation ───
    const isUserSpecific =
      upperMsg.includes('STATUS') ||
      upperMsg.includes('MY') ||
      upperMsg.includes('COMPLAINT') ||
      upperMsg.includes('ISSUE') ||
      upperMsg.includes('TICKET') ||
      upperMsg.includes('SRM-') ||
      matchedIssues.length > 0;

    const ticketStateHash = formattedIssues
      .map((i) => `${i.id}:${i.status}:${i.assignedTechnician}`)
      .join(';');

    const cacheKey = chatCache.generateKey({
      userId: currentUserId,
      query: message,
      isUserSpecific,
      ticketStateHash,
    });

    // If response was previously generated and tickets have not changed, return from cache immediately
    const cachedResponse = chatCache.get(cacheKey);
    if (cachedResponse) {
      console.log(`⚡ [CHAT CACHE HIT] Served cached response in <1ms for: "${message}"`);
      return res.status(200).json({
        success: true,
        reply: cachedResponse.reply,
        matchedIssues: cachedResponse.matchedIssues || [],
        cached: true,
      });
    }

    console.log(`🔍 [CHAT CACHE MISS] Querying AI model for: "${message}"`);

    // Context summary for system prompt
    const issuesSummary = formattedIssues.length > 0
      ? formattedIssues.map((iss, idx) =>
          `${idx + 1}. [Ticket #${iss.complaintId}] "${iss.title}" - Status: ${iss.status.toUpperCase()} | Priority: ${iss.priority} | Location: ${iss.location} | Technician: ${iss.assignedTechnician} | Last update: ${iss.latestRemark}`
        ).join('\n')
      : 'No complaints logged by this user yet.';

    const systemPrompt = `You are CampusFix AI, the official intelligent maintenance and facility assistant for SRM Institute of Science and Technology (SRMIST).
Current logged-in user: ${currentUser.name} (${currentUser.role}, Email: ${currentUser.email}).

YOUR RESPONSIBILITIES:
1. Provide accurate, helpful, and concise answers regarding campus issue reporting, facility tracking, hostel repairs, Wi-Fi issues, laboratory equipment, electrical and HVAC maintenance.
2. Directly answer questions regarding the status of the user's complaints using the REAL-TIME TICKET DATABASE provided below.
3. If the user asks "what is the status of my issue" or mentions a ticket ID, refer to their real ticket data accurately.
4. Keep answers friendly, professional, polite, and helpful (use bullet points or bold text where appropriate). Keep responses reasonably concise and to the point.
5. If the user wants to report a new issue, advise them to click the "Report New Issue" button on the dashboard or tell them the required info (Title, Category, Building, Room/Location, Description, and photo).

LIVE USER COMPLAINTS DATABASE (REAL-TIME SNAPSHOT):
${issuesSummary}

CAMPUS MAINTENANCE POLICIES & SLAS:
- Emergency/High Priority (Water leakage, power outages, elevator breakdown): Handled within 2-4 hours.
- Medium Priority (AC breakdown, lab equipment fault): Handled within 12-24 hours.
- Low Priority (General carpentry, cosmetic paint): Handled within 48 hours.
- Office hours: 8:00 AM - 6:00 PM (Emergency facility dispatch available 24/7).
- Help desk email: campusfix@srmist.edu.in
`;

    // Prepare messages array for NVIDIA NIM
    const apiMessages = [
      { role: 'system', content: systemPrompt },
    ];

    // Append last 4 messages from conversation history for multi-turn context
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-4);
      for (const h of recentHistory) {
        if (h.role && h.content) {
          apiMessages.push({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: String(h.content).slice(0, 500),
          });
        }
      }
    }

    apiMessages.push({ role: 'user', content: message });

    let botReply = '';

    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: apiMessages,
          max_tokens: 650,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const choice = data.choices?.[0]?.message;
        if (choice) {
          botReply = choice.content || choice.reasoning_content || '';
          // If reasoning model returned both, ensure we use content
          if (choice.content && choice.content.trim()) {
            botReply = choice.content.trim();
          }
        }
      } else {
        const errorText = await response.text();
        console.error('NVIDIA NIM API responded with non-200:', response.status, errorText);
      }
    } catch (apiError) {
      console.error('Error calling NVIDIA NIM API:', apiError.message);
    }

    // Smart Local Fallback if API was unavailable or returned empty
    if (!botReply) {
      if (matchedIssues.length > 0) {
        const iss = matchedIssues[0];
        botReply = `Here is the current status of your complaint **#${iss.complaintId}** ("${iss.title}"):\n\n` +
          `• **Current Status:** **${iss.status.toUpperCase()}**\n` +
          `• **Category:** ${iss.category}\n` +
          `• **Location:** ${iss.location}\n` +
          `• **Assigned Technician:** ${iss.assignedTechnician}\n` +
          `• **Latest Update:** ${iss.latestRemark}\n\n` +
          `You will also receive an automated email notification the moment our team resolves this complaint!`;
      } else if (upperMsg.includes('STATUS') || upperMsg.includes('COMPLAINT') || upperMsg.includes('ISSUE')) {
        if (formattedIssues.length > 0) {
          const list = formattedIssues.slice(0, 3).map(
            (iss) => `• **#${iss.complaintId}** - *${iss.title}* (${iss.status}) at ${iss.location}`
          ).join('\n');
          botReply = `You currently have ${formattedIssues.length} logged complaints in the SRMIST portal:\n\n${list}\n\nWhich one would you like more details on?`;
        } else {
          botReply = `You currently have no open or recorded complaints in the system. If you've observed any broken facilities on campus, click **Report New Issue** to log one!`;
        }
      } else {
        botReply = `Hello ${currentUser.name}! I am CampusFix AI assistant powered by NVIDIA NIM. I can check your complaint status, tell you about campus facility SLAs, or guide you through reporting maintenance issues. How can I help you today?`;
      }
    }

    const finalMatchedIssues =
      matchedIssues.length > 0
        ? matchedIssues
        : upperMsg.includes('STATUS')
        ? formattedIssues.slice(0, 3)
        : [];

    // Store in cache (User ticket queries: 5 min TTL; General campus inquiries: 30 min TTL)
    if (botReply) {
      chatCache.set(
        cacheKey,
        { reply: botReply, matchedIssues: finalMatchedIssues },
        isUserSpecific ? 300 : 1800
      );
    }

    return res.status(200).json({
      success: true,
      reply: botReply,
      matchedIssues: finalMatchedIssues,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Chat Cache metrics and statistics
 * @route   GET /api/chat/stats
 * @access  Private
 */
export const getChatCacheStats = (req, res) => {
  res.status(200).json({
    success: true,
    cache: chatCache.getStats(),
  });
};
