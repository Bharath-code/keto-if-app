export interface UserProfile {
  id: string;
  email: string;
  personalInfo: {
    age: number;
    gender: 'male' | 'female' | 'other';
    height: number; // cm
    currentWeight: number; // kg
    targetWeight: number; // kg
    activityLevel:
      | 'sedentary'
      | 'light'
      | 'moderate'
      | 'active'
      | 'very_active';
  };
  goals: {
    primary: 'weightLoss' | 'maintenance' | 'muscleGain';
    timeline: number; // weeks
    weeklyWeightLossTarget: number; // kg
  };
  preferences: {
    dietaryRestrictions: string[];
    dislikedFoods: string[];
    preferredMealTimes: string[];
    fastingExperience: 'beginner' | 'intermediate' | 'advanced';
  };
  subscription: {
    tier: 'free' | 'premium' | 'elite';
    expiresAt?: Date;
    features: string[];
  };
}

export interface MacroTargets {
  calories: number;
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
}

export interface FastingSession {
  id: string;
  startTime: Date;
  plannedEndTime: Date;
  actualEndTime?: Date;
  protocol: '16:8' | '18:6' | 'OMAD' | 'custom';
  currentStage: 'digestion' | 'fatBurning' | 'ketosis' | 'autophagy';
}

export interface FoodEntry {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  macros: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
}
