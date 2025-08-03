import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';

type GoalsScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Goals'>;
};

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useUserStore();
  
  const [primaryGoal, setPrimaryGoal] = useState<'weightLoss' | 'maintenance' | 'muscleGain'>(
    user?.goals.primary || 'weightLoss'
  );
  const [timeline, setTimeline] = useState(user?.goals.timeline || 12);
  const [weeklyTarget, setWeeklyTarget] = useState(user?.goals.weeklyWeightLossTarget || 0.5);

  const goals = [
    {
      key: 'weightLoss',
      title: 'Weight Loss',
      description: 'Lose weight and improve body composition',
      icon: '📉',
    },
    {
      key: 'maintenance',
      title: 'Maintenance',
      description: 'Maintain current weight and improve health',
      icon: '⚖️',
    },
    {
      key: 'muscleGain',
      title: 'Muscle Gain',
      description: 'Build muscle while staying in ketosis',
      icon: '💪',
    },
  ];

  const timelines = [
    { weeks: 8, label: '2 months' },
    { weeks: 12, label: '3 months' },
    { weeks: 16, label: '4 months' },
    { weeks: 24, label: '6 months' },
    { weeks: 52, label: '1 year' },
  ];

  const weeklyTargets = [
    { value: 0.25, label: '0.25 kg/week', description: 'Slow and steady' },
    { value: 0.5, label: '0.5 kg/week', description: 'Moderate pace' },
    { value: 0.75, label: '0.75 kg/week', description: 'Aggressive' },
    { value: 1.0, label: '1 kg/week', description: 'Very aggressive' },
  ];

  const handleContinue = () => {
    // Update user profile
    updateUser({
      goals: {
        primary: primaryGoal,
        timeline,
        weeklyWeightLossTarget: weeklyTarget,
      },
    });

    navigation.navigate('Preferences');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>What's your goal?</Text>
          <Text style={styles.subtitle}>
            We'll customize your macro targets based on your objectives
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.progressStepActive]} />
            <View style={[styles.progressStep, styles.progressStepActive]} />
            <View style={styles.progressStep} />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Primary Goal */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Primary Goal</Text>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={[
                  styles.goalOption,
                  primaryGoal === goal.key && styles.goalOptionActive,
                ]}
                onPress={() => setPrimaryGoal(goal.key as any)}
              >
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <View style={styles.goalContent}>
                  <Text
                    style={[
                      styles.goalTitle,
                      primaryGoal === goal.key && styles.goalTitleActive,
                    ]}
                  >
                    {goal.title}
                  </Text>
                  <Text
                    style={[
                      styles.goalDescription,
                      primaryGoal === goal.key && styles.goalDescriptionActive,
                    ]}
                  >
                    {goal.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    primaryGoal === goal.key && styles.radioButtonActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Timeline */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Timeline</Text>
            <View style={styles.timelineContainer}>
              {timelines.map((item) => (
                <TouchableOpacity
                  key={item.weeks}
                  style={[
                    styles.timelineOption,
                    timeline === item.weeks && styles.timelineOptionActive,
                  ]}
                  onPress={() => setTimeline(item.weeks)}
                >
                  <Text
                    style={[
                      styles.timelineText,
                      timeline === item.weeks && styles.timelineTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weekly Target (only for weight loss) */}
          {primaryGoal === 'weightLoss' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weekly Weight Loss Target</Text>
              {weeklyTargets.map((target) => (
                <TouchableOpacity
                  key={target.value}
                  style={[
                    styles.targetOption,
                    weeklyTarget === target.value && styles.targetOptionActive,
                  ]}
                  onPress={() => setWeeklyTarget(target.value)}
                >
                  <View style={styles.targetContent}>
                    <Text
                      style={[
                        styles.targetTitle,
                        weeklyTarget === target.value && styles.targetTitleActive,
                      ]}
                    >
                      {target.label}
                    </Text>
                    <Text
                      style={[
                        styles.targetDescription,
                        weeklyTarget === target.value && styles.targetDescriptionActive,
                      ]}
                    >
                      {target.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      weeklyTarget === target.value && styles.radioButtonActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4a5568',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#48bb78',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  goalOptionActive: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  goalTitleActive: {
    color: '#48bb78',
  },
  goalDescription: {
    fontSize: 14,
    color: '#718096',
  },
  goalDescriptionActive: {
    color: '#38a169',
  },
  timelineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timelineOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  timelineOptionActive: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  timelineText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  timelineTextActive: {
    color: '#48bb78',
  },
  targetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  targetOptionActive: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  targetContent: {
    flex: 1,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  targetTitleActive: {
    color: '#48bb78',
  },
  targetDescription: {
    fontSize: 14,
    color: '#718096',
  },
  targetDescriptionActive: {
    color: '#38a169',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  radioButtonActive: {
    borderColor: '#48bb78',
    backgroundColor: '#48bb78',
  },
  continueButton: {
    backgroundColor: '#48bb78',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});