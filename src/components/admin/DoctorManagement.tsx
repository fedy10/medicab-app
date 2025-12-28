import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Mail, Phone, MapPin, Ban, Check, DollarSign, Calendar, Plus, AlertTriangle } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { PaginationComponent } from '../ui/PaginationComponent';

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  monthsPaid: number;
  note?: string;
}

interface Doctor {
  id: string;
  user_id: string;
  code: string;
  name: string;
  nom: string;
  prenom: string;
  specialty: string;
  specialite: string;
  email: string;
  phone: string;
  telephone: string;
  address: string;
  adresse: string;
  paymentStatus: 'paid' | 'pending' | 'late';
  status: 'active' | 'suspended' | 'pending_admin_approval';
  isActive: boolean;
  subscriptionFee: number;
  lastPayment: string;
  payments?: PaymentRecord[];
  subscriptionEndDate?: string;
  creditRemaining?: number;
}

interface DoctorManagementProps {
  userToken?: string;
}

export function DoctorManagement({ userToken }: DoctorManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'late'>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMonths, setPaymentMonths] = useState('1');
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    if (userToken) {
      fetchDoctors();
    }
  }, [userToken]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-73eb4022/doctors`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      setProcessing(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-73eb4022/doctors/${userId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        await fetchDoctors();
        // Update selectedDoctor immediately with correct data
        setDoctors(prevDoctors => {
          const updatedDoctors = prevDoctors.map(d => 
            d.user_id === userId 
              ? { ...d, status: newStatus, isActive: newStatus === 'active' }
              : d
          );
          
          // Update selectedDoctor if it's the one being modified
          if (selectedDoctor && selectedDoctor.user_id === userId) {
            const updatedDoc = updatedDoctors.find(d => d.user_id === userId);
            if (updatedDoc) {
              setSelectedDoctor(updatedDoc);
            }
          }
          
          return updatedDoctors;
        });
      } else {
        console.error('Error response from server:', await response.text());
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessing(false);
    }
  };

  const addPayment = async () => {
    if (!selectedDoctor || !paymentAmount || !paymentMonths) return;

    try {
      setProcessing(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-73eb4022/doctors/${selectedDoctor.user_id}/payments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            amount: parseFloat(paymentAmount),
            monthsPaid: parseInt(paymentMonths),
            note: paymentNote,
          }),
        }
      );

      if (response.ok) {
        await fetchDoctors();
        setShowPaymentForm(false);
        setPaymentAmount('');
        setPaymentMonths('1');
        setPaymentNote('');
        // Refresh selected doctor
        const updated = doctors.find(d => d.user_id === selectedDoctor.user_id);
        if (updated) {
          setSelectedDoctor(updated);
        }
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Mock doctors for demo
  const mockDoctors: Doctor[] = [
    {
      id: '1',
      user_id: '1',
      code: 'DOC-001',
      name: 'Dr. Ahmed Ben Ali',
      nom: 'Ben Ali',
      prenom: 'Ahmed',
      specialty: 'Cardiologue',
      specialite: 'Cardiologue',
      email: 'dr.ben.ali@medicab.tn',
      phone: '+216 98 123 456',
      telephone: '+216 98 123 456',
      address: 'Avenue Habib Bourguiba, Tunis',
      adresse: 'Avenue Habib Bourguiba, Tunis',
      paymentStatus: 'paid',
      status: 'active',
      isActive: true,
      subscriptionFee: 450,
      lastPayment: '01/12/2024',
      subscriptionEndDate: '01/01/2025',
      creditRemaining: 0,
      payments: [
        { id: '1', date: '01/12/2024', amount: 450, monthsPaid: 1, note: 'Paiement mensuel' }
      ]
    },
    {
      id: '2',
      user_id: '2',
      code: 'DOC-002',
      name: 'Dr. Leila Mejri',
      nom: 'Mejri',
      prenom: 'Leila',
      specialty: 'Dermatologue',
      specialite: 'Dermatologue',
      email: 'dr.mejri@medicab.tn',
      phone: '+216 22 987 654',
      telephone: '+216 22 987 654',
      address: 'Rue de la Liberté, Sfax',
      adresse: 'Rue de la Liberté, Sfax',
      paymentStatus: 'paid',
      status: 'active',
      isActive: true,
      subscriptionFee: 450,
      lastPayment: '05/12/2024',
      subscriptionEndDate: '05/03/2025',
      creditRemaining: 0,
      payments: [
        { id: '1', date: '05/12/2024', amount: 1350, monthsPaid: 3, note: 'Paiement trimestriel' }
      ]
    },
    {
      id: '3',
      user_id: '3',
      code: 'DOC-003',
      name: 'Dr. Karim Bouzid',
      nom: 'Bouzid',
      prenom: 'Karim',
      specialty: 'Pédiatre',
      specialite: 'Pédiatre',
      email: 'dr.bouzid@medicab.tn',
      phone: '+216 55 321 789',
      telephone: '+216 55 321 789',
      address: 'Avenue Farhat Hached, Sousse',
      adresse: 'Avenue Farhat Hached, Sousse',
      paymentStatus: 'late',
      status: 'active',
      isActive: true,
      subscriptionFee: 450,
      lastPayment: '15/10/2024',
      subscriptionEndDate: '15/11/2024',
      creditRemaining: 450,
      payments: [
        { id: '1', date: '15/10/2024', amount: 450, monthsPaid: 1, note: 'Paiement mensuel' }
      ]
    },
    {
      id: '4',
      user_id: '4',
      code: 'DOC-004',
      name: 'Dr. Sarah Trabelsi',
      nom: 'Trabelsi',
      prenom: 'Sarah',
      specialty: 'Gynécologue',
      specialite: 'Gynécologue',
      email: 'dr.trabelsi@medicab.tn',
      phone: '+216 29 654 321',
      telephone: '+216 29 654 321',
      address: 'Boulevard de l\'Environnement, Monastir',
      adresse: 'Boulevard de l\'Environnement, Monastir',
      paymentStatus: 'pending',
      status: 'suspended',
      isActive: false,
      subscriptionFee: 450,
      lastPayment: 'En attente',
      creditRemaining: 450,
      payments: []
    },
  ];

  const displayDoctors = doctors.length > 0 ? doctors : mockDoctors;

  const filteredDoctors = displayDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doctor.paymentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (status: Doctor['paymentStatus']) => {
    const configs = {
      paid: { label: 'Payé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      pending: { label: 'En attente', color: 'bg-orange-100 text-orange-700', icon: Clock },
      late: { label: 'En retard', color: 'bg-red-100 text-red-700', icon: XCircle },
    };
    const config = configs[status];
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un médecin..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'paid', 'pending', 'late'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-xl transition-all ${
                  filterStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tous' : status === 'paid' ? 'Payés' : status === 'pending' ? 'En attente' : 'Retard'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors list */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-gray-900 mb-4">Liste des médecins ({filteredDoctors.length})</h3>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {paginatedDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                        {doctor.name.split(' ')[1]?.[0] || doctor.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-gray-900">{doctor.name}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{doctor.code}</span>
                        </div>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mt-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {doctor.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {doctor.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {doctor.address}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doctor.paymentStatus)}
                      {doctor.isActive ? (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          <Check className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          <Ban className="w-3 h-3" />
                          Suspendu
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Dernier paiement : <strong>{doctor.lastPayment}</strong>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDoctor(doctor)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDoctors.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Doctor details modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoctor(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <h3 className="text-gray-900 mb-6">Détails du médecin</h3>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom complet</p>
                    <p className="text-gray-900">{selectedDoctor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Code médecin</p>
                    <p className="text-gray-900">{selectedDoctor.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Spécialité</p>
                    <p className="text-gray-900">{selectedDoctor.specialty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Abonnement mensuel</p>
                    <p className="text-gray-900">{selectedDoctor.subscriptionFee} TND</p>
                  </div>
                  {selectedDoctor.subscriptionEndDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fin d'abonnement</p>
                      <p className="text-gray-900">{selectedDoctor.subscriptionEndDate}</p>
                    </div>
                  )}
                  {selectedDoctor.creditRemaining !== undefined && selectedDoctor.creditRemaining > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Crédit restant</p>
                      <p className="text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {selectedDoctor.creditRemaining} TND
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Gestion des paiements
                    </h4>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPaymentForm(!showPaymentForm)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un paiement
                    </motion.button>
                  </div>

                  {/* Payment Form */}
                  {showPaymentForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50 rounded-xl p-4 mb-4"
                    >
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Montant (TND)</label>
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="450"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Nombre de mois</label>
                          <input
                            type="number"
                            value={paymentMonths}
                            onChange={(e) => setPaymentMonths(e.target.value)}
                            placeholder="1"
                            min="1"
                            max="12"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm text-gray-700 mb-2">Note (optionnel)</label>
                        <textarea
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          placeholder="Paiement mensuel, trimestriel, etc."
                          rows={2}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addPayment}
                          disabled={processing || !paymentAmount || !paymentMonths}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? 'Enregistrement...' : 'Enregistrer le paiement'}
                        </button>
                        <button
                          onClick={() => {
                            setShowPaymentForm(false);
                            setPaymentAmount('');
                            setPaymentMonths('1');
                            setPaymentNote('');
                          }}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Annuler
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Payment History */}
                  {selectedDoctor.payments && selectedDoctor.payments.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-3">Historique des paiements</p>
                      {selectedDoctor.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-gray-900">{payment.amount} TND</p>
                              <p className="text-sm text-gray-600">{payment.note || `Paiement pour ${payment.monthsPaid} mois`}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {payment.date}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{payment.monthsPaid} mois</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Aucun paiement enregistré</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-6">
                  <div className="flex gap-4 mb-4">
                    {selectedDoctor.status === 'active' ? (
                      <button
                        onClick={() => updateDoctorStatus(selectedDoctor.user_id, 'suspended')}
                        disabled={processing}
                        className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Ban className="w-5 h-5" />
                        {processing ? 'Traitement...' : 'Suspendre l\'accès'}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateDoctorStatus(selectedDoctor.user_id, 'active')}
                        disabled={processing}
                        className="flex-1 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        {processing ? 'Traitement...' : 'Activer le compte'}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      setShowPaymentForm(false);
                      setPaymentAmount('');
                      setPaymentMonths('1');
                      setPaymentNote('');
                    }}
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}