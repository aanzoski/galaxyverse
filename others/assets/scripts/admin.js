// HELLA SKIDDED

// ===== ADMIN PANEL SYSTEM WITH OWNER HIERARCHY =====
(function() {
  console.log('👑 Admin Panel System Loading...');

  // Owner keys - highest privilege level, can manage admin keys
  const OWNER_KEYS = [
    'azthedev',
    'aanzoski'
  ];

  // Admin keys - can manage regular keys but not admin/owner keys
  const ADMIN_KEYS = [
    'jordanthedev',
    'ghostisnot',
    'MichaelIsKronos'
  ];

  window.AdminPanel = {
    initialized: false,
    isAdmin: false,
    isOwner: false,
    currentAdminKey: null,
    userRole: null,

    init: function() {
      if (this.initialized) return;
      this.initialized = true;
      console.log('👑 Admin Panel initialized');
      this.setupAdminSection();
    },

    setupAdminSection: function() {
      const settingsContainer = document.querySelector('.settings-page-container');
      if (!settingsContainer) {
        console.warn('⚠️ Settings container not found');
        return;
      }

      // Add admin section to settings
      const adminSection = document.createElement('div');
      adminSection.className = 'settings-section';
      adminSection.innerHTML = `
        <h3>👑 Admin Panel</h3>
        <div id="admin-auth-container">
          <div class="setting-item">
            <label for="admin-key-input">Admin/Owner Key:</label>
            <input type="password" id="admin-key-input" placeholder="Enter admin or owner key" />
            <button id="admin-login-btn" class="btn-small">Login</button>
          </div>
          <div id="admin-error" style="color: #ff4444; margin-top: 10px; display: none;"></div>
        </div>
        
        <div id="admin-panel-content" style="display: none;">
          <div style="background: rgba(79, 144, 255, 0.1); border: 1px solid rgba(79, 144, 255, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <div style="color: #4ade80; font-weight: bold; margin-bottom: 10px;">✅ Access Granted</div>
            <div style="font-size: 14px; color: var(--text-color);">
              Logged in as: <span id="admin-key-display" style="color: #4f90ff;"></span>
              <span id="admin-role-badge" style="margin-left: 10px; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;"></span>
            </div>
            <button id="admin-logout-btn" class="btn-small" style="margin-top: 10px; background: #ff4444;">Logout</button>
          </div>

          <!-- Key Management -->
          <div class="admin-subsection">
            <h4>🔑 Key Management</h4>
            
            <!-- Add New Key -->
            <div class="setting-item" style="border: 1px solid var(--border-color); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <label style="font-weight: bold;">Add New Key:</label>
              <input type="text" id="new-key-input" placeholder="Enter new key (or generate)" style="margin-top: 8px;" />
              <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button id="generate-admin-key-btn" class="btn-small" style="background: #22c55e;">Generate Key</button>
                <button id="add-key-btn" class="btn-primary">Add Key</button>
              </div>
            </div>

            <!-- Remove Key -->
            <div class="setting-item" style="border: 1px solid var(--border-color); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <label style="font-weight: bold;">Remove Key:</label>
              <input type="text" id="remove-key-input" placeholder="Enter key to remove" style="margin-top: 8px;" />
              <button id="remove-key-btn" class="btn-small" style="background: #ff4444; margin-top: 10px;">Remove Key</button>
              <div id="remove-key-warning" style="font-size: 12px; margin-top: 8px; color: #ff9966; display: none;">
                ⚠️ Only owners can remove admin keys
              </div>
            </div>

            <!-- View All Keys -->
            <div class="setting-item">
              <button id="view-keys-btn" class="btn-primary">View All Keys</button>
              <button id="refresh-keys-btn" class="btn-small" style="margin-left: 10px;">Refresh</button>
            </div>
            
            <div id="keys-list-container" style="display: none; margin-top: 15px; max-height: 400px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px;">
              <h5 style="margin-top: 0;">Active Keys:</h5>
              <div id="keys-list"></div>
            </div>
          </div>

          <!-- Security Logs -->
          <div class="admin-subsection" style="margin-top: 30px;">
            <h4>🛡️ Security Logs</h4>
            <button id="view-security-logs-btn" class="btn-primary">View Security Logs</button>
            <div id="security-logs-container" style="display: none; margin-top: 15px; max-height: 400px; overflow-y: auto; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px;">
              <div id="security-logs-list"></div>
            </div>
          </div>

          <!-- Statistics -->
          <div class="admin-subsection" style="margin-top: 30px;">
            <h4>📊 Statistics</h4>
            <button id="view-stats-btn" class="btn-primary">View Key Statistics</button>
            <div id="stats-container" style="display: none; margin-top: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 15px;">
              <div id="stats-display"></div>
            </div>
          </div>
        </div>
      `;

      settingsContainer.appendChild(adminSection);
      this.attachEventListeners();
    },

    attachEventListeners: function() {
      const adminLoginBtn = document.getElementById('admin-login-btn');
      const adminKeyInput = document.getElementById('admin-key-input');
      const adminLogoutBtn = document.getElementById('admin-logout-btn');
      const addKeyBtn = document.getElementById('add-key-btn');
      const removeKeyBtn = document.getElementById('remove-key-btn');
      const viewKeysBtn = document.getElementById('view-keys-btn');
      const refreshKeysBtn = document.getElementById('refresh-keys-btn');
      const generateAdminKeyBtn = document.getElementById('generate-admin-key-btn');
      const viewSecurityLogsBtn = document.getElementById('view-security-logs-btn');
      const viewStatsBtn = document.getElementById('view-stats-btn');

      if (adminLoginBtn && adminKeyInput) {
        adminLoginBtn.addEventListener('click', () => this.login());
        adminKeyInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.login();
        });
      }

      if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => this.logout());
      }

      if (addKeyBtn) {
        addKeyBtn.addEventListener('click', () => this.addKey());
      }

      if (removeKeyBtn) {
        removeKeyBtn.addEventListener('click', () => this.removeKey());
      }

      if (viewKeysBtn) {
        viewKeysBtn.addEventListener('click', () => this.viewAllKeys());
      }

      if (refreshKeysBtn) {
        refreshKeysBtn.addEventListener('click', () => this.viewAllKeys());
      }

      if (generateAdminKeyBtn) {
        generateAdminKeyBtn.addEventListener('click', () => this.generateKey());
      }

      if (viewSecurityLogsBtn) {
        viewSecurityLogsBtn.addEventListener('click', () => this.viewSecurityLogs());
      }

      if (viewStatsBtn) {
        viewStatsBtn.addEventListener('click', () => this.viewStatistics());
      }
    },

    login: async function() {
      const adminKeyInput = document.getElementById('admin-key-input');
      const adminError = document.getElementById('admin-error');
      const key = adminKeyInput.value.trim();

      if (!key) {
        this.showError('Please enter a key');
        return;
      }

      // Check if owner
      if (OWNER_KEYS.includes(key)) {
        this.isOwner = true;
        this.isAdmin = true;
        this.userRole = 'OWNER';
        this.currentAdminKey = key;
        this.showPanel(key, 'OWNER');
        console.log('👑 Owner logged in:', key);
        return;
      }

      // Check if admin
      if (ADMIN_KEYS.includes(key)) {
        this.isOwner = false;
        this.isAdmin = true;
        this.userRole = 'ADMIN';
        this.currentAdminKey = key;
        this.showPanel(key, 'ADMIN');
        console.log('👑 Admin logged in:', key);
        return;
      }

      // Check Firebase for valid keys (both used and generated)
      try {
        const database = firebase.database();
        
        // Check in usedKeys
        const usedSnapshot = await database.ref('usedKeys/' + key).once('value');
        if (usedSnapshot.exists()) {
          this.isOwner = false;
          this.isAdmin = false;
          this.userRole = 'USER';
          this.currentAdminKey = key;
          this.showError('This is a user key, not an admin key');
          adminKeyInput.value = '';
          return;
        }

        // Check in generatedKeys
        const genSnapshot = await database.ref('generatedKeys/' + key).once('value');
        if (genSnapshot.exists()) {
          this.isOwner = false;
          this.isAdmin = false;
          this.userRole = 'USER';
          this.currentAdminKey = key;
          this.showError('This is a user key, not an admin key');
          adminKeyInput.value = '';
          return;
        }

        // Invalid key - not found anywhere
        this.showError('Invalid key');
        adminKeyInput.value = '';
      } catch (error) {
        console.error('❌ Error checking key:', error);
        this.showError('Error validating key');
        adminKeyInput.value = '';
      }
    },

    showPanel: function(key, role) {
      document.getElementById('admin-auth-container').style.display = 'none';
      document.getElementById('admin-panel-content').style.display = 'block';
      document.getElementById('admin-key-display').textContent = key;
      
      const roleBadge = document.getElementById('admin-role-badge');
      if (role === 'OWNER') {
        roleBadge.textContent = '👑 OWNER';
        roleBadge.style.background = 'linear-gradient(135deg, #ffd700, #ffed4e)';
        roleBadge.style.color = '#000';
      } else {
        roleBadge.textContent = '🔑 ADMIN';
        roleBadge.style.background = 'rgba(79, 144, 255, 0.3)';
        roleBadge.style.color = '#4f90ff';
      }
      
      const adminError = document.getElementById('admin-error');
      if (adminError) adminError.style.display = 'none';
    },

    logout: function() {
      this.isAdmin = false;
      this.isOwner = false;
      this.currentAdminKey = null;
      this.userRole = null;
      
      document.getElementById('admin-auth-container').style.display = 'block';
      document.getElementById('admin-panel-content').style.display = 'none';
      document.getElementById('admin-key-input').value = '';
      
      // Hide all containers
      document.getElementById('keys-list-container').style.display = 'none';
      document.getElementById('security-logs-container').style.display = 'none';
      document.getElementById('stats-container').style.display = 'none';
      
      console.log('👑 Logged out');
    },

    showError: function(message) {
      const adminError = document.getElementById('admin-error');
      if (adminError) {
        adminError.textContent = '❌ ' + message;
        adminError.style.display = 'block';
        setTimeout(() => {
          adminError.style.display = 'none';
        }, 3000);
      }
    },

    showSuccess: function(message) {
      const adminError = document.getElementById('admin-error');
      if (adminError) {
        adminError.style.color = '#4ade80';
        adminError.textContent = '✅ ' + message;
        adminError.style.display = 'block';
        setTimeout(() => {
          adminError.style.display = 'none';
          adminError.style.color = '#ff4444';
        }, 3000);
      }
    },

    isValidFirebaseKey: function(key) {
      // Firebase Realtime Database keys cannot contain: . $ # [ ] / \ or quotes
      const invalidChars = /[.$#\[\]\/\\'"]/;
      return !invalidChars.test(key);
    },

    generateKey: function() {
      if (!this.isAdmin) return;
      
      const newKeyInput = document.getElementById('new-key-input');
      const key = window.KeyGenerator ? window.KeyGenerator.generate() : this.fallbackGenerateKey();
      
      if (newKeyInput) {
        newKeyInput.value = key;
      }
      
      // Copy to clipboard
      if (window.KeyGenerator) {
        window.KeyGenerator.copyToClipboard(key);
      } else {
        // Fallback clipboard copy
        try {
          navigator.clipboard.writeText(key);
        } catch (err) {
          console.warn('Could not copy to clipboard:', err);
        }
      }
      
      this.showSuccess('Key generated and copied to clipboard!');
      console.log('🔑 Generated key:', key);
    },

    fallbackGenerateKey: function() {
      // Remove Firebase forbidden characters: . $ # [ ] / \ and quotes
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&*^';
      let key = '';
      for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return key;
    },

    addKey: async function() {
      if (!this.isAdmin) return;

      const newKeyInput = document.getElementById('new-key-input');
      const key = newKeyInput.value.trim();

      if (!key) {
        this.showError('Please enter a key');
        return;
      }

      if (key.length < 8) {
        this.showError('Key must be at least 8 characters');
        return;
      }

      // Validate Firebase key format
      if (!this.isValidFirebaseKey(key)) {
        this.showError('Key contains invalid characters (. $ # [ ] / \\ or quotes)');
        return;
      }

      try {
        const database = firebase.database();
        
        // Check if key already exists
        const snapshot = await database.ref('usedKeys/' + key).once('value');
        if (snapshot.exists()) {
          this.showError('Key already exists');
          return;
        }

        // Check generated keys too
        const genSnapshot = await database.ref('generatedKeys/' + key).once('value');
        if (genSnapshot.exists()) {
          this.showError('Key already exists in generated keys');
          return;
        }

        // Add to generated keys
        await database.ref('generatedKeys/' + key).set({
          key: key,
          generatedBy: this.currentAdminKey,
          generatedByRole: this.userRole,
          generatedDate: new Date().toISOString(),
          timestamp: Date.now(),
          activated: false
        });

        this.showSuccess('Key added successfully!');
        newKeyInput.value = '';
        console.log('✅ Key added:', key);
      } catch (error) {
        console.error('❌ Error adding key:', error);
        this.showError('Failed to add key: ' + error.message);
      }
    },

    removeKey: async function() {
      if (!this.isAdmin) return;

      const removeKeyInput = document.getElementById('remove-key-input');
      const removeKeyWarning = document.getElementById('remove-key-warning');
      const key = removeKeyInput.value.trim();

      if (!key) {
        this.showError('Please enter a key to remove');
        return;
      }

      // Validate Firebase key format
      if (!this.isValidFirebaseKey(key)) {
        this.showError('Key contains invalid characters (. $ # [ ] / \\ or quotes)');
        return;
      }

      // Check if trying to remove an owner key
      if (OWNER_KEYS.includes(key)) {
        this.showError('Cannot remove owner keys');
        removeKeyWarning.style.display = 'none';
        return;
      }

      // Check if trying to remove an admin key
      if (ADMIN_KEYS.includes(key)) {
        if (!this.isOwner) {
          this.showError('Only owners can remove admin keys');
          removeKeyWarning.style.display = 'block';
          setTimeout(() => {
            removeKeyWarning.style.display = 'none';
          }, 5000);
          return;
        }
        // Owner can remove admin keys
        console.log('👑 Owner removing admin key:', key);
      }

      if (!confirm(`Are you sure you want to remove key: ${key}?`)) {
        return;
      }

      try {
        const database = firebase.database();
        
        // Remove from usedKeys
        await database.ref('usedKeys/' + key).remove();
        
        // Remove from generatedKeys
        await database.ref('generatedKeys/' + key).remove();

        this.showSuccess('Key removed successfully!');
        removeKeyInput.value = '';
        removeKeyWarning.style.display = 'none';
        console.log('🗑️ Key removed:', key);
      } catch (error) {
        console.error('❌ Error removing key:', error);
        this.showError('Failed to remove key: ' + error.message);
      }
    },

    viewAllKeys: async function() {
      if (!this.isAdmin) return;

      const keysListContainer = document.getElementById('keys-list-container');
      const keysList = document.getElementById('keys-list');

      if (!keysListContainer || !keysList) return;

      keysListContainer.style.display = 'block';
      keysList.innerHTML = '<div style="text-align: center; padding: 20px;">Loading keys...</div>';

      try {
        const database = firebase.database();
        const snapshot = await database.ref('usedKeys').once('value');
        const generatedSnapshot = await database.ref('generatedKeys').once('value');
        
        const usedKeys = snapshot.val() || {};
        const generatedKeys = generatedSnapshot.val() || {};
        
        let html = '';
        
        // Display used keys
        html += '<div style="margin-bottom: 20px;"><strong>Used Keys:</strong></div>';
        const usedKeysList = Object.entries(usedKeys);
        
        if (usedKeysList.length === 0) {
          html += '<div style="padding: 10px; opacity: 0.7;">No used keys found.</div>';
        } else {
          usedKeysList.forEach(([key, data]) => {
            const isOwnerKey = OWNER_KEYS.includes(key);
            const isAdminKey = ADMIN_KEYS.includes(key);
            const canRemove = this.isOwner || (!isAdminKey && !isOwnerKey);
            
            let borderColor = '#4f90ff';
            let keyColor = '#4f90ff';
            let badge = '';
            
            if (isOwnerKey) {
              borderColor = '#ffd700';
              keyColor = '#ffd700';
              badge = '<span style="background: linear-gradient(135deg, #ffd700, #ffed4e); color: #000; font-size: 11px; padding: 2px 6px; border-radius: 3px; margin-left: 8px; font-weight: bold;">👑 OWNER</span>';
            } else if (isAdminKey) {
              borderColor = '#4f90ff';
              keyColor = '#4f90ff';
              badge = '<span style="background: rgba(79, 144, 255, 0.3); color: #4f90ff; font-size: 11px; padding: 2px 6px; border-radius: 3px; margin-left: 8px; font-weight: bold;">🔑 ADMIN</span>';
            }
            
            html += `
              <div style="background: rgba(255,255,255,0.05); padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid ${borderColor};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: ${keyColor};">${key}</strong>
                    ${badge}
                  </div>
                  ${canRemove ? `<button onclick="AdminPanel.quickRemoveKey('${key}')" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>` : ''}
                </div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
                  <div>Fingerprint: ${data.fingerprintId ? data.fingerprintId.substring(0, 16) + '...' : 'N/A'}</div>
                  <div>First Used: ${data.firstUsedDate || 'N/A'}</div>
                  <div>Times Accessed: ${data.timesAccessed || 0}</div>
                  <div>Last Accessed: ${data.lastAccessed || 'N/A'}</div>
                  <div>Websites: ${data.websites ? data.websites.join(', ') : 'N/A'}</div>
                </div>
              </div>
            `;
          });
        }
        
        // Display generated (unused) keys
        html += '<div style="margin-top: 30px; margin-bottom: 20px;"><strong>Generated Keys (Not Yet Used):</strong></div>';
        const generatedKeysList = Object.entries(generatedKeys);
        
        if (generatedKeysList.length === 0) {
          html += '<div style="padding: 10px; opacity: 0.7;">No generated keys found.</div>';
        } else {
          generatedKeysList.forEach(([key, data]) => {
            html += `
              <div style="background: rgba(34, 197, 94, 0.1); padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #22c55e;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: #22c55e;">${key}</strong>
                  </div>
                  <button onclick="AdminPanel.quickRemoveKey('${key}')" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
                </div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
                  <div>Generated By: ${data.generatedBy || 'Unknown'} ${data.generatedByRole ? `(${data.generatedByRole})` : ''}</div>
                  <div>Generated: ${data.generatedDate || 'N/A'}</div>
                  <div>Status: Not yet activated</div>
                </div>
              </div>
            `;
          });
        }
        
        keysList.innerHTML = html;
      } catch (error) {
        console.error('❌ Error loading keys:', error);
        keysList.innerHTML = '<div style="color: #ff4444; padding: 20px;">Error loading keys: ' + error.message + '</div>';
      }
    },

    quickRemoveKey: async function(key) {
      if (!this.isAdmin) return;
      
      // Validate Firebase key format
      if (!this.isValidFirebaseKey(key)) {
        this.showError('Key contains invalid characters');
        return;
      }
      
      // Check permissions
      const isOwnerKey = OWNER_KEYS.includes(key);
      const isAdminKey = ADMIN_KEYS.includes(key);
      
      if (isOwnerKey) {
        this.showError('Cannot remove owner keys');
        return;
      }
      
      if (isAdminKey && !this.isOwner) {
        this.showError('Only owners can remove admin keys');
        return;
      }
      
      if (!confirm(`Remove key: ${key}?`)) return;
      
      try {
        const database = firebase.database();
        await database.ref('usedKeys/' + key).remove();
        await database.ref('generatedKeys/' + key).remove();
        this.showSuccess('Key removed!');
        this.viewAllKeys(); // Refresh the list
      } catch (error) {
        console.error('❌ Error removing key:', error);
        this.showError('Failed to remove key');
      }
    },

    viewSecurityLogs: async function() {
      if (!this.isAdmin) return;

      const logsContainer = document.getElementById('security-logs-container');
      const logsList = document.getElementById('security-logs-list');

      if (!logsContainer || !logsList) return;

      logsContainer.style.display = 'block';
      logsList.innerHTML = '<div style="text-align: center; padding: 20px;">Loading security logs...</div>';

      try {
        const database = firebase.database();
        const snapshot = await database.ref('securityLogs').once('value');
        const logs = snapshot.val() || {};

        let html = '';
        let totalLogs = 0;

        Object.entries(logs).forEach(([category, entries]) => {
          html += `<div style="margin-bottom: 20px;"><strong>${category}:</strong></div>`;
          
          const entriesList = Object.entries(entries).sort((a, b) => b[1].timestamp - a[1].timestamp).slice(0, 10);
          
          entriesList.forEach(([timestamp, data]) => {
            totalLogs++;
            const severityColor = data.severity === 'HIGH' ? '#ff4444' : data.severity === 'MEDIUM' ? '#ff9966' : '#ffcc00';
            
            html += `
              <div style="background: rgba(255,255,255,0.05); padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid ${severityColor};">
                <div style="font-size: 12px;">
                  <div><strong>Severity:</strong> <span style="color: ${severityColor};">${data.severity || 'N/A'}</span></div>
                  <div><strong>Date:</strong> ${data.date || 'N/A'}</div>
                  ${Object.entries(data).filter(([k]) => !['severity', 'date', 'timestamp'].includes(k)).map(([k, v]) => 
                    `<div><strong>${k}:</strong> ${v}</div>`
                  ).join('')}
                </div>
              </div>
            `;
          });
        });

        if (totalLogs === 0) {
          html = '<div style="padding: 10px; opacity: 0.7;">No security logs found.</div>';
        } else {
          html = `<div style="margin-bottom: 15px; color: #4f90ff;">Showing recent security events (latest 10 per category)</div>` + html;
        }

        logsList.innerHTML = html;
      } catch (error) {
        console.error('❌ Error loading security logs:', error);
        logsList.innerHTML = '<div style="color: #ff4444; padding: 20px;">Error loading logs: ' + error.message + '</div>';
      }
    },

    viewStatistics: async function() {
      if (!this.isAdmin) return;

      const statsContainer = document.getElementById('stats-container');
      const statsDisplay = document.getElementById('stats-display');

      if (!statsContainer || !statsDisplay) return;

      statsContainer.style.display = 'block';
      statsDisplay.innerHTML = '<div style="text-align: center; padding: 20px;">Loading statistics...</div>';

      try {
        const database = firebase.database();
        const usedKeysSnapshot = await database.ref('usedKeys').once('value');
        const generatedKeysSnapshot = await database.ref('generatedKeys').once('value');
        
        const usedKeys = usedKeysSnapshot.val() || {};
        const generatedKeys = generatedKeysSnapshot.val() || {};

        const totalUsedKeys = Object.keys(usedKeys).length;
        const totalGeneratedKeys = Object.keys(generatedKeys).length;
        const totalKeys = totalUsedKeys + totalGeneratedKeys;

        let totalAccesses = 0;
        let uniqueFingerprints = new Set();
        let websiteUsage = {};

        Object.values(usedKeys).forEach(data => {
          totalAccesses += data.timesAccessed || 0;
          if (data.fingerprintId) uniqueFingerprints.add(data.fingerprintId);
          if (data.websites) {
            data.websites.forEach(site => {
              websiteUsage[site] = (websiteUsage[site] || 0) + 1;
            });
          }
        });

        const html = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="background: rgba(79, 144, 255, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #4f90ff;">
              <div style="font-size: 24px; font-weight: bold; color: #4f90ff;">${totalKeys}</div>
              <div style="font-size: 14px; opacity: 0.8;">Total Keys</div>
            </div>
            <div style="background: rgba(34, 197, 94, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #22c55e;">
              <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${totalUsedKeys}</div>
              <div style="font-size: 14px; opacity: 0.8;">Used Keys</div>
            </div>
            <div style="background: rgba(157, 78, 221, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #9d4edd;">
              <div style="font-size: 24px; font-weight: bold; color: #9d4edd;">${totalGeneratedKeys}</div>
              <div style="font-size: 14px; opacity: 0.8;">Unused Keys</div>
            </div>
            <div style="background: rgba(255, 153, 102, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #ff9966;">
              <div style="font-size: 24px; font-weight: bold; color: #ff9966;">${totalAccesses}</div>
              <div style="font-size: 14px; opacity: 0.8;">Total Accesses</div>
            </div>
            <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #ffd700;">
              <div style="font-size: 24px; font-weight: bold; color: #ffd700;">${uniqueFingerprints.size}</div>
              <div style="font-size: 14px; opacity: 0.8;">Unique Devices</div>
            </div>
          </div>

          <div style="margin-top: 30px;">
            <h5>Website Usage:</h5>
            ${Object.entries(websiteUsage).length > 0 ? Object.entries(websiteUsage).map(([site, count]) => `
              <div style="background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 8px; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>${site}</span>
                  <span style="color: #4f90ff; font-weight: bold;">${count} keys</span>
                </div>
              </div>
            `).join('') : '<div style="padding: 10px; opacity: 0.7;">No website usage data.</div>'}
          </div>
        `;

        statsDisplay.innerHTML = html;
      } catch (error) {
        console.error('❌ Error loading statistics:', error);
        statsDisplay.innerHTML = '<div style="color: #ff4444; padding: 20px;">Error loading statistics: ' + error.message + '</div>';
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.AdminPanel.init());
  } else {
    window.AdminPanel.init();
  }
})();
