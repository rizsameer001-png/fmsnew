import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  PaperAirplaneIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';

const TeamCommunication = () => {
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const { socket, sendMessage, isConnected } = useSocket();
  const { user } = useAuth();

  const { data: teamMembers } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => userService.getUsers({ role: 'technician' }),
  });

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (data) => {
        setMessages(prev => [...prev, data]);
      });
      return () => socket.off('new_message');
    }
  }, [socket]);

  const handleSend = () => {
    if (!message.trim()) return;
    const chatId = selectedChat || 'team';
    sendMessage(chatId, message);
    setMessages(prev => [...prev, { text: message, sender: user.name, timestamp: new Date(), isOwn: true }]);
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Team Communication</h1><p className="text-gray-600">Real-time chat with your team members</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center"><UserGroupIcon className="h-5 w-5 mr-2 text-indigo-600" />Team Members</h3>
          <div className="space-y-2">
            {teamMembers?.users?.map((member) => (
              <button key={member._id} onClick={() => setSelectedChat(member._id)} className={`w-full text-left p-3 rounded-lg transition ${selectedChat === member._id ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center space-x-3"><div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-sm font-medium">{member.name?.charAt(0)}</span></div><div><p className="font-medium text-gray-900">{member.name}</p><p className="text-xs text-gray-500 capitalize">{member.technicianType}</p></div></div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md flex flex-col h-[600px]">
          <div className="p-4 border-b"><h3 className="font-semibold text-gray-900">{selectedChat ? 'Chat with Technician' : 'Team Group Chat'}</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${msg.isOwn ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {!msg.isOwn && <p className="text-xs font-medium mb-1">{msg.sender}</p>}
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600"><PhotoIcon className="h-5 w-5" /></button>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your message..." className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={handleSend} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><PaperAirplaneIcon className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCommunication;