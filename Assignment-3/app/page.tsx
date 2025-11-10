'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Bubble {
  width: number;
  height: number;
  left: string;
  top: string;
  duration: number;
  xOffset: number;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const generated = Array.from({ length: 40 }, () => ({
      width: Math.random() * 80 + 30,
      height: Math.random() * 80 + 30,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 5 + 5,
      xOffset: Math.random() * 20 - 10,
    }));
    setBubbles(generated);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setProfilePicture(data.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setIsLoading(true);

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const payload = { username, password, profilePicture };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        // Save user info locally (same as before)
        localStorage.setItem('username', username.trim());
        if (profilePicture) localStorage.setItem('profilePicture', profilePicture);
        router.push('/chat');
      } else {
        alert(data.message || 'Authentication failed.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        {bubbles &&
          bubbles.map((b, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full opacity-10"
              style={{
                width: b.width,
                height: b.height,
                left: b.left,
                top: b.top,
                willChange: 'transform',
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, b.xOffset, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-white/20"
      >
        <div className="relative mx-auto mb-6 w-24 h-24">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden relative group"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">👤</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
              Upload Photo
            </div>
          </motion.button>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-center text-gray-700 mb-8 text-sm font-medium">
          {isRegistering
            ? 'Join ChatVerse and start chatting instantly!'
            : 'Log in to continue to ChatVerse.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white text-gray-900 font-medium placeholder-gray-500 text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white text-gray-900 font-medium placeholder-gray-500 text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all relative overflow-hidden disabled:opacity-50"
          >
            {isLoading
              ? isRegistering
                ? 'Creating Account...'
                : 'Logging In...'
              : isRegistering
              ? 'Register →'
              : 'Login →'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-700 font-medium">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegistering(false)}
                className="text-purple-600 font-semibold hover:underline"
              >
                Login
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button
                onClick={() => setIsRegistering(true)}
                className="text-purple-600 font-semibold hover:underline"
              >
                Register
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

