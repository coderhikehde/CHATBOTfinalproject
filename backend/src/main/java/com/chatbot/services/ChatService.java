package com.chatbot.services;

import com.chatbot.config.DatabaseConfig;
import java.sql.*;
import java.util.*;

public class ChatService {
    
    public static void saveChat(UUID userId, String message, String response) throws Exception {
        String sql = "INSERT INTO chats (user_id, message, response) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setObject(1, userId);
            pstmt.setString(2, message);
            pstmt.setString(3, response);
            pstmt.executeUpdate();
        }
    }
    
    public static List<Map<String, String>> getUserChats(UUID userId) throws Exception {
        List<Map<String, String>> chats = new ArrayList<>();
        String sql = "SELECT message, response, created_at FROM chats WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
        
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setObject(1, userId);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Map<String, String> chat = new HashMap<>();
                chat.put("message", rs.getString("message"));
                chat.put("response", rs.getString("response"));
                chat.put("timestamp", rs.getString("created_at"));
                chats.add(chat);
            }
        }
        return chats;
    }
    
    public static String getAIResponse(String message) {
        // Simple rule-based responses (language agnostic)
        String msg = message.toLowerCase();
        
        if (msg.contains("hello") || msg.contains("hi")) {
            return "Hello! How can I help you today?";
        } else if (msg.contains("how are you")) {
            return "I'm doing great! Thanks for asking. How about you?";
        } else if (msg.contains("name")) {
            return "I'm your friendly AI chatbot assistant!";
        } else if (msg.contains("help")) {
            return "I can help you with questions, chat with you, or just keep you company! What would you like to know?";
        } else if (msg.contains("thank")) {
            return "You're welcome! Happy to help! 😊";
        } else if (msg.contains("bye")) {
            return "Goodbye! Have a wonderful day! 👋";
        } else if (msg.contains("weather")) {
            return "I can't check real weather yet, but I hope it's beautiful where you are! ☀️";
        } else {
            return "Interesting! Tell me more about that. I'm here to learn and chat with you! 🤖";
        }
    }
}
