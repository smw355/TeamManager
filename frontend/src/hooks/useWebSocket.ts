import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../types';

interface UseWebSocketOptions {
  teamId: string;
  userId: string;
  userName: string;
  userRole: string;
  onMessage?: (message: Message) => void;
  onTyping?: (users: string[]) => void;
  onActiveUsers?: (users: any[]) => void;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `ws://localhost:8000/api/v1/ws/${options.teamId}?user_id=${options.userId}&user_name=${encodeURIComponent(options.userName)}&user_role=${options.userRole}`;
    
    try {
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        
        // Clear any reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Request active users
        websocketRef.current?.send(JSON.stringify({
          type: 'get_active_users'
        }));
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'message':
              const newMessage: Message = {
                id: data.id,
                teamId: data.team_id,
                senderId: data.sender_id,
                senderName: data.sender_name,
                senderRole: data.sender_role,
                content: data.content,
                timestamp: data.timestamp,
                type: data.message_type || 'team',
                isAiMessage: false
              };
              
              setMessages(prev => [...prev, newMessage]);
              options.onMessage?.(newMessage);
              break;

            case 'message_sent':
              // Message confirmation - could show delivery status
              console.log('Message sent confirmation');
              break;

            case 'typing':
              if (data.is_typing) {
                setTypingUsers(prev => {
                  if (!prev.includes(data.user.name)) {
                    return [...prev, data.user.name];
                  }
                  return prev;
                });
              } else {
                setTypingUsers(prev => prev.filter(name => name !== data.user.name));
              }
              options.onTyping?.(typingUsers);
              break;

            case 'active_users':
              setActiveUsers(data.users);
              options.onActiveUsers?.(data.users);
              break;

            case 'system':
              console.log('System message:', data.message);
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [options, typingUsers]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    setConnected(false);
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        content: content,
        timestamp: new Date().toISOString()
      };
      
      websocketRef.current.send(JSON.stringify(message));
      
      // Add message to local state immediately for instant feedback
      const localMessage: Message = {
        id: `temp-${Date.now()}`,
        teamId: options.teamId,
        senderId: options.userId,
        senderName: options.userName,
        senderRole: options.userRole as any,
        content: content,
        timestamp: new Date().toISOString(),
        type: 'team',
        isAiMessage: false
      };
      
      setMessages(prev => [...prev, localMessage]);
    }
  }, [options]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }));
    }
  }, []);

  const startTyping = useCallback(() => {
    sendTypingIndicator(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 3000);
  }, [sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    sendTypingIndicator(false);
  }, [sendTypingIndicator]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    messages,
    typingUsers,
    activeUsers,
    sendMessage,
    startTyping,
    stopTyping,
    reconnect: connect
  };
};