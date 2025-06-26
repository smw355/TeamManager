import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Message } from '../types';
import { useAuth } from '../contexts/LocalAuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import ApiService from '../services/api';
import { useTeam } from '../contexts/TeamContext';

const Messages: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentRole, currentTeam } = useTeam();
  const [selectedThread, setSelectedThread] = useState<string>('team');
  const [newMessage, setNewMessage] = useState('');
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    connected,
    messages: wsMessages,
    typingUsers,
    activeUsers,
    sendMessage,
    startTyping,
    stopTyping
  } = useWebSocket({
    teamId: currentTeam?.id || 'team1',
    userId: currentUser?.id || '',
    userName: currentUser?.name || '',
    userRole: currentRole || 'player',
  });

  // Load historical messages
  useEffect(() => {
    loadMessages();
  }, []);

  // Combine historical and WebSocket messages
  useEffect(() => {
    setAllMessages(prev => {
      const combined = [...prev, ...wsMessages];
      // Remove duplicates and sort by timestamp
      const unique = combined.filter((msg, index, arr) => 
        arr.findIndex(m => m.id === msg.id) === index
      );
      return unique.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
  }, [wsMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messages = await ApiService.getMessages('team1');
      setAllMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const threads = [
    { id: 'team', name: 'Team Chat', count: 3, lastMessage: '30 minutes before game time...' },
    { id: 'coaches', name: 'Coaches Only', count: 1, lastMessage: 'Practice plan for next week...' },
    { id: 'parents', name: 'Parents', count: 2, lastMessage: 'Snack schedule update...' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coach':
        return 'text-tiko-blue';
      case 'parent':
        return 'text-tiko-green';
      case 'player':
        return 'text-tiko-orange';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Send through WebSocket
    sendMessage(newMessage);
    setNewMessage('');
    stopTyping();
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setSelectedThread(thread.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedThread === thread.id ? 'bg-tiko-blue/10 border-r-2 border-tiko-blue' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{thread.name}</h3>
                {thread.count > 0 && (
                  <span className="bg-tiko-blue text-white text-xs px-2 py-1 rounded-full">
                    {thread.count}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1 truncate">{thread.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {threads.find(t => t.id === selectedThread)?.name}
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
              {activeUsers.length > 0 && (
                <span className="text-sm text-gray-500">
                  • {activeUsers.length} online
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tiko-blue"></div>
            </div>
          ) : (
            allMessages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <UserCircleIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{message.senderName}</span>
                  <span className={`text-xs font-medium ${getRoleColor(message.senderRole)}`}>
                    {message.senderRole}
                  </span>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
                <p className="text-gray-700 mt-1">{message.content}</p>
              </div>
            </div>
            ))
          )}
          
          {typingUsers.length > 0 && (
            <div className="flex items-start space-x-3">
              <UserCircleIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 italic">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              disabled={!connected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !connected}
              className="bg-tiko-blue text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;