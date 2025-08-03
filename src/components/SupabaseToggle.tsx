import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useUserStore } from '../store/userStore';

export const SupabaseToggle: React.FC = () => {
  const { useSupabase, toggleSupabase } = useUserStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Use Supabase Backend</Text>
      <Switch
        value={useSupabase}
        onValueChange={toggleSupabase}
        trackColor={{ false: '#767577', true: '#48bb78' }}
        thumbColor={useSupabase ? '#f4f3f4' : '#f4f3f4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
});