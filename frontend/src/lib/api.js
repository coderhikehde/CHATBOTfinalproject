const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

export async function sendMessage(userId, message, history = []) {
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message, history }),
    });
    const data = await res.json();
    return data.reply || "AI returned empty response";
  } catch (err) {
    return "Connection Error – is the backend running?";
  }
}

export async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  } catch (err) {
    return { status: "error", message: "Backend unreachable" };
  }
}

export async function registerUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  } catch (err) {
    return { status: "error", message: "Backend unreachable" };
  }
}

export async function getChatHistory(username) {
  try {
    const res = await fetch(`${API_BASE}/api/history?username=${encodeURIComponent(username)}`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function getDashboard(username) {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard?username=${encodeURIComponent(username)}`);
    return await res.json();
  } catch (err) {
    return { totalQueries: 0, lastActive: "N/A" };
  }
}
