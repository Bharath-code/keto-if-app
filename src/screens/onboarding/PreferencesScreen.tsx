import React, { useState } from 'react';
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

type PreferencesScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Preferences'>;
};

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useUserStore();
  
  const [fastingExperience, setFastingExperience] = useState<'beginner' | 'intermediate' | 'advanced'>(
    user?.preferences.fastingExperience || 'beginner'
  );
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    user?.preferences.dietaryRestrictions || []
  );
  const [preferredMealTimes, setPreferredMealTimes] = useState<string[]>(
    user?.preferences.preferredMealTimes || []
  );

  const experienceLevels = [
    {
      key: 'beginner',
      title: 'Beginner',
      description: 'New to intermittent fasting',
      icon: '🌱',
    },
    {
      key: 'intermediate',
      title: 'Intermediate',
      description: 'Some experience with fasting',
      icon: '🌿',
    },
    {
      key: 'advanced',
      title: 'Advanced',
      description: 'Experienced with various fasting protocols',
      icon: '🌳',
    },
  ];

  const restrictions = [
    'Dairy-free',
    'Nut-free',
    'Egg-free',
    'Shellfish-free',
    'Vegetarian',
    'Pescatarian',
    'Halal',
    'Kosher',
  ];

  const mealTimes = [
    'Early Morning (6-8 AM)',
    'Morning (8-10 AM)',
    'Late Morning (10-12 PM)',
    'Lunch (12-2 PM)',
    'Afternoon (2-4 PM)',
    'Early Evening (4-6 PM)',
    'Evening (6-8 PM)',
    'Late Evening (8-10 PM)',
  ];

  const toggleRestriction = (restriction: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const toggleMealTime = (mealTime: string) => {
    setPreferredMealTimes(prev =>
      prev.includes(mealTime)
        ? prev.filter(m => m !== mealTime)
        : [...prev, mealTime]
    );
  };

  const handleContinue = () => {
    // Update user profile
    updateUser({
      preferences: {
        fastingExperience,
        dietaryRestrictions,
        preferredMealTimes,
        dislikedFoods: user?.preferences.dislikedFoods || [],
      },
    });

    navigation.navigate('Complete');
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
          <Text style={styles.title}>Your preferences</Text>
          <Text style={styles.subtitle}>
            Help us personalize your experience
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.progressStepActive]} />
            <View style={[styles.progressStep, styles.progressStepActive]} />
            <View style={[styles.progressStep, styles.progressStepActive]} />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Fasting Experience */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fasting Experience</Text>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.experienceOption,
                  fastingExperience === level.key && styles.experienceOptionActive,
                ]}
                onPress={() => setFastingExperience(level.key as any)}
              >
                <Text style={styles.experienceIcon}>{level.icon}</Text>
                <View style={styles.experienceContent}>
                  <Text
                    style={[
                      styles.experienceTitle,
                      fastingExperience === level.key && styles.experienceTitleActive,
                    ]}
                  >
                    {level.title}
                  </Text>
                  <Text
                    style={[
                      styles.experienceDescription,
                      fastingExperience === level.key && styles.experienceDescriptionActive,
                    ]}
                  >
                    {level.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    fastingExperience === level.key && styles.radioButtonActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Dietary Restrictions */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dietary Restrictions (Optional)</Text>
            <Text style={styles.sublabel}>Select any that apply to you</Text>
            <View style={styles.tagContainer}>
              {restrictions.map((restriction) => (
                <TouchableOpacity
                  key={restriction}
                  style={[
                    styles.tag,
                    dietaryRestrictions.includes(restriction) && styles.tagActive,
                  ]}
                  onPress={() => toggleRestriction(restriction)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      dietaryRestrictions.includes(restriction) && styles.tagTextActive,
                    ]}
                  >
                    {restriction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preferred Meal Times */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preferred Meal Times (Optional)</Text>
            <Text style={styles.sublabel}>When do you usually like to eat?</Text>
            <View style={styles.tagContainer}>
              {mealTimes.map((mealTime) => (
                <TouchableOpacity
                  key={mealTime}
                  style={[
                    styles.tag,
                    preferredMealTimes.includes(mealTime) && styles.tagActive,
                  ]}
                  onPress={() => toggleMealTime(mealTime)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      preferredMealTimes.includes(mealTime) && styles.tagTextActive,
                    ]}
                  >
                    {mealTime}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
  },
  experienceOption: {
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
  experienceOptionActive: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  experienceIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  experienceContent: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  experienceTitleActive: {
    color: '#48bb78',
  },
  experienceDescription: {
    fontSize: 14,
    color: '#718096',
  },
  experienceDescriptionActive: {
    color: '#38a169',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  tagActive: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  tagText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  tagTextActive: {
    color: '#48bb78',
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