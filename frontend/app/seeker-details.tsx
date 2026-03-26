import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

interface Seeker {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  area: string;
  images: string[];
  party: boolean;
  smoking: boolean;
  alcohol: boolean;
  food: string;
  pets: boolean;
  cleaning: string;
  description: string;
  compatibility?: number;
}

export default function SeekerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth();
  const router = useRouter();

  const [seeker, setSeeker] = useState<Seeker | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchSeekerDetails();
  }, [id]);

  const fetchSeekerDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/seekers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const foundSeeker = response.data.find((s: Seeker) => s.userId === id);
      setSeeker(foundSeeker);
    } catch (error) {
      console.error('Error fetching seeker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (seeker?.phoneNumber) {
      Linking.openURL(`tel:${seeker.phoneNumber}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!seeker) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Roommate not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery */}
        {seeker.images && seeker.images.length > 0 ? (
          <View style={styles.galleryContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {seeker.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            <View style={styles.imagePagination}>
              {seeker.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <View style={styles.largeAvatar}>
              <Text style={styles.largeAvatarText}>
                {seeker.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.backButtonAlt} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Seeker Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{seeker.name}</Text>
            {seeker.compatibility !== undefined && (
              <View style={styles.compatibilityBadge}>
                <Ionicons name="heart" size={16} color={Colors.secondary} />
                <Text style={styles.compatibilityText}>{seeker.compatibility}% Match</Text>
              </View>
            )}
          </View>

          <View style={styles.contactSection}>
            <View style={styles.contactRow}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{seeker.area}</Text>
            </View>

            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call" size={20} color={Colors.primary} />
              <Text style={[styles.contactText, styles.phoneText]}>{seeker.phoneNumber}</Text>
            </TouchableOpacity>
          </View>

          {seeker.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{seeker.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle Preferences</Text>
            
            <View style={styles.preferencesGrid}>
              <View style={[styles.preferenceCard, seeker.party && styles.preferenceCardActive]}>
                <Ionicons
                  name={seeker.party ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={seeker.party ? Colors.success : Colors.error}
                />
                <Text style={styles.preferenceLabel}>Party</Text>
              </View>

              <View style={[styles.preferenceCard, seeker.smoking && styles.preferenceCardActive]}>
                <Ionicons
                  name={seeker.smoking ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={seeker.smoking ? Colors.success : Colors.error}
                />
                <Text style={styles.preferenceLabel}>Smoking</Text>
              </View>

              <View style={[styles.preferenceCard, seeker.alcohol && styles.preferenceCardActive]}>
                <Ionicons
                  name={seeker.alcohol ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={seeker.alcohol ? Colors.success : Colors.error}
                />
                <Text style={styles.preferenceLabel}>Alcohol</Text>
              </View>

              <View style={[styles.preferenceCard, seeker.pets && styles.preferenceCardActive]}>
                <Ionicons
                  name={seeker.pets ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={seeker.pets ? Colors.success : Colors.error}
                />
                <Text style={styles.preferenceLabel}>Pets</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Food:</Text>
              <Text style={styles.infoValue}>
                {seeker.food.charAt(0).toUpperCase() + seeker.food.slice(1)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cleaning:</Text>
              <Text style={styles.infoValue}>
                {seeker.cleaning.charAt(0).toUpperCase() + seeker.cleaning.slice(1)}
              </Text>
            </View>
          </View>

          {seeker.compatibility !== undefined && (
            <View style={styles.matchSection}>
              <Text style={styles.sectionTitle}>Compatibility Analysis</Text>
              <View style={styles.compatibilityBar}>
                <View
                  style={[
                    styles.compatibilityFill,
                    { width: `${seeker.compatibility}%` },
                  ]}
                />
              </View>
              <Text style={styles.compatibilityDescription}>
                {seeker.compatibility >= 80
                  ? 'Excellent match! Your lifestyles are very compatible.'
                  : seeker.compatibility >= 60
                  ? 'Good match! You share several preferences.'
                  : seeker.compatibility >= 40
                  ? 'Moderate match. Some differences in lifestyle.'
                  : 'Low match. Consider if this works for you.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 24,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  galleryContainer: {
    position: 'relative',
  },
  image: {
    width: width,
    height: 300,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: Colors.secondary,
    width: 24,
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageContainer: {
    backgroundColor: Colors.background,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  backButtonAlt: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  compatibilityText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  contactSection: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  phoneText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  preferenceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preferenceCardActive: {
    borderColor: Colors.success,
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
    paddingHorizontal: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    marginBottom: 8,
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
  matchSection: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  compatibilityBar: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  compatibilityFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 6,
  },
  compatibilityDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
