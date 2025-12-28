import { useState } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  FileText,
  Users,
  User,
  LogOut,
  UserCheck,
} from "lucide-react";
import type { User as UserType } from "../../App";
import { CalendarView } from "../doctor/CalendarView";
import { SecretaryConsultationsView } from "./SecretaryConsultationsView";
import { PatientsView } from "../doctor/PatientsView";
import { SecretaryProfileView } from "./SecretaryProfileView";

interface SecretaryDashboardProps {
  user: UserType;
  onLogout: () => void;
}

type TabType =
  | "calendar"
  | "consultations"
  | "patients"
  | "profile";

export function SecretaryDashboard({
  user,
  onLogout,
}: SecretaryDashboardProps) {
  const [activeTab, setActiveTab] =
    useState<TabType>("calendar");

  const tabs = [
    {
      id: "calendar" as const,
      label: "Agenda",
      icon: Calendar,
    },
    {
      id: "consultations" as const,
      label: "Consultations",
      icon: FileText,
    },
    { id: "patients" as const, label: "Patients", icon: Users },
    { id: "profile" as const, label: "Profil", icon: User },
  ];

  // Stats rapides
  const todayStats = {
    appointments: 8,
    consultations: 5,
    newPatients: 2,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <UserCheck className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-600">
                  Secrétaire médicale • Code: {user.doctorCode}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Aujourd'hui
                  </p>
                  <p className="text-gray-900">
                    {todayStats.appointments} RDV
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Confirmés
                  </p>
                  <p className="text-gray-900">
                    {todayStats.consultations}
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Nouveaux
                  </p>
                  <p className="text-gray-900">
                    {todayStats.newPatients}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6 bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "calendar" && (
            <CalendarView doctorId={user.doctorCode || ""} />
          )}
          {activeTab === "consultations" && (
            <SecretaryConsultationsView />
          )}
          {activeTab === "patients" && (
            <PatientsView doctorId={user.doctorCode || ""} />
          )}
          {activeTab === "profile" && (
            <SecretaryProfileView user={user} />
          )}
        </motion.div>
      </div>
    </div>
  );
}