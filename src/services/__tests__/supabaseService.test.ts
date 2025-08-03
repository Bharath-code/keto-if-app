import { supabaseService } from '../supabaseService';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types/store';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      upsert: jest.fn(),
    })),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('SupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(supabaseService.validateEmail('test@example.com')).toBe(true);
      expect(supabaseService.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(supabaseService.validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(supabaseService.validateEmail('invalid-email')).toBe(false);
      expect(supabaseService.validateEmail('test@')).toBe(false);
      expect(supabaseService.validateEmail('@example.com')).toBe(false);
      expect(supabaseService.validateEmail('test.example.com')).toBe(false);
      expect(supabaseService.validateEmail('')).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        personal_info: {
          age: 30,
          gender: 'male' as const,
          height: 180,
          current_weight: 80,
          target_weight: 75,
          activity_level: 'moderate' as const,
        },
        goals: {
          primary: 'weightLoss' as const,
          timeline: 12,
          weekly_weight_loss_target: 0.5,
        },
        preferences: {
          dietary_restrictions: [],
          disliked_foods: [],
          preferred_meal_times: [],
          fasting_experience: 'beginner' as const,
        },
        subscription: {
          tier: 'free' as const,
          features: [],
        },
        is_onboarded: false,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          })),
        })),
      }));
      mockSupabase.from.mockImplementation(mockFrom);

      const response = await supabaseService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.email).toBe('test@example.com');
      expect(response.error).toBeUndefined();
    });

    it('should handle login failure', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' } as any,
      });

      const response = await supabaseService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
      expect(response.user).toBeUndefined();
    });
  });

  describe('register', () => {
    it('should register successfully with valid credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        personal_info: {
          age: 0,
          gender: 'male' as const,
          height: 0,
          current_weight: 0,
          target_weight: 0,
          activity_level: 'moderate' as const,
        },
        goals: {
          primary: 'weightLoss' as const,
          timeline: 12,
          weekly_weight_loss_target: 0.5,
        },
        preferences: {
          dietary_restrictions: [],
          disliked_foods: [],
          preferred_meal_times: [],
          fasting_experience: 'beginner' as const,
        },
        subscription: {
          tier: 'free' as const,
          features: [],
        },
        is_onboarded: false,
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          })),
        })),
      }));
      mockSupabase.from.mockImplementation(mockFrom);

      const response = await supabaseService.register({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.email).toBe('test@example.com');
    });

    it('should reject registration with mismatched passwords', async () => {
      const response = await supabaseService.register({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Passwords do not match');
      expect(response.user).toBeUndefined();
    });

    it('should reject registration with weak password', async () => {
      const response = await supabaseService.register({
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Password must be at least 6 characters long');
      expect(response.user).toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        personal_info: {
          age: 30,
          gender: 'male' as const,
          height: 180,
          current_weight: 80,
          target_weight: 75,
          activity_level: 'moderate' as const,
        },
        goals: {
          primary: 'weightLoss' as const,
          timeline: 12,
          weekly_weight_loss_target: 0.5,
        },
        preferences: {
          dietary_restrictions: [],
          disliked_foods: [],
          preferred_meal_times: [],
          fasting_experience: 'beginner' as const,
        },
        subscription: {
          tier: 'free' as const,
          features: [],
        },
        is_onboarded: false,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          })),
        })),
      }));
      mockSupabase.from.mockImplementation(mockFrom);

      const user = await supabaseService.getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(user?.id).toBe('user-123');
    });

    it('should return null when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = await supabaseService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user exists', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const isAuth = await supabaseService.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('should return false when no user exists', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const isAuth = await supabaseService.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await expect(supabaseService.logout()).resolves.not.toThrow();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });
});