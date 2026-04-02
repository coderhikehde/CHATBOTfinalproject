package com.chatbot.config;

import java.io.InputStream;
import java.util.Properties;

public class ConfigLoader {
    private static Properties properties = new Properties();
    
    static {
        try (InputStream input = ConfigLoader.class.getClassLoader()
                .getResourceAsStream("config.properties")) {
            if (input == null) {
                System.err.println("Unable to find config.properties");
                System.exit(1);
            }
            properties.load(input);
            System.out.println("Configuration loaded successfully");
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    public static String getDbUrl() { return properties.getProperty("db.url"); }
    public static String getDbUser() { return properties.getProperty("db.user"); }
    public static String getDbPassword() { return properties.getProperty("db.password"); }
    public static String getSupabaseUrl() { return properties.getProperty("supabase.url"); }
    public static String getSupabaseAnonKey() { return properties.getProperty("supabase.anon.key"); }
    public static String getJwtSecret() { return properties.getProperty("jwt.secret"); }
    public static String getGeminiApiKey() { return properties.getProperty("gemini.api.key"); }
}
