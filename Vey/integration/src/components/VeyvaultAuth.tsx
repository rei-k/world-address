/**
 * Veyvault Login Button Component
 * Drop-in authentication button for third-party applications
 * Similar to "Sign in with Google" or "Sign in with Apple"
 * 
 * @example
 * ```tsx
 * <VeyvaultButton
 *   clientId="your_client_id"
 *   redirectUri="/auth/callback"
 *   scopes={['openid', 'profile', 'email']}
 *   onSuccess={(user) => console.log('Logged in:', user)}
 *   onError={(error) => console.error('Login failed:', error)}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';

export interface VeyvaultButtonProps {
  /**
   * OAuth client ID from Veyvault Developer Console
   */
  clientId: string;

  /**
   * Redirect URI after successful authentication
   */
  redirectUri: string;

  /**
   * OAuth scopes to request
   * @default ['openid', 'profile', 'email']
   */
  scopes?: string[];

  /**
   * OAuth state parameter for CSRF protection
   */
  state?: string;

  /**
   * Button theme
   * @default 'default'
   */
  theme?: 'default' | 'dark' | 'light';

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Button text
   * @default 'Sign in with Veyvault'
   */
  text?: string;

  /**
   * Show Veyvault logo
   * @default true
   */
  showLogo?: boolean;

  /**
   * Use PKCE (Proof Key for Code Exchange) for enhanced security
   * Recommended for mobile and single-page applications
   * @default true
   */
  usePKCE?: boolean;

  /**
   * Success callback
   */
  onSuccess?: (user: any) => void;

  /**
   * Error callback
   */
  onError?: (error: Error) => void;

  /**
   * Loading callback
   */
  onLoading?: (loading: boolean) => void;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Custom style
   */
  style?: React.CSSProperties;
}

export const VeyvaultButton: React.FC<VeyvaultButtonProps> = ({
  clientId,
  redirectUri,
  scopes = ['openid', 'profile', 'email'],
  state,
  theme = 'default',
  size = 'medium',
  text = 'Sign in with Veyvault',
  showLogo = true,
  usePKCE = true,
  onSuccess,
  onError,
  onLoading,
  className = '',
  style = {},
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    try {
      setIsLoading(true);
      onLoading?.(true);

      // Generate PKCE challenge if enabled
      let codeChallenge: string | undefined;
      let codeVerifier: string | undefined;

      if (usePKCE) {
        const pkce = await generatePKCE();
        codeChallenge = pkce.challenge;
        codeVerifier = pkce.verifier;

        // Store code verifier for callback
        sessionStorage.setItem('vey_pkce_verifier', codeVerifier);
      }

      // Build authorization URL
      const authUrl = buildAuthorizationUrl({
        clientId,
        redirectUri,
        scopes,
        state: state || generateState(),
        codeChallenge,
      });

      // Redirect to Veyvault authorization page
      window.location.href = authUrl;
    } catch (error) {
      setIsLoading(false);
      onLoading?.(false);
      onError?.(error as Error);
    }
  }, [clientId, redirectUri, scopes, state, usePKCE, onError, onLoading]);

  const buttonClass = getButtonClass(theme, size);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`vey-button ${buttonClass} ${className}`}
      style={style}
      aria-label={text}
    >
      {showLogo && <VeyvaultLogo theme={theme} />}
      <span className="vey-button-text">{isLoading ? 'Signing in...' : text}</span>
    </button>
  );
};

/**
 * Veyvault QR Login Component
 * Displays QR code for cross-device authentication
 * 
 * @example
 * ```tsx
 * <VeyvaultQRLogin
 *   clientId="your_client_id"
 *   onSuccess={(user) => console.log('Logged in:', user)}
 *   size={256}
 * />
 * ```
 */

export interface VeyvaultQRLoginProps {
  /**
   * OAuth client ID
   */
  clientId: string;

  /**
   * Redirect URI after successful authentication
   */
  redirectUri: string;

  /**
   * OAuth scopes
   * @default ['openid', 'profile', 'email']
   */
  scopes?: string[];

  /**
   * QR code size in pixels
   * @default 256
   */
  size?: number;

  /**
   * Polling interval in milliseconds
   * @default 2000 (2 seconds)
   */
  pollingInterval?: number;

  /**
   * Success callback
   */
  onSuccess?: (user: any) => void;

  /**
   * Error callback
   */
  onError?: (error: Error) => void;

  /**
   * Scan callback (when QR is scanned)
   */
  onScan?: () => void;

  /**
   * Custom className
   */
  className?: string;
}

export const VeyvaultQRLogin: React.FC<VeyvaultQRLoginProps> = ({
  clientId,
  redirectUri,
  scopes = ['openid', 'profile', 'email'],
  size = 256,
  pollingInterval = 2000,
  onSuccess,
  onError,
  onScan,
  className = '',
}) => {
  const [qrSession, setQRSession] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'scanned' | 'approved' | 'expired'>('loading');

  React.useEffect(() => {
    // Generate QR code
    generateQRCode();
  }, []);

  React.useEffect(() => {
    if (!qrSession) return;

    // Start polling for status
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://id.veyvault.com/auth/qr/status/${qrSession.sessionId}`,
          {
            headers: {
              'X-Client-ID': clientId,
            },
          }
        );

        const data = await response.json();

        if (data.status === 'scanned') {
          setStatus('scanned');
          onScan?.();
        } else if (data.status === 'approved') {
          setStatus('approved');
          clearInterval(pollInterval);
          
          // Exchange auth code for tokens
          const tokens = await exchangeCodeForTokens(data.authCode);
          onSuccess?.(tokens.user);
        } else if (data.status === 'expired') {
          setStatus('expired');
          clearInterval(pollInterval);
        }
      } catch (error) {
        onError?.(error as Error);
        clearInterval(pollInterval);
      }
    }, pollingInterval);

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, [qrSession, clientId, pollingInterval, onSuccess, onError, onScan]);

  const generateQRCode = async () => {
    try {
      const response = await fetch('https://id.veyvault.com/auth/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': clientId,
        },
        body: JSON.stringify({
          clientId,
          redirectUri,
          scope: scopes.join(' '),
        }),
      });

      const session = await response.json();
      setQRSession(session);
      setStatus('ready');
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleRefresh = () => {
    setStatus('loading');
    setQRSession(null);
    generateQRCode();
  };

  return (
    <div className={`vey-qr-login ${className}`}>
      <div className="vey-qr-container">
        {status === 'loading' && (
          <div className="vey-qr-loading">
            <div className="vey-spinner" />
            <p>Generating QR code...</p>
          </div>
        )}

        {status === 'ready' && qrSession && (
          <>
            <img
              src={qrSession.qrCode}
              alt="Scan with Veyvault app"
              width={size}
              height={size}
              className="vey-qr-code"
            />
            <p className="vey-qr-instruction">Scan with Veyvault mobile app</p>
          </>
        )}

        {status === 'scanned' && (
          <div className="vey-qr-scanned">
            <div className="vey-checkmark">✓</div>
            <p>Scanned! Waiting for approval...</p>
          </div>
        )}

        {status === 'approved' && (
          <div className="vey-qr-approved">
            <div className="vey-checkmark">✓</div>
            <p>Login approved!</p>
          </div>
        )}

        {status === 'expired' && (
          <div className="vey-qr-expired">
            <p>QR code expired</p>
            <button onClick={handleRefresh} className="vey-button vey-button-secondary">
              Generate new code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Veyvault Consent Screen Component
 * Displays permission request for user authorization
 * 
 * Internal component used by Veyvault IdP
 */

export interface VeyvaultConsentScreenProps {
  client: {
    id: string;
    name: string;
    logoUrl?: string;
    description?: string;
    website?: string;
  };
  scopes: string[];
  onApprove: (decision: { approved: boolean; rememberDecision: boolean }) => void;
  onDeny: () => void;
}

export const VeyvaultConsentScreen: React.FC<VeyvaultConsentScreenProps> = ({
  client,
  scopes,
  onApprove,
  onDeny,
}) => {
  const [rememberDecision, setRememberDecision] = useState(false);

  const scopeDescriptions = getScopeDescriptions(scopes);

  return (
    <div className="vey-consent-screen">
      <div className="vey-consent-header">
        <div className="vey-consent-logo">
          {client.logoUrl ? (
            <img src={client.logoUrl} alt={client.name} />
          ) : (
            <div className="vey-consent-logo-placeholder">{client.name[0]}</div>
          )}
        </div>
        <h1 className="vey-consent-title">
          <strong>{client.name}</strong> wants to access:
        </h1>
      </div>

      <div className="vey-consent-permissions">
        {scopeDescriptions.map((scope) => (
          <div key={scope.name} className="vey-consent-permission">
            <span className="vey-consent-permission-icon">✓</span>
            <span className="vey-consent-permission-text">{scope.description}</span>
          </div>
        ))}
      </div>

      <div className="vey-consent-notice">
        <p>
          This will allow <strong>{client.name}</strong> to:
        </p>
        <ul>
          {scopes.includes('delivery') && (
            <li>Send deliveries to your address without seeing it</li>
          )}
          {scopes.includes('conveyid') && (
            <li>Use your ConveyID for simplified orders</li>
          )}
          {scopes.includes('profile') && (
            <li>Access your name for order confirmations</li>
          )}
        </ul>
        <p className="vey-consent-privacy">
          <strong>Your address will NOT be shared with this app.</strong>
          <br />
          Only delivery companies will see it.
        </p>
      </div>

      <div className="vey-consent-options">
        <label className="vey-checkbox">
          <input
            type="checkbox"
            checked={rememberDecision}
            onChange={(e) => setRememberDecision(e.target.checked)}
          />
          <span>Remember this decision</span>
        </label>
      </div>

      <div className="vey-consent-actions">
        <button
          type="button"
          onClick={onDeny}
          className="vey-button vey-button-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onApprove({ approved: true, rememberDecision })}
          className="vey-button vey-button-primary"
        >
          Allow Access
        </button>
      </div>
    </div>
  );
};

/**
 * Helper functions
 */

function buildAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  codeChallenge?: string;
}): string {
  const baseUrl = 'https://id.veyvault.com/oauth/authorize';
  const queryParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    scope: params.scopes.join(' '),
    state: params.state,
    ...(params.codeChallenge && {
      code_challenge: params.codeChallenge,
      code_challenge_method: 'S256',
    }),
  });

  return `${baseUrl}?${queryParams.toString()}`;
}

async function generatePKCE(): Promise<{ challenge: string; verifier: string }> {
  // Generate code verifier
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = base64URLEncode(array);

  // Generate code challenge
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const challenge = base64URLEncode(new Uint8Array(hash));

  return { challenge, verifier };
}

function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function exchangeCodeForTokens(authCode: string): Promise<any> {
  const codeVerifier = sessionStorage.getItem('vey_pkce_verifier');
  
  // In production, this would be done on the backend
  // For demo purposes, showing the flow
  return {
    access_token: 'mock_access_token',
    id_token: 'mock_id_token',
    user: {
      id: 'user_123',
      name: 'Taro Yamada',
      email: 'taro@example.com',
    },
  };
}

function getButtonClass(theme: string, size: string): string {
  const themeClass = `vey-button-${theme}`;
  const sizeClass = `vey-button-${size}`;
  return `${themeClass} ${sizeClass}`;
}

function getScopeDescriptions(scopes: string[]): Array<{ name: string; description: string }> {
  const descriptions: Record<string, string> = {
    openid: 'OpenID Connect authentication',
    profile: 'Your name and profile picture',
    email: 'Your email address',
    address: 'Your verified address (hidden with ZKP)',
    conveyid: 'Your ConveyID (e.g., taro@convey)',
    delivery: 'Permission to send deliveries',
    friends: 'Your friend list',
    trust_score: 'Your trust score and reputation',
  };

  return scopes.map((scope) => ({
    name: scope,
    description: descriptions[scope] || scope,
  }));
}

/**
 * Veyvault Logo Component
 */
const VeyvaultLogo: React.FC<{ theme: string }> = ({ theme }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="vey-logo"
  >
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      fill={theme === 'dark' ? '#fff' : '#4F46E5'}
    />
    <path
      d="M2 17L12 22L22 17V12L12 17L2 12V17Z"
      fill={theme === 'dark' ? '#fff' : '#4F46E5'}
    />
  </svg>
);

export default VeyvaultButton;
