import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Loader2, Zap, User, Lock } from "lucide-react";
import FloatingOrb from "./FloatingOrb";
import ParticleField from "./ParticleField";
import { loginUser, registerUser } from "../lib/api";

export default function LoginScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const authFunction = isRegister ? registerUser : loginUser;
      const res = await authFunction(username, password);
      
      if (res.status === "success" || res.status === "ok") {
        onLogin(username);
      } else {
        setError(res.message || "Authentication failed");
      }
    } catch (err) {
      setError("Backend unreachable. Ensure Java server is on port 8080");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden gradient-mesh">
      <ParticleField />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-strong rounded-[2rem] p-10 space-y-8 shadow-2xl">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <FloatingOrb size="w-28 h-28" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-white text-glow">NexusBot</h1>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                {isRegister ? "Join the Network" : "Identity Verification"}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-400 text-xs text-center font-mono"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg glow-primary flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isRegister ? <UserPlus size={20} /> : <LogIn size={20} />)}
              {isRegister ? "CREATE ACCOUNT" : "AUTHENTICATE"}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="text-center pt-4">
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              {isRegister ? "Already have an account? Sign In" : "New to the system? Register"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
