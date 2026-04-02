package com.chatbot;

import java.sql.*;
import com.chatbot.config.ConfigLoader;

public class TestConnection {
    public static void main(String[] args) {
        System.out.println("Testing Supabase connection...");
        System.out.println("URL: " + ConfigLoader.getDbUrl());
        
        try {
            Connection conn = DriverManager.getConnection(
                ConfigLoader.getDbUrl(),
                ConfigLoader.getDbUser(),
                ConfigLoader.getDbPassword()
            );
            System.out.println("✅ SUCCESS! Connected to Supabase!");
            
            // Test creating tables
            Statement stmt = conn.createStatement();
            
            String createUsers = "CREATE TABLE IF NOT EXISTS users (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, email TEXT UNIQUE NOT NULL, username TEXT UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
            String createAuthUsers = "CREATE TABLE IF NOT EXISTS auth_users (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
            String createChats = "CREATE TABLE IF NOT EXISTS chats (id SERIAL PRIMARY KEY, user_id UUID REFERENCES users(id) ON DELETE CASCADE, message TEXT NOT NULL, response TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
            
            stmt.execute(createUsers);
            stmt.execute(createAuthUsers);
            stmt.execute(createChats);
            
            System.out.println("✅ Tables created/verified!");
            
            // Check current time
            ResultSet rs = stmt.executeQuery("SELECT NOW()");
            if (rs.next()) {
                System.out.println("Database time: " + rs.getString(1));
            }
            
            conn.close();
            System.out.println("✅ All tests passed!");
            
        } catch (Exception e) {
            System.err.println("❌ FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
