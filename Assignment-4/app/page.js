'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [rc4Module, setRc4Module] = useState(null);
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWasm = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (typeof window.createRC4Module === 'function') {
          const Module = await window.createRC4Module();
          console.log('WASM module loaded successfully');
          setRc4Module(Module);
          setIsLoading(false);
        } else {
          throw new Error('createRC4Module not found');
        }
      } catch (error) {
        console.error('Failed to load WASM:', error);
        setError('Failed to load WASM module. Check console for details.');
        setIsLoading(false);
      }
    };

    const script = document.createElement('script');
    script.src = '/rc4.js';
    script.async = true;
    script.onload = loadWasm;
    script.onerror = () => {
      setError('Failed to load rc4.js. Make sure files are in public/ folder.');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const rc4Process = (text, keyStr) => {
    if (!rc4Module) {
      setError('WASM module not loaded yet!');
      return null;
    }

    if (!text || !keyStr) {
      setError('Please provide both text and key!');
      return null;
    }

    try {
      setError('');
      
      const textBytes = new TextEncoder().encode(text);
      const keyBytes = new TextEncoder().encode(keyStr);

      console.log('Text length:', textBytes.length);
      console.log('Key length:', keyBytes.length);

      // Allocate memory in WASM
      const textPtr = rc4Module._allocate_memory(textBytes.length);
      const keyPtr = rc4Module._allocate_memory(keyBytes.length);

      if (!textPtr || !keyPtr) {
        throw new Error('Memory allocation failed');
      }

      console.log('Text pointer:', textPtr);
      console.log('Key pointer:', keyPtr);
      
      // Copy data to WASM memory using setValue
      for (let i = 0; i < textBytes.length; i++) {
        rc4Module.setValue(textPtr + i, textBytes[i], 'i8');
      }
      for (let i = 0; i < keyBytes.length; i++) {
        rc4Module.setValue(keyPtr + i, keyBytes[i], 'i8');
      }

      console.log('Data copied to WASM memory');

      // Call RC4 cipher
      rc4Module._rc4_cipher(textPtr, textBytes.length, keyPtr, keyBytes.length);

      console.log('RC4 cipher executed');

      // Read result from WASM memory using getValue
      const resultBytes = new Uint8Array(textBytes.length);
      for (let i = 0; i < textBytes.length; i++) {
        resultBytes[i] = rc4Module.getValue(textPtr + i, 'i8') & 0xFF;
      }

      // Convert to hex string
      const hexResult = Array.from(resultBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Free memory
      rc4Module._free_memory(textPtr);
      rc4Module._free_memory(keyPtr);

      console.log('Processing successful');
      return hexResult;
    } catch (error) {
      console.error('RC4 processing error:', error);
      console.error('Error stack:', error.stack);
      setError(`Error processing data: ${error.message}`);
      return null;
    }
  };

  const handleEncrypt = () => {
    if (!plaintext.trim() || !key.trim()) {
      setError('Please enter both text and key');
      return;
    }
    
    const encrypted = rc4Process(plaintext, key);
    if (encrypted) {
      setResult(`Encrypted (Hex): ${encrypted}`);
      setError('');
    }
  };

  const handleDecrypt = () => {
    if (!plaintext.trim() || !key.trim()) {
      setError('Please enter both hex string and key');
      return;
    }

    if (!plaintext.match(/^[0-9a-fA-F]*$/)) {
      setError('For decryption, please enter a valid hex string!');
      return;
    }

    if (plaintext.length % 2 !== 0) {
      setError('Hex string must have even number of characters!');
      return;
    }

    try {
      setError('');
      
      const hexPairs = plaintext.match(/.{1,2}/g) || [];
      const textBytes = new Uint8Array(hexPairs.map(byte => parseInt(byte, 16)));
      const keyBytes = new TextEncoder().encode(key);

      console.log('Decrypting hex length:', textBytes.length);

      const textPtr = rc4Module._allocate_memory(textBytes.length);
      const keyPtr = rc4Module._allocate_memory(keyBytes.length);

      if (!textPtr || !keyPtr) {
        throw new Error('Memory allocation failed');
      }

      // Copy to WASM memory using setValue
      for (let i = 0; i < textBytes.length; i++) {
        rc4Module.setValue(textPtr + i, textBytes[i], 'i8');
      }
      for (let i = 0; i < keyBytes.length; i++) {
        rc4Module.setValue(keyPtr + i, keyBytes[i], 'i8');
      }

      // Decrypt
      rc4Module._rc4_cipher(textPtr, textBytes.length, keyPtr, keyBytes.length);

      // Read result using getValue
      const resultBytes = new Uint8Array(textBytes.length);
      for (let i = 0; i < textBytes.length; i++) {
        resultBytes[i] = rc4Module.getValue(textPtr + i, 'i8') & 0xFF;
      }

      const decrypted = new TextDecoder().decode(resultBytes);

      rc4Module._free_memory(textPtr);
      rc4Module._free_memory(keyPtr);

      setResult(`Decrypted: ${decrypted}`);
      console.log('Decryption successful');
    } catch (error) {
      console.error('Decryption error:', error);
      setError(`Error decrypting data: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading WASM module...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">
          RC4 Encryption/Decryption
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plaintext / Ciphertext (Hex)
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              rows="4"
              placeholder="Enter text to encrypt or hex string to decrypt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              placeholder="Enter encryption key"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleEncrypt}
              disabled={!rc4Module}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400"
            >
              Encrypt
            </button>
            <button
              onClick={handleDecrypt}
              disabled={!rc4Module}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
            >
              Decrypt
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">Result:</h3>
              <p className="text-sm text-gray-600 break-all font-mono">{result}</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-900">How to Use:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Enter plaintext and key, click <strong>Encrypt</strong></li>
            <li>Copy the hex output</li>
            <li>Paste hex back, use same key, click <strong>Decrypt</strong></li>
            <li>You should get your original text back!</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
