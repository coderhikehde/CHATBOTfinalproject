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
    private final String API_KEY = System.getenv("GROQ_API_KEY");
    private final String URL = "https://api.groq.com/openai/v1/chat/completions";
    private final Gson gson = new Gson();

    public String getResponse(String userPrompt) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(URL);
            post.setHeader("Authorization", "Bearer " + API_KEY);
            post.setHeader("Content-Type", "application/json; charset=utf-8");

            JsonObject messageObj = new JsonObject();
            messageObj.addProperty("role", "user");
            messageObj.addProperty("content", userPrompt);

            JsonArray messagesArray = new JsonArray();
            messagesArray.add(messageObj);

            JsonObject payload = new JsonObject();
            payload.addProperty("model", "llama-3.3-70b-versatile");
            payload.add("messages", messagesArray);

            StringEntity entity = new StringEntity(gson.toJson(payload), StandardCharsets.UTF_8);
            post.setEntity(entity);

            try (CloseableHttpResponse response = client.execute(post)) {
                String rawJson = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                JsonObject jobj = gson.fromJson(rawJson, JsonObject.class);
                if (jobj.has("choices")) {
                    return jobj.getAsJsonArray("choices")
                               .get(0).getAsJsonObject()
                               .getAsJsonObject("message")
                               .get("content").getAsString();
                } else {
                    return "API_ERROR: Check logs.";
                }
            }
        } catch (Exception e) {
            return "NETWORK_ERROR: " + e.getMessage();
        }
    }
}
