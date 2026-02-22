import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles, ChevronDown } from 'lucide-react';
import geminiService from '../../services/geminiService';

/**
 * CommitArena AI Mentor Sidebar
 * Professional right sidebar for real-time AI assistance
 * Integrated design with the platform theme
 */
export default function AIAssistantChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hey there! 👋 I\'m CommitArena Mentor, your personal AI coding guide. Ask me anything about problems, concepts, or coding tips!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.generateContent(input);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response || 'I encountered an issue. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      // Check if it's a quota error
      const isQuotaError = error?.status === "RESOURCE_EXHAUSTED" || 
                          error?.message?.includes("quota") ||
                          error?.message?.includes("429");

      let errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: isQuotaError 
          ? "API quota reached for today. Try again later or contact support." 
          : 'Connection issue. Please check and try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-yellow-50 border-l border-yellow-200 rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-100/60 to-yellow-50/40 border-b border-yellow-200 px-4 py-3 flex items-center justify-between\">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">CommitArena Mentor</h3>
            <p className="text-xs text-blue-600">AI Learning Assistant</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-600 hover:text-slate-700 transition p-1"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronDown size={18} className={`transition-transform ${!isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-yellow-200 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300 rounded-br-none'
                      : 'bg-white text-slate-800 border border-yellow-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm border border-yellow-200 rounded-bl-none">
                  <Loader size={14} className="animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-yellow-200 p-3 space-y-2 bg-yellow-50">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask for help..."
                disabled={loading}
                className="flex-1 bg-white text-slate-800 border border-yellow-200 rounded-lg px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none disabled:opacity-50 transition"
                rows="3"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg px-3 py-2 font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-blue-600/20"
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-600 text-center">Press Enter to send</p>
          </div>
        </>
      )}
    </div>
  );
}

