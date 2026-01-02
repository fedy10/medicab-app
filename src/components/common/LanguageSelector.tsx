import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'ar' as const, name: 'العربية', flag: '🇹🇳', nativeName: 'العربية' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧', nativeName: 'English' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Languages className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
        </motion.div>
        <span className="text-2xl">{currentLanguage?.flag}</span>
        <span className="hidden md:block font-medium text-gray-700">{currentLanguage?.nativeName}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden z-50"
            >
              <div className="p-2">
                <div className="px-3 py-2 border-b border-gray-200 mb-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t('change_language')}
                  </p>
                </div>
                
                {languages.map((lang, index) => (
                  <motion.button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      language === lang.code
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.nativeName}</span>
                    </div>
                    
                    {language === lang.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Decorative bottom gradient */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
