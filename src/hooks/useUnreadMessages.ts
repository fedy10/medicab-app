import { useState, useEffect } from 'react';

interface UnreadMessages {
  secretary: number;
  admin: number;
  doctor: number;
  total: number;
}

export function useUnreadMessages(userId: string): UnreadMessages {
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessages>({
    secretary: 0,
    admin: 0,
    doctor: 0,
    total: 0,
  });

  useEffect(() => {
    const countUnreadMessages = () => {
      try {
        let secretaryCount = 0;
        let adminCount = 0;
        let doctorCount = 0;
        
        // Get all users to identify roles
        const usersData = localStorage.getItem('demo_users');
        const users = usersData ? JSON.parse(usersData) : [];
        
        // Scan all conversation keys in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('messages_')) {
            const ids = key.replace('messages_', '').split('_');
            
            // Check if this conversation involves the current user
            if (ids.includes(userId)) {
              const otherId = ids.find(id => id !== userId);
              if (otherId) {
                const otherUser = users.find((u: any) => u.id === otherId);
                if (otherUser) {
                  const storedMessages = localStorage.getItem(key);
                  if (storedMessages) {
                    const conversationMessages: any[] = JSON.parse(storedMessages);
                    // Count unread messages from the other person
                    const unread = conversationMessages.filter(
                      msg => !msg.read && msg.senderId !== userId
                    ).length;
                    
                    // Categorize by role
                    if (otherUser.role === 'secretaire') {
                      secretaryCount += unread;
                    } else if (otherUser.role === 'admin') {
                      adminCount += unread;
                    } else if (otherUser.role === 'medecin') {
                      doctorCount += unread;
                    }
                  }
                }
              }
            }
          }
        }
        
        const total = secretaryCount + adminCount + doctorCount;
        setUnreadMessages({
          secretary: secretaryCount,
          admin: adminCount,
          doctor: doctorCount,
          total,
        });
      } catch (error) {
        console.error('Error counting unread messages:', error);
      }
    };

    countUnreadMessages();
    // Check for unread messages every 3 seconds
    const interval = setInterval(countUnreadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  return unreadMessages;
}