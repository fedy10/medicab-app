/**
 * SYSTÈME DE STOCKAGE ORIGINAL - AVANT MVC
 * Accès direct à localStorage sans architecture MVC
 */

// Clés de stockage
const KEYS = {
  USERS: 'medicab_users',
  PATIENTS: 'medicab_patients',
  APPOINTMENTS: 'medicab_appointments',
  CONSULTATIONS: 'medicab_consultations',
  REVENUES: 'medicab_revenues',
  MESSAGES: 'medicab_messages',
  SESSION: 'medicab_session',
};

// Fonctions utilitaires
export const storage = {
  // Récupérer des données
  get: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lecture localStorage:', error);
      return null;
    }
  },

  // Sauvegarder des données
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erreur écriture localStorage:', error);
      return false;
    }
  },

  // Supprimer des données
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erreur suppression localStorage:', error);
      return false;
    }
  },

  // Clés disponibles
  keys: KEYS,
};

// Initialiser les données de démonstration
export function initializeDemoData() {
  // Utilisateurs par défaut
  if (!storage.get(KEYS.USERS)) {
    storage.set(KEYS.USERS, [
      {
        id: 'admin-1',
        email: 'admin@medicab.tn',
        password: 'admin123',
        name: 'Administrateur',
        role: 'admin',
        phone: '+216 71 123 456',
        status: 'active',
      },
      {
        id: 'doctor-1',
        email: 'dr.ben.ali@medicab.tn',
        password: 'doctor123',
        name: 'Dr. Ahmed Ben Ali',
        role: 'doctor',
        phone: '+216 98 765 432',
        specialty: 'Médecine générale',
        address: 'Cabinet Médical, Avenue Habib Bourguiba, Tunis',
        status: 'active',
      },
      {
        id: 'secretary-1',
        email: 'fatma.sec@medicab.tn',
        password: 'secretary123',
        name: 'Fatma Trabelsi',
        role: 'secretary',
        phone: '+216 22 345 678',
        assignedDoctorId: 'doctor-1',
        status: 'active',
      },
    ]);
  }

  // Patients de démonstration
  if (!storage.get(KEYS.PATIENTS)) {
    storage.set(KEYS.PATIENTS, [
      {
        id: 'patient-1',
        name: 'Mohamed Salah',
        age: 45,
        gender: 'male',
        phone: '+216 98 111 222',
        address: 'Tunis, Tunisie',
        job: 'Enseignant',
        diseases: [
          { name: 'Diabète', emoji: '🩸' },
          { name: 'Hypertension', emoji: '💓' },
        ],
        doctorId: 'doctor-1',
        consultationsCount: 5,
        lastVisit: '2024-12-20',
      },
      {
        id: 'patient-2',
        name: 'Aisha Ben Salah',
        age: 32,
        gender: 'female',
        phone: '+216 98 333 444',
        address: 'Sfax, Tunisie',
        job: 'Infirmière',
        diseases: [],
        doctorId: 'doctor-1',
        consultationsCount: 3,
        lastVisit: '2024-12-15',
      },
    ]);
  }

  // Rendez-vous de démonstration
  if (!storage.get(KEYS.APPOINTMENTS)) {
    const today = new Date().toISOString().split('T')[0];
    storage.set(KEYS.APPOINTMENTS, [
      {
        id: 'rdv-1',
        patientId: 'patient-1',
        patientName: 'Mohamed Salah',
        patientPhone: '+216 98 111 222',
        doctorId: 'doctor-1',
        date: today,
        time: '09:00',
        type: 'consultation',
        status: 'scheduled',
        reason: 'Contrôle glycémie',
      },
      {
        id: 'rdv-2',
        patientId: 'patient-2',
        patientName: 'Aisha Ben Salah',
        patientPhone: '+216 98 333 444',
        doctorId: 'doctor-1',
        date: today,
        time: '10:00',
        type: 'consultation',
        status: 'scheduled',
        reason: 'Consultation générale',
      },
    ]);
  }

  // Consultations de démonstration
  if (!storage.get(KEYS.CONSULTATIONS)) {
    storage.set(KEYS.CONSULTATIONS, [
      {
        id: 'consult-1',
        patientId: 'patient-1',
        patientName: 'Mohamed Salah',
        doctorId: 'doctor-1',
        date: '2024-12-20',
        time: '09:00',
        symptoms: 'Fatigue, soif excessive',
        diagnosis: 'Contrôle diabète type 2',
        prescription: 'Metformine 1000mg - 2x/jour',
        notes: 'Glycémie à jeun: 1.45g/L',
      },
    ]);
  }

  // Revenus de démonstration
  if (!storage.get(KEYS.REVENUES)) {
    storage.set(KEYS.REVENUES, [
      {
        id: 'rev-1',
        doctorId: 'doctor-1',
        amount: 50,
        date: '2024-12-20',
        type: 'consultation',
        description: 'Consultation - Mohamed Salah',
        patientName: 'Mohamed Salah',
      },
      {
        id: 'rev-2',
        doctorId: 'doctor-1',
        amount: 50,
        date: '2024-12-15',
        type: 'consultation',
        description: 'Consultation - Aisha Ben Salah',
        patientName: 'Aisha Ben Salah',
      },
    ]);
  }

  // Messages de chat
  if (!storage.get(KEYS.MESSAGES)) {
    storage.set(KEYS.MESSAGES, []);
  }
}

// Fonctions d'authentification
export function login(email: string, password: string) {
  const users = storage.get(KEYS.USERS) || [];
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, error: 'Email ou mot de passe incorrect' };
  }

  if (user.status === 'suspended') {
    return { success: false, error: 'Votre compte a été suspendu' };
  }

  // Sauvegarder la session
  storage.set(KEYS.SESSION, {
    user: { id: user.id, email: user.email },
    profile: user,
  });

  return { success: true, user };
}

export function logout() {
  storage.remove(KEYS.SESSION);
}

export function getCurrentSession() {
  return storage.get(KEYS.SESSION);
}

export function register(data: any) {
  const users = storage.get(KEYS.USERS) || [];

  // Vérifier si l'email existe déjà
  if (users.some((u: any) => u.email === data.email)) {
    return { success: false, error: 'Cet email est déjà utilisé' };
  }

  const newUser = {
    id: `user_${Date.now()}`,
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role,
    phone: data.phone || '',
    address: data.address || '',
    specialty: data.specialty || '',
    assignedDoctorId: data.assignedDoctorId || '',
    status: data.role === 'doctor' ? 'suspended' : 'active',
  };

  users.push(newUser);
  storage.set(KEYS.USERS, users);

  return { success: true, user: newUser };
}
