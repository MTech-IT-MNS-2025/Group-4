'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: string;
  receiver?: string;
  groupName?: string;
  text: string;
  imageUrl?: string;
  timestamp: Date;
  isGroup?: boolean;
}

interface Notification {
  sender: string;
  message: string;
  timestamp: Date;
}

const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😭', '😱', '🔥', '💯', '👍', '👎', '❤️', '💔', '🎉', '🎊', '✨', '⭐', '🌟', '💫'];

export default function ChatPage() {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [userStatus, setUserStatus] = useState<{ [key: string]: string }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [chatMode, setChatMode] = useState<'private' | 'group'>('private');
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: string }>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/profiles/default.png',
        badge: '/profiles/default.png',
      });
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedProfile = localStorage.getItem('profilePicture');
    
    if (!storedUsername) {
      router.push('/');
      return;
    }
    
    setUsername(storedUsername);
    if (storedProfile) {
      setProfilePicture(storedProfile);
    }

    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('register_user', { 
        username: storedUsername, 
        profilePicture: storedProfile 
      });
    });

    newSocket.on('all_user_profiles', (profiles: { [key: string]: string }) => {
      setUserProfiles(profiles);
    });

    newSocket.on('profile_updated', (data: { username: string; profilePicture: string }) => {
      setUserProfiles(prev => ({ ...prev, [data.username]: data.profilePicture }));
    });

    newSocket.on('all_groups', (groupList: string[]) => {
      setGroups(groupList);
    });

    newSocket.on('group_created', (data: { groupName: string; members: string[] }) => {
      setGroups(prev => [...prev, data.groupName]);
    });

    newSocket.on('user_joined_group', (data: { groupName: string; username: string }) => {
      if (data.groupName === selectedGroup) {
        setGroupMembers(prev => [...prev, data.username]);
      }
    });

    newSocket.on('group_members', (data: { groupName: string; members: string[] }) => {
      setGroupMembers(data.members);
    });

    newSocket.on('receive_message', (data: Message) => {
      if (!data.isGroup) {
        setMessages((prev) => [...prev, data]);
      }
    });

    newSocket.on('receive_group_message', (data: Message) => {
      setMessages((prev) => [...prev, { ...data, isGroup: true }]);
    });

    newSocket.on('notification', (data: { sender: string; message: string }) => {
      const newNotif = {
        sender: data.sender,
        message: data.message,
        timestamp: new Date(),
      };
      setNotifications(prev => [newNotif, ...prev]);
      showBrowserNotification(`New message from ${data.sender}`, data.message);
    });

    newSocket.on('message_sent', (data: Message) => {});

    newSocket.on('user_typing', (data: { username: string }) => {
      setIsTyping(true);
      setTypingUser(data.username);
    });

    newSocket.on('user_typing_group', (data: { groupName: string; username: string }) => {
      if (data.groupName === selectedGroup) {
        setIsTyping(true);
        setTypingUser(data.username);
      }
    });

    newSocket.on('user_stop_typing', (data: { username: string }) => {
      setIsTyping(false);
      setTypingUser('');
    });

    newSocket.on('user_stop_typing_group', (data: { groupName: string; username: string }) => {
      if (data.groupName === selectedGroup) {
        setIsTyping(false);
        setTypingUser('');
      }
    });

    newSocket.on('user_status', (data: { username: string; status: string }) => {
      setUserStatus((prev) => ({ ...prev, [data.username]: data.status }));
    });

    newSocket.on('all_users_status', (statuses: { [key: string]: string }) => {
      setUserStatus(statuses);
    });

    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, [router]);

  useEffect(() => {
    if (chatMode === 'private' && username && recipient) {
      loadChatHistory();
    } else if (chatMode === 'group' && selectedGroup) {
      loadGroupChatHistory();
    }
  }, [username, recipient, selectedGroup, chatMode]);

  const loadChatHistory = async () => {
    try {
      const res = await fetch(`/api/messages?user1=${username}&user2=${recipient}`);
      const history = await res.json();
      setMessages(history);
    } catch (error) {}
  };

  const loadGroupChatHistory = async () => {
    try {
      const res = await fetch(`/api/messages?groupName=${selectedGroup}`);
      const history = await res.json();
      setMessages(history);
    } catch (error) {}
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !socket) return;
    socket.emit('create_group', { groupName: newGroupName.trim(), creator: username });
    setSelectedGroup(newGroupName.trim());
    socket.emit('join_group', { groupName: newGroupName.trim(), username });
    setNewGroupName('');
    setShowCreateGroup(false);
    setChatMode('group');
  };

  const handleJoinGroup = (groupName: string) => {
    if (!socket) return;
    setSelectedGroup(groupName);
    socket.emit('join_group', { groupName, username });
    setChatMode('group');
    setMessages([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'message');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        await sendMessageWithImage(data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const sendMessageWithImage = async (imageUrl: string) => {
    if (!socket) return;

    if (chatMode === 'private') {
      if (!recipient.trim()) return;

      const messageData = {
        sender: username,
        receiver: recipient,
        text: message.trim() || '',
        imageUrl,
        isGroup: false,
      };

      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData),
        });

        socket.emit('send_message', messageData);
        setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
        setMessage('');
      } catch (error) {}
    } else {
      if (!selectedGroup) return;

      const messageData = {
        sender: username,
        groupName: selectedGroup,
        text: message.trim() || '',
        imageUrl,
        isGroup: true,
      };

      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData),
        });

        socket.emit('send_group_message', messageData);
        setMessage('');
      } catch (error) {}
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    if (chatMode === 'private') {
      if (!recipient.trim()) return;

      const messageData = {
        sender: username,
        receiver: recipient,
        text: message.trim(),
        isGroup: false,
      };

      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData),
        });

        socket.emit('send_message', messageData);
        setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
        setMessage('');
        socket.emit('stop_typing', { sender: username, receiver: recipient });
      } catch (error) {}
    } else {
      if (!selectedGroup) return;

      const messageData = {
        sender: username,
        groupName: selectedGroup,
        text: message.trim(),
        isGroup: true,
      };

      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData),
        });

        socket.emit('send_group_message', messageData);
        setMessage('');
        socket.emit('stop_typing_group', { groupName: selectedGroup, sender: username });
      } catch (error) {}
    }

    setShowEmojiPicker(false);
  };

  const handleTyping = () => {
    if (!socket) return;

    if (chatMode === 'private' && recipient) {
      socket.emit('typing', { sender: username, receiver: recipient });
    } else if (chatMode === 'group' && selectedGroup) {
      socket.emit('typing_group', { groupName: selectedGroup, sender: username });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (chatMode === 'private' && recipient) {
        socket.emit('stop_typing', { sender: username, receiver: recipient });
      } else if (chatMode === 'group' && selectedGroup) {
        socket.emit('stop_typing_group', { groupName: selectedGroup, sender: username });
      }
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('profilePicture');
    if (socket) { socket.close(); }
    router.push('/');
  };

  const getRecipientStatus = () => {
    return userStatus[recipient] === 'online';
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getUserProfilePicture = (username: string) => {
    return userProfiles[username] || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ChatVerse</h1>
              <p className="text-xs text-purple-300">Connected as {username}</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white/20 transition"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </motion.button>

            {notificationPermission !== 'granted' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={requestNotificationPermission}
                className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-4 py-2 rounded-full hover:bg-yellow-500/30 transition text-sm font-semibold"
              >
                Enable Notifications
              </motion.button>
            )}

            <div className="flex bg-white/10 rounded-full p-1 border border-white/20">
              <button
                onClick={() => {
                  setChatMode('private');
                  setMessages([]);
                  setSelectedGroup('');
                }}
                className={`px-4 py-2 rounded-full transition font-semibold ${
                  chatMode === 'private' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                👤 Private
              </button>
              <button
                onClick={() => {
                  setChatMode('group');
                  setMessages([]);
                  setRecipient('');
                }}
                className={`px-4 py-2 rounded-full transition font-semibold ${
                  chatMode === 'group' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                👥 Group
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-2 rounded-full hover:bg-red-500/30 transition font-semibold"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 right-4 z-50 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-96 max-h-96 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Notifications</h3>
              <button
                onClick={() => setNotifications([])}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear All
              </button>
            </div>
            <div className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center">No notifications</p>
              ) : (
                notifications.map((notif, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg"
                  >
                    <p className="font-semibold text-gray-800">{notif.sender}</p>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto flex-1 p-4 flex gap-4 max-w-7xl">
        {chatMode === 'group' && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Groups</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCreateGroup(!showCreateGroup)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-full font-bold text-xl"
              >
                +
              </motion.button>
            </div>

            {showCreateGroup && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 space-y-2"
              >
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-full outline-none text-white placeholder-gray-400"
                />
                <button
                  onClick={handleCreateGroup}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-full font-semibold"
                >
                  Create Group
                </button>
              </motion.div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
              {groups.length === 0 ? (
                <p className="text-white/60 text-center mt-4">No groups yet</p>
              ) : (
                groups.map((group, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoinGroup(group)}
                    className={`w-full p-4 rounded-2xl text-left transition ${
                      selectedGroup === group
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        👥
                      </div>
                      <div>
                        <p className="font-semibold">{group}</p>
                        {selectedGroup === group && groupMembers.length > 0 && (
                          <p className="text-xs opacity-80">{groupMembers.length} members</p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}

        <div className="flex-1 flex flex-col">
          {chatMode === 'private' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl mb-4 border border-white/20"
            >
              <label className="block text-lg font-semibold text-white mb-3">
                🎯 Chat with
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient's username"
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-full focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-400 backdrop-blur-sm"
                  autoComplete="off"
                />
                {recipient && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-full border border-white/20">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-3 h-3 rounded-full ${getRecipientStatus() ? 'bg-green-400' : 'bg-gray-400'}`}
                    />
                    <span className={`text-sm font-semibold ${getRecipientStatus() ? 'text-green-300' : 'text-gray-400'}`}>
                      {getRecipientStatus() ? 'Online' : 'Offline'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {chatMode === 'group' && selectedGroup && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl mb-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    👥
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedGroup}</h3>
                    <p className="text-sm text-purple-300">{groupMembers.length} members: {groupMembers.join(', ')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center"
                    >
                      <span className="text-6xl">{chatMode === 'group' ? '👥' : '💬'}</span>
                    </motion.div>
                    <p className="text-white/60 text-lg">No messages yet</p>
                    <p className="text-white/40 text-sm mt-2">Start the conversation!</p>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-md">
                        {msg.sender !== username && getUserProfilePicture(msg.sender) && (
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={getUserProfilePicture(msg.sender)!} 
                              alt={msg.sender} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`px-6 py-3 rounded-3xl shadow-lg ${
                            msg.sender === username
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md'
                              : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-bl-md'
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1 opacity-80">{msg.sender}</p>
                          {msg.imageUrl && (
                            <div className="mb-2">
                              <img 
                                src={msg.imageUrl} 
                                alt="Shared image" 
                                className="rounded-lg max-w-xs cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(msg.imageUrl, '_blank')}
                              />
                            </div>
                          )}
                          {msg.text && <p className="text-base break-words">{msg.text}</p>}
                          <p className="text-xs mt-2 opacity-60">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </motion.div>
                        {msg.sender === username && getUserProfilePicture(msg.sender) && (
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={getUserProfilePicture(msg.sender)!} 
                              alt={msg.sender} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <AnimatePresence>
                {isTyping && typingUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex justify-start items-center gap-2"
                  >
                    <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-3xl border border-white/20 flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-purple-300 font-medium">{typingUser} is typing...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            <motion.form
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              onSubmit={handleSendMessage}
              className="p-4 bg-black/20 border-t border-white/10 relative"
            >
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="absolute bottom-20 left-4 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20 grid grid-cols-10 gap-2"
                  >
                    {emojis.map((emoji, index) => (
                      <motion.button
                        key={index}
                        type="button"
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addEmoji(emoji)}
                        className="text-2xl hover:bg-purple-100 rounded-lg p-2 transition"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, rotate: 20 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-4 rounded-full transition"
                >
                  😊
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-4 rounded-full transition"
                >
                  📎
                </motion.button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder={
                    chatMode === 'private' 
                      ? (recipient ? "Type your message..." : "Select a recipient first...") 
                      : (selectedGroup ? "Type your message..." : "Select a group first...")
                  }
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-full focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-400 backdrop-blur-sm"
                  disabled={(chatMode === 'private' && !recipient) || (chatMode === 'group' && !selectedGroup)}
                />
                <motion.button
                  type="submit"
                  disabled={(chatMode === 'private' && !recipient) || (chatMode === 'group' && !selectedGroup) || !message.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="flex items-center gap-2">
                    Send
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
