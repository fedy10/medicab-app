import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Download,
  Check,
  CheckCheck,
  User,
  ArrowLeft,
} from 'lucide-react';
import { getSpecialtyIcon, getSpecialtyColor } from './MedicalSpecialtiesSelector';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  email: string;
}

interface Patient {
  id: string;
  name: string;
  age?: number;
}

interface MedicalFile {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  files?: MedicalFile[];
  isReferralLetter?: boolean;
}

interface PatientReferralChatProps {
  patient: Patient;
  referringDoctor: {
    id: string;
    name: string;
  };
  receivingDoctor: Doctor;
  specialty: string;
  referralLetterContent: string;
  patientFiles?: MedicalFile[];
  onClose: () => void;
  onBack?: () => void;
}

export function PatientReferralChat({
  patient,
  referringDoctor,
  receivingDoctor,
  specialty,
  referralLetterContent,
  patientFiles = [],
  onClose,
  onBack,
}: PatientReferralChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<MedicalFile[]>([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const specialtyEmoji = getSpecialtyIcon(specialty);
  const specialtyColor = getSpecialtyColor(specialty);

  // Load messages from localStorage
  useEffect(() => {
    const chatKey = `referral_chat_${patient.id}_${receivingDoctor.id}`;
    const savedMessages = localStorage.getItem(chatKey);
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Create initial message with referral letter
      const initialMessage: Message = {
        id: `msg_${Date.now()}`,
        senderId: referringDoctor.id,
        senderName: referringDoctor.name,
        content: `Bonjour Dr. ${receivingDoctor.name.split(' ').pop()},\n\nJe vous adresse mon patient ${patient.name} pour consultation spécialisée en ${specialty}.\n\nVeuillez trouver ci-joint la lettre d'orientation détaillée.\n\nCordialement,\nDr. ${referringDoctor.name.split(' ').pop()}`,
        timestamp: new Date().toISOString(),
        read: false,
        isReferralLetter: true,
        files: [
          {
            id: `pdf_${Date.now()}`,
            name: `Lettre_orientation_${patient.name.replace(/\s/g, '_')}.pdf`,
            type: 'application/pdf',
            url: '#',
            uploadDate: new Date().toISOString(),
          },
        ],
      };
      setMessages([initialMessage]);
      localStorage.setItem(chatKey, JSON.stringify([initialMessage]));
    }
  }, [patient.id, receivingDoctor.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: referringDoctor.id,
      senderName: referringDoctor.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      files: selectedFiles.length > 0 ? selectedFiles : undefined,
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    // Save to localStorage
    const chatKey = `referral_chat_${patient.id}_${receivingDoctor.id}`;
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

    // Save notification
    const notifications = JSON.parse(localStorage.getItem('chat_notifications') || '[]');
    notifications.push({
      id: `notif_${Date.now()}`,
      chatKey,
      patientName: patient.name,
      senderName: referringDoctor.name,
      receiverId: receivingDoctor.id,
      timestamp: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem('chat_notifications', JSON.stringify(notifications));

    setNewMessage('');
    setSelectedFiles([]);
    setShowFileSelector(false);
  };

  const handleSelectFile = (file: MedicalFile) => {
    if (selectedFiles.find((f) => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter((f) => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div
          className="p-6 text-white flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${specialtyColor}, ${specialtyColor}dd)`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {receivingDoctor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{receivingDoctor.name}</h3>
                <p className="text-sm opacity-90">{specialty}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Patient Info */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <div>
                <p className="font-semibold">Patient : {patient.name}</p>
                {patient.age && <p className="text-sm opacity-90">{patient.age} ans</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === referringDoctor.id;
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <div className="px-4 py-1 bg-gray-300 text-gray-700 text-xs font-medium rounded-full">
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        isOwnMessage
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : 'bg-white text-gray-900'
                      } rounded-2xl p-4 shadow-md`}
                    >
                      {/* Sender name for received messages */}
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          {message.senderName}
                        </p>
                      )}

                      {/* Message content */}
                      {message.content && (
                        <p className="whitespace-pre-wrap text-sm mb-2">{message.content}</p>
                      )}

                      {/* Referral letter badge */}
                      {message.isReferralLetter && (
                        <div className="mb-2">
                          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                            📋 Lettre d'orientation
                          </span>
                        </div>
                      )}

                      {/* Files */}
                      {message.files && message.files.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {message.files.map((file) => (
                            <div
                              key={file.id}
                              className={`flex items-center gap-3 p-3 rounded-xl ${
                                isOwnMessage ? 'bg-white/20' : 'bg-gray-100'
                              }`}
                            >
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p
                                  className={`text-xs ${
                                    isOwnMessage ? 'text-white/70' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(file.uploadDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <button
                                className={`p-2 rounded-lg ${
                                  isOwnMessage
                                    ? 'hover:bg-white/20'
                                    : 'hover:bg-gray-200'
                                } transition-colors`}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Time and status */}
                      <div
                        className={`flex items-center gap-1 mt-2 text-xs ${
                          isOwnMessage ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        <span>{formatTime(message.timestamp)}</span>
                        {isOwnMessage && (
                          <>
                            {message.read ? (
                              <CheckCheck className="w-4 h-4 text-blue-300" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* File Selector */}
        <AnimatePresence>
          {showFileSelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-white overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    Fichiers médicaux du patient
                  </h4>
                  <button
                    onClick={() => setShowFileSelector(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {patientFiles.length === 0 ? (
                    <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
                      Aucun fichier médical disponible
                    </div>
                  ) : (
                    patientFiles.map((file) => {
                      const isSelected = selectedFiles.find((f) => f.id === file.id);
                      return (
                        <button
                          key={file.id}
                          onClick={() => handleSelectFile(file)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(file.uploadDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-purple-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="border-t border-gray-200 bg-purple-50 p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-purple-900">
                {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''} sélectionné
                {selectedFiles.length > 1 ? 's' : ''} :
              </span>
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg text-sm"
                >
                  {getFileIcon(file.type)}
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => handleSelectFile(file)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-end gap-3">
            <button
              onClick={() => setShowFileSelector(!showFileSelector)}
              className={`p-3 rounded-xl transition-colors ${
                showFileSelector
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Votre message..."
              rows={1}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && selectedFiles.length === 0}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}