import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Filter } from 'lucide-react';

interface RevenueViewProps {
  doctorId: string;
}

interface Consultation {
  id: string;
  date: string;
  montant: number;
  modePaiement: string;
  patient: {
    nom: string;
    prenom: string;
  };
}

export function RevenueView({ doctorId }: RevenueViewProps) {
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadConsultations();
  }, [doctorId]);

  const loadConsultations = () => {
    try {
      const key = `appointments_${doctorId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        // Only include confirmed appointments with payment
        const confirmedWithPayment = data.filter((apt: any) => 
          apt.isConfirmed && apt.amountPaid && apt.amountPaid > 0
        ).map((apt: any) => ({
          id: apt.id,
          date: apt.date,
          montant: apt.amountPaid || 0,
          modePaiement: apt.paymentType || 'Normal',
          patient: {
            nom: apt.patientName.split(' ')[apt.patientName.split(' ').length - 1] || apt.patientName,
            prenom: apt.patientName.split(' ')[0] || '',
          }
        }));
        setConsultations(confirmedWithPayment);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
    }
  };

  // Filter consultations based on period
  const getFilteredConsultations = () => {
    const now = selectedDate;
    
    return consultations.filter(c => {
      const consultDate = new Date(c.date);
      
      if (period === 'day') {
        return consultDate.toDateString() === now.toDateString();
      } else if (period === 'month') {
        return consultDate.getMonth() === now.getMonth() && 
               consultDate.getFullYear() === now.getFullYear();
      } else if (period === 'year') {
        return consultDate.getFullYear() === now.getFullYear();
      }
      return false;
    });
  };

  const filteredConsultations = getFilteredConsultations();

  // Calculate total revenue
  const totalRevenue = filteredConsultations.reduce((sum, c) => sum + (c.montant || 0), 0);
  const totalPatients = filteredConsultations.length;

  // Calculate revenue by payment method
  const revenueByPaymentMethod = filteredConsultations.reduce((acc: any, c) => {
    const method = c.modePaiement || 'Normal';
    if (!acc[method]) {
      acc[method] = { total: 0, count: 0 };
    }
    acc[method].total += c.montant || 0;
    acc[method].count += 1;
    return acc;
  }, {});

  const paymentMethodsData = Object.entries(revenueByPaymentMethod).map(([type, data]: [string, any]) => ({
    type,
    amount: data.total,
    patients: data.count,
    percentage: totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0,
  }));

  // Generate chart data based on period
  const getChartData = () => {
    if (period === 'day') {
      // Hourly data for the selected day
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        revenue: 0,
        patients: 0,
      }));

      filteredConsultations.forEach(c => {
        const hour = new Date(c.date).getHours();
        hourlyData[hour].revenue += c.montant || 0;
        hourlyData[hour].patients += 1;
      });

      // Only show hours with data (8am to 8pm typically)
      return hourlyData.filter((d, i) => i >= 8 && i <= 20);
    } else if (period === 'month') {
      // Daily data for the month
      const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        day: `${i + 1}`,
        revenue: 0,
        patients: 0,
      }));

      filteredConsultations.forEach(c => {
        const day = new Date(c.date).getDate() - 1;
        dailyData[day].revenue += c.montant || 0;
        dailyData[day].patients += 1;
      });

      return dailyData;
    } else {
      // Monthly data for the year
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        revenue: 0,
        patients: 0,
      }));

      filteredConsultations.forEach(c => {
        const month = new Date(c.date).getMonth();
        monthlyData[month].revenue += c.montant || 0;
        monthlyData[month].patients += 1;
      });

      return monthlyData;
    }
  };

  const chartData = getChartData();

  // Calculate average per day/month
  const calculateAverage = () => {
    if (period === 'day') {
      return totalRevenue; // Total for the day
    } else if (period === 'month') {
      const daysWithRevenue = chartData.filter(d => d.revenue > 0).length;
      return daysWithRevenue > 0 ? Math.round(totalRevenue / daysWithRevenue) : 0;
    } else {
      const monthsWithRevenue = chartData.filter(d => d.revenue > 0).length;
      return monthsWithRevenue > 0 ? Math.round(totalRevenue / monthsWithRevenue) : 0;
    }
  };

  // Calculate previous period for comparison
  const getPreviousPeriodRevenue = () => {
    const prevDate = new Date(selectedDate);
    
    if (period === 'day') {
      prevDate.setDate(prevDate.getDate() - 1);
    } else if (period === 'month') {
      prevDate.setMonth(prevDate.getMonth() - 1);
    } else {
      prevDate.setFullYear(prevDate.getFullYear() - 1);
    }

    const prevConsultations = consultations.filter(c => {
      const consultDate = new Date(c.date);
      
      if (period === 'day') {
        return consultDate.toDateString() === prevDate.toDateString();
      } else if (period === 'month') {
        return consultDate.getMonth() === prevDate.getMonth() && 
               consultDate.getFullYear() === prevDate.getFullYear();
      } else {
        return consultDate.getFullYear() === prevDate.getFullYear();
      }
    });

    return prevConsultations.reduce((sum, c) => sum + (c.montant || 0), 0);
  };

  const previousRevenue = getPreviousPeriodRevenue();
  const revenueChange = previousRevenue > 0 
    ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
    : 0;

  // Date navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    if (period === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (period === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    
    setSelectedDate(newDate);
  };

  const formatDateLabel = () => {
    if (period === 'day') {
      return selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (period === 'month') {
      return selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else {
      return selectedDate.getFullYear().toString();
    }
  };

  const stats = [
    {
      label: period === 'day' ? 'Revenus du jour' : period === 'month' ? 'Revenus du mois' : 'Revenus de l\'année',
      value: `${totalRevenue.toLocaleString()} TND`,
      change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
      trend: revenueChange >= 0 ? 'up' : 'down',
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: period === 'day' ? 'Total du jour' : period === 'month' ? 'Moyenne par jour' : 'Moyenne par mois',
      value: `${calculateAverage().toLocaleString()} TND`,
      change: '',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: period === 'day' ? 'Patients du jour' : period === 'month' ? 'Patients du mois' : 'Patients de l\'année',
      value: `${totalPatients}`,
      change: '',
      trend: 'up',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Tarif moyen',
      value: totalPatients > 0 ? `${Math.round(totalRevenue / totalPatients)} TND` : '0 TND',
      change: '',
      trend: 'up',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Period selector and date navigation */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-gray-900">Analyse des revenus</h3>
            <div className="flex gap-2">
              {(['day', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setSelectedDate(new Date());
                  }}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    period === p
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p === 'day' ? 'Jour' : p === 'month' ? 'Mois' : 'Année'}
                </button>
              ))}
            </div>
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl min-w-[200px] text-center">
              <p className="text-sm capitalize">{formatDateLabel()}</p>
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={selectedDate >= new Date()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              {stat.change && (
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar/Line chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h4 className="text-gray-900 mb-4">
            {period === 'day' ? 'Revenus par heure' : period === 'month' ? 'Revenus par jour' : 'Revenus par mois'}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            {period === 'year' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={period === 'day' ? 'hour' : 'day'} 
                  stroke="#9ca3af"
                  interval={period === 'month' ? 2 : 0}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Payment methods pie chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h4 className="text-gray-900 mb-4">Répartition par mode de paiement</h4>
          {paymentMethodsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment methods breakdown */}
      {paymentMethodsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h4 className="text-gray-900 mb-4">Détail des modes de paiement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethodsData.map((method, index) => {
              let colorClass = '';
              switch(method.type) {
                case 'Normal':
                  colorClass = 'from-blue-500 to-cyan-500';
                  break;
                case 'CNAM':
                  colorClass = 'from-green-500 to-emerald-500';
                  break;
                case 'Assurance':
                  colorClass = 'from-purple-500 to-pink-500';
                  break;
                case 'Gratuit':
                  colorClass = 'from-orange-500 to-amber-500';
                  break;
                default:
                  colorClass = 'from-gray-500 to-gray-600';
              }
              
              return (
                <motion.div
                  key={method.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-4`}>
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h5 className="text-gray-900 mb-2">{method.type}</h5>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">Montant</p>
                      <p className="text-gray-900">{method.amount.toLocaleString()} TND</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Patients</p>
                      <p className="text-gray-900">{method.patients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Part</p>
                      <p className="text-gray-900">{method.percentage}%</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* No data message */}
      {filteredConsultations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">
            Aucune consultation pour cette période
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Les statistiques s'afficheront une fois que vous aurez des consultations enregistrées
          </p>
        </motion.div>
      )}
    </div>
  );
}