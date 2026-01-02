import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dataStore, User, Patient, Appointment, Consultation, ChatMessage, ReferralLetter, Notification, Revenue } from '../utils/dataStore';

// Types du contexte
interface DataContextType {
  // Users
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;

  // Patients
  patients: Patient[];
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  getPatientsByDoctor: (doctorId: string) => Patient[];

  // Appointments
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentById: (id: string) => Appointment | undefined;
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];

  // Consultations
  consultations: Consultation[];
  addConsultation: (consultation: Consultation) => void;
  updateConsultation: (id: string, updates: Partial<Consultation>) => void;
  deleteConsultation: (id: string) => void;
  getConsultationById: (id: string) => Consultation | undefined;
  getConsultationsByDoctor: (doctorId: string) => Consultation[];

  // Chat Messages
  getChatMessages: (userId1: string, userId2: string) => ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  deleteChatMessage: (id: string) => void;

  // Referral Letters
  referralLetters: ReferralLetter[];
  addReferralLetter: (referral: ReferralLetter) => void;
  updateReferralLetter: (id: string, updates: Partial<ReferralLetter>) => void;
  deleteReferralLetter: (id: string) => void;
  getReferralLettersByDoctor: (doctorId: string) => ReferralLetter[];

  // Notifications
  getNotifications: (userId: string) => Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;

  // Revenues
  revenues: Revenue[];
  addRevenue: (revenue: Revenue) => void;
  updateRevenue: (id: string, updates: Partial<Revenue>) => void;
  deleteRevenue: (id: string) => void;
  getRevenuesByDoctor: (doctorId: string) => Revenue[];

  // Utilitaires
  refreshData: () => void;
  resetAllData: () => void;
}

// Création du contexte
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider du contexte
export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [referralLetters, setReferralLetters] = useState<ReferralLetter[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);

  // Initialiser les données au chargement
  useEffect(() => {
    dataStore.initialize();
    refreshData();
  }, []);

  // Fonction pour rafraîchir toutes les données
  const refreshData = () => {
    setUsers(dataStore.getUsers());
    setPatients(dataStore.getPatients());
    setAppointments(dataStore.getAppointments());
    setConsultations(dataStore.getConsultations());
    setReferralLetters(dataStore.getReferralLetters());
    setRevenues(dataStore.getRevenues());
  };

  // Users
  const addUser = (user: User) => {
    dataStore.addUser(user);
    refreshData();
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    dataStore.updateUser(id, updates);
    refreshData();
  };

  const deleteUser = (id: string) => {
    dataStore.deleteUser(id);
    refreshData();
  };

  const getUserById = (id: string) => dataStore.getUserById(id);
  const getUserByEmail = (email: string) => dataStore.getUserByEmail(email);

  // Patients
  const addPatient = (patient: Patient) => {
    dataStore.addPatient(patient);
    refreshData();
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    dataStore.updatePatient(id, updates);
    refreshData();
  };

  const deletePatient = (id: string) => {
    dataStore.deletePatient(id);
    refreshData();
  };

  const getPatientById = (id: string) => dataStore.getPatientById(id);
  const getPatientsByDoctor = (doctorId: string) => dataStore.getPatients(doctorId);

  // Appointments
  const addAppointment = (appointment: Appointment) => {
    dataStore.addAppointment(appointment);
    refreshData();
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    dataStore.updateAppointment(id, updates);
    refreshData();
  };

  const deleteAppointment = (id: string) => {
    dataStore.deleteAppointment(id);
    refreshData();
  };

  const getAppointmentById = (id: string) => dataStore.getAppointmentById(id);
  const getAppointmentsByDoctor = (doctorId: string) => dataStore.getAppointments(doctorId);

  // Consultations
  const addConsultation = (consultation: Consultation) => {
    dataStore.addConsultation(consultation);
    refreshData();
  };

  const updateConsultation = (id: string, updates: Partial<Consultation>) => {
    dataStore.updateConsultation(id, updates);
    refreshData();
  };

  const deleteConsultation = (id: string) => {
    dataStore.deleteConsultation(id);
    refreshData();
  };

  const getConsultationById = (id: string) => dataStore.getConsultationById(id);
  const getConsultationsByDoctor = (doctorId: string) => dataStore.getConsultations(doctorId);

  // Chat Messages
  const getChatMessages = (userId1: string, userId2: string) => dataStore.getChatMessages(userId1, userId2);

  const addChatMessage = (message: ChatMessage) => {
    dataStore.addChatMessage(message);
  };

  const updateChatMessage = (id: string, updates: Partial<ChatMessage>) => {
    dataStore.updateChatMessage(id, updates);
  };

  const deleteChatMessage = (id: string) => {
    dataStore.deleteChatMessage(id);
  };

  // Referral Letters
  const addReferralLetter = (referral: ReferralLetter) => {
    dataStore.addReferralLetter(referral);
    refreshData();
  };

  const updateReferralLetter = (id: string, updates: Partial<ReferralLetter>) => {
    dataStore.updateReferralLetter(id, updates);
    refreshData();
  };

  const deleteReferralLetter = (id: string) => {
    dataStore.deleteReferralLetter(id);
    refreshData();
  };

  const getReferralLettersByDoctor = (doctorId: string) => dataStore.getReferralLetters(doctorId);

  // Notifications
  const getNotifications = (userId: string) => dataStore.getNotifications(userId);

  const addNotification = (notification: Notification) => {
    dataStore.addNotification(notification);
  };

  const markNotificationAsRead = (id: string) => {
    dataStore.markNotificationAsRead(id);
  };

  const deleteNotification = (id: string) => {
    dataStore.deleteNotification(id);
  };

  // Revenues
  const addRevenue = (revenue: Revenue) => {
    dataStore.addRevenue(revenue);
    refreshData();
  };

  const updateRevenue = (id: string, updates: Partial<Revenue>) => {
    dataStore.updateRevenue(id, updates);
    refreshData();
  };

  const deleteRevenue = (id: string) => {
    dataStore.deleteRevenue(id);
    refreshData();
  };

  const getRevenuesByDoctor = (doctorId: string) => dataStore.getRevenues(doctorId);

  // Utilitaires
  const resetAllData = () => {
    dataStore.resetAll();
    refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
        getUserByEmail,
        patients,
        addPatient,
        updatePatient,
        deletePatient,
        getPatientById,
        getPatientsByDoctor,
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getAppointmentById,
        getAppointmentsByDoctor,
        consultations,
        addConsultation,
        updateConsultation,
        deleteConsultation,
        getConsultationById,
        getConsultationsByDoctor,
        getChatMessages,
        addChatMessage,
        updateChatMessage,
        deleteChatMessage,
        referralLetters,
        addReferralLetter,
        updateReferralLetter,
        deleteReferralLetter,
        getReferralLettersByDoctor,
        getNotifications,
        addNotification,
        markNotificationAsRead,
        deleteNotification,
        revenues,
        addRevenue,
        updateRevenue,
        deleteRevenue,
        getRevenuesByDoctor,
        refreshData,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
