// ============================================
// SYSTÈME DE GESTION CENTRALISÉE DES DONNÉES
// ============================================

// Types de données
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'doctor' | 'secretary';
  phone?: string;
  address?: string;
  specialty?: string;
  status?: 'active' | 'suspended';
  assignedDoctorId?: string; // Pour les secrétaires
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  email?: string;
  address?: string;
  diseases?: ChronicDisease[];
  files?: MedicalFile[];
  doctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChronicDisease {
  id: string;
  name: string;
  emoji: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface MedicalFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  time: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  files?: MedicalFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
  edited?: boolean;
  editedAt?: string;
  files?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

export interface ReferralLetter {
  id: string;
  patientId: string;
  patientName: string;
  fromDoctorId: string;
  fromDoctorName: string;
  toDoctorId?: string;
  toDoctorName?: string;
  specialty: string;
  type: 'print' | 'digital';
  content: string;
  status: 'pending' | 'sent' | 'received';
  files?: MedicalFile[];
  chatMessages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'appointment' | 'referral' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Revenue {
  id: string;
  doctorId: string;
  amount: number;
  date: string;
  type: 'consultation' | 'procedure' | 'other';
  description: string;
  patientId?: string;
  patientName?: string;
  createdAt: string;
}

// ============================================
// CLASSE DE GESTION DES DONNÉES
// ============================================

class DataStore {
  private storagePrefix = 'medicab_';

  // Getters pour récupérer les données
  getUsers(): User[] {
    return this.getData<User[]>('users') || this.getDefaultUsers();
  }

  getPatients(doctorId?: string): Patient[] {
    const patients = this.getData<Patient[]>('patients') || [];
    if (doctorId) {
      return patients.filter(p => p.doctorId === doctorId);
    }
    return patients;
  }

  getAppointments(doctorId?: string): Appointment[] {
    const appointments = this.getData<Appointment[]>('appointments') || [];
    if (doctorId) {
      return appointments.filter(a => a.doctorId === doctorId);
    }
    return appointments;
  }

  getConsultations(doctorId?: string): Consultation[] {
    const consultations = this.getData<Consultation[]>('consultations') || [];
    if (doctorId) {
      return consultations.filter(c => c.doctorId === doctorId);
    }
    return consultations;
  }

  getChatMessages(userId1: string, userId2: string): ChatMessage[] {
    const messages = this.getData<ChatMessage[]>('chatMessages') || [];
    return messages.filter(
      m =>
        (m.senderId === userId1 && m.recipientId === userId2) ||
        (m.senderId === userId2 && m.recipientId === userId1)
    );
  }

  getReferralLetters(doctorId?: string): ReferralLetter[] {
    const referrals = this.getData<ReferralLetter[]>('referralLetters') || [];
    if (doctorId) {
      return referrals.filter(r => r.fromDoctorId === doctorId || r.toDoctorId === doctorId);
    }
    return referrals;
  }

  getNotifications(userId: string): Notification[] {
    const notifications = this.getData<Notification[]>('notifications') || [];
    return notifications.filter(n => n.userId === userId);
  }

  getRevenues(doctorId?: string): Revenue[] {
    const revenues = this.getData<Revenue[]>('revenues') || [];
    if (doctorId) {
      return revenues.filter(r => r.doctorId === doctorId);
    }
    return revenues;
  }

  // Getters pour un élément spécifique
  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  getPatientById(id: string): Patient | undefined {
    return this.getPatients().find(p => p.id === id);
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.getAppointments().find(a => a.id === id);
  }

  getConsultationById(id: string): Consultation | undefined {
    return this.getConsultations().find(c => c.id === id);
  }

  // Setters pour ajouter/modifier des données
  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setData('users', users);
  }

  updateUser(id: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setData('users', users);
    }
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    this.setData('users', users);
  }

  addPatient(patient: Patient): void {
    const patients = this.getPatients();
    patients.push(patient);
    this.setData('patients', patients);
  }

  updatePatient(id: string, updates: Partial<Patient>): void {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...updates, updatedAt: new Date().toISOString() };
      this.setData('patients', patients);
    }
  }

  deletePatient(id: string): void {
    const patients = this.getPatients().filter(p => p.id !== id);
    this.setData('patients', patients);
  }

  addAppointment(appointment: Appointment): void {
    const appointments = this.getAppointments();
    appointments.push(appointment);
    this.setData('appointments', appointments);
  }

  updateAppointment(id: string, updates: Partial<Appointment>): void {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      this.setData('appointments', appointments);
    }
  }

  deleteAppointment(id: string): void {
    const appointments = this.getAppointments().filter(a => a.id !== id);
    this.setData('appointments', appointments);
  }

  addConsultation(consultation: Consultation): void {
    const consultations = this.getConsultations();
    consultations.push(consultation);
    this.setData('consultations', consultations);
  }

  updateConsultation(id: string, updates: Partial<Consultation>): void {
    const consultations = this.getConsultations();
    const index = consultations.findIndex(c => c.id === id);
    if (index !== -1) {
      consultations[index] = { ...consultations[index], ...updates, updatedAt: new Date().toISOString() };
      this.setData('consultations', consultations);
    }
  }

  deleteConsultation(id: string): void {
    const consultations = this.getConsultations().filter(c => c.id !== id);
    this.setData('consultations', consultations);
  }

  addChatMessage(message: ChatMessage): void {
    const messages = this.getData<ChatMessage[]>('chatMessages') || [];
    messages.push(message);
    this.setData('chatMessages', messages);
  }

  updateChatMessage(id: string, updates: Partial<ChatMessage>): void {
    const messages = this.getData<ChatMessage[]>('chatMessages') || [];
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
      messages[index] = { ...messages[index], ...updates };
      this.setData('chatMessages', messages);
    }
  }

  deleteChatMessage(id: string): void {
    const messages = (this.getData<ChatMessage[]>('chatMessages') || []).filter(m => m.id !== id);
    this.setData('chatMessages', messages);
  }

  addReferralLetter(referral: ReferralLetter): void {
    const referrals = this.getReferralLetters();
    referrals.push(referral);
    this.setData('referralLetters', referrals);
  }

  updateReferralLetter(id: string, updates: Partial<ReferralLetter>): void {
    const referrals = this.getReferralLetters();
    const index = referrals.findIndex(r => r.id === id);
    if (index !== -1) {
      referrals[index] = { ...referrals[index], ...updates, updatedAt: new Date().toISOString() };
      this.setData('referralLetters', referrals);
    }
  }

  deleteReferralLetter(id: string): void {
    const referrals = this.getReferralLetters().filter(r => r.id !== id);
    this.setData('referralLetters', referrals);
  }

  addNotification(notification: Notification): void {
    const notifications = this.getData<Notification[]>('notifications') || [];
    notifications.push(notification);
    this.setData('notifications', notifications);
  }

  markNotificationAsRead(id: string): void {
    const notifications = this.getData<Notification[]>('notifications') || [];
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      this.setData('notifications', notifications);
    }
  }

  deleteNotification(id: string): void {
    const notifications = (this.getData<Notification[]>('notifications') || []).filter(n => n.id !== id);
    this.setData('notifications', notifications);
  }

  addRevenue(revenue: Revenue): void {
    const revenues = this.getRevenues();
    revenues.push(revenue);
    this.setData('revenues', revenues);
  }

  updateRevenue(id: string, updates: Partial<Revenue>): void {
    const revenues = this.getRevenues();
    const index = revenues.findIndex(r => r.id === id);
    if (index !== -1) {
      revenues[index] = { ...revenues[index], ...updates };
      this.setData('revenues', revenues);
    }
  }

  deleteRevenue(id: string): void {
    const revenues = this.getRevenues().filter(r => r.id !== id);
    this.setData('revenues', revenues);
  }

  // Authentification
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'Votre compte a été suspendu. Contactez l\'administrateur.' };
    }

    // Enregistrer la session
    const session = {
      user: { id: user.id, email: user.email },
      profile: user,
    };
    localStorage.setItem('currentSession', JSON.stringify(session));

    return { success: true, user };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role: 'doctor' | 'secretary';
    phone?: string;
    address?: string;
    specialty?: string;
    assignedDoctorId?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = this.getUsers();

    // Vérifier si l'email existe déjà
    if (users.some(u => u.email === data.email)) {
      return { success: false, error: 'Cet email est déjà utilisé' };
    }

    // Créer le nouvel utilisateur
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      phone: data.phone,
      address: data.address,
      specialty: data.specialty,
      status: data.role === 'doctor' ? 'suspended' : 'active', // Les médecins doivent être activés par l'admin
      assignedDoctorId: data.assignedDoctorId,
      createdAt: new Date().toISOString(),
    };

    this.addUser(newUser);

    return { success: true, user: newUser };
  }

  logout(): void {
    localStorage.removeItem('currentSession');
  }

  getCurrentSession(): { user: any; profile: User } | null {
    const sessionData = localStorage.getItem('currentSession');
    if (!sessionData) return null;
    return JSON.parse(sessionData);
  }

  // Utilitaires privés
  private getData<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(this.storagePrefix + key);
    return data ? JSON.parse(data) : null;
  }

  private setData<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storagePrefix + key, JSON.stringify(value));
  }

  // Données par défaut
  private getDefaultUsers(): User[] {
    return [
      {
        id: 'admin-1',
        email: 'admin@medicab.tn',
        password: 'admin123',
        name: 'Administrateur',
        role: 'admin',
        phone: '+216 71 123 456',
        address: 'Tunis, Tunisie',
        status: 'active',
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'doctor-1',
        email: 'dr.ben.ali@medicab.tn',
        password: 'doctor123',
        name: 'Dr. Ahmed Ben Ali',
        role: 'doctor',
        phone: '+216 98 765 432',
        address: 'Cabinet Médical, Avenue Habib Bourguiba, Tunis',
        specialty: 'Médecine générale',
        status: 'active',
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'secretary-1',
        email: 'fatma.sec@medicab.tn',
        password: 'secretary123',
        name: 'Fatma Trabelsi',
        role: 'secretary',
        phone: '+216 22 345 678',
        address: 'Tunis, Tunisie',
        status: 'active',
        assignedDoctorId: 'doctor-1',
        createdAt: '2024-01-01T10:00:00Z',
      },
    ];
  }

  // Initialiser les données par défaut si nécessaire
  initialize(): void {
    if (!this.getData('users')) {
      this.setData('users', this.getDefaultUsers());
    }
    if (!this.getData('patients')) {
      this.setData('patients', []);
    }
    if (!this.getData('appointments')) {
      this.setData('appointments', []);
    }
    if (!this.getData('consultations')) {
      this.setData('consultations', []);
    }
    if (!this.getData('chatMessages')) {
      this.setData('chatMessages', []);
    }
    if (!this.getData('referralLetters')) {
      this.setData('referralLetters', []);
    }
    if (!this.getData('notifications')) {
      this.setData('notifications', []);
    }
    if (!this.getData('revenues')) {
      this.setData('revenues', []);
    }
  }

  // Réinitialiser toutes les données
  resetAll(): void {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
      }
    });
    this.initialize();
  }
}

// Export de l'instance singleton
export const dataStore = new DataStore();