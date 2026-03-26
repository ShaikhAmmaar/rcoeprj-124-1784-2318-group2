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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

interface Room {
  roomId: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  images: string[];
  rent: number;
  location: string;
  rules: string;
  description: string;
  compatibility?: number;
}

export default function RoomDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isSeeker = user?.userType === 'seeker';

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoom(response.data);
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Room not found</Text>
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
        {room.images && room.images.length > 0 && (
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
              {room.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            <View style={styles.imagePagination}>
              {room.images.map((_, index) => (
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
        )}

        {/* Room Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.rent}>₹{room.rent}/month</Text>
            {isSeeker && room.compatibility !== undefined && (
              <View style={styles.compatibilityBadge}>
                <Ionicons name="heart" size={16} color={Colors.secondary} />
                <Text style={styles.compatibilityText}>{room.compatibility}% Match</Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.location}>{room.location}</Text>
          </View>

          {room.ownerName && (
            <View style={styles.ownerRow}>
              <Ionicons name="person" size={20} color={Colors.textSecondary} />
              <Text style={styles.ownerName}>Posted by {room.ownerName}</Text>
            </View>
          )}

          {room.ownerPhone && (
            <View style={styles.ownerRow}>
              <Ionicons name="call" size={20} color={Colors.primary} />
              <Text style={styles.ownerPhone}>{room.ownerPhone}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{room.description}</Text>
          </View>

          {room.rules && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>House Rules</Text>
              <Text style={styles.rules}>{room.rules}</Text>
            </View>
          )}

          {isSeeker && room.compatibility !== undefined && (
            <View style={styles.matchSection}>
              <Text style={styles.sectionTitle}>Compatibility Analysis</Text>
              <View style={styles.compatibilityBar}>
                <View
                  style={[
                    styles.compatibilityFill,
                    { width: `${room.compatibility}%` },
                  ]}
                />
              </View>
              <Text style={styles.compatibilityDescription}>
                {room.compatibility >= 80
                  ? 'Excellent match! Your lifestyles are very compatible.'
                  : room.compatibility >= 60
                  ? 'Good match! You share several preferences.'
                  : room.compatibility >= 40
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
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  location: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  ownerName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ownerPhone: {
    fontSize: 16,
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
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  rules: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
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
