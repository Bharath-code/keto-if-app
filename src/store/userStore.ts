import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MacroTargets } from '../types/store';
import { authService, LoginCredentials, RegisterCredentials, AuthResponse } from '../services/authService';
import { supabaseService } from '../services/supabaseService';
import { calculateUserMetabolism } from '../utils/metabolismCalculations';

interface UserState {
  user: UserProfile | null;
  macroTargets: MacroTargets | null;
  isOnboarded: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  // Actions
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setMacroTargets: (targets: MacroTargets) => void;
  setOnboarded: (onboarded: boolean) => void;
  clearUser: () => void;
  
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearAuthError: () => void;
  
  // Profile calculation actions
  calculateAndSetMacros: () => void;
  
  // Supabase integration
  useSupabase: boolean;
  toggleSupabase: (enabled: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      macroTargets: null,
      isOnboarded: false,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
      useSupabase: false, // Toggle between mock auth and Supabase

      setUser: (user) => {
        set({ user, isAuthenticated: true });
        // Auto-calculate macros when user is set
        get().calculateAndSetMacros();
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          set({ user: updatedUser });
          // Recalculate macros if personal info or goals changed
          if (updates.personalInfo || updates.goals) {
            get().calculateAndSetMacros();
          }
        }
      },

      setMacroTargets: (targets) => set({ macroTargets: targets }),

      setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),

      clearUser: () =>
        set({
          user: null,
          macroTargets: null,
          isOnboarded: false,
          isAuthenticated: false,
          authError: null,
        }),

      // Authentication actions
      login: async (credentials) => {
        set({ isLoading: true, authError: null });
        try {
          const service = get().useSupabase ? supabaseService : authService;
          const response = await service.login(credentials);
          if (response.success && response.user) {
            set({ 
              user: response.user, 
              isAuthenticated: true,
              isLoading: false,
              authError: null,
            });
            get().calculateAndSetMacros();
          } else {
            set({ 
              isLoading: false, 
              authError: response.error || 'Login failed',
              isAuthenticated: false,
            });
          }
          return response;
        } catch (error) {
          const errorMessage = 'Login failed. Please try again.';
          set({ 
            isLoading: false, 
            authError: errorMessage,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, authError: null });
        try {
          const service = get().useSupabase ? supabaseService : authService;
          const response = await service.register(credentials);
          if (response.success && response.user) {
            set({ 
              user: response.user, 
              isAuthenticated: true,
              isLoading: false,
              authError: null,
            });
            get().calculateAndSetMacros();
          } else {
            set({ 
              isLoading: false, 
              authError: response.error || 'Registration failed',
              isAuthenticated: false,
            });
          }
          return response;
        } catch (error) {
          const errorMessage = 'Registration failed. Please try again.';
          set({ 
            isLoading: false, 
            authError: errorMessage,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const service = get().useSupabase ? supabaseService : authService;
          await service.logout();
          set({
            user: null,
            macroTargets: null,
            isOnboarded: false,
            isAuthenticated: false,
            isLoading: false,
            authError: null,
          });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          const service = get().useSupabase ? supabaseService : authService;
          const isAuthenticated = await service.isAuthenticated();
          if (isAuthenticated) {
            const user = await service.getCurrentUser();
            if (user) {
              set({ 
                user, 
                isAuthenticated: true,
                isLoading: false,
              });
              get().calculateAndSetMacros();
            } else {
              set({ 
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            set({ 
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ 
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearAuthError: () => set({ authError: null }),

      calculateAndSetMacros: async () => {
        const { user, useSupabase } = get();
        if (user && user.personalInfo.age && user.personalInfo.height && user.personalInfo.currentWeight) {
          try {
            if (useSupabase) {
              // Use Supabase service to calculate and sync macros
              const macroTargets = await supabaseService.calculateAndSyncMacroTargets(user);
              if (macroTargets) {
                set({ macroTargets });
              }
            } else {
              // Use local calculation
              const metabolismData = calculateUserMetabolism(user);
              set({ macroTargets: metabolismData.macroTargets });
            }
          } catch (error) {
            console.error('Error calculating macros:', error);
          }
        }
      },

      toggleSupabase: (enabled) => {
        set({ useSupabase: enabled });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        macroTargets: state.macroTargets,
        isOnboarded: state.isOnboarded,
        isAuthenticated: state.isAuthenticated,
        useSupabase: state.useSupabase,
      }),
    }
  )
);
