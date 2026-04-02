package com.chatbot;
import static spark.Spark.*;
import com.google.gson.Gson;

public class Main {
    private static final Gson gson = new Gson();
    private static final GeminiService gemini = new GeminiService();

    public static void main(String[] args) {
        port(8080);
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
            // We force it to be a clean 'reply' key
            return "{\"status\":\"success\", \"reply\":\"" + ans.replace("\"", "'").replace("\n", " ") + "\"}";
        });
        System.out.println(">>> FINAL SYNC LIVE ON 8080 <<<");
    }
    static class ChatRequest { String message; }
}
