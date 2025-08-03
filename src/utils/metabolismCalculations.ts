import { UserProfile, MacroTargets } from '../types/store';

export interface MetabolismData {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  macroTargets: MacroTargets;
}

/**
 * Calculate Basal Metabolic Rate using the Mifflin-St Jeor Equation
 * This is considered one of the most accurate formulas for BMR calculation
 */
export function calculateBMR(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  // Mifflin-St Jeor Equation:
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
  
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'male') {
    return baseBMR + 5;
  } else if (gender === 'female') {
    return baseBMR - 161;
  } else {
    // For 'other' gender, use average of male and female calculations
    return baseBMR - 78; // Average of +5 and -161
  }
}

/**
 * Calculate Total Daily Energy Expenditure by applying activity multiplier to BMR
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise/sports 1-3 days/week
    moderate: 1.55, // Moderate exercise/sports 3-5 days/week
    active: 1.725, // Hard exercise/sports 6-7 days a week
    very_active: 1.9, // Very hard exercise/sports & physical job or 2x training
  };

  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
  return bmr * multiplier;
}

/**
 * Calculate macro targets based on TDEE and goals
 * Uses ketogenic diet ratios: 70-75% fat, 20-25% protein, 5-10% carbs
 */
export function calculateMacroTargets(
  tdee: number,
  goal: 'weightLoss' | 'maintenance' | 'muscleGain',
  weeklyWeightLossTarget: number = 0.5
): MacroTargets {
  let targetCalories = tdee;

  // Adjust calories based on goal
  switch (goal) {
    case 'weightLoss':
      // 1 kg of fat = approximately 7700 calories
      // Weekly deficit = weeklyWeightLossTarget * 7700
      // Daily deficit = weekly deficit / 7
      const dailyDeficit = (weeklyWeightLossTarget * 7700) / 7;
      targetCalories = tdee - dailyDeficit;
      // Ensure minimum calories for safety (1200 for women, 1500 for men)
      targetCalories = Math.max(targetCalories, 1200);
      break;
    case 'muscleGain':
      // Add 300-500 calories for muscle gain
      targetCalories = tdee + 400;
      break;
    case 'maintenance':
    default:
      targetCalories = tdee;
      break;
  }

  // Ketogenic macro distribution
  const carbPercentage = 0.05; // 5% carbs
  const proteinPercentage = 0.25; // 25% protein
  const fatPercentage = 0.70; // 70% fat

  // Calculate macros in grams
  // 1g carbs = 4 calories, 1g protein = 4 calories, 1g fat = 9 calories
  const carbCalories = targetCalories * carbPercentage;
  const proteinCalories = targetCalories * proteinPercentage;
  const fatCalories = targetCalories * fatPercentage;

  return {
    calories: Math.round(targetCalories),
    carbs: Math.round(carbCalories / 4),
    protein: Math.round(proteinCalories / 4),
    fat: Math.round(fatCalories / 9),
  };
}

/**
 * Calculate complete metabolism data for a user
 */
export function calculateUserMetabolism(user: UserProfile): MetabolismData {
  const { personalInfo, goals } = user;
  
  const bmr = calculateBMR(
    personalInfo.currentWeight,
    personalInfo.height,
    personalInfo.age,
    personalInfo.gender
  );

  const tdee = calculateTDEE(bmr, personalInfo.activityLevel);

  const macroTargets = calculateMacroTargets(
    tdee,
    goals.primary,
    goals.weeklyWeightLossTarget
  );

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    macroTargets,
  };
}

/**
 * Validate user profile data for metabolism calculations
 */
export function validateUserDataForCalculations(user: UserProfile): string[] {
  const errors: string[] = [];
  const { personalInfo } = user;

  if (!personalInfo.age || personalInfo.age < 13 || personalInfo.age > 120) {
    errors.push('Age must be between 13 and 120 years');
  }

  if (!personalInfo.height || personalInfo.height < 100 || personalInfo.height > 250) {
    errors.push('Height must be between 100 and 250 cm');
  }

  if (!personalInfo.currentWeight || personalInfo.currentWeight < 30 || personalInfo.currentWeight > 300) {
    errors.push('Current weight must be between 30 and 300 kg');
  }

  if (!personalInfo.targetWeight || personalInfo.targetWeight < 30 || personalInfo.targetWeight > 300) {
    errors.push('Target weight must be between 30 and 300 kg');
  }

  return errors;
}

/**
 * Get recommended daily water intake based on weight and activity level
 */
export function calculateWaterIntake(weight: number, activityLevel: string): number {
  // Base water intake: 35ml per kg of body weight
  let waterIntake = weight * 35;

  // Adjust for activity level
  const activityMultipliers = {
    sedentary: 1.0,
    light: 1.1,
    moderate: 1.2,
    active: 1.3,
    very_active: 1.4,
  };

  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.0;
  waterIntake *= multiplier;

  // Convert to liters and round to 1 decimal place
  return Math.round((waterIntake / 1000) * 10) / 10;
}