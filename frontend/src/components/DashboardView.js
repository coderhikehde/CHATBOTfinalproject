import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock, MessageSquare, Zap } from "lucide-react";
import { getDashboard } from "../lib/api";

export default function DashboardView({ username }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard(username)
      .then(setData)
      .catch(() => setData({ totalQueries: 0, lastActive: "N/A" }));
  }, [username]);

  const stats = [
    { label: "Total Queries", value: data?.totalQueries ?? "—", icon: MessageSquare },
    { label: "Last Active", value: data?.lastActive ?? "—", icon: Clock },
    { label: "Model", value: "Gemini 2.5", icon: Zap },
    { label: "Status", value: "Online", icon: BarChart3 },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <stat.icon className="w-5 h-5 mb-2 text-primary" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs uppercase text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
