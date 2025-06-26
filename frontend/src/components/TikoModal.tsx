import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { User, Message } from '../types';
import ApiService from '../services/api';
import { useTeam } from '../contexts/TeamContext';

interface TikoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const TikoModal: React.FC<TikoModalProps> = ({ isOpen, onClose, user }) => {
  const { currentRole, currentTeam } = useTeam();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      teamId: undefined,
      senderId: 'tiko',
      senderName: 'Tiko',
      senderRole: 'coach',
      content: `Hi ${user.name}! I'm Tiko, your AI assistant. I can help you with team management, practice planning, scheduling, and answering questions about your team. What can I help you with today?`,
      timestamp: new Date().toISOString(),
      type: 'ai',
      isAiMessage: true,
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      teamId: undefined,
      senderId: user.id,
      senderName: user.name,
      senderRole: currentRole || 'player',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'ai',
      isAiMessage: false,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await ApiService.chatWithTiko(
        currentMessage,
        currentRole || 'player',
        {
          user: user,
          team: { name: 'Lightning Bolts', sport: 'Soccer' },
          upcomingEvents: [],
          recentMessages: [],
          players: []
        }
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        teamId: undefined,
        senderId: 'tiko',
        senderName: 'Tiko',
        senderRole: 'coach',
        content: response.response,
        timestamp: response.timestamp,
        type: 'ai',
        isAiMessage: true,
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error chatting with Tiko:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        teamId: undefined,
        senderId: 'tiko',
        senderName: 'Tiko',
        senderRole: 'coach',
        content: 'Sorry, I\'m having trouble connecting right now. Please make sure the backend server is running and try again.',
        timestamp: new Date().toISOString(),
        type: 'ai',
        isAiMessage: true,
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-tiko-blue to-tiko-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tiko Assistant</h3>
              <p className="text-xs text-gray-500">AI-powered team helper</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isAiMessage ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isAiMessage
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-tiko-blue text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isAiMessage ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Tiko anything..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
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

export default TikoModal;