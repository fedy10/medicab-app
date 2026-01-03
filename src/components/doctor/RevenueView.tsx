import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Filter, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRevenues, useAppointments } from '../../hooks/useSupabase';

interface RevenueViewProps {
  doctorId: string;
}

export function RevenueView({ doctorId }: RevenueViewProps) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Utiliser les hooks Supabase
  const { revenues, stats, loading: revenuesLoading } = useRevenues(doctorId);
  const { appointments, loading: appointmentsLoading } = useAppointments(doctorId);

  const loading = revenuesLoading || appointmentsLoading;

  // Calculer les revenus à partir des rendez-vous complétés
  const completedAppointments = appointments.filter(apt => 
    apt.status === 'completed' && apt.payment_amount && apt.payment_amount > 0
  );

  // Grouper les revenus par date pour les graphiques
  const getRevenueByDate = () => {
    const revenueMap = new Map<string, number>();
    
    completedAppointments.forEach(apt => {
      const date = apt.date;
      const current = revenueMap.get(date) || 0;
      revenueMap.set(date, current + (apt.payment_amount || 0));
    });

    return Array.from(revenueMap.entries())
      .map(([date, montant]) => ({ date, montant }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Derniers 30 jours
  };

  // Grouper par mode de paiement
  const getRevenueByPaymentType = () => {
    const paymentMap = new Map<string, number>();
    
    completedAppointments.forEach(apt => {
      const type = apt.payment_type || 'normal';
      const current = paymentMap.get(type) || 0;
      paymentMap.set(type, current + (apt.payment_amount || 0));
    });

    return Array.from(paymentMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const revenueByDate = getRevenueByDate();
  const revenueByPaymentType = getRevenueByPaymentType();

  // Stats globales
  const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.payment_amount || 0), 0);
  const totalConsultations = completedAppointments.length;
  const averageRevenue = totalConsultations > 0 ? totalRevenue / totalConsultations : 0;

  // Revenus du mois en cours
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthlyRevenue = completedAppointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    })
    .reduce((sum, apt) => sum + (apt.payment_amount || 0), 0);

  // Revenus du mois dernier pour comparaison
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthRevenue = completedAppointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastMonthYear;
    })
    .reduce((sum, apt) => sum + (apt.payment_amount || 0), 0);

  const monthlyGrowth = lastMonthRevenue > 0 
    ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des revenus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">{t('revenue')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 rounded-lg transition-all ${
              period === 'day'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg transition-all ${
              period === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-lg transition-all ${
              period === 'year'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Année
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {monthlyGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(monthlyGrowth).toFixed(1)}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)} DT</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Ce Mois</p>
          <p className="text-2xl font-bold text-gray-900">{monthlyRevenue.toFixed(2)} DT</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Consultations</p>
          <p className="text-2xl font-bold text-gray-900">{totalConsultations}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Moyenne</p>
          <p className="text-2xl font-bold text-gray-900">{averageRevenue.toFixed(2)} DT</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Evolution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-900 mb-4">Évolution des Revenus</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                formatter={(value: any) => [`${value} DT`, 'Revenu']}
              />
              <Line 
                type="monotone" 
                dataKey="montant" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Types */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-900 mb-4">Répartition par Mode de Paiement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByPaymentType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByPaymentType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value} DT`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-gray-900 mb-4">Transactions Récentes</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {completedAppointments.slice(-10).reverse().map((apt) => (
            <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{apt.patient_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(apt.date).toLocaleDateString('fr-FR')} • {apt.time}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{apt.payment_amount} DT</p>
                <p className="text-xs text-gray-500 capitalize">{apt.payment_type || 'normal'}</p>
              </div>
            </div>
          ))}
        </div>

        {completedAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <DollarSign className="w-12 h-12 mx-auto mb-2" />
            <p>Aucune transaction enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}
