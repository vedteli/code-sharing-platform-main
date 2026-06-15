import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, MessageCircle, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  userColor: string;
}

const USER_COLORS = [
  '#FF5733', '#33C1FF', '#9D33FF', '#33FF57', '#FFC133',
  '#FF33A1', '#33FFF5', '#A133FF', '#FF8C33', '#33FF8C',
  '#5733FF', '#FF3357', '#33A1FF', '#F533FF', '#8CFF33'
];

interface ChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatPanel({ isOpen, onToggle }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [username, setUsername] = useState('');
  const [userColor, setUserColor] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load username from localStorage on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username');
    const savedUserColor = localStorage.getItem('chat_user_color');
    
    if (savedUsername && savedUserColor) {
      setUsername(savedUsername);
      setUserColor(savedUserColor);
      setShowNamePrompt(false);
    }
  }, []);

  // Set up real-time message listener
  useEffect(() => {
    if (!showNamePrompt) {
      // Query messages from the last 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      const q = query(
        collection(db, 'chat_messages'),
        where('timestamp', '>', Timestamp.fromDate(twoHoursAgo)),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        })) as ChatMessage[];
        
        setMessages(messagesData);
      }, (error) => {
        console.error('Error fetching messages:', error);
        // Fallback: try without timestamp filter if there's an index issue
        const fallbackQuery = query(
          collection(db, 'chat_messages'),
          orderBy('timestamp', 'asc')
        );
        
        const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
          const allMessages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate(),
          })) as ChatMessage[];
          
          // Filter client-side for last 2 hours
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
          const recentMessages = allMessages.filter(msg => msg.timestamp > twoHoursAgo);
          
          setMessages(recentMessages);
        });
        
        return () => fallbackUnsubscribe();
      });

      return () => unsubscribe();
    }
  }, [showNamePrompt]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate consistent color for username
  const generateUserColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
  };

  const handleSetUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    const color = generateUserColor(username.trim());
    setUserColor(color);
    setShowNamePrompt(false);
    
    // Save to localStorage
    localStorage.setItem('chat_username', username.trim());
    localStorage.setItem('chat_user_color', color);
    
    toast.success(`Welcome to the chat, ${username.trim()}!`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'chat_messages'), {
        username: username.trim(),
        message: currentMessage.trim(),
        timestamp: Timestamp.now(),
        userColor,
      });

      setCurrentMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeUsername = () => {
    setShowNamePrompt(true);
    setUsername('');
    localStorage.removeItem('chat_username');
    localStorage.removeItem('chat_user_color');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (showNamePrompt) {
    return (
      <div className={`fixed bottom-16 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 w-auto sm:w-1/2 max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Join Chat</h3>
          </div>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="responsive-icon-lg text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Join the Chat
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your name to start chatting with others
            </p>
          </div>
          
          <form onSubmit={handleSetUsername} className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors text-sm"
              placeholder="Enter your name"
              maxLength={20}
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-16 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 w-auto sm:w-1/2 max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Chat</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
          </div>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: userColor }}
            ></div>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {username}
            </span>
          </div>
          <button
            onClick={handleChangeUsername}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-40 sm:h-48 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="responsive-icon-lg text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center space-x-2">
                <span 
                  className="text-xs font-bold"
                  style={{ color: msg.userColor }}
                >
                  [{msg.username}]
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="text-sm text-gray-900 dark:text-gray-100 break-words">
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors text-sm"
            placeholder="Type a message..."
            maxLength={500}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!currentMessage.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Messages auto-delete after 2 hours
        </p>
      </div>
    </div>
  );
}