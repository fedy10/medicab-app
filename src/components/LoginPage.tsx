import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Stethoscope, Eye, EyeOff } from 'lucide-react';
import type { User } from '../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onShowRegister: () => void;
}

export function LoginPage({ onLogin, onShowRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Comptes de démonstration
    const demoAccounts = [
      {
        id: 'admin-1',
        email: 'admin@medicab.tn',
        password: 'admin123',
        role: 'admin' as const,
        name: 'Administrateur',
        isActive: true,
      },
      {
        id: 'doc-1',
        email: 'dr.ben.ali@medicab.tn',
        password: 'doctor123',
        role: 'doctor' as const,
        name: 'Dr. Ahmed Ben Ali',
        doctorCode: 'DOC-001',
        specialty: 'Cardiologue',
        phone: '+216 98 123 456',
        isActive: true,
      },
      {
        id: 'sec-1',
        email: 'fatma.sec@medicab.tn',
        password: 'secretary123',
        role: 'secretary' as const,
        name: 'Fatma Trabelsi',
        doctorCode: 'DOC-001',
        phone: '+216 22 987 654',
        isActive: true,
      },
    ];

    const user = demoAccounts.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: 90 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Logo and title */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
          >
            <Stethoscope className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-gray-900 mb-2">MediCab Pro</h1>
          <p className="text-gray-600">Gestion intelligente de cabinet médical</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                placeholder="votre@email.com"
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-gray-700 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Se connecter
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <button
            onClick={onShowRegister}
            className="text-blue-600 hover:text-purple-600 transition-colors"
          >
            Créer un compte médecin
          </button>
        </motion.div>

        {/* Demo accounts info */}
        {/*<motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-blue-50 rounded-xl"
        >
          <p className="text-sm text-gray-700 mb-2">Comptes de démonstration :</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Admin:</strong> admin@medicab.tn / admin123</p>
            <p><strong>Médecin:</strong> dr.ben.ali@medicab.tn / doctor123</p>
            <p><strong>Secrétaire:</strong> fatma.sec@medicab.tn / secretary123</p>
          </div>
        </motion.div>*/}
      </motion.div>
    </div>
  );
}
