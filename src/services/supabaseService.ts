import { supabase, Profile, ProfileUpdate, MacroTargets, MacroTargetsInsert } from '../lib/supabase';
import { UserProfile, MacroTargets as LocalMacroTargets } from '../types/store';
import { calculateUserMetabolism } from '../utils/metabolismCalculations';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

class SupabaseService {
  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data.user) {
        const profile = await this.getProfile(data.user.id);
        if (profile) {
          return {
            success: true,
            user: this.transformProfileToUserProfile(profile),
          };
        }
      }

      return {
        success: false,
        error: 'Failed to retrieve user profile',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        return {
          success: false,
          error: 'Passwords do not match',
        };
      }

      // Validate password strength
      if (credentials.password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long',
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data.user) {
        // Profile will be created automatically by the trigger
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const profile = await this.getProfile(data.user.id);
        if (profile) {
          return {
            success: true,
            user: this.transformProfileToUserProfile(profile),
          };
        }
      }

      return {
        success: false,
        error: 'Registration completed but failed to retrieve profile',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const profile = await this.getProfile(user.id);
      return profile ? this.transformProfileToUserProfile(profile) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Profile management methods
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const profileUpdate: ProfileUpdate = {};

      if (updates.personalInfo) {
        profileUpdate.personal_info = {
          age: updates.personalInfo.age,
          gender: updates.personalInfo.gender,
          height: updates.personalInfo.height,
          current_weight: updates.personalInfo.currentWeight,
          target_weight: updates.personalInfo.targetWeight,
          activity_level: updates.personalInfo.activityLevel,
        };
      }

      if (updates.goals) {
        profileUpdate.goals = {
          primary: updates.goals.primary,
          timeline: updates.goals.timeline,
          weekly_weight_loss_target: updates.goals.weeklyWeightLossTarget,
        };
      }

      if (updates.preferences) {
        profileUpdate.preferences = {
          dietary_restrictions: updates.preferences.dietaryRestrictions,
          disliked_foods: updates.preferences.dislikedFoods,
          preferred_meal_times: updates.preferences.preferredMealTimes,
          fasting_experience: updates.preferences.fastingExperience,
        };
      }

      if (updates.subscription) {
        profileUpdate.subscription = {
          tier: updates.subscription.tier,
          expires_at: updates.subscription.expiresAt?.toISOString(),
          features: updates.subscription.features,
        };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      return this.transformProfileToUserProfile(data);
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  async setOnboarded(userId: string, onboarded: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_onboarded: onboarded })
        .eq('id', userId);

      if (error) {
        console.error('Error setting onboarded status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Set onboarded error:', error);
      return false;
    }
  }

  // Macro targets methods
  async getMacroTargets(userId: string): Promise<LocalMacroTargets | null> {
    try {
      const { data, error } = await supabase
        .from('macro_targets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching macro targets:', error);
        return null;
      }

      return {
        calories: data.calories,
        carbs: data.carbs,
        protein: data.protein,
        fat: data.fat,
      };
    } catch (error) {
      console.error('Get macro targets error:', error);
      return null;
    }
  }

  async setMacroTargets(userId: string, targets: LocalMacroTargets): Promise<boolean> {
    try {
      const macroTargetsData: MacroTargetsInsert = {
        user_id: userId,
        calories: targets.calories,
        carbs: targets.carbs,
        protein: targets.protein,
        fat: targets.fat,
      };

      const { error } = await supabase
        .from('macro_targets')
        .upsert(macroTargetsData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error setting macro targets:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Set macro targets error:', error);
      return false;
    }
  }

  // Utility methods
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Transform Supabase profile to local UserProfile format
  private transformProfileToUserProfile(profile: Profile): UserProfile {
    return {
      id: profile.id,
      email: profile.email,
      personalInfo: {
        age: profile.personal_info.age || 0,
        gender: profile.personal_info.gender || 'male',
        height: profile.personal_info.height || 0,
        currentWeight: profile.personal_info.current_weight || 0,
        targetWeight: profile.personal_info.target_weight || 0,
        activityLevel: profile.personal_info.activity_level || 'moderate',
      },
      goals: {
        primary: profile.goals.primary || 'weightLoss',
        timeline: profile.goals.timeline || 12,
        weeklyWeightLossTarget: profile.goals.weekly_weight_loss_target || 0.5,
      },
      preferences: {
        dietaryRestrictions: profile.preferences.dietary_restrictions || [],
        dislikedFoods: profile.preferences.disliked_foods || [],
        preferredMealTimes: profile.preferences.preferred_meal_times || [],
        fastingExperience: profile.preferences.fasting_experience || 'beginner',
      },
      subscription: {
        tier: profile.subscription.tier || 'free',
        expiresAt: profile.subscription.expires_at ? new Date(profile.subscription.expires_at) : undefined,
        features: profile.subscription.features || [],
      },
    };
  }

  // Calculate and sync macro targets
  async calculateAndSyncMacroTargets(user: UserProfile): Promise<LocalMacroTargets | null> {
    try {
      if (user.personalInfo.age && user.personalInfo.height && user.personalInfo.currentWeight) {
        const metabolismData = calculateUserMetabolism(user);
        const success = await this.setMacroTargets(user.id, metabolismData.macroTargets);
        
        if (success) {
          return metabolismData.macroTargets;
        }
      }
      return null;
    } catch (error) {
      console.error('Calculate and sync macro targets error:', error);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();