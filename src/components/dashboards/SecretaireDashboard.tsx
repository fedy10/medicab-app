import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, FileText, Users, MessageCircle, User, LogOut, Stethoscope } from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { FloatingElement } from '../ui/FloatingElement';
import { SecretaryConsultationsView } from '../secretary/SecretaryConsultationsView';
import { SecretaryPatientsView } from '../secretary/SecretaryPatientsView';
import { SecretaryAgendaView } from '../secretary/SecretaryAgendaView';
import { SecretaryProfileView } from '../secretary/SecretaryProfileView';
import { DoctorSecretaryChat } from '../chat/DoctorSecretaryChat';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { ProfileModal } from '../modals/ProfileModal';

interface SecretaireDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

export function SecretaireDashboard({ user, profile, onLogout }: SecretaireDashboardProps) {
  const [activeTab, setActiveTab] = useState('consultations');
  const [showDoctorChat, setShowDoctorChat] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const unreadMessages = useUnreadMessages(profile.id);

  const navItems = [
    { id: 'consultations', label: 'Consultations', icon: FileText },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      <AnimatedBackground />
      {/* Top Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">MediCare Pro</h1>
                <p className="text-sm text-gray-500">{profile.nom} {profile.prenom}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDoctorChat(!showDoctorChat)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Chat avec médecin"
                style={{ zIndex: 100 }}
              >
                <MessageCircle className="w-5 h-5" />
                {unreadMessages.doctor > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1 rounded-full">
                    {unreadMessages.doctor}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Profil"
              >
                <User className="w-5 h-5" />
              </button>
              
              <button
                onClick={onLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex gap-2 pb-4 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'text-gray-600 bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'consultations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SecretaryConsultationsView secretaryId={profile.id} doctorId={profile.medecin_id} />
          </motion.div>
        )}

        {activeTab === 'patients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SecretaryPatientsView secretaryId={profile.id} doctorId={profile.medecin_id} />
          </motion.div>
        )}

        {activeTab === 'agenda' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SecretaryAgendaView secretaryId={profile.id} doctorId={profile.medecin_id} />
          </motion.div>
        )}

        {activeTab === 'profil' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SecretaryProfileView profile={profile} />
          </motion.div>
        )}
      </main>

      {/* Chat Component */}
      {showDoctorChat && profile.medecin_id && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <DoctorSecretaryChat 
            userId={profile.id} 
            userName={`${profile.nom} ${profile.prenom}`}
            isSecretary={true}
            doctorId={profile.medecin_id}
          />
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={profile}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}