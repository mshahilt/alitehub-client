import React, { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
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
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChatData } from './Chat';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import axiosInstance from '@/services/api/userInstance';
import axios from 'axios';

interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  name?: string;
  size?: string;
}

interface Message {
  _id: string;
  senderId: string;
  content: string;
  time: string;
  isUser: boolean;
  avatar: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: MessageAttachment[];
}

interface ApiMessage {
  _id: string;
  chatId: string;
  isRead: boolean;
  content: string;
  readAt: string | null;
  sentAt: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  attachments?: string[];
}

interface ChatMessagingProps {
  toggleSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  selectedChat: ChatData | null;
}

const Messages: React.FC<ChatMessagingProps> = ({ 
  toggleSidebar, 
  isMobileSidebarOpen = false,
  selectedChat
}) => {
  const { existingUser } = useSelector((state: RootState) => state.userAuth);
  const [message, setMessage] = useState<string>('');
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaAttachment, setMediaAttachment] = useState<MessageAttachment | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const chatPartner = selectedChat?.participants.find(
    participant => participant._id !== existingUser?.id
  );

  useEffect(() => {
    if (!selectedChat) return;
    
    console.log("Initializing socket connection");
    const newSocket = io('https://api.alitehub.site', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });
    
    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
      setSocketConnected(true);
      if (selectedChat) {
        console.log(`Joining chat room: ${selectedChat._id}`);
        newSocket.emit("joinChat", selectedChat._id);
      }
    });
    
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    });
    
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setSocketConnected(false);
    });
    
    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, [selectedChat]);
  useEffect(() => {
    if (!socket || !selectedChat || !socketConnected) return;

    console.log("Setting up socket event listeners");
    
    socket.on("reconnect", (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      socket.emit("joinChat", selectedChat._id);
    });
    
    socket.on('receiveMessage', (newMessage: any) => {  
      console.log("Message received:", newMessage);
      
      if (!newMessage.sentAt && newMessage.timestamp) {
        newMessage = {
          _id: `socket-${Date.now()}`,
          chatId: newMessage.chatId,
          isRead: false,
          content: newMessage.message,
          senderId: newMessage.senderId,
          sentAt: newMessage.timestamp,
          createdAt: newMessage.timestamp,
          updatedAt: newMessage.timestamp,
        };
      }
      
      const formattedMessage: Message = formatMessage(newMessage);
      setMessages(prev => [...prev, formattedMessage]);
    });

    socket.on('typing', ({ chatId, userId }) => {
      if (chatId === selectedChat._id && userId !== existingUser?.id) {
        setIsTyping(true);
      }
    });

    socket.on('stopTyping', ({ chatId, userId }) => {
      if (chatId === selectedChat._id && userId !== existingUser?.id) {
        setIsTyping(false);
      }
    });

    socket.on('messageStatusUpdate', ({ messageId, status }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, status } : msg
      ));
    });

    return () => {
      console.log("Removing socket event listeners");
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('messageStatusUpdate');
      socket.off('reconnect');
    };
  }, [socket, selectedChat, existingUser, socketConnected]);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching messages for chat: ${selectedChat._id}`);
        const response = await axiosInstance.get(`/chat/messages/${selectedChat._id}`);
        const apiMessages = response.data.data || [];
        console.log("API messages:", apiMessages);
        const formattedMessages = apiMessages.map(formatMessage);
        setMessages(formattedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat, existingUser]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
      messageInputRef.current.style.height = `${messageInputRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    if (!socket || !selectedChat || !socketConnected) return;

    const typingTimeout = setTimeout(() => {
      if (message.length > 0) {
        socket.emit('typing', { chatId: selectedChat._id, userId: existingUser?.id });
      } else {
        socket.emit('stopTyping', { chatId: selectedChat._id, userId: existingUser?.id });
      }
    }, 500);

    return () => clearTimeout(typingTimeout);
  }, [message, socket, selectedChat, existingUser, socketConnected]);

  const formatMessage = (msg: ApiMessage | any): Message => {
    const isCurrentUserMessage = msg.senderId === existingUser?.id;
    const sender = selectedChat?.participants.find(p => p._id === msg.senderId);
    
    const timestampField = msg.sentAt || msg.timestamp || msg.createdAt;
    
    let messageTime;
    try {
      const date = new Date(timestampField);
      
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
      
      messageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.warn("Failed to parse date:", timestampField, error);
      messageTime = "Recent";
    }
    
    return {
      _id: msg._id || `temp-${Date.now()}`, 
      senderId: msg.senderId,
      content: msg.content || msg.message || "",
      time: messageTime,
      isUser: isCurrentUserMessage,
      avatar: isCurrentUserMessage 
        ? existingUser?.profile_picture || '/api/placeholder/36/36'
        : sender?.profile_picture || '/api/placeholder/36/36',
      status: msg.isRead ? 'read' : 'delivered',
      attachments: msg.attachments?.map((url: string) => ({
        type: url.match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : 'file',
        url,
        name: url.split('/').pop(),
      })),
    };
  };

  const uploadMedia = async (mediaFile: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const { data } = await axiosInstance.get('/getSignedUploadUrl', {
        params: { resource_type: "image" }
      });
      const { upload_url, signature, api_key, timestamp } = data.signedUrl;

      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('api_key', api_key);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const { data: uploadResponse } = await axios.post(upload_url, formData, {
        onUploadProgress: ({ loaded, total }) => {
          if (total) setUploadProgress(Math.round((loaded * 100) / total));
        },
      });

      return uploadResponse.secure_url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMediaAttachment({
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url,
      name: file.name,
      size: formatFileSize(file.size),
    });
    setAttachmentMenuOpen(false);
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !mediaAttachment) || !selectedChat || isSending) return;
    
    setIsSending(true);
    const tempId = `temp-${Date.now()}`;

    setMessage('');
    setMediaAttachment(null);

    try {
      let uploadedMediaUrl: string | null = null;
      if (mediaAttachment?.url) {
        const response = await fetch(mediaAttachment.url);
        const blob = await response.blob();
        const file = new (globalThis as any).File([blob], mediaAttachment.name, { type: blob.type });
        uploadedMediaUrl = await uploadMedia(file);
      }

      const { data: sentMessageData } = await axiosInstance.post<Message>('/chat/messages', {
        chatId: selectedChat._id,
        content: message.trim() || uploadedMediaUrl,
      });

      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, ...sentMessageData, status: 'sent' } : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    } finally {
      setIsSending(false);
      messageInputRef.current?.focus();
    }
  };

  const handleRetryMessage = (failedMsgId: string) => {
    const failedMessage = messages.find(msg => msg._id === failedMsgId);
    if (!failedMessage) return;

    setMessages(prev => prev.filter(msg => msg._id !== failedMsgId));
    if (failedMessage.content) setMessage(failedMessage.content);
    if (failedMessage.attachments?.length) setMediaAttachment(failedMessage.attachments[0]);
  };

  const formatFileSize = (bytes: number): string => {
    return bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const triggerMediaInput = () => mediaInputRef.current?.click();
  const removeMediaAttachment = () => setMediaAttachment(null);

  const renderMessageStatus = (status: Message['status']) => {
    switch(status) {
      case 'sending': return <div className="flex items-center space-x-1"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div><span className="text-xs text-gray-400">Sending</span></div>;
      case 'sent': return <Check size={14} className="text-gray-400" />;
      case 'delivered': return <CheckCheck size={14} className="text-gray-400" />;
      case 'read': return <CheckCheck size={14} className="text-blue-400" />;
      case 'failed': return (
        <div className="flex items-center text-red-400 cursor-pointer" onClick={() => handleRetryMessage(status)}>
          <X size={14} className="mr-1" />
          <span className="text-xs">Failed. Tap to retry</span>
        </div>
      );
      default: return null;
    }
  };

  

  const renderAttachment = (attachment: MessageAttachment) => {
    if (attachment.type === 'image') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden">
          <img src={attachment.url} alt={attachment.name || "Image"} className="max-w-full h-auto max-h-64 rounded-lg object-cover" />
          {attachment.name && <div className="text-xs mt-1 text-gray-400">{attachment.name}</div>}
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

  if (!selectedChat) {
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-medium mb-2">Select a chat to start messaging</div>
          <p className="text-gray-400">Choose a conversation from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen bg-gray-900 text-gray-100">
      <div className="flex flex-col flex-grow">
        <input 
          type="file" 
          ref={mediaInputRef}
          className="hidden"
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
          onChange={handleMediaUpload}
        />
        
        <div className="flex items-center p-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
          {!isMobileSidebarOpen && (
            <button className="md:hidden mr-2 text-gray-400 hover:text-gray-200" onClick={toggleSidebar}>
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="flex items-center flex-grow">
            <Avatar className="mr-3 relative">
              <img src={chatPartner?.profile_picture || '/api/placeholder/40/40'} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-700" />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'} border-2 border-gray-900 ${socketConnected ? 'animate-pulse' : ''}`}></div>
            </Avatar>
            <div className="flex-grow">
              <h3 className="font-medium">{chatPartner?.name || 'User'}</h3>
              <p className="text-xs text-gray-400">{socketConnected ? 'Active now' : 'Reconnecting...'}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <TooltipProvider><Tooltip><TooltipTrigger asChild><button className="p-2 rounded-full hover:bg-gray-800 text-gray-400"><Phone size={20} /></button></TooltipTrigger><TooltipContent><p>Voice call</p></TooltipContent></Tooltip></TooltipProvider>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><button className="p-2 rounded-full hover:bg-gray-800 text-gray-400"><Video size={20} /></button></TooltipTrigger><TooltipContent><p>Video call</p></TooltipContent></Tooltip></TooltipProvider>
            <TooltipProvider><Tooltip><TooltipTrigger asChild><button className="p-2 rounded-full hover:bg-gray-800 text-gray-400"><MoreVertical size={20} /></button></TooltipTrigger><TooltipContent><p>More options</p></TooltipContent></Tooltip></TooltipProvider>
          </div>
        </div>

        <ScrollArea className="flex-grow p-4 overflow-y-auto" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-red-400">{error}</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="text-gray-400 mb-2">No messages yet</div>
              <div className="text-gray-500 text-sm">Start a conversation!</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center my-4">
                <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">Today</div>
              </div>
              {messages.map((msg, index) => {
                const previousMsg = index > 0 ? messages[index - 1] : null;
                const isConsecutive = previousMsg && previousMsg.senderId === msg.senderId;

                const urlRegex = /(https?:\/\/[^\s]+)/;
                const match = msg.content.match(urlRegex);
                const url = match ? match[0] : null;

                const urlAttachment = url
                  ? {
                      type: url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? "image" : "file",
                      url,
                      name: url.split("/").pop(),
                    }
                  : null;

                const newAttachment: MessageAttachment | null = urlAttachment
                  ? {
                      type: "image",
                      url: urlAttachment.url,
                      name: "Sent an attachment",
                      size: "0",
                    }
                  : null;

                return (
                  <div key={msg._id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex max-w-xs sm:max-w-md ${msg.isUser ? "flex-row-reverse" : "flex-row"}`}>
                      {!msg.isUser && !isConsecutive && (
                        <img src={msg.avatar} alt="Avatar" className="w-8 h-8 rounded-full mt-1 mx-2" />
                      )}
                      {!msg.isUser && isConsecutive && <div className="w-8 mx-2"></div>}
                      <div
                        className={`p-3 ${
                          msg.isUser
                            ? `${msg.status === "failed" ? "bg-red-900/50" : "bg-blue-600"} text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm`
                            : "bg-gray-800 text-gray-100 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl"
                        } ${isConsecutive ? "mt-1" : "mt-3"} shadow-md`}
                      >
                        {!newAttachment && <p className="leading-relaxed">{msg.content}</p>}

                        {newAttachment && renderAttachment(newAttachment)}

                        {msg.attachments?.map((attachment, i) => (
                          <div key={i}>{renderAttachment(attachment)}</div>
                        ))}

                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-xs ${msg.isUser ? "text-blue-200" : "text-gray-400"}`}>{msg.time}</span>
                          {msg.isUser && renderMessageStatus(msg.status)}
                        </div>
                      </div>
                      {msg.isUser && !isConsecutive && (
                        <img src={msg.avatar} alt="Your avatar" className="w-8 h-8 rounded-full mt-1 mx-2" />
                      )}
                      {msg.isUser && isConsecutive && <div className="w-8 mx-2"></div>}
                    </div>
                  </div>
                );
              })}




              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-xs sm:max-w-md">
                    <img src={chatPartner?.profile_picture || '/api/placeholder/32/32'} alt="Avatar" className="w-8 h-8 rounded-full mt-1 mx-2" />
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
          )}
        </ScrollArea>

        {mediaAttachment && (
          <div className="border-t border-gray-800 p-3 bg-gray-800">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center">
                  {mediaAttachment.type === 'image' ? (
                    <div className="relative w-16 h-16 mr-3 rounded-lg overflow-hidden">
                      <img src={mediaAttachment.url} alt={mediaAttachment.name || "Image preview"} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mr-3 rounded-lg bg-gray-700 flex items-center justify-center">
                      <File className="text-blue-400" size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm truncate">{mediaAttachment.name}</p>
                    {mediaAttachment.size && <p className="text-xs text-gray-400">{mediaAttachment.size}</p>}
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400" onClick={removeMediaAttachment}>
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="border-t border-gray-800 p-3 bg-gray-800">
            <div className="flex items-center mb-1">
              <span className="text-sm mr-2">Uploading media...</span>
              <span className="text-xs text-gray-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 p-3 relative">
          {attachmentMenuOpen && (
            <div className="absolute bottom-16 left-3 bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-2">
              <TooltipProvider><Tooltip><TooltipTrigger asChild><button className="p-3 rounded-full hover:bg-gray-700 text-blue-400" onClick={triggerMediaInput}><ImageIcon size={20} /></button></TooltipTrigger><TooltipContent side="top"><p>Send image</p></TooltipContent></Tooltip></TooltipProvider>
              <button className="p-3 rounded-full hover:bg-gray-700 text-red-400" onClick={() => setAttachmentMenuOpen(false)}><X size={20} /></button>
            </div>
          )}
          {showEmojiPicker && (
            <div className="absolute bottom-16 right-3 bg-gray-800 rounded-lg shadow-lg p-3" style={{ width: '250px', height: '200px' }}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Emoji</h4>
                <button className="p-1 rounded-full hover:bg-gray-700 text-gray-400" onClick={() => setShowEmojiPicker(false)}><X size={16} /></button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {['😊', '😂', '👍', '❤️', '🔥', '✨', '🎉', '🤔', '🚀', '🤖', '👀', '😎', '🙏', '👋', '🥳'].map((emoji, i) => (
                  <button key={i} className="text-xl p-2 hover:bg-gray-700 rounded" onClick={() => { setMessage(prev => prev + emoji); setShowEmojiPicker(false); }}>{emoji}</button>
                ))}
              </div>
            </div>
          )}
          <div className="relative flex items-end bg-gray-800 rounded-lg p-2 shadow-inner">
            <button className={`p-2 rounded-full hover:bg-gray-700 ${attachmentMenuOpen ? 'text-blue-400' : 'text-gray-400'}`} onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}>
              <Paperclip size={20} />
            </button>
            <textarea
              ref={messageInputRef}
              className="flex-grow mx-2 py-2 px-3 bg-transparent outline-none resize-none max-h-32 text-gray-100 scrollbar-thin"
              placeholder="Type a message..."
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className={`p-2 rounded-full hover:bg-gray-700 ${showEmojiPicker ? 'text-yellow-400' : 'text-gray-400'}`} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Smile size={20} />
            </button>
            {message.trim() === '' && !mediaAttachment && (
              <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400"><Mic size={20} /></button>
            )}
            <button 
              className={`p-2 rounded-full ${message.trim() === '' && !mediaAttachment ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'} ml-2`}
              onClick={handleSendMessage}
              disabled={message.trim() === '' && !mediaAttachment}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default Messages;