import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Conditional import for LinearGradient with fallback
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

const { width } = Dimensions.get('window');

const ActiveAppointments = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Generate colors based on appointment ID
  const generateAppointmentColors = (id) => {
    const colorSets = [
      ['#667eea', '#764ba2'],
      ['#4ECDC4', '#44D8A8'],
      ['#6C5CE7', '#A29BFE'],
      ['#FF9A8B', '#A8E6CF'],
      ['#FFD93D', '#6BCF7F'],
      ['#A8E6CF', '#88D8C0'],
      ['#fd746c', '#ff9068'],
      ['#36d1dc', '#5b86e5']
    ];
    const index = (id?.length || 0) % colorSets.length;
    return colorSets[index];
  };

  useEffect(() => {
    loadUserData();
    loadAppointments();
    
    // Set up daily cleanup at 11:57 PM
    const setupDailyCleanup = () => {
      const now = new Date();
      const tonight = new Date();
      tonight.setHours(23, 57, 0, 0); // 11:57 PM
      
      // If it's already past 11:57 PM today, schedule for tomorrow
      if (now > tonight) {
        tonight.setDate(tonight.getDate() + 1);
      }
      
      const timeUntilCleanup = tonight.getTime() - now.getTime();
      
      setTimeout(() => {
        cleanupExpiredAppointments();
        
        // Set up recurring daily cleanup
        const dailyInterval = setInterval(() => {
          cleanupExpiredAppointments();
        }, 24 * 60 * 60 * 1000); // Every 24 hours
        
        return () => clearInterval(dailyInterval);
      }, timeUntilCleanup);
    };

    setupDailyCleanup();

    // Run cleanup once on startup (optional)
    setTimeout(() => {
      cleanupExpiredAppointments();
    }, 2000);

  }, []);

  const loadUserData = async () => {
    try {
      const userSession = await AsyncStorage.getItem('userSession');
      if (userSession) {
        const userData = JSON.parse(userSession);
        setUserEmail(userData.email || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Get user email
      const userSession = await AsyncStorage.getItem('userSession');
      let currentUserEmail = '';
      if (userSession) {
        const userData = JSON.parse(userSession);
        currentUserEmail = userData.email || '';
      }

      if (!currentUserEmail) {
        setAppointments([]);
        return;
      }

      // Fetch all appointments from Firebase
      const response = await fetch(
        'https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/appointments.json'
      );
      const appointmentsResponse = await response.json();
      
      if (appointmentsResponse) {
        // Convert Firebase object to array and filter by user email
        const appointmentsArray = Object.keys(appointmentsResponse)
          .map(key => ({
            id: key,
            ...appointmentsResponse[key],
            colors: generateAppointmentColors(key)
          }))
          .filter(appointment => appointment.patientEmail === currentUserEmail)
          .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)); // Sort by most recent first
        
        setAppointments(appointmentsArray);
        console.log('Loaded appointments:', appointmentsArray.length);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const cancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Update appointment status to cancelled
              await fetch(
                `https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/appointments/${appointmentId}.json`,
                {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'cancelled' })
                }
              );
              
              // Reload appointments
              loadAppointments();
              Alert.alert('Success', 'Appointment cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if video call should be enabled (10 minutes before appointment time)
  const isVideoCallEnabled = (appointment) => {
    console.log('=== VIDEO CALL CHECK START ===');
    console.log('Appointment data:', {
      id: appointment.id,
      status: appointment.status,
      roomId: appointment.roomId,
      selectedDate: appointment.selectedDate,
      selectedTime: appointment.selectedTime,
      doctorName: appointment.doctorName
    });

    if (appointment.status !== 'confirmed' || !appointment.roomId) {
      console.log('Call disabled: status or roomId missing', { 
        status: appointment.status, 
        roomId: appointment.roomId,
        statusCheck: appointment.status !== 'confirmed',
        roomIdCheck: !appointment.roomId
      });
      console.log('=== VIDEO CALL CHECK END (FAILED) ===');
      return false;
    }
    
    const now = new Date();
    const appointmentDate = new Date(appointment.selectedDate);
    
    // Parse time more carefully
    const timeStr = appointment.selectedTime;
    if (!timeStr || !timeStr.includes(':')) {
      console.log('Invalid time format:', timeStr);
      return false;
    }
    
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.log('Invalid time values:', { hours, minutes });
      return false;
    }
    
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    // Enable video call 10 minutes before appointment time
    const enableTime = new Date(appointmentDate.getTime() - 10 * 60 * 1000);
    
    // Check if it's the same day
    const isSameDay = now.toDateString() === appointmentDate.toDateString();
    
    // Check if current time is within the allowed window (10 minutes before to appointment end time)
    const isAfterEnableTime = now >= enableTime;
    const isBeforeAppointmentEnd = now <= appointmentDate;
    
    console.log('Video call check:', {
      appointmentId: appointment.id,
      now: now.toLocaleString(),
      appointmentDate: appointmentDate.toLocaleString(),
      enableTime: enableTime.toLocaleString(),
      isSameDay,
      isAfterEnableTime,
      isBeforeAppointmentEnd,
      finalResult: isSameDay && isAfterEnableTime && isBeforeAppointmentEnd
    });
    
    console.log('=== VIDEO CALL CHECK END ===');
    
    return isSameDay && isAfterEnableTime && isBeforeAppointmentEnd;
  };

  // Get time remaining until video call is enabled
  const getTimeUntilEnabled = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.selectedDate);
    
    // Parse time more carefully
    const timeStr = appointment.selectedTime;
    if (!timeStr || !timeStr.includes(':')) {
      return null;
    }
    
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }
    
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    const enableTime = new Date(appointmentDate.getTime() - 10 * 60 * 1000);
    const timeDiff = enableTime.getTime() - now.getTime();
    
    // If time has passed, return null
    if (timeDiff <= 0) return null;
    
    const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursRemaining > 0) {
      return `Available in ${hoursRemaining}h ${minutesRemaining}m`;
    } else {
      return `Available in ${minutesRemaining}m`;
    }
  };

  // Auto-delete appointments after the day ends
  const cleanupExpiredAppointments = async () => {
    try {
      const now = new Date();
      const appointmentsToDelete = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.selectedDate);
        // Delete if appointment date is before today
        return appointmentDate.toDateString() < now.toDateString();
      });

      for (const appointment of appointmentsToDelete) {
        await fetch(
          `https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/appointments/${appointment.id}.json`,
          { method: 'DELETE' }
        );
      }

      if (appointmentsToDelete.length > 0) {
        console.log(`[${new Date().toLocaleString()}] Cleaned up ${appointmentsToDelete.length} expired appointments`);
        loadAppointments(); // Reload to reflect changes
      }
    } catch (error) {
      console.error('Error cleaning up expired appointments:', error);
    }
  };

  const renderAppointmentCard = ({ item }) => {
    // Debug log for each appointment card
    console.log('Rendering appointment card:', {
      id: item.id,
      status: item.status,
      roomId: item.roomId,
      selectedDate: item.selectedDate,
      selectedTime: item.selectedTime,
      doctorName: item.doctorName,
      bookedAt: item.bookedAt
    });

    return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <LinearGradient
          colors={item.colors}
          style={styles.doctorAvatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <FontAwesome5 name="user-md" size={20} color="white" />
        </LinearGradient>
        
        <View style={styles.appointmentInfo}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{item.doctorSpecialty}</Text>
          <Text style={styles.appointmentTime}>
            {item.selectedDate && item.selectedDay 
              ? `${item.selectedDate} (${item.selectedDay}) • ${item.selectedTime}`
              : item.selectedDate 
              ? `${item.selectedDate} • ${item.selectedTime}` 
              : `${item.selectedDay} • ${item.selectedTime}`}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={12} 
            color="white" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>Booked: {formatDate(item.bookedAt)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>Patient: {item.patientEmail}</Text>
        </View>
        
        {item.status === 'confirmed' && item.roomId && (
          <View style={styles.roomIdRow}>
            <Ionicons name="videocam" size={16} color="#4ECDC4" />
            <Text style={styles.roomIdText}>Meeting Room: {item.roomId}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.appointmentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(`/doctor-profile?doctorId=${item.doctorId}`)}
        >
          <Ionicons name="person" size={16} color="#4ECDC4" />
          <Text style={styles.actionButtonText}>View Doctor</Text>
        </TouchableOpacity>
        
        {item.status === 'confirmed' && item.roomId && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.joinMeetingButton]}
            onPress={() => {
              console.log('=== BUTTON CLICK START ===');
              console.log('Join button clicked for appointment:', {
                id: item.id,
                selectedDate: item.selectedDate,
                selectedTime: item.selectedTime,
                roomId: item.roomId,
                status: item.status,
                doctorName: item.doctorName
              });
              
              // Check video call availability only when button is clicked
              const callEnabled = isVideoCallEnabled(item);
              
              console.log('Call enabled result:', callEnabled);
              
              if (callEnabled) {
                console.log('Joining video call with room ID:', item.roomId);
                console.log('=== NAVIGATING TO VIDEO CALL ===');
                // Join the call
                router.push({
                  pathname: '/video-call-test',
                  params: {
                    roomId: item.roomId,
                    userName: item.patientName || item.userName || 'Patient',
                    userId: `patient_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
                  }
                });
              } else {
                console.log('Call not enabled, checking time until enabled...');
                // Show availability message
                const timeUntilEnabled = getTimeUntilEnabled(item);
                console.log('Time until enabled:', timeUntilEnabled);
                
                if (timeUntilEnabled) {
                  console.log('Showing "not available yet" alert');
                  Alert.alert(
                    'Video Call Not Available Yet', 
                    `The video call will be available ${timeUntilEnabled.toLowerCase()}.\n\nVideo calls are enabled 10 minutes before your appointment time.\n\nAppointment: ${item.selectedDate} at ${item.selectedTime}`,
                    [{ text: 'OK' }]
                  );
                } else {
                  console.log('Checking if appointment time has passed...');
                  // Check if appointment time has passed
                  const now = new Date();
                  const appointmentDate = new Date(item.selectedDate);
                  const [hours, minutes] = item.selectedTime.split(':');
                  appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                  
                  console.log('Time comparison:', {
                    now: now.toLocaleString(),
                    appointmentDate: appointmentDate.toLocaleString(),
                    hasPassed: now > appointmentDate
                  });
                  
                  if (now > appointmentDate) {
                    console.log('Showing "appointment passed" alert');
                    Alert.alert(
                      'Appointment Time Passed', 
                      'This appointment time has already passed. Please contact the doctor if you need assistance.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    console.log('Showing "unavailable" alert');
                    Alert.alert(
                      'Video Call Unavailable', 
                      'There seems to be an issue with the video call setup. Please try again or contact support.',
                      [{ text: 'OK' }]
                    );
                  }
                }
              }
              console.log('=== BUTTON CLICK END ===');
            }}
          >
            <Ionicons name="videocam" size={16} color="#059669" />
            <Text style={[styles.actionButtonText, { color: '#059669' }]}>Join Video Call</Text>
          </TouchableOpacity>
        )}
        
        {item.status !== 'cancelled' && item.status !== 'confirmed' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => cancelAppointment(item.id)}
          >
            <Ionicons name="close" size={16} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#4ECDC4', '#44D8A8']}
        style={styles.emptyIcon}
      >
        <Ionicons name="calendar-outline" size={40} color="white" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No Appointments Yet</Text>
      <Text style={styles.emptySubtitle}>
        Book your first appointment with our expert doctors
      </Text>
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => console.log('Book Appointment pressed')}
      >
        <LinearGradient
          colors={['#4ECDC4', '#44D8A8']}
          style={styles.bookButtonGradient}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" translucent={false} />
      
      {/* Header */}
      <LinearGradient
        colors={['#4ECDC4', '#44D8A8']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Active Appointments</Text>
          
          <TouchableOpacity 
            style={styles.refreshIcon}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {appointments.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}
        
        <FlatList
          data={appointments}
          renderItem={renderAppointmentCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={!loading ? renderEmptyState : null}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    paddingVertical: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  
  // Appointment Card
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  
  // Appointment Details
  appointmentDetails: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  
  // Actions
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Room ID Styles
  roomIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  roomIdText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  joinMeetingButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#059669',
  },
  disabledMeetingButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

export default ActiveAppointments;
