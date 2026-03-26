import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';

export default function UserTypeScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();
  const { updateUser } = useAuth();

  const handleContinue = () => {
    if (selectedType) {
      updateUser({ userType: selectedType });
      router.replace('/profile-setup');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>I am a...</Text>
        <Text style={styles.subtitle}>Choose your account type</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'owner' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedType('owner')}
          >
            <Text style={styles.optionIcon}>🏠</Text>
            <Text style={styles.optionTitle}>Room Owner</Text>
            <Text style={styles.optionDescription}>
              I have a room to rent out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'seeker' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedType('seeker')}
          >
            <Text style={styles.optionIcon}>🔍</Text>
            <Text style={styles.optionTitle}>Room Seeker</Text>
            <Text style={styles.optionDescription}>
              I'm looking for a room
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, !selectedType && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#E6F7F9',
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
