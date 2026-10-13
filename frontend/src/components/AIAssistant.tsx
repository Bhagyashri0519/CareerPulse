import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const suggestions = [
  "What should I learn next?",
  "Why is UI/UX a good career for me?",
  "How can I improve my Figma skills?",
  "What skills am I missing?",
  "How long to become internship-ready?",
];

const aiResponses: Record<string, string> = {
  "what should i learn next": "Based on your skill profile and UI/UX Designer career goal, your next priority is **Advanced Figma** — your current Figma level is 79% but the required level is 85%. I recommend starting the 'Advanced Figma' course (estimated 12 hours). After that, focus on **UX Research** which has the biggest gap (54% vs 80% required).",
  "why is ui/ux a good career for me": "Your assessment shows you have strong visual thinking (88% UI/UX design score), excellent communication (76%), and good problem-solving skills (72%). These are the top 3 traits that define successful UI/UX designers. Your Career Fit score of 91% is your highest match — meaning your natural strengths align perfectly with this career.",
  "how can i improve my figma skills": "Your Figma score is 79% — just 6% below the required 85% for UI/UX Designer. I recommend: 1) Complete 'Advanced Figma' course (12 hrs), 2) Practice with the **Auto Layout Mastery** module, 3) Work on the 2 assigned portfolio projects in your roadmap. At your current pace of 8 hrs/week, you'll reach 85%+ in about 3 weeks.",
  "what skills am i missing": "For your UI/UX Designer career goal, here are your key gaps: 🔴 **User Research** (54% vs 80% required) — Major Gap, 🟡 **Prototyping** (62% vs 85%) — Gap, 🟡 **Figma** (79% vs 85%) — Small Gap, 🟡 **HTML/CSS** (68% vs 75%) — Gap. Your strongest skill is already UI/UX Design at 88%. Focus on User Research first — it's the biggest gap.",
  "how long to become internship-ready": "At your current learning pace of **8 hrs/week**, here's the estimate: Month 1-2: Close Figma & HTML/CSS gaps, Month 3-4: UX Research & Prototyping, Month 5: Portfolio projects (2 real projects), Month 6: Internship prep & applications. **Total: ~4-5 months**. Your Career Readiness is currently at 72% — you need to reach ~85%+ to be strongly internship-ready.",
};

function getAIResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const [key, response] of Object.entries(aiResponses)) {
    if (lower.includes(key.split(' ')[0]) || lower.includes(key.split(' ')[1] || '')) {
      return response;
    }
  }
  return "Great question! Based on your profile — UI/UX Designer goal, 72% career readiness, and 8 hrs/week learning pace — I'd recommend focusing on closing your **User Research gap** next. It's your largest skill gap (26%) and directly impacts your career readiness score. Would you like me to suggest specific resources?";
}

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function AIAssistant({ open, onToggle }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi Kushi! 👋 I'm your CareerPulse AI. I know your skill profile, career goals, and learning gaps. Ask me anything about your career path!" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(text: string) {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'ai', text: getAIResponse(text) }]);
    }, 1200);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={onToggle}
        className="ai-float-btn flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-1 transition-all font-semibold text-sm animate-pulse-glow"
        style={{ fontFamily: 'Outfit' }}
      >
        <span className="text-lg">✨</span> Ask CareerPulse AI
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[999] w-[380px] max-w-[calc(100vw-24px)] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
          style={{ height: '520px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-sm shadow-xs">✨</div>
              <div>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Outfit' }}>CareerPulse AI</p>
                <p className="text-violet-100 text-xs">Knows your career profile</p>
              </div>
            </div>
            <button onClick={onToggle} className="p-1.5 hover:bg-white/10 rounded-lg text-violet-100 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0 shadow-xs">✨</div>
                )}
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-sm shadow-xs'
                  }`}
                >
                  {msg.text.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j} className={msg.role === 'user' ? "text-white font-bold" : "text-gray-900 font-bold"}>{part}</strong> : part
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">✨</div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-xs">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white border-t border-gray-100">
              {suggestions.slice(0, 3).map(s => (
                <button key={s} onClick={() => send(s)}
                  className="flex-shrink-0 text-xs text-violet-700 border border-violet-200 bg-violet-50 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-colors whitespace-nowrap font-medium">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Ask about your career path..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
            />
            <button
              onClick={() => send(input)}
              className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white hover:shadow-md hover:shadow-violet-200 transition-all flex-shrink-0"
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
