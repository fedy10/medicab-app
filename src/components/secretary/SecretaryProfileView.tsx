import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Hash, Edit, CheckCircle, Briefcase } from 'lucide-react';

interface SecretaryProfileViewProps {
  profile: any;
}

export function SecretaryProfileView({ profile }: SecretaryProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    cin: '',
    diplome: '',
    sexe: 'M',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        email: profile.email || '',
        telephone: profile.telephone || '',
        adresse: profile.adresse || '',
        cin: profile.cin || '',
        diplome: profile.diplome || '',
        sexe: profile.sexe || 'M',
      });
    }
  }, [profile]);

  const handleSave = () => {
    try {
      const usersData = localStorage.getItem('demo_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      const updatedUsers = users.map((u: any) => 
        u.id === profile.user_id 
          ? { ...u, ...profileData }
          : u
      );
      
      localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
      setIsEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde du profil');
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
        <p className="text-gray-600">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">Informations personnelles</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              isEditing ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
            }`}
          >
            {isEditing ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Enregistrer
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Modifier
              </>
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Nom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileData.nom}
                onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-purple-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Prénom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileData.prenom}
                onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-purple-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-purple-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={profileData.telephone}
                onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-purple-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">CIN</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileData.cin}
                onChange={(e) => setProfileData({ ...profileData, cin: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-purple-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Sexe</label>
            <select
              value={profileData.sexe}
              onChange={(e) => setProfileData({ ...profileData, sexe: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl ${
                isEditing ? 'focus:border-purple-500 focus:outline-none' : 'bg-gray-50'
              }`}
            >
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileData.adresse}
                onChange={(e) => setProfileData({ ...profileData, adresse: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-purple-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Diplôme</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profileData.diplome}
                onChange={(e) => setProfileData({ ...profileData, diplome: e.target.value })}
                disabled={!isEditing}
                className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${
                  isEditing ? 'focus:border-purple-500 focus:outline-none' : 'bg-gray-50'
                }`}
              />
            </div>
          </div>

          {profile.medecin_id && (
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Médecin rattaché</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profile.medecin_id}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
        <h4 className="text-gray-900 mb-2">À propos de votre compte</h4>
        <p className="text-gray-600 text-sm">
          Votre compte secrétaire est rattaché au médecin. Pour toute
          modification de permissions ou réinitialisation de mot de passe, contactez votre médecin.
        </p>
      </div>
    </div>
  );
}
