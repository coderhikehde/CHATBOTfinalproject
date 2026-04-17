package com.chatbot.services;

import com.chatbot.config.ConfigLoader;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class ChatService {

    // Resolve username → UUID from Supabase users table
    private static String resolveUserUUID(CloseableHttpClient client, String username) {
        try {
            String url = ConfigLoader.getSupabaseUrl()
                + "/rest/v1/users?select=id&username=eq." + java.net.URLEncoder.encode(username, StandardCharsets.UTF_8) + "&limit=1";
            HttpGet get = new HttpGet(url);
            get.setHeader("apikey", ConfigLoader.getSupabaseAnonKey());
            get.setHeader("Authorization", "Bearer " + ConfigLoader.getSupabaseAnonKey());
            try (CloseableHttpResponse res = client.execute(get)) {
                String raw = EntityUtils.toString(res.getEntity());
                JsonArray arr = new Gson().fromJson(raw, JsonArray.class);
                if (arr != null && arr.size() > 0) {
                    return arr.get(0).getAsJsonObject().get("id").getAsString();
                }
            }
        } catch (Exception e) {
            System.err.println("[ChatService] UUID lookup failed: " + e.getMessage());
        }
        return null;
    }

    public static void saveChat(String username, String message, String response) {
        // Validate env vars before attempting save
        String supabaseUrl = ConfigLoader.getSupabaseUrl();
        String supabaseKey = ConfigLoader.getSupabaseAnonKey();
        if (supabaseUrl == null || supabaseUrl.isEmpty() || supabaseKey == null || supabaseKey.isEmpty()) {
            System.err.println("[ChatService] SUPABASE_URL or SUPABASE_ANON_KEY is not set — skipping save.");
            return;
        }

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String url = supabaseUrl + "/rest/v1/chats";
            HttpPost post = new HttpPost(url);
            post.setHeader("apikey", supabaseKey);
            post.setHeader("Authorization", "Bearer " + supabaseKey);
            post.setHeader("Content-Type", "application/json");
            post.setHeader("Prefer", "return=minimal");

            JsonObject body = new JsonObject();
            body.addProperty("message", message);
            body.addProperty("response", response);

            // Resolve and include user_id if possible
            String userUUID = resolveUserUUID(client, username);
            if (userUUID != null) {
                body.addProperty("user_id", userUUID);
            } else {
                System.out.println("[ChatService] Could not resolve UUID for username: " + username + " — saving without user_id");
            }

            post.setEntity(new StringEntity(new Gson().toJson(body), StandardCharsets.UTF_8));

            try (CloseableHttpResponse res = client.execute(post)) {
                int status = res.getStatusLine().getStatusCode();
                String raw = EntityUtils.toString(res.getEntity());
                if (status == 201 || status == 200) {
                    System.out.println("[ChatService] ✅ Chat saved to Supabase (HTTP " + status + ")");
                } else {
                    System.err.println("[ChatService] ❌ Save failed (HTTP " + status + "): " + raw);
                }
            }
        } catch (Exception e) {
            System.err.println("[ChatService] Chat save error: " + e.getMessage());
        }
    }

    public static long getTotalQueries(String username) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String url = ConfigLoader.getSupabaseUrl() + "/rest/v1/chats?select=id&order=created_at.desc";
            HttpGet get = new HttpGet(url);
            get.setHeader("apikey", ConfigLoader.getSupabaseAnonKey());
            get.setHeader("Authorization", "Bearer " + ConfigLoader.getSupabaseAnonKey());
            get.setHeader("Prefer", "count=exact");
            try (CloseableHttpResponse res = client.execute(get)) {
                String raw = EntityUtils.toString(res.getEntity());
                JsonArray arr = new Gson().fromJson(raw, JsonArray.class);
                return arr != null ? arr.size() : 0;
            }
        } catch (Exception e) {
            System.err.println("getTotalQueries error: " + e.getMessage());
            return 0;
        }
    }

    public static String getLastActive(String username) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String url = ConfigLoader.getSupabaseUrl() + "/rest/v1/chats?select=created_at&order=created_at.desc&limit=1";
            HttpGet get = new HttpGet(url);
            get.setHeader("apikey", ConfigLoader.getSupabaseAnonKey());
            get.setHeader("Authorization", "Bearer " + ConfigLoader.getSupabaseAnonKey());
            try (CloseableHttpResponse res = client.execute(get)) {
                String raw = EntityUtils.toString(res.getEntity());
                JsonArray arr = new Gson().fromJson(raw, JsonArray.class);
                if (arr != null && arr.size() > 0) {
                    String ts = arr.get(0).getAsJsonObject().get("created_at").getAsString();
                    return ts.substring(0, 16).replace("T", " ");
                }
            }
        } catch (Exception e) {
            System.err.println("getLastActive error: " + e.getMessage());
        }
        return "N/A";
    }
}
