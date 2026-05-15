import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  PaperAirplaneIcon, 
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import chatService from '../../services/chat.service';
import { formatTime } from '../../utils/formatters';

const ChatSupport = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { socket, isConnected, sendMessage: sendSocketMessage } = useSocket();
  const { user } = useAuth();

  const { data: chatData, refetch } = useQuery({
    queryKey: ['supportChat'],
    queryFn: () => chatService.getSupportChat(),
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => chatService.getMessages(chatId),
    enabled: !!chatId,
  });

  const sendMutation = useMutation({
    mutationFn: ({ receiverId, message }) => chatService.sendMessage(receiverId, message),
    onSuccess: () => {
      refetchMessages();
      setMessage('');
    },
  });

  useEffect(() => {
    if (chatData?.chat?._id) {
      setChatId(chatData.chat._id);
    }
  }, [chatData]);

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new_message', (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    socket.on('user_typing', (data) => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        setAgentTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket, isConnected, chatId, user]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      socket?.emit('typing', { chatId, isTyping: true });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { chatId, isTyping: false });
    }, 1000);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    if (socket && isConnected) {
      sendSocketMessage(chatId, message);
      setMessage('');
      setIsTyping(false);
      socket?.emit('typing', { chatId, isTyping: false });
    } else {
      const supportAgent = chatData?.chat?.participants?.find(p => p.userId?.role !== 'customer');
      if (supportAgent) {
        sendMutation.mutate({ receiverId: supportAgent.userId._id, message });
      }
    }
  };

  const getSupportAgentName = () => {
    const agent = chatData?.chat?.participants?.find(p => p.userId?.role !== 'customer');
    return agent?.userId?.name || 'Support Agent';
  };

  const isAgentOnline = () => {
    // In production, check actual online status via socket
    return true;
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            {isAgentOnline() && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{getSupportAgentName()}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAgentOnline() ? 'Online' : 'Offline'} • Support Team
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <PhoneIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <EnvelopeIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${
              msg.senderId === user?._id 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
            }`}>
              {msg.senderId !== user?._id && (
                <p className="text-xs font-medium mb-1 text-indigo-600 dark:text-indigo-400">
                  {getSupportAgentName()}
                </p>
              )}
              <p className="text-sm">{msg.message}</p>
              <p className={`text-xs mt-1 ${msg.senderId === user?._id ? 'text-indigo-200' : 'text-gray-400'}`}>
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {agentTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-md p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-400">
            {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
          </p>
          <p className="text-xs text-gray-400">
            Our support team typically responds within 30 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;