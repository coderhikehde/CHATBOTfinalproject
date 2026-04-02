package com.chatbot.config;

public class ConfigLoader {
    public static String getDbUrl() { return System.getenv("DB_URL"); }
    public static String getDbUser() { return System.getenv("DB_USER"); }
    public static String getDbPassword() { return System.getenv("DB_PASSWORD"); }
    public static String getSupabaseUrl() { return System.getenv("SUPABASE_URL"); }
    public static String getSupabaseAnonKey() { return System.getenv("SUPABASE_ANON_KEY"); }
    public static String getJwtSecret() { return System.getenv("JWT_SECRET"); }
    public static String getGeminiApiKey() { return System.getenv("GROQ_API_KEY"); }
}
