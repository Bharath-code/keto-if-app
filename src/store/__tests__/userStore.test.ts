import { useUserStore } from '../userStore';
import { UserProfile } from '../../types/store';
import { authService } from '../../services/authService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock authService
jest.mock('../../services/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
    validateEmail: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('UserStore', () => {
  beforeEach(() => {
    useUserStore.getState().clearUser();
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.macroTargets).toBeNull();
    expect(state.isOnboarded).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.authError).toBeNull();
  });

  it('should set user correctly and calculate macros', () => {
    const mockUser: UserProfile = {
      id: '1',
      email: 'test@example.com',
      personalInfo: {
        age: 30,
        gender: 'male',
        height: 180,
        currentWeight: 80,
        targetWeight: 75,
        activityLevel: 'moderate',
      },
      goals: {
        primary: 'weightLoss',
        timeline: 12,
        weeklyWeightLossTarget: 0.5,
      },
      preferences: {
        dietaryRestrictions: [],
        dislikedFoods: [],
        preferredMealTimes: [],
        fastingExperience: 'beginner',
      },
      subscription: {
        tier: 'free',
        features: [],
      },
    };

    useUserStore.getState().setUser(mockUser);
    const state = useUserStore.getState();
    
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.macroTargets).toBeDefined();
    expect(state.macroTargets?.calories).toBeGreaterThan(0);
  });

  it('should update user correctly and recalculate macros', () => {
    const mockUser: UserProfile = {
      id: '1',
      email: 'test@example.com',
      personalInfo: {
        age: 30,
        gender: 'male',
        height: 180,
        currentWeight: 80,
        targetWeight: 75,
        activityLevel: 'moderate',
      },
      goals: {
        primary: 'weightLoss',
        timeline: 12,
        weeklyWeightLossTarget: 0.5,
      },
      preferences: {
        dietaryRestrictions: [],
        dislikedFoods: [],
        preferredMealTimes: [],
        fastingExperience: 'beginner',
      },
      subscription: {
        tier: 'free',
        features: [],
      },
    };

    useUserStore.getState().setUser(mockUser);
    const initialMacros = useUserStore.getState().macroTargets;

    useUserStore.getState().updateUser({
      personalInfo: { ...mockUser.personalInfo, currentWeight: 78 },
    });

    const state = useUserStore.getState();
    expect(state.user?.personalInfo.currentWeight).toBe(78);
    
    // Macros should be recalculated when personal info changes
    const newMacros = state.macroTargets;
    expect(newMacros).not.toEqual(initialMacros);
  });

  describe('Authentication', () => {
    it('should handle successful login', async () => {
      const mockUser: UserProfile = {
        id: '1',
        email: 'test@example.com',
        personalInfo: {
          age: 30,
          gender: 'male',
          height: 180,
          currentWeight: 80,
          targetWeight: 75,
          activityLevel: 'moderate',
        },
        goals: {
          primary: 'weightLoss',
          timeline: 12,
          weeklyWeightLossTarget: 0.5,
        },
        preferences: {
          dietaryRestrictions: [],
          dislikedFoods: [],
          preferredMealTimes: [],
          fastingExperience: 'beginner',
        },
        subscription: {
          tier: 'free',
          features: [],
        },
      };

      mockAuthService.login.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const response = await useUserStore.getState().login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.success).toBe(true);
      expect(useUserStore.getState().isAuthenticated).toBe(true);
      expect(useUserStore.getState().user).toEqual(mockUser);
      expect(useUserStore.getState().authError).toBeNull();
    });

    it('should handle failed login', async () => {
      mockAuthService.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const response = await useUserStore.getState().login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.success).toBe(false);
      expect(useUserStore.getState().isAuthenticated).toBe(false);
      expect(useUserStore.getState().user).toBeNull();
      expect(useUserStore.getState().authError).toBe('Invalid credentials');
    });

    it('should handle successful registration', async () => {
      const mockUser: UserProfile = {
        id: '1',
        email: 'test@example.com',
        personalInfo: {
          age: 0,
          gender: 'male',
          height: 0,
          currentWeight: 0,
          targetWeight: 0,
          activityLevel: 'moderate',
        },
        goals: {
          primary: 'weightLoss',
          timeline: 12,
          weeklyWeightLossTarget: 0.5,
        },
        preferences: {
          dietaryRestrictions: [],
          dislikedFoods: [],
          preferredMealTimes: [],
          fastingExperience: 'beginner',
        },
        subscription: {
          tier: 'free',
          features: [],
        },
      };

      mockAuthService.register.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const response = await useUserStore.getState().register({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(response.success).toBe(true);
      expect(useUserStore.getState().isAuthenticated).toBe(true);
      expect(useUserStore.getState().user).toEqual(mockUser);
    });

    it('should handle logout', async () => {
      // First set a user
      const mockUser: UserProfile = {
        id: '1',
        email: 'test@example.com',
        personalInfo: {
          age: 30,
          gender: 'male',
          height: 180,
          currentWeight: 80,
          targetWeight: 75,
          activityLevel: 'moderate',
        },
        goals: {
          primary: 'weightLoss',
          timeline: 12,
          weeklyWeightLossTarget: 0.5,
        },
        preferences: {
          dietaryRestrictions: [],
          dislikedFoods: [],
          preferredMealTimes: [],
          fastingExperience: 'beginner',
        },
        subscription: {
          tier: 'free',
          features: [],
        },
      };

      useUserStore.getState().setUser(mockUser);
      expect(useUserStore.getState().isAuthenticated).toBe(true);

      // Now logout
      mockAuthService.logout.mockResolvedValue();
      await useUserStore.getState().logout();

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.macroTargets).toBeNull();
      expect(state.isOnboarded).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.authError).toBeNull();
    });

    it('should check auth status', async () => {
      const mockUser: UserProfile = {
        id: '1',
        email: 'test@example.com',
        personalInfo: {
          age: 30,
          gender: 'male',
          height: 180,
          currentWeight: 80,
          targetWeight: 75,
          activityLevel: 'moderate',
        },
        goals: {
          primary: 'weightLoss',
          timeline: 12,
          weeklyWeightLossTarget: 0.5,
        },
        preferences: {
          dietaryRestrictions: [],
          dislikedFoods: [],
          preferredMealTimes: [],
          fastingExperience: 'beginner',
        },
        subscription: {
          tier: 'free',
          features: [],
        },
      };

      mockAuthService.isAuthenticated.mockResolvedValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      await useUserStore.getState().checkAuthStatus();

      const state = useUserStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });
  });

  it('should clear auth error', () => {
    // Set an error first
    useUserStore.setState({ authError: 'Some error' });
    expect(useUserStore.getState().authError).toBe('Some error');

    // Clear the error
    useUserStore.getState().clearAuthError();
    expect(useUserStore.getState().authError).toBeNull();
  });
});
