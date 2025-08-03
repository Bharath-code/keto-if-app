import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useUserStore } from '../store/userStore';
import { calculateUserMetabolism } from '../utils/metabolismCalculations';
import { SupabaseToggle } from '../components/SupabaseToggle';

export const ProfileScreen: React.FC = () => {
  const { user, updateUser, logout, macroTargets } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  if (!user) {
    return null;
  }

  const metabolismData = calculateUserMetabolism(user);

  const handleEdit = () => {
    setEditedUser(user);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedUser) return;

    // Validate inputs
    if (editedUser.personalInfo.age < 13 || editedUser.personalInfo.age > 120) {
      Alert.alert('Invalid Age', 'Please enter an age between 13 and 120');
      return;
    }

    if (editedUser.personalInfo.height < 100 || editedUser.personalInfo.height > 250) {
      Alert.alert('Invalid Height', 'Please enter a height between 100 and 250 cm');
      return;
    }

    if (editedUser.personalInfo.currentWeight < 30 || editedUser.personalInfo.currentWeight > 300) {
      Alert.alert('Invalid Weight', 'Please enter a weight between 30 and 300 kg');
      return;
    }

    updateUser(editedUser);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const updatePersonalInfo = (field: string, value: any) => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      personalInfo: {
        ...editedUser.personalInfo,
        [field]: value,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Supabase Toggle */}
        <SupabaseToggle />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerButtons}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subscription</Text>
            <Text style={[styles.infoValue, styles.subscriptionBadge]}>
              {user.subscription.tier.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedUser?.personalInfo.age.toString()}
                onChangeText={(text) => updatePersonalInfo('age', parseInt(text) || 0)}
                keyboardType="numeric"
                maxLength={3}
              />
            ) : (
              <Text style={styles.infoValue}>{user.personalInfo.age} years</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>
              {user.personalInfo.gender.charAt(0).toUpperCase() + user.personalInfo.gender.slice(1)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedUser?.personalInfo.height.toString()}
                onChangeText={(text) => updatePersonalInfo('height', parseInt(text) || 0)}
                keyboardType="numeric"
                maxLength={3}
              />
            ) : (
              <Text style={styles.infoValue}>{user.personalInfo.height} cm</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Weight</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedUser?.personalInfo.currentWeight.toString()}
                onChangeText={(text) => updatePersonalInfo('currentWeight', parseFloat(text) || 0)}
                keyboardType="numeric"
                maxLength={5}
              />
            ) : (
              <Text style={styles.infoValue}>{user.personalInfo.currentWeight} kg</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Target Weight</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedUser?.personalInfo.targetWeight.toString()}
                onChangeText={(text) => updatePersonalInfo('targetWeight', parseFloat(text) || 0)}
                keyboardType="numeric"
                maxLength={5}
              />
            ) : (
              <Text style={styles.infoValue}>{user.personalInfo.targetWeight} kg</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activity Level</Text>
            <Text style={styles.infoValue}>
              {user.personalInfo.activityLevel.charAt(0).toUpperCase() + user.personalInfo.activityLevel.slice(1)}
            </Text>
          </View>
        </View>

        {/* Metabolism Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Metabolism</Text>
          <View style={styles.metabolismGrid}>
            <View style={styles.metabolismItem}>
              <Text style={styles.metabolismValue}>{metabolismData.bmr}</Text>
              <Text style={styles.metabolismLabel}>BMR</Text>
              <Text style={styles.metabolismUnit}>cal/day</Text>
            </View>
            <View style={styles.metabolismItem}>
              <Text style={styles.metabolismValue}>{metabolismData.tdee}</Text>
              <Text style={styles.metabolismLabel}>TDEE</Text>
              <Text style={styles.metabolismUnit}>cal/day</Text>
            </View>
          </View>
        </View>

        {/* Macro Targets */}
        {macroTargets && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Macro Targets</Text>
            <View style={styles.macroGrid}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macroTargets.calories}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macroTargets.carbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macroTargets.protein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{macroTargets.fat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Primary Goal</Text>
            <Text style={styles.infoValue}>
              {user.goals.primary === 'weightLoss' && 'Weight Loss'}
              {user.goals.primary === 'maintenance' && 'Maintenance'}
              {user.goals.primary === 'muscleGain' && 'Muscle Gain'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Timeline</Text>
            <Text style={styles.infoValue}>{user.goals.timeline} weeks</Text>
          </View>
          {user.goals.primary === 'weightLoss' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weekly Target</Text>
              <Text style={styles.infoValue}>{user.goals.weeklyWeightLossTarget} kg/week</Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#48bb78',
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#48bb78',
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#4a5568',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  infoLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '600',
  },
  subscriptionBadge: {
    backgroundColor: '#48bb78',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    minWidth: 80,
    textAlign: 'right',
  },
  metabolismGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metabolismItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  metabolismValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48bb78',
    marginBottom: 4,
  },
  metabolismLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  metabolismUnit: {
    fontSize: 12,
    color: '#718096',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48bb78',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
