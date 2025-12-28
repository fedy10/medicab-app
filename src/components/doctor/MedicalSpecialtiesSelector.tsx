import { motion } from 'motion/react';
import { 
  Stethoscope, Activity, Droplet, TestTube, Utensils, Users, 
  Heart, Microscope, Shield, Pill, Brain, Radiation, Wind,
  Bone, Flower2, Medal, Briefcase, Ambulance, Syringe,
  Scissors, PersonStanding, Eye, Ear, Baby, User,
  Zap, Scan, Flask, Building2, MessageSquare, Glasses,
  Dumbbell, HandMetal, Apple
} from 'lucide-react';

export interface MedicalSpecialty {
  name: string;
  icon: any;
  color: string;
  gradient: string;
}

export const medicalSpecialties: MedicalSpecialty[] = [
  { name: 'Médecine générale', icon: Stethoscope, color: 'text-gray-700', gradient: 'from-gray-500 to-slate-500' },
  { name: 'Cardiologie', icon: Heart, color: 'text-red-600', gradient: 'from-red-500 to-pink-500' },
  { name: 'Dermatologie', icon: Droplet, color: 'text-orange-600', gradient: 'from-orange-500 to-amber-500' },
  { name: 'Endocrinologie', icon: TestTube, color: 'text-purple-600', gradient: 'from-purple-500 to-indigo-500' },
  { name: 'Gastro-entérologie', icon: Utensils, color: 'text-green-600', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Gériatrie', icon: Users, color: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Hématologie', icon: Droplet, color: 'text-red-700', gradient: 'from-red-600 to-rose-500' },
  { name: 'Infectiologie', icon: Shield, color: 'text-teal-600', gradient: 'from-teal-500 to-cyan-500' },
  { name: 'Médecine interne', icon: Activity, color: 'text-indigo-600', gradient: 'from-indigo-500 to-blue-500' },
  { name: 'Néphrologie', icon: Pill, color: 'text-blue-700', gradient: 'from-blue-600 to-indigo-500' },
  { name: 'Neurologie', icon: Brain, color: 'text-purple-700', gradient: 'from-purple-600 to-pink-500' },
  { name: 'Oncologie', icon: Radiation, color: 'text-pink-600', gradient: 'from-pink-500 to-rose-500' },
  { name: 'Pneumologie', icon: Wind, color: 'text-cyan-600', gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Rhumatologie', icon: Bone, color: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Allergologie', icon: Flower2, color: 'text-lime-600', gradient: 'from-lime-500 to-green-500' },
  { name: 'Médecine du sport', icon: Medal, color: 'text-yellow-600', gradient: 'from-yellow-500 to-amber-500' },
  { name: 'Médecine du travail', icon: Briefcase, color: 'text-slate-600', gradient: 'from-slate-500 to-gray-500' },
  { name: 'Médecine d\'urgence', icon: Ambulance, color: 'text-red-500', gradient: 'from-red-400 to-orange-500' },
  { name: 'Anesthésie-réanimation', icon: Syringe, color: 'text-violet-600', gradient: 'from-violet-500 to-purple-500' },
  { name: 'Chirurgie générale', icon: Scissors, color: 'text-gray-600', gradient: 'from-gray-500 to-zinc-500' },
  { name: 'Chirurgie orthopédique', icon: Bone, color: 'text-stone-600', gradient: 'from-stone-500 to-neutral-500' },
  { name: 'Neurochirurgie', icon: Brain, color: 'text-fuchsia-600', gradient: 'from-fuchsia-500 to-pink-500' },
  { name: 'Ophtalmologie', icon: Eye, color: 'text-sky-600', gradient: 'from-sky-500 to-blue-500' },
  { name: 'ORL', icon: Ear, color: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Gynécologie-obstétrique', icon: Baby, color: 'text-pink-500', gradient: 'from-pink-400 to-rose-400' },
  { name: 'Pédiatrie', icon: Baby, color: 'text-blue-500', gradient: 'from-blue-400 to-cyan-400' },
  { name: 'Psychiatrie', icon: User, color: 'text-indigo-500', gradient: 'from-indigo-400 to-purple-400' },
  { name: 'Radiologie', icon: Scan, color: 'text-zinc-600', gradient: 'from-zinc-500 to-gray-500' },
  { name: 'Médecine nucléaire', icon: Zap, color: 'text-yellow-500', gradient: 'from-yellow-400 to-orange-400' },
  { name: 'Biologie médicale', icon: Microscope, color: 'text-green-700', gradient: 'from-green-600 to-emerald-600' },
  { name: 'Santé publique', icon: Building2, color: 'text-blue-800', gradient: 'from-blue-700 to-indigo-700' },
  { name: 'Orthophonie', icon: MessageSquare, color: 'text-teal-500', gradient: 'from-teal-400 to-cyan-400' },
  { name: 'Orthoptie', icon: Glasses, color: 'text-violet-500', gradient: 'from-violet-400 to-purple-400' },
  { name: 'Kinésithérapie', icon: Dumbbell, color: 'text-orange-500', gradient: 'from-orange-400 to-red-400' },
  { name: 'Ergothérapie', icon: HandMetal, color: 'text-amber-500', gradient: 'from-amber-400 to-yellow-400' },
  { name: 'Nutrition', icon: Apple, color: 'text-green-500', gradient: 'from-green-400 to-lime-400' },
];

// Helper functions pour obtenir l'icône et la couleur d'une spécialité
export function getSpecialtyIcon(specialtyName: string): string {
  const specialty = medicalSpecialties.find(s => s.name.toLowerCase() === specialtyName.toLowerCase());
  
  // Map des emojis par spécialité
  const emojiMap: { [key: string]: string } = {
    'médecine générale': '🩺',
    'cardiologie': '❤️',
    'dermatologie': '🧴',
    'endocrinologie': '🧬',
    'gastro-entérologie': '🍽️',
    'gériatrie': '👴',
    'hématologie': '💉',
    'infectiologie': '🛡️',
    'médecine interne': '⚕️',
    'néphrologie': '💊',
    'neurologie': '🧠',
    'oncologie': '🎗️',
    'pneumologie': '🫁',
    'rhumatologie': '🦴',
    'allergologie': '🌸',
    'médecine du sport': '🏅',
    'médecine du travail': '💼',
    'médecine d\'urgence': '🚑',
    'anesthésie-réanimation': '💉',
    'chirurgie générale': '✂️',
    'chirurgie orthopédique': '🦴',
    'neurochirurgie': '🧠',
    'ophtalmologie': '👁️',
    'orl': '👂',
    'gynécologie-obstétrique': '👶',
    'pédiatrie': '🧸',
    'psychiatrie': '🧘',
    'radiologie': '📡',
    'médecine nucléaire': '⚡',
    'biologie médicale': '🔬',
    'santé publique': '🏛️',
    'orthophonie': '💬',
    'orthoptie': '👓',
    'kinésithérapie': '🏋️',
    'ergothérapie': '✋',
    'nutrition': '🍎',
  };

  return emojiMap[specialtyName.toLowerCase()] || '⚕️';
}

export function getSpecialtyColor(specialtyName: string): string {
  const specialty = medicalSpecialties.find(s => s.name.toLowerCase() === specialtyName.toLowerCase());
  
  // Map des couleurs par spécialité
  const colorMap: { [key: string]: string } = {
    'médecine générale': '#6B7280',
    'cardiologie': '#EF4444',
    'dermatologie': '#F97316',
    'endocrinologie': '#A855F7',
    'gastro-entérologie': '#10B981',
    'gériatrie': '#3B82F6',
    'hématologie': '#DC2626',
    'infectiologie': '#14B8A6',
    'médecine interne': '#6366F1',
    'néphrologie': '#1D4ED8',
    'neurologie': '#9333EA',
    'oncologie': '#EC4899',
    'pneumologie': '#06B6D4',
    'rhumatologie': '#F59E0B',
    'allergologie': '#84CC16',
    'médecine du sport': '#EAB308',
    'médecine du travail': '#64748B',
    'médecine d\'urgence': '#F87171',
    'anesthésie-réanimation': '#8B5CF6',
    'chirurgie générale': '#6B7280',
    'chirurgie orthopédique': '#78716C',
    'neurochirurgie': '#D946EF',
    'ophtalmologie': '#0EA5E9',
    'orl': '#10B981',
    'gynécologie-obstétrique': '#F472B6',
    'pédiatrie': '#60A5FA',
    'psychiatrie': '#818CF8',
    'radiologie': '#71717A',
    'médecine nucléaire': '#FBBF24',
    'biologie médicale': '#059669',
    'santé publique': '#1E40AF',
    'orthophonie': '#2DD4BF',
    'orthoptie': '#A78BFA',
    'kinésithérapie': '#FB923C',
    'ergothérapie': '#FCD34D',
    'nutrition': '#4ADE80',
  };

  return colorMap[specialtyName.toLowerCase()] || '#6366F1';
}

interface MedicalSpecialtiesSelectorProps {
  onSelect: (specialty: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export function MedicalSpecialtiesSelector({ onSelect, onClose, onCancel }: MedicalSpecialtiesSelectorProps) {
  const handleClose = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-gray-900 mb-6">Sélectionnez la spécialité médicale</h3>
        <p className="text-gray-600 mb-6">Choisissez vers quelle spécialité orienter le patient</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {medicalSpecialties.map((specialty) => {
            const Icon = specialty.icon;
            return (
              <motion.button
                key={specialty.name}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onSelect(specialty.name);
                  handleClose();
                }}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all text-center bg-white hover:shadow-lg"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${specialty.gradient} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-900">{specialty.name}</p>
              </motion.button>
            );
          })}
        </div>
        
        <button
          onClick={handleClose}
          className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50"
        >
          Annuler
        </button>
      </motion.div>
    </motion.div>
  );
}