import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';
import { calculateUserMetabolism } from '../../utils/metabolismCalculations';

type CompleteScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Complete'>;
};

export const CompleteScreen: React.FC<CompleteScreenProps> = ({ navigation }) => {
  const { user, setOnboarded, macroTargets } = useUserStore();

  useEffect(() => {
    // Calculate and display user's metabolism data
    if (user) {
      const metabolismData = calculateUserMetabolism(user);
      console.log('Calculated metabolism data:', metabolismData);
    }
  }, [user]);

  const handleComplete = () => {
    setOnboarded(true);
    // Navigation will be handled by RootNavigator
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (!user || !macroTargets) {
    return null;
  }

  const metabolismData = calculateUserMetabolism(user);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>You're all set! 🎉</Text>
          <Text style={styles.subtitle}>
            Here's your personalized keto + IF plan
          </Text>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {/* BMR & TDEE */}
          <View style={styles.resultCard}>
            <Text style={styles.cardTitle}>Your Metabolism</Text>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{metabolismData.bmr}</Text>
                <Text style={styles.metricLabel}>BMR (calories/day)</Text>
                <Text style={styles.metricDescription}>Base metabolic rate</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{metabolismData.tdee}</Text>
                <Text style={styles.metricLabel}>TDEE (calories/day)</Text>
                <Text style={styles.metricDescription}>Total daily expenditure</Text>
              </View>
            </View>
          </View>

          {/* Macro Targets */}
          <View style={styles.resultCard}>
            <Text style={styles.cardTitle}>Your Daily Macro Targets</Text>
            <View style={styles.macroGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macroTargets.calories}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macroTargets.carbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroPercentage}>5%</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macroTargets.protein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroPercentage}>25%</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macroTargets.fat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroPercentage}>70%</Text>
              </View>
            </View>
          </View>

          {/* Goal Summary */}
          <View style={styles.resultCard}>
            <Text style={styles.cardTitle}>Your Goal</Text>
            <View style={styles.goalSummary}>
              <Text style={styles.goalText}>
                {user.goals.primary === 'weightLoss' && 
                  `Lose ${user.goals.weeklyWeightLossTarget}kg per week`}
                {user.goals.primary === 'maintenance' && 'Maintain current weight'}
                {user.goals.primary === 'muscleGain' && 'Build muscle while in ketosis'}
              </Text>
              <Text style={styles.goalTimeline}>
                Target timeline: {user.goals.timeline} weeks
              </Text>
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.resultCard}>
            <Text style={styles.cardTitle}>What's Next?</Text>
            <View style={styles.nextSteps}>
              <View style={styles.step}>
                <Text style={styles.stepIcon}>📊</Text>
                <Text style={styles.stepText}>Start tracking your daily macros</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepIcon}>⏰</Text>
                <Text style={styles.stepText}>Begin your fasting journey</Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepIcon}>📈</Text>
                <Text style={styles.stepText}>Monitor your progress</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Complete Button */}
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Start My Journey</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4a5568',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    gap: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#48bb78',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  macroItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48bb78',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  macroPercentage: {
    fontSize: 12,
    color: '#718096',
  },
  goalSummary: {
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  goalTimeline: {
    fontSize: 14,
    color: '#718096',
  },
  nextSteps: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    fontSize: 20,
  },
  stepText: {
    fontSize: 16,
    color: '#4a5568',
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#48bb78',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});