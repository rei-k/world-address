# Veyform Dashboard - Admin & Developer Console

This is the administration and developer dashboard for sites that have integrated Veyform, the address form system for the Vey ecosystem.

## 🎯 Overview

The Veyform Dashboard provides a comprehensive management interface for:

- **Overview**: Monitor API requests, active integrations, and webhooks at a glance
- **Integration Builder**: Configure and generate integration code for your application
- **Connect**: Integrate with popular e-commerce platforms (Shopify, WooCommerce, etc.)
- **API Keys**: Manage API keys with security best practices
- **Webhooks**: Set up webhook endpoints for event notifications
- **Monitor**: Track API performance, response times, and request status
- **Live Logs**: Real-time event stream with filtering and export capabilities
- **Setting**: Configure general settings, security, and notifications

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

```bash
# Navigate to the Veyform directory
cd Vey/apps/Veyform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
Veyform/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard pages
│   │   ├── page.tsx         # Overview page
│   │   ├── integration-builder/
│   │   ├── connect/
│   │   ├── api-keys/
│   │   ├── webhooks/
│   │   ├── monitor/
│   │   ├── live-logs/
│   │   └── setting/
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   └── Sidebar.tsx          # Navigation sidebar
├── public/                  # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Features

### Dashboard Pages

#### Overview
- Real-time statistics (API requests, active integrations, webhooks)
- Recent activity feed
- Quick insights into system health

#### Integration Builder
- Visual configuration interface
- Support for multiple integration types
- Auto-complete and validation settings
- Country selection
- Code generation with live preview

#### Connect
- Pre-built integrations for popular platforms:
  - Shopify
  - WooCommerce
  - Magento
  - Custom API
- One-click connection setup
- Connected platforms management

#### API Keys
- Create and manage API keys
- View key usage statistics
- Copy and revoke keys
- Security best practices guide
- Separate keys for development and production

#### Webhooks
- Create webhook endpoints
- Subscribe to events:
  - address.created
  - address.updated
  - address.deleted
  - address.validated
  - form.submitted
  - integration.connected
  - integration.disconnected
- Test webhook delivery
- View webhook documentation

#### Monitor
- API request metrics (24-hour view)
- Success rate tracking
- Response time monitoring
- Error rate analysis
- Recent request log with status codes

#### Live Logs
- Real-time event streaming
- Filter by log level (Info, Success, Warning, Error)
- Detailed event information
- Export logs as JSON or CSV
- Pause/resume live stream

#### Settings
- General settings (project name, default country, timezone)
- Security settings (2FA, IP whitelist, rate limiting)
- Notification preferences
- Danger zone (delete operations)

## 🔧 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18
- **Styling**: Tailwind CSS 3
- **Icons**: Heroicons
- **Language**: TypeScript
- **Build Tool**: Next.js built-in bundler

## 🎨 Design System

The dashboard uses a clean, modern design with:
- Dark sidebar navigation
- Light content area
- Consistent color scheme:
  - Primary: Blue (#2563eb)
  - Success: Green (#16a34a)
  - Warning: Yellow (#eab308)
  - Error: Red (#dc2626)
- Responsive layout for mobile, tablet, and desktop

## 🔐 Security Features

- API key management with masking
- Environment variable configuration
- Security best practices documentation
- Rate limiting configuration
- IP whitelisting support
- Two-factor authentication support

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript type checking

# Testing
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
```

## 🌍 Integration with Vey Ecosystem

This dashboard integrates with:
- **Veyvault**: Cloud address book system
- **VeyExpress**: Delivery integration platform
- **VeyStore**: E-commerce platform
- **VeyPOS**: Point of sale system

## 📄 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_VEYBOOK_API_URL=https://api.veybook.com

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/veyform

# Webhooks
WEBHOOK_SECRET=your-webhook-secret-here

# Monitoring
NEXT_PUBLIC_ENABLE_LIVE_LOGS=true
```

## 🤝 Contributing

Contributions are welcome! Please see the main repository's [CONTRIBUTING.md](../../../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - See [LICENSE](../../../LICENSE) for details.

## 🔗 Related Documentation

- [Vey Ecosystem Overview](../../README.md)
- [Veyvault Documentation](../Veyvault/README.md)
- [World Address Data](../../../README.md)

---

**Built with ❤️ by the Vey Team**
