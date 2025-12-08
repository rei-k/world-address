/**
 * Biometric Authentication Example App
 * 
 * Demonstrates WebAuthn/FIDO2 passwordless authentication
 */

// Note: In a real app, you would import from npm package:
// import { WebAuthnClient, PasskeyManager, detectPlatformAuthenticator, supportsConditionalUI } from '@vey/webauthn';

// For this demo, we're using relative imports (would need a build step in practice)
// In the HTML, we include the SDK via script tag

// Mock server import
import { mockServer } from './mock-server.js';

// Global state
let webAuthnClient;
let passkeyManager;
let currentUser = null;
let currentChallenge = null;

/**
 * Initialize the app
 */
async function init() {
  console.log('Initializing biometric authentication demo...');

  // Initialize WebAuthn client (mock configuration for demo)
  webAuthnClient = {
    config: {
      rpId: window.location.hostname,
      rpName: 'Veyvault Demo',
      apiEndpoint: '/api/webauthn',
      timeout: 60000,
      userVerification: 'required',
    },
    register: async (options) => {
      // Call native WebAuthn API
      const publicKeyOptions = {
        challenge: base64urlToArrayBuffer(options.challenge),
        rp: {
          id: webAuthnClient.config.rpId,
          name: webAuthnClient.config.rpName,
        },
        user: {
          id: new TextEncoder().encode(options.userId),
          name: options.userName,
          displayName: options.userDisplayName || options.userName,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        timeout: webAuthnClient.config.timeout,
        attestation: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          requireResidentKey: false,
          residentKey: 'preferred',
          userVerification: 'required',
        },
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      });

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response;

      return {
        credentialId: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
          attestationObject: arrayBufferToBase64url(response.attestationObject),
          transports: response.getTransports?.() || [],
        },
        type: 'public-key',
        authenticatorAttachment: credential.authenticatorAttachment,
      };
    },
    authenticate: async (options) => {
      const publicKeyOptions = {
        challenge: base64urlToArrayBuffer(options.challenge),
        timeout: webAuthnClient.config.timeout,
        rpId: webAuthnClient.config.rpId,
        userVerification: 'required',
        allowCredentials: options.allowCredentials?.map((cred) => ({
          ...cred,
          id: base64urlToArrayBuffer(cred.id),
        })),
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions,
        mediation: options.conditionalUI ? 'conditional' : undefined,
      });

      if (!credential) {
        throw new Error('Failed to get credential');
      }

      const response = credential.response;

      return {
        credentialId: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
          authenticatorData: arrayBufferToBase64url(response.authenticatorData),
          signature: arrayBufferToBase64url(response.signature),
          userHandle: response.userHandle
            ? arrayBufferToBase64url(response.userHandle)
            : undefined,
        },
        type: 'public-key',
        authenticatorAttachment: credential.authenticatorAttachment,
      };
    },
  };

  // Initialize passkey manager (mock for demo)
  passkeyManager = {
    storage: [],
    async savePasskey(passkey) {
      const existing = this.storage.findIndex((p) => p.id === passkey.id);
      if (existing >= 0) {
        this.storage[existing] = passkey;
      } else {
        this.storage.push(passkey);
      }
      localStorage.setItem('demo_passkeys', JSON.stringify(this.storage));
    },
    async listPasskeys() {
      const data = localStorage.getItem('demo_passkeys');
      this.storage = data ? JSON.parse(data) : [];
      return this.storage;
    },
    async deletePasskey(credentialId) {
      this.storage = this.storage.filter((p) => p.id !== credentialId);
      localStorage.setItem('demo_passkeys', JSON.stringify(this.storage));
      return true;
    },
    async renamePasskey(credentialId, newName) {
      const passkey = this.storage.find((p) => p.id === credentialId);
      if (passkey) {
        passkey.name = newName;
        localStorage.setItem('demo_passkeys', JSON.stringify(this.storage));
      }
    },
    async clearAllPasskeys() {
      this.storage = [];
      localStorage.removeItem('demo_passkeys');
    },
    async updateLastUsed(credentialId) {
      const passkey = this.storage.find((p) => p.id === credentialId);
      if (passkey) {
        passkey.lastUsedAt = new Date().toISOString();
        localStorage.setItem('demo_passkeys', JSON.stringify(this.storage));
      }
    },
  };

  // Check platform capabilities
  await checkPlatformCapabilities();

  // Setup event listeners
  setupEventListeners();

  // Load passkeys
  await refreshPasskeysList();

  // Check for existing session
  checkExistingSession();

  updateAuthState();
}

/**
 * Check platform capabilities
 */
async function checkPlatformCapabilities() {
  const infoDiv = document.getElementById('platform-info');

  try {
    const webAuthnSupported = typeof PublicKeyCredential !== 'undefined';
    const platformAvailable = webAuthnSupported
      ? await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      : false;
    const conditionalUISupported = webAuthnSupported
      ? await PublicKeyCredential.isConditionalMediationAvailable?.() || false
      : false;

    const platform = detectPlatform();
    const browser = detectBrowser();

    infoDiv.innerHTML = `
      <div class="platform-item">
        <span class="platform-label">WebAuthn Support:</span>
        <span class="status-badge ${webAuthnSupported ? 'success' : 'error'}">
          ${webAuthnSupported ? '✓ Supported' : '✗ Not Supported'}
        </span>
      </div>
      <div class="platform-item">
        <span class="platform-label">Platform Authenticator:</span>
        <span class="status-badge ${platformAvailable ? 'success' : 'error'}">
          ${platformAvailable ? '✓ Available' : '✗ Not Available'}
        </span>
      </div>
      <div class="platform-item">
        <span class="platform-label">Conditional UI (Autofill):</span>
        <span class="status-badge ${conditionalUISupported ? 'success' : 'error'}">
          ${conditionalUISupported ? '✓ Supported' : '✗ Not Supported'}
        </span>
      </div>
      <div class="platform-item">
        <span class="platform-label">Platform:</span>
        <span class="platform-value">${platform}</span>
      </div>
      <div class="platform-item">
        <span class="platform-label">Browser:</span>
        <span class="platform-value">${browser}</span>
      </div>
    `;

    // Show conditional UI button if supported
    if (conditionalUISupported) {
      document.getElementById('auth-conditional-btn').style.display = 'inline-block';
    }

    if (!webAuthnSupported) {
      showMessage('registration-result', 'error', 
        '⚠️ WebAuthn is not supported in this browser. Please use a modern browser with HTTPS.');
    } else if (!platformAvailable) {
      showMessage('registration-result', 'info', 
        'ℹ️ No platform authenticator detected. Make sure biometric authentication is enabled on your device.');
    }
  } catch (error) {
    console.error('Platform detection error:', error);
    infoDiv.innerHTML = '<p class="error">Failed to detect platform capabilities</p>';
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  document.getElementById('register-btn').addEventListener('click', handleRegistration);
  document.getElementById('auth-btn').addEventListener('click', handleAuthentication);
  document.getElementById('auth-conditional-btn').addEventListener('click', handleConditionalAuth);
  document.getElementById('refresh-passkeys-btn').addEventListener('click', refreshPasskeysList);
  document.getElementById('export-passkeys-btn').addEventListener('click', exportPasskeys);
  document.getElementById('clear-all-btn').addEventListener('click', clearAllPasskeys);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

/**
 * Handle registration
 */
async function handleRegistration() {
  const username = document.getElementById('username').value;
  const displayName = document.getElementById('displayName').value;
  const credentialName = document.getElementById('credentialName').value;

  if (!username || !displayName) {
    showMessage('registration-result', 'error', 'Please fill in all required fields');
    return;
  }

  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Registering...';

  try {
    // Step 1: Get challenge from server
    const challengeData = await mockServer.generateRegistrationChallenge(username);
    currentChallenge = challengeData.challenge;

    // Step 2: Create credential
    const registrationResult = await webAuthnClient.register({
      userId: challengeData.userId,
      userName: username,
      userDisplayName: displayName,
      challenge: challengeData.challenge,
    });

    // Step 3: Verify with server
    const verificationResult = await mockServer.verifyRegistration(
      registrationResult,
      currentChallenge
    );

    // Step 4: Save passkey metadata
    const platform = detectPlatform();
    const passkeyName = credentialName || `${platform} ${new Date().toLocaleDateString()}`;

    await passkeyManager.savePasskey({
      id: registrationResult.credentialId,
      name: passkeyName,
      deviceName: platform,
      createdAt: new Date().toISOString(),
      authenticatorAttachment: registrationResult.authenticatorAttachment,
      transports: registrationResult.response.transports,
    });

    showMessage('registration-result', 'success', 
      `✅ Passkey registered successfully! Credential ID: ${registrationResult.credentialId.substring(0, 20)}...`);

    await refreshPasskeysList();

    // Clear form
    document.getElementById('credentialName').value = '';
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('registration-result', 'error', `❌ Registration failed: ${error.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '👆 Register Passkey';
  }
}

/**
 * Handle authentication
 */
async function handleAuthentication(conditionalUI = false) {
  const btn = conditionalUI 
    ? document.getElementById('auth-conditional-btn')
    : document.getElementById('auth-btn');
  
  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span>Authenticating...';

  try {
    // Step 1: Get challenge from server
    const challengeData = await mockServer.generateAuthenticationChallenge();
    currentChallenge = challengeData.challenge;

    // Step 2: Authenticate
    const authResult = await webAuthnClient.authenticate({
      challenge: challengeData.challenge,
      allowCredentials: challengeData.allowCredentials,
      conditionalUI,
    });

    // Step 3: Verify with server
    const verificationResult = await mockServer.verifyAuthentication(
      authResult,
      currentChallenge
    );

    // Step 4: Update passkey last used
    await passkeyManager.updateLastUsed(authResult.credentialId);

    // Step 5: Store session
    localStorage.setItem('demo_session', verificationResult.accessToken);
    currentUser = verificationResult.user;

    showMessage('authentication-result', 'success', 
      `✅ Authentication successful! Welcome, ${currentUser.username}`);

    updateAuthState();
    await refreshPasskeysList();
  } catch (error) {
    console.error('Authentication error:', error);
    showMessage('authentication-result', 'error', `❌ Authentication failed: ${error.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

/**
 * Handle conditional UI authentication
 */
async function handleConditionalAuth() {
  await handleAuthentication(true);
}

/**
 * Handle logout
 */
async function handleLogout() {
  const accessToken = localStorage.getItem('demo_session');
  if (accessToken) {
    await mockServer.logout(accessToken);
    localStorage.removeItem('demo_session');
  }

  currentUser = null;
  updateAuthState();
  showMessage('authentication-result', 'info', 'Logged out successfully');
}

/**
 * Check for existing session
 */
async function checkExistingSession() {
  const accessToken = localStorage.getItem('demo_session');
  if (!accessToken) return;

  const result = await mockServer.validateSession(accessToken);
  if (result.valid) {
    currentUser = result.user;
  } else {
    localStorage.removeItem('demo_session');
  }
}

/**
 * Update authentication state UI
 */
function updateAuthState() {
  const authStateDiv = document.getElementById('auth-state');
  const registrationSection = document.getElementById('registration-section');
  const authenticationSection = document.getElementById('authentication-section');
  const logoutSection = document.getElementById('logout-section');

  if (currentUser) {
    authStateDiv.innerHTML = `
      <div class="auth-message">🎉 Authenticated</div>
      <div class="user-info">
        <h3>User Information</h3>
        <p><strong>ID:</strong> ${currentUser.id}</p>
        <p><strong>Username:</strong> ${currentUser.username}</p>
      </div>
    `;
    registrationSection.style.display = 'none';
    authenticationSection.style.display = 'none';
    logoutSection.style.display = 'block';
  } else {
    authStateDiv.innerHTML = `
      <div class="auth-message">🔓 Not Authenticated</div>
      <p>Register a new passkey or sign in with an existing one</p>
    `;
    registrationSection.style.display = 'block';
    authenticationSection.style.display = 'block';
    logoutSection.style.display = 'none';
  }
}

/**
 * Refresh passkeys list
 */
async function refreshPasskeysList() {
  const listDiv = document.getElementById('passkeys-list');
  const passkeys = await passkeyManager.listPasskeys();

  if (passkeys.length === 0) {
    listDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔑</div>
        <p>No passkeys registered yet</p>
      </div>
    `;
    return;
  }

  listDiv.innerHTML = passkeys
    .map(
      (passkey) => `
      <div class="passkey-item">
        <div class="passkey-info">
          <div class="passkey-name">${escapeHtml(passkey.name)}</div>
          <div class="passkey-details">
            Created: ${new Date(passkey.createdAt).toLocaleDateString()}
            ${passkey.lastUsedAt ? ` | Last used: ${new Date(passkey.lastUsedAt).toLocaleDateString()}` : ''}
            <br>ID: ${passkey.id.substring(0, 30)}...
          </div>
        </div>
        <div class="passkey-actions">
          <button class="btn btn-outline" onclick="renamePasskey('${passkey.id}')">
            ✏️ Rename
          </button>
          <button class="btn btn-danger" onclick="deletePasskey('${passkey.id}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `
    )
    .join('');
}

/**
 * Rename passkey
 */
window.renamePasskey = async function (credentialId) {
  const passkeys = await passkeyManager.listPasskeys();
  const passkey = passkeys.find((p) => p.id === credentialId);
  if (!passkey) return;

  const newName = prompt('Enter new name:', passkey.name);
  if (newName && newName.trim()) {
    await passkeyManager.renamePasskey(credentialId, newName.trim());
    await refreshPasskeysList();
  }
};

/**
 * Delete passkey
 */
window.deletePasskey = async function (credentialId) {
  if (!confirm('Are you sure you want to delete this passkey?')) return;

  await passkeyManager.deletePasskey(credentialId);
  await refreshPasskeysList();
};

/**
 * Export passkeys
 */
async function exportPasskeys() {
  const passkeys = await passkeyManager.listPasskeys();
  const json = JSON.stringify(passkeys, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `passkeys-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Clear all passkeys
 */
async function clearAllPasskeys() {
  if (!confirm('Are you sure you want to delete ALL passkeys? This cannot be undone.')) return;

  await passkeyManager.clearAllPasskeys();
  await refreshPasskeysList();
}

/**
 * Show message
 */
function showMessage(elementId, type, message) {
  const element = document.getElementById(elementId);
  element.className = `result show ${type}`;
  element.textContent = message;

  setTimeout(() => {
    element.classList.remove('show');
  }, 5000);
}

/**
 * Detect platform
 */
function detectPlatform() {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';

  if (/iphone|ipad|ipod/.test(userAgent)) return 'iOS';
  if (/android/.test(userAgent)) return 'Android';
  if (/win/.test(platform)) return 'Windows';
  if (/mac/.test(platform) && !/iphone|ipad|ipod/.test(userAgent)) return 'macOS';
  if (/linux/.test(platform)) return 'Linux';
  return 'Unknown';
}

/**
 * Detect browser
 */
function detectBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/edg/.test(userAgent)) return 'Edge';
  if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) return 'Chrome';
  if (/firefox/.test(userAgent)) return 'Firefox';
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return 'Safari';
  return 'Unknown';
}

/**
 * Base64URL encoding/decoding utilities
 */
function arrayBufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToArrayBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
