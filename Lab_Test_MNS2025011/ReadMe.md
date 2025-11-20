# 📘 WASM Modular Exponentiation UI
Platform Used: Windows 

A Next.js application demonstrating high-performance cryptographic calculations using WebAssembly (WASM) compiled from C code.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM-purple?style=flat&logo=webassembly)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)

## 🚀 Features

- ✅ **WebAssembly Integration** - High-performance C code running in the browser
- ✅ **Modular Exponentiation** - Implements `a^b mod n` for cryptographic operations
- ✅ **Modern UI** - Clean, responsive interface built with React 19
- ✅ **Type-Safe** - Full TypeScript support with proper null handling
- ✅ **Real-Time Calculations** - Instant cryptographic computations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Emscripten SDK (emsdk)** - for compiling C to WebAssembly

### Installing Emscripten on Windows

```powershell
# Download and install emsdk
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
emsdk install latest
emsdk activate latest

# Set environment variables for current session
emsdk_env.bat
```

## 🏗️ Project Structure

```
wasm-demo/
│
├── public/
│   └── wasm/
│       ├── module.js      # WebAssembly JavaScript loader
│       └── module.wasm    # Compiled WebAssembly binary
│
├── src/
│   ├── app/
│   │   └── page.tsx       # Main React UI component
│   └── lib/
│       └── wasm-loader.ts # WASM module loader
│
└── src/wasm/
    ├── modexp.c           # C source code
    └── build.ps1          # Build script for Windows
```

## 🔧 Setup Instructions

### Step 1: Create Next.js Project

```powershell
# Create new Next.js app with TypeScript
npx create-next-app@latest wasm-demo --typescript --tailwind --app --no-src-dir

# Navigate to project directory
cd wasm-demo
```

### Step 2: Create Project Directories

```powershell
# Create necessary directories
New-Item -ItemType Directory -Path "src\wasm" -Force
New-Item -ItemType Directory -Path "src\lib" -Force
New-Item -ItemType Directory -Path "public\wasm" -Force
```

### Step 3: Add Source Files

Create the following files with the code provided in the project documentation:

- `src/wasm/modexp.c` - C code for modular exponentiation
- `src/wasm/build.ps1` - PowerShell build script
- `src/lib/wasm-loader.ts` - TypeScript WASM loader
- `src/app/page.tsx` - React UI component

### Step 4: Build WebAssembly

```powershell
# Navigate to wasm directory
cd src\wasm

# Allow script execution (if needed)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Run build script
.\build.ps1

# Return to project root
cd ..\..
```

**Expected output:**
```
✅ WebAssembly build complete!
📦 Files generated:
   - public/wasm/module.js
   - public/wasm/module.wasm
```

## 🚀 Running the Project

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:3000** in your browser.

## 🔨 Building for Production

```powershell
# Build the application
npm run build

# Start production server
npm start
```

## 📝 How It Works

1. **C Code** - Implements efficient modular exponentiation using the binary exponentiation algorithm
2. **Emscripten** - Compiles C code to WebAssembly (WASM)
3. **WASM Loader** - Dynamically loads the WASM module in the browser
4. **React UI** - Provides an interactive interface for cryptographic calculations

## 🎯 Use Cases

- **Diffie-Hellman Key Exchange** - Secure key generation
- **RSA Encryption** - Public key cryptography
- **Digital Signatures** - Authentication and integrity
- **Educational Tool** - Learn cryptographic primitives

## 🔐 Cryptographic Context

The modular exponentiation function `a^b mod n` is fundamental to:

- **Diffie-Hellman**: Compute `g^a mod p` for key exchange
- **RSA**: Compute `m^e mod n` for encryption
- **ElGamal**: Compute `g^k mod p` for encryption

## 🛠️ Troubleshooting

### WASM Build Fails

```powershell
# Ensure Emscripten is activated
cd path\to\emsdk
emsdk_env.bat
```

### Module Not Loading

- Check that `public/wasm/module.js` and `module.wasm` exist
- Clear browser cache
- Check browser console for errors

### PowerShell Script Execution Error

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

**Built with using Next.js, React, and WebAssembly**
