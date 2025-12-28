import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Send, X, Edit2, Trash2, MoreVertical, User, Check, Paperclip, Download, FileText, Image as ImageIcon } from 'lucide-react';

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

interface Secretary {
  id: string;
  name: string;
  online: boolean;
  avatar?: string;
}

interface DoctorSecretaryChatProps {
  userId: string;
  userName: string;
  isSecretary?: boolean;
  doctorId?: string;
}

export function DoctorSecretaryChat({ userId, userName, isSecretary = false, doctorId }: DoctorSecretaryChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Secretary | null>(null);
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [contacts, setContacts] = useState<Secretary[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      updateUnreadCounts();
      // Refresh contacts every 5 seconds to detect new conversations
      if (!isSecretary) {
        const interval = setInterval(() => {
          fetchContacts();
          updateUnreadCounts();
        }, 5000);
        return () => clearInterval(interval);
      } else {
        const interval = setInterval(updateUnreadCounts, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      // Refresh messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (isOpen && selectedContact) {
      // Delay marking as read to ensure messages are fetched first
      const timeout = setTimeout(() => {
        markMessagesAsRead();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, selectedContact]);

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

  const fetchContacts = () => {
    try {
      const usersData = localStorage.getItem('demo_users');
      const users = usersData ? JSON.parse(usersData) : [];

      console.log('🔍 [Chat Debug] fetchContacts called');
      console.log('📋 User ID:', userId);
      console.log('👤 Is Secretary:', isSecretary);
      console.log('👥 All users:', users);

      if (isSecretary && doctorId) {
        // Secretary sees their doctor
        const doctor = users.find((u: any) => u.id === doctorId);
        if (doctor) {
          setContacts([{
            id: doctor.id,
            name: `Dr. ${doctor.nom} ${doctor.prenom}`,
            online: true,
            avatar: `${doctor.nom[0]}${doctor.prenom[0]}`,
          }]);
          // Auto-select the doctor
          setSelectedContact({
            id: doctor.id,
            name: `Dr. ${doctor.nom} ${doctor.prenom}`,
            online: true,
            avatar: `${doctor.nom[0]}${doctor.prenom[0]}`,
          });
        }
      } else {
        // Doctor sees their secretaries - check both user list AND existing conversations
        console.log('👨‍⚕️ [Doctor Mode] Looking for secretaries...');
        
        const secretariesList = users.filter((u: any) => 
          u.role === 'secretaire' && u.medecin_id === userId
        );
        
        console.log('📝 Secretaries from profile:', secretariesList);
        
        // Also check localStorage for any conversation keys
        const allConversations: Secretary[] = [];
        const seenIds = new Set<string>();
        
        // Add secretaries from user list
        secretariesList.forEach((s: any) => {
          if (!seenIds.has(s.id)) {
            allConversations.push({
              id: s.id,
              name: `${s.nom} ${s.prenom}`,
              online: true,
              avatar: `${s.nom[0]}${s.prenom[0]}`,
            });
            seenIds.add(s.id);
          }
        });
        
        console.log('🔑 Scanning localStorage for conversations...');
        // Check for existing conversations in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('messages_')) {
            console.log('💬 Found conversation key:', key);
            const ids = key.replace('messages_', '').split('_');
            console.log('📌 IDs in conversation:', ids);
            console.log('🎯 Checking if includes userId:', userId, '→', ids.includes(userId));
            
            if (ids.includes(userId)) {
              const otherId = ids.find(id => id !== userId);
              console.log('👤 Other ID:', otherId);
              
              if (otherId && !seenIds.has(otherId)) {
                // Find this user in the users list
                const user = users.find((u: any) => u.id === otherId);
                console.log('🔍 Found user:', user);
                
                if (user && user.role === 'secretaire') {
                  console.log('✅ Adding secretary to contacts:', user);
                  allConversations.push({
                    id: user.id,
                    name: `${user.nom} ${user.prenom}`,
                    online: true,
                    avatar: `${user.nom[0]}${user.prenom[0]}`,
                  });
                  seenIds.add(otherId);
                }
              }
            }
          }
        }
        
        console.log('📊 Final contacts list:', allConversations);
        setContacts(allConversations);
      }
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
    }
  };

  const fetchMessages = () => {
    if (!selectedContact) return;

    try {
      const conversationKey = `messages_${[userId, selectedContact.id].sort().join('_')}`;
      console.log('📥 [fetchMessages] Fetching messages with key:', conversationKey);
      const storedMessages = localStorage.getItem(conversationKey);
      console.log('📥 [fetchMessages] Raw stored messages:', storedMessages);
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        console.log('📥 [fetchMessages] Parsed messages:', parsed);
        setMessages(parsed);
      } else {
        console.log('📥 [fetchMessages] No messages found');
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: `${Date.now()}_${userId}`,
      senderId: userId,
      senderName: userName,
      senderRole: isSecretary ? 'Secrétaire' : 'Médecin',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    const conversationKey = `messages_${[userId, selectedContact.id].sort().join('_')}`;
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
    setMessage('');
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    setShowMenu(null);
  };

  const saveEditedMessage = () => {
    if (!editingContent.trim() || !selectedContact) return;

    const updatedMessages = messages.map((msg) =>
      msg.id === editingMessageId
        ? { ...msg, content: editingContent.trim() }
        : msg
    );

    const conversationKey = `messages_${[userId, selectedContact.id].sort().join('_')}`;
    setMessages(updatedMessages);
    localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedContact) return;

    const updatedMessages = messages.filter((msg) => msg.id !== messageId);
    const conversationKey = `messages_${[userId, selectedContact.id].sort().join('_')}`;
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
    if (!selectedContact) return;

    try {
      const conversationKey = `messages_${[userId, selectedContact.id].sort().join('_')}`;
      console.log('✅ [markMessagesAsRead] Marking messages as read for key:', conversationKey);
      const storedMessages = localStorage.getItem(conversationKey);
      console.log('✅ [markMessagesAsRead] Current stored messages:', storedMessages);
      
      if (storedMessages) {
        const currentMessages: Message[] = JSON.parse(storedMessages);
        console.log('✅ [markMessagesAsRead] Parsed messages:', currentMessages);
        const updatedMessages = currentMessages.map((msg) =>
          msg.senderId !== userId && !msg.read
            ? { ...msg, read: true }
            : msg
        );
        console.log('✅ [markMessagesAsRead] Updated messages:', updatedMessages);

        setMessages(updatedMessages);
        localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
        console.log('✅ [markMessagesAsRead] Messages saved back to localStorage');
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact) return;

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
        senderRole: isSecretary ? 'Secrétaire' : 'Médecin',
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

      const conversationKey = `messages_${[userId, selectedContact.id].sort().join('_')}`;
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
    const newUnreadCounts: { [key: string]: number } = {};
    contacts.forEach(contact => {
      const conversationKey = `messages_${[userId, contact.id].sort().join('_')}`;
      const storedMessages = localStorage.getItem(conversationKey);
      if (storedMessages) {
        const currentMessages: Message[] = JSON.parse(storedMessages);
        const unreadCount = currentMessages.filter(msg => msg.senderId !== userId && !msg.read).length;
        newUnreadCounts[contact.id] = unreadCount;
      } else {
        newUnreadCounts[contact.id] = 0;
      }
    });
    setUnreadCounts(newUnreadCounts);
  };

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
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
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h3 className="text-sm">
                {selectedContact ? selectedContact.name : 'Messagerie'}
              </h3>
              {selectedContact && (
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  En ligne
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedContact && !isSecretary && (
              <button
                onClick={() => {
                  setSelectedContact(null);
                  setMessages([]);
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {!selectedContact && !isSecretary ? (
        /* Contacts List */
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <User className="w-12 h-12 mb-2" />
              <p className="text-sm">Aucune secrétaire</p>
            </div>
          ) : (
            <div className="p-2">
              {contacts.map((contact) => {
                const unreadCount = unreadCounts[contact.id] || 0;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                        {contact.avatar || contact.name.substring(0, 2).toUpperCase()}
                      </div>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">Secrétaire</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Messages View */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
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
                            {msg.senderName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-600">
                            {msg.senderName} • {msg.senderRole}
                          </span>
                        </div>
                      )}

                      {isEditing ? (
                        <div className="w-full bg-white rounded-2xl p-3 shadow-md border border-blue-300">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={saveEditedMessage}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
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
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
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
                                isOwn ? 'text-blue-100' : 'text-gray-500'
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
                                        className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 flex items-center gap-2 text-blue-600"
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
                className="flex-1 px-4 py-2 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
                rows={1}
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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