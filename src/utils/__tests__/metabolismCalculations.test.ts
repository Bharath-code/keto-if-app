import {
  calculateBMR,
  calculateTDEE,
  calculateMacroTargets,
  calculateUserMetabolism,
  validateUserDataForCalculations,
  calculateWaterIntake,
} from '../metabolismCalculations';
import { UserProfile } from '../../types/store';

describe('Metabolism Calculations', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR correctly for males', () => {
      const bmr = calculateBMR(80, 180, 30, 'male');
      // Expected: 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(bmr).toBe(1780);
    });

    it('should calculate BMR correctly for females', () => {
      const bmr = calculateBMR(65, 165, 25, 'female');
      // Expected: 10 * 65 + 6.25 * 165 - 5 * 25 - 161 = 650 + 1031.25 - 125 - 161 = 1395.25
      expect(bmr).toBe(1395.25);
    });

    it('should calculate BMR correctly for other gender', () => {
      const bmr = calculateBMR(70, 170, 28, 'other');
      // Expected: 10 * 70 + 6.25 * 170 - 5 * 28 - 78 = 700 + 1062.5 - 140 - 78 = 1544.5
      expect(bmr).toBe(1544.5);
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE correctly for sedentary activity', () => {
      const bmr = 1780;
      const tdee = calculateTDEE(bmr, 'sedentary');
      expect(tdee).toBe(bmr * 1.2);
    });

    it('should calculate TDEE correctly for moderate activity', () => {
      const bmr = 1780;
      const tdee = calculateTDEE(bmr, 'moderate');
      expect(tdee).toBe(bmr * 1.55);
    });

    it('should calculate TDEE correctly for very active', () => {
      const bmr = 1780;
      const tdee = calculateTDEE(bmr, 'very_active');
      expect(tdee).toBe(bmr * 1.9);
    });

    it('should use default multiplier for unknown activity level', () => {
      const bmr = 1780;
      const tdee = calculateTDEE(bmr, 'unknown');
      expect(tdee).toBe(bmr * 1.55); // Default moderate
    });
  });

  describe('calculateMacroTargets', () => {
    it('should calculate macro targets for weight loss', () => {
      const tdee = 2000;
      const macros = calculateMacroTargets(tdee, 'weightLoss', 0.5);
      
      // Expected daily deficit: (0.5 * 7700) / 7 = 550 calories
      // Target calories: 2000 - 550 = 1450
      const expectedCalories = 1450;
      
      expect(macros.calories).toBe(expectedCalories);
      
      // Keto ratios: 5% carbs, 25% protein, 70% fat
      expect(macros.carbs).toBe(Math.round((expectedCalories * 0.05) / 4));
      expect(macros.protein).toBe(Math.round((expectedCalories * 0.25) / 4));
      expect(macros.fat).toBe(Math.round((expectedCalories * 0.70) / 9));
    });

    it('should calculate macro targets for maintenance', () => {
      const tdee = 2000;
      const macros = calculateMacroTargets(tdee, 'maintenance');
      
      expect(macros.calories).toBe(2000);
      expect(macros.carbs).toBe(Math.round((2000 * 0.05) / 4));
      expect(macros.protein).toBe(Math.round((2000 * 0.25) / 4));
      expect(macros.fat).toBe(Math.round((2000 * 0.70) / 9));
    });

    it('should calculate macro targets for muscle gain', () => {
      const tdee = 2000;
      const macros = calculateMacroTargets(tdee, 'muscleGain');
      
      const expectedCalories = 2400; // TDEE + 400
      expect(macros.calories).toBe(expectedCalories);
      expect(macros.carbs).toBe(Math.round((expectedCalories * 0.05) / 4));
      expect(macros.protein).toBe(Math.round((expectedCalories * 0.25) / 4));
      expect(macros.fat).toBe(Math.round((expectedCalories * 0.70) / 9));
    });

    it('should enforce minimum calories for safety', () => {
      const tdee = 1400;
      const macros = calculateMacroTargets(tdee, 'weightLoss', 1.0);
      
      // Even with aggressive weight loss, should not go below 1200
      expect(macros.calories).toBeGreaterThanOrEqual(1200);
    });
  });

  describe('calculateUserMetabolism', () => {
    it('should calculate complete metabolism data for a user', () => {
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

      const result = calculateUserMetabolism(mockUser);

      expect(result.bmr).toBe(1780);
      expect(result.tdee).toBe(Math.round(1780 * 1.55));
      expect(result.macroTargets.calories).toBeGreaterThan(0);
      expect(result.macroTargets.carbs).toBeGreaterThan(0);
      expect(result.macroTargets.protein).toBeGreaterThan(0);
      expect(result.macroTargets.fat).toBeGreaterThan(0);
    });
  });

  describe('validateUserDataForCalculations', () => {
    const validUser: UserProfile = {
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

    it('should return no errors for valid user data', () => {
      const errors = validateUserDataForCalculations(validUser);
      expect(errors).toHaveLength(0);
    });

    it('should return error for invalid age', () => {
      const invalidUser = {
        ...validUser,
        personalInfo: { ...validUser.personalInfo, age: 10 },
      };
      const errors = validateUserDataForCalculations(invalidUser);
      expect(errors).toContain('Age must be between 13 and 120 years');
    });

    it('should return error for invalid height', () => {
      const invalidUser = {
        ...validUser,
        personalInfo: { ...validUser.personalInfo, height: 50 },
      };
      const errors = validateUserDataForCalculations(invalidUser);
      expect(errors).toContain('Height must be between 100 and 250 cm');
    });

    it('should return error for invalid current weight', () => {
      const invalidUser = {
        ...validUser,
        personalInfo: { ...validUser.personalInfo, currentWeight: 20 },
      };
      const errors = validateUserDataForCalculations(invalidUser);
      expect(errors).toContain('Current weight must be between 30 and 300 kg');
    });

    it('should return error for invalid target weight', () => {
      const invalidUser = {
        ...validUser,
        personalInfo: { ...validUser.personalInfo, targetWeight: 350 },
      };
      const errors = validateUserDataForCalculations(invalidUser);
      expect(errors).toContain('Target weight must be between 30 and 300 kg');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidUser = {
        ...validUser,
        personalInfo: {
          ...validUser.personalInfo,
          age: 5,
          height: 50,
        },
      };
      const errors = validateUserDataForCalculations(invalidUser);
      expect(errors).toHaveLength(2);
      expect(errors).toContain('Age must be between 13 and 120 years');
      expect(errors).toContain('Height must be between 100 and 250 cm');
    });
  });

  describe('calculateWaterIntake', () => {
    it('should calculate water intake for sedentary person', () => {
      const waterIntake = calculateWaterIntake(70, 'sedentary');
      // Expected: 70 * 35 * 1.0 / 1000 = 2.45 liters
      expect(waterIntake).toBe(2.5); // Rounded to 1 decimal
    });

    it('should calculate water intake for active person', () => {
      const waterIntake = calculateWaterIntake(80, 'active');
      // Expected: 80 * 35 * 1.3 / 1000 = 3.64 liters
      expect(waterIntake).toBe(3.6); // Rounded to 1 decimal
    });

    it('should calculate water intake for very active person', () => {
      const waterIntake = calculateWaterIntake(75, 'very_active');
      // Expected: 75 * 35 * 1.4 / 1000 = 3.675 liters
      expect(waterIntake).toBe(3.7); // Rounded to 1 decimal
    });

    it('should use default multiplier for unknown activity level', () => {
      const waterIntake = calculateWaterIntake(70, 'unknown');
      // Expected: 70 * 35 * 1.0 / 1000 = 2.45 liters (default sedentary)
      expect(waterIntake).toBe(2.5);
    });
  });
});