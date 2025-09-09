import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Conditional import for LinearGradient with fallback
let LinearGradient;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  LinearGradient = ({ children, colors, style, ...props }) => (
    <View style={[style, { backgroundColor: colors?.[0] || '#6366f1' }]} {...props}>
      {children}
    </View>
  );
}

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorsData, setDoctorsData] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [showNoSpecialistFound, setShowNoSpecialistFound] = useState(false);

  // Fetch doctors from Firebase on mount
  useEffect(() => {
    const loadDoctorsData = async () => {
      try {
        setLoadingDoctors(true);
        const response = await fetch(
          'https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/doctors.json'
        );
        const doctorsResponse = await response.json();
        if (doctorsResponse) {
          const doctorsArray = Object.keys(doctorsResponse).map(key => ({
            id: key,
            ...doctorsResponse[key],
            specialty: (doctorsResponse[key].specialization || doctorsResponse[key].specialty || 'General Medicine').trim(),
          }));
          // Only approved doctors
          const approvedDoctors = doctorsArray.filter(doctor =>
            doctor.approvedAt && doctor.approvedAt !== null
          );
          setDoctorsData(approvedDoctors);
        } else {
          setDoctorsData([]);
        }
      } catch (error) {
        setDoctorsData([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctorsData();
  }, []);

  // Search logic (same as home)
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) {
      setFilteredDoctors([]);
      setSearchActive(false);
      setShowNoSpecialistFound(false);
      return;
    }
    try {
      const response = await fetch('http://10.2.8.64:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: searchQuery }),
      });
      const data = await response.json();
      if (data.doctor_specialist) {
        setLoadingDoctors(true);
        const doctorsResponse = await fetch(
          'https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/doctors.json'
        );
        const doctorsJson = await doctorsResponse.json();
        if (doctorsJson) {
          const doctorsArray = Object.keys(doctorsJson).map(key => ({
            id: key,
            ...doctorsJson[key],
            specialty: (doctorsJson[key].specialization || doctorsJson[key].specialty || 'General Medicine').trim(),
          }));
          const specialist = data.doctor_specialist.trim().toLowerCase();
          const filtered = doctorsArray.filter(doc =>
            doc.specialty &&
            doc.specialty.trim().toLowerCase() === specialist &&
            doc.approvedAt && doc.approvedAt !== null
          );
          setFilteredDoctors(filtered);
          setSearchActive(true);
          setShowNoSpecialistFound(filtered.length === 0);
        } else {
          setFilteredDoctors([]);
          setShowNoSpecialistFound(true);
        }
        setLoadingDoctors(false);
      } else {
        setFilteredDoctors([]);
        setShowNoSpecialistFound(true);
      }
    } catch (error) {
      setFilteredDoctors([]);
      setShowNoSpecialistFound(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredDoctors([]);
    setShowNoSpecialistFound(false);
    setSearchActive(false);
  };

  const renderDoctorCard = ({ item }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorInfo}>
        <View style={styles.avatar}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={32} color="#667eea" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.detailsBtn}>
        <Text style={styles.detailsBtnText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Services</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <View style={styles.searchBarSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors by symptoms..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={searchActive ? handleClearSearch : handleSearchSubmit}
        >
          <AntDesign
            name={searchActive ? "close" : "search1"}
            size={18}
            color="#667eea"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Popular Doctors</Text>
      {loadingDoctors ? (
        <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 30 }} />
      ) : (
        <>
          {showNoSpecialistFound && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No specialist found. Showing all doctors.</Text>
            </View>
          )}
          <FlatList
            data={filteredDoctors.length > 0 ? filteredDoctors : doctorsData}
            renderItem={renderDoctorCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.doctorsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No doctors available</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 44,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  searchBarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    margin: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  doctorsList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.08)',
    padding: 16,
    marginBottom: 16,
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  detailsBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  detailsBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
});

export default ExploreScreen;
