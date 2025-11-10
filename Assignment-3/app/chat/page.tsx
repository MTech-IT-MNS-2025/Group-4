'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: string }>({});
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Scroll to bottom
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  // Notifications permission
  useEffect(() => {
    if ('Notification' in window) setNotificationPermission(Notification.permission);
  }, []);

  // ✅ SOCKET SETUP
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedProfile = localStorage.getItem('profilePicture');
    if (!storedUsername) {
      router.push('/');
      return;
    }
    setUsername(storedUsername);
    if (storedProfile) setProfilePicture(storedProfile);

    const newSocket = io('http://localhost:3000', { transports: ['websocket'] });

    newSocket.on('connect', () => {
      console.log('🟢 Connected:', newSocket.id);
      newSocket.emit('register_user', { username: storedUsername, profilePicture: storedProfile });
      newSocket.emit('get_all_statuses');
    });

    // Online/offline status updates
    newSocket.on('user_status', (data: { username: string; status: string }) => {
      setUserStatus((prev) => ({ ...prev, [data.username]: data.status }));
    });

    newSocket.on('all_users_status', (statuses: { [key: string]: string }) => {
      console.log('📡 Received all statuses:', statuses);
      setUserStatus(statuses);
    });

    // Messages + groups + notifications
    newSocket.on('receive_message', (data: Message) => setMessages((prev) => [...prev, data]));
    newSocket.on('receive_group_message', (data: Message) => setMessages((prev) => [...prev, { ...data, isGroup: true }]));
    newSocket.on('notification', (data: { sender: string; message: string }) => {
      const notif = { sender: data.sender, message: data.message, timestamp: new Date() };
      setNotifications((prev) => [notif, ...prev]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message from ${data.sender}`, { body: data.message, icon: '/profiles/default.png' });
      }
    });

    newSocket.on('group_created', (data: { groupName: string }) => setGroups((prev) => [...prev, data.groupName]));
    newSocket.on('all_groups', (data: string[]) => setGroups(data));
    newSocket.on('group_members', (data: { groupName: string; members: string[] }) => {
      if (selectedGroup === data.groupName) setGroupMembers(data.members);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [router, selectedGroup]);

  // ✅ GROUP CREATION
  const handleCreateGroup = () => {
    if (!socket || !newGroupName.trim()) return;
    socket.emit('create_group', { groupName: newGroupName.trim(), creator: username });
    setSelectedGroup(newGroupName.trim());
    socket.emit('join_group', { groupName: newGroupName.trim(), username });
    setNewGroupName('');
    setShowCreateGroup(false);
    setChatMode('group');
  };

  // ✅ JOIN GROUP
  const handleJoinGroup = (groupName: string) => {
    if (!socket) return;
    setSelectedGroup(groupName);
    socket.emit('join_group', { groupName, username });
    setChatMode('group');
    setMessages([]);
  };

  // ✅ FILE UPLOAD
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'message');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) sendMessageWithImage(data.url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const sendMessageWithImage = (imageUrl: string) => {
    if (!socket) return;
    const msg: Message = {
      sender: username,
      receiver: chatMode === 'private' ? recipient : undefined,
      groupName: chatMode === 'group' ? selectedGroup : undefined,
      text: message.trim(),
      imageUrl,
      isGroup: chatMode === 'group'
    };
    socket.emit(chatMode === 'private' ? 'send_message' : 'send_group_message', msg);
    setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
    setMessage('');
  };

  // ✅ SEND MESSAGE
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !message.trim()) return;
    const msg: Message = {
      sender: username,
      receiver: chatMode === 'private' ? recipient : undefined,
      groupName: chatMode === 'group' ? selectedGroup : undefined,
      text: message.trim(),
      isGroup: chatMode === 'group'
    };
    socket.emit(chatMode === 'private' ? 'send_message' : 'send_group_message', msg);
    setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
    setMessage('');
  };

  // ✅ TYPING HANDLER
  const handleTyping = () => {
    if (!socket) return;
    if (chatMode === 'private' && recipient) socket.emit('typing', { sender: username, receiver: recipient });
    else if (chatMode === 'group' && selectedGroup) socket.emit('typing_group', { groupName: selectedGroup, sender: username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (chatMode === 'private' && recipient) socket.emit('stop_typing', { sender: username, receiver: recipient });
      else if (chatMode === 'group' && selectedGroup) socket.emit('stop_typing_group', { groupName: selectedGroup, sender: username });
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('profilePicture');
    socket?.close();
    router.push('/');
  };

  const getRecipientStatus = () => {
    if (!recipient || !userStatus) return false;
    return userStatus[recipient]?.toLowerCase() === 'online';
  };

  // ✅ UI START
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

      {/* HEADER */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full overflow-hidden">
              {profilePicture ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ChatVerse</h1>
              <p className="text-xs text-purple-300">Connected as {username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 🔔 Notification Button */}
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full hover:bg-white/20 transition">
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* 👤 Private / 👥 Group Buttons */}
            <div className="flex bg-white/10 rounded-full p-1 border border-white/20">
              <button onClick={() => setChatMode('private')} className={`px-4 py-2 rounded-full ${chatMode === 'private' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-white/60 hover:text-white'}`}>👤 Private</button>
              <button onClick={() => setChatMode('group')} className={`px-4 py-2 rounded-full ${chatMode === 'group' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-white/60 hover:text-white'}`}>👥 Group</button>
            </div>

            <button onClick={handleLogout} className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-2 rounded-full hover:bg-red-500/30 transition font-semibold">Logout</button>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="container mx-auto flex-1 p-4 flex gap-4 max-w-7xl">
        {chatMode === 'group' && (
          <div className="w-80 bg-white/10 rounded-3xl p-6 border border-white/20 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Groups</h2>
              <button onClick={() => setShowCreateGroup(!showCreateGroup)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-full font-bold text-xl">+</button>
            </div>

            {showCreateGroup && (
              <div className="mb-4 space-y-2">
                <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group name" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white" />
                <button onClick={handleCreateGroup} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-full font-semibold">Create</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
              {groups.map((group, i) => (
                <button key={i} onClick={() => handleJoinGroup(group)} className={`w-full p-4 rounded-2xl ${selectedGroup === group ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                  👥 {group}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CHAT BOX */}
        <div className="flex-1 flex flex-col">
          {chatMode === 'private' && (
            <div className="bg-white/10 p-6 rounded-3xl mb-4 border border-white/20">
              <label className="block text-lg font-semibold text-white mb-3">🎯 Chat with</label>
              <div className="flex gap-3 items-center">
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Enter recipient's username" className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white" />
                {recipient && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-full border border-white/20">
                    <div className={`w-3 h-3 rounded-full ${getRecipientStatus() ? 'bg-green-400' : 'bg-gray-400'}`} />
                    <span className={`text-sm font-semibold ${getRecipientStatus() ? 'text-green-300' : 'text-gray-400'}`}>
                      {getRecipientStatus() ? 'Online' : 'Offline'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 bg-white/5 rounded-3xl overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-md px-6 py-3 rounded-3xl shadow-lg bg-white/10 text-white border border-white/20">
                  <p className="text-xs font-semibold mb-1 opacity-80">{msg.sender}</p>
                  {msg.imageUrl && <img src={msg.imageUrl} alt="img" className="rounded-lg mb-2 max-w-xs" />}
                  <p>{msg.text}</p>
                  <p className="text-xs mt-2 opacity-60">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {/* ✅ Emoji Picker */}
{showEmojiPicker && (
  <div className="absolute bottom-24 left-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20 grid grid-cols-10 gap-2 z-50">
    {emojis.map((emoji, index) => (
      <button
        key={index}
        type="button"
        onClick={() => {
          setMessage((prev) => prev + emoji);
          setShowEmojiPicker(false);
        }}
        className="text-2xl hover:bg-purple-100 rounded-lg p-2 transition"
      >
        {emoji}
      </button>
    ))}
  </div>
)}

          <form onSubmit={handleSendMessage} className="p-4 bg-black/20 border-t border-white/10 flex gap-3">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="bg-white/10 text-white px-4 py-4 rounded-full">😊</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/10 text-white px-4 py-4 rounded-full">📎</button>
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white"
            />
            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold">
              Send →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

