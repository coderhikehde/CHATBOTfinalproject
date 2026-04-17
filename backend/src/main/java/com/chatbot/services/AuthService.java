package com.chatbot.services;

import com.chatbot.config.ConfigLoader;
import com.chatbot.models.User;
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
import org.mindrot.jbcrypt.BCrypt;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

public class AuthService {

    private static final Gson gson = new Gson();

    private static String supabaseUrl() { return ConfigLoader.getSupabaseUrl(); }
    private static String supabaseKey() { return ConfigLoader.getSupabaseAnonKey(); }

    private static void setHeaders(HttpGet req) {
        req.setHeader("apikey", supabaseKey());
        req.setHeader("Authorization", "Bearer " + supabaseKey());
        req.setHeader("Content-Type", "application/json");
    }

    private static void setHeaders(HttpPost req) {
        req.setHeader("apikey", supabaseKey());
        req.setHeader("Authorization", "Bearer " + supabaseKey());
        req.setHeader("Content-Type", "application/json");
        req.setHeader("Prefer", "return=representation");
    }

    public static User register(String email, String username, String password) throws Exception {
        try (CloseableHttpClient client = HttpClients.createDefault()) {

            // 1. Check if username already exists
            HttpGet checkUser = new HttpGet(
                supabaseUrl() + "/rest/v1/auth_users?select=id&email=eq."
                + java.net.URLEncoder.encode(email, StandardCharsets.UTF_8) + "&limit=1"
            );
            setHeaders(checkUser);
            try (CloseableHttpResponse res = client.execute(checkUser)) {
                String raw = EntityUtils.toString(res.getEntity());
                JsonArray arr = gson.fromJson(raw, JsonArray.class);
                if (arr != null && arr.size() > 0) {
                    throw new Exception("User already exists");
                }
            }

            // 2. Hash password and insert into auth_users
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

            HttpPost postAuth = new HttpPost(supabaseUrl() + "/rest/v1/auth_users");
            setHeaders(postAuth);
            JsonObject authBody = new JsonObject();
            authBody.addProperty("email", email);
            authBody.addProperty("password_hash", hashedPassword);
            postAuth.setEntity(new StringEntity(gson.toJson(authBody), StandardCharsets.UTF_8));

            String newUserId = null;
            try (CloseableHttpResponse res = client.execute(postAuth)) {
                String raw = EntityUtils.toString(res.getEntity());
                int status = res.getStatusLine().getStatusCode();
                System.out.println("[AuthService] auth_users insert HTTP " + status + ": " + raw);
                if (status != 200 && status != 201) {
                    throw new Exception("Failed to create auth record: " + raw);
                }
                JsonArray arr = gson.fromJson(raw, JsonArray.class);
                if (arr != null && arr.size() > 0) {
                    newUserId = arr.get(0).getAsJsonObject().get("id").getAsString();
                }
            }

            if (newUserId == null) {
                throw new Exception("No ID returned from auth_users insert");
            }

            // 3. Insert into users table
            HttpPost postUser = new HttpPost(supabaseUrl() + "/rest/v1/users");
            setHeaders(postUser);
            JsonObject userBody = new JsonObject();
            userBody.addProperty("id", newUserId);
            userBody.addProperty("email", email);
            userBody.addProperty("username", username);
            postUser.setEntity(new StringEntity(gson.toJson(userBody), StandardCharsets.UTF_8));

            try (CloseableHttpResponse res = client.execute(postUser)) {
                int status = res.getStatusLine().getStatusCode();
                String raw = EntityUtils.toString(res.getEntity());
                System.out.println("[AuthService] users insert HTTP " + status + ": " + raw);
                if (status != 200 && status != 201) {
                    throw new Exception("Failed to create user record: " + raw);
                }
            }

            return new User(UUID.fromString(newUserId), email, username, null);
        }
    }

    public static User login(String email, String password) throws Exception {
        try (CloseableHttpClient client = HttpClients.createDefault()) {

            // 1. Fetch auth record by email
            HttpGet getAuth = new HttpGet(
                supabaseUrl() + "/rest/v1/auth_users?select=id,email,password_hash&email=eq."
                + java.net.URLEncoder.encode(email, StandardCharsets.UTF_8) + "&limit=1"
            );
            setHeaders(getAuth);

            String userId = null;
            String storedHash = null;
            try (CloseableHttpResponse res = client.execute(getAuth)) {
                String raw = EntityUtils.toString(res.getEntity());
                JsonArray arr = gson.fromJson(raw, JsonArray.class);
                if (arr == null || arr.size() == 0) {
                    return null; // User not found
                }
                JsonObject record = arr.get(0).getAsJsonObject();
                userId = record.get("id").getAsString();
                storedHash = record.get("password_hash").getAsString();
            }

            // 2. Verify password
            if (!BCrypt.checkpw(password, storedHash)) {
                return null; // Wrong password
            }

            // 3. Fetch username from users table
            HttpGet getUser = new HttpGet(
                supabaseUrl() + "/rest/v1/users?select=username&id=eq." + userId + "&limit=1"
            );
            setHeaders(getUser);

            String username = null;
            try (CloseableHttpResponse res = client.execute(getUser)) {
                String raw = EntityUtils.toString(res.getEntity());
                JsonArray arr = gson.fromJson(raw, JsonArray.class);
                if (arr != null && arr.size() > 0) {
                    username = arr.get(0).getAsJsonObject().get("username").getAsString();
                }
            }

            return new User(UUID.fromString(userId), email, username, null);
        }
    }
}
