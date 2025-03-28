import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, MessageCircle, Phone, Video, Loader2 } from 'lucide-react';
import axiosInstance from '@/services/api/userInstance';
import { Tooltip, TooltipContent, TooltipProvider } from '@radix-ui/react-tooltip';
import { TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  profile_picture: string;
}

interface ChatMessage {
  sentAt: string;
  text: string;
}

export interface ChatData {
  _id: string;
  participants: UserProfile[];
  lastMessage: ChatMessage;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ConnectionUser {
  _id: string;
  name: string;
  username: string;
}

interface Connection {
  _id: string;
  userId1: ConnectionUser;
  userId2: ConnectionUser;
  status: string;
  requestedAt: string;
  isMutual: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  respondedAt?: string;
}

interface ChatProps {
  setSelectedChat: (user: ChatData) => void;
}

const Chat: React.FC<ChatProps> = ({ setSelectedChat }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { existingUser } = useSelector((state: RootState) => state.userAuth);
  const [chats, setChats] = useState<ChatData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/connection');
      if (response.data.success) {
        setConnections(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get('/chat');
        console.log("response.data", response.data.data);
        if (response.data.success) {
          setChats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, []);

  const addUserToChat = async (userId: string, username: string) => {
    console.log(`Adding user ${username} (${userId}) to chat`);
    try {
      await axiosInstance.post('/chat', {
        recieverId: userId,
        lastMessage: "Convo not started yet!"
      });
      setIsOpen(false);
      // Refresh chat list after adding a new chat
      const response = await axiosInstance.get('/chat');
      if (response.data.success) {
        setChats(response.data.data);
      }
    } catch (error) {
      console.error('Error adding user to chat:', error);
    }
  };

  // Get other user from participants (excluding the current user)
  const getOtherUser = (participants: UserProfile[]): UserProfile | null => {
    const otherUser = participants.find(user => user._id !== existingUser.id);
    return otherUser || null;
  };

  // Get status color (mock function since status isn't in the API response)
  const getStatusColor = (status: string = 'offline'): string => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusColor = (status: string): string => {
    switch (status) {
      case 'accepted': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Format date for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat.participants);
    if (!otherUser) return false;
    
    return (
      otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getOtherConnectionUser = (connection: Connection) => {
    return connection.userId1._id === existingUser.id ? connection.userId2 : connection.userId1;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-300">Messages</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 rounded-full hover:bg-gray-800">
                <MoreVertical size={20} className="text-gray-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="z-50 p-2 bg-gray-800 text-gray-100 rounded shadow-lg">
              <Button onClick={() => setIsOpen(true)}>Add user to chat</Button>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-gray-900 border border-gray-800 text-gray-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">Add Connection to Chat</DialogTitle>
            </DialogHeader>
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin mr-2" /> Loading connections...
                </div>
              ) : connections.length > 0 ? (
                <ul className="space-y-2">
                  {connections.map((connection) => {
                    const otherUser = getOtherConnectionUser(connection);
                    return (
                      <li key={connection._id} className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{otherUser.name}</p>
                          <p className="text-sm text-gray-400">@{otherUser.username}</p>
                          <p className={`text-xs ${getConnectionStatusColor(connection.status)}`}>
                            {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={connection.status !== 'accepted'}
                          onClick={() => addUserToChat(otherUser._id, otherUser.username)}
                          className={connection.status !== 'accepted' ? 'opacity-50' : ''}
                        >
                          {connection.status === 'accepted' ? 'Add' : 'Pending'}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center p-4 text-gray-500">No connections found</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-gray-300"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat.participants);
            if (!otherUser) return null;
            
            return (
              <div
              onClick={() => setSelectedChat(chat)}
                key={chat._id}
                className="flex items-center p-3 my-1 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="relative mr-3">
                  <img
                    src={otherUser.profile_picture || "https://img.freepik.com/premium-vector/user-circle-with-blue-gradient-circle_78370-4727.jpg"}
                    alt={`${otherUser.name}'s avatar`}
                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor('offline')}`}></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-100 truncate">{otherUser.name}</h3>
                    <span className="text-xs text-gray-500">{formatTime(chat.lastMessage.sentAt)}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{chat.lastMessage.text}</p>
                </div>

                {/* Unread badge (mock) */}
                {/* Uncomment and implement if you have unread count data */}
                {/*
                {unreadCount > 0 && (
                  <div className="ml-3 bg-blue-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </div>
                )}
                */}
              </div>
            );
          })
        ) : (
          <div className="text-center p-4 text-gray-500">No chats found</div>
        )}
      </div>

      {/* Footer with action buttons */}
      <div className="p-3 border-t border-gray-800 flex justify-around">
        <button className="p-2 rounded-full hover:bg-gray-800 text-blue-400">
          <MessageCircle size={24} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400">
          <Phone size={24} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400">
          <Video size={24} />
        </button>
      </div>
    </div>
  );
};

export default Chat;