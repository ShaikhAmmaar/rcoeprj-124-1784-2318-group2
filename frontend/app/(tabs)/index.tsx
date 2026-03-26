import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Room {
  roomId: string;
  ownerId: string;
  ownerName: string;
  images: string[];
  rent: number;
  location: string;
  rules: string;
  description: string;
  compatibility?: number;
}

export default function HomeScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');

  const isOwner = user?.userType === 'owner';

  const fetchRooms = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (minRent) params.append('minRent', minRent);
      if (maxRent) params.append('maxRent', maxRent);
      if (searchLocation) params.append('location', searchLocation);

      const response = await axios.get(`${BACKEND_URL}/api/rooms?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRooms(response.data);
      setFilteredRooms(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = () => {
    fetchRooms();
  };

  const renderRoomCard = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/room-details?id=${item.roomId}`)}
    >
      {item.images && item.images.length > 0 ? (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cardImage, styles.noImage]}>
          <Ionicons name="home" size={40} color={Colors.textSecondary} />
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardRent}>₹{item.rent}/month</Text>
          {!isOwner && item.compatibility !== undefined && (
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityText}>{item.compatibility}% Match</Text>
            </View>
          )}
        </View>

        <View style={styles.cardLocation}>
          <Ionicons name="location" size={16} color={Colors.textSecondary} />
          <Text style={styles.cardLocationText}>{item.location}</Text>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {isOwner && (
          <Text style={styles.ownerBadge}>Your Listing</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!isOwner && (
        <View style={styles.filterContainer}>
          <View style={styles.searchRow}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Search location..."
                value={searchLocation}
                onChangeText={setSearchLocation}
              />
            </View>
          </View>

          <View style={styles.rentRow}>
            <TextInput
              style={styles.rentInput}
              placeholder="Min Rent"
              value={minRent}
              onChangeText={setMinRent}
              keyboardType="numeric"
            />
            <Text style={styles.rentSeparator}>-</Text>
            <TextInput
              style={styles.rentInput}
              placeholder="Max Rent"
              value={maxRent}
              onChangeText={setMaxRent}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
              <Ionicons name="filter" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={filteredRooms}
        renderItem={renderRoomCard}
        keyExtractor={(item) => item.roomId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRooms} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {isOwner ? 'No rooms yet. Add your first room!' : 'No rooms available'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    backgroundColor: Colors.secondary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchRow: {
    marginBottom: 12,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rentInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  rentSeparator: {
    color: Colors.textSecondary,
    fontSize: 18,
  },
  filterButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  noImage: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardRent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  compatibilityBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compatibilityText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  cardLocationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  ownerBadge: {
    marginTop: 8,
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});
