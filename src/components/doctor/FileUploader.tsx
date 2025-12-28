import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, FileText, Image, File, CheckCircle } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (file: File, type: string) => void;
  onClose: () => void;
}

export function FileUploader({ onUpload, onClose }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    
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
    if (selectedFile && fileType) {
      onUpload(selectedFile, fileType);
      onClose();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900">Ajouter un fichier au dossier</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-6 ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          {selectedFile ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              
              {preview ? (
                <div className="flex justify-center">
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="max-h-48 rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {getFileIcon(selectedFile)}
                </div>
              )}

              <div>
                <p className="text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Choisir un autre fichier
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 mb-2">
                Glissez-déposez votre fichier ici
              </p>
              <p className="text-sm text-gray-600 mb-4">
                ou cliquez pour parcourir
              </p>
              <p className="text-xs text-gray-500">
                Formats acceptés: PDF, Images, Documents (max 10 MB)
              </p>
            </motion.div>
          )}
        </div>

        {/* File type selector */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Type de document</label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="">Sélectionner un type</option>
            <option value="IRM">IRM</option>
            <option value="Scanner">Scanner</option>
            <option value="Radio">Radiographie</option>
            <option value="Échographie">Échographie</option>
            <option value="Analyse">Analyse de sang</option>
            <option value="Ordonnance">Ordonnance</option>
            <option value="Compte rendu">Compte rendu</option>
            <option value="Lettre médicale">Lettre médicale</option>
            <option value="Certificat">Certificat médical</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Info about supported devices */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>📱 Compatible avec tous les appareils</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Ordinateur: Parcourir vos fichiers</li>
            <li>• Smartphone/Tablette: Accéder à la caméra ou galerie</li>
            <li>• Glisser-déposer directement depuis votre explorateur</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !fileType}
            className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter au dossier
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
