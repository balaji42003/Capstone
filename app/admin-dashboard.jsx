import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [adminName, setAdminName] = useState('');
  const [adminPhoto, setAdminPhoto] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const tabs = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { id: 'Doctors', label: 'Doctors', icon: 'people-outline' },
    { id: 'Analytics', label: 'Analytics', icon: 'analytics-outline' },
    { id: 'Settings', label: 'Settings', icon: 'settings-outline' },
  ];

  useEffect(() => {
    loadAdminData();
    loadDoctors();
    loadVerifiedDoctors();
  }, []);

  const loadAdminData = async () => {
    try {
      const adminData = await AsyncStorage.getItem('adminData');
      if (adminData) {
        const admin = JSON.parse(adminData);
        setAdminName(admin.name || 'Admin');
        setAdminPhoto(admin.photo);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await fetch(
        'https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/doctors.json'
      );
      const data = await response.json();
      
      if (data) {
        const doctorsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setDoctors(doctorsList);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadVerifiedDoctors = async () => {
    try {
      const response = await fetch(
        'https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/verification.json'
      );
      const data = await response.json();
      
      if (data) {
        const verifiedDoctorsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setVerifiedDoctors(verifiedDoctorsList);
      }
    } catch (error) {
      console.error('Error loading verified doctors:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDoctors();
    await loadVerifiedDoctors();
    setRefreshing(false);
  };

  const updateDoctorStatus = async (doctorId, status) => {
    try {
      await fetch(
        `https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/doctors/${doctorId}.json`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verificationStatus: status })
        }
      );
      
      setDoctors(prev => 
        prev.map(doctor => 
          doctor.id === doctorId 
            ? { ...doctor, verificationStatus: status }
            : doctor
        )
      );

      Alert.alert('Success', `Doctor ${status} successfully!`);
    } catch (error) {
      console.error('Error updating doctor status:', error);
      Alert.alert('Error', 'Failed to update doctor status');
    }
  };

  const generateVerificationCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const sendVerificationEmail = async (doctorEmail, doctorName, verificationCode) => {
    const emailData = {
      name: doctorName,
      email: doctorEmail,
      verification_code: verificationCode
    };

    try {
      console.log('Sending verification email with data:', emailData);

      const response = await fetch('http://10.3.5.210:5008/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Verification email sent successfully to:', doctorEmail);
        return true;
      } else {
        console.error('Flask email error:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Failed to send verification email:', error);
      console.error('Error details:', error.message);
      return false;
    }
  };

  const approveDoctorAndCreateVerification = async (doctor) => {
    try {
      // Show loading state
      Alert.alert('Processing', 'Approving doctor and sending verification email...', 
        [], { cancelable: false });

      const verificationCode = generateVerificationCode();
      
      // 1. Update doctor status to 'approved' in doctors node (preserve all data)
      const updatedDoctorData = {
        ...doctor,
        verificationStatus: 'approved',
        approvedAt: new Date().toISOString(),
        verificationCode: verificationCode
      };

      const doctorUpdateResponse = await fetch(
        `https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/doctors/${doctor.id}.json`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDoctorData)
        }
      );

      if (!doctorUpdateResponse.ok) {
        throw new Error('Failed to update doctor status');
      }

      // 2. Create verification record for email/verification purposes
      const verificationData = {
        email: doctor.email,
        name: doctor.name,
        verificationCode: verificationCode,
        doctorId: doctor.id,
        createdAt: new Date().toISOString(),
        status: 'approved',
        emailSent: false,
        emailSentAt: null,
        // Include essential doctor info for verification reference
        specialty: doctor.specialty,
        phone: doctor.phone,
        licenseNumber: doctor.licenseNumber
      };

      // Store in verification node
      const verificationResponse = await fetch(
        'https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/verification.json',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verificationData)
        }
      );

      if (!verificationResponse.ok) {
        throw new Error('Failed to create verification record');
      }

      // 3. Send verification email
      const emailSent = await sendVerificationEmail(
        doctor.email, 
        doctor.name, 
        verificationCode
      );

      // 4. Update verification record with email status
      const verificationResult = await verificationResponse.json();
      const verificationId = verificationResult.name;
      
      await fetch(
        `https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/verification/${verificationId}.json`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            emailSent: emailSent, 
            emailSentAt: emailSent ? new Date().toISOString() : null 
          })
        }
      );

      // 5. Update local state to reflect the approval
      setDoctors(prev => 
        prev.map(d => 
          d.id === doctor.id 
            ? { ...d, verificationStatus: 'approved', verificationCode: verificationCode }
            : d
        )
      );

      // 6. Reload verified doctors to update the verification list
      await loadVerifiedDoctors();

      // Show success message
      Alert.alert(
        'Doctor Approved Successfully!',
        `Dr. ${doctor.name} has been approved and notified!\n\n` +
        `✅ Verification Code: ${verificationCode}\n` +
        `📧 Email Status: ${emailSent ? 'Sent Successfully' : 'Failed to Send'}\n` +
        `📮 Sent to: ${doctor.email}\n\n` +
        `${emailSent ? 
          'The doctor will receive an email with their verification code and can now access the doctor verification portal.' : 
          'Please manually share the verification code with the doctor as the email failed to send.'
        }\n\n` +
        `💾 Doctor data has been preserved in the doctors database with approved status.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error approving doctor:', error);
      Alert.alert(
        'Approval Failed', 
        `Failed to approve Dr. ${doctor.name}. Please try again.\n\nError: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Test Email Function
  const testEmailFunctionality = async () => {
    const emailData = {
      name: 'Admin Test',
      email: '99220042003@klu.ac.in',
      verification_code: 'TEST'
    };

    try {
      console.log('Testing email functionality...');
      console.log('Sending test email with data:', emailData);

      const response = await fetch('http://10.3.5.210:5008/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Test email sent successfully!');
        Alert.alert('Success!', 'Test email sent successfully to 99220042003@klu.ac.in!');
        return true;
      } else {
        console.error('Flask email error:', result.error);
        Alert.alert('Test Failed', `Email failed: ${result.error || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Test Failed', 'Something went wrong while sending the email. Make sure Flask server is running.');
      return false;
    }
  };

  const logout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('adminData');
            router.replace('/landing');
          }
        }
      ]
    );
  };

  const renderDoctorCard = ({ item }) => {
    const isExpanded = expandedCards[item.id] || false;

    const toggleExpanded = () => {
      setExpandedCards(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    };

    return (
      <View style={styles.doctorCard}>
        <View style={styles.doctorHeader}>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. {item.name}</Text>
            <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
            
            {/* Basic Details - Always Visible */}
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorDetail}>📧 {item.email}</Text>
              <Text style={styles.doctorDetail}>📞 {item.phone}</Text>
              <Text style={styles.doctorDetail}>🏥 {item.experience} years exp.</Text>
            </View>

            {/* Extended Details - Show More */}
            {isExpanded && (
              <View style={styles.extendedDetails}>
                <Text style={styles.detailSeparator}>• • •</Text>
                <Text style={styles.doctorDetail}>🆔 License: {item.licenseNumber}</Text>
                <Text style={styles.doctorDetail}>🎓 Qualification: {item.qualification}</Text>
                <Text style={styles.doctorDetail}>🏥 Hospital: {item.hospitalAffiliation}</Text>
                <Text style={styles.doctorDetail}>📍 Address: {item.address}</Text>
                <Text style={styles.doctorDetail}>💰 Consultation Fee: ₹{item.consultationFee}</Text>
                {item.registrationDate && (
                  <Text style={styles.doctorDetail}>📅 Registered: {new Date(item.registrationDate).toLocaleDateString()}</Text>
                )}
              </View>
            )}

            {/* Show More/Less Button */}
            <TouchableOpacity 
              style={styles.showMoreBtn}
              onPress={toggleExpanded}
            >
              <Text style={styles.showMoreText}>
                {isExpanded ? 'Show Less' : 'Show More'}
              </Text>
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#667eea" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: (item.verificationStatus || item.status) === 'approved' ? '#dcfce7' : 
                               (item.verificationStatus || item.status) === 'rejected' ? '#fef2f2' : '#fef3c7' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: (item.verificationStatus || item.status) === 'approved' ? '#16a34a' : 
                       (item.verificationStatus || item.status) === 'rejected' ? '#dc2626' : '#d97706' }
            ]}>
              {(item.verificationStatus || item.status)?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>

        {(item.verificationStatus || item.status) === 'pending' && (
          <View style={styles.doctorActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => approveDoctorAndCreateVerification(item)}
            >
              <Text style={styles.actionBtnText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => updateDoctorStatus(item.id, 'rejected')}
            >
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderDashboard = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {[
            { 
              title: 'Total Approved', 
              value: verifiedDoctors.filter(d => d.status === 'approved').length.toString(), 
              icon: 'people',
              color: '#3b82f6'
            },
            { 
              title: 'Pending Requests', 
              value: doctors.filter(d => !d.verificationStatus || d.verificationStatus === 'pending').length.toString(), 
              icon: 'time',
              color: '#f59e0b'
            },
            { 
              title: 'Recently Approved', 
              value: verifiedDoctors.filter(d => d.status === 'approved').length.toString(), 
              icon: 'checkmark-circle',
              color: '#10b981'
            },
            { 
              title: 'Rejected', 
              value: doctors.filter(d => d.verificationStatus === 'rejected').length.toString(), 
              icon: 'close-circle',
              color: '#ef4444'
            },
          ].map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { title: 'Pending Requests', icon: 'people', color: '#8b5cf6', action: () => setActiveTab('Doctors') },
            { title: 'View Analytics', icon: 'analytics', color: '#06b6d4', action: () => setActiveTab('Analytics') },
            { title: 'System Settings', icon: 'settings', color: '#84cc16', action: () => setActiveTab('Settings') },
            { title: 'Test Email', icon: 'mail', color: '#f97316', action: testEmailFunctionality },
          ].map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionCard} onPress={action.action}>
              <Ionicons name={action.icon} size={24} color={action.color} />
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Doctor Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <TouchableOpacity onPress={() => setActiveTab('Doctors')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {doctors.filter(d => !d.verificationStatus || d.verificationStatus === 'pending').slice(0, 3).map((doctor) => (
          <View key={doctor.id}>
            {renderDoctorCard({ item: doctor })}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDoctors = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Doctor Requests Management</Text>
        <TouchableOpacity onPress={loadDoctors}>
          <Ionicons name="refresh" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
      
      {loadingDoctors ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading doctor requests...</Text>
        </View>
      ) : (
        <FlatList
          data={doctors.filter(d => !d.verificationStatus || d.verificationStatus === 'pending')}
          renderItem={renderDoctorCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Pending Requests</Text>
              <Text style={styles.emptyText}>All doctor registration requests have been processed</Text>
            </View>
          )}
        />
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return renderDashboard();
      case 'Doctors':
        return renderDoctors();
      case 'Analytics':
        return (
          <View style={styles.comingSoon}>
            <Ionicons name="analytics-outline" size={64} color="#9ca3af" />
            <Text style={styles.comingSoonTitle}>Analytics</Text>
            <Text style={styles.comingSoonText}>Advanced analytics coming soon</Text>
          </View>
        );
      case 'Settings':
        return (
          <View style={styles.comingSoon}>
            <Ionicons name="settings-outline" size={64} color="#9ca3af" />
            <Text style={styles.comingSoonTitle}>Settings</Text>
            <Text style={styles.comingSoonText}>System settings coming soon</Text>
          </View>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f8fafc" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backIconContainer}>
            <Ionicons name="arrow-back" size={22} color="#667eea" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.adminProfile}>
          <Text style={styles.adminTitle}>{adminName || 'Admin'}</Text>
          <View style={styles.profileIcon}>
            {adminPhoto ? (
              <Image 
                source={{ uri: adminPhoto }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={20} color="#667eea" />
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentWrapper}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navBtn, activeTab === tab.id && styles.activeNavBtn]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.navCard}>
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? '#667eea' : '#9ca3af'} 
              />
              <Text style={[
                styles.navText,
                activeTab === tab.id && styles.activeNavText
              ]}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: '#f7f9fc',
  },
  backButton: {
    padding: 8,
  },
  backIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  adminProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
  },
  contentWrapper: {
    flex: 1,
    paddingTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
  },
  viewAll: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2d3748',
  },
  statLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
  },
  doctorCard: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 12,
    fontWeight: '600',
  },
  doctorDetails: {
    gap: 6,
    marginBottom: 12,
  },
  doctorDetail: {
    fontSize: 13,
    color: '#718096',
  },
  extendedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  detailSeparator: {
    fontSize: 12,
    color: '#cbd5e0',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  showMoreText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
    marginRight: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doctorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#48bb78',
  },
  rejectBtn: {
    backgroundColor: '#e53e3e',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#718096',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navCard: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 60,
    gap: 4,
  },
  activeNavBtn: {
    backgroundColor: 'transparent',
  },
  navText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#667eea',
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AdminDashboard;
