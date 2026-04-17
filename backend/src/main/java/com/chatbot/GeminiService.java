package com.chatbot;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import java.nio.charset.StandardCharsets;

public class GeminiService {
    private String apiKey;
    private final String URL = "https://api.groq.com/openai/v1/chat/completions";
    private final Gson gson = new Gson();

    public GeminiService() {
        this.apiKey = System.getenv("GROQ_API_KEY");
        System.out.println("[GeminiService] API_KEY loaded: " + (apiKey != null ? apiKey.substring(0, Math.min(10, apiKey.length())) + "..." : "NULL"));
    }

    public String getApiKeyStatus() {
        return (apiKey != null && !apiKey.isEmpty()) ? "SET (" + apiKey.substring(0, 10) + "...)" : "MISSING";
    }

    // Overload: simple single-message call (kept for backward compatibility)
    public String getResponse(String userPrompt) {
        return getResponse(userPrompt, new JsonArray());
    }

    // Full call with conversation history for context memory
    public String getResponse(String userPrompt, JsonArray history) {
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getenv("GROQ_API_KEY");
        }
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("[GeminiService] ERROR: GROQ_API_KEY is missing!");
            return "ERROR: GROQ_API_KEY environment variable is missing.";
        }

        System.out.println("[GeminiService] Sending request to Groq for: " + userPrompt.substring(0, Math.min(50, userPrompt.length())));

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(URL);
            post.setHeader("Authorization", "Bearer " + apiKey);
            post.setHeader("Content-Type", "application/json; charset=utf-8");

            // Build messages array: system prompt + history + current user message
            JsonArray messagesArray = new JsonArray();

            JsonObject systemMsg = new JsonObject();
            systemMsg.addProperty("role", "system");
            systemMsg.addProperty("content", "You are NexusBot, a helpful and intelligent multilingual AI assistant. Respond in the same language the user writes in.");
            messagesArray.add(systemMsg);

            // Add conversation history (last 10 turns max to stay within token limits)
            int start = Math.max(0, history.size() - 10);
            for (int i = start; i < history.size(); i++) {
                messagesArray.add(history.get(i));
            }

            JsonObject messageObj = new JsonObject();
            messageObj.addProperty("role", "user");
            messageObj.addProperty("content", userPrompt);
            messagesArray.add(messageObj);

            JsonObject payload = new JsonObject();
            payload.addProperty("model", "llama-3.3-70b-versatile");
            payload.add("messages", messagesArray);

            String payloadStr = gson.toJson(payload);
            post.setEntity(new StringEntity(payloadStr, StandardCharsets.UTF_8));

            try (CloseableHttpResponse response = client.execute(post)) {
                int statusCode = response.getStatusLine().getStatusCode();
                String rawJson = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                System.out.println("[GeminiService] Groq HTTP " + statusCode + ": " + rawJson.substring(0, Math.min(200, rawJson.length())));

                JsonObject jobj = gson.fromJson(rawJson, JsonObject.class);

                if (jobj.has("choices")) {
                    String reply = jobj.getAsJsonArray("choices")
                               .get(0).getAsJsonObject()
                               .getAsJsonObject("message")
                               .get("content").getAsString();
                    System.out.println("[GeminiService] Success! Reply length: " + reply.length());
                    return reply;
                } else {
                    System.out.println("[GeminiService] ERROR - No choices in response: " + rawJson);
                    return "API_ERROR: " + rawJson;
                }
            }
        } catch (Exception e) {
            System.out.println("[GeminiService] EXCEPTION: " + e.getMessage());
            e.printStackTrace();
            return "NETWORK_ERROR: " + e.getMessage();
        }
    }
}
