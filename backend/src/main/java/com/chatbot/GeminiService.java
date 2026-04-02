package com.chatbot;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

public class GeminiService {
    private final String API_KEY;
    private final String URL;
    private final Gson gson = new Gson();

    public GeminiService() {
        String key = System.getenv("GEMINI_API_KEY");
        if (key == null) key = "AIzaSyDGzXXGqUzCPZMMu5vzjGHF86X6D9akPRA";
        this.API_KEY = key;
        this.URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;
    }

    public String getResponse(String userPrompt) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost post = new HttpPost(URL);
            post.setHeader("Content-Type", "application/json");
            String safePrompt = userPrompt.replace("\"", "'").replace("\n", " ");
            String jsonBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \"" + safePrompt + "\" }] }] }";
            post.setEntity(new StringEntity(jsonBody));
            try (CloseableHttpResponse response = client.execute(post)) {
                String rawJson = EntityUtils.toString(response.getEntity());
                System.out.println("GEMINI_RAW_RESPONSE: " + rawJson);
                JsonObject jobj = gson.fromJson(rawJson, JsonObject.class);
                if (jobj.has("candidates")) {
                    return jobj.getAsJsonArray("candidates")
                               .get(0).getAsJsonObject()
                               .getAsJsonObject("content")
                               .getAsJsonArray("parts")
                               .get(0).getAsJsonObject()
                               .get("text").getAsString();
                } else {
                    return "API_LIMIT_OR_KEY_ERROR: Check terminal logs.";
                }
            }
        } catch (Exception e) {
            return "NETWORK_ERROR: " + e.getMessage();
        }
    }
}
