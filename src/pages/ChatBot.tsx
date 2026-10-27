import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { getAssistantResponse } from '../services/aiAssistantService';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
  relatedSchemeId?: string;
  links?: { title: string; url: string }[];
  timestamp: string;
}

function ChatBot() {
  const { t, language } = useTranslation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialBotGreeting = 
    language === 'hi' 
      ? 'नमस्ते! मैं साथी (Saathi) सरकारी सेवा सहायक हूँ। आप मुझसे केंद्र या राज्य सरकार की किसी भी योजना, पात्रता, या आवश्यक दस्तावेज़ के बारे में हिंदी, मलयालम या अंग्रेजी में पूछ सकते हैं।'
      : language === 'ml'
      ? 'നമസ്കാരം! ഞാൻ സാഥി (Saathi) സർക്കാർ സേവന സഹായിയാണ്. കേന്ദ്ര-സംസ്ഥാന സർക്കാരുകളുടെ ക്ഷേമപദ്ധതികൾ, സ്കോളർഷിപ്പുകൾ, കർഷക ആനുകൂല്യങ്ങൾ, ആവശ്യമായ രേഖകൾ എന്നിവയെക്കുറിച്ച് നിങ്ങൾക്ക് എന്നോട് മലയാളത്തിലോ ഇംഗ്ലീഷിലോ ചോദിക്കാം.'
      : 'Hello! I am Saathi, your Indian Government Services & Schemes Assistant. You can ask me in English, മലയാളം, or हिन्दी about welfare schemes, eligibility rules, and required documents.';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      from: 'bot',
      text: initialBotGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (userText: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Realistic responsive timing based on assistant rule lookup
    setTimeout(() => {
      const reply = getAssistantResponse(textToSend, language as 'en' | 'ml' | 'hi');
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        from: 'bot',
        text: reply.text,
        relatedSchemeId: reply.relatedSchemeId,
        links: reply.links,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 280);
  };

  const sampleQuestions = [
    'Do you speak Malayalam?',
    'കേരളത്തിലെ വിദ്യാർത്ഥികൾക്ക് സ്കോളർഷിപ്പുകൾ ഏതൊക്കെയാണ്?',
    'What documents are needed for Jan Dhan?',
    'नमस्ते',
    'എനിക്ക് കർഷക പദ്ധതികൾ അറിയണം',
    'आयुष्मान भारत के लिए पात्रता क्या है?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      {/* Assistant Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
            <Bot className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{t('aiAssistant') || 'Saathi AI Assistant'}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/30">
                Verified Local Knowledge Base
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Multilingual guidance in English, മലയാളം, & हिन्दी. Fully rule-based, no paid API required.
            </p>
          </div>
        </div>

        <Link
          to="/schemes"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Catalog of Schemes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[520px]">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isUser = m.from === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-accent text-slate-950 shadow-xs'
                      : 'bg-primary text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-accent" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-primary text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    {m.text}

                    {/* Related Scheme action button */}
                    {m.relatedSchemeId && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          to={`/schemes/${m.relatedSchemeId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold"
                        >
                          <span>View Full Scheme Page</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    {/* External Link buttons */}
                    {m.links && m.links.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {m.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target={link.url.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            <span>{link.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-2xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-150" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts pills */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent" />
            Try:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question in English, മലയാളം, or हिन्दी..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-primary bg-slate-50 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-accent text-slate-950 font-bold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Information Verification Disclaimer */}
      <div className="flex items-center gap-2 text-xs text-slate-500 justify-center text-center px-4">
        <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
        <span>
          Information compiled from official government portals. Always verify deadlines and requirements on department websites.
        </span>
      </div>
    </div>
  );
}

export default ChatBot;
