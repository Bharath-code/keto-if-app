import { authService } from '../authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('AuthService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    // Clear the mock users array
    (authService as any).mockUsers = [];
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(authService.validateEmail('test@example.com')).toBe(true);
      expect(authService.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(authService.validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(authService.validateEmail('invalid-email')).toBe(false);
      expect(authService.validateEmail('test@')).toBe(false);
      expect(authService.validateEmail('@example.com')).toBe(false);
      expect(authService.validateEmail('test.example.com')).toBe(false);
      expect(authService.validateEmail('')).toBe(false);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await authService.register(credentials);

      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.email).toBe('test@example.com');
      expect(response.user?.id).toBeDefined();
      expect(response.error).toBeUndefined();

      // Check that token and user data were stored
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      expect(token).toBeDefined();
      expect(userData).toBeDefined();
    });

    it('should reject registration with mismatched passwords', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      };

      const response = await authService.register(credentials);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Passwords do not match');
      expect(response.user).toBeUndefined();
    });

    it('should reject registration with weak password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
      };

      const response = await authService.register(credentials);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Password must be at least 6 characters long');
      expect(response.user).toBeUndefined();
    });

    it('should reject registration with existing email', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      // Register first user
      await authService.register(credentials);

      // Try to register again with same email
      const response = await authService.register(credentials);

      expect(response.success).toBe(false);
      expect(response.error).toBe('An account with this email already exists');
      expect(response.user).toBeUndefined();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Register a test user first
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      // Clear storage after registration to test login
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    });

    it('should login successfully with correct credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.email).toBe('test@example.com');
      expect(response.error).toBeUndefined();

      // Check that token and user data were stored
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      expect(token).toBeDefined();
      expect(userData).toBeDefined();
    });

    it('should reject login with incorrect email', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid email or password');
      expect(response.user).toBeUndefined();
    });

    it('should reject login with incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid email or password');
      expect(response.user).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should clear stored authentication data', async () => {
      // First login to set data
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      // Verify data is stored
      let token = await AsyncStorage.getItem('auth_token');
      let userData = await AsyncStorage.getItem('user_data');
      expect(token).toBeDefined();
      expect(userData).toBeDefined();

      // Logout
      await authService.logout();

      // Verify data is cleared
      token = await AsyncStorage.getItem('auth_token');
      userData = await AsyncStorage.getItem('user_data');
      expect(token).toBeNull();
      expect(userData).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      // Register and login
      const registerResponse = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(user?.id).toBe(registerResponse.user?.id);
    });

    it('should return null when not authenticated', async () => {
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return null when token exists but no user data', async () => {
      await AsyncStorage.setItem('auth_token', 'some-token');
      
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      await AsyncStorage.setItem('auth_token', 'some-token');
      
      const isAuth = await authService.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('should return false when no token exists', async () => {
      const isAuth = await authService.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });
});