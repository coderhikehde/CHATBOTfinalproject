const API_BASE = "https://chatbotfinalproject-production.up.railway.app/api";

export async function sendMessage(username, message) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, message }),
    });
    const data = await res.json();
    return data.reply || "AI returned empty response";
  } catch (err) { return "Connection Error"; }
}

export async function loginUser(u, p) { return { status: "success" }; }
export async function registerUser(u, p) { return { status: "success" }; }
export async function getDashboard(u) { return { totalQueries: 0 }; }
