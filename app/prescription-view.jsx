import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

const { width, height } = Dimensions.get('window');

const PrescriptionView = () => {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showFullPrescription, setShowFullPrescription] = useState(false);

  // Sample prescriptions data with different doctors
  const samplePrescriptions = [
    {
      id: 'P001',
      patientName: 'John Doe',
      patientAge: '35',
      patientGender: 'Male',
      doctorName: 'Dr. Sarah Wilson',
      doctorSpecialty: 'General Physician',
      doctorQualification: 'MBBS, MD',
      doctorExperience: '12 years',
      hospitalName: 'City Medical Center',
      hospitalAddress: '123 Main Street, Downtown',
      date: '2025-09-10',
      diagnosis: 'Upper Respiratory Tract Infection',
      symptoms: ['Cough', 'Fever', 'Sore Throat', 'Body Ache'],
      medicines: [
        {
          id: 1,
          name: 'Azithromycin',
          type: 'Tablet',
          dosage: '500mg',
          frequency: 'Once daily',
          duration: '5 days',
          instructions: 'Take after meals'
        },
        {
          id: 2,
          name: 'Paracetamol',
          type: 'Tablet',
          dosage: '650mg',
          frequency: 'Twice daily',
          duration: '3 days',
          instructions: 'Take when fever occurs'
        }
      ],
      advice: [
        'Take plenty of rest',
        'Drink warm water',
        'Avoid cold foods',
        'Return if symptoms persist after 5 days'
      ],
      nextVisit: '2025-09-18',
      prescriptionNumber: 'RX-2025-001234'
    },
    {
      id: 'P002',
      patientName: 'John Doe',
      patientAge: '35',
      patientGender: 'Male',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialty: 'Cardiologist',
      doctorQualification: 'MBBS, MD, DM Cardiology',
      doctorExperience: '15 years',
      hospitalName: 'Heart Care Institute',
      hospitalAddress: '456 Health Avenue, Medical District',
      date: '2025-09-05',
      diagnosis: 'Hypertension',
      symptoms: ['High Blood Pressure', 'Headache', 'Dizziness'],
      medicines: [
        {
          id: 1,
          name: 'Amlodipine',
          type: 'Tablet',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning'
        },
        {
          id: 2,
          name: 'Metoprolol',
          type: 'Tablet',
          dosage: '25mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with food'
        }
      ],
      advice: [
        'Monitor blood pressure daily',
        'Reduce salt intake',
        'Regular exercise',
        'Avoid stress'
      ],
      nextVisit: '2025-10-05',
      prescriptionNumber: 'RX-2025-001235'
    },
    {
      id: 'P003',
      patientName: 'John Doe',
      patientAge: '35',
      patientGender: 'Male',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialty: 'Dermatologist',
      doctorQualification: 'MBBS, MD Dermatology',
      doctorExperience: '8 years',
      hospitalName: 'Skin Care Clinic',
      hospitalAddress: '789 Beauty Lane, Wellness Center',
      date: '2025-08-28',
      diagnosis: 'Eczema',
      symptoms: ['Dry Skin', 'Itching', 'Redness', 'Inflammation'],
      medicines: [
        {
          id: 1,
          name: 'Hydrocortisone Cream',
          type: 'Cream',
          dosage: '1%',
          frequency: 'Twice daily',
          duration: '14 days',
          instructions: 'Apply thin layer on affected area'
        },
        {
          id: 2,
          name: 'Cetirizine',
          type: 'Tablet',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '10 days',
          instructions: 'Take at bedtime'
        }
      ],
      advice: [
        'Keep skin moisturized',
        'Avoid harsh soaps',
        'Use cotton clothing',
        'Avoid scratching'
      ],
      nextVisit: '2025-09-15',
      prescriptionNumber: 'RX-2025-001236'
    }
  ];

  useEffect(() => {
    loadPrescriptionsData();
  }, []);

  const loadPrescriptionsData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPrescriptions(samplePrescriptions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setLoading(false);
    }
  };

  const handleOpenPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowFullPrescription(true);
  };

  const handleClosePrescription = () => {
    setShowFullPrescription(false);
    setSelectedPrescription(null);
  };

  const renderPrescriptionListItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.prescriptionCard}
      onPress={() => handleOpenPrescription(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.specialty}>{item.doctorSpecialty}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.viewText}>Tap to view prescription</Text>
        <Ionicons name="chevron-forward" size={20} color="#4ECDC4" />
      </View>
    </TouchableOpacity>
  );

  const renderMedicineCard = (medicine) => (
    <View key={medicine.id} style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <Text style={styles.medicineName}>{medicine.name}</Text>
        <Text style={styles.medicineType}>{medicine.type}</Text>
      </View>
      
      <View style={styles.medicineDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="medical-services" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Dosage: {medicine.dosage}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Frequency: {medicine.frequency}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>Duration: {medicine.duration}</Text>
        </View>
        {medicine.instructions && (
          <View style={styles.detailRow}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Instructions: {medicine.instructions}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Prescriptions</Text>
          <Text style={styles.headerSubtitle}>
            {prescriptions.length} prescription{prescriptions.length > 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerButton} />
      </LinearGradient>

      {/* Prescription List */}
      <FlatList
        data={prescriptions}
        renderItem={renderPrescriptionListItem}
        keyExtractor={(item) => item.id}
        style={styles.prescriptionList}
        contentContainerStyle={styles.prescriptionListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Full Prescription Modal */}
      <Modal
        visible={showFullPrescription}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
          
          {/* Modal Header */}
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={handleClosePrescription}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prescription Details</Text>
            <View style={styles.headerButton} />
          </LinearGradient>

          {selectedPrescription && (
            <ScrollView style={styles.documentContainer} showsVerticalScrollIndicator={false}>
              {/* Document Header */}
              <View style={styles.documentHeader}>
                <View style={styles.documentTitleSection}>
                  <Text style={styles.documentTitle}>MEDICAL PRESCRIPTION</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <View style={styles.prescriptionInfoRow}>
                  <View style={styles.prescriptionInfoLeft}>
                    <Text style={styles.prescriptionLabel}>Prescription No:</Text>
                    <Text style={styles.prescriptionValue}>{selectedPrescription.prescriptionNumber}</Text>
                  </View>
                  <View style={styles.prescriptionInfoRight}>
                    <Text style={styles.prescriptionLabel}>Date:</Text>
                    <Text style={styles.prescriptionValue}>{selectedPrescription.date}</Text>
                  </View>
                </View>
              </View>

              {/* Document Body */}
              <View style={styles.documentBody}>
                
                {/* Diagnosis Section */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>DIAGNOSIS</Text>
                  <View style={styles.formField}>
                    <Text style={styles.formFieldValue}>{selectedPrescription.diagnosis}</Text>
                  </View>
                </View>

                {/* Symptoms Section */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>SYMPTOMS</Text>
                  <View style={styles.formField}>
                    <Text style={styles.formFieldValue}>
                      {selectedPrescription.symptoms.join(', ')}
                    </Text>
                  </View>
                </View>

                {/* Prescription Table */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>PRESCRIBED MEDICINES</Text>
                  
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Medicine</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Dosage</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Frequency</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Duration</Text>
                  </View>

                  {/* Table Rows */}
                  {selectedPrescription.medicines.map((medicine, index) => (
                    <View key={medicine.id} style={styles.tableRow}>
                      <View style={[styles.tableCell, { flex: 2 }]}>
                        <Text style={styles.tableCellText}>{medicine.name}</Text>
                        <Text style={styles.tableCellSubText}>({medicine.type})</Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={styles.tableCellText}>{medicine.dosage}</Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1.5 }]}>
                        <Text style={styles.tableCellText}>{medicine.frequency}</Text>
                      </View>
                      <View style={[styles.tableCell, { flex: 1 }]}>
                        <Text style={styles.tableCellText}>{medicine.duration}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Instructions Section */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>INSTRUCTIONS</Text>
                  {selectedPrescription.medicines.map((medicine, index) => (
                    medicine.instructions && (
                      <View key={index} style={styles.instructionRow}>
                        <Text style={styles.instructionNumber}>{index + 1}.</Text>
                        <Text style={styles.instructionText}>
                          {medicine.name}: {medicine.instructions}
                        </Text>
                      </View>
                    )
                  ))}
                </View>

                {/* Doctor's Advice Section */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>DOCTOR'S ADVICE</Text>
                  {selectedPrescription.advice.map((advice, index) => (
                    <View key={index} style={styles.adviceRow}>
                      <Text style={styles.adviceNumber}>• </Text>
                      <Text style={styles.adviceText}>{advice}</Text>
                    </View>
                  ))}
                </View>

                {/* Next Visit Section */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>NEXT VISIT</Text>
                  <View style={styles.formField}>
                    <Text style={styles.formFieldLabel}>Scheduled Date:</Text>
                    <Text style={styles.formFieldValue}>{selectedPrescription.nextVisit}</Text>
                  </View>
                </View>

                {/* Document Footer */}
                <View style={styles.documentFooter}>
                  <View style={styles.signatureSection}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureLabel}>Doctor's Signature</Text>
                  </View>
                  <View style={styles.stampSection}>
                    <View style={styles.stampBox}>
                      <Text style={styles.stampText}>HOSPITAL STAMP</Text>
                    </View>
                  </View>
                </View>

              </View>
              
              <View style={styles.documentPadding} />
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
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
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  prescriptionList: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  prescriptionListContent: {
    padding: 16,
    paddingBottom: 30,
  },
  prescriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  dateContainer: {
    backgroundColor: '#F0F8F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  viewText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },





  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  hospitalName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  diagnosisSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  diagnosisLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  medicineCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicineCountText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  prescriptionHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalPrescriptionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  modalPrescriptionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  diagnosisTextFull: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 16,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  symptomText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  medicineCard: {
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
  medicineHeader: {
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicineType: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  medicineDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
  // Document/Form Styles
  documentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  documentHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  documentTitleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: 1,
  },
  dividerLine: {
    width: 80,
    height: 2,
    backgroundColor: '#4ECDC4',
    marginTop: 4,
  },
  prescriptionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prescriptionInfoLeft: {
    flex: 1,
  },
  prescriptionInfoRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  prescriptionLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  prescriptionValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: 'bold',
    marginTop: 2,
  },
  documentBody: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flex: 1,
  },
  formSection: {
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  formField: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formFieldLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  formFieldValue: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 2,
    borderTopColor: '#4ECDC4',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  tableCell: {
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  tableCellSubText: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 1,
  },
  instructionRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#4ECDC4',
  },
  instructionNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginRight: 8,
    minWidth: 16,
  },
  instructionText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 16,
  },
  adviceRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  adviceNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#22C55E',
    marginRight: 6,
    minWidth: 16,
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  signatureSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: '#374151',
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  stampSection: {
    alignItems: 'flex-end',
  },
  stampBox: {
    width: 100,
    height: 60,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  stampText: {
    fontSize: 8,
    color: '#9CA3AF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  documentPadding: {
    height: 20,
  },
});

export default PrescriptionView;
