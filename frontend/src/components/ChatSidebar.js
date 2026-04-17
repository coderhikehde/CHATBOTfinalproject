import { motion } from "framer-motion";
import { MessageSquare, BarChart3, LogOut, Sparkles } from "lucide-react";

export default function ChatSidebar({ username, activeView, onViewChange, onLogout }) {
  const navItems = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  ];

  const avatarLetter = username ? username[0].toUpperCase() : "?";

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-64 h-screen glass-strong flex flex-col border-r border-border/30"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
            <Sparkles size={16} className="text-blue-400" />
          </div>
          <div>
            <span className="font-bold text-base text-white">NexusBot</span>
            <p className="text-[10px] text-gray-500 leading-none">AI Language Agnostic</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              activeView === item.id
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={18} />
            {item.label}
            {activeView === item.id && (
              <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </motion.button>
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="p-4 border-t border-border/30 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{username}</p>
            <p className="text-[10px] text-gray-500">Online</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition text-sm"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
