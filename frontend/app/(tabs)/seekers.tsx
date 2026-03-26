import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

interface Seeker {
  userId: string;
  name: string;
  phoneNumber: string;
  area: string;
  party: boolean;
  smoking: boolean;
  alcohol: boolean;
  food: string;
  pets: boolean;
  cleaning: string;
  description: string;
  compatibility?: number;
}

export default function SeekersScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchArea, setSearchArea] = useState('');

  const fetchSeekers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchArea) params.append('area', searchArea);

      const response = await axios.get(`${BACKEND_URL}/api/seekers?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSeekers(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch seekers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeekers();
  }, []);

  const renderSeekerCard = ({ item }: { item: Seeker }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          {item.area && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.textSecondary} />
              <Text style={styles.cardArea}>{item.area}</Text>
            </View>
          )}
          {item.phoneNumber && (
            <View style={styles.locationRow}>
              <Ionicons name="call" size={14} color={Colors.textSecondary} />
              <Text style={styles.cardPhone}>{item.phoneNumber}</Text>
            </View>
          )}
        </View>
        {item.compatibility !== undefined && (
          <View style={styles.compatibilityBadge}>
            <Text style={styles.compatibilityText}>{item.compatibility}%</Text>
          </View>
        )}
      </View>

      {item.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.preferencesRow}>
        {item.party && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Party</Text>
          </View>
        )}
        {item.smoking && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Smoking</Text>
          </View>
        )}
        {item.pets && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Pets</Text>
          </View>
        )}
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.food}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.cleaning}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search by area..."
            value={searchArea}
            onChangeText={setSearchArea}
          />
          <TouchableOpacity style={styles.filterButton} onPress={fetchSeekers}>
            <Ionicons name="search" size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={seekers}
        renderItem={renderSeekerCard}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSeekers} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No roommates found</Text>
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
  filterButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardArea: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  compatibilityBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compatibilityText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  preferencesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
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
