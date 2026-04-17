package com.chatbot;

import static spark.Spark.*;
import com.chatbot.config.DatabaseConfig;
import com.chatbot.services.AuthService;
import com.chatbot.services.ChatService;
import com.chatbot.models.User;
import com.chatbot.GeminiService;
import com.google.gson.Gson;
import com.google.gson.JsonArray;

public class Main {
    private static final Gson gson = new Gson();
    private static final GeminiService gemini = new GeminiService();

    public static void main(String[] args) {
        String portStr = System.getenv("PORT");
        int port = (portStr != null) ? Integer.parseInt(portStr) : 8080;
        port(port);

        // Initialize DB tables on startup (safe — uses CREATE TABLE IF NOT EXISTS)
        DatabaseConfig.initializeDatabase();

        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
            res.type("application/json");
        });

        options("/*", (req, res) -> "OK");

        get("/test", (req, res) -> "{\"status\":\"success\", \"message\":\"NexusBot is alive\"}");

        get("/debug", (req, res) -> {
            String keyStatus = gemini.getApiKeyStatus();
            return "{\"groq_key\":\"" + keyStatus + "\", \"status\":\"running\"}";
        });

        get("/api/db-status", (req, res) -> {
            String supabaseUrl = System.getenv("SUPABASE_URL");
            String supabaseKey = System.getenv("SUPABASE_ANON_KEY");
            String dbUrl = System.getenv("DB_URL");
            return gson.toJson(java.util.Map.of(
                "SUPABASE_URL",     supabaseUrl  != null ? "✅ SET" : "❌ MISSING",
                "SUPABASE_ANON_KEY", supabaseKey != null ? "✅ SET" : "❌ MISSING",
                "DB_URL",           dbUrl        != null ? "✅ SET" : "❌ MISSING",
                "GROQ_API_KEY",     gemini.getApiKeyStatus()
            ));
        });

        post("/register", (req, res) -> {
            try {
                AuthRequest ar = gson.fromJson(req.body(), AuthRequest.class);
                if (ar.username == null || ar.password == null || ar.username.isEmpty() || ar.password.isEmpty()) {
                    res.status(400);
                    return "{\"status\":\"error\", \"message\":\"Username and password are required\"}";
                }
                String email = ar.username + "@nexusbot.local";
                User user = AuthService.register(email, ar.username, ar.password);
                if (user != null) {
                    return gson.toJson(java.util.Map.of("status", "success", "username", user.getUsername()));
                } else {
                    res.status(409);
                    return "{\"status\":\"error\", \"message\":\"User already exists\"}";
                }
            } catch (Exception e) {
                System.out.println("[Main] Register error: " + e.getMessage());
                res.status(500);
                return "{\"status\":\"error\", \"message\":\"" + e.getMessage().replace("\"", "'") + "\"}";
            }
        });

        post("/login", (req, res) -> {
            try {
                AuthRequest ar = gson.fromJson(req.body(), AuthRequest.class);
                if (ar.username == null || ar.password == null) {
                    res.status(400);
                    return "{\"status\":\"error\", \"message\":\"Username and password are required\"}";
                }
                String email = ar.username + "@nexusbot.local";
                User user = AuthService.login(email, ar.password);
                if (user != null) {
                    return gson.toJson(java.util.Map.of("status", "success", "username", user.getUsername()));
                } else {
                    res.status(401);
                    return "{\"status\":\"error\", \"message\":\"Invalid username or password\"}";
                }
            } catch (Exception e) {
                System.out.println("[Main] Login error: " + e.getMessage());
                res.status(500);
                return "{\"status\":\"error\", \"message\":\"" + e.getMessage().replace("\"", "'") + "\"}";
            }
        });

        get("/api/dashboard", (req, res) -> {
            try {
                String username = req.queryParams("username");
                long totalQueries = ChatService.getTotalQueries(username);
                String lastActive = ChatService.getLastActive(username);
                return gson.toJson(java.util.Map.of(
                    "totalQueries", totalQueries,
                    "lastActive", lastActive != null ? lastActive : "N/A",
                    "model", "LLaMA 3.3 70B",
                    "status", "Online"
                ));
            } catch (Exception e) {
                return gson.toJson(java.util.Map.of("totalQueries", 0, "lastActive", "N/A", "model", "LLaMA 3.3 70B", "status", "Online"));
            }
        });

        post("/api/chat", (req, res) -> {
            try {
                System.out.println("[Main] Received chat request: " + req.body());
                ChatRequest cr = gson.fromJson(req.body(), ChatRequest.class);
                JsonArray history = (cr.history != null) ? cr.history : new JsonArray();
                String ans = gemini.getResponse(cr.message, history);
                try {
                    ChatService.saveChat(cr.userId, cr.message, ans);
                } catch (Exception saveErr) {
                    System.out.println("[Main] Chat save failed (non-blocking): " + saveErr.getMessage());
                }
                return gson.toJson(java.util.Map.of("status", "success", "reply", ans));
            } catch (Exception e) {
                System.out.println("[Main] Chat endpoint error: " + e.getMessage());
                res.status(500);
                return "{\"error\":\"" + e.getMessage() + "\"}";
            }
        });

        awaitInitialization();
        System.out.println(">>> NEXUSBOT LIVE ON " + port + " <<<");
    }

    static class ChatRequest {
        String message;
        String userId;
        JsonArray history;
    }

    static class AuthRequest {
        String username;
        String password;
    }
}
