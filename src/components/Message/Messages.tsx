import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Image as ImageIcon, 
  File, 
  Smile, 
  MoreVertical, 
  ChevronLeft,
  Phone, 
  Video,
  X,
  Check,
  CheckCheck,
} from 'lucide-react';
// import { Button } from "@/components/ui/button";
import { Avatar } from '@/components/ui/avatar';
import {ScrollArea} from "@/components/ui/scroll-area";
import {Tooltip, TooltipProvider,TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";


interface User {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  avatar: string;
  lastActive: string;
}

interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  name?: string;
  size?: string;
}

interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  time: string;
  isUser: boolean;
  avatar: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: MessageAttachment[];
}

interface ChatMessagingProps {
  toggleSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

const Messages: React.FC<ChatMessagingProps> = ({ 
  toggleSidebar, 
  isMobileSidebarOpen = false 
}) => {
  const [message, setMessage] = useState<string>('');
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    // ... (keep existing message data as in original code)
  ]);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const activeUser: User = {
    id: 'user1',
    name: 'Shahil',
    status: 'online',
    avatar: 'https://res.cloudinary.com/duorbsbbx/image/upload/v1739953247/company_profiles/othmwo2d3j1ocwrbp0r9.jpg',
    lastActive: 'Active now'
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && !messages[messages.length - 1].isUser) return;

    const simulateTyping = setTimeout(() => {
      setIsTyping(true);
      
      const stopTyping = setTimeout(() => {
        setIsTyping(false);
        if (Math.random() > 0.3) {
          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            sender: activeUser.name,
            senderId: activeUser.id,
            content: "Thanks for the preview! This looks great so far. I like how you've structured the navigation flow.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: false,
            avatar: activeUser.avatar,
            status: 'sent'
          };
          setMessages(prev => [...prev, newMessage]);
        }
      }, 3000);
      
      return () => clearTimeout(stopTyping);
    }, 1500);
    
    return () => clearTimeout(simulateTyping);
  }, [messages]);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
      messageInputRef.current.style.height = `${messageInputRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'You',
      senderId: 'self',
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
      avatar: '/api/placeholder/36/36',
      status: 'sent'
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
      
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ));
      }, 2000);
    }, 1000);
    
    messageInputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageStatus = (status: Message['status']) => {
    switch(status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    if (attachment.type === 'image') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden">
          <img 
            src={attachment.url} 
            alt={attachment.name || "Image"} 
            className="max-w-full h-auto max-h-64 rounded-lg object-cover" 
          />
          {attachment.name && (
            <div className="text-xs mt-1 text-gray-400">{attachment.name}</div>
          )}
        </div>
      );
    }
    
    if (attachment.type === 'file') {
      return (
        <div className="mt-2 p-3 bg-gray-700 rounded-lg flex items-center">
          <File className="mr-2 text-blue-400" size={20} />
          <div className="flex-1 overflow-hidden">
            <div className="truncate text-sm">{attachment.name}</div>
            {attachment.size && <div className="text-xs text-gray-400">{attachment.size}</div>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <div className="flex flex-col flex-grow">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
          {!isMobileSidebarOpen && (
            <button 
              className="md:hidden mr-2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="flex items-center flex-grow">
            <Avatar className="mr-3 relative">
              <img 
                src={activeUser.avatar} 
                alt={`${activeUser.name}'s avatar`}
                className="w-10 h-10 rounded-full object-cover border border-gray-700 transition-all duration-200 hover:scale-105" 
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900 animate-pulse"></div>
            </Avatar>
            <div className="flex-grow">
              <h3 className="font-medium">{activeUser.name}</h3>
              <p className="text-xs text-gray-400">{activeUser.lastActive}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 transition-colors duration-200">
                    <Phone size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice call</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 transition-colors duration-200">
                    <Video size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Video call</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-gray-800 text-gray-400 transition-colors duration-200">
                    <MoreVertical size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Message Area */}
        <ScrollArea className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex justify-center my-4">
              <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                Today
              </div>
            </div>
            {messages.map((msg, index) => {
              const isConsecutive = index > 0 && messages[index - 1].senderId === msg.senderId;
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                    animation: 'fadeIn 0.3s ease forwards'
                  }}
                >
                  <div className={`flex max-w-xs sm:max-w-md ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!msg.isUser && !isConsecutive && (
                      <img 
                        src={msg.avatar} 
                        alt={`${msg.sender}'s avatar`}
                        className="w-8 h-8 rounded-full mt-1 mx-2" 
                      />
                    )}
                    {!msg.isUser && isConsecutive && <div className="w-8 mx-2"></div>}
                    <div 
                      className={`p-3 ${
                        msg.isUser 
                          ? 'bg-blue-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm' 
                          : 'bg-gray-800 text-gray-100 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl'
                      } ${isConsecutive ? 'mt-1' : 'mt-3'} shadow-md transition-all duration-200 hover:shadow-lg`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      {msg.attachments?.map((attachment, i) => (
                        <div key={i}>
                          {renderAttachment(attachment)}
                        </div>
                      ))}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-xs ${msg.isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                          {msg.time}
                        </span>
                        {msg.isUser && renderMessageStatus(msg.status)}
                      </div>
                    </div>
                    {msg.isUser && !isConsecutive && (
                      <img 
                        src={msg.avatar} 
                        alt="Your avatar"
                        className="w-8 h-8 rounded-full mt-1 mx-2" 
                      />
                    )}
                    {msg.isUser && isConsecutive && <div className="w-8 mx-2"></div>}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-xs sm:max-w-md">
                  <img 
                    src={activeUser.avatar} 
                    alt={`${activeUser.name}'s avatar`}
                    className="w-8 h-8 rounded-full mt-1 mx-2" 
                  />
                  <div className="p-3 bg-gray-800 text-gray-100 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-3 relative">
          {attachmentMenuOpen && (
            <div 
              className="absolute bottom-16 left-3 bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-2 animate-slideUp"
              style={{
                opacity: 0,
                animation: 'slideUp 0.2s ease forwards'
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-3 rounded-full hover:bg-gray-700 text-blue-400 transition-transform duration-200 hover:scale-110">
                      <ImageIcon size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-3 rounded-full hover:bg-gray-700 text-green-400 transition-transform duration-200 hover:scale-110">
                      <File size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Send file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button 
                className="p-3 rounded-full hover:bg-gray-700 text-red-400 transition-transform duration-200 hover:scale-110"
                onClick={() => setAttachmentMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          )}
          {showEmojiPicker && (
            <div 
              className="absolute bottom-16 right-3 bg-gray-800 rounded-lg shadow-lg p-3 animate-slideUp"
              style={{
                width: '250px',
                height: '200px',
                opacity: 0,
                animation: 'slideUp 0.2s ease forwards'
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Emoji</h4>
                <button 
                  className="p-1 rounded-full hover:bg-gray-700 text-gray-400"
                  onClick={() => setShowEmojiPicker(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {['😊', '😂', '👍', '❤️', '🔥', '✨', '🎉', '🤔', '🚀', '🤖', '👀', ' mano', '	git', '.codes', '❤️'].map((emoji, i) => (
                  <button 
                    key={i} 
                    className="text-xl p-2 hover:bg-gray-700 rounded transition-colors"
                    onClick={() => {
                      setMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="relative flex items-end bg-gray-800 rounded-lg p-2 shadow-inner">
            <button 
              className={`p-2 rounded-full hover:bg-gray-700 ${attachmentMenuOpen ? 'text-blue-400' : 'text-gray-400'} transition-colors duration-200`}
              onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
            >
              <Paperclip size={20} />
            </button>
            <textarea
              ref={messageInputRef}
              className="flex-grow mx-2 py-2 px-3 bg-transparent outline-none resize-none max-h-32 text-gray-100 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
              placeholder="Type a message..."
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{ overflow: 'auto' }}
            />
            <button 
              className={`p-2 rounded-full hover:bg-gray-700 ${showEmojiPicker ? 'text-yellow-400' : 'text-gray-400'} transition-colors duration-200`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={20} />
            </button>
            {message.trim() === '' && (
              <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400 transition-colors duration-200">
                <Mic size={20} />
              </button>
            )}
            <button 
              className={`p-2 rounded-full ${message.trim() === '' ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-800/20'} ml-2 transition-all duration-200 ${message.trim() !== '' ? 'hover:scale-105' : ''}`}
              onClick={handleSendMessage}
              disabled={message.trim() === ''}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease forwards;
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Messages;