import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Send, X, Edit2, Trash2, MoreVertical, User, Check, Paperclip, Download, FileText, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  read: boolean;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string; // base64
  };
}

interface Doctor {
  id: string;
  name: string;
  avatar: string;
  specialite?: string;
}

interface AdminChatProps {
  userId: string;
  userName: string;
  unreadCount?: number;
}

export function AdminChat({ userId, userName, unreadCount }: AdminChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      updateUnreadCounts();
      // Update unread counts every 3 seconds
      const interval = setInterval(updateUnreadCounts, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchMessages();
      // Refresh messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (isOpen && selectedDoctor) {
      const timeout = setTimeout(() => {
        markMessagesAsRead();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, selectedDoctor]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDoctors = () => {
    try {
      const usersData = localStorage.getItem('demo_users');
      const users = usersData ? JSON.parse(usersData) : [];
      const doctorsList = users
        .filter((u: any) => u.role === 'medecin')
        .map((doctor: any) => ({
          id: doctor.id,
          name: `Dr. ${doctor.nom} ${doctor.prenom}`,
          avatar: `${doctor.nom[0]}${doctor.prenom[0]}`,
          specialite: doctor.specialite || 'Médecin',
        }));
      
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchMessages = () => {
    if (!selectedDoctor) return;

    try {
      const conversationKey = `messages_${[userId, selectedDoctor.id].sort().join('_')}`;
      console.log('📥 [AdminChat] Fetching messages with key:', conversationKey);
      const storedMessages = localStorage.getItem(conversationKey);
      console.log('📥 [AdminChat] Raw stored messages:', storedMessages);
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        console.log('📥 [AdminChat] Parsed messages:', parsed);
        setMessages(parsed);
      } else {
        console.log('📥 [AdminChat] No messages found');
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedDoctor) return;

    const newMessage: Message = {
      id: `${Date.now()}_${userId}`,
      senderId: userId,
      senderName: userName,
      senderRole: 'Administrateur',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    const conversationKey = `messages_${[userId, selectedDoctor.id].sort().join('_')}`;
    console.log('💬 [AdminChat] Sending message with key:', conversationKey);
    console.log('💬 [AdminChat] Admin ID:', userId);
    console.log('💬 [AdminChat] Doctor ID:', selectedDoctor.id);
    console.log('💬 [AdminChat] Message:', newMessage);
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
    console.log('💬 [AdminChat] Messages saved:', updatedMessages);
    setMessage('');
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    setShowMenu(null);
  };

  const saveEditedMessage = () => {
    if (!editingContent.trim() || !selectedDoctor) return;

    const updatedMessages = messages.map((msg) =>
      msg.id === editingMessageId
        ? { ...msg, content: editingContent.trim() }
        : msg
    );

    const conversationKey = `messages_${[userId, selectedDoctor.id].sort().join('_')}`;
    setMessages(updatedMessages);
    localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedDoctor) return;

    const updatedMessages = messages.filter((msg) => msg.id !== messageId);
    const conversationKey = `messages_${[userId, selectedDoctor.id].sort().join('_')}`;
    setMessages(updatedMessages);
    localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
    setShowMenu(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessageId) {
        saveEditedMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const markMessagesAsRead = () => {
    if (!selectedDoctor) return;

    try {
      const conversationKey = `messages_${[userId, selectedDoctor.id].sort().join('_')}`;
      console.log('✅ [AdminChat] Marking messages as read for key:', conversationKey);
      const storedMessages = localStorage.getItem(conversationKey);
      console.log('✅ [AdminChat] Current stored messages:', storedMessages);
      
      if (storedMessages) {
        const currentMessages: Message[] = JSON.parse(storedMessages);
        console.log('✅ [AdminChat] Parsed messages:', currentMessages);
        const updatedMessages = currentMessages.map((msg) =>
          msg.senderId !== userId && !msg.read
            ? { ...msg, read: true }
            : msg
        );
        console.log('✅ [AdminChat] Updated messages:', updatedMessages);

        setMessages(updatedMessages);
        localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
        console.log('✅ [AdminChat] Messages saved back to localStorage');
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDoctor) return;

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximum : 5 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      
      const newMessage: Message = {
        id: `${Date.now()}_${userId}`,
        senderId: userId,
        senderName: userName,
        senderRole: 'Administrateur',
        content: `📎 ${file.name}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
        },
      };

      const conversationKey = `messages_${[userId, selectedDoctor.id].sort().join('_')}`;
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
    };

    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadFile = (file: { name: string; type: string; data: string }) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6" />;
    }
    return <FileText className="w-6 h-6" />;
  };

  const updateUnreadCounts = () => {
    const counts: { [key: string]: number } = {};
    doctors.forEach((doctor) => {
      const conversationKey = `messages_${[userId, doctor.id].sort().join('_')}`;
      const storedMessages = localStorage.getItem(conversationKey);
      if (storedMessages) {
        const messages: Message[] = JSON.parse(storedMessages);
        const unreadCount = messages.filter((msg) => msg.senderId !== userId && !msg.read).length;
        counts[doctor.id] = unreadCount;
      }
    });
    setUnreadCounts(counts);
  };

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Shield className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <div>
              <h3 className="text-sm">
                {selectedDoctor ? `Chat avec ${selectedDoctor.name}` : 'Mes Conversations'}
              </h3>
              {selectedDoctor && (
                <p className="text-xs text-purple-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {selectedDoctor.specialite}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedDoctor && (
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                title="Retour à la liste"
              >
                <User className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedDoctor(null);
              }}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {!selectedDoctor ? (
        /* Doctors List */
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {doctors.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun médecin</p>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {doctors.map((doctor) => {
                const unreadCount = unreadCounts[doctor.id] || 0;
                return (
                  <motion.button
                    key={doctor.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDoctor(doctor)}
                    className="w-full p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 border border-gray-100 relative"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white relative">
                      {doctor.avatar}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-gray-900">{doctor.name}</p>
                      <p className="text-xs text-gray-500">{doctor.specialite}</p>
                    </div>
                    <div className="text-purple-400">
                      <User className="w-5 h-5" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Messages */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucun message</p>
                  <p className="text-xs mt-1">Commencez la conversation</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === userId;
                const isEditing = editingMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Sender info */}
                      {!isOwn && (
                        <div className="flex items-center gap-2 mb-1 ml-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                            {selectedDoctor.avatar}
                          </div>
                          <span className="text-xs text-gray-600">
                            {msg.senderName} • {msg.senderRole}
                          </span>
                        </div>
                      )}

                      {isEditing ? (
                        <div className="w-full bg-white rounded-2xl p-3 shadow-md border border-purple-300">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={saveEditedMessage}
                              className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                            >
                              <Check className="w-4 h-4" />
                              Enregistrer
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditingContent('');
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div
                            className={`rounded-2xl p-3 shadow-md ${
                              isOwn
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            {msg.file ? (
                              /* File message */
                              <div className="space-y-2">
                                {msg.file.type.startsWith('image/') && (
                                  <img
                                    src={msg.file.data}
                                    alt={msg.file.name}
                                    className="max-w-full rounded-lg"
                                    style={{ maxHeight: '200px' }}
                                  />
                                )}
                                <div className="flex items-center gap-2">
                                  {getFileIcon(msg.file.type)}
                                  <div className="flex-1">
                                    <p className="text-sm break-words">{msg.file.name}</p>
                                    <p className="text-xs opacity-70">{formatFileSize(msg.file.size)}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadFile(msg.file!)}
                                    className={`p-1.5 rounded-full hover:bg-opacity-20 transition-colors ${
                                      isOwn ? 'hover:bg-white' : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                  >
                                    <Download className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-gray-700'}`} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm break-words">{msg.content}</p>
                            )}
                            <p
                              className={`text-xs mt-1 flex items-center gap-1 ${
                                isOwn ? 'text-purple-100' : 'text-gray-500'
                              }`}
                            >
                              {msg.timestamp}
                              {isOwn && (
                                <Check className="w-3 h-3" />
                              )}
                            </p>
                          </div>
                          
                          {/* Message Actions (only for own messages) */}
                          {isOwn && (
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
                              <button
                                onClick={() => setShowMenu(showMenu === msg.id ? null : msg.id)}
                                className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 shadow-md"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-700" />
                              </button>
                              
                              <AnimatePresence>
                                {showMenu === msg.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-32 z-10"
                                  >
                                    {!msg.file && (
                                      <button
                                        onClick={() => handleEditMessage(msg.id, msg.content)}
                                        className="w-full px-3 py-2 text-sm text-left hover:bg-purple-50 flex items-center gap-2 text-purple-600"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        Modifier
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Supprimer
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none max-h-32"
                rows={1}
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 shadow-md"
              >
                <Paperclip className="w-5 h-5 text-gray-700" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}