import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, GRADIENTS, MEDICAL_CATEGORIES, DOCTORS_DATA, TOP_SEARCHES } from '../../constants';
import DoctorCard from '../../components/DoctorCard';
import CategoryCard from '../../components/CategoryCard';
import SearchBar from '../../components/SearchBar';

const { width } = Dimensions.get('window');

const ExploreScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const medicalCategories = MEDICAL_CATEGORIES;

  const topSearches = [
    'Neurosurgeon', 'Heart Failure', 'Gene Therapy', 'Diabetes Care',
    'Cancer Treatment', 'Mental Health', 'Pediatrics', 'Emergency Care'
  ];

  const filteredDoctors = DOCTORS_DATA.filter(doctor => 
    selectedCategory === 'All' || doctor.specialty === selectedCategory
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {medicalCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.name && styles.selectedCategoryCard
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
                  <FontAwesome5 name={category.icon} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.specialistCount}>{category.specialists} specialists</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Searches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Searches</Text>
          <View style={styles.topSearchesContainer}>
            {topSearches.map((search, index) => (
              <TouchableOpacity key={index} style={styles.searchTag}>
                <Text style={styles.searchTagText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Doctors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredDoctors.map((doctor) => (
            <TouchableOpacity 
              key={doctor.id} 
              style={styles.doctorListCard}
              onPress={() => router.push('/doctor-profile')}
            >
              <View style={styles.doctorListContent}>
                <View style={styles.doctorListLeft}>
                  <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{doctor.rating}</Text>
                  </View>
                  
                  <View style={styles.doctorListAvatar}>
                    <Ionicons name="person" size={28} color="white" />
                  </View>
                </View>
                
                <View style={styles.doctorListDetails}>
                  <Text style={styles.doctorListName}>{doctor.name}</Text>
                  <Text style={styles.doctorListSpecialty}>{doctor.specialty}</Text>
                  <Text style={styles.doctorListPrice}>${doctor.price}/session</Text>
                  
                  <View style={styles.availabilityInfo}>
                    <Text style={styles.availabilityLabel}>Availability • 3 slots</Text>
                    <View style={styles.availabilityDays}>
                      <Text style={styles.daySlot}>Mon 17</Text>
                      <Text style={styles.daySlot}>Tue 18</Text>
                      <Text style={styles.daySlot}>Wed 19</Text>
                      <Text style={[styles.daySlot, styles.selectedDaySlot]}>Thu 20</Text>
                      <Text style={styles.daySlot}>Fri 21</Text>
                      <Text style={styles.daySlot}>Sat 22</Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.favoriteButton}>
                  <Ionicons name="heart-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  selectedCategoryCard: {
    borderColor: '#4F46E5',
    backgroundColor: '#F0F9FF',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  specialistCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  topSearchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  searchTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  searchTagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  doctorListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  doctorListContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  doctorListLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
    marginLeft: 4,
  },
  doctorListAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorListDetails: {
    flex: 1,
  },
  doctorListName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  doctorListSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  doctorListPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 12,
  },
  availabilityInfo: {
    marginTop: 8,
  },
  availabilityLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  availabilityDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  daySlot: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  selectedDaySlot: {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
  },
  favoriteButton: {
    padding: 8,
  },
});

export default ExploreScreen;
