import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiUser, FiLogOut, FiMessageSquare, FiGrid, FiClock, FiShield, FiCpu, FiGlobe } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = 'http://localhost:8080/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('chat'); 
  const [history, setHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsLoggedIn(true);
      fetchHistory(parsed.id);
    }
  }, []);

  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/chats/${id}`);
      if (res.data.success) setHistory(res.data.chats);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success("Welcome to Gemini AI Space");
        fetchHistory(res.data.user.id);
      } else {
        toast.error("Invalid credentials");
      }
    } catch (e) { toast.error("Server connection failed"); }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/chat`, { message: userMsg, userId: user?.id });
      setMessages(prev => [...prev, { text: res.data.response, isUser: false }]);
      fetchHistory(user.id);
    } catch (e) { toast.error("Failed to get response"); }
    finally { setIsLoading(false); }
  };

  // --- TRENDY LOGIN PAGE ---
  if (!isLoggedIn) return (
    <div className="min-h-screen bg-[#6366f1] flex items-center justify-center p-6">
      <Toaster />
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
            <FiCpu className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Gemini AI</h2>
          <p className="text-slate-400 mt-2">B.Tech Project 2026</p>
        </div>
        
        <div className="space-y-4">
          <input 
            type="email" placeholder="Email Address" 
            onChange={e => setEmail(e.target.value)}
            className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-600" 
          />
          <input 
            type="password" placeholder="Password" 
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-600" 
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
          >
            Sign In to Dashboard
          </button>
        </div>
        <p className="text-center text-slate-400 text-xs mt-8">Bhandup Engineering Hub • v3.0 Stable</p>
      </motion.div>
    </div>
  );

  // --- TRENDY MAIN APP (CHAT + DASHBOARD) ---
  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans text-slate-900 overflow-hidden">
      <Toaster />
      
      {/* SIDEBAR */}
      <motion.div initial={{ x: -100 }} animate={{ x: 0 }} className="w-72 bg-white border-r border-slate-100 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <FiCpu className="text-white w-6 h-6" />
          </div>
          <h1 className="font-bold text-xl">Gemini Space</h1>
        </div>

        <nav className="space-y-2 mb-10">
          <NavItem icon={<FiGrid/>} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<FiMessageSquare/>} label="AI Chat" active={view === 'chat'} onClick={() => setView('chat')} />
        </nav>

        <div className="flex-1 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Chat History</p>
          {history.slice(0, 10).map((h, i) => (
            <div key={i} className="p-3 mb-1 hover:bg-slate-50 rounded-xl cursor-pointer text-xs text-slate-500 truncate border-b border-slate-50">
              {h.message}
            </div>
          ))}
        </div>

        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-6 flex items-center gap-2 p-4 text-red-400 hover:bg-red-50 rounded-2xl transition font-semibold">
          <FiLogOut /> Logout
        </button>
      </motion.div>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-20 bg-white/50 backdrop-blur-xl flex items-center justify-between px-10 border-b border-slate-100">
          <h2 className="font-bold text-slate-400 uppercase text-[11px] tracking-widest">{view} Mode</h2>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <FiUser className="text-indigo-500" />
            <span className="text-sm font-bold text-slate-600">{user?.username}</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'chat' ? (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-10 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-6 pb-24 pr-4">
                {messages.map((m, i) => (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} key={i} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl px-6 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${m.isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && <div className="text-indigo-500 font-bold animate-pulse text-xs uppercase tracking-widest">Processing...</div>}
                <div ref={messagesEndRef} />
              </div>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-2 flex items-center gap-2">
                  <button className="p-4 text-slate-300 hover:text-indigo-500 transition"><FiMic className="w-5 h-5"/></button>
                  <input 
                    value={input} onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type in any language..." 
                    className="flex-1 py-4 text-slate-600 outline-none placeholder:text-slate-300" 
                  />
                  <button onClick={sendMessage} className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="dash" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 grid grid-cols-3 gap-8">
              <StatCard icon={<FiMessageSquare/>} label="Total Queries" value={history.length} />
              <StatCard icon={<FiGlobe/>} label="Global Reach" value="Agnostic" />
              <StatCard icon={<FiShield/>} label="Engine Status" value="Healthy" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
      <div className="text-indigo-600 group-hover:text-white transition-colors">{icon}</div>
    </div>
    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">{label}</p>
    <h3 className="text-3xl font-black text-slate-800">{value}</h3>
  </div>
);

export default App;
