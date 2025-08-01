// Create file: app/auth/pharmacy-login.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

const PharmacyLoginScreen = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    pharmacyName: '',
    ownerName: '',
    phone: '',
    license: '',
    address: '',
    gstNumber: '',
    establishedYear: ''
  });

  const handleAuth = () => {
    if (isLogin) {
      // Add authentication logic here
      // For now, navigate to pharmacy dashboard (you'll create this)
      Alert.alert('Success', 'Pharmacy login successful!', [
        { text: 'OK', onPress: () => router.replace('/pharmacy-dashboard') }
      ]);
    } else {
      // Registration validation
      if (!formData.license) {
        Alert.alert('Error', 'Pharmacy license number is required');
        return;
      }
      Alert.alert('Success', 'Pharmacy registration submitted for verification!', [
        { text: 'OK', onPress: () => router.replace('/pharmacy-dashboard') }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.pharmacyIconContainer}>
              <Ionicons name="storefront" size={40} color="white" />
            </View>
            <Text style={styles.headerTitle}>Medical Shop {isLogin ? 'Login' : 'Registration'}</Text>
            <Text style={styles.headerSubtitle}>
              {isLogin ? 'Access your pharmacy management system' : 'Join our pharmacy network'}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Business Badge */}
            <View style={styles.businessBadge}>
              <Ionicons name="business" size={20} color="#f093fb" />
              <Text style={styles.badgeText}>Verified Pharmacy Partner Portal</Text>
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Pharmacy/Medical Shop Name *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="storefront-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.input}
                      placeholder="ABC Medical Store"
                      value={formData.pharmacyName}
                      onChangeText={(text) => setFormData({...formData, pharmacyName: text})}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Owner/Manager Name *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter owner/manager name"
                      value={formData.ownerName}
                      onChangeText={(text) => setFormData({...formData, ownerName: text})}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Pharmacy License Number *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter pharmacy license number"
                      value={formData.license}
                      onChangeText={(text) => setFormData({...formData, license: text})}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>GST Number</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="receipt-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter GST registration number"
                      value={formData.gstNumber}
                      onChangeText={(text) => setFormData({...formData, gstNumber: text})}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Complete Address *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      style={[styles.input, styles.addressInput]}
                      placeholder="Street, City, State, PIN Code"
                      multiline
                      numberOfLines={3}
                      value={formData.address}
                      onChangeText={(text) => setFormData({...formData, address: text})}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Established Year</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.input}
                      placeholder="Year of establishment"
                      keyboardType="numeric"
                      maxLength={4}
                      value={formData.establishedYear}
                      onChangeText={(text) => setFormData({...formData, establishedYear: text})}
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Email *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="pharmacy@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                />
              </View>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Number *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Business contact number"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter secure password"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                />
              </View>
            </View>

            {!isLogin && (
              <View style={styles.disclaimerContainer}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#6B7280" />
                <Text style={styles.disclaimerText}>
                  Your pharmacy credentials will be verified before account activation. Ensure all information is accurate.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.authButtonGradient}
              >
                <Ionicons name={isLogin ? "log-in" : "storefront"} size={20} color="white" />
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Login to Dashboard' : 'Submit for Verification'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin ? "New pharmacy? Register now" : "Already registered? Login"}
              </Text>
            </TouchableOpacity>

            {/* Features for Pharmacy */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Pharmacy Dashboard Features</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="cube" size={16} color="#f093fb" />
                  <Text style={styles.featureText}>Inventory Management System</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="document-attach" size={16} color="#f093fb" />
                  <Text style={styles.featureText}>Prescription Processing</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="card" size={16} color="#f093fb" />
                  <Text style={styles.featureText}>Digital Billing & GST</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trending-up" size={16} color="#f093fb" />
                  <Text style={styles.featureText}>Sales Analytics & Reports</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="notifications" size={16} color="#f093fb" />
                  <Text style={styles.featureText}>Low Stock Alerts</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={16} color="#f093fb" />
                  <Text style={styles.featureText}>Customer Management</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  pharmacyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 20,
    paddingBottom: 40,
  },
  businessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 147, 251, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(240, 147, 251, 0.2)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f093fb',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    marginLeft: 12,
    color: '#374151',
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#065F46',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  authButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#f093fb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  authButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#f093fb',
    fontWeight: '500',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchText: {
    fontSize: 14,
    color: '#f093fb',
    fontWeight: '500',
  },
  featuresContainer: {
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default PharmacyLoginScreen;