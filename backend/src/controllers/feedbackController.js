import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';
import { emitNotification, broadcastIssueEvent } from '../socket/socketHandler.js';

// @desc    Submit feedback/rating for a resolved issue
// @route   POST /api/feedback
// @access  Private (Student)
export const submitFeedback = async (req, res, next) => {
  try {
    const { issueId, rating, comment } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!issueId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide issue ID and rating between 1 and 5.',
      });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Verify reporter
    if (issue.reportedById !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for issues you reported.',
      });
    }

    if (!['Resolved', 'Closed'].includes(issue.status)) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be provided for resolved complaints.',
      });
    }

    // Upsert feedback
    const feedback = await prisma.feedback.upsert({
      where: { issueId: issue.id },
      update: {
        rating: numRating,
        comment: comment || '',
      },
      create: {
        issueId: issue.id,
        studentId,
        rating: numRating,
        comment: comment || '',
      },
    });

    // Add entry in timeline
    await prisma.issueUpdate.create({
      data: {
        issueId: issue.id,
        updatedById: studentId,
        previousStatus: issue.status,
        newStatus: issue.status,
        comment: `Student rated resolution: ${numRating}/5 Stars. ${comment ? `"${comment}"` : ''}`,
        actionType: 'feedback',
      },
    });

    // Notify assigned staff
    if (issue.assignedToId) {
      const staffNotif = await prisma.notification.create({
        data: {
          userId: issue.assignedToId,
          issueId: issue.id,
          message: `Student left a ${numRating}-star review for complaint ${issue.complaintId}.`,
          type: 'feedback',
        },
      });
      emitNotification(issue.assignedToId, formatEntity(staffNotif));
    }

    const populatedFeedback = await prisma.feedback.findUnique({
      where: { id: feedback.id },
      include: {
        student: { select: { id: true, name: true, email: true, profileImage: true } },
        issue: {
          select: {
            id: true,
            complaintId: true,
            title: true,
            category: true,
            priority: true,
            resolvedAt: true,
          },
        },
      },
    });

    const formattedFeedback = {
      ...formatEntity(populatedFeedback),
      studentId: formatEntity(populatedFeedback.student),
      issueId: formatEntity(populatedFeedback.issue),
    };

    broadcastIssueEvent('issue_feedback_added', formattedFeedback, {
      userIds: [issue.assignedToId].filter(Boolean),
      roles: ['admin', 'staff'],
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been recorded.',
      feedback: formattedFeedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback with filtering
// @route   GET /api/feedback
// @access  Private (Admin, Staff)
export const getFeedback = async (req, res, next) => {
  try {
    const { rating } = req.query;
    const where = {};

    if (rating && rating !== 'all') {
      where.rating = parseInt(rating, 10);
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true, profileImage: true, studentId: true },
        },
        issue: {
          include: {
            department: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true, email: true, staffId: true } },
            building: { select: { id: true, name: true, block: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate overall average rating
    const aggregations = await prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avgRating = aggregations._avg.rating || 0;
    const totalReviews = aggregations._count.rating || 0;

    const stats = {
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalReviews,
    };

    const formattedFeedbacks = feedbacks.map((f) => ({
      ...formatEntity(f),
      studentId: formatEntity(f.student),
      issueId: formatEntity(f.issue),
    }));

    res.status(200).json({
      success: true,
      stats,
      count: formattedFeedbacks.length,
      feedbacks: formattedFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};
