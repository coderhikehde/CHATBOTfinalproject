package com.chatbot.services;

import com.chatbot.config.ConfigLoader;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class ChatService {

    public static void saveChat(String userId, String message, String response) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String url = ConfigLoader.getSupabaseUrl() + "/rest/v1/chats";
            HttpPost post = new HttpPost(url);
            post.setHeader("apikey", ConfigLoader.getSupabaseAnonKey());
            post.setHeader("Authorization", "Bearer " + ConfigLoader.getSupabaseAnonKey());
            post.setHeader("Content-Type", "application/json");
            post.setHeader("Prefer", "return=minimal");

            JsonObject body = new JsonObject();
            body.addProperty("message", message);
            body.addProperty("response", response);

            post.setEntity(new StringEntity(new Gson().toJson(body), StandardCharsets.UTF_8));

            try (CloseableHttpResponse res = client.execute(post)) {
                String raw = EntityUtils.toString(res.getEntity());
                System.out.println("SUPABASE SAVE: " + res.getStatusLine().getStatusCode() + " " + raw);
            }
        } catch (Exception e) {
            System.err.println("Chat save error: " + e.getMessage());
        }
    }
}
