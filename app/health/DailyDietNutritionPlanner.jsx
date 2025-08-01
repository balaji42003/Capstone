import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
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
    <View style={[style, { backgroundColor: colors?.[0] || '#10B981' }]} {...props}>
      {children}
    </View>
  );
}

const DailyDietNutritionPlanner = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
    diet_preference: 'Vegetarian',
    activity_level: 'Moderate',
    weekly_activity: '3',
    disease: 'None',
    allergies: 'None',
    health_goal: 'Maintenance'
  });

  const genderOptions = ['Male', 'Female'];
  const dietOptions = [
    'Non-Vegetarian', 'Vegetarian', 'Vegan', 'Plant-Based', 'Mediterranean',
    'Keto', 'Paleo', 'Low-Carb', 'Gluten-Free', 'Pescatarian', 'Flexitarian'
  ];
  const activityOptions = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'];
  const diseaseOptions = [
    'None', 'Diabetes', 'Hypertension', 'Heart Disease', 'GERD', 'IBS',
    'Celiac', 'Obesity', 'Thyroid', 'Iron Deficiency', 'B12 Deficiency'
  ];
  const allergyOptions = [
    'None', 'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy',
    'Fish', 'Shellfish', 'Wheat', 'Multiple'
  ];
  const goalOptions = [
    'Weight Loss', 'Maintenance', 'Weight Gain', 'Muscle Gain',
    'Better Health', 'Athletic Performance'
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.age && formData.weight && formData.height;
      case 2:
        return formData.gender && formData.diet_preference;
      case 3:
        return formData.activity_level && formData.weekly_activity;
      case 4:
        return formData.disease && formData.allergies && formData.health_goal;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        submitForm();
      }
    } else {
      Alert.alert('Incomplete Form', 'Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitForm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://10.3.5.210:5003/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          diet_preference: formData.diet_preference,
          activity_level: formData.activity_level,
          weekly_activity: parseInt(formData.weekly_activity),
          disease: formData.disease,
          allergies: formData.allergies,
          health_goal: formData.health_goal
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        setShowResults(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to get nutrition recommendations');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Network Error', 'Unable to connect to the nutrition service. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setResults(null);
    setShowResults(false);
    setFormData({
      age: '',
      gender: 'Male',
      weight: '',
      height: '',
      diet_preference: 'Vegetarian',
      activity_level: 'Moderate',
      weekly_activity: '3',
      disease: 'None',
      allergies: 'None',
      health_goal: 'Maintenance'
    });
  };

  const renderDropdown = (value, options, onSelect, placeholder) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{placeholder}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionChip, value === option && styles.selectedChip]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionText, value === option && styles.selectedText]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📊 Basic Information</Text>
      <Text style={styles.stepSubtitle}>Let's start with your basic details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Age (years)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.age}
          onChangeText={(text) => updateFormData('age', text)}
          placeholder="Enter your age"
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Weight (kg)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.weight}
          onChangeText={(text) => updateFormData('weight', text)}
          placeholder="Enter your weight"
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Height (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.height}
          onChangeText={(text) => updateFormData('height', text)}
          placeholder="Enter your height"
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>👤 Personal Preferences</Text>
      <Text style={styles.stepSubtitle}>Tell us about your preferences</Text>
      
      {renderDropdown(formData.gender, genderOptions, (value) => updateFormData('gender', value), 'Gender')}
      {renderDropdown(formData.diet_preference, dietOptions, (value) => updateFormData('diet_preference', value), 'Diet Preference')}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>🏃‍♂️ Activity Level</Text>
      <Text style={styles.stepSubtitle}>How active are you?</Text>
      
      {renderDropdown(formData.activity_level, activityOptions, (value) => updateFormData('activity_level', value), 'Activity Level')}
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Weekly Activity Days</Text>
        <TextInput
          style={styles.textInput}
          value={formData.weekly_activity}
          onChangeText={(text) => updateFormData('weekly_activity', text)}
          placeholder="How many days per week?"
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>🏥 Health Information</Text>
      <Text style={styles.stepSubtitle}>Health conditions and goals</Text>
      
      {renderDropdown(formData.disease, diseaseOptions, (value) => updateFormData('disease', value), 'Health Conditions')}
      {renderDropdown(formData.allergies, allergyOptions, (value) => updateFormData('allergies', value), 'Food Allergies')}
      {renderDropdown(formData.health_goal, goalOptions, (value) => updateFormData('health_goal', value), 'Health Goal')}
    </View>
  );

  const renderResults = () => (
    <ScrollView style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>🎉 Your Nutrition Plan</Text>
        <Text style={styles.caloriesText}>{results.calories} kcal/day</Text>
      </View>

      {/* Nutrient Information */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📊 Daily Nutrients</Text>
        <View style={styles.nutrientGrid}>
          {Object.entries(results.nutrient_info).map(([key, value]) => (
            <View key={key} style={styles.nutrientCard}>
              <Text style={styles.nutrientValue}>{value.split('::')[1]?.trim() || value}</Text>
              <Text style={styles.nutrientLabel}>{key}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Meal Suggestions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🍽️ Meal Suggestions</Text>
        {Object.entries(results.meal_suggestions).map(([mealType, suggestion]) => (
          <View key={mealType} style={styles.mealCard}>
            <Text style={styles.mealType}>{mealType}</Text>
            <Text style={styles.mealSuggestion}>
              {suggestion.split('::')[1]?.trim() || suggestion}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of 4</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Nutrition Planner</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Diet Planning</Text>
          </View>
          <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
            <Ionicons name="refresh" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {!showResults && renderProgressBar()}
        
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {!showResults && (
            <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        {!showResults && (
          <View style={styles.navigationContainer}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                <Text style={styles.prevButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.nextButton, { flex: currentStep === 1 ? 1 : 0.6 }]} 
              onPress={nextStep}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <LinearGradient colors={['#10B981', '#059669']} style={styles.nextButtonGradient}>
                  <Text style={styles.nextButtonText}>
                    {currentStep === 4 ? 'Get My Plan' : 'Next'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowResults(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity onPress={resetForm} style={styles.newPlanButton}>
              <Text style={styles.newPlanText}>New Plan</Text>
            </TouchableOpacity>
          </View>
          {results && renderResults()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  resetButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1F2937',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  selectedChip: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  prevButton: {
    flex: 0.4,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPlanButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  newPlanText: {
    color: 'white',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  caloriesText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutrientCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  mealCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  mealSuggestion: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default DailyDietNutritionPlanner;
