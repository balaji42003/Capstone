import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

const HealthIndex = () => {
  const router = useRouter();

  const healthServices = [
    {
      id: '1',
      title: 'Skin Disease\nDetector',
      icon: 'body-outline',
      color: ['#667eea', '#764ba2'],
      route: '/health/SkinDiseaseDetector'
    },
    {
      id: '2',
      title: 'Eye Condition\nAnalyzer',
      icon: 'eye-outline',
      color: ['#f093fb', '#f5576c'],
      route: '/health/EyeConditionAnalyzer'
    },
    {
      id: '3',
      title: 'Food Calorie\nChecker',
      icon: 'restaurant-outline',
      color: ['#4facfe', '#00f2fe'],
      route: '/health/PlateCalorieChecker'
    },
    {
      id: '4',
      title: 'Health Chat\nAssistant',
      icon: 'chatbubbles-outline',
      color: ['#43e97b', '#38f9d7'],
      route: '/health/BreastCancerRiskChatbot'
    },
    {
      id: '5',
      title: 'Fever & Cold\nChecker',
      icon: 'thermometer-outline',
      color: ['#fa709a', '#fee140'],
      route: '/health/FeverFluSymptomChecker'
    },
    {
      id: '6',
      title: 'Diet & Nutrition\nPlanner',
      icon: 'nutrition-outline',
      color: ['#a8edea', '#fed6e3'],
      route: '/health/DailyDietNutritionPlanner'
    },
    {
      id: '7',
      title: 'Sleep Health\nTracker',
      icon: 'bed-outline',
      color: ['#d299c2', '#fef9d7'],
      route: '/health/SmartSleepBedtimeCompanion'
    },
    {
      id: '8',
      title: 'Blood Sugar\nMonitor',
      icon: 'water-outline',
      color: ['#89f7fe', '#66a6ff'],
      route: '/health/DiabetesGlucoseRiskMonitor'
    }
  ];

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.servicesGrid}>
          {healthServices.map((service, index) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => router.push(service.route)}
            >
              <LinearGradient
                colors={service.color}
                style={styles.serviceIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={service.icon} size={32} color="white" />
              </LinearGradient>
              <Text style={styles.serviceTitle}>{service.title}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default HealthIndex;
