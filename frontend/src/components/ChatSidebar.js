import { motion } from "framer-motion";
import { MessageSquare, BarChart3, LogOut, Sparkles } from "lucide-react";

export default function ChatSidebar({ username, activeView, onViewChange, onLogout }) {
  const navItems = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  ];

  return (
    <motion.aside
      className="w-64 h-screen glass-strong flex flex-col border-r border-border/30"
    >
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Sparkles className="text-primary" />
          <span className="font-bold text-lg text-white">NexusBot</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id ? "bg-primary/20 text-primary" : "text-gray-400"
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border/30">
        <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
