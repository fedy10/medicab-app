/**
 * Fichier de génération des données de démonstration
 * Exécuté au démarrage de l'application
 */

import { dataStore } from './dataStore';

export function seedDemoData() {
  // Vérifier si les données existent déjà
  const users = dataStore.getUsers();
  
  // Si les utilisateurs par défaut existent déjà, ne rien faire
  if (users.length > 0) {
    return;
  }

  // Initialiser les données par défaut
  dataStore.initialize();
  
  // Ajouter quelques patients de démonstration
  const doctorId = 'doctor-1';
  
  const demoPatients = [
    {
      id: 'patient-demo-1',
      name: 'Mohamed Salah',
      age: 45,
      phone: '+216 98 111 222',
      email: 'mohamed.salah@email.tn',
      address: 'Tunis, Tunisie',
      gender: 'male' as const,
      diseases: [
        { id: 'd1', name: 'Diabète', emoji: '🩸' },
        { id: 'd2', name: 'Hypertension', emoji: '💓' },
      ],
      files: [],
      doctorId,
      consultationsCount: 5,
      lastVisit: '2024-12-20',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'patient-demo-2',
      name: 'Aisha Ben Salah',
      age: 32,
      phone: '+216 98 333 444',
      email: 'aisha.bensalah@email.tn',
      address: 'Sfax, Tunisie',
      gender: 'female' as const,
      diseases: [],
      files: [],
      doctorId,
      consultationsCount: 3,
      lastVisit: '2024-12-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'patient-demo-3',
      name: 'Karim Touati',
      age: 28,
      phone: '+216 98 555 666',
      email: 'karim.touati@email.tn',
      address: 'Sousse, Tunisie',
      gender: 'male' as const,
      diseases: [
        { id: 'd3', name: 'Asthme', emoji: '🫁' },
      ],
      files: [],
      doctorId,
      consultationsCount: 8,
      lastVisit: '2024-12-22',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  demoPatients.forEach(patient => {
    dataStore.addPatient(patient);
  });

  // Ajouter quelques rendez-vous de démonstration
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const demoAppointments = [
    {
      id: 'appointment-demo-1',
      patientId: 'patient-demo-1',
      patientName: 'Mohamed Salah',
      patientPhone: '+216 98 111 222',
      doctorId,
      date: today.toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      type: 'consultation' as const,
      reason: 'Contrôle glycémie',
      status: 'scheduled' as const,
      createdBy: 'secretary-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'appointment-demo-2',
      patientId: 'patient-demo-2',
      patientName: 'Aisha Ben Salah',
      patientPhone: '+216 98 333 444',
      doctorId,
      date: today.toISOString().split('T')[0],
      time: '10:00',
      duration: 30,
      type: 'consultation' as const,
      reason: 'Consultation générale',
      status: 'scheduled' as const,
      createdBy: 'secretary-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'appointment-demo-3',
      patientId: 'patient-demo-3',
      patientName: 'Karim Touati',
      patientPhone: '+216 98 555 666',
      doctorId,
      date: tomorrow.toISOString().split('T')[0],
      time: '14:00',
      duration: 30,
      type: 'follow-up' as const,
      reason: 'Suivi asthme',
      status: 'scheduled' as const,
      createdBy: 'secretary-1',
      createdAt: new Date().toISOString(),
    },
  ];

  demoAppointments.forEach(appointment => {
    dataStore.addAppointment(appointment);
  });

  // Ajouter quelques consultations de démonstration
  const demoConsultations = [
    {
      id: 'consultation-demo-1',
      patientId: 'patient-demo-1',
      patientName: 'Mohamed Salah',
      doctorId,
      date: '2024-12-20',
      time: '09:00',
      symptoms: 'Fatigue, soif excessive',
      diagnosis: 'Contrôle diabète type 2',
      prescription: 'Metformine 1000mg - 2x/jour',
      notes: 'Glycémie à jeun: 1.45g/L',
      files: [],
      createdAt: '2024-12-20T09:00:00Z',
      updatedAt: '2024-12-20T09:30:00Z',
    },
    {
      id: 'consultation-demo-2',
      patientId: 'patient-demo-2',
      patientName: 'Aisha Ben Salah',
      doctorId,
      date: '2024-12-15',
      time: '10:30',
      symptoms: 'Maux de tête, vertiges',
      diagnosis: 'Migraine',
      prescription: 'Paracétamol 1g - si besoin',
      notes: 'Recommander repos et hydratation',
      files: [],
      createdAt: '2024-12-15T10:30:00Z',
      updatedAt: '2024-12-15T11:00:00Z',
    },
  ];

  demoConsultations.forEach(consultation => {
    dataStore.addConsultation(consultation);
  });

  // Ajouter quelques revenus de démonstration
  const demoRevenues = [
    {
      id: 'revenue-demo-1',
      doctorId,
      amount: 50,
      date: '2024-12-20',
      type: 'consultation' as const,
      description: 'Consultation - Mohamed Salah',
      patientId: 'patient-demo-1',
      patientName: 'Mohamed Salah',
      createdAt: '2024-12-20T09:30:00Z',
    },
    {
      id: 'revenue-demo-2',
      doctorId,
      amount: 50,
      date: '2024-12-15',
      type: 'consultation' as const,
      description: 'Consultation - Aisha Ben Salah',
      patientId: 'patient-demo-2',
      patientName: 'Aisha Ben Salah',
      createdAt: '2024-12-15T11:00:00Z',
    },
    {
      id: 'revenue-demo-3',
      doctorId,
      amount: 80,
      date: '2024-12-10',
      type: 'consultation' as const,
      description: 'Consultation - Karim Touati',
      patientId: 'patient-demo-3',
      patientName: 'Karim Touati',
      createdAt: '2024-12-10T14:00:00Z',
    },
  ];

  demoRevenues.forEach(revenue => {
    dataStore.addRevenue(revenue);
  });

  console.log('✅ Données de démonstration chargées avec succès');
}
