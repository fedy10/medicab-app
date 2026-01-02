import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, FileText, Image, File, CheckCircle, Sparkles, Edit2 } from 'lucide-react';

interface ModernFileUploaderProps {
  onUpload: (fileName: string, fileType: string, file: File) => void;
  onClose: () => void;
}

export function ModernFileUploader({ onUpload, onClose }: ModernFileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    
    // Proposer le nom du fichier par défaut (sans extension)
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
    setFileName(nameWithoutExtension);
    
    // Créer un aperçu pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (selectedFile && fileName.trim() && fileType) {
      onUpload(fileName.trim(), fileType, selectedFile);
      onClose();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-12 h-12 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-12 h-12 text-red-500" />;
    } else {
      return <File className="w-12 h-12 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtension = (file: File): string => {
    const parts = file.name.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-5 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ajouter un fichier</h3>
                <p className="text-xs opacity-90">Téléversez et nommez votre document</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* File input hidden */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleFileSelect(files[0]);
              }
            }}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />

          {/* Drop zone moderne */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-5 overflow-hidden ${
              isDragging
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-105'
                : selectedFile
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                : 'border-gray-300 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-slate-50'
            }`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500 rounded-full blur-3xl"></div>
            </div>

            {selectedFile ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-3 relative z-10"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex items-center justify-center"
                >
                  <div className="relative">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                
                {preview ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center"
                  >
                    <img
                      src={preview}
                      alt="Aperçu"
                      className="max-h-32 rounded-xl shadow-lg border-4 border-white"
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-lg">
                      {getFileIcon(selectedFile)}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Type inconnu'}
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreview(null);
                    setFileName('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
                >
                  Choisir un autre fichier
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                </motion.div>
                <p className="text-gray-900 font-medium mb-1 text-base">
                  Glissez-déposez votre fichier ici
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  ou cliquez pour parcourir vos fichiers
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-md">
                  <span className="text-xs text-gray-500">
                    PDF, Images, Documents • Max 10 MB
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Nom du fichier */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                  <Edit2 className="w-4 h-4 text-blue-500" />
                  Nom du fichier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Nom personnalisé du fichier"
                    className="w-full px-4 py-2.5 pr-24 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white shadow-sm text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-mono">
                    {getFileExtension(selectedFile)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Le nom sera affiché dans le dossier patient
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Type de document */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Type de document
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all bg-white shadow-sm text-sm"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="IRM">🧲 IRM</option>
                  <option value="Scanner">📡 Scanner</option>
                  <option value="Radio">📷 Radiographie</option>
                  <option value="Échographie">🔊 Échographie</option>
                  <option value="Analyse">🧪 Analyse de sang</option>
                  <option value="Ordonnance">💊 Ordonnance</option>
                  <option value="Compte rendu">📋 Compte rendu</option>
                  <option value="Lettre médicale">✉️ Lettre médicale</option>
                  <option value="Certificat">📜 Certificat médical</option>
                  <option value="Autre">📄 Autre</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info box moderne */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-xl p-4 mb-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1.5">
                  📱 Compatible avec tous les appareils
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    Ordinateur: Parcourir vos fichiers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                    Smartphone/Tablette: Accéder à la caméra ou galerie
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-pink-500 rounded-full"></span>
                    Glisser-déposer directement depuis votre explorateur
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fixed Actions at bottom */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-white font-medium transition-all text-sm"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={!selectedFile || !fileName.trim() || !fileType}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2 text-sm"
            >
              {selectedFile && fileName && fileType ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Ajouter au dossier
                </>
              ) : (
                'Ajouter au dossier'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}