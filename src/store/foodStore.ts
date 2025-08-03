import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry } from '../types/store';

interface FoodState {
  todaysFoods: FoodEntry[];
  foodHistory: Record<string, FoodEntry[]>; // date -> foods

  // Actions
  addFoodEntry: (food: FoodEntry) => void;
  removeFoodEntry: (foodId: string) => void;
  updateFoodEntry: (foodId: string, updates: Partial<FoodEntry>) => void;
  getTodaysMacros: () => {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
  clearTodaysFoods: () => void;
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      todaysFoods: [],
      foodHistory: {},

      addFoodEntry: (food) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          todaysFoods: [...state.todaysFoods, food],
          foodHistory: {
            ...state.foodHistory,
            [today]: [...(state.foodHistory[today] || []), food],
          },
        }));
      },

      removeFoodEntry: (foodId) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          todaysFoods: state.todaysFoods.filter((food) => food.id !== foodId),
          foodHistory: {
            ...state.foodHistory,
            [today]: (state.foodHistory[today] || []).filter(
              (food) => food.id !== foodId
            ),
          },
        }));
      },

      updateFoodEntry: (foodId, updates) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          todaysFoods: state.todaysFoods.map((food) =>
            food.id === foodId ? { ...food, ...updates } : food
          ),
          foodHistory: {
            ...state.foodHistory,
            [today]: (state.foodHistory[today] || []).map((food) =>
              food.id === foodId ? { ...food, ...updates } : food
            ),
          },
        }));
      },

      getTodaysMacros: () => {
        const { todaysFoods } = get();
        return todaysFoods.reduce(
          (totals, food) => ({
            calories: totals.calories + food.macros.calories,
            carbs: totals.carbs + food.macros.carbs,
            protein: totals.protein + food.macros.protein,
            fat: totals.fat + food.macros.fat,
          }),
          { calories: 0, carbs: 0, protein: 0, fat: 0 }
        );
      },

      clearTodaysFoods: () => set({ todaysFoods: [] }),
    }),
    {
      name: 'food-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
