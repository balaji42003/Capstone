import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
  Alert,
  Image
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
    <View style={[style, { backgroundColor: colors?.[0] || '#FF6B6B' }]} {...props}>
      {children}
    </View>
  );
}

const { width } = Dimensions.get('window');

// Professional Header Component
const Header = ({ title, gradient, onBack }) => (
  <LinearGradient colors={gradient} style={styles.header}>
    <View style={styles.headerContent}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  </LinearGradient>
);

// Professional Loading Component
const LoadingComponent = ({ text }) => (
  <SafeAreaView style={styles.loadingContainer}>
    <LinearGradient colors={['#FF6B6B', '#FF8E8E']} style={styles.loadingGradient}>
      <View style={styles.loadingContent}>
        <View style={styles.loadingSpinner}>
          <Ionicons name="medical" size={60} color="white" />
        </View>
        <Text style={styles.loadingText}>{text}</Text>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, { animationDelay: '0ms' }]} />
          <View style={[styles.dot, { animationDelay: '200ms' }]} />
          <View style={[styles.dot, { animationDelay: '400ms' }]} />
        </View>
      </View>
    </LinearGradient>
  </SafeAreaView>
);

const SkinDiseaseDetector = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Analysis, 3: Results
  const [isConnected, setIsConnected] = useState(true);

  // API configuration with fallback URLs
  const API_URLS = [
    'http://10.3.5.210:5002',  // Primary IP
    'http://192.168.1.100:5002', // Alternative common IP range
    'http://localhost:5002',   // Localhost fallback
    'http://127.0.0.1:5002'    // IP localhost fallback
  ];

  const [currentApiUrl, setCurrentApiUrl] = useState(API_URLS[0]);

  // Test connection on component mount
  useEffect(() => {
    testConnectionToAvailableServer();
  }, []);

  const testConnectionToAvailableServer = async () => {
    for (const url of API_URLS) {
      console.log(`Testing connection to: ${url}/status`);
      try {
        const response = await fetch(`${url}/status`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log(`✅ Successfully connected to: ${url}`);
          setCurrentApiUrl(url);
          setIsConnected(true);
          return true;
        }
      } catch (error) {
        console.log(`❌ Failed to connect to: ${url}`);
        console.log('Error:', error.message);
      }
    }
    
    console.log('❌ No API servers are reachable');
    setIsConnected(false);
    return false;
  };

  const skinConditions = [
    { name: 'Acne', confidence: 85, color: '#e74c3c', severity: 'Moderate' },
    { name: 'Eczema', confidence: 12, color: '#f39c12', severity: 'Mild' },
    { name: 'Melanoma Risk', confidence: 3, color: '#2ecc71', severity: 'Low' }
  ];

  const recommendations = [
    {
      category: 'Immediate Care',
      items: [
        'Keep the affected area clean and dry',
        'Avoid touching or picking at the skin',
        'Use gentle, fragrance-free skincare products'
      ]
    },
    {
      category: 'Treatment Options',
      items: [
        'Topical retinoids for acne treatment',
        'Gentle exfoliation 2-3 times per week',
        'Consider salicylic acid or benzoyl peroxide'
      ]
    },
    {
      category: 'When to See a Doctor',
      items: [
        'If condition worsens or doesn\'t improve in 2 weeks',
        'Signs of infection (pus, excessive redness, warmth)',
        'Any changes in moles or unusual skin growths'
      ]
    }
  ];

  const pickImageFromCamera = async () => {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage({
          uri: result.assets[0].uri,
          source: 'camera'
        });
        setCurrentStep(2);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      // Request media library permissions
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (mediaPermission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage({
          uri: result.assets[0].uri,
          source: 'gallery'
        });
        setCurrentStep(2);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
      console.error('Gallery error:', error);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image Source',
      'Choose how you want to add the image',
      [
        { text: 'Camera', onPress: pickImageFromCamera },
        { text: 'Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection to:', `${currentApiUrl}/status`);
      
      const response = await fetch(`${currentApiUrl}/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Connection response status:', response.status);
      console.log('Connection response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend response:', data);
      }
      
      setIsConnected(response.ok);
      return response.ok;
    } catch (error) {
      console.log('Connection test failed:', error);
      console.log('Error details:', error.message);
      setIsConnected(false);
      return false;
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage?.uri) {
      Alert.alert('Error', 'No image selected for analysis.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error('Unable to connect to analysis server. Please check your internet connection.');
      }

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        name: 'skin_image.jpg',
        type: 'image/jpeg'
      });

      console.log('Sending image URI:', selectedImage.uri);
      console.log('FormData created with file field');
      console.log('Making request to:', `${currentApiUrl}/predict`);

      // Make API call to the skin disease detection server (matches your backend)
      const response = await fetch(`${currentApiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Prediction response:', data);
      console.log('Prediction:', data.prediction);
      console.log('Confidence:', data.confidence_percentage);

      // Parse confidence_percentage (e.g., "92.00%") to number
      const percent = typeof data.confidence_percentage === 'string'
        ? parseFloat(data.confidence_percentage.replace('%', ''))
        : data.confidence_percentage;

      // Process the API response and update the analysis result
      const processedResult = {
        primaryCondition: {
          name: data.prediction || 'Unknown Condition',
          confidence: Math.round(percent || 0),
          color: getConditionColor(data.prediction),
          severity: getSeverityLevel(percent)
        },
        confidence: Math.round(percent || 0),
        recommendations: getRecommendationsForCondition(data.prediction),
        riskLevel: getRiskLevel(percent),
        accuracy: Math.round(percent || 0)
      };

      setAnalysisResult(processedResult);
      setCurrentStep(3);

    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed', 
        'Unable to analyze the image. Please check your internet connection and try again.\n\nError: ' + error.message,
        [
          { text: 'Retry', onPress: () => analyzeImage() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper functions for processing API response
  const getConditionColor = (condition) => {
    const colorMap = {
      'acne': '#6366f1',
      'eczema': '#818cf8',
      'melanoma': '#3730a3',
      'psoriasis': '#a5b4fc',
      'normal': '#6366f1',
      'rosacea': '#818cf8'
    };
    return colorMap[condition?.toLowerCase()] || '#6366f1';
  };

  const getSeverityLevel = (confidence) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Moderate';
    if (confidence >= 40) return 'Mild';
    return 'Low';
  };

  const getRiskLevel = (confidence) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Moderate';
    return 'Low';
  };

  const getRecommendationsForCondition = (condition) => {
    const conditionRecommendations = {
      'acne': [
        {
          category: 'Immediate Care',
          items: [
            'Keep the affected area clean and dry',
            'Avoid touching or picking at the skin',
            'Use gentle, non-comedogenic skincare products'
          ]
        },
        {
          category: 'Treatment Options',
          items: [
            'Consider topical retinoids for acne treatment',
            'Gentle exfoliation 2-3 times per week',
            'Use salicylic acid or benzoyl peroxide products'
          ]
        }
      ],
      'eczema': [
        {
          category: 'Immediate Care',
          items: [
            'Keep skin moisturized with fragrance-free creams',
            'Avoid known triggers and irritants',
            'Use gentle, hypoallergenic products'
          ]
        },
        {
          category: 'Treatment Options',
          items: [
            'Apply topical corticosteroids as directed',
            'Consider antihistamines for itching',
            'Use lukewarm water for bathing'
          ]
        }
      ],
      'default': recommendations
    };

    return conditionRecommendations[condition?.toLowerCase()] || recommendations;
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setCurrentStep(1);
  };

  if (isAnalyzing) {
    return <LoadingComponent text="Analyzing skin condition using AI..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Skin Disease Detector" 
        gradient={['#6366f1', '#818cf8']}
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && (
          // Step 1: Image Upload
          <View style={styles.uploadSection}>
            <View style={styles.instructionCard}>
              <Ionicons name="information-circle" size={32} color="#FF6B6B" />
              <Text style={styles.instructionTitle}>How to Get Best Results</Text>
              <View style={styles.instructionList}>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                  <Text style={styles.instructionText}>Take photo in good lighting</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                  <Text style={styles.instructionText}>Keep camera steady and focused</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                  <Text style={styles.instructionText}>Show the affected area clearly</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                  <Text style={styles.instructionText}>Include surrounding healthy skin</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={showImagePicker}>
            <LinearGradient colors={['#6366f1', '#818cf8']} style={styles.uploadGradient}>
                <Ionicons name="camera" size={40} color="white" />
                <Text style={styles.uploadText}>Take Photo or Select Image</Text>
                <Text style={styles.uploadSubtext}>Tap to capture or choose from gallery</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.disclaimerCard}>
              <Ionicons name="shield-checkmark" size={24} color="#6366f1" />
              <View style={styles.disclaimerContent}>
                <Text style={styles.disclaimerText}>
                  This AI analysis is for informational purposes only and should not replace professional medical diagnosis.
                </Text>
                <View style={styles.connectionStatus}>
                  <Ionicons 
                    name={isConnected ? "checkmark-circle" : "alert-circle"} 
                    size={16} 
                    color={isConnected ? "#6366f1" : "#e74c3c"} 
                  />
                  <Text style={[styles.connectionText, { color: isConnected ? "#6366f1" : "#e74c3c" }]}>
                    {isConnected ? `AI Server Connected (${currentApiUrl})` : "Connection Issue"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.testButton} onPress={testConnectionToAvailableServer}>
                  <Ionicons name="refresh" size={16} color="#6366f1" />
                  <Text style={styles.testButtonText}>Test Connection</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {currentStep === 2 && selectedImage && (
          // Step 2: Image Preview and Analysis
          <View style={styles.previewSection}>
            <View style={styles.imageCard}>
              <Text style={styles.imageCardTitle}>Selected Image</Text>
              <View style={styles.imageContainer}>
                {selectedImage?.uri ? (
                  <Image 
                    source={{ uri: selectedImage.uri }} 
                    style={styles.selectedImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image" size={60} color="#FF6B6B" />
                    <Text style={styles.imagePlaceholderText}>Skin Sample Image</Text>
                  </View>
                )}
              </View>
              <View style={styles.imageInfo}>
                <View style={styles.imageInfoItem}>
                  <Ionicons name="camera" size={16} color="#7F8C8D" />
                  <Text style={styles.imageInfoText}>Source: {selectedImage.source}</Text>
                </View>
                <View style={styles.imageInfoItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                  <Text style={styles.imageInfoText}>Image quality: Good</Text>
                </View>
              </View>
            </View>

            <View style={styles.analysisInfo}>
              <Text style={styles.analysisTitle}>AI Analysis Process</Text>
              <View style={styles.analysisSteps}>
                <View style={styles.analysisStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Image preprocessing and enhancement</Text>
                </View>
                <View style={styles.analysisStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Feature extraction using CNN</Text>
                </View>
                <View style={styles.analysisStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Pattern matching with database</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.retakeButton} onPress={resetAnalysis}>
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
                <LinearGradient colors={['#6366f1', '#818cf8']} style={styles.analyzeGradient}>
                  <Ionicons name="scan" size={20} color="white" />
                  <Text style={styles.analyzeText}>Analyze Image</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 3 && analysisResult && (
          // Step 3: Analysis Results
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <LinearGradient colors={['#6366f1', '#818cf8']} style={styles.resultHeaderGradient}>
                <Ionicons name="analytics" size={32} color="white" />
                <Text style={styles.resultHeaderTitle}>Analysis Complete</Text>
                <Text style={styles.resultHeaderSubtitle}>AI Confidence: {analysisResult.accuracy}%</Text>
              </LinearGradient>
            </View>

            {/* Primary Diagnosis */}
            <View style={styles.diagnosisCard}>
              <Text style={styles.diagnosisTitle}>Primary Diagnosis</Text>
              <View style={styles.diagnosisMain}>
                <View style={styles.diagnosisIcon}>
                  <Ionicons name="medical" size={32} color={analysisResult.primaryCondition.color || '#6366f1'} />
                </View>
                <View style={styles.diagnosisInfo}>
                  <Text style={styles.conditionName}>{analysisResult.primaryCondition.name}</Text>
                  <Text style={styles.conditionSeverity}>Severity: {analysisResult.primaryCondition.severity}</Text>
                  <View style={styles.confidenceBar}>
                    <View style={styles.confidenceBarBg}>
                      <View 
                        style={[
                          styles.confidenceBarFill, 
                          { 
                            width: `${analysisResult.primaryCondition.confidence}%`,
                            backgroundColor: analysisResult.primaryCondition.color 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.confidenceText}>{analysisResult.primaryCondition.confidence}% confidence</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Other Possible Conditions */}
            <View style={styles.otherConditionsCard}>
              <Text style={styles.otherConditionsTitle}>Other Possible Conditions</Text>
              {skinConditions.slice(1).map((condition, index) => (
                <View key={index} style={styles.conditionItem}>
                  <View style={[styles.conditionDot, { backgroundColor: condition.color }]} />
                  <Text style={styles.conditionItemName}>{condition.name}</Text>
                  <Text style={styles.conditionItemConfidence}>{condition.confidence}%</Text>
                </View>
              ))}
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Professional Recommendations</Text>
              {recommendations.map((category, index) => (
                <View key={index} style={styles.recommendationCategory}>
                  <Text style={styles.categoryTitle}>{category.category}</Text>
                  {category.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.recommendationItem}>
                      <Ionicons name="checkmark" size={16} color="#FF6B6B" />
                      <Text style={styles.recommendationText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {/* Emergency Warning */}
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color="#e74c3c" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Important Notice</Text>
                <Text style={styles.warningText}>
                  This AI analysis is a screening tool only. Please consult a dermatologist for proper diagnosis and treatment, especially for any concerning changes in your skin.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.finalActions}>
              <TouchableOpacity style={styles.saveButton}>
              <LinearGradient colors={['#6366f1', '#3730a3']} style={styles.saveGradient}>
                  <Ionicons name="bookmark" size={20} color="white" />
                  <Text style={styles.saveText}>Save Report</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.newAnalysisButton} onPress={resetAnalysis}>
              <LinearGradient colors={['#6366f1', '#818cf8']} style={styles.newAnalysisGradient}>
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.newAnalysisText}>New Analysis</Text>
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
    backgroundColor: '#F8FAFC',
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
  instructionCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 16,
  },
  instructionList: {
    width: '100%',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  uploadButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  uploadGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  uploadSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  disclaimerCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 18,
    marginBottom: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignSelf: 'flex-start',
  },
  testButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366f1',
  },
  previewSection: {
    marginTop: 20,
  },
  imageCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  imageCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8F4FD',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E8F4FD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  imageInfo: {
    gap: 8,
  },
  imageInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageInfoText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  analysisInfo: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  analysisSteps: {
    gap: 12,
  },
  analysisStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  stepText: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  analyzeButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  analyzeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsSection: {
    marginTop: 20,
  },
  resultHeader: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  resultHeaderGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  resultHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  resultHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  diagnosisCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  diagnosisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  diagnosisMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  diagnosisIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagnosisInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  conditionSeverity: {
    fontSize: 14,
    color: '#7F8C8D',
    marginVertical: 4,
  },
  confidenceBar: {
    marginTop: 8,
  },
  confidenceBarBg: {
    height: 6,
    backgroundColor: '#E8F4FD',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  otherConditionsCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  otherConditionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  conditionItemName: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  conditionItemConfidence: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  recommendationCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#FFF5F5',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    marginBottom: 20,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  finalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  newAnalysisButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newAnalysisGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  newAnalysisText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomSpacing: {
    height: 24,
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    opacity: 0.3,
  },
});

export default SkinDiseaseDetector;
