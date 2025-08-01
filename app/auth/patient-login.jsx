import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
// import auth from '@react-native-firebase/auth'; // Temporarily disabled for Google Sign-in testing
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

let LinearGradient;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  LinearGradient = ({ children, colors, style, ...props }) => (
    <View style={[style, { backgroundColor: colors?.[0] || '#667eea' }]} {...props}>
      {children}
    </View>
  );
}

const PatientLoginScreen = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  // Configure Google Sign-In
  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        GoogleSignin.configure({
          webClientId: '425084232868-6d6muuik0hddgq228i96d9aiav7e4jke.apps.googleusercontent.com',
          offlineAccess: false,
          hostedDomain: '',
          loginHint: '',
          forceCodeForRefreshToken: false,
          accountName: '',
          iosClientId: '',
          googleServicePlistPath: '',
          openIdRealm: '',
          profileImageSize: 120,
        });
        console.log('Google Sign-In configured successfully');
      } catch (error) {
        console.error('Google Sign-In configuration error:', error);
      }
    };
    
    configureGoogleSignIn();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google Sign-In...');
      
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log('Google Play Services available:', hasPlayServices);

      try {
        await GoogleSignin.signOut();
        console.log('Previous user signed out');
      } catch (signOutError) {
        console.log('No previous user to sign out');
      }

      console.log('Attempting Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In successful:', userInfo);

      // Defensive check for userInfo and userInfo.data.user
      if (!userInfo || !userInfo.data || !userInfo.data.user) {
        throw new Error('Google Sign-In did not return user information.');
      }

      const { user } = userInfo.data;

      // Defensive check for email
      if (!user.email) {
        throw new Error('Google Sign-In did not return an email address.');
      }

      const userData = {
        userType: 'patient',
        email: user.email,
        name: user.name || `${user.givenName || ''} ${user.familyName || ''}`.trim() || 'Google User',
        photoURL: user.photo || null,
        uid: user.id,
        loginTime: new Date().toISOString(),
        loginMethod: 'google'
      };

      // Store in AsyncStorage for local session
      await AsyncStorage.setItem('userSession', JSON.stringify(userData));
      console.log('User session stored successfully');

      // Try to store in Firebase Database using REST API (to avoid deprecation warnings)
      try {
        const firebaseUrl = 'https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app';
        
        // Check if user exists
        const checkResponse = await fetch(`${firebaseUrl}/users/${user.id}.json`);
        const existingUser = await checkResponse.json();

        if (!existingUser) {
          // First time login - store all credentials
          const newUserData = {
            ...userData,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          
          await fetch(`${firebaseUrl}/users/${user.id}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUserData)
          });
          console.log('New user credentials stored in Firebase Database');
        } else {
          // User exists - just update last login time
          const updateData = {
            lastLoginAt: new Date().toISOString(),
            photoURL: user.photo || existingUser.photoURL
          };
          
          await fetch(`${firebaseUrl}/users/${user.id}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          });
          console.log('User login time updated in Firebase Database');
        }
      } catch (firebaseError) {
        console.error('Firebase error (continuing without it):', firebaseError);
      }

      // Navigate directly
      Alert.alert(
        'Login Successful!', 
        `Welcome ${userData.name}!`,
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
      
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = error.message || 'Google Sign-In failed';
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      // Create user session data
      const userData = {
        userType: 'patient',
        email: formData.email,
        name: formData.name || 'Patient User',
        loginTime: new Date().toISOString()
      };

      // Store user session
      await AsyncStorage.setItem('userSession', JSON.stringify(userData));
      
      // Navigate to patient dashboard (tabs)
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
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
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="person" size={40} color="white" />
            <Text style={styles.headerTitle}>Patient {isLogin ? 'Login' : 'Register'}</Text>
            <Text style={styles.headerSubtitle}>Access your health dashboard</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
              />
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
              />
            </View>

            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.authButtonGradient}
              >
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Login' : 'Register'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
                {/* Google OAuth Login Button */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <View style={styles.googleButtonContent}>
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                    <Text style={styles.googleButtonText}>
                      {isLoading ? 'Authenticating...' : 'Login with Google'}
                    </Text>
                  </View>
                </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
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
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 30,
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
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  authButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  authButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  googleButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 10,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
});

export default PatientLoginScreen;