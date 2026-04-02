import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

export default function ChatBubble({ message, index }) {
  const isBot = message.role === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1 glow-primary">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isBot ? "glass text-foreground rounded-tl-sm" : "bg-primary text-white rounded-tr-sm"
        }`}
      >
        {message.content}
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-secondary" />
        </div>
      )}
    </motion.div>
  );
}
