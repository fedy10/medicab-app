# 🎯 Exemples d'Utilisation des Hooks Supabase

## 📋 Vue Patients avec usePatients

```tsx
import { usePatients } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';

function PatientsView() {
  const { profile } = useAuth();
  const { 
    patients, 
    loading, 
    error, 
    createPatient, 
    updatePatient, 
    deletePatient,
    refresh 
  } = usePatients(profile?.id);

  const handleCreatePatient = async () => {
    try {
      await createPatient({
        name: 'Marie Dupont',
        age: 35,
        phone: '0612345678',
        email: 'marie@example.com',
        doctor_id: profile.id,
        diseases: [],
      });
      alert('✅ Patient créé !');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h1>Mes Patients ({patients.length})</h1>
      <button onClick={handleCreatePatient}>Nouveau Patient</button>
      <button onClick={refresh}>🔄 Rafraîchir</button>
      
      {patients.map((patient) => (
        <div key={patient.id}>
          <h3>{patient.name}</h3>
          <p>Âge: {patient.age} ans</p>
          <button onClick={() => updatePatient(patient.id, { age: 36 })}>
            Modifier
          </button>
          <button onClick={() => deletePatient(patient.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📅 Vue Agenda avec useAppointments

```tsx
import { useAppointments } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

function CalendarView() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { 
    appointments, 
    loading, 
    createAppointment, 
    updateAppointment,
    deleteAppointment,
    markAsCompleted,
    cancelAppointment,
  } = useAppointments(profile?.id, {
    startDate: selectedDate.toISOString().split('T')[0],
    endDate: selectedDate.toISOString().split('T')[0],
  });

  const handleCreateAppointment = async () => {
    try {
      // Vérifier les conflits d'abord
      const hasConflict = await appointmentService.checkConflict(
        profile.id,
        '2024-06-15',
        '14:30',
        30
      );
      
      if (hasConflict) {
        alert('⚠️ Conflit d\'horaire !');
        return;
      }

      await createAppointment({
        patient_id: 'patient-uuid',
        patient_name: 'Marie Dupont',
        doctor_id: profile.id,
        date: '2024-06-15',
        time: '14:30',
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        notes: 'Première consultation',
        created_by: profile.id,
      });
      
      alert('✅ Rendez-vous créé !');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Agenda du {selectedDate.toLocaleDateString()}</h1>
      <button onClick={handleCreateAppointment}>
        Nouveau Rendez-vous
      </button>

      {appointments.map((apt) => (
        <div key={apt.id}>
          <h3>{apt.time} - {apt.patient_name}</h3>
          <p>Type: {apt.type}</p>
          <p>Statut: {apt.status}</p>
          
          {apt.status === 'scheduled' && (
            <>
              <button onClick={() => markAsCompleted(apt.id)}>
                ✅ Marquer comme complété
              </button>
              <button onClick={() => cancelAppointment(apt.id)}>
                ❌ Annuler
              </button>
            </>
          )}
          
          <button onClick={() => deleteAppointment(apt.id)}>
            🗑️ Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🩺 Vue Consultations avec useConsultations

```tsx
import { useConsultations } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';

function ConsultationsView() {
  const { profile } = useAuth();
  const { 
    consultations, 
    loading, 
    error,
    createConsultation,
    updateConsultation,
    deleteConsultation,
  } = useConsultations(profile?.id);

  const handleCreateConsultation = async (patientId: string) => {
    try {
      await createConsultation({
        patient_id: patientId,
        patient_name: 'Marie Dupont',
        doctor_id: profile.id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        symptoms: 'Fièvre, maux de tête',
        diagnosis: 'Grippe',
        prescription: 'Paracétamol 1g x3/jour',
        notes: 'Repos recommandé',
        files: [],
      });
      
      alert('✅ Consultation enregistrée !');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h1>Consultations ({consultations.length})</h1>
      
      {consultations.map((consult) => (
        <div key={consult.id}>
          <h3>{consult.patient_name}</h3>
          <p>Date: {consult.date} à {consult.time}</p>
          <p>Symptômes: {consult.symptoms}</p>
          <p>Diagnostic: {consult.diagnosis}</p>
          <p>Prescription: {consult.prescription}</p>
          
          <button onClick={() => updateConsultation(consult.id, {
            notes: 'Note mise à jour'
          })}>
            Modifier
          </button>
          
          <button onClick={() => deleteConsultation(consult.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 💰 Vue Revenus avec useRevenues

```tsx
import { useRevenues } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';

function RevenuesView() {
  const { profile } = useAuth();
  const { 
    revenues, 
    stats, 
    loading, 
    error,
    createRevenue,
    updateRevenue,
    deleteRevenue,
  } = useRevenues(profile?.id);

  const handleCreateRevenue = async () => {
    try {
      await createRevenue({
        doctor_id: profile.id,
        amount: 60.00,
        date: new Date().toISOString().split('T')[0],
        type: 'consultation',
        description: 'Consultation générale',
        patient_id: 'patient-uuid',
        patient_name: 'Marie Dupont',
      });
      
      alert('✅ Revenu enregistré !');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h1>Revenus</h1>
      
      {/* Statistiques */}
      {stats && (
        <div>
          <h2>Statistiques</h2>
          <p>Total: {stats.total.toFixed(2)} €</p>
          <p>Nombre de consultations: {stats.count}</p>
          <p>Moyenne: {stats.average.toFixed(2)} €</p>
        </div>
      )}
      
      <button onClick={handleCreateRevenue}>
        Nouveau Revenu
      </button>

      {/* Liste des revenus */}
      {revenues.map((revenue) => (
        <div key={revenue.id}>
          <h3>{revenue.date} - {revenue.amount} €</h3>
          <p>Type: {revenue.type}</p>
          <p>Patient: {revenue.patient_name}</p>
          <p>Description: {revenue.description}</p>
          
          <button onClick={() => updateRevenue(revenue.id, {
            amount: 75.00
          })}>
            Modifier
          </button>
          
          <button onClick={() => deleteRevenue(revenue.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 💬 Vue Chat avec useChat

```tsx
import { useChat } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

function ChatView({ otherUserId }: { otherUserId: string }) {
  const { profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  
  const { 
    messages, 
    loading, 
    sendMessage,
    editMessage,
    deleteMessage,
  } = useChat(profile?.id, otherUserId);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Chat</h1>
      
      {/* Liste des messages */}
      <div style={{ height: '400px', overflow: 'auto' }}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={{ 
              textAlign: msg.sender_id === profile.id ? 'right' : 'left' 
            }}
          >
            <p>{msg.content}</p>
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
            {msg.edited && <small> (modifié)</small>}
            
            {msg.sender_id === profile.id && (
              <>
                <button onClick={() => {
                  const newContent = prompt('Nouveau message:', msg.content);
                  if (newContent) editMessage(msg.id, newContent);
                }}>
                  Modifier
                </button>
                <button onClick={() => deleteMessage(msg.id)}>
                  Supprimer
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Zone d'envoi */}
      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Tapez votre message..."
        />
        <button onClick={handleSendMessage}>Envoyer</button>
      </div>
    </div>
  );
}
```

---

## 🔔 Vue Notifications avec useNotifications

```tsx
import { useNotifications } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';

function NotificationsView() {
  const { profile } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead,
    deleteNotification,
    refresh,
  } = useNotifications(profile?.id);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await markAsRead(notifId);
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>
        Notifications 
        {unreadCount > 0 && <span> ({unreadCount} non lues)</span>}
      </h1>
      
      <button onClick={refresh}>🔄 Rafraîchir</button>

      {notifications.map((notif) => (
        <div 
          key={notif.id}
          style={{
            backgroundColor: notif.read ? '#fff' : '#e3f2fd',
            padding: '10px',
            margin: '5px 0',
          }}
        >
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <small>{new Date(notif.created_at).toLocaleString()}</small>
          
          {!notif.read && (
            <button onClick={() => handleMarkAsRead(notif.id)}>
              Marquer comme lue
            </button>
          )}
          
          <button onClick={() => deleteNotification(notif.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 👥 Vue Admin avec useProfiles

```tsx
import { useProfiles } from '../hooks/useSupabase';

function AdminDoctorsView() {
  const { 
    profiles,
    doctors, 
    loading, 
    updateProfile,
    updateStatus,
    deleteProfile,
  } = useProfiles();

  const handleApprove = async (doctorId: string) => {
    try {
      await updateStatus(doctorId, 'active');
      alert('✅ Médecin approuvé !');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  const handleSuspend = async (doctorId: string) => {
    try {
      await updateStatus(doctorId, 'suspended');
      alert('⚠️ Médecin suspendu !');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Gestion des Médecins ({doctors.length})</h1>

      {doctors.map((doctor) => (
        <div key={doctor.id}>
          <h3>{doctor.name}</h3>
          <p>Email: {doctor.email}</p>
          <p>Spécialité: {doctor.specialty}</p>
          <p>Statut: {doctor.status}</p>
          
          {doctor.status === 'suspended' ? (
            <button onClick={() => handleApprove(doctor.id)}>
              ✅ Approuver
            </button>
          ) : (
            <button onClick={() => handleSuspend(doctor.id)}>
              ⚠️ Suspendre
            </button>
          )}
          
          <button onClick={() => deleteProfile(doctor.id)}>
            🗑️ Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Workflow Complet: Rendez-vous → Consultation → Revenu

```tsx
import { useAppointments, useConsultations, useRevenues } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';

function CompleteWorkflow() {
  const { profile } = useAuth();
  const { markAsCompleted } = useAppointments(profile?.id);
  const { createConsultation } = useConsultations(profile?.id);
  const { createRevenue } = useRevenues(profile?.id);

  const handleCompleteAppointment = async (appointment: any) => {
    try {
      // 1. Marquer le rendez-vous comme complété
      await markAsCompleted(appointment.id);
      
      // 2. Créer la consultation
      const consultation = await createConsultation({
        patient_id: appointment.patient_id,
        patient_name: appointment.patient_name,
        doctor_id: profile.id,
        date: appointment.date,
        time: appointment.time,
        symptoms: 'À remplir',
        diagnosis: 'À remplir',
        prescription: '',
        notes: '',
        files: [],
      });
      
      // 3. Enregistrer le revenu
      await createRevenue({
        doctor_id: profile.id,
        amount: 60.00,
        date: appointment.date,
        type: 'consultation',
        description: 'Consultation générale',
        patient_id: appointment.patient_id,
        patient_name: appointment.patient_name,
      });
      
      alert('✅ Rendez-vous complété avec succès !');
    } catch (error: any) {
      alert('❌ Erreur: ' + error.message);
    }
  };

  return (
    <div>
      {/* Votre interface ici */}
    </div>
  );
}
```

---

## 🎯 Points Clés

1. **Tous les hooks chargent automatiquement** les données au montage
2. **Le state est géré automatiquement** (loading, error, data)
3. **Les méthodes CRUD sont prêtes à l'emploi** (create, update, delete)
4. **Le refresh est automatique** après create/update/delete
5. **Les erreurs sont catchées** - utilisez try/catch pour gérer les erreurs UI

---

## ⚡ Performance

- Les hooks utilisent `useCallback` pour éviter les re-renders inutiles
- Le chat utilise les **subscriptions temps réel** Supabase
- Les stats sont calculées côté serveur (PostgreSQL)
- Utilisez la méthode `refresh()` pour forcer un rechargement si nécessaire
