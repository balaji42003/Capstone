import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Try importing Zego
let ZegoUIKitPrebuiltCall, ONE_ON_ONE_VIDEO_CALL_CONFIG;
let isZegoAvailable = false;

try {
  const ZegoImports = require('@zegocloud/zego-uikit-prebuilt-call-rn');
  ZegoUIKitPrebuiltCall = ZegoImports.ZegoUIKitPrebuiltCall;
  ONE_ON_ONE_VIDEO_CALL_CONFIG = ZegoImports.ONE_ON_ONE_VIDEO_CALL_CONFIG;
  isZegoAvailable = true;
} catch (error) {
  console.log('Zego not available in Expo:', error.message);
}

export default function VideoCallTest() {
  const router = useRouter();

  // Your actual Zego credentials
  const yourAppID = 1376271159;
  const yourAppSign = "a1518288cbabc045c50352c15fe07734bec085a60d3f4a128d4e135cefb53d40";
  
  // Test data
  const userID = "test_user_123";
  const userName = "Test User";
  const callID = "test_call_room";

  if (!isZegoAvailable) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={64} color="#e53e3e" />
        <Text style={styles.errorTitle}>Zego Not Available</Text>
        <Text style={styles.errorText}>
          Zego UIKit doesn't work with Expo.{'\n'}
          Native modifications required.
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ZegoUIKitPrebuiltCall
        appID={yourAppID}
        appSign={yourAppSign}
        userID={userID}
        userName={userName}
        callID={callID}
        config={{
          ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
          onCallEnd: (callID, reason, duration) => {
            console.log('Call ended:', { callID, reason, duration });
            router.back();
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e53e3e',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
