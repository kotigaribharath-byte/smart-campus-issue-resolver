import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { chatService } from '../../services/chatService';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Clock,
  CheckCircle2,
  Wrench,
  AlertCircle,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
} from 'lucide-react';

export const CampusAssistantChatbot = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const storageKey = `campusfix_chat_${user?.id || 'guest'}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`campusfix_chat_${user?.id || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I am **CampusFix AI**, powered by NVIDIA NIM.\n\nI can check the real-time status of your maintenance complaints, explain facility SLAs, or guide you through reporting campus breakdowns. How can I help you today?`,
        timestamp: new Date(),
        matchedIssues: [],
      },
    ];
  });

  // Persist conversation to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        // ignore
      }
    }
  }, [messages, storageKey]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  if (!isAuthenticated) return null;

  const quickPrompts = [
    'Check status of my issues',
    'What is the status of my latest complaint?',
    'What are the campus facility SLA repair times?',
    'How do I report a laboratory or hostel issue?',
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      // Build history for multi-turn chat context
      const history = newMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await chatService.sendMessage(text, history);

      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: res.reply,
            timestamp: new Date(),
            matchedIssues: res.matchedIssues || [],
            cached: Boolean(res.cached),
          },
        ]);
      } else {
        throw new Error(res.message || 'Failed to receive response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: "I'm having a brief issue reaching the AI backend, but you can always check your complaints directly on the **Complaint Log (NAAC/SLA)** page.",
          timestamp: new Date(),
          matchedIssues: [],
          cached: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch (e) {
      // ignore
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat session reset. I'm ready to look up your complaint status or answer any questions about campus maintenance!`,
        timestamp: new Date(),
        matchedIssues: [],
        cached: false,
      },
    ]);
  };

  const renderStatusBadge = (status = '') => {
    const st = status.toLowerCase();
    if (st === 'resolved' || st === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Resolved
        </span>
      );
    }
    if (st === 'in progress') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <Wrench className="w-3 h-3 text-amber-600" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3 text-blue-600" />
        {status}
      </span>
    );
  };

  const formatText = (text = '') => {
    // Quick inline markdown formatter for bolding, bullet points, and newlines
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        const itemContent = line.replace(/^[•\-]\s*/, '');
        return (
          <li key={lIdx} className="ml-3 my-0.5 list-disc leading-relaxed">
            {renderFormattedInline(itemContent)}
          </li>
        );
      }
      return (
        <p key={lIdx} className="my-1 leading-relaxed">
          {renderFormattedInline(line)}
        </p>
      );
    });
  };

  const renderFormattedInline = (str = '') => {
    // Replace **bold** with <strong>
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* ─── Floating Launch Pill / Button on Bottom Right ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.35)] hover:shadow-[0_14px_35px_rgba(37,99,235,0.45)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          title="Ask CampusFix AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-white animate-bounce-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-600 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight pr-1">CampusFix AI</span>
          <span className="hidden sm:inline-block bg-white/20 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
            NVIDIA
          </span>
        </button>
      )}

      {/* ─── Expandable Chatbot Window ─── */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'w-[95vw] sm:w-[540px] h-[85vh] max-h-[780px]'
              : 'w-[92vw] sm:w-[410px] h-[580px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-4 flex items-center justify-between border-b border-white/10 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight truncate">CampusFix AI</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  SRMIST Issue Resolver • NVIDIA NIM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-xs">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs ${
                      isBot
                        ? 'bg-white text-slate-700 border border-slate-200/90 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <div className="text-xs whitespace-pre-wrap">{formatText(msg.content)}</div>

                    {/* Render Interactive Live Issue Cards if Matched */}
                    {isBot && msg.matchedIssues && msg.matchedIssues.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Live Ticket Record{msg.matchedIssues.length > 1 ? 's' : ''}:
                        </div>
                        {msg.matchedIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl p-2.5 transition-all text-[11px]"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono font-bold text-blue-600">
                                #{issue.complaintId}
                              </span>
                              {renderStatusBadge(issue.status)}
                            </div>
                            <div className="font-semibold text-slate-800 line-clamp-1">
                              {issue.title}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                              <span>📍 {issue.location}</span>
                              <Link
                                to="/student/my-issues"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-0.5 text-blue-600 font-bold hover:underline"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1.5 flex items-center gap-1.5 ${
                        isBot ? 'text-slate-400 justify-between' : 'text-blue-100 justify-end'
                      }`}
                    >
                      {isBot && msg.cached ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                          <Zap className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                          Cached &lt;1ms
                        </span>
                      ) : <span />}
                      <span>
                        {new Intl.DateTimeFormat('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(msg.timestamp))}
                      </span>
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-xl bg-slate-300 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 animate-spin-reverse-slow" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2 shadow-2xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-slate-400 ml-1 font-medium">Looking up campus live data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          {messages.length <= 3 && !loading && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none select-none">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors border border-slate-200/80 shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200/90 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your issue status, SLAs, or campus repairs..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                inputMessage.trim() && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
