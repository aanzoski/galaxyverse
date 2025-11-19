// Wait for console to be ready before proceeding
if (window.GVerseConsole && !window.GVerseConsole.initialized) {
  console.log('⏳ Waiting for console initialization...');
  const waitForConsole = setInterval(() => {
    if (window.GVerseConsole.initialized) {
      clearInterval(waitForConsole);
      console.log('✅ Console ready, continuing scripts.js initialization');
    }
  }, 50);
}

// ===== CONSOLE INTEGRATION =====
console.log('📦 Loading scripts.js with Fingerprint ID System...');
console.log('🔍 Checking console status:', window.GVerseConsole ? 'Available' : 'Not loaded');

// ===== ALLOWED DOMAINS FOR AUTO-REDIRECT =====
const ALLOWED_DOMAINS = [
  'ahs.schoologydashboard.org.cdn.cloudflare.net',
  'learn.schoologydashboard.org.cdn.cloudflare.net',
  'gverse.schoologydashboard.org.cdn.cloudflare.net',
  'schoologydashboard.org',
  'galaxyverse-c1v.pages.dev',
  'www.galaxyverse.org',
  'galaxyverse.org',
  'schoologycourses.org'
];

// ===== CHECK IF ON ALLOWED DOMAIN =====
function isOnAllowedDomain() {
  const hostname = window.location.hostname.toLowerCase();
  return ALLOWED_DOMAINS.some(domain => hostname.includes(domain.replace('www.', '')));
}

// ===== SEASONAL THEME SYSTEM (BUILT-IN) =====
function getSeasonalTheme() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  
  if (year === 2025 && month === 9 && day >= 27 && day <= 30) {
    console.log('🎃 Halloween season detected!');
    return 'halloween';
  }
  
  if (year === 2025 && ((month === 10 && day >= 1) || month === 11)) {
    console.log('🎄 Christmas season detected!');
    return 'christmas';
  }
  
  if (year >= 2026) {
    console.log('✨ Default season');
    return 'original';
  }
  
  return 'original';
}

function shouldAutoApplySeasonalTheme() {
  const autoApply = localStorage.getItem('autoApplySeasonalThemes');
  return autoApply !== 'false';
}

// ===== WEBSITEKEYTRACKER.JS =====
(function() {
  window.WebsiteKeyTracker = {
    initialized: false,
    
    init: function() {
      if (this.initialized) return;
      this.initialized = true;
      console.log('🔍 WebsiteKeyTracker initialized (v5.0 - Fingerprint ID)');
    },
    
    trackKeyUsage: async function(key, website, fingerprintId) {
      try {
        if (typeof firebase === 'undefined' || !firebase.database) {
          console.error('❌ Firebase not available for tracking');
          return;
        }
        
        const database = firebase.database();
        const trackingRef = database.ref('keyTracking/' + key + '/' + Date.now());
        
        await trackingRef.set({
          website: website,
          fingerprintId: fingerprintId ? fingerprintId.substring(0, 16) + '...' : 'N/A',
          timestamp: Date.now(),
          date: new Date().toISOString(),
          action: 'access',
          authMethod: 'fingerprint'
        });
        
        console.log('✅ Key usage tracked with Fingerprint ID:', key, 'on', website);
      } catch (error) {
        console.error('❌ Error tracking key usage:', error);
      }
    }
  };
  
  window.WebsiteKeyTracker.init();
})();

// ===== BROWSER FINGERPRINT ID GENERATOR =====
const FingerprintManager = {
  generateFingerprint: async function() {
    const components = [];
    
    // Screen resolution
    components.push(screen.width + 'x' + screen.height + 'x' + screen.colorDepth);
    
    // Timezone
    components.push(new Date().getTimezoneOffset());
    
    // Language
    components.push(navigator.language);
    
    // Platform
    components.push(navigator.platform);
    
    // User agent
    components.push(navigator.userAgent);
    
    // Hardware concurrency
    components.push(navigator.hardwareConcurrency || 'unknown');
    
    // Device memory
    components.push(navigator.deviceMemory || 'unknown');
    
    // Canvas fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('GalaxyVerse', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Fingerprint', 4, 17);
    components.push(canvas.toDataURL());
    
    // WebGL fingerprint
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
          components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        }
      }
    } catch (e) {
      components.push('webgl-error');
    }
    
    // Plugins
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    components.push(plugins.join(','));
    
    // Touch support
    components.push('ontouchstart' in window);
    
    // Audio context fingerprint
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      gainNode.gain.value = 0;
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(0);
      const audioFingerprint = analyser.frequencyBinCount.toString();
      components.push(audioFingerprint);
      
      oscillator.stop();
      audioContext.close();
    } catch (e) {
      components.push('audio-error');
    }
    
    // Generate hash
    const fingerprint = components.join('|||');
    const hash = await this.hashString(fingerprint);
    
    return hash;
  },
  
  hashString: async function(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
};

// ===== KEY GENERATOR =====
const KeyGenerator = {
  generate: function(length = 32) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    // FIXED: Removed Firebase forbidden characters: . $ # [ ] / \ and quotes
    const special = '&*^';
    const allChars = lowercase + uppercase + numbers + special;
    
    let key = '';
    
    // Ensure at least one of each type
    key += lowercase[Math.floor(Math.random() * lowercase.length)];
    key += uppercase[Math.floor(Math.random() * uppercase.length)];
    key += numbers[Math.floor(Math.random() * numbers.length)];
    key += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = key.length; i < length; i++) {
      key += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the key
    return key.split('').sort(() => Math.random() - 0.5).join('');
  },
  
  copyToClipboard: function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('✅ Key copied to clipboard');
        return true;
      }).catch(err => {
        console.error('❌ Failed to copy:', err);
        return false;
      });
    } else {
      // Fallback method
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        console.log('✅ Key copied to clipboard (fallback)');
        return true;
      } catch (err) {
        console.error('❌ Failed to copy:', err);
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }
};

// ===== FIREBASE CROSS-DOMAIN KEY SYSTEM WITH FINGERPRINT ID =====
(function() {
  console.log('🔑 Initializing Fingerprint ID System...');
  console.log('🛡️ Security: Browser Fingerprint Authentication');
  
  // ===== DOMAIN NORMALIZATION =====
  function normalizeHostname(hostname) {
    hostname = hostname.split(':')[0].toLowerCase();
    
    const galaxyverseDomains = [
      'schoologydashboard.org',
      'ahs.schoologydashboard.org',
      'learn.schoologydashboard.org',
      'gverse.schoologydashboard.org',
      'galaxyverse-c1v.pages.dev',
      'galaxyverse.org',
      'schoologycourses.org',
      'cloudflare.net'
    ];
    
    for (const domain of galaxyverseDomains) {
      if (hostname.includes(domain.replace(/\./g, ''))) {
        return 'galaxyverse-network';
      }
    }
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'galaxyverse-network';
    }
    
    return hostname;
  }

  function getActualWebsite(hostname) {
    hostname = hostname.split(':')[0].toLowerCase();
    
    if (hostname.includes('cloudflare.net')) {
      if (hostname.includes('ahs')) return 'ahs.schoologydashboard.org';
      if (hostname.includes('learn')) return 'learn.schoologydashboard.org';
      if (hostname.includes('gverse')) return 'gverse.schoologydashboard.org';
      return 'schoologydashboard.org';
    }
    
    if (hostname.includes('ahs.schoologydashboard')) return 'ahs.schoologydashboard.org';
    if (hostname.includes('learn.schoologydashboard')) return 'learn.schoologydashboard.org';
    if (hostname.includes('gverse.schoologydashboard')) return 'gverse.schoologydashboard.org';
    if (hostname.includes('schoologydashboard')) return 'schoologydashboard.org';
    if (hostname.includes('galaxyverse-c1v')) return 'galaxyverse-c1v.pages.dev';
    if (hostname.includes('galaxyverse.org')) return 'galaxyverse.org';
    if (hostname.includes('schoologycourses')) return 'schoologycourses.org';
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'localhost';
    
    return hostname;
  }

  function waitForFirebase(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkFirebase = setInterval(() => {
      attempts++;
      if (typeof firebase !== 'undefined' && firebase.apps) {
        clearInterval(checkFirebase);
        console.log('✅ Firebase detected');
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkFirebase);
        console.error('❌ Firebase failed to load');
        callback();
      }
    }, 100);
  }

  waitForFirebase(async function() {
    if (typeof firebase === 'undefined') {
      console.warn('⚠️ Firebase not available, running in offline mode');
      return;
    }

    const firebaseConfig = {
      apiKey: "AIzaSyBEAf_wxxWQtaYdIfgKTTl5ls5o7e3qfAU",
      authDomain: "galaxyverse-keys.firebaseapp.com",
      databaseURL: "https://galaxyverse-keys-default-rtdb.firebaseio.com",
      projectId: "galaxyverse-keys",
      storageBucket: "galaxyverse-keys.firebasestorage.app",
      messagingSenderId: "571215796975",
      appId: "1:571215796975:web:820d004292cb4159f1d91a",
    };

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      console.log('✅ Firebase initialized successfully');
    } catch (initError) {
      console.error('❌ Firebase initialization error:', initError);
      return;
    }

    const database = firebase.database();
    
    database.ref('.info/connected').once('value')
      .then(() => console.log('✅ Firebase database connected'))
      .catch(err => console.error('❌ Firebase database connection failed:', err));

    const validKeys = [
      // DEVS KEYS
      'ghostisnot',
      'davidsbackupkey',
      'azthedev',
      'aziscoolbro',
      'aanzoski',
      'MichaelIsKronos',
      'jordanthedev',
      'devinisahuman',
      // Contributor Keys
      'darielis67age',
      'googlegemini',
      'someonecanhavethiskey',
      // PAID KEYS
      'Rh8xq1FtfFK2q5RQlSVs18TIHrIPJozX',
      '3rE09eoKPls1IMjdnI1w8HToYTDLWmRq',
      '19EhZSE1nIAUmQ9nM3gKAZP3wLuqQl7s',
      'fYINFx0X4bcMWb2524J8EmLlW883X97h',
      'SRkAQIB6X3fkpiAV5t3bxMmzvTXjMfu2',
      'dWhlBziFTiQU8Q8M2K8L7zP6rN0wwW6Z',
      'flLqsmdXrkI60LINjP78n95W2i7cUkmy',
      '7pirAj7WOB8Oz6HNa4Ou0tQASNuostGX',
      // Free keys
      '67676767',
      '414141414141',
      'whowantsthiskey',
      'version3published',
      // Specified Friend keys
      'osZ9O36kX99k82',
      'b7Tvc9Qu1x0M2X',
      'e6bLi8IG00TV53',
      'oB3Yv2zy25bV8R',
      // Made by az bro 
      'jordanisaskid67',
      'azisaskid41',
      'shortsluis',
      'calderonisbadatsoccer',
      'CanNeverGetCorrectSleep',
      // Uh idek for Hector
      'WeloveHector',
      'domainuse',
      'jordanproskid'
    ];

    async function initializeKeySystem() {
      const normalizedSite = normalizeHostname(window.location.hostname || 'localhost');
      const actualSite = getActualWebsite(window.location.hostname || 'localhost');
      console.log('🌐 Network:', normalizedSite);
      console.log('🌐 Current domain:', actualSite);
      
      // Generate fingerprint
      console.log('🔐 Generating browser fingerprint...');
      const fingerprintId = await FingerprintManager.generateFingerprint();
      console.log('✅ Fingerprint generated:', fingerprintId.substring(0, 16) + '...');
      
      // ALWAYS show key entry screen (no auto-login)
      console.log('🔐 Showing key entry screen');
      showKeyEntryScreen(fingerprintId);
    }

    function showKeyEntryScreen(fingerprintId) {
      console.log('🔐 Showing key entry screen with Fingerprint ID');
      
      const keyOverlay = document.createElement('div');
      keyOverlay.id = 'galaxyverse-key-overlay';
      keyOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: 'Roboto', sans-serif;
      `;

      keyOverlay.innerHTML = `
        <div style="
          background: rgba(30, 36, 51, 0.95);
          border: 2px solid #4f90ff;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 15px 50px rgba(79, 144, 255, 0.3);
          text-align: center;
          max-width: 550px;
          width: 90%;
        ">
          <div style="
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #4f90ff, #9d4edd);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            box-shadow: 0 8px 20px rgba(79, 144, 255, 0.4);
          ">
            🔐
          </div>
          
          <h1 style="
            color: #e0e6f1;
            font-size: 32px;
            margin: 0 0 10px 0;
            font-weight: 700;
          ">GalaxyVerse</h1>
          
          <p style="
            color: #9ca3af;
            font-size: 16px;
            margin: 0 0 10px 0;
          ">Enter your access key to continue</p>
          
          <div style="
            background: rgba(79, 144, 255, 0.1);
            border: 1px solid rgba(79, 144, 255, 0.3);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #9ca3af;
          ">
            <div style="margin-bottom: 8px; color: #4f90ff; font-weight: bold;">🔐 Fingerprint ID Security</div>
            <div style="font-size: 12px; text-align: left; padding: 0 10px;">
              <div style="margin: 5px 0;">✅ Saul is tung tung sahur</div>
              <div style="margin: 5px 0;">❌ Joseluis owes me $100</div>
              <div style="margin: 5px 0;">❌ Jacob Cuellar I need my $5k back</div>
              <div style="margin: 5px 0;">❌ Fabian I need my Hellcat Back pls</div>
              <div style="margin: 5px 0;">👑 Admin Panel for Admins duh</div>
              <div style="margin: 10px 0; padding-top: 10px; border-top: 1px solid rgba(79, 144, 255, 0.2); font-size: 11px; color: #ff9966;">
                Your fingerprint: ${fingerprintId.substring(0, 8)}...${fingerprintId.substring(fingerprintId.length - 8)}
              </div>
            </div>
          </div>
          
          <p style="
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 20px;
          ">
          <a href="https://docs.google.com/document/d/1RfHWPQ-8Kq2NDV6vxfOgquBqIKwp4OoL7K1NXkYLUEg/edit?usp=sharing" target="_blank" style="color: #4f90ff;">GalaxyVerse Policy</a><br>
          V5.0.0 - Fingerprint ID System</p>
          
          <input type="text" id="keyInput" placeholder="Enter your key" style="
            width: 100%;
            padding: 15px;
            font-size: 16px;
            border: 2px solid #38415d;
            border-radius: 10px;
            background: #121826;
            color: #e0e6f1;
            outline: none;
            box-sizing: border-box;
            transition: all 0.3s ease;
            margin-bottom: 20px;
          " />
          
          <button id="submitKey" style="
            width: 100%;
            padding: 15px;
            font-size: 16px;
            font-weight: bold;
            background: linear-gradient(135deg, #4f90ff, #9d4edd);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(79, 144, 255, 0.3);
            margin-bottom: 10px;
          ">Verify Key</button>
          
          <button id="generateKeyBtn" style="
            width: 100%;
            padding: 12px;
            font-size: 14px;
            font-weight: bold;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
            margin-bottom: 10px;
          ">🔑 Generate New Key</button>
          
          <button id="testConnectionBtn" style="
            width: 100%;
            padding: 10px;
            font-size: 14px;
            background: transparent;
            color: #4f90ff;
            border: 1px solid #4f90ff;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          ">Test Connection</button>
          
          <div id="keyError" style="
            color: #ff4444;
            margin-top: 15px;
            font-size: 14px;
            display: none;
          "></div>
          
          <div id="connectionStatus" style="
            margin-top: 15px;
            font-size: 12px;
            color: #9ca3af;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            <span id="statusDot" style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #4ade80;
              display: inline-block;
            "></span>
            <span id="statusText">Connected</span>
          </div>
          
          <div style="
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #38415d;
            color: #6b7280;
            font-size: 12px;
          ">
            🔐 Fingerprint ID Protection<br>
            🛡️ Device-specific authentication<br>
            🔑 Manual key entry required each session<br>
            ⚠️ Each key is bound to your browser fingerprint<br>
            ✨ Works across ALL GalaxyVerse domains<br><br>
            Contact admins for lifetime key ($5)
          </div>
        </div>
      `;

      document.body.appendChild(keyOverlay);
      
      const mainContent = document.getElementById('app') || document.body;
      if (mainContent && mainContent !== document.body) {
        mainContent.style.filter = 'blur(10px)';
        mainContent.style.pointerEvents = 'none';
      }

      const keyInput = document.getElementById('keyInput');
      const submitBtn = document.getElementById('submitKey');
      const generateKeyBtn = document.getElementById('generateKeyBtn');
      const testConnectionBtn = document.getElementById('testConnectionBtn');
      const keyError = document.getElementById('keyError');
      const statusDot = document.getElementById('statusDot');
      const statusText = document.getElementById('statusText');

      database.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
          statusDot.style.background = '#4ade80';
          statusText.textContent = 'Connected';
        } else {
          statusDot.style.background = '#ff4444';
          statusText.textContent = 'Disconnected';
        }
      });

      // Generate Key Button
      generateKeyBtn.addEventListener('click', function() {
        const newKey = KeyGenerator.generate();
        keyInput.value = newKey;
        KeyGenerator.copyToClipboard(newKey);
        keyError.style.color = '#4ade80';
        keyError.textContent = '✅ New key generated and copied to clipboard!';
        keyError.style.display = 'block';
        console.log('🔑 Generated new key:', newKey);
      });

      testConnectionBtn.addEventListener('click', async function() {
        testConnectionBtn.disabled = true;
        testConnectionBtn.textContent = 'Testing...';
        keyError.style.display = 'none';
        
        try {
          await database.ref('.info/connected').once('value');
          await database.ref('usedKeys').limitToFirst(1).once('value');
          
          const testRef = database.ref('connectionTest/' + Date.now());
          await testRef.set({ test: true, timestamp: Date.now() });
          await testRef.remove();
          
          keyError.style.color = '#4ade80';
          keyError.textContent = '✅ Connection working! Fingerprint ID ready.';
          keyError.style.display = 'block';
          
          testConnectionBtn.textContent = 'Test Connection';
          testConnectionBtn.disabled = false;
        } catch (error) {
          console.error('❌ Connection test failed:', error);
          keyError.style.color = '#ff4444';
          keyError.textContent = `❌ Connection failed: ${error.message}`;
          keyError.style.display = 'block';
          testConnectionBtn.textContent = 'Test Connection';
          testConnectionBtn.disabled = false;
        }
      });

      submitBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(79, 144, 255, 0.5)';
      });

      submitBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(79, 144, 255, 0.3)';
      });

      generateKeyBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.5)';
      });

      generateKeyBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
      });

      keyInput.addEventListener('focus', function() {
        this.style.borderColor = '#4f90ff';
        this.style.boxShadow = '0 0 0 3px rgba(79, 144, 255, 0.1)';
      });

      keyInput.addEventListener('blur', function() {
        this.style.borderColor = '#38415d';
        this.style.boxShadow = 'none';
      });

      async function verifyKey() {
        const enteredKey = keyInput.value.trim();
        
        if (!enteredKey) {
          keyError.textContent = '❌ Please enter a key';
          keyError.style.color = '#ff4444';
          keyError.style.display = 'block';
          keyInput.style.borderColor = '#ff4444';
          return;
        }

        if (!validKeys.includes(enteredKey)) {
          keyError.textContent = '❌ Invalid key';
          keyError.style.color = '#ff4444';
          keyError.style.display = 'block';
          keyInput.style.borderColor = '#ff4444';
          keyInput.value = '';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';
        submitBtn.style.cursor = 'wait';
        
        console.log('🔑 Verifying key with Fingerprint ID:', enteredKey);

        try {
          const normalizedSite = normalizeHostname(window.location.hostname || 'localhost');
          const actualSite = getActualWebsite(window.location.hostname || 'localhost');
          
          await database.ref('.info/connected').once('value');
          
          const keyRef = database.ref('usedKeys/' + enteredKey);
          const snapshot = await keyRef.once('value');
          
          if (snapshot.exists()) {
            const keyData = snapshot.val();
            
            // Check if fingerprint matches
            if (keyData.fingerprintId && keyData.fingerprintId !== fingerprintId) {
              keyError.textContent = '🚫 This key is registered to a different device/browser.';
              keyError.style.color = '#ff4444';
              keyError.style.display = 'block';
              keyInput.style.borderColor = '#ff4444';
              keyInput.value = '';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Verify Key';
              submitBtn.style.cursor = 'pointer';
              
              await database.ref('securityLogs/fingerprintMismatch/' + Date.now()).set({
                key: enteredKey,
                expectedFingerprint: keyData.fingerprintId?.substring(0, 16) + '...',
                attemptedFingerprint: fingerprintId.substring(0, 16) + '...',
                timestamp: Date.now(),
                date: new Date().toISOString(),
                severity: 'HIGH'
              });
              
              return;
            }
            
            // Fingerprint matches or not set yet - update and grant access
            console.log('✅ Key verified for this device');
            
            const websites = keyData.websites || [];
            if (!websites.includes(actualSite)) {
              await keyRef.update({
                websites: [...websites, actualSite],
                lastAccessed: new Date().toISOString(),
                lastAccessedSite: actualSite,
                timesAccessed: (keyData.timesAccessed || 0) + 1,
                fingerprintId: fingerprintId
              });
            } else {
              await keyRef.update({
                timesAccessed: (keyData.timesAccessed || 0) + 1,
                lastAccessed: new Date().toISOString(),
                lastAccessedSite: actualSite,
                fingerprintId: fingerprintId
              });
            }
          } else {
            // New key - register it
            console.log('🆕 New key! Registering with Fingerprint ID...');
            
            await keyRef.set({
              used: true,
              fingerprintId: fingerprintId,
              firstUsedOn: actualSite,
              firstUsedDate: new Date().toISOString(),
              firstUsedTimestamp: Date.now(),
              websites: [actualSite],
              timesAccessed: 1,
              lastAccessed: new Date().toISOString(),
              lastAccessedSite: actualSite,
              network: normalizedSite,
              claimedAcrossNetwork: true,
              authMethod: 'fingerprint',
              securityLevel: 'high'
            });
          }

          if (typeof window.WebsiteKeyTracker !== 'undefined') {
            window.WebsiteKeyTracker.trackKeyUsage(enteredKey, actualSite, fingerprintId);
          }

          keyError.style.color = '#4ade80';
          keyError.textContent = '✅ Access granted! Welcome to GalaxyVerse.';
          keyError.style.display = 'block';
          keyInput.style.borderColor = '#4ade80';
          submitBtn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
          submitBtn.textContent = 'Success!';

          console.log('✅ Key verified successfully');
          console.log('🔐 Fingerprint ID:', fingerprintId.substring(0, 16) + '...');

          setTimeout(() => {
            keyOverlay.style.opacity = '0';
            keyOverlay.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
              keyOverlay.remove();
              const mainContent = document.getElementById('app') || document.body;
              if (mainContent && mainContent !== document.body) {
                mainContent.style.filter = '';
                mainContent.style.pointerEvents = '';
              }
            }, 500);
          }, 1500);
        } catch (error) {
          console.error('❌ Firebase error:', error);
          
          let errorMessage = '❌ Connection error. ';
          if (error.code === 'PERMISSION_DENIED') {
            errorMessage += 'Database access denied.';
          } else if (error.message && error.message.includes('network')) {
            errorMessage += 'Network error.';
          } else {
            errorMessage += error.message || 'Please try again.';
          }
          
          keyError.textContent = errorMessage;
          keyError.style.color = '#ff4444';
          keyError.style.display = 'block';
          keyInput.style.borderColor = '#ff4444';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Verify Key';
          submitBtn.style.cursor = 'pointer';
        }
      }

      submitBtn.addEventListener('click', verifyKey);

      keyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          verifyKey();
        }
      });

      keyInput.focus();
    }

    initializeKeySystem();
  });
})();

// ===== ABOUT:BLANK CLOAKING =====
(function() {
  const aboutBlankEnabled = localStorage.getItem('aboutBlank');
  const isInAboutBlank = window.self !== window.top;
  
  if (aboutBlankEnabled === 'enabled' && !isInAboutBlank) {
    console.log('🔒 About:blank cloaking enabled');
    const currentURL = window.location.href;
    const win = window.open('about:blank', '_blank');
    
    if (win) {
      win.document.open();
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>New Tab</title>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌐</text></svg>">
        </head>
        <body style="margin:0;padding:0;overflow:hidden;">
          <iframe src="${currentURL}" style="position:fixed;top:0;left:0;width:100%;height:100%;border:none;"></iframe>
        </body>
        </html>
      `);
      win.document.close();
      window.location.replace('about:blank');
      window.close();
    }
  }
})();

// ===== TAB CLOAKING PRESETS =====
const presets = {
  google: { title: "Google", favicon: "https://www.google.com/favicon.ico" },
  classroom: { title: "Home", favicon: "https://ssl.gstatic.com/classroom/favicon.png" },
  bing: { title: "Bing", favicon: "https://bing.com/favicon.ico" },
  nearpod: { title: "Nearpod", favicon: "https://nearpod.com/favicon.ico" },
  powerschool: { title: "PowerSchool Sign In", favicon: "https://powerschool.com/favicon.ico" },
  edge: { title: "New Tab", favicon: "https://www.bing.com/favicon.ico" },
  chrome: { title: "New Tab", favicon: "https://www.google.com/favicon.ico" }
};

// ===== THEME CONFIGURATIONS =====
const themes = {
  original: { bgColor: '#121826', navColor: '#1e2433', accentColor: '#4f90ff', textColor: '#e0e6f1', borderColor: '#38415d', hoverBg: '#2a2f48', btnBg: '#3b466f', btnHoverBg: '#4f90ff' },
  halloween: { bgColor: '#0a0a0a', navColor: '#1a0f0a', accentColor: '#ff6600', textColor: '#ffa500', borderColor: '#331a00', hoverBg: '#2a1a0f', btnBg: '#4a2a1a', btnHoverBg: '#ff6600' },
  christmas: { bgColor: '#0a1a0a', navColor: '#1a2e1a', accentColor: '#c41e3a', textColor: '#f0f8ff', borderColor: '#2d5016', hoverBg: '#1f3d1f', btnBg: '#2d5016', btnHoverBg: '#c41e3a' },
  dark: { bgColor: '#0a0a0a', navColor: '#1a1a1a', accentColor: '#00ff00', textColor: '#ffffff', borderColor: '#333333', hoverBg: '#2a2a2a', btnBg: '#262626', btnHoverBg: '#00ff00' },
  light: { bgColor: '#f5f5f5', navColor: '#ffffff', accentColor: '#2563eb', textColor: '#1f2937', borderColor: '#e5e7eb', hoverBg: '#e5e7eb', btnBg: '#d1d5db', btnHoverBg: '#2563eb' },
  midnight: { bgColor: '#0f0f23', navColor: '#1a1a2e', accentColor: '#9d4edd', textColor: '#e0e0e0', borderColor: '#3c3c5a', hoverBg: '#2a2a4e', btnBg: '#3c3c6f', btnHoverBg: '#9d4edd' },
  ocean: { bgColor: '#001f3f', navColor: '#0a2f4f', accentColor: '#00d4ff', textColor: '#cfe2f3', borderColor: '#1a4f6f', hoverBg: '#1a3f5f', btnBg: '#2a5f7f', btnHoverBg: '#00d4ff' },
  sunset: { bgColor: '#2d1b2e', navColor: '#3d2b3e', accentColor: '#ff6b9d', textColor: '#fce4ec', borderColor: '#5d4b5e', hoverBg: '#4d3b4e', btnBg: '#6d5b6e', btnHoverBg: '#ff6b9d' },
  forest: { bgColor: '#1a2f1a', navColor: '#2a3f2a', accentColor: '#7cb342', textColor: '#e8f5e9', borderColor: '#3a5f3a', hoverBg: '#3a4f3a', btnBg: '#4a6f4a', btnHoverBg: '#7cb342' },
  purple: { bgColor: '#1a0a2e', navColor: '#2a1a3e', accentColor: '#b744f7', textColor: '#f0e6ff', borderColor: '#4a3a5e', hoverBg: '#3a2a4e', btnBg: '#5a4a6e', btnHoverBg: '#b744f7' },
  cyberpunk: { bgColor: '#0d0221', navColor: '#1a0b3a', accentColor: '#ff006e', textColor: '#00f5ff', borderColor: '#8338ec', hoverBg: '#2a1a4a', btnBg: '#3a2a5a', btnHoverBg: '#ff006e' },
  matrix: { bgColor: '#000000', navColor: '#0a1a0a', accentColor: '#00ff41', textColor: '#00ff41', borderColor: '#003b00', hoverBg: '#0a2a0a', btnBg: '#1a3a1a', btnHoverBg: '#00ff41' },
  neon: { bgColor: '#1a0033', navColor: '#2a0a4a', accentColor: '#ff00ff', textColor: '#00ffff', borderColor: '#4a1a6a', hoverBg: '#3a1a5a', btnBg: '#5a2a7a', btnHoverBg: '#ff00ff' },
  fire: { bgColor: '#1a0a00', navColor: '#2a1a0a', accentColor: '#ff4500', textColor: '#ffe4b5', borderColor: '#4a2a1a', hoverBg: '#3a1a0a', btnBg: '#5a3a2a', btnHoverBg: '#ff4500' },
  ice: { bgColor: '#0a1a2a', navColor: '#1a2a3a', accentColor: '#00bfff', textColor: '#e0f7ff', borderColor: '#2a3a4a', hoverBg: '#1a2a3a', btnBg: '#2a4a5a', btnHoverBg: '#00bfff' },
  retro: { bgColor: '#2b1b17', navColor: '#3d2b27', accentColor: '#ff9966', textColor: '#ffeaa7', borderColor: '#5d4b47', hoverBg: '#4d3b37', btnBg: '#6d5b57', btnHoverBg: '#ff9966' }
};

// ===== SNOW EFFECT =====
let snowEnabled = true;
let snowInterval = null;

function createSnowflake() {
  if (!snowEnabled) return;
  
  const snowflake = document.createElement('div');
  snowflake.classList.add('snowflake');
  const size = Math.random() * 4 + 2;
  snowflake.style.width = `${size}px`;
  snowflake.style.height = `${size}px`;
  snowflake.style.left = `${Math.random() * window.innerWidth}px`;
  const fallDuration = Math.random() * 10 + 5;
  snowflake.style.animationDuration = `${fallDuration}s`;
  snowflake.style.animationDelay = `${Math.random() * 15}s`;
  snowflake.style.opacity = (Math.random() * 0.5 + 0.3).toFixed(2);
  
  const snowContainer = document.getElementById('snow-container');
  if (snowContainer) {
    snowContainer.appendChild(snowflake);
    setTimeout(() => { 
      if (snowflake.parentNode) {
        snowflake.remove(); 
      }
    }, (fallDuration + 15) * 1000);
  }
}

function startSnow() {
  if (snowInterval) return;
  snowEnabled = true;
  snowInterval = setInterval(createSnowflake, 200);
  console.log('❄️ Snow effect started');
}

function stopSnow() {
  snowEnabled = false;
  if (snowInterval) {
    clearInterval(snowInterval);
    snowInterval = null;
  }
  const snowContainer = document.getElementById('snow-container');
  if (snowContainer) snowContainer.innerHTML = '';
  console.log('🛑 Snow effect stopped');
}

// ===== TAB CLOAKING =====
function applyTabCloaking(title, favicon) {
  if (title) {
    document.title = title;
    localStorage.setItem('TabCloak_Title', title);
    console.log('🔖 Tab title changed to:', title);
  }
  if (favicon) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
    localStorage.setItem('TabCloak_Favicon', favicon);
    console.log('🖼️ Tab favicon changed to:', favicon);
  }
}

// ===== THEME SYSTEM =====
function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) {
    console.warn('⚠️ Theme not found:', themeName);
    return;
  }
  console.log('🎨 Applying theme:', themeName);
  const root = document.documentElement;
  root.style.setProperty('--bg-color', theme.bgColor);
  root.style.setProperty('--nav-color', theme.navColor);
  root.style.setProperty('--accent-color', theme.accentColor);
  root.style.setProperty('--text-color', theme.textColor);
  root.style.setProperty('--border-color', theme.borderColor);
  root.style.setProperty('--hover-bg', theme.hoverBg);
  root.style.setProperty('--btn-bg', theme.btnBg);
  root.style.setProperty('--btn-hover-bg', theme.btnHoverBg);
}

// ===== LOAD SETTINGS =====
function loadSettings() {
  console.log('⚙️ Loading settings...');
  
  let themeToUse = 'original';
  const savedTheme = localStorage.getItem('selectedTheme');
  
  if (!savedTheme && shouldAutoApplySeasonalTheme()) {
    themeToUse = getSeasonalTheme();
    console.log('🎨 Auto-applying seasonal theme:', themeToUse);
  } else if (savedTheme) {
    themeToUse = savedTheme;
    console.log('🎨 Using saved theme:', themeToUse);
  }

  const savedTitle = localStorage.getItem('TabCloak_Title');
  const savedFavicon = localStorage.getItem('TabCloak_Favicon');
  const savedSnow = localStorage.getItem('snowEffect');
  const savedHotkey = localStorage.getItem('hotkey') || '`';
  const savedRedirect = localStorage.getItem('redirectURL') || 'https://google.com';
  const savedAboutBlank = localStorage.getItem('aboutBlank');

  if (savedTitle) {
    document.title = savedTitle;
    const titleInput = document.getElementById('customTitle');
    if (titleInput) titleInput.value = savedTitle;
  }

  if (savedFavicon) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = savedFavicon;
    const faviconInput = document.getElementById('customFavicon');
    if (faviconInput) faviconInput.value = savedFavicon;
  }

  if (savedSnow === 'disabled') {
    snowEnabled = false;
    const snowToggle = document.getElementById('snowToggle');
    if (snowToggle) snowToggle.checked = false;
    stopSnow();
  } else {
    startSnow();
  }

  const hotkeyInput = document.getElementById('hotkey-input');
  const redirectInput = document.getElementById('redirect-url-input');
  if (hotkeyInput) hotkeyInput.value = savedHotkey;
  if (redirectInput) redirectInput.value = savedRedirect;

  const aboutBlankToggle = document.getElementById('aboutBlankToggle');
  if (aboutBlankToggle) {
    aboutBlankToggle.checked = savedAboutBlank === 'enabled';
  }

  applyTheme(themeToUse);
  console.log('✅ Settings loaded successfully');
}

// ===== PANIC BUTTON =====
function setupPanicButton() {
  const savedHotkey = localStorage.getItem('hotkey') || '`';
  const savedRedirect = localStorage.getItem('redirectURL') || 'https://google.com';
  
  console.log('🚨 Panic button setup - Hotkey:', savedHotkey);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === savedHotkey) {
      console.log('🚨 Panic button activated!');
      window.location.href = savedRedirect;
    }
  });
  
  const changeHotkeyBtn = document.getElementById('change-hotkey-btn');
  const hotkeyInput = document.getElementById('hotkey-input');
  
  if (changeHotkeyBtn && hotkeyInput) {
    changeHotkeyBtn.addEventListener('click', () => {
      hotkeyInput.focus();
      hotkeyInput.placeholder = 'Press a key...';
    });
  }
  
  if (hotkeyInput) {
    hotkeyInput.addEventListener('keydown', (e) => {
      e.preventDefault();
      if (e.key.length === 1 || e.key === 'Escape' || /^F\d{1,2}$/.test(e.key)) {
        hotkeyInput.value = e.key;
        localStorage.setItem('hotkey', e.key);
        hotkeyInput.blur();
        console.log('🔑 Hotkey changed to:', e.key);
      }
    });
  }
  
  const changeURLBtn = document.getElementById('change-URL-btn');
  const redirectInput = document.getElementById('redirect-url-input');
  
  if (changeURLBtn && redirectInput) {
    changeURLBtn.addEventListener('click', () => {
      const url = redirectInput.value.trim();
      if (url) {
        localStorage.setItem('redirectURL', url);
        console.log('🔗 Redirect URL changed to:', url);
        alert('Redirect URL updated!');
      }
    });
  }
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function hideAll() {
  document.querySelectorAll('.content').forEach(c => (c.style.display = 'none'));
  document.querySelectorAll('.navbar li a').forEach(link => link.classList.remove('active'));
  const infoButtons = document.querySelector('.homepage-info-buttons');
  if (infoButtons) infoButtons.style.display = 'none';
}

// ===== GAME OF THE DAY =====
function displayGameOfTheDay() {
  console.log('🎮 Displaying Game of the Day');
  const gotdContainer = document.getElementById('game-of-the-day-container');
  if (!gotdContainer) return;
  
  if (typeof getGameOfTheDay !== 'function') {
    console.error('❌ getGameOfTheDay not found');
    return;
  }
  
  try {
    const game = getGameOfTheDay();
    if (!game) return;
    
    gotdContainer.innerHTML = `
      <div class="gotd-card">
        <div class="gotd-badge">🌟 Game of the Day</div>
        <img src="${game.image}" alt="${game.name}" loading="lazy" />
        <h3>${game.name}</h3>
        <button class="gotd-play-btn" onclick="loadGame('${game.url}')">Play Now</button>
      </div>
    `;
  } catch (error) {
    console.error('❌ Error displaying Game of the Day:', error);
  }
}

// ===== NAVIGATION FUNCTIONS =====
function showHome() {
  hideAll();
  const homeContent = document.getElementById('content-home');
  if (homeContent) homeContent.style.display = 'block';
  const homeLink = document.getElementById('homeLink');
  if (homeLink) homeLink.classList.add('active');
  const infoButtons = document.querySelector('.homepage-info-buttons');
  if (infoButtons) infoButtons.style.display = 'flex';
  displayGameOfTheDay();
}

function showGames() {
  hideAll();
  const gamesContent = document.getElementById('content-gms');
  if (gamesContent) gamesContent.style.display = 'block';
  const gameLink = document.getElementById('gameLink');
  if (gameLink) gameLink.classList.add('active');
  
  if (!document.querySelector('.game-filters') && window.GameStats) {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      const filtersHTML = window.GameStats.createFilterButtons();
      searchContainer.insertAdjacentHTML('afterend', filtersHTML);
    }
  }
  
  if (typeof games !== 'undefined' && Array.isArray(games)) {
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter) {
      const filter = activeFilter.dataset.filter;
      window.filterGames(filter);
    } else {
      renderGames(games);
    }
  }
}

function showApps() {
  hideAll();
  const appsContent = document.getElementById('content-aps');
  if (appsContent) appsContent.style.display = 'block';
  const appsLink = document.getElementById('appsLink');
  if (appsLink) appsLink.classList.add('active');
  
  if (typeof apps !== 'undefined' && Array.isArray(apps)) {
    renderApps(apps);
  }
}

function showWebsites() {
  hideAll();
  const websitesContent = document.getElementById('content-websites');
  if (websitesContent) websitesContent.style.display = 'block';
  const websitesLink = document.getElementById('websitesLink');
  if (websitesLink) websitesLink.classList.add('active');
  
  if (typeof websites !== 'undefined' && Array.isArray(websites)) {
    renderWebsites(websites);
  }
}

function showAbout() {
  hideAll();
  const aboutContent = document.getElementById('content-about');
  if (aboutContent) aboutContent.style.display = 'block';
  const aboutLink = document.getElementById('aboutLink');
  if (aboutLink) aboutLink.classList.add('active');
}

function showSettings() {
  hideAll();
  const settingsContent = document.getElementById('content-settings');
  if (settingsContent) settingsContent.style.display = 'block';
  const settingsLink = document.getElementById('settingsLink');
  if (settingsLink) settingsLink.classList.add('active');
}

// ===== RENDER FUNCTIONS =====
function renderGames(gamesToRender) {
  const gameList = document.getElementById('game-list');
  if (!gameList) return;
  
  gameList.innerHTML = '';
  
  if (!gamesToRender || gamesToRender.length === 0) {
    gameList.innerHTML = '<p style="padding: 20px; text-align: center;">No games found.</p>';
    return;
  }
  
  gamesToRender.forEach(game => {
    if (!game || !game.name || !game.url) return;
    
    const isFavorited = window.GameStats ? window.GameStats.isFavorite(game.url) : false;
    
    const card = document.createElement('div');
    card.className = 'game-card';
    card.tabIndex = 0;
    card.innerHTML = `
      ${window.GameStats ? window.GameStats.createFavoriteButton(game.url, isFavorited) : ''}
      <img src="${game.image || 'https://via.placeholder.com/250x250?text=Game'}" alt="${game.name}" loading="lazy" />
      <h3>${game.name}</h3>
    `;
    card.onclick = () => loadGame(game.url);
    card.onkeypress = (e) => { if (e.key === 'Enter') loadGame(game.url); };
    gameList.appendChild(card);
  });
}

function renderApps(appsToRender) {
  const appList = document.getElementById('app-list');
  if (!appList) return;
  
  appList.innerHTML = '';
  
  if (!appsToRender || appsToRender.length === 0) {
    appList.innerHTML = '<p>No apps found.</p>';
    return;
  }
  
  appsToRender.forEach(app => {
    if (!app || !app.name || !app.url) return;
    
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <img src="${app.image || 'https://via.placeholder.com/250x250?text=App'}" alt="${app.name}" loading="lazy" />
      <h3>${app.name}</h3>
    `;
    card.onclick = () => loadGame(app.url);
    appList.appendChild(card);
  });
}

function renderWebsites(websitesToRender) {
  const websitesList = document.getElementById('websites-list');
  if (!websitesList) return;
  
  websitesList.innerHTML = '';
  
  if (!websitesToRender || websitesToRender.length === 0) {
    websitesList.innerHTML = '<p>No websites found.</p>';
    return;
  }
  
  const list = document.createElement('ul');
  list.style.cssText = 'list-style: none; padding: 20px; max-width: 800px; margin: 0 auto;';
  
  websitesToRender.forEach(website => {
    if (!website || !website.name || !website.url) return;
    
    const listItem = document.createElement('li');
    listItem.style.cssText = 'padding: 15px; margin-bottom: 10px; background: var(--nav-color); border: 1px solid var(--border-color); border-radius: 8px; transition: all 0.3s ease;';
    
    listItem.innerHTML = `
      <a href="${website.url}" target="_blank" style="color: var(--accent-color); text-decoration: none; font-size: 18px; display: flex; align-items: center; gap: 10px;">
        <span>🔗</span>
        <div>
          <div style="font-weight: 600;">${website.name}</div>
          <div style="font-size: 14px; color: var(--text-color); opacity: 0.7; margin-top: 4px;">${website.url}</div>
        </div>
      </a>
    `;
    
    listItem.addEventListener('mouseenter', function() {
      this.style.background = 'var(--hover-bg)';
      this.style.borderColor = 'var(--accent-color)';
      this.style.transform = 'translateX(5px)';
    });
    
    listItem.addEventListener('mouseleave', function() {
      this.style.background = 'var(--nav-color)';
      this.style.borderColor = 'var(--border-color)';
      this.style.transform = 'translateX(0)';
    });
    
    list.appendChild(listItem);
  });
  
  websitesList.appendChild(list);
}

function loadGame(url) {
  if (!url) {
    console.error('❌ No URL provided');
    alert('Error: Game URL is missing.');
    return;
  }
  
  console.log('🎮 Loading game:', url);
  
  try {
    const isYouTube = url.includes('/others/assets/apps/YouTube.html') || url.includes('youtu.be');
    
    if (isYouTube) {
      window.open(url, '_blank');
      console.log('▶️ Opening YouTube in new tab');
      return;
    }
    
    hideAll();
    const gameDisplay = document.getElementById('game-display');
    const gameIframe = document.getElementById('game-iframe');
    
    if (!gameDisplay || !gameIframe) {
      console.error('❌ Game display elements not found');
      alert('Error: Unable to load game.');
      return;
    }
    
    if (window.GameStats) {
      window.GameStats.stopTracking();
    }
    
    gameIframe.src = '';
    gameIframe.src = url;
    gameDisplay.style.display = 'block';
    
    gameIframe.onload = function() {
      console.log('✅ Game loaded successfully');
      if (window.GameStats) {
        window.GameStats.startTracking(url);
      }
    };
    
    gameIframe.onerror = function() {
      console.error('❌ Failed to load game:', url);
      alert('Error loading game.');
    };
  } catch (error) {
    console.error('❌ Error in loadGame:', error);
    alert('An error occurred while loading the game.');
  }
}

function searchGames() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase().trim();
  console.log('🔍 Searching games for:', query);
  
  if (typeof games === 'undefined' || !Array.isArray(games)) {
    console.error('❌ games array not found');
    return;
  }
  
  if (!query) {
    renderGames(games);
    return;
  }
  
  const filtered = games.filter(game => game && game.name && game.name.toLowerCase().includes(query));
  console.log('✅ Found', filtered.length, 'matching games');
  renderGames(filtered);
}

function searchWebsites() {
  const searchInput = document.getElementById('websitesSearchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase().trim();
  
  if (typeof websites === 'undefined' || !Array.isArray(websites)) {
    console.error('❌ websites array not found');
    return;
  }
  
  if (!query) {
    renderWebsites(websites);
    return;
  }
  
  const filtered = websites.filter(site => site && site.name && site.name.toLowerCase().includes(query));
  renderWebsites(filtered);
}

function toggleFullscreen() {
  const gameIframe = document.getElementById('game-iframe');
  if (!gameIframe) return;
  
  try {
    if (!document.fullscreenElement) {
      gameIframe.requestFullscreen().catch(err => {
        console.error('❌ Fullscreen error:', err);
        alert('Fullscreen not available. Click on the game first.');
      });
    } else {
      document.exitFullscreen();
    }
  } catch (error) {
    console.error('❌ Fullscreen error:', error);
  }
}

// ===== INITIALIZATION =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  try {
    console.log('🚀 Initializing GalaxyVerse with Fingerprint ID System...');
    console.log('🛡️ Security: Browser Fingerprint Authentication');
    console.log('🔑 Manual key entry required each session');
    console.log('📊 Console Status:', {
      available: !!window.GVerseConsole,
      initialized: window.GVerseConsole?.initialized || false,
      isOpen: window.GVerseConsole?.isOpen || false,
      logCount: window.GVerseConsole?.logs?.length || 0
    });
  
  loadSettings();
  showHome();
  setupPanicButton();

  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      themeSelect.value = savedTheme;
    } else if (shouldAutoApplySeasonalTheme()) {
      themeSelect.value = getSeasonalTheme();
    } else {
      themeSelect.value = 'original';
    }
    
    themeSelect.addEventListener('change', (e) => {
      const theme = e.target.value;
      applyTheme(theme);
      localStorage.setItem('selectedTheme', theme);
      console.log('🎨 Theme manually selected:', theme);
    });
  }

  const creditsBtn = document.getElementById('creditsBtn');
  const updateLogBtn = document.getElementById('updateLogBtn');
  const creditsModal = document.getElementById('creditsModal');
  const updateLogModal = document.getElementById('updateLogModal');

  if (creditsBtn && creditsModal) {
    creditsBtn.addEventListener('click', () => {
      creditsModal.style.display = 'block';
    });
  }

  if (updateLogBtn && updateLogModal) {
    updateLogBtn.addEventListener('click', () => {
      updateLogModal.style.display = 'block';
    });
  }

  document.querySelectorAll('.info-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal');
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        modalElement.style.display = 'none';
      }
    });
  });

  window.onclick = (e) => {
    if (e.target.classList.contains('info-modal')) {
      e.target.style.display = 'none';
    }
  };

  const applyBtn = document.getElementById('applyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const titleInput = document.getElementById('customTitle');
      const faviconInput = document.getElementById('customFavicon');
      const title = titleInput ? titleInput.value.trim() : '';
      const favicon = faviconInput ? faviconInput.value.trim() : '';
      applyTabCloaking(title, favicon);
      alert('Tab cloaking applied!');
    });
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('TabCloak_Title');
      localStorage.removeItem('TabCloak_Favicon');
      document.title = 'GalaxyVerse';
      const link = document.querySelector("link[rel~='icon']");
      if (link) link.href = '';
      const titleInput = document.getElementById('customTitle');
      const faviconInput = document.getElementById('customFavicon');
      if (titleInput) titleInput.value = '';
      if (faviconInput) faviconInput.value = '';
      const presetSelect = document.getElementById('presetSelect');
      if (presetSelect) presetSelect.value = '';
      alert('Tab cloaking reset!');
    });
  }

  const presetSelect = document.getElementById('presetSelect');
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      const selected = presets[e.target.value];
      if (selected) {
        const titleInput = document.getElementById('customTitle');
        const faviconInput = document.getElementById('customFavicon');
        if (titleInput) titleInput.value = selected.title;
        if (faviconInput) faviconInput.value = selected.favicon;
        applyTabCloaking(selected.title, selected.favicon);
      }
    });
  }

  const snowToggle = document.getElementById('snowToggle');
  if (snowToggle) {
    snowToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        localStorage.setItem('snowEffect', 'enabled');
        startSnow();
      } else {
        localStorage.setItem('snowEffect', 'disabled');
        stopSnow();
      }
    });
  }

  const aboutBlankToggle = document.getElementById('aboutBlankToggle');
  if (aboutBlankToggle) {
    aboutBlankToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        localStorage.setItem('aboutBlank', 'enabled');
      } else {
        localStorage.removeItem('aboutBlank');
      }
    });
  }

  // Navigation
  const homeLink = document.getElementById('homeLink');
  const gameLink = document.getElementById('gameLink');
  const appsLink = document.getElementById('appsLink');
  const websitesLink = document.getElementById('websitesLink');
  const settingsLink = document.getElementById('settingsLink');
  const aboutLink = document.getElementById('aboutLink');

  if (homeLink) homeLink.addEventListener('click', (e) => { e.preventDefault(); showHome(); });
  if (gameLink) gameLink.addEventListener('click', (e) => { e.preventDefault(); showGames(); });
  if (appsLink) appsLink.addEventListener('click', (e) => { e.preventDefault(); showApps(); });
  if (websitesLink) websitesLink.addEventListener('click', (e) => { e.preventDefault(); showWebsites(); });
  if (settingsLink) settingsLink.addEventListener('click', (e) => { e.preventDefault(); showSettings(); });
  if (aboutLink) aboutLink.addEventListener('click', (e) => { e.preventDefault(); showAbout(); });

  // Back buttons
  const backToHomeGame = document.getElementById('backToHomeGame');
  const backToHomeApps = document.getElementById('backToHomeApps');
  const backToHomeWebsites = document.getElementById('backToHomeWebsites');
  
  if (backToHomeGame) {
    backToHomeGame.addEventListener('click', () => {
      if (window.GameStats) {
        window.GameStats.stopTracking();
      }
      showHome();
    });
  }
  
  if (backToHomeApps) {
    backToHomeApps.addEventListener('click', () => showHome());
  }
  
  if (backToHomeWebsites) {
    backToHomeWebsites.addEventListener('click', () => showHome());
  }

  // Search
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', searchGames);
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchGames();
    });
    searchInput.addEventListener('input', debounce(searchGames, 300));
  }

  // Websites search
  const websitesSearchBtn = document.getElementById('websitesSearchBtn');
  const websitesSearchInput = document.getElementById('websitesSearchInput');
  
  if (websitesSearchBtn) {
    websitesSearchBtn.addEventListener('click', searchWebsites);
  }
  
  if (websitesSearchInput) {
    websitesSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchWebsites();
    });
    websitesSearchInput.addEventListener('input', debounce(searchWebsites, 300));
  }

  // Fullscreen
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  console.log('✅ GalaxyVerse initialized with Fingerprint ID System');
  console.log('📊 Console active - Press Ctrl+Shift+K to toggle');
  console.log('🛡️ Security: Browser Fingerprint Authentication');
  console.log('🔑 Manual key entry required each session');
  console.log('🔐 Each key is bound to your browser fingerprint');
  console.log('🌐 Cross-domain system: Keys work automatically across ALL GalaxyVerse sites');
  console.log('✨ Key generator available - Firebase compatible (no special chars: . $ # [ ] / \\ quotes)');
  
  } catch (error) {
    console.error('❌ Critical error during initialization:', error);
    alert('An error occurred during initialization. Check console.');
  }
}
