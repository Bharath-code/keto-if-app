import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { useUserStore } from '../../store/userStore';

type PersonalInfoScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'PersonalInfo'>;
};

export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useUserStore();
  
  const [age, setAge] = useState(user?.personalInfo.age?.toString() || '');
  const [height, setHeight] = useState(user?.personalInfo.height?.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(user?.personalInfo.currentWeight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(user?.personalInfo.targetWeight?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user?.personalInfo.gender || 'male');
  const [activityLevel, setActivityLevel] = useState(user?.personalInfo.activityLevel || 'moderate');

  const activityLevels = [
    { key: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
    { key: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
    { key: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
    { key: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
    { key: 'very_active', label: 'Very Active', description: 'Very hard exercise & physical job' },
  ];

  const handleContinue = () => {
    // Validate inputs
    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const currentWeightNum = parseFloat(currentWeight);
    const targetWeightNum = parseFloat(targetWeight);

    if (!age || ageNum < 13 || ageNum > 120) {
      Alert.alert('Invalid Age', 'Please enter an age between 13 and 120');
      return;
    }

    if (!height || heightNum < 100 || heightNum > 250) {
      Alert.alert('Invalid Height', 'Please enter a height between 100 and 250 cm');
      return;
    }

    if (!currentWeight || currentWeightNum < 30 || currentWeightNum > 300) {
      Alert.alert('Invalid Weight', 'Please enter a current weight between 30 and 300 kg');
      return;
    }

    if (!targetWeight || targetWeightNum < 30 || targetWeightNum > 300) {
      Alert.alert('Invalid Target Weight', 'Please enter a target weight between 30 and 300 kg');
      return;
    }

    // Update user profile
    updateUser({
      personalInfo: {
        age: ageNum,
        height: heightNum,
        currentWeight: currentWeightNum,
        targetWeight: targetWeightNum,
        gender,
        activityLevel: activityLevel as any,
      },
    });

    navigation.navigate('Goals');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            This helps us calculate your personalized macro targets
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.progressStepActive]} />
            <View style={styles.progressStep} />
            <View style={styles.progressStep} />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Age */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.optionContainer}>
              {['male', 'female', 'other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    gender === option && styles.optionButtonActive,
                  ]}
                  onPress={() => setGender(option as any)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      gender === option && styles.optionTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Height */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="Enter your height in cm"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* Current Weight */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              placeholder="Enter your current weight in kg"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* Target Weight */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={targetWeight}
              onChangeText={setTargetWeight}
              placeholder="Enter your target weight in kg"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* Activity Level */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Activity Level</Text>
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.activityOption,
                  activityLevel === level.key && styles.activityOptionActive,
                ]}
                onPress={() => setActivityLevel(level.key as any)}
              >
                <View style={styles.activityOptionContent}>
                  <Text
                    style={[
                      styles.activityOptionTitle,
                      activityLevel === level.key && styles.activityOptionTitleActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text
                    style={[
                      styles.activityOptionDescription,
                      activityLevel === level.key && styles.activityOptionDescriptionActive,
                    ]}
                  >
                    {level.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    activityLevel === level.key && styles.radioButtonActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
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
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: 'white',
  },
  optionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  optionText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#48bb78',
  },
  activityOption: {
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
  activityOptionActive: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  activityOptionContent: {
    flex: 1,
  },
  activityOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  activityOptionTitleActive: {
    color: '#48bb78',
  },
  activityOptionDescription: {
    fontSize: 14,
    color: '#718096',
  },
  activityOptionDescriptionActive: {
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