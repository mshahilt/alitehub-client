import React, { useState } from 'react';
import { Search, MoreVertical, MessageCircle, Phone, Video } from 'lucide-react';

interface User {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastMessage: string;
  time: string;
  unread: number;
}

const Chat: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sample user data
  const users: User[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://res.cloudinary.com/duorbsbbx/image/upload/v1739953247/company_profiles/othmwo2d3j1ocwrbp0r9.jpg",
      status: "online",
      lastMessage: "Can we discuss the project later?",
      time: "2m ago",
      unread: 3
    },
  ];

  const filteredUsers: User[] = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: User['status']): string => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-blue-300">Messages</h2>
        <button className="p-2 rounded-full hover:bg-gray-800">
          <MoreVertical size={20} className="text-gray-400" />
        </button>
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
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user: User) => (
            <div 
              key={user.id} 
              className="flex items-center p-3 my-1 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
            >
              {/* Avatar with status */}
              <div className="relative mr-3">
                <img 
                  src={user.avatar} 
                  alt={`${user.name}'s avatar`}
                  className="w-12 h-12 rounded-full object-cover border border-gray-700" 
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(user.status)}`}></div>
              </div>
              
              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-100 truncate">{user.name}</h3>
                  <span className="text-xs text-gray-500">{user.time}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{user.lastMessage}</p>
              </div>
              
              {/* Unread badge */}
              {user.unread > 0 && (
                <div className="ml-3 bg-blue-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {user.unread}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500">No users found</div>
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