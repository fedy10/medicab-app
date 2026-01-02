import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Users } from 'lucide-react';

interface Payment {
  id: string;
  date: string;
  duration: number;
  amount: number;
  doctorId: string;
  doctorName?: string;
}

export function AdminRevenueView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAllPayments();
  }, []);

  const loadAllPayments = () => {
    try {
      const usersData = localStorage.getItem('demo_users');
      if (!usersData) {
        setPayments([]);
        return;
      }

      const users = JSON.parse(usersData);
      const doctors = users.filter((u: any) => u.role === 'medecin');
      
      const allPayments: Payment[] = [];
      
      doctors.forEach((doctor: any) => {
        const key = `payments_${doctor.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const doctorPayments = JSON.parse(stored);
          doctorPayments.forEach((payment: any) => {
            allPayments.push({
              ...payment,
              doctorId: doctor.id,
              doctorName: `Dr. ${doctor.nom} ${doctor.prenom}`,
            });
          });
        }
      });

      // Sort by date descending
      allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPayments(allPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    }
  };

  // Calculate stats
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const todayPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.toDateString() === today.toDateString();
  });

  const monthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate >= startOfMonth;
  });

  const yearPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate >= startOfYear;
  });

  const totalToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalYear = yearPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAll = payments.reduce((sum, p) => sum + p.amount, 0);

  // Group payments by doctor
  const paymentsByDoctor = payments.reduce((acc: any, payment) => {
    const doctorName = payment.doctorName || 'Inconnu';
    if (!acc[doctorName]) {
      acc[doctorName] = { name: doctorName, total: 0, count: 0 };
    }
    acc[doctorName].total += payment.amount;
    acc[doctorName].count += 1;
    return acc;
  }, {});

  const doctorChartData = Object.values(paymentsByDoctor).sort((a: any, b: any) => b.total - a.total);

  // Group payments by month
  const paymentsByMonth: any = {};
  yearPayments.forEach(payment => {
    const date = new Date(payment.date);
    const monthKey = date.toLocaleDateString('fr-FR', { month: 'short' });
    if (!paymentsByMonth[monthKey]) {
      paymentsByMonth[monthKey] = 0;
    }
    paymentsByMonth[monthKey] += payment.amount;
  });

  const monthlyChartData = [
    { month: 'Jan', revenue: paymentsByMonth['janv.'] || 0 },
    { month: 'Fév', revenue: paymentsByMonth['févr.'] || 0 },
    { month: 'Mar', revenue: paymentsByMonth['mars'] || 0 },
    { month: 'Avr', revenue: paymentsByMonth['avr.'] || 0 },
    { month: 'Mai', revenue: paymentsByMonth['mai'] || 0 },
    { month: 'Jun', revenue: paymentsByMonth['juin'] || 0 },
    { month: 'Jul', revenue: paymentsByMonth['juil.'] || 0 },
    { month: 'Aoû', revenue: paymentsByMonth['août'] || 0 },
    { month: 'Sep', revenue: paymentsByMonth['sept.'] || 0 },
    { month: 'Oct', revenue: paymentsByMonth['oct.'] || 0 },
    { month: 'Nov', revenue: paymentsByMonth['nov.'] || 0 },
    { month: 'Déc', revenue: paymentsByMonth['déc.'] || 0 },
  ];

  const stats = [
    {
      label: 'Aujourd\'hui',
      value: `${totalToday.toFixed(2)} TND`,
      count: todayPayments.length,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Ce mois',
      value: `${totalMonth.toFixed(2)} TND`,
      count: monthPayments.length,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Cette année',
      value: `${totalYear.toFixed(2)} TND`,
      count: yearPayments.length,
      color: 'from-orange-500 to-amber-500',
    },
    {
      label: 'Total',
      value: `${totalAll.toFixed(2)} TND`,
      count: payments.length,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-gray-900">Analyse des revenus globaux</h3>
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
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
              <div className="text-right">
                <p className="text-xs text-gray-500">{stat.count} paiement{stat.count > 1 ? 's' : ''}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by doctor - Bar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h4 className="text-gray-900 mb-4">Revenus par médecin</h4>
          {doctorChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <Users className="w-16 h-16 mb-4" />
              <p>Aucun paiement enregistré</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={doctorChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                  formatter={(value: any) => [`${value.toFixed(2)} TND`, 'Montant']}
                />
                <Bar dataKey="total" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Revenue by doctor - Pie chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h4 className="text-gray-900 mb-4">Répartition des revenus</h4>
          {doctorChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <DollarSign className="w-16 h-16 mb-4" />
              <p>Aucun paiement enregistré</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={doctorChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {doctorChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${value.toFixed(2)} TND`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {doctorChartData.slice(0, 6).map((doctor: any, index: number) => (
                  <div key={doctor.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700">{doctor.name}</span>
                    </div>
                    <span className="text-gray-900">{doctor.total.toFixed(2)} TND</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Yearly trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h4 className="text-gray-900 mb-4">Évolution mensuelle</h4>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[350px] text-gray-400">
            <Calendar className="w-16 h-16 mb-4" />
            <p>Aucun paiement enregistré</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyChartData}>
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
                formatter={(value: any) => `${value.toFixed(2)} TND`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Recent Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h4 className="text-gray-900 mb-4">Derniers paiements</h4>
        {payments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <DollarSign className="w-12 h-12 mx-auto mb-3" />
            <p>Aucun paiement enregistré</p>
            <p className="text-sm mt-2">Les paiements ajoutés apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Médecin</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Durée</th>
                  <th className="text-right py-3 px-4 text-sm text-gray-600">Montant</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(payment.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{payment.doctorName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{payment.duration} mois</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                        {payment.amount.toFixed(2)} TND
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {payments.length > 10 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Et {payments.length - 10} autres paiements...
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
