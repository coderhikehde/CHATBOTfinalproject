package com.chatbot;
import static spark.Spark.*;
import com.chatbot.config.DatabaseConfig;
import com.chatbot.services.ChatService;
import com.google.gson.Gson;
import java.util.UUID;

public class Main {
    private static final Gson gson = new Gson();
    private static final GeminiService gemini = new GeminiService();

    public static void main(String[] args) {
        String portStr = System.getenv("PORT");
        int port = (portStr != null) ? Integer.parseInt(portStr) : 8080;
        port(port);

        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
            res.type("application/json");
        });
        options("/*", (req, res) -> "OK");

        post("/api/chat", (req, res) -> {
            ChatRequest cr = gson.fromJson(req.body(), ChatRequest.class);
            String ans = gemini.getResponse(cr.message);

            // Save to Supabase
            try {
                UUID userId = cr.userId != null ? UUID.fromString(cr.userId) : UUID.fromString("00000000-0000-0000-0000-000000000001");
                ChatService.saveChat(userId, cr.message, ans);
            } catch (Exception e) {
                System.err.println("Chat save error: " + e.getMessage());
            }

            return "{\"status\":\"success\", \"reply\":\"" + ans.replace("\"", "'").replace("\n", " ") + "\"}";
        });

        System.out.println(">>> NEXUSBOT LIVE ON " + port + " <<<");
    }

    static class ChatRequest {
        String message;
        String userId;
    }
}
