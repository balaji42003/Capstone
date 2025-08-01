import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Conditional import for LinearGradient with fallback
let LinearGradient;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  LinearGradient = ({ children, colors, style, ...props }) => (
    <View style={[style, { backgroundColor: colors?.[0] || '#FF8A50' }]} {...props}>
      {children}
    </View>
  );
}

const { width } = Dimensions.get('window');

const PlateCalorieChecker = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Track image errors for fallback
  const [imageErrors, setImageErrors] = useState({});

  const foodSuggestions = [
    {
      name: 'Mixed Plate',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
      description: 'Rice, vegetables, and protein'
    },
    {
      name: 'Healthy Salad',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      description: 'Fresh greens with toppings'
    }
  ];

  const mockAnalysisResult = {
    confidence: 94,
    totalCalories: 485,
    servingSize: 'Medium plate (280g)',
    detectedFoods: [
      {
        name: 'Steamed Rice',
        quantity: '3/4 cup',
        calories: 150,
        percentage: 31,
        nutrition: { carbs: 30, protein: 3, fat: 0.5, fiber: 0.5 }
      },
      {
        name: 'Grilled Chicken Breast',
        quantity: '85g',
        calories: 140,
        percentage: 29,
        nutrition: { carbs: 0, protein: 26, fat: 3, fiber: 0 }
      },
      {
        name: 'Mixed Vegetables',
        quantity: '1/2 cup',
        calories: 45,
        percentage: 9,
        nutrition: { carbs: 8, protein: 2, fat: 0.5, fiber: 3 }
      },
      {
        name: 'Olive Oil (cooking)',
        quantity: '1 tsp',
        calories: 40,
        percentage: 8,
        nutrition: { carbs: 0, protein: 0, fat: 4.5, fiber: 0 }
      },
      {
        name: 'Sauce/Gravy',
        quantity: '2 tbsp',
        calories: 110,
        percentage: 23,
        nutrition: { carbs: 12, protein: 2, fat: 5, fiber: 1 }
      }
    ],
    nutritionSummary: {
      totalCarbs: 50,
      totalProtein: 33,
      totalFat: 13,
      totalFiber: 4.5,
      macroBreakdown: {
        carbs: 41,
        protein: 27,
        fat: 32
      }
    },
    healthScore: 78,
    recommendations: [
      'Great protein content!',
      'Consider adding more vegetables',
      'Well-balanced meal overall',
      'Good portion size for lunch'
    ],
    alternatives: [
      { name: 'Brown rice instead of white', calorieDiff: -20, benefit: 'More fiber and nutrients' },
      { name: 'Steamed instead of sautéed vegetables', calorieDiff: -25, benefit: 'Lower fat content' },
      { name: 'Reduce sauce portion', calorieDiff: -55, benefit: 'Lower sodium and calories' }
    ],
    mealTiming: 'Lunch',
    activityEquivalent: [
      { activity: 'Walking', duration: '55 minutes' },
      { activity: 'Cycling', duration: '25 minutes' },
      { activity: 'Swimming', duration: '20 minutes' },
      { activity: 'Running', duration: '15 minutes' }
    ]
  };

  const pickImage = async (source) => {
    try {
      // Request permissions
      const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus.status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      let result;
      if (source === 'camera') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos!');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setCurrentStep(2);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image to analyze.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        name: 'food_image.jpg',
        type: 'image/jpeg',
      });

      // Call backend
      const response = await fetch('http://10.3.5.210:5006/analyze', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      if (data.success && data.calorie_analysis) {
        setAnalysisResult(data.calorie_analysis);
        setCurrentStep(3);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      Alert.alert('Analysis Error', error.message || 'Failed to analyze image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setCurrentStep(1);
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient colors={['#FF8A50', '#FF6B35']} style={styles.loadingGradient}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="restaurant" size={60} color="white" />
            </View>
            <Text style={styles.loadingText}>Analyzing your meal...</Text>
            <Text style={styles.loadingSubtext}>Identifying food items and calculating calories</Text>
            <View style={styles.loadingProgress}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>Processing...</Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF8A50', '#FF6B35']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calorie Checker</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && (
          // Step 1: Image Selection
          <View style={styles.uploadSection}>
            <View style={styles.welcomeCard}>
              <Ionicons name="camera" size={32} color="#FF8A50" />
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>Food Calorie Analysis</Text>
                <Text style={styles.welcomeText}>
                  Take or upload a photo of your meal to get detailed nutrition information
                </Text>
              </View>
            </View>

            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('camera')}>
                <LinearGradient colors={['#FF8A50', '#FF6B35']} style={styles.uploadGradient}>
                  <Ionicons name="camera" size={32} color="white" />
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                  <Text style={styles.uploadButtonSubtext}>Use camera to capture your meal</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('gallery')}>
                <LinearGradient colors={['#4299E1', '#3182CE']} style={styles.uploadGradient}>
                  <Ionicons name="images" size={32} color="white" />
                  <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                  <Text style={styles.uploadButtonSubtext}>Select existing photo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>📸 Photo Tips for Best Results</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FF8A50" />
                  <Text style={styles.tipText}>Take photo from above (bird's eye view)</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FF8A50" />
                  <Text style={styles.tipText}>Ensure good lighting (natural light preferred)</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FF8A50" />
                  <Text style={styles.tipText}>Include the entire plate/bowl in frame</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#FF8A50" />
                  <Text style={styles.tipText}>Keep background simple and clean</Text>
                </View>
              </View>
            </View>

            <View style={styles.examplesCard}>
              <Text style={styles.examplesTitle}>Example Food Types We Can Analyze</Text>
            <View style={styles.examplesGrid}>
              {/* Render two columns per row strictly, fix pasta image and spacing */}
              {Array.from({ length: Math.ceil(foodSuggestions.length / 2) }).map((_, rowIdx) => {
                const firstIdx = rowIdx * 2;
                const secondIdx = firstIdx + 1;
                return (
                  <View key={rowIdx} style={styles.examplesRow}>
                    {/* First column */}
                    {foodSuggestions[firstIdx] ? (
                      <View style={styles.exampleItem}>
                        <View style={styles.exampleImageContainer}>
                        <Image
                          source={
                            imageErrors[firstIdx]
                              ? { uri: 'https://images.unsplash.com/photo-1673442635965-34f1b36d8944?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' } // fallback food icon
                              : { uri: foodSuggestions[firstIdx].image }
                          }
                          style={styles.exampleImage}
                          onError={() => setImageErrors(prev => ({ ...prev, [firstIdx]: true }))}
                        />
                        </View>
                        <Text style={styles.exampleName}>{foodSuggestions[firstIdx].name}</Text>
                        <Text style={styles.exampleDescription}>{foodSuggestions[firstIdx].description}</Text>
                      </View>
                    ) : <View style={[styles.exampleItem, { opacity: 0 }]} />}
                    {/* Second column */}
                    {foodSuggestions[secondIdx] ? (
                      <View style={styles.exampleItem}>
                        <View style={styles.exampleImageContainer}>
                          <Image
                            source={
                              imageErrors[secondIdx]
                                ? { uri: 'https://www.pngall.com/wp-content/uploads/4/Spaghetti-PNG-Image.png' }
                                : { uri: foodSuggestions[secondIdx].image }
                            }
                            style={styles.exampleImage}
                            onError={() => setImageErrors(prev => ({ ...prev, [secondIdx]: true }))}
                          />
                        </View>
                        <Text style={styles.exampleName}>{foodSuggestions[secondIdx].name}</Text>
                        <Text style={styles.exampleDescription}>{foodSuggestions[secondIdx].description}</Text>
                      </View>
                    ) : <View style={[styles.exampleItem, { opacity: 0 }]} />}
                  </View>
                );
              })}
            </View>
            </View>
          </View>
        )}

        {currentStep === 2 && selectedImage && (
          // Step 2: Image Preview & Analysis
          <View style={styles.previewSection}>
            <View style={styles.imagePreviewCard}>
              <Text style={styles.previewTitle}>Review Your Meal Photo</Text>
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity style={styles.retakeButton} onPress={() => setCurrentStep(1)}>
                  <Ionicons name="camera" size={16} color="#FF8A50" />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.analysisInfo}>
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#FF8A50" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>What happens next?</Text>
                  <Text style={styles.infoText}>
                    Our AI will analyze your photo to identify food items, estimate portions, and calculate total calories and nutrition facts.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.backToImageButton} onPress={() => setCurrentStep(1)}>
                <Text style={styles.backToImageText}>Choose Different Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
                <LinearGradient colors={['#FF8A50', '#FF6B35']} style={styles.analyzeGradient}>
                  <Ionicons name="analytics" size={20} color="white" />
                  <Text style={styles.analyzeText}>Analyze Calories</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 3 && analysisResult && (
          // Step 3: Analysis Results
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <LinearGradient colors={['#FF8A50', '#FF6B35']} style={styles.resultHeaderGradient}>
                <Ionicons name="restaurant" size={32} color="white" />
                <Text style={styles.resultHeaderTitle}>Nutrition Analysis</Text>
                <Text style={styles.resultHeaderSubtitle}>Complete meal breakdown</Text>
              </LinearGradient>
            </View>

            {/* Show uploaded image */}
            {selectedImage && (
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Image source={{ uri: selectedImage }} style={{ width: 200, height: 140, borderRadius: 10 }} />
              </View>
            )}

            {/* Calorie Summary */}
            <View style={styles.calorieCard}>
              <View style={styles.calorieHeader}>
                <View style={styles.calorieInfo}>
                  <Text style={styles.totalCalories}>{analysisResult.totalCalories ?? analysisResult.total_calories ?? analysisResult.calorie_analysis?.total_calories ?? 'N/A'}</Text>
                  <Text style={styles.calorieUnit}>calories</Text>
                </View>
              </View>
            </View>

            {/* Detected Foods */}
            <View style={styles.foodsCard}>
              <Text style={styles.foodsTitle}>Detected Food Items</Text>
              {Array.isArray(analysisResult.detectedFoods)
                ? analysisResult.detectedFoods.map((food, index) => (
                    <View key={index} style={styles.foodItem}>
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodQuantity}>{food.quantity}</Text>
                      </View>
                      <View style={styles.foodCalories}>
                        <Text style={styles.foodCalorieValue}>{food.calories}</Text>
                        <Text style={styles.foodCalorieUnit}>cal</Text>
                      </View>
                    </View>
                  ))
                : Array.isArray(analysisResult.food_items)
                ? analysisResult.food_items.map((food, index) => (
                    <View key={index} style={styles.foodItem}>
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodQuantity}>{food.portion}</Text>
                      </View>
                      <View style={styles.foodCalories}>
                        <Text style={styles.foodCalorieValue}>{food.calories}</Text>
                        <Text style={styles.foodCalorieUnit}>cal</Text>
                      </View>
                    </View>
                  ))
                : <Text style={{ color: '#718096', fontSize: 12 }}>No food items detected.</Text>
              }
            </View>

            {/* Nutrition Breakdown */}
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionTitle}>Nutrition Breakdown</Text>
              {analysisResult.nutritionSummary && analysisResult.nutritionSummary.macroBreakdown ? (
                <View style={styles.macroChart}>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroBar, { backgroundColor: '#FF8A50' }]}> 
                      <View style={[ 
                        styles.macroFill,  
                        { width: `${analysisResult.nutritionSummary.macroBreakdown.carbs ?? 0}%`, backgroundColor: '#FF6B35' } 
                      ]} />
                    </View>
                    <Text style={styles.macroLabel}>Carbs: {analysisResult.nutritionSummary.totalCarbs ?? 'N/A'}g</Text>
                    <Text style={styles.macroPercent}>{analysisResult.nutritionSummary.macroBreakdown.carbs ?? 'N/A'}%</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroBar, { backgroundColor: '#4299E1' }]}> 
                      <View style={[ 
                        styles.macroFill,  
                        { width: `${analysisResult.nutritionSummary.macroBreakdown.protein ?? 0}%`, backgroundColor: '#3182CE' } 
                      ]} />
                    </View>
                    <Text style={styles.macroLabel}>Protein: {analysisResult.nutritionSummary.totalProtein ?? 'N/A'}g</Text>
                    <Text style={styles.macroPercent}>{analysisResult.nutritionSummary.macroBreakdown.protein ?? 'N/A'}%</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroBar, { backgroundColor: '#48BB78' }]}> 
                      <View style={[ 
                        styles.macroFill,  
                        { width: `${analysisResult.nutritionSummary.macroBreakdown.fat ?? 0}%`, backgroundColor: '#38A169' } 
                      ]} />
                    </View>
                    <Text style={styles.macroLabel}>Fat: {analysisResult.nutritionSummary.totalFat ?? 'N/A'}g</Text>
                    <Text style={styles.macroPercent}>{analysisResult.nutritionSummary.macroBreakdown.fat ?? 'N/A'}%</Text>
                  </View>
                  <View style={styles.fiberInfo}>
                    <Ionicons name="leaf" size={16} color="#48BB78" />
                    <Text style={styles.fiberText}>Fiber: {analysisResult.nutritionSummary.totalFiber ?? 'N/A'}g</Text>
                  </View>
                </View>
              ) : analysisResult.nutritional_info ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.macroLabel}>Carbs: {analysisResult.nutritional_info.carbs ?? 'N/A'}</Text>
                  <Text style={styles.macroLabel}>Protein: {analysisResult.nutritional_info.protein ?? 'N/A'}</Text>
                  <Text style={styles.macroLabel}>Fat: {analysisResult.nutritional_info.fat ?? 'N/A'}</Text>
                </View>
              ) : (
                <Text style={{ color: '#718096', fontSize: 12 }}>Nutrition details not available.</Text>
              )}
            </View>

            {/* Analysis Description */}
            {analysisResult.analysis || analysisResult.calorie_analysis?.analysis ? (
              <View style={styles.nutritionCard}>
                <Text style={styles.nutritionTitle}>AI Nutritionist's Notes</Text>
                <Text style={{ color: '#2D3748', fontSize: 13 }}>{analysisResult.analysis ?? analysisResult.calorie_analysis?.analysis}</Text>
              </View>
            ) : null}

            {/* Activity Equivalent */}
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>🔥 To Burn These Calories</Text>
              {Array.isArray(analysisResult.activityEquivalent) && analysisResult.activityEquivalent.length > 0 ? (
                <View style={styles.activityList}>
                  {analysisResult.activityEquivalent.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        <Ionicons 
                          name={activity.activity === 'Walking' ? 'walk' : 
                                activity.activity === 'Cycling' ? 'bicycle' :
                                activity.activity === 'Swimming' ? 'water' : 'fitness'} 
                          size={20} 
                          color="#FF8A50" 
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{activity.activity}</Text>
                        <Text style={styles.activityDuration}>{activity.duration}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : Array.isArray(analysisResult.calorie_analysis?.activityEquivalent) && analysisResult.calorie_analysis.activityEquivalent.length > 0 ? (
                <View style={styles.activityList}>
                  {analysisResult.calorie_analysis.activityEquivalent.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        <Ionicons 
                          name={activity.activity === 'Walking' ? 'walk' : 
                                activity.activity === 'Cycling' ? 'bicycle' :
                                activity.activity === 'Swimming' ? 'water' : 'fitness'} 
                          size={20} 
                          color="#FF8A50" 
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{activity.activity}</Text>
                        <Text style={styles.activityDuration}>{activity.duration}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ color: '#718096', fontSize: 12 }}>No activity equivalent data.</Text>
              )}
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>💡 Health Recommendations</Text>
              {Array.isArray(analysisResult.recommendations) && analysisResult.recommendations.length > 0 ? (
                analysisResult.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#48BB78" />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#718096', fontSize: 12 }}>No recommendations available.</Text>
              )}
            </View>

            {/* Alternatives */}
            <View style={styles.alternativesCard}>
              <Text style={styles.alternativesTitle}>🔄 Healthier Alternatives</Text>
              {Array.isArray(analysisResult.alternatives) && analysisResult.alternatives.length > 0 ? (
                analysisResult.alternatives.map((alt, index) => (
                  <View key={index} style={styles.alternativeItem}>
                    <View style={styles.alternativeInfo}>
                      <Text style={styles.alternativeName}>{alt.name}</Text>
                      <Text style={styles.alternativeBenefit}>{alt.benefit}</Text>
                    </View>
                    <View style={styles.calorieChange}>
                      <Text style={[ 
                        styles.calorieChangeText,
                        { color: alt.calorieDiff < 0 ? '#48BB78' : '#E53E3E' }
                      ]}>
                        {alt.calorieDiff > 0 ? '+' : ''}{alt.calorieDiff} cal
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#718096', fontSize: 12 }}>No alternatives available.</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.finalActions}>
              <TouchableOpacity style={styles.saveButton}>
                <LinearGradient colors={['#48BB78', '#38A169']} style={styles.saveGradient}>
                  <Ionicons name="bookmark" size={20} color="white" />
                  <Text style={styles.saveText}>Save Result</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton}>
                <LinearGradient colors={['#4299E1', '#3182CE']} style={styles.shareGradient}>
                  <Ionicons name="share" size={20} color="white" />
                  <Text style={styles.shareText}>Share</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.newAnalysisButton} onPress={resetAnalysis}>
                <LinearGradient colors={['#FF8A50', '#FF6B35']} style={styles.newAnalysisGradient}>
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.newAnalysisText}>New Photo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>


        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
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
    paddingHorizontal: 16,
  },
  uploadSection: {
    marginTop: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8A50',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 16,
  },
  uploadOptions: {
    gap: 12,
    marginBottom: 20,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  uploadGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tipsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#4A5568',
    flex: 1,
  },
  examplesCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  examplesGrid: {
    gap: 3,
  },
  examplesRow: {
    flexDirection: 'row',
    columnGap: 12,
    marginBottom: 8,
  },
  exampleItem: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  exampleImageContainer: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0', // fallback for PNG transparency
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exampleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#e0e0e0', // fallback for PNG
  },
  exampleName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  exampleDescription: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
  },
  previewSection: {
    marginTop: 20,
  },
  imagePreviewCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  retakeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  retakeText: {
    fontSize: 12,
    color: '#FF8A50',
    fontWeight: '600',
  },
  analysisInfo: {
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF8A50',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 16,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backToImageButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF8A50',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  backToImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8A50',
  },
  analyzeButton: {
    flex: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  analyzeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsSection: {
    marginTop: 20,
  },
  resultHeader: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  resultHeaderGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  resultHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  resultHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  calorieCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  totalCalories: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF8A50',
  },
  calorieUnit: {
    fontSize: 16,
    color: '#718096',
  },
  confidenceScore: {
    alignItems: 'flex-end',
  },
  confidenceText: {
    fontSize: 12,
    color: '#48BB78',
    fontWeight: 'bold',
  },
  servingText: {
    fontSize: 10,
    color: '#718096',
  },
  healthScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FF8A50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  healthScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  foodsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  foodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  foodQuantity: {
    fontSize: 11,
    color: '#718096',
  },
  foodCalories: {
    alignItems: 'center',
    marginRight: 16,
  },
  foodCalorieValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8A50',
  },
  foodCalorieUnit: {
    fontSize: 10,
    color: '#718096',
  },
  foodPercentage: {
    width: 40,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
  },
  nutritionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  macroChart: {
    gap: 12,
  },
  macroItem: {
    marginBottom: 8,
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  macroPercent: {
    fontSize: 10,
    color: '#718096',
  },
  fiberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  fiberText: {
    fontSize: 12,
    color: '#48BB78',
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  activityList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    minWidth: (width - 68) / 2,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  activityDuration: {
    fontSize: 10,
    color: '#718096',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: '#4A5568',
    flex: 1,
  },
  alternativesCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alternativeInfo: {
    flex: 1,
  },
  alternativeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  alternativeBenefit: {
    fontSize: 10,
    color: '#718096',
  },
  calorieChange: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  calorieChangeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  finalActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  saveButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  saveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  shareButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  shareText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  newAnalysisButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  newAnalysisGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  newAnalysisText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomSpacing: {
    height: 20,
  },
  // Loading Component Styles
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingProgress: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
    width: '60%',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default PlateCalorieChecker;