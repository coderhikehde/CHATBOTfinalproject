import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Copy, Check, Plus, Sparkles } from 'lucide-react';
import { sendMessage, getChatHistory } from '../lib/api';
import VoiceButton from './VoiceButton';

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1em;font-weight:bold;margin:8px 0">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.2em;font-weight:bold;margin:8px 0">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.3em;font-weight:bold;margin:8px 0">$1</h1>')
    .replace(/^\* (.+)$/gm, '<li style="margin-left:16px;list-style:disc">$1</li>')
    .replace(/`(.+?)`/g, '<code style="background:#1e1e2e;padding:2px 6px;border-radius:4px;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br/>');
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 p-1 rounded text-gray-500 hover:text-white"
      title="Copy response"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

function WelcomeScreen({ username }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 pb-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center"
      >
        <Sparkles className="text-blue-400" size={28} />
      </motion.div>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-white">Welcome back, {username}!</h2>
        <p className="text-gray-400 mt-2 text-sm">Ask me anything — I speak 100+ languages.</p>
      </motion.div>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-2 mt-4 w-full max-w-sm"
      >
        {["Explain quantum computing", "Write a poem in Hindi", "Debug my Python code", "Tell me a fun fact"].map(s => (
          <div key={s} className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-xl px-3 py-2 cursor-default hover:bg-white/10 transition">
            {s}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const ChatView = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef(null);
  const MAX_CHARS = 1000;

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      setLoadingHistory(true);
      try {
        const history = await getChatHistory(username);
        if (Array.isArray(history) && history.length > 0) {
          const loaded = [];
          history.forEach(h => {
            loaded.push({ text: h.message, sender: 'user', time: h.created_at });
            loaded.push({ text: h.response, sender: 'bot', time: h.created_at });
          });
          setMessages(loaded);
        }
      } catch (e) { /* silent */ }
      setLoadingHistory(false);
    }
    loadHistory();
  }, [username]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const buildHistory = (msgs) =>
    msgs.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || input.length > MAX_CHARS) return;

    const now = new Date().toISOString();
    const userMsg = { text: input, sender: 'user', time: now };
    const history = buildHistory(messages);
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiReply = await sendMessage(username, input, history);
      setMessages(prev => [...prev, { text: aiReply, sender: 'bot', time: new Date().toISOString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Connection error. Please try again.", sender: 'bot', time: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-screen bg-[#05050a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="font-bold text-white">NexusBot</h1>
          <p className="text-xs text-gray-500">Powered by LLaMA 3.3 70B</p>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/30 rounded-xl px-3 py-2 transition"
        >
          <Plus size={14} /> New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen username={username} />
        ) : (
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[72%] flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`relative group px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-[#111127] text-gray-100 rounded-tl-sm border border-white/5'
                  }`}>
                    {m.sender === 'bot'
                      ? <p dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
                      : <p>{m.text}</p>
                    }
                    {m.sender === 'bot' && <CopyButton text={m.text} />}
                  </div>
                  {m.time && (
                    <span className="text-[10px] text-gray-600 mt-1 px-1">{formatTime(m.time)}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isLoading && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-2">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask NexusBot anything..."
              maxLength={MAX_CHARS}
              className="w-full bg-[#111127] border border-white/10 rounded-2xl py-4 pl-5 pr-20 text-sm focus:outline-none focus:border-blue-500/50 transition"
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] ${
              input.length > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-gray-600'
            }`}>
              {input.length}/{MAX_CHARS}
            </span>
          </div>
          <VoiceButton onTranscript={(t) => setInput(t)} />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || isLoading}
            className="p-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition"
          >
            <Send size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
