import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/auth');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phoneNumber && (
          <View style={styles.contactRow}>
            <Ionicons name="call" size={16} color={Colors.textSecondary} />
            <Text style={styles.contactText}>{user.phoneNumber}</Text>
          </View>
        )}
        {user?.area && (
          <View style={styles.contactRow}>
            <Ionicons name="location" size={16} color={Colors.textSecondary} />
            <Text style={styles.contactText}>{user.area}</Text>
          </View>
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {user?.userType === 'owner' ? '🏠 Room Owner' : '🔍 Room Seeker'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lifestyle Preferences</Text>

        <View style={styles.preferenceGrid}>
          <View style={styles.preferenceCard}>
            <Ionicons
              name={user?.party ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={user?.party ? Colors.success : Colors.error}
            />
            <Text style={styles.preferenceLabel}>Party</Text>
          </View>

          <View style={styles.preferenceCard}>
            <Ionicons
              name={user?.smoking ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={user?.smoking ? Colors.success : Colors.error}
            />
            <Text style={styles.preferenceLabel}>Smoking</Text>
          </View>

          <View style={styles.preferenceCard}>
            <Ionicons
              name={user?.alcohol ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={user?.alcohol ? Colors.success : Colors.error}
            />
            <Text style={styles.preferenceLabel}>Alcohol</Text>
          </View>

          <View style={styles.preferenceCard}>
            <Ionicons
              name={user?.pets ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={user?.pets ? Colors.success : Colors.error}
            />
            <Text style={styles.preferenceLabel}>Pets</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Food:</Text>
          <Text style={styles.infoValue}>
            {user?.food?.charAt(0).toUpperCase() + user?.food?.slice(1)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cleaning:</Text>
          <Text style={styles.infoValue}>
            {user?.cleaning?.charAt(0).toUpperCase() + user?.cleaning?.slice(1)}
          </Text>
        </View>

        {user?.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.infoLabel}>About Me:</Text>
            <Text style={styles.description}>{user.description}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  typeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  typeBadgeText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  preferenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  preferenceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
