package com.chatbot.services;

import com.chatbot.config.DatabaseConfig;
import com.chatbot.models.User;
import org.mindrot.jbcrypt.BCrypt;
import java.sql.*;
import java.util.UUID;

public class AuthService {
    
    public static User register(String email, String username, String password) throws Exception {
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        
        try (Connection conn = DatabaseConfig.getConnection()) {
            // Insert into auth_users
            String sql = "INSERT INTO auth_users (email, password_hash) VALUES (?, ?) RETURNING id";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, email);
            pstmt.setString(2, hashedPassword);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                UUID userId = (UUID) rs.getObject("id");
                // Insert into users
                String userSql = "INSERT INTO users (id, email, username) VALUES (?, ?, ?)";
                PreparedStatement userStmt = conn.prepareStatement(userSql);
                userStmt.setObject(1, userId);
                userStmt.setString(2, email);
                userStmt.setString(3, username);
                userStmt.executeUpdate();
                
                return new User(userId, email, username, null);
            }
        }
        return null;
    }
    
    public static User login(String email, String password) throws Exception {
        try (Connection conn = DatabaseConfig.getConnection()) {
            String sql = "SELECT au.id, u.username, au.password_hash FROM auth_users au JOIN users u ON au.id = u.id WHERE au.email = ?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, email);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                String hashedPassword = rs.getString("password_hash");
                if (BCrypt.checkpw(password, hashedPassword)) {
                    UUID userId = (UUID) rs.getObject("id");
                    String username = rs.getString("username");
                    return new User(userId, email, username, null);
                }
            }
        }
        return null;
    }
}
