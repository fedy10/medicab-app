import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Phone, MapPin, Mail, AlertCircle, UserCheck, Clock, Search, ChevronLeft, ChevronRight, Filter, DollarSign, AlertTriangle } from 'lucide-react';
import { MedecinDetailsModal } from '../modals/MedecinDetailsModal';

interface MedecinsManagementProps {
  onUpdate?: () => void;
}

export function MedecinsManagement({ onUpdate }: MedecinsManagementProps) {
  const [medecins, setMedecins] = useState<any[]>([]);
  const [selectedMedecin, setSelectedMedecin] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'late'>('all');

  useEffect(() => {
    fetchMedecins();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, paymentFilter, activeTab]);

  const fetchMedecins = () => {
    try {
      const usersData = localStorage.getItem('demo_users');
      const users = usersData ? JSON.parse(usersData) : [];
      const medecinsData = users.filter((u: any) => u.role === 'medecin');
      setMedecins(medecinsData);
    } catch (error) {
      console.error('Error fetching medecins:', error);
      setMedecins([]);
    }
  };

  const updateStatus = (userId: string, newStatus: string) => {
    try {
      setProcessing(true);
      const usersData = localStorage.getItem('demo_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      const updatedUsers = users.map((u: any) => 
        u.id === userId ? { ...u, status: newStatus } : u
      );
      
      localStorage.setItem('demo_users', JSON.stringify(updatedUsers));
      fetchMedecins();
      setSelectedMedecin(null);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Check if doctor has paid recently (within last 30 days)
  const hasRecentPayment = (medecinId: string): boolean => {
    try {
      const key = `payments_${medecinId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return false;
      
      const payments = JSON.parse(stored);
      if (payments.length === 0) return false;
      
      // Get the most recent payment
      const sortedPayments = [...payments].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const lastPayment = sortedPayments[0];
      const paymentDate = new Date(lastPayment.date);
      const durationInDays = lastPayment.duration * 30; // Convert months to days
      const expirationDate = new Date(paymentDate);
      expirationDate.setDate(expirationDate.getDate() + durationInDays);
      
      const today = new Date();
      return expirationDate >= today;
    } catch (error) {
      return false;
    }
  };

  const getPaymentStatus = (medecinId: string): 'paid' | 'late' | 'none' => {
    try {
      const key = `payments_${medecinId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return 'none';
      
      const payments = JSON.parse(stored);
      if (payments.length === 0) return 'none';
      
      return hasRecentPayment(medecinId) ? 'paid' : 'late';
    } catch (error) {
      return 'none';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700',
    };

    const labels = {
      active: 'Actif',
      pending: 'En attente',
      suspended: 'Suspendu',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPaymentBadge = (medecinId: string) => {
    const status = getPaymentStatus(medecinId);
    
    if (status === 'paid') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
          <DollarSign className="w-3 h-3" />
          <span>Payé</span>
        </div>
      );
    } else if (status === 'late') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>En retard</span>
        </div>
      );
    }
    return null;
  };

  // Filter medecins based on tab
  let filteredMedecins = activeTab === 'pending' 
    ? medecins.filter(m => m.status === 'pending')
    : medecins;

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredMedecins = filteredMedecins.filter(m => 
      m.nom?.toLowerCase().includes(query) ||
      m.prenom?.toLowerCase().includes(query) ||
      m.telephone?.toLowerCase().includes(query) ||
      m.email?.toLowerCase().includes(query) ||
      m.specialite?.toLowerCase().includes(query)
    );
  }

  // Apply payment filter
  if (paymentFilter !== 'all') {
    filteredMedecins = filteredMedecins.filter(m => {
      const status = getPaymentStatus(m.id);
      if (paymentFilter === 'paid') {
        return status === 'paid';
      } else if (paymentFilter === 'late') {
        return status === 'late' || status === 'none';
      }
      return true;
    });
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredMedecins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedecins = filteredMedecins.slice(startIndex, endIndex);

  const pendingCount = medecins.filter(m => m.status === 'pending').length;
  const paidCount = medecins.filter(m => getPaymentStatus(m.id) === 'paid').length;
  const lateCount = medecins.filter(m => {
    const status = getPaymentStatus(m.id);
    return status === 'late' || status === 'none';
  }).length;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'all'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Tous les médecins
          {activeTab === 'all' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'pending'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Demandes en attente
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              {pendingCount}
            </span>
          )}
          {activeTab === 'pending' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, téléphone, email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Payment Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                paymentFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Tous</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                paymentFilter === 'all' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {medecins.length}
              </span>
            </button>

            <button
              onClick={() => setPaymentFilter('paid')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                paymentFilter === 'paid'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Payé</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                paymentFilter === 'paid' ? 'bg-white/20' : 'bg-green-100 text-green-700'
              }`}>
                {paidCount}
              </span>
            </button>

            <button
              onClick={() => setPaymentFilter('late')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                paymentFilter === 'late'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>En retard</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                paymentFilter === 'late' ? 'bg-white/20' : 'bg-red-100 text-red-700'
              }`}>
                {lateCount}
              </span>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredMedecins.length === 0 ? (
            <span>Aucun résultat trouvé</span>
          ) : (
            <span>
              {filteredMedecins.length} médecin{filteredMedecins.length > 1 ? 's' : ''} trouvé{filteredMedecins.length > 1 ? 's' : ''}
              {searchQuery && <span> pour "{searchQuery}"</span>}
            </span>
          )}
        </div>
      </div>

      {/* Medecins List */}
      {currentMedecins.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentMedecins.map((medecin, index) => (
              <motion.div
                key={medecin.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedMedecin(medecin)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-xl">
                      {medecin.nom?.[0]}{medecin.prenom?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-gray-900 truncate">
                        Dr. {medecin.nom} {medecin.prenom}
                      </h3>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(medecin.status)}
                        {getPaymentBadge(medecin.id)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{medecin.specialite}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{medecin.telephone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{medecin.email}</span>
                      </div>
                      {medecin.adresse && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{medecin.adresse}</span>
                        </div>
                      )}
                    </div>

                    {medecin.code_medecin && (
                      <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">Code: {medecin.code_medecin}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first, last, current, and adjacent pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">
            {searchQuery || paymentFilter !== 'all'
              ? 'Aucun médecin ne correspond à vos critères de recherche'
              : activeTab === 'pending' 
                ? 'Aucune demande en attente' 
                : 'Aucun médecin enregistré'}
          </p>
          {(searchQuery || paymentFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPaymentFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Medecin Detail Modal */}
      <AnimatePresence>
        {selectedMedecin && (
          <MedecinDetailsModal
            medecin={selectedMedecin}
            onClose={() => setSelectedMedecin(null)}
            onUpdateStatus={updateStatus}
            processing={processing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
