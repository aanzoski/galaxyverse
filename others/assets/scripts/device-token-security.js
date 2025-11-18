// ============================
// DEVICE TOKEN SECURITY SYSTEM
// ============================
// This system prevents key sharing across devices by:
// 1. Generating a unique device token stored in IndexedDB
// 2. Binding access keys to specific device tokens
// 3. Tracking key-device pairs server-side (Firebase)
// 4. Not auto-redirecting - users must enter key each session
// ============================

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBKTPcgBgUj2oNqcHAi9AyB6sYU0UKbMYE",
  authDomain: "galaxyverse-60b73.firebaseapp.com",
  databaseURL: "https://galaxyverse-60b73-default-rtdb.firebaseio.com",
  projectId: "galaxyverse-60b73",
  storageBucket: "galaxyverse-60b73.appspot.com",
  messagingSenderId: "545240806637",
  appId: "1:545240806637:web:6d4479c2f2f3c0f0fb84d5",
  measurementId: "G-TSJXQZ6Z0J"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

// ============================
// DEVICE TOKEN GENERATION
// ============================
class DeviceTokenManager {
  constructor() {
    this.dbName = 'GalaxyVerseDeviceDB';
    this.storeName = 'deviceTokenStore';
    this.tokenKey = 'deviceToken';
  }

  // Open IndexedDB
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  // Generate a unique device token based on stable device characteristics
  async generateDeviceToken() {
    const entropy = [];
    
    // Collect stable device characteristics (not invasive fingerprinting)
    entropy.push(navigator.hardwareConcurrency || 0);
    entropy.push(navigator.maxTouchPoints || 0);
    entropy.push(screen.colorDepth || 0);
    entropy.push(new Date().getTimezoneOffset());
    entropy.push(navigator.platform || '');
    entropy.push(screen.width + 'x' + screen.height);
    
    // Add some randomness for uniqueness
    const randomPart = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    entropy.push(randomPart);
    entropy.push(Date.now());
    
    // Create a hash-like token
    const tokenString = entropy.join('|');
    const token = await this.simpleHash(tokenString);
    
    return token;
  }

  // Simple hash function
  async simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'dt_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
  }

  // Get or create device token
  async getDeviceToken() {
    try {
      const db = await this.openDB();
      
      // Try to get existing token
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(this.tokenKey);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = async () => {
          if (request.result) {
            resolve(request.result);
          } else {
            // Generate new token if none exists
            const newToken = await this.generateDeviceToken();
            await this.saveDeviceToken(newToken);
            resolve(newToken);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting device token:', error);
      // Fallback to sessionStorage if IndexedDB fails
      let token = sessionStorage.getItem('fallbackDeviceToken');
      if (!token) {
        token = await this.generateDeviceToken();
        sessionStorage.setItem('fallbackDeviceToken', token);
      }
      return token;
    }
  }

  // Save device token to IndexedDB
  async saveDeviceToken(token) {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    store.put(token, this.tokenKey);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// ============================
// KEY VALIDATION SYSTEM
// ============================
class KeyValidationSystem {
  constructor() {
    this.deviceManager = new DeviceTokenManager();
    this.currentDeviceToken = null;
    this.currentKey = null;
  }

  async initialize() {
    this.currentDeviceToken = await this.deviceManager.getDeviceToken();
    console.log('Device Token:', this.currentDeviceToken);
  }

  // Check if a key is valid and can be used on this device
  async validateKey(accessKey) {
    if (!accessKey || accessKey.trim() === '') {
      return { valid: false, message: 'Please enter an access key.' };
    }

    try {
      // Check Firebase for this key's binding
      const keyRef = database.ref(`access_keys/${accessKey}`);
      const snapshot = await keyRef.once('value');
      
      if (!snapshot.exists()) {
        return { valid: false, message: 'Invalid access key.' };
      }

      const keyData = snapshot.val();
      
      // Check if key is active
      if (!keyData.active) {
        return { valid: false, message: 'This key has been deactivated.' };
      }

      // Check if key is already bound to a device
      if (keyData.boundDeviceToken) {
        // If bound to a different device, deny access
        if (keyData.boundDeviceToken !== this.currentDeviceToken) {
          return { 
            valid: false, 
            message: 'This key is already in use on another device. Please use a different key.' 
          };
        }
        
        // If bound to this device, allow access
        this.currentKey = accessKey;
        await this.updateLastUsed(accessKey);
        return { valid: true, message: 'Access granted!', keyData };
      }

      // If not bound yet, bind it to this device
      await this.bindKeyToDevice(accessKey);
      this.currentKey = accessKey;
      return { valid: true, message: 'Key bound to this device. Access granted!', keyData };

    } catch (error) {
      console.error('Key validation error:', error);
      return { valid: false, message: 'Error validating key. Please try again.' };
    }
  }

  // Bind a key to the current device
  async bindKeyToDevice(accessKey) {
    const keyRef = database.ref(`access_keys/${accessKey}`);
    await keyRef.update({
      boundDeviceToken: this.currentDeviceToken,
      boundAt: Date.now(),
      lastUsed: Date.now()
    });
  }

  // Update last used timestamp
  async updateLastUsed(accessKey) {
    const keyRef = database.ref(`access_keys/${accessKey}`);
    await keyRef.update({
      lastUsed: Date.now()
    });
  }

  // Check if user has valid session (for page navigation)
  hasValidSession() {
    return this.currentKey !== null;
  }

  // Logout function
  logout() {
    this.currentKey = null;
  }
}

// ============================
// UI INTEGRATION
// ============================
const keySystem = new KeyValidationSystem();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await keySystem.initialize();
  
  // Check if content is protected
  const protectedContent = document.querySelectorAll('.main-content, .sidebar');
  if (protectedContent.length > 0) {
    showKeyPrompt();
  }
});

// Show key entry prompt
function showKeyPrompt() {
  // Hide main content
  const mainContent = document.querySelector('.main-content');
  const sidebar = document.querySelector('.sidebar');
  
  if (mainContent) mainContent.style.display = 'none';
  if (sidebar) sidebar.style.display = 'none';

  // Create key prompt overlay
  const overlay = document.createElement('div');
  overlay.id = 'keyPromptOverlay';
  overlay.innerHTML = `
    <style>
      #keyPromptOverlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      }
      
      .key-prompt-container {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(79, 144, 255, 0.3);
        border-radius: 20px;
        padding: 40px;
        max-width: 450px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        text-align: center;
      }
      
      .key-prompt-logo {
        font-size: 64px;
        margin-bottom: 20px;
      }
      
      .key-prompt-title {
        font-size: 32px;
        color: #4f90ff;
        margin-bottom: 10px;
        font-weight: bold;
      }
      
      .key-prompt-subtitle {
        color: #a0a0a0;
        margin-bottom: 30px;
        font-size: 14px;
      }
      
      .key-input-group {
        margin-bottom: 20px;
      }
      
      .key-input {
        width: 100%;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(79, 144, 255, 0.3);
        border-radius: 10px;
        color: white;
        font-size: 16px;
        text-align: center;
        transition: all 0.3s ease;
      }
      
      .key-input:focus {
        outline: none;
        border-color: #4f90ff;
        background: rgba(255, 255, 255, 0.1);
      }
      
      .key-submit-btn {
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #4f90ff, #3a7bd5);
        border: none;
        border-radius: 10px;
        color: white;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .key-submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(79, 144, 255, 0.4);
      }
      
      .key-submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .key-message {
        margin-top: 15px;
        padding: 10px;
        border-radius: 8px;
        font-size: 14px;
        display: none;
      }
      
      .key-message.error {
        background: rgba(255, 68, 68, 0.1);
        border: 1px solid rgba(255, 68, 68, 0.3);
        color: #ff6b6b;
        display: block;
      }
      
      .key-message.success {
        background: rgba(68, 255, 68, 0.1);
        border: 1px solid rgba(68, 255, 68, 0.3);
        color: #51cf66;
        display: block;
      }
    </style>
    
    <div class="key-prompt-container">
      <div class="key-prompt-logo">🔐</div>
      <h1 class="key-prompt-title">GalaxyVerse Access</h1>
      <p class="key-prompt-subtitle">Enter your access key to continue</p>
      
      <div class="key-input-group">
        <input 
          type="text" 
          id="accessKeyInput" 
          class="key-input" 
          placeholder="Enter your access key"
          autocomplete="off"
        />
      </div>
      
      <button id="submitKeyBtn" class="key-submit-btn">Unlock</button>
      
      <div id="keyMessage" class="key-message"></div>
    </div>
  `;
  
  document.body.appendChild(overlay);

  // Handle key submission
  const input = document.getElementById('accessKeyInput');
  const submitBtn = document.getElementById('submitKeyBtn');
  const messageDiv = document.getElementById('keyMessage');

  const handleSubmit = async () => {
    const key = input.value.trim();
    
    if (!key) {
      showMessage('Please enter an access key', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Validating...';

    const result = await keySystem.validateKey(key);

    if (result.valid) {
      showMessage(result.message, 'success');
      
      setTimeout(() => {
        document.getElementById('keyPromptOverlay').remove();
        if (mainContent) mainContent.style.display = 'block';
        if (sidebar) sidebar.style.display = 'flex';
      }, 1000);
    } else {
      showMessage(result.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Unlock';
    }
  };

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `key-message ${type}`;
  }

  submitBtn.addEventListener('click', handleSubmit);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });

  // Auto-focus input
  input.focus();
}

// ============================
// ADMIN FUNCTIONS (for testing)
// ============================

// Create a new access key (admin only)
async function createAccessKey(keyName, options = {}) {
  const keyRef = database.ref(`access_keys/${keyName}`);
  await keyRef.set({
    active: true,
    createdAt: Date.now(),
    boundDeviceToken: null,
    boundAt: null,
    lastUsed: null,
    ...options
  });
  console.log(`Access key "${keyName}" created successfully`);
}

// Deactivate a key
async function deactivateKey(keyName) {
  const keyRef = database.ref(`access_keys/${keyName}`);
  await keyRef.update({ active: false });
  console.log(`Access key "${keyName}" deactivated`);
}

// Unbind a key from its device
async function unbindKey(keyName) {
  const keyRef = database.ref(`access_keys/${keyName}`);
  await keyRef.update({
    boundDeviceToken: null,
    boundAt: null
  });
  console.log(`Access key "${keyName}" unbound from device`);
}

// List all keys
async function listAllKeys() {
  const keysRef = database.ref('access_keys');
  const snapshot = await keysRef.once('value');
  const keys = snapshot.val();
  console.table(keys);
  return keys;
}

// Make admin functions globally available
window.GalaxyVerseAdmin = {
  createAccessKey,
  deactivateKey,
  unbindKey,
  listAllKeys
};

console.log('🔐 GalaxyVerse Device Token Security System Loaded');
console.log('📝 Admin commands available via window.GalaxyVerseAdmin');
