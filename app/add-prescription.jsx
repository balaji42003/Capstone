import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_ENDPOINTS } from "../config/api.config";

let LinearGradient;
try {
  LinearGradient = require("expo-linear-gradient").LinearGradient;
} catch (e) {
  LinearGradient = ({ children, colors, style, ...props }) => (
    <View
      style={[style, { backgroundColor: colors?.[0] || "#4ECDC4" }]}
      {...props}
    >
      {children}
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const AddPrescription = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAppointmentList, setShowAppointmentList] = useState(true);
  const [loading, setLoading] = useState(false);

  // Prescription form states
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [advice, setAdvice] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDoctorData();
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadAppointments();
    }
  }, [doctorId]);

  useEffect(() => {
    // Filter appointments based on search query
    const filtered = appointments.filter(
      (apt) =>
        apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAppointments(filtered);
  }, [searchQuery, appointments]);

  const loadDoctorData = async () => {
    try {
      const doctorSession = await AsyncStorage.getItem("doctorSession");
      if (doctorSession) {
        const sessionData = JSON.parse(doctorSession);
        setDoctorId(sessionData.doctorId);
      }
    } catch (error) {
      console.error("Error loading doctor data:", error);
      Alert.alert("Error", "Failed to load doctor information");
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.FIREBASE.APPOINTMENTS);
      const data = await response.json();

      if (data) {
        const doctorAppointments = Object.entries(data)
          .filter(([key, appointment]) => appointment.doctorId === doctorId)
          .map(([key, appointment]) => ({
            id: key,
            ...appointment,
          }));

        setAppointments(doctorAppointments);
        setFilteredAppointments(doctorAppointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      Alert.alert("Error", "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const addMedicineField = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeMedicineField = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const validateForm = () => {
    if (!selectedAppointment) {
      Alert.alert("Error", "Please select an appointment");
      return false;
    }
    if (!diagnosis.trim()) {
      Alert.alert("Error", "Please enter diagnosis");
      return false;
    }
    if (medicines.filter((m) => m.name.trim()).length === 0) {
      Alert.alert("Error", "Please add at least one medicine");
      return false;
    }
    return true;
  };

  const savePrescription = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Filter out empty medicines
      const filteredMedicines = medicines
        .filter((m) => m.name.trim())
        .map((m, index) => ({
          id: index + 1,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        }));

      // Create prescription object
      const prescription = {
        appointmentId: selectedAppointment.id,
        patientEmail: selectedAppointment.patientEmail,
        patientName: selectedAppointment.patientName,
        patientPhone: selectedAppointment.patientPhone || "",
        doctorId: doctorId,
        doctorName: selectedAppointment.doctorName || "Doctor",
        hospitalName: selectedAppointment.hospitalName || "Hospital",
        prescriptionDate: new Date().toISOString().split("T")[0],
        diagnosis: diagnosis,
        symptoms: symptoms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        medicines: filteredMedicines,
        advice: advice
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
        nextVisit: nextVisit || null,
        prescriptionNumber: `RX-${Date.now()}`,
        status: "active",
      };

      // Save to Firebase
      const response = await fetch(
        `https://fresh-a29f6-default-rtdb.asia-southeast1.firebasedatabase.app/prescriptions.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prescription),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save prescription: ${response.status}`);
      }

      const result = await response.json();
      console.log("Prescription saved with ID:", result.name);

      // Send prescription email to patient
      await sendPrescriptionEmail(prescription);

      Alert.alert("Success", "Prescription added successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setSelectedAppointment(null);
            setDiagnosis("");
            setSymptoms("");
            setMedicines([
              {
                name: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
              },
            ]);
            setAdvice("");
            setNextVisit("");
            setShowAppointmentList(true);
            loadAppointments(); // Reload appointments
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving prescription:", error);
      Alert.alert("Error", `Failed to save prescription: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const sendPrescriptionEmail = async (prescription) => {
    try {
      const emailResponse = await fetch(API_ENDPOINTS.EMAIL.SEND, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_email: prescription.patientEmail,
          prescription_number: prescription.prescriptionNumber,
          patient_name: prescription.patientName,
          doctor_name: prescription.doctorName,
          diagnosis: prescription.diagnosis,
          date: prescription.prescriptionDate,
        }),
      });

      if (!emailResponse.ok) {
        console.warn("Failed to send email notification");
      }
    } catch (error) {
      console.warn("Error sending prescription email:", error);
      // Don't fail the whole operation if email fails
    }
  };

  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => {
        setSelectedAppointment(item);
        setShowAppointmentList(false);
      }}
    >
      <View style={styles.appointmentHeader}>
        <View>
          <Text style={styles.appointmentPatientName}>{item.patientName}</Text>
          <Text style={styles.appointmentEmail}>{item.patientEmail}</Text>
        </View>
        <View style={styles.appointmentDate}>
          <Text style={styles.appointmentDateText}>{item.selectedDate}</Text>
          <Text style={styles.appointmentTime}>{item.selectedTime}</Text>
        </View>
      </View>
      <View style={styles.appointmentFooter}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "confirmed" ? "#4ECDC4" : "#FFA500",
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (showAppointmentList) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={["#4ECDC4", "#44A08D"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Prescription</Text>
          <View style={{ width: 24 }} />
        </LinearGradient>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient name or email"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <Text>Loading appointments...</Text>
          </View>
        ) : filteredAppointments.length > 0 ? (
          <FlatList
            data={filteredAppointments}
            renderItem={renderAppointmentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.centerContainer}>
            <MaterialIcons name="event-busy" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No appointments found</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Prescription form
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={["#4ECDC4", "#44A08D"]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowAppointmentList(true)}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Prescription</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{selectedAppointment.patientName}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>
              {selectedAppointment.patientEmail}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {selectedAppointment.selectedDate}
            </Text>
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnosis</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter diagnosis"
            placeholderTextColor="#999"
            value={diagnosis}
            onChangeText={setDiagnosis}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptoms (comma-separated)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Fever, Cough, Sore Throat"
            placeholderTextColor="#999"
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Medicines */}
        <View style={styles.section}>
          <View style={styles.medicineHeader}>
            <Text style={styles.sectionTitle}>Medicines</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addMedicineField}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {medicines.map((medicine, index) => (
            <View key={index} style={styles.medicineCard}>
              <View style={styles.medicineField}>
                <Text style={styles.fieldLabel}>Medicine Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Azithromycin"
                  placeholderTextColor="#999"
                  value={medicine.name}
                  onChangeText={(value) =>
                    updateMedicine(index, "name", value)
                  }
                />
              </View>

              <View style={styles.medicineFieldRow}>
                <View style={[styles.medicineField, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.fieldLabel}>Dosage</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 500mg"
                    placeholderTextColor="#999"
                    value={medicine.dosage}
                    onChangeText={(value) =>
                      updateMedicine(index, "dosage", value)
                    }
                  />
                </View>
                <View style={[styles.medicineField, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Frequency</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Twice daily"
                    placeholderTextColor="#999"
                    value={medicine.frequency}
                    onChangeText={(value) =>
                      updateMedicine(index, "frequency", value)
                    }
                  />
                </View>
              </View>

              <View style={styles.medicineFieldRow}>
                <View style={[styles.medicineField, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.fieldLabel}>Duration</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 5 days"
                    placeholderTextColor="#999"
                    value={medicine.duration}
                    onChangeText={(value) =>
                      updateMedicine(index, "duration", value)
                    }
                  />
                </View>
                {medicines.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeMedicineField(index)}
                  >
                    <MaterialIcons name="delete" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.medicineField}>
                <Text style={styles.fieldLabel}>Instructions</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Take after meals"
                  placeholderTextColor="#999"
                  value={medicine.instructions}
                  onChangeText={(value) =>
                    updateMedicine(index, "instructions", value)
                  }
                />
              </View>
            </View>
          ))}
        </View>

        {/* Advice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advice (comma-separated)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Take rest, Drink water, Avoid cold foods"
            placeholderTextColor="#999"
            value={advice}
            onChangeText={setAdvice}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Next Visit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Visit Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={nextVisit}
            onChangeText={setNextVisit}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={savePrescription}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Saving..." : "Save Prescription"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  appointmentCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4ECDC4",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  appointmentPatientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  appointmentEmail: {
    fontSize: 12,
    color: "#666",
  },
  appointmentDate: {
    alignItems: "flex-end",
  },
  appointmentDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  appointmentTime: {
    fontSize: 12,
    color: "#666",
  },
  appointmentFooter: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "white",
    textTransform: "capitalize",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  formContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4ECDC4",
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginTop: 2,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    textAlignVertical: "top",
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#4ECDC4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 12,
  },
  medicineCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  medicineField: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  medicineFieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  removeButton: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddPrescription;
