import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ProfileSetupScreen() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [area, setArea] = useState('');
  const [party, setParty] = useState(false);
  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [food, setFood] = useState('veg');
  const [pets, setPets] = useState(false);
  const [cleaning, setCleaning] = useState('weekly');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isSeeker = user?.userType === 'seeker';

  const handleSubmit = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    if (isSeeker && !area) {
      Alert.alert('Error', 'Area/Location is required for seekers');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/users/profile`,
        {
          userType: user?.userType,
          phoneNumber,
          area: isSeeker ? area : '',
          party,
          smoking,
          alcohol,
          food,
          pets,
          cleaning,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateUser(response.data);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Set Up Your Profile</Text>
        <Text style={styles.subtitle}>Help us find your perfect match</Text>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            {isSeeker && (
              <TextInput
                style={styles.input}
                placeholder="Your Area/Location *"
                value={area}
                onChangeText={setArea}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle Preferences</Text>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Party</Text>
              <Switch
                value={party}
                onValueChange={setParty}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.secondary}
              />
            </View>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Smoking</Text>
              <Switch
                value={smoking}
                onValueChange={setSmoking}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.secondary}
              />
            </View>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Alcohol</Text>
              <Switch
                value={alcohol}
                onValueChange={setAlcohol}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.secondary}
              />
            </View>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Pets</Text>
              <Switch
                value={pets}
                onValueChange={setPets}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.secondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Preference</Text>
            <View style={styles.buttonGroup}>
              {['veg', 'non-veg', 'vegan'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    food === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => setFood(option)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      food === option && styles.optionButtonTextSelected,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cleaning Habits</Text>
            <View style={styles.buttonGroup}>
              {['daily', 'weekly', 'rarely'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    cleaning === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => setCleaning(option)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      cleaning === option && styles.optionButtonTextSelected,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}\
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About You</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell us a bit about yourself..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  form: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  preferenceLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: Colors.secondary,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
