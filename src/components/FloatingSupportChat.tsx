import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Phone, Mail, Sparkles, CheckCircle2, UserCheck, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';

interface FloatingSupportChatProps {
  onNavigateToContact?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'support' | 'user';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    type: 'whatsapp' | 'call' | 'contact_page' | 'ai_planner';
    payload?: string;
  };
}

const FAQ_SUGGESTIONS = [
  {
    question: "What's included in Golden Triangle Tour?",
    answer: "Our Golden Triangle Tour includes private AC luxury sedan/SUV with experienced driver, 4/5-star hotel stays with breakfast, licensed tour guides at monuments, fuel, toll taxes, and all state permits. GST tax invoice is provided!"
  },
  {
    question: "Can I customize a private vehicle tour?",
    answer: "Yes, 100%! All tours by Zaara Travels are private and fully customizable. You can adjust departure times, pick-up locations (Delhi airport/hotels), and add stops like Fatehpur Sikri or Abhaneri Stepwell."
  },
  {
    question: "How do I pay & confirm my booking?",
    answer: "You can reserve with a small advance payment via UPI, Bank Transfer, or Cards. The remaining balance can be paid directly to driver or travel desk upon arrival in India."
  },
  {
    question: "Do you provide Taj Mahal sunrise tours?",
    answer: "Yes! We specialize in same-day Taj Mahal & Agra Same-Day Tours starting as early as 2:30 AM from Delhi for breathtaking Taj Mahal sunrise view without crowds."
  }
];

export const FloatingSupportChat: React.FC<FloatingSupportChatProps> = ({ onNavigateToContact }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'support',
      text: "Namaste! 🙏 Welcome to Zaara Travels Support Desk. How can I assist you with your India tour plans today?",
      timestamp: 'Just now'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendUserMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Check for matching FAQ or provide standard support reply
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matchedAnswer = "";
      
      const foundFaq = FAQ_SUGGESTIONS.find(
        (faq) => lower.includes(faq.question.toLowerCase().slice(0, 15)) || faq.question.toLowerCase().split(' ').some(word => word.length > 4 && lower.includes(word))
      );

      if (foundFaq) {
        matchedAnswer = foundFaq.answer;
      } else {
        matchedAnswer = `Thank you for asking! For custom details regarding "${text}", our team at Zaara Travels can assist you immediately on WhatsApp (+91 99339 92786) or via our direct inquiry form.`;
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'support',
        text: matchedAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: {
          label: "Connect with Zaara Travels on WhatsApp",
          type: 'whatsapp',
          payload: text
        }
      };

      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  const handleWhatsAppRedirect = (customQuery?: string) => {
    const query = customQuery || inputMessage || "I have a question regarding tours in India.";
    const text = `*Quick Inquiry from Website Chat*
*Name:* ${userName || 'Traveler'}
*Contact:* ${userPhone || 'Not provided'}
*Query:* ${query}

Hello Zaara Travels, please send me details & best price quote!`;

    const link = `https://wa.me/919933992786?text=${encodeURIComponent(text)}`;
    window.open(link, '_blank');
  };

  const handleLeadFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userPhone.trim()) return;

    const userText = `Inquiry Request from ${userName} (${userPhone})`;
    handleSendUserMessage(userText);
    setShowLeadForm(false);
    
    // Auto redirect to WhatsApp after 1 sec
    setTimeout(() => {
      handleWhatsAppRedirect(userText);
    }, 800);
  };

  return (
    <>
      {/* Floating Action Button (FAB) at Bottom-Right */}
      <div className="fixed bottom-4 right-4 sm:right-6 z-50 animate-fade-in">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white border border-amber-500/40 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 group"
            id="floating-support-chat-fab"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                💬
              </div>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
              )}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              )}
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                <span>Support Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                Support Desk Online
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Support Chat Modal / Drawer Box */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] h-[520px] animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
                  Z
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white">Zaara Travels Support</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Direct Line: <strong className="text-amber-400">Zaara Travels</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Contact Bar */}
          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] shrink-0">
            <a
              href="https://wa.me/919933992786"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 font-bold hover:underline"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp: +91 99339 92786</span>
            </a>
            <a
              href="tel:+919933992786"
              className="flex items-center gap-1 text-sky-400 font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Direct</span>
            </a>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 text-slate-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none'
                      : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Action Button if present */}
                  {msg.actionButton && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleWhatsAppRedirect(msg.actionButton?.payload)}
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-3 rounded-xl font-bold text-[11px] transition shadow"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{msg.actionButton.label}</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Quick Question Chips */}
            <div className="pt-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
                Frequently Asked Questions:
              </div>
              <div className="flex flex-col gap-1.5">
                {FAQ_SUGGESTIONS.map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendUserMessage(faq.question)}
                    className="text-left text-[11px] text-amber-300 hover:text-amber-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 px-2.5 py-1.5 rounded-xl transition flex items-center justify-between group"
                  >
                    <span>{faq.question}</span>
                    <ArrowRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Lead Form Drawer inside Chat */}
          {showLeadForm && (
            <form onSubmit={handleLeadFormSubmit} className="bg-slate-900 p-3.5 border-t border-slate-800 space-y-2 shrink-0 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Instant Call / WhatsApp Back</span>
                <button type="button" onClick={() => setShowLeadForm(false)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Your Name *"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <input
                type="tel"
                placeholder="WhatsApp / Phone Number *"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit & Open WhatsApp</span>
              </button>
            </form>
          )}

          {/* Chat Input Footer */}
          {!showLeadForm && (
            <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendUserMessage()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSendUserMessage()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl font-bold transition shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="text-amber-400 hover:underline font-bold"
                >
                  + Request Callback / Custom Quote
                </button>
                {onNavigateToContact && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateToContact();
                    }}
                    className="text-sky-400 hover:underline font-bold"
                  >
                    Open Full Contact Page &rarr;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
