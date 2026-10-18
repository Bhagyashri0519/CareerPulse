import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export interface ChatAction {
  label: string;
  path: string;
}

export interface Message {
  role: 'user' | 'ai';
  text: string;
  actions?: ChatAction[];
  isError?: boolean;
}

interface AIResponsePayload {
  reply: string;
  suggestions: string[];
  actions: ChatAction[];
  meta: {
    provider: string;
    isLiveAI: boolean;
    studentName: string;
    timestamp: string;
  };
}

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function AIAssistant({ open, onToggle }: Props) {
  const { user, profile } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const studentFirstName = user?.name ? user.name.trim().split(' ')[0] : '';

  const getInitialGreeting = useCallback((): string => {
    if (studentFirstName) {
      return `Hi ${studentFirstName}! 👋 I'm your CareerPulse AI. I know your skill profile, career goals, and learning gaps. Ask me anything about your career path or navigating the website!`;
    }
    return `Welcome to CareerPulse! 👋 I'm your AI Career Mentor & Website Guide. Let's set up your profile, analyze your resume, and navigate your dream career path!`;
  }, [studentFirstName]);

  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'ai', text: getInitialGreeting() },
  ]);

  const [suggestions, setSuggestions] = useState<string[]>([
    'How do I get started?',
    'Help me upload my resume',
    'Explain my dashboard',
    'What should I learn next?',
  ]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Update greeting when user name becomes available if chat is fresh
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'ai') {
        return [{ role: 'ai', text: getInitialGreeting() }];
      }
      return prev;
    });
  }, [getInitialGreeting]);

  // Load contextual suggestions based on current page
  useEffect(() => {
    let isMounted = true;
    async function loadSuggestions() {
      try {
        const res = await api.get<{ success: boolean; data: { suggestions: string[] } }>(
          `/ai/suggestions?page=${encodeURIComponent(location.pathname)}`,
        );
        if (isMounted && res?.data?.suggestions?.length) {
          setSuggestions(res.data.suggestions);
        }
      } catch {
        // Fallback to page-specific defaults if offline
        if (location.pathname === '/resume') {
          setSuggestions(['How do I import selected skills?', 'Why are resume skills unverified?', 'What file types are supported?']);
        } else if (location.pathname === '/profile') {
          setSuggestions(['Where can I change my target career?', 'How does weekly study hours work?', 'Explain my tracked skills']);
        } else if (location.pathname === '/assessment') {
          setSuggestions(['Why do I need to verify skills?', 'How does assessment affect Dashboard?', 'What score is passing?']);
        } else {
          setSuggestions(['What should I learn next?', 'Explain my dashboard', 'How to prepare for placement interviews?']);
        }
      }
    }

    if (open) {
      loadSuggestions();
    }

    return () => {
      isMounted = false;
    };
  }, [location.pathname, open]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText !== undefined ? queryText : input).trim();
    if (!textToSend || typing) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setLastFailedQuery(null);

    try {
      // Build bounded history payload
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await api.post<{ success: boolean; data: AIResponsePayload }>('/ai/chat', {
        message: textToSend,
        history: historyPayload,
        currentPage: location.pathname,
      });

      if (res?.data?.reply) {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: res.data.reply,
            actions: res.data.actions || [],
          },
        ]);

        if (res.data.suggestions?.length) {
          setSuggestions(res.data.suggestions);
        }
      } else {
        throw new Error('Empty response from AI service');
      }
    } catch {
      setLastFailedQuery(textToSend);
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: '⚠️ Unable to connect to CareerPulse AI right now. Please check your connection and click Retry below.',
          isError: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const ALLOWED_NAV_PATHS = [
    '/',
    '/login',
    '/dashboard',
    '/profile',
    '/resume',
    '/assessment',
    '/assessment/result',
    '/skills',
    '/learning-gap',
    '/career-fit',
    '/courses',
    '/roadmap',
    '/progress',
    '/analytics',
    '/opportunities',
  ];

  const handleRetry = async () => {
    if (!lastFailedQuery || typing) return;
    const query = lastFailedQuery;
    setLastFailedQuery(null);
    // Remove the error message from messages list to avoid clutter
    setMessages((prev) => prev.filter((m) => !m.isError));
    setTyping(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.isError)
        .slice(-8)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await api.post<{ success: boolean; data: AIResponsePayload }>('/ai/chat', {
        message: query,
        history: historyPayload,
        currentPage: location.pathname,
      });

      if (res?.data?.reply) {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: res.data.reply,
            actions: res.data.actions || [],
          },
        ]);

        if (res.data.suggestions?.length) {
          setSuggestions(res.data.suggestions);
        }
      } else {
        throw new Error('Empty response from AI service');
      }
    } catch {
      setLastFailedQuery(query);
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: '⚠️ Unable to connect to CareerPulse AI right now. Please check your connection and click Retry below.',
          isError: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([{ role: 'ai', text: getInitialGreeting() }]);
    setInput('');
    setLastFailedQuery(null);
  };

  const handleActionClick = (path: string) => {
    if (typeof path === 'string' && path.startsWith('/') && ALLOWED_NAV_PATHS.includes(path)) {
      navigate(path);
    }
  };

  // Safe renderer for assistant text with support for bold, italics, headers, bullet points, and internal links
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-gray-900 text-sm mt-1 mb-0.5">
                {renderInlineStyles(trimmed.slice(4))}
              </h4>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1 text-xs sm:text-sm">
                <span className="text-violet-600 mt-1 text-[10px]">•</span>
                <span className="flex-1">{renderInlineStyles(trimmed.slice(2))}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1 text-xs sm:text-sm">
                <span className="text-violet-600 font-semibold text-xs mt-0.5">{numMatch[1]}.</span>
                <span className="flex-1">{renderInlineStyles(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs sm:text-sm">
              {renderInlineStyles(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for inline bolding, italics, and Markdown links: [Label](/route)
  const renderInlineStyles = (text: string) => {
    // Regex matches [Label](/path), **bold**, or *italic*
    const parts = text.split(/(\[[^\]]+\]\(\/[^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={i} className="text-gray-700 italic">
            {part.slice(1, -1)}
          </em>
        );
      }

      const linkMatch = part.match(/^\[([^\]]+)\]\((\/[^)]+)\)$/);
      if (linkMatch) {
        const linkLabel = linkMatch[1];
        const linkPath = linkMatch[2];
        if (ALLOWED_NAV_PATHS.includes(linkPath)) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleActionClick(linkPath)}
              className="inline-flex items-center text-violet-700 font-medium underline underline-offset-2 hover:text-violet-900 hover:bg-violet-50 px-1 py-0.5 rounded transition-colors text-left cursor-pointer"
            >
              {linkLabel} ↗
            </button>
          );
        }
        return <span key={i} className="font-medium text-violet-700">{linkLabel}</span>;
      }

      return part;
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={onToggle}
        className="ai-float-btn flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-1 transition-all font-semibold text-sm animate-pulse-glow"
        style={{ fontFamily: 'Outfit' }}
        aria-label="Open CareerPulse AI Assistant"
      >
        <span className="text-lg">✨</span> Ask CareerPulse AI
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="CareerPulse AI Assistant"
          className="fixed bottom-24 right-4 sm:right-6 z-[999] w-[390px] max-w-[calc(100vw-24px)] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ height: '540px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-sm shadow-xs">
                ✨
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: 'Outfit' }}>
                  CareerPulse AI
                </p>
                <p className="text-violet-100 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {studentFirstName ? `Mentoring ${studentFirstName}` : 'Career Mentor & Guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleNewConversation}
                title="Start new conversation"
                className="p-1.5 hover:bg-white/10 rounded-lg text-violet-100 hover:text-white transition-colors"
                aria-label="Start new conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-white/10 rounded-lg text-violet-100 hover:text-white transition-colors"
                aria-label="Close CareerPulse AI"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          <div className="bg-violet-50/70 border-b border-violet-100/80 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-violet-800">
            <span className="truncate">
              Target: <strong>{profile?.targetRoleId ? profile.targetRoleId.replace('role_', '').replace(/_/g, ' ') : 'General Mentor'}</strong>
            </span>
            <span className="text-violet-500 font-mono text-[10px]">{location.pathname}</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0 shadow-xs">
                      ✨
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-sm'
                        : msg.isError
                        ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-sm'
                        : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}

                    {/* Retry button on error */}
                    {msg.isError && lastFailedQuery && (
                      <button
                        onClick={handleRetry}
                        className="mt-2 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        🔄 Retry
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Navigation Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                    {msg.actions
                      .filter((act) => ALLOWED_NAV_PATHS.includes(act.path))
                      .map((act) => (
                        <button
                          key={act.path}
                          onClick={() => handleActionClick(act.path)}
                          className="text-xs font-medium text-violet-700 bg-white border border-violet-200 hover:bg-violet-50 hover:border-violet-300 px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 group cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <span className="text-violet-400 group-hover:translate-x-0.5 transition-transform">→</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">
                  ✨
                </div>
                <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-xs flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">CareerPulse AI is thinking</span>
                  <div className="flex gap-1 ml-1">
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Contextual Suggestion Chips */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white border-t border-gray-100 flex-shrink-0">
            {suggestions.map((s) => (
              <button
                key={s}
                disabled={typing}
                onClick={() => handleSend(s)}
                className="flex-shrink-0 text-xs text-violet-700 border border-violet-200 bg-violet-50/80 px-3 py-1.5 rounded-full hover:bg-violet-100 hover:border-violet-300 transition-colors whitespace-nowrap font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="border-t border-gray-200 bg-white p-3 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              disabled={typing}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={typing ? 'CareerPulse AI is typing...' : 'Ask about your skills, roadmap, or the website...'}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors disabled:opacity-60"
            />
            <button
              onClick={() => handleSend()}
              disabled={typing || !input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white hover:shadow-md hover:shadow-violet-200 transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
