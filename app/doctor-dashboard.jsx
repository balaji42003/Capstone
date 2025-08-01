import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

let LinearGradient;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  LinearGradient = ({ children, colors, style, ...props }) => (
    <View style={[style, { backgroundColor: colors?.[0] || '#4ECDC4' }]} {...props}>
      {children}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const DoctorDashboard = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [doctorName, setDoctorName] = useState('Dr. User');
  const [doctorPhoto, setDoctorPhoto] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load doctor session data
    const loadDoctorData = async () => {
      try {
        const userSession = await AsyncStorage.getItem('userSession');
        if (userSession) {
          const userData = JSON.parse(userSession);
          setDoctorName(userData.name || 'Dr. User');
          setDoctorPhoto(userData.photoURL || null);
        }
      } catch (error) {
        console.error('Error loading doctor data:', error);
      }
    };

    loadDoctorData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      router.replace('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Circular Quick Actions
  const quickActions = [
    { 
      id: 1, 
      title: 'Patients',
      icon: 'people',
      iconType: 'ionicons',
      colors: ['#4ECDC4', '#44A08D'],
      route: '/doctor/patients'
    },
    { 
      id: 2, 
      title: 'Calendar',
      icon: 'calendar',
      iconType: 'ionicons',
      colors: ['#667eea', '#764ba2'],
      route: '/doctor/appointments'
    },
    { 
      id: 3, 
      title: 'Video Call',
      icon: 'videocam',
      iconType: 'ionicons',
      colors: ['#f093fb', '#f5576c'],
      route: '/video-call'
    },
    { 
      id: 4, 
      title: 'Records',
      icon: 'document-text',
      iconType: 'ionicons',
      colors: ['#4facfe', '#00f2fe'],
      route: '/doctor/records'
    }
  ];

  const menuItems = [
    { 
      id: 1, 
      title: 'Lab Reports', 
      icon: 'flask',
      iconType: 'ionicons',
      color: '#667eea'
    },
    { 
      id: 2, 
      title: 'Prescriptions', 
      icon: 'medical',
      iconType: 'ionicons',
      color: '#f093fb'
    },
    { 
      id: 3, 
      title: 'Analytics', 
      icon: 'analytics',
      iconType: 'ionicons',
      color: '#4facfe'
    },
    { 
      id: 4, 
      title: 'Emergency', 
      icon: 'warning',
      iconType: 'ionicons',
      color: '#ff6b6b'
    }
  ];

  // Compact stats
  const todayStats = [
    { label: 'Patients', value: '24', icon: 'people', color: '#4ECDC4' },
    { label: 'Appointments', value: '8', icon: 'calendar', color: '#667eea' },
    { label: 'Revenue', value: '₹12K', icon: 'wallet', color: '#f093fb' },
    { label: 'Rating', value: '4.9', icon: 'star', color: '#fbbf24' }
  ];

  const upcomingAppointments = [
    { id: 1, name: 'Sarah Johnson', time: '10:30 AM', type: 'Consultation', avatar: 'S' },
    { id: 2, name: 'Mike Chen', time: '11:15 AM', type: 'Follow-up', avatar: 'M' },
    { id: 3, name: 'Emma Davis', time: '2:00 PM', type: 'Check-up', avatar: 'E' }
  ];

  // Bottom navigation tabs
  const bottomTabs = [
    { id: 'Dashboard', icon: 'grid', label: 'Dashboard' },
    { id: 'Patients', icon: 'people', label: 'Patients' },
    { id: 'Schedule', icon: 'calendar', label: 'Schedule' },
    { id: 'Profile', icon: 'person', label: 'Profile' }
  ];

  const renderIcon = (iconName, iconType, size = 24, color = 'white') => {
    switch (iconType) {
      case 'material':
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      case 'fontawesome':
        return <FontAwesome5 name={iconName} size={size} color={color} />;
      default:
        return <Ionicons name={iconName} size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" translucent={false} />
      {/* Professional Header */}
      <LinearGradient
        colors={['#44A08D','#4ECDC4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatarContainer}>
              {doctorPhoto ? (
                <Image 
                  source={{ uri: doctorPhoto }} 
                  style={styles.doctorProfileImage}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.avatarGradient}
                >
                  <FontAwesome5 name="user-md" size={20} color="white" />
                </LinearGradient>
              )}
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{doctorName}</Text>
              <Text style={styles.specialization}>Medical Professional</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={20} color="white" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Circular Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.circularActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.circularActionContainer}>
                <LinearGradient
                  colors={action.colors}
                  style={styles.circularAction}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={action.icon} size={24} color="white" />
                </LinearGradient>
                <Text style={styles.circularActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Compact Statistics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.compactStatsGrid}>
            {todayStats.map((stat, index) => (
              <View key={index} style={styles.compactStatCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon} size={16} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.appointmentsContainer}>
            {upcomingAppointments.map((appointment) => (
              <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentInfo}>
                  <View style={styles.patientAvatar}>
                    <Text style={styles.avatarText}>{appointment.avatar}</Text>
                  </View>
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.patientName}>{appointment.name}</Text>
                    <Text style={styles.appointmentType}>{appointment.type}</Text>
                  </View>
                </View>
                <View style={styles.appointmentTime}>
                  <Text style={styles.timeText}>{appointment.time}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Medical Tools Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Tools</Text>
          <View style={styles.toolsGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.toolCard}>
                <View style={[styles.toolIcon, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.toolTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {bottomTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.bottomNavItem, activeTab === tab.id && styles.activeNavItem]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? '#4ECDC4' : '#9CA3AF'} 
            />
            <Text style={[
              styles.bottomNavText,
              activeTab === tab.id && styles.activeNavText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4ECDC4', // Header color for status bar area
  },
  
  // Compact Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 15,
  },
  doctorProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  specialization: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4757',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Content Wrapper
  contentWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for bottom navigation
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },

  // Circular Quick Actions
  circularActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  circularActionContainer: {
    alignItems: 'center',
    width: 70,
  },
  circularAction: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  circularActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },

  // Compact Statistics
  compactStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactStatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: (width - 48) / 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },

  // Appointments
  appointmentsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 12,
    color: '#64748b',
  },
  appointmentTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ECDC4',
  },

  // Tools Grid
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 48) / 2,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },

  // Bottom Navigation
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeNavItem: {
    // No additional styling needed
  },
  bottomNavText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 20,
  },
});

export default DoctorDashboard;