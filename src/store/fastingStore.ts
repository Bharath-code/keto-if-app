import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FastingSession } from '../types/store';

interface FastingState {
  currentSession: FastingSession | null;
  fastingHistory: FastingSession[];

  // Actions
  startFasting: (
    protocol: FastingSession['protocol'],
    duration: number
  ) => void;
  endFasting: () => void;
  updateCurrentSession: (updates: Partial<FastingSession>) => void;
  getCurrentFastingDuration: () => number;
  getFastingStreak: () => number;
}

export const useFastingStore = create<FastingState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      fastingHistory: [],

      startFasting: (protocol, duration) => {
        const now = new Date();
        const plannedEndTime = new Date(
          now.getTime() + duration * 60 * 60 * 1000
        );

        const session: FastingSession = {
          id: Date.now().toString(),
          startTime: now,
          plannedEndTime,
          protocol,
          currentStage: 'digestion',
        };

        set({ currentSession: session });
      },

      endFasting: () => {
        const { currentSession } = get();
        if (currentSession) {
          const completedSession = {
            ...currentSession,
            actualEndTime: new Date(),
          };

          set((state) => ({
            currentSession: null,
            fastingHistory: [...state.fastingHistory, completedSession],
          }));
        }
      },

      updateCurrentSession: (updates) => {
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, ...updates }
            : null,
        }));
      },

      getCurrentFastingDuration: () => {
        const { currentSession } = get();
        if (!currentSession) return 0;

        const now = new Date();
        const duration = now.getTime() - currentSession.startTime.getTime();
        return Math.floor(duration / (1000 * 60 * 60)); // hours
      },

      getFastingStreak: () => {
        const { fastingHistory } = get();
        let streak = 0;
        const today = new Date();

        // Simple streak calculation - count consecutive days with completed fasts
        for (let i = fastingHistory.length - 1; i >= 0; i--) {
          const session = fastingHistory[i];
          if (session.actualEndTime) {
            const sessionDate = new Date(session.actualEndTime);
            const daysDiff = Math.floor(
              (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff === streak) {
              streak++;
            } else {
              break;
            }
          }
        }

        return streak;
      },
    }),
    {
      name: 'fasting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
