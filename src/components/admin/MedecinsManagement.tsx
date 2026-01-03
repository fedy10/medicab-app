import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Phone, MapPin, Mail, AlertCircle, UserCheck, Clock, Search, ChevronLeft, ChevronRight, Filter, DollarSign, AlertTriangle } from 'lucide-react';
import { MedecinDetailsModal } from '../modals/MedecinDetailsModal';
import { useProfiles } from '../../hooks/useSupabase';
import { profileService, revenueService } from '../../lib/services/supabaseService';

interface MedecinsManagementProps {
  onUpdate?: () => void;
}

export function MedecinsManagement({ onUpdate }: MedecinsManagementProps) {
  const [selectedMedecin, setSelectedMedecin] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'late'>('all');
  
  // Utiliser le hook Supabase
  const { doctors: medecins, loading, refresh, updateStatus: updateProfileStatus } = useProfiles();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, paymentFilter, activeTab]);

  const updateStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      setProcessing(true);
      console.log('🔄 Mise à jour du statut:', userId, newStatus);
      
      await updateProfileStatus(userId, newStatus);
      
      console.log('✅ Statut mis à jour avec succès');
      setSelectedMedecin(null);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('❌ Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Check if doctor has paid recently (within last 30 days)
  const hasRecentPayment = async (medecinId: string): Promise<boolean> => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const stats = await revenueService.getStats(
        medecinId,
        thirtyDaysAgo.toISOString().split('T')[0]
      );
      
      return stats.count > 0;
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      return false;
    }
  };

  // Get payment status
  const getPaymentStatus = async (medecinId: string): Promise<'none' | 'paid' | 'late'> => {
    try {
      const hasPayment = await hasRecentPayment(medecinId);
      if (!hasPayment) return 'none';
      
      const stats = await revenueService.getStats(medecinId);
      
      if (stats.revenues.length === 0) return 'none';
      
      // Get the most recent payment date
      const sortedPayments = [...stats.revenues].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const lastPaymentDate = new Date(sortedPayments[0].date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (lastPaymentDate < thirtyDaysAgo) {
        return 'late';
      }
      
      return 'paid';
    } catch (error) {
      console.error('Erreur statut paiement:', error);
      return 'none';
    }
  };

  // Filter medecins
  const filteredMedecins = medecins.filter((m) => {
    // Tab filter
    if (activeTab === 'pending' && m.status !== 'pending') return false;
    if (activeTab === 'all' && m.status === 'pending') return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = m.name?.toLowerCase().includes(query);
      const matchesEmail = m.email?.toLowerCase().includes(query);
      const matchesSpecialty = m.specialty?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesEmail && !matchesSpecialty) return false;
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMedecins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedecins = filteredMedecins.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
            <UserCheck className="w-3 h-3" />
            Actif
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs">
            <AlertCircle className="w-3 h-3" />
            Suspendu
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des médecins...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">Gestion des Médecins</h2>
          <p className="text-gray-600">
            {filteredMedecins.length} médecin{filteredMedecins.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tous ({medecins.filter(m => m.status !== 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            En attente ({medecins.filter(m => m.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou spécialité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Medecins Grid */}
      {paginatedMedecins.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun médecin trouvé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedMedecins.map((medecin) => (
              <motion.div
                key={medecin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedMedecin(medecin)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-gray-900 mb-1">{medecin.name}</h3>
                    <p className="text-sm text-gray-500">{medecin.specialty || 'Médecin généraliste'}</p>
                  </div>
                  {getStatusBadge(medecin.status)}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{medecin.email}</span>
                  </div>
                  {medecin.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{medecin.phone}</span>
                    </div>
                  )}
                  {medecin.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{medecin.address}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  {medecin.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(medecin.id, 'active');
                        }}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(medecin.id, 'suspended');
                        }}
                        disabled={processing}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Rejeter
                      </button>
                    </>
                  )}
                  {medecin.status === 'active' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(medecin.id, 'suspended');
                      }}
                      disabled={processing}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Suspendre
                    </button>
                  )}
                  {medecin.status === 'suspended' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(medecin.id, 'active');
                      }}
                      disabled={processing}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Réactiver
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {selectedMedecin && (
        <MedecinDetailsModal
          medecin={selectedMedecin}
          onClose={() => setSelectedMedecin(null)}
          onStatusUpdate={(id, status) => updateStatus(id, status)}
        />
      )}
    </div>
  );
}
