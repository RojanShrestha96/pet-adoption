import React, { useEffect, useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

// Get user initials (e.g., "RS" for "Rojan Shrestha")
const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: {
    text: string;
    createdAt: string;
    read: boolean;
    sender: string;
  };
  updatedAt: string;
}

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ selectedId, onSelect }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchConversations();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message_notification', () => {
        // Optimistically update or refetch
        fetchConversations(); 
    });

    return () => {
        socket.off('new_message_notification');
    };
  }, [socket]);

  // Helper to get the other participant (not the current user)
  const getOtherParticipant = (participants: any[]) => {
    const currentUserId = String(user?._id || user?.id);
    return participants.find(p => String(p._id) !== currentUserId) || participants[0]; // fallback
  };

  if (loading) return <div className="p-4">Loading chats...</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border-none focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No conversations yet</div>
        ) : (
            conversations
                .filter(conv => {
                    const otherUser = getOtherParticipant(conv.participants);
                    return otherUser && otherUser.name; // Only show conversations with valid users
                })
                .map(conv => {
                const otherUser = getOtherParticipant(conv.participants);
                const isSelected = selectedId === conv._id;
                
                return (
                    <div 
                        key={conv._id}
                        onClick={() => onSelect(conv._id)}
                        className={`p-4 border-b cursor-pointer transition-colors`}
                        style={{ 
                          borderColor: 'var(--color-border)',
                          background: isSelected ? 'var(--color-surface)' : 'transparent',
                          borderLeft: isSelected ? '4px solid var(--color-primary)' : 'none'
                        }}
                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'var(--color-surface)')}
                        onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                    >
                        <div className="flex gap-3">
                            <div className="relative">
                                {/* Initials avatar - uses theme colors */}
                                <div 
                                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                  style={{ 
                                    background: isSelected 
                                      ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' 
                                      : 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-text-light) 100%)',
                                    boxShadow: 'var(--shadow-md)'
                                  }}
                                >
                                    {getInitials(otherUser?.name || 'User')}
                                </div>
                                {/* Small chat icon indicator - uses theme color */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-sm)' }}>
                                    <MessageCircle className="w-2.5 h-2.5" style={{ color: 'var(--color-primary)' }} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 
                                      className="font-medium text-sm truncate"
                                      style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}
                                    >
                                        {otherUser.name}
                                    </h4>
                                    {conv.lastMessage && (
                                        <span className="text-xs whitespace-nowrap ml-2" style={{ color: 'var(--color-text-light)' }}>
                                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p 
                                  className="text-sm truncate"
                                  style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-light)' }}
                                >
                                    {conv.lastMessage?.text || 'No messages yet'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};
