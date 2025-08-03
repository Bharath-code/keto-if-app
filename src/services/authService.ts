import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/store';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    confirmPassword: string;
}

export interface AuthResponse {
    success: boolean;
    user?: UserProfile;
    error?: string;
}

class AuthService {
    private readonly AUTH_TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'user_data';

    // Mock user database - in a real app, this would be a backend API
    private mockUsers: Array<{ email: string; password: string; user: UserProfile }> = [];

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Find user in mock database
            const userRecord = this.mockUsers.find(
                record => record.email === credentials.email && record.password === credentials.password
            );

            if (!userRecord) {
                return {
                    success: false,
                    error: 'Invalid email or password',
                };
            }

            // Generate mock token
            const token = `mock_token_${Date.now()}`;

            // Store token and user data
            await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, token);
            await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(userRecord.user));

            return {
                success: true,
                user: userRecord.user,
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

            // Check if user already exists
            const existingUser = this.mockUsers.find(record => record.email === credentials.email);
            if (existingUser) {
                return {
                    success: false,
                    error: 'An account with this email already exists',
                };
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create new user profile
            const newUser: UserProfile = {
                id: `user_${Date.now()}`,
                email: credentials.email,
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

            // Store user in mock database
            this.mockUsers.push({
                email: credentials.email,
                password: credentials.password,
                user: newUser,
            });

            // Generate mock token
            const token = `mock_token_${Date.now()}`;

            // Store token and user data
            await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, token);
            await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(newUser));

            return {
                success: true,
                user: newUser,
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
            await AsyncStorage.removeItem(this.AUTH_TOKEN_KEY);
            await AsyncStorage.removeItem(this.USER_KEY);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async getCurrentUser(): Promise<UserProfile | null> {
        try {
            const token = await AsyncStorage.getItem(this.AUTH_TOKEN_KEY);
            if (!token) {
                return null;
            }

            const userData = await AsyncStorage.getItem(this.USER_KEY);
            if (!userData) {
                return null;
            }

            return JSON.parse(userData);
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem(this.AUTH_TOKEN_KEY);
            return !!token;
        } catch (error) {
            return false;
        }
    }

    // Utility method to validate email format
    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

export const authService = new AuthService();