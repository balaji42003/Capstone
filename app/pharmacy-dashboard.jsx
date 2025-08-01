import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

let LinearGradient;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  LinearGradient = ({ children, colors, style, ...props }) => (
    <View style={[style, { backgroundColor: colors?.[0] || '#f093fb' }]} {...props}>
      {children}
    </View>
  );
}

const PharmacyDashboard = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      router.replace('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const pharmacyMenuItems = [
    { id: 1, title: 'Inventory', icon: 'cube', color: '#f093fb' },
    { id: 2, title: 'Prescriptions', icon: 'document-attach', color: '#f5576c' },
    { id: 3, title: 'Billing', icon: 'card', color: '#e74c3c' },
    { id: 4, title: 'Orders', icon: 'bag', color: '#c0392b' },
    { id: 5, title: 'Customers', icon: 'people', color: '#a93226' },
    { id: 6, title: 'Reports', icon: 'analytics', color: '#922b21' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f093fb" />
      
      {/* Header */}
      <LinearGradient
        colors={['#f093fb', '#f5576c']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.pharmacyInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="storefront" size={30} color="white" />
            </View>
            <View style={styles.pharmacyDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.pharmacyName}>ABC Medical Store</Text>
              <Text style={styles.ownerName}>Owner: John Doe</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Pharmacy Dashboard</Text>
        
        <View style={styles.menuGrid}>
          {pharmacyMenuItems.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.menuItem, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={30} color="white" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Sales</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>₹15,230</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>48</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
          </View>
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
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pharmacyDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  pharmacyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  ownerName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginVertical: 20,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  menuItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuItemText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f093fb',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
});

export default PharmacyDashboard;