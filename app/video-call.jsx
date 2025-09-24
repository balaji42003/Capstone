import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  console.log('Zego not available:', error.message);
}

export default function VideoCall() {
  const router = useRouter();
  const { roomId, userName, userId } = useLocalSearchParams();

  // TODO: Replace with your new Zego credentials
  const yourAppID = 1080551434; // Replace with your new App ID
  const yourAppSign = "f5c03e885dce1bf07aef858efeaebe06ae7cabe2f427c498d43a2d1aa3cde79f"; // Replace with your new App Sign
  
  const callID = roomId;
  const displayName = userName;
  const userIdentifier = userId;

  // Validate required parameters
  if (!callID || !displayName || !userIdentifier) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={64} color="#e53e3e" />
        <Text style={styles.errorTitle}>Missing Parameters</Text>
        <Text style={styles.errorText}>
          Room ID, username, and user ID are required.
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

  // Check if credentials are set
  if (!yourAppID || !yourAppSign) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="settings-outline" size={64} color="#f59e0b" />
        <Text style={styles.errorTitle}>Setup Required</Text>
        <Text style={styles.errorText}>
          Please add your Zego App ID and App Sign in video-call.jsx
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

  if (!isZegoAvailable) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={64} color="#e53e3e" />
        <Text style={styles.errorTitle}>Zego Not Available</Text>
        <Text style={styles.errorText}>
          Video calling requires native build.{'\n'}
          Run: npx expo run:android
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
        userID={userIdentifier}
        userName={displayName}
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