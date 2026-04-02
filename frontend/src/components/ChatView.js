import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../lib/api';
import VoiceButton from './VoiceButton';

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
}

const ChatView = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiReply = await sendMessage(username, input);
      setMessages(prev => [...prev, { text: aiReply, sender: 'bot' }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Connection Error", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoice = (transcript) => {
    setInput(transcript);
  };

  return (
    <div className="flex flex-col h-screen bg-[#05050a] text-white p-6">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-xl ${m.sender === 'user' ? 'bg-blue-600' : 'bg-gray-800'}`}>
              {m.sender === 'bot'
                ? <p className="text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
                : <p className="text-sm">{m.text}</p>
              }
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gray-500 text-xs animate-pulse">Thinking...</div>}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSend} className="relative flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask NexusBot..." className="w-full bg-[#11111b] border border-gray-800 rounded-xl py-4 px-6 focus:outline-none" />
        <VoiceButton onTranscript={handleVoice} />
        <button type="submit" className="absolute right-16 top-1/2 -translate-y-1/2 text-blue-500 font-bold">SEND</button>
      </form>
    </div>
  );
};
export default ChatView;
