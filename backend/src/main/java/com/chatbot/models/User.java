package com.chatbot.models;

import java.util.UUID;

public class User {
    private UUID id;
    private String email;
    private String username;
    private String createdAt;
    
    public User(UUID id, String email, String username, String createdAt) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.createdAt = createdAt;
    }
    
    // Getters
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getCreatedAt() { return createdAt; }
}
