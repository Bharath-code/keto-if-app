import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (will be generated from Supabase CLI)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          personal_info: {
            age: number;
            gender: 'male' | 'female' | 'other';
            height: number;
            current_weight: number;
            target_weight: number;
            activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          };
          goals: {
            primary: 'weightLoss' | 'maintenance' | 'muscleGain';
            timeline: number;
            weekly_weight_loss_target: number;
          };
          preferences: {
            dietary_restrictions: string[];
            disliked_foods: string[];
            preferred_meal_times: string[];
            fasting_experience: 'beginner' | 'intermediate' | 'advanced';
          };
          subscription: {
            tier: 'free' | 'premium' | 'elite';
            expires_at?: string;
            features: string[];
          };
          is_onboarded: boolean;
        };
        Insert: {
          id: string;
          email: string;
          personal_info?: {
            age?: number;
            gender?: 'male' | 'female' | 'other';
            height?: number;
            current_weight?: number;
            target_weight?: number;
            activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          };
          goals?: {
            primary?: 'weightLoss' | 'maintenance' | 'muscleGain';
            timeline?: number;
            weekly_weight_loss_target?: number;
          };
          preferences?: {
            dietary_restrictions?: string[];
            disliked_foods?: string[];
            preferred_meal_times?: string[];
            fasting_experience?: 'beginner' | 'intermediate' | 'advanced';
          };
          subscription?: {
            tier?: 'free' | 'premium' | 'elite';
            expires_at?: string;
            features?: string[];
          };
          is_onboarded?: boolean;
        };
        Update: {
          email?: string;
          updated_at?: string;
          personal_info?: {
            age?: number;
            gender?: 'male' | 'female' | 'other';
            height?: number;
            current_weight?: number;
            target_weight?: number;
            activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          };
          goals?: {
            primary?: 'weightLoss' | 'maintenance' | 'muscleGain';
            timeline?: number;
            weekly_weight_loss_target?: number;
          };
          preferences?: {
            dietary_restrictions?: string[];
            disliked_foods?: string[];
            preferred_meal_times?: string[];
            fasting_experience?: 'beginner' | 'intermediate' | 'advanced';
          };
          subscription?: {
            tier?: 'free' | 'premium' | 'elite';
            expires_at?: string;
            features?: string[];
          };
          is_onboarded?: boolean;
        };
      };
      macro_targets: {
        Row: {
          id: string;
          user_id: string;
          calories: number;
          carbs: number;
          protein: number;
          fat: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          calories: number;
          carbs: number;
          protein: number;
          fat: number;
        };
        Update: {
          calories?: number;
          carbs?: number;
          protein?: number;
          fat?: number;
          updated_at?: string;
        };
      };
      food_entries: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand?: string;
          serving_size: number;
          serving_unit: string;
          macros: {
            calories: number;
            carbs: number;
            protein: number;
            fat: number;
          };
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          logged_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          brand?: string;
          serving_size: number;
          serving_unit: string;
          macros: {
            calories: number;
            carbs: number;
            protein: number;
            fat: number;
          };
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          logged_at?: string;
        };
        Update: {
          name?: string;
          brand?: string;
          serving_size?: number;
          serving_unit?: string;
          macros?: {
            calories: number;
            carbs: number;
            protein: number;
            fat: number;
          };
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          logged_at?: string;
        };
      };
      fasting_sessions: {
        Row: {
          id: string;
          user_id: string;
          start_time: string;
          planned_end_time: string;
          actual_end_time?: string;
          protocol: '16:8' | '18:6' | 'OMAD' | 'custom';
          current_stage: 'digestion' | 'fatBurning' | 'ketosis' | 'autophagy';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          start_time: string;
          planned_end_time: string;
          actual_end_time?: string;
          protocol: '16:8' | '18:6' | 'OMAD' | 'custom';
          current_stage?: 'digestion' | 'fatBurning' | 'ketosis' | 'autophagy';
        };
        Update: {
          planned_end_time?: string;
          actual_end_time?: string;
          protocol?: '16:8' | '18:6' | 'OMAD' | 'custom';
          current_stage?: 'digestion' | 'fatBurning' | 'ketosis' | 'autophagy';
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type MacroTargets = Database['public']['Tables']['macro_targets']['Row'];
export type MacroTargetsInsert = Database['public']['Tables']['macro_targets']['Insert'];
export type MacroTargetsUpdate = Database['public']['Tables']['macro_targets']['Update'];

export type FoodEntry = Database['public']['Tables']['food_entries']['Row'];
export type FoodEntryInsert = Database['public']['Tables']['food_entries']['Insert'];
export type FoodEntryUpdate = Database['public']['Tables']['food_entries']['Update'];

export type FastingSession = Database['public']['Tables']['fasting_sessions']['Row'];
export type FastingSessionInsert = Database['public']['Tables']['fasting_sessions']['Insert'];
export type FastingSessionUpdate = Database['public']['Tables']['fasting_sessions']['Update'];