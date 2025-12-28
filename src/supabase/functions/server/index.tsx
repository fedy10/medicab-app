import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize default admin user
async function initializeDefaultAdmin() {
  const adminEmail = "admin@medicare.com";
  const adminKey = `user_${adminEmail}`;
  
  try {
    const existingAdmin = await kv.get(adminKey);
    
    if (!existingAdmin) {
      const adminId = `admin_${Date.now()}`;
      
      // Create admin user
      const adminUser = {
        id: adminId,
        email: adminEmail,
        password: "admin123",
        created_at: new Date().toISOString(),
      };
      
      // Create admin profile
      const adminProfile = {
        user_id: adminId,
        email: adminEmail,
        nom: "Admin",
        prenom: "System",
        role: "admin",
        telephone: "+33 1 23 45 67 89",
        status: "active",
        created_at: new Date().toISOString(),
      };
      
      await kv.set(adminKey, adminUser);
      await kv.set(`profile_${adminId}`, adminProfile);
      
      console.log("Default admin user created successfully");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
}

// Initialize admin on startup
initializeDefaultAdmin();

// Health check endpoint
app.get("/make-server-73eb4022/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTHENTICATION ROUTES ====================

// Register new user
app.post("/make-server-73eb4022/register", async (c) => {
  try {
    const userData = await c.req.json();
    const { email, password, nom, prenom, role, telephone, specialite, medecin_id } = userData;
    
    // Check if user already exists
    const userKey = `user_${email}`;
    const existingUser = await kv.get(userKey);
    
    if (existingUser) {
      return c.json({ error: "Un utilisateur avec cet email existe déjà" }, 400);
    }
    
    // Create user ID
    const userId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create user account
    const user = {
      id: userId,
      email,
      password, // In production, this should be hashed
      created_at: new Date().toISOString(),
    };
    
    // Create profile
    const profile = {
      user_id: userId,
      email,
      nom,
      prenom,
      role: role || 'medecin',
      telephone,
      specialite,
      medecin_id,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    
    // Save user and profile
    await kv.set(userKey, user);
    await kv.set(`profile_${userId}`, profile);
    
    // Create session
    const session = {
      access_token: `token_${userId}_${Date.now()}`,
      user: {
        id: userId,
        email,
      },
    };
    
    return c.json({
      message: "Inscription réussie",
      session,
      profile,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Login user
app.post("/make-server-73eb4022/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Get user
    const userKey = `user_${email}`;
    const user = await kv.get(userKey);
    
    if (!user || user.password !== password) {
      return c.json({ error: "Email ou mot de passe incorrect" }, 401);
    }
    
    // Get profile
    const profile = await kv.get(`profile_${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profil utilisateur non trouvé" }, 404);
    }
    
    // Check if user is active
    if (profile.status !== 'active') {
      return c.json({ error: "Votre compte a été suspendu. Veuillez contacter l'administrateur." }, 403);
    }
    
    // Create session
    const session = {
      access_token: `token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        email: user.email,
      },
    };
    
    return c.json({
      session,
      profile,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user profile
app.get("/make-server-73eb4022/profile", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader) {
      return c.json({ error: "Authorization header missing" }, 401);
    }
    
    const token = authHeader.replace("Bearer ", "");
    const userId = token.split("_")[1]; // Extract user ID from token
    
    const profile = await kv.get(`profile_${userId}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }
    
    return c.json(profile);
  } catch (error) {
    console.error("Profile error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all doctors
app.get("/make-server-73eb4022/doctors", async (c) => {
  try {
    const profileKeys = await kv.keys('profile_');
    const doctors = [];
    
    for (const key of profileKeys) {
      const profile = await kv.get(key);
      if (profile && profile.role === 'medecin') {
        doctors.push(profile);
      }
    }
    
    return c.json(doctors);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Update doctor status
app.put("/make-server-73eb4022/doctors/:doctorId/status", async (c) => {
  try {
    const doctorId = c.req.param('doctorId');
    const { status } = await c.req.json();
    
    const profile = await kv.get(`profile_${doctorId}`);
    
    if (!profile) {
      return c.json({ error: "Doctor not found" }, 404);
    }
    
    profile.status = status;
    profile.updated_at = new Date().toISOString();
    
    await kv.set(`profile_${doctorId}`, profile);
    
    return c.json(profile);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get all secretaries
app.get("/make-server-73eb4022/secretaries", async (c) => {
  try {
    const profileKeys = await kv.keys('profile_');
    const secretaries = [];
    
    for (const key of profileKeys) {
      const profile = await kv.get(key);
      if (profile && profile.role === 'secretaire') {
        secretaries.push(profile);
      }
    }
    
    return c.json(secretaries);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ==================== APPOINTMENTS ROUTES ====================

// Get appointments
app.get("/make-server-73eb4022/appointments", async (c) => {
  try {
    const appointmentKeys = await kv.keys('appointment_');
    const appointments = [];
    
    for (const key of appointmentKeys) {
      const appointment = await kv.get(key);
      if (appointment) {
        appointments.push(appointment);
      }
    }
    
    return c.json(appointments);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Create appointment
app.post("/make-server-73eb4022/appointments", async (c) => {
  try {
    const appointmentData = await c.req.json();
    const appointmentId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const appointment = {
      id: appointmentId,
      ...appointmentData,
      created_at: new Date().toISOString(),
    };
    
    await kv.set(`appointment_${appointmentId}`, appointment);
    
    return c.json(appointment);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Update appointment
app.put("/make-server-73eb4022/appointments/:appointmentId", async (c) => {
  try {
    const appointmentId = c.req.param('appointmentId');
    const updates = await c.req.json();
    
    const appointment = await kv.get(`appointment_${appointmentId}`);
    
    if (!appointment) {
      return c.json({ error: "Appointment not found" }, 404);
    }
    
    const updatedAppointment = {
      ...appointment,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`appointment_${appointmentId}`, updatedAppointment);
    
    return c.json(updatedAppointment);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete appointment
app.delete("/make-server-73eb4022/appointments/:appointmentId", async (c) => {
  try {
    const appointmentId = c.req.param('appointmentId');
    await kv.del(`appointment_${appointmentId}`);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ==================== CONSULTATIONS ROUTES ====================

// Get consultations
app.get("/make-server-73eb4022/consultations", async (c) => {
  try {
    const consultationKeys = await kv.keys('consultation_');
    const consultations = [];
    
    for (const key of consultationKeys) {
      const consultation = await kv.get(key);
      if (consultation) {
        consultations.push(consultation);
      }
    }
    
    return c.json(consultations);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Create consultation
app.post("/make-server-73eb4022/consultations", async (c) => {
  try {
    const consultationData = await c.req.json();
    const consultationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const consultation = {
      id: consultationId,
      ...consultationData,
      created_at: new Date().toISOString(),
    };
    
    await kv.set(`consultation_${consultationId}`, consultation);
    
    return c.json(consultation);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Update consultation
app.put("/make-server-73eb4022/consultations/:consultationId", async (c) => {
  try {
    const consultationId = c.req.param('consultationId');
    const updates = await c.req.json();
    
    const consultation = await kv.get(`consultation_${consultationId}`);
    
    if (!consultation) {
      return c.json({ error: "Consultation not found" }, 404);
    }
    
    const updatedConsultation = {
      ...consultation,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`consultation_${consultationId}`, updatedConsultation);
    
    return c.json(updatedConsultation);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ==================== PATIENTS ROUTES ====================

// Get patients
app.get("/make-server-73eb4022/patients", async (c) => {
  try {
    const patientKeys = await kv.keys('patient_');
    const patients = [];
    
    for (const key of patientKeys) {
      const patient = await kv.get(key);
      if (patient) {
        patients.push(patient);
      }
    }
    
    return c.json(patients);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Create patient
app.post("/make-server-73eb4022/patients", async (c) => {
  try {
    const patientData = await c.req.json();
    const patientId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const patient = {
      id: patientId,
      ...patientData,
      created_at: new Date().toISOString(),
    };
    
    await kv.set(`patient_${patientId}`, patient);
    
    return c.json(patient);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Update patient
app.put("/make-server-73eb4022/patients/:patientId", async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const updates = await c.req.json();
    
    const patient = await kv.get(`patient_${patientId}`);
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    const updatedPatient = {
      ...patient,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`patient_${patientId}`, updatedPatient);
    
    return c.json(updatedPatient);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ==================== CHAT SYSTEM ROUTES ====================

// Get or create a conversation between two users
app.post("/make-server-73eb4022/conversations", async (c) => {
  try {
    const { user1_id, user2_id, type } = await c.req.json();
    
    // Create a unique conversation key (sorted to ensure consistency)
    const conversationKey = [user1_id, user2_id].sort().join('_');
    const kvKey = `conversation_${conversationKey}`;
    
    // Check if conversation exists
    let conversation = await kv.get(kvKey);
    
    if (!conversation) {
      // Create new conversation
      conversation = {
        id: conversationKey,
        user1_id,
        user2_id,
        type, // 'doctor_secretary' or 'doctor_admin'
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await kv.set(kvKey, conversation);
    }
    
    return c.json(conversation);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get messages for a conversation
app.get("/make-server-73eb4022/conversations/:conversationId/messages", async (c) => {
  try {
    const conversationId = c.req.param('conversationId');
    const messagesKey = `messages_${conversationId}`;
    
    const messages = await kv.get(messagesKey) || [];
    
    return c.json(messages);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Send a message
app.post("/make-server-73eb4022/messages", async (c) => {
  try {
    const { conversation_id, sender_id, sender_name, content, file_name, file_size, file_url } = await c.req.json();
    
    const messagesKey = `messages_${conversation_id}`;
    const messages = await kv.get(messagesKey) || [];
    
    const newMessage = {
      id: `${Date.now()}_${sender_id}`,
      conversation_id,
      sender_id,
      sender_name,
      content,
      file: file_name ? {
        name: file_name,
        size: file_size,
        url: file_url,
      } : undefined,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString(),
      read: false,
    };
    
    messages.push(newMessage);
    await kv.set(messagesKey, messages);
    
    // Update conversation timestamp
    const conversationKey = `conversation_${conversation_id}`;
    const conversation = await kv.get(conversationKey);
    if (conversation) {
      conversation.updated_at = new Date().toISOString();
      await kv.set(conversationKey, conversation);
    }
    
    return c.json(newMessage);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Mark messages as read
app.put("/make-server-73eb4022/conversations/:conversationId/read", async (c) => {
  try {
    const conversationId = c.req.param('conversationId');
    const { user_id } = await c.req.json();
    
    const messagesKey = `messages_${conversationId}`;
    const messages = await kv.get(messagesKey) || [];
    
    // Mark all messages from other users as read
    const updatedMessages = messages.map((msg: any) => {
      if (msg.sender_id !== user_id && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });
    
    await kv.set(messagesKey, updatedMessages);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get secretaries for a doctor
app.get("/make-server-73eb4022/doctors/:doctorId/secretaries", async (c) => {
  try {
    const doctorId = c.req.param('doctorId');
    
    // Get all profiles
    const profileKeys = await kv.keys('profile_');
    const secretaries = [];
    
    for (const key of profileKeys) {
      const profile = await kv.get(key);
      if (profile && profile.role === 'secretary' && profile.medecin_id === doctorId && profile.status === 'active') {
        // Get online status
        const onlineStatus = await kv.get(`online_${profile.user_id}`) || { is_online: false, last_seen: null };
        
        // Get unread count
        const conversationKey = [doctorId, profile.user_id].sort().join('_');
        const messagesKey = `messages_${conversationKey}`;
        const messages = await kv.get(messagesKey) || [];
        const unreadCount = messages.filter((msg: any) => msg.sender_id === profile.user_id && !msg.read).length;
        
        secretaries.push({
          id: profile.user_id,
          name: `${profile.nom} ${profile.prenom}`,
          online: onlineStatus.is_online,
          lastSeen: onlineStatus.last_seen,
          avatar: `${profile.nom[0]}${profile.prenom[0]}`,
          unreadCount,
        });
      }
    }
    
    return c.json(secretaries);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Update user online status
app.post("/make-server-73eb4022/users/:userId/online-status", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { is_online } = await c.req.json();
    
    const statusKey = `online_${userId}`;
    const status = {
      is_online,
      last_seen: is_online ? null : new Date().toISOString(),
    };
    
    await kv.set(statusKey, status);
    
    return c.json(status);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get admin info (for doctor-admin chat)
app.get("/make-server-73eb4022/admin", async (c) => {
  try {
    // Get all profiles
    const profileKeys = await kv.keys('profile_');
    
    for (const key of profileKeys) {
      const profile = await kv.get(key);
      if (profile && profile.role === 'admin') {
        // Get online status
        const onlineStatus = await kv.get(`online_${profile.user_id}`) || { is_online: false, last_seen: null };
        
        return c.json({
          id: profile.user_id,
          name: `${profile.nom} ${profile.prenom}`,
          online: onlineStatus.is_online,
          lastSeen: onlineStatus.last_seen,
        });
      }
    }
    
    return c.json({ error: "Admin not found" }, 404);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get doctor info by ID (for secretary-doctor chat)
app.get("/make-server-73eb4022/doctors/:doctorId/info", async (c) => {
  try {
    const doctorId = c.req.param('doctorId');
    const profile = await kv.get(`profile_${doctorId}`);
    
    if (!profile || profile.role !== 'medecin') {
      return c.json({ error: "Doctor not found" }, 404);
    }
    
    // Get online status
    const onlineStatus = await kv.get(`online_${doctorId}`) || { is_online: false, last_seen: null };
    
    // Get unread count
    const conversationKeys = await kv.keys('messages_');
    let unreadCount = 0;
    
    for (const key of conversationKeys) {
      const conversationId = key.replace('messages_', '');
      if (conversationId.includes(doctorId)) {
        const messages = await kv.get(key) || [];
        unreadCount += messages.filter((msg: any) => msg.sender_id === doctorId && !msg.read).length;
      }
    }
    
    return c.json({
      id: profile.user_id,
      name: `Dr. ${profile.nom} ${profile.prenom}`,
      online: onlineStatus.is_online,
      lastSeen: onlineStatus.last_seen ? formatLastSeen(onlineStatus.last_seen) : null,
      avatar: `${profile.nom[0]}${profile.prenom[0]}`,
      unreadCount,
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Helper function to format last seen
function formatLastSeen(isoString: string): string {
  const now = new Date();
  const lastSeen = new Date(isoString);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return lastSeen.toLocaleDateString('fr-FR');
}

// Get unread count for all conversations for a user
app.get("/make-server-73eb4022/users/:userId/unread-count", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Get all conversation keys
    const conversationKeys = await kv.keys('messages_');
    let totalUnread = 0;
    
    for (const key of conversationKeys) {
      const messages = await kv.get(key) || [];
      const unreadCount = messages.filter((msg: any) => msg.sender_id !== userId && !msg.read).length;
      totalUnread += unreadCount;
    }
    
    return c.json({ unreadCount: totalUnread });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);