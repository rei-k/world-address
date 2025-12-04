/**
 * VeyExpress React UI Example
 * Complete React application example
 */

import React, { useState } from 'react';
import {
  DashboardScreen,
  APIConsoleScreen,
  LogisticsScreen,
  ECIntegrationScreen,
  CrossBorderScreen,
  ValueServicesScreen,
  HardwareScreen,
} from '@vey/veyexpress/ui';

type ScreenType = 
  | 'dashboard' 
  | 'api-console' 
  | 'logistics' 
  | 'ec-integration' 
  | 'cross-border' 
  | 'value-services' 
  | 'hardware';

interface VeyExpressAppProps {
  apiKey: string;
}

export const VeyExpressApp: React.FC<VeyExpressAppProps> = ({ apiKey }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', label: '総合ダッシュボード' },
    { id: 'api-console', name: 'API Console', icon: '🔧', label: 'APIコンソール' },
    { id: 'logistics', name: 'Logistics', icon: '📦', label: '物流管理' },
    { id: 'ec-integration', name: 'EC Integration', icon: '🛍️', label: 'EC/店舗連携' },
    { id: 'cross-border', name: 'Cross-Border', icon: '🌍', label: '越境配送' },
    { id: 'value-services', name: 'Services', icon: '⭐', label: '付加価値サービス' },
    { id: 'hardware', name: 'Hardware', icon: '🔌', label: 'Hardware連動' },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen apiKey={apiKey} />;
      case 'api-console':
        return <APIConsoleScreen apiKey={apiKey} />;
      case 'logistics':
        return <LogisticsScreen apiKey={apiKey} />;
      case 'ec-integration':
        return <ECIntegrationScreen apiKey={apiKey} />;
      case 'cross-border':
        return <CrossBorderScreen apiKey={apiKey} />;
      case 'value-services':
        return <ValueServicesScreen apiKey={apiKey} />;
      case 'hardware':
        return <HardwareScreen apiKey={apiKey} />;
      default:
        return <DashboardScreen apiKey={apiKey} />;
    }
  };

  return (
    <div className="veyexpress-app">
      {/* Navigation Sidebar */}
      <nav className="app-navigation">
        <div className="app-logo">
          <h1>VeyExpress</h1>
          <p>Making global logistics as simple as email</p>
        </div>
        
        <ul className="nav-menu">
          {navigation.map(item => (
            <li
              key={item.id}
              className={currentScreen === item.id ? 'active' : ''}
              onClick={() => setCurrentScreen(item.id as ScreenType)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-text">
                <strong>{item.name}</strong>
                <small>{item.label}</small>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="app-content">
        {renderScreen()}
      </main>
    </div>
  );
};

// Example usage in a Next.js or React app
export default function App() {
  const apiKey = process.env.NEXT_PUBLIC_VEYEXPRESS_API_KEY || 'your-api-key';
  
  return (
    <div>
      <VeyExpressApp apiKey={apiKey} />
    </div>
  );
}

/**
 * CSS for the application (add to your global styles)
 */
export const appStyles = `
.veyexpress-app {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-navigation {
  width: 280px;
  background: #1a1d29;
  color: white;
  padding: 20px;
  overflow-y: auto;
}

.app-logo {
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 20px;
}

.app-logo h1 {
  font-size: 24px;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app-logo p {
  font-size: 12px;
  color: #8892ab;
  margin: 0;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-menu li:hover {
  background: rgba(255,255,255,0.1);
}

.nav-menu li.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.nav-icon {
  font-size: 24px;
  margin-right: 12px;
}

.nav-text {
  display: flex;
  flex-direction: column;
}

.nav-text strong {
  font-size: 14px;
  margin-bottom: 2px;
}

.nav-text small {
  font-size: 11px;
  color: #8892ab;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

/* Responsive design */
@media (max-width: 768px) {
  .veyexpress-app {
    flex-direction: column;
  }
  
  .app-navigation {
    width: 100%;
    padding: 15px;
  }
  
  .nav-menu {
    display: flex;
    flex-wrap: wrap;
  }
  
  .nav-menu li {
    flex: 1 1 auto;
    min-width: 120px;
  }
}
`;
