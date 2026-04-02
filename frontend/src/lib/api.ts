import axios from "axios";

const API_BASE = "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export interface LoginResponse {
  status: string;
  message?: string;
}

export interface ChatResponse {
  reply: string;
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const res = await api.post("/login", { username, password });
  return res.data;
}

export async function registerUser(username: string, password: string): Promise<LoginResponse> {
  const res = await api.post("/register", { username, password });
  return res.data;
}

export async function sendMessage(username: string, message: string): Promise<ChatResponse> {
  const res = await api.post("/chat", { username, message });
  return res.data;
}

export async function getChatHistory(username: string): Promise<{ history: { role: string; content: string }[] }> {
  const res = await api.get(`/history?username=${encodeURIComponent(username)}`);
  return res.data;
}

export async function getDashboard(username: string): Promise<{ totalQueries: number; lastActive: string }> {
  const res = await api.get(`/dashboard?username=${encodeURIComponent(username)}`);
  return res.data;
}
