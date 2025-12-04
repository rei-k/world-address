# Veyvault Site Management

## Overview

Veyvault introduces a powerful site discovery and access management system that allows users to:

1. **Search for Veyform-enabled sites** - Find e-commerce sites, restaurants, and booking services that integrate with Veyform
2. **One-click shopping/booking** - Use stored addresses without re-entering them on integrated sites
3. **Manage site permissions** - Control which sites have access to your address information
4. **Revoke access anytime** - Remove site permissions whenever you want

---

## Site Search Feature

### How It Works

Veyvault maintains a registry of all sites that have integrated Veyform for address collection. Users can search this registry to discover sites where they can use their stored addresses for quick checkout or booking.

### Search Capabilities

- **Text search**: Search by site name, description, or category
- **Category filter**: Filter by type (e.g., shopping, dining, travel, services)
- **Location filter**: Find sites in specific countries or cities
- **Service filter**: Find sites offering specific services (delivery, booking, etc.)

### Example Usage

```typescript
import { VeyvaultClient } from '@vey/veyvault';

const client = new VeyvaultClient({ 
  baseURL: 'https://api.vey.com',
  apiKey: 'your_api_key' 
});

// Search for restaurants in Tokyo
const results = await client.searchSites({
  query: 'レストラン',
  category: 'dining',
  location: 'Tokyo',
  limit: 20
});

// Display results
results.sites.forEach(site => {
  console.log(`${site.name} - ${site.description}`);
  console.log(`Services: ${site.supportedServices.join(', ')}`);
  console.log(`Rating: ${site.rating} ⭐ (${site.reviewCount} reviews)`);
});
```

---

## Mini-Program-Like Experience

### What is it?

When you find a Veyform-enabled site through Veyvault search, you can click to visit that site and immediately use it for shopping or booking **without entering your address**. This is similar to how mini-programs work in WeChat or Alipay.

### How It Works

1. **User searches** for a site in Veyvault
2. **User clicks** on a search result
3. **Veyvault grants temporary access** to the selected address for that site
4. **User shops/books** on the site without entering address
5. **Site uses the address** from Veyvault for delivery/booking
6. **User completes** the transaction seamlessly

### Benefits

- ⚡ **Faster checkout** - No typing required
- 🔒 **Privacy preserved** - Site only gets encrypted address token
- ✅ **Accurate addresses** - Pre-validated addresses reduce delivery errors
- 🌍 **Universal** - Works across all 257 supported countries

### Example Flow

```typescript
// Step 1: User searches for a site
const sites = await client.searchSites({
  query: 'online bookstore',
  category: 'shopping'
});

// Step 2: User selects a site (e.g., sites[0])
const selectedSite = sites.sites[0];

// Step 3: User grants access to their home address
const access = await client.grantSiteAccess(
  selectedSite.id,
  userHomeAddressId,
  ['read_address', 'use_for_delivery']
);

// Step 4: User is redirected to the site with access token
// The site can now use the address for checkout without showing it
window.location.href = `${selectedSite.websiteUrl}/checkout?vey_token=${access.id}`;
```

---

## Site Access Management

### Overview

Veyvault gives you complete control over which sites can access your addresses. You can:

- View all sites with access to your addresses
- See when and how often sites use your addresses
- Revoke access from any site at any time
- View detailed access history

### Viewing Authorized Sites

```typescript
// Get list of all sites with access
const authorizedSites = await client.listAuthorizedSites();

authorizedSites.forEach(access => {
  console.log(`Site: ${access.siteName}`);
  console.log(`Address: ${access.addressId}`);
  console.log(`Granted: ${access.grantedAt}`);
  console.log(`Last used: ${access.lastUsedAt}`);
  console.log(`Usage count: ${access.usageCount}`);
  console.log(`Permissions: ${access.permissions.map(p => p.type).join(', ')}`);
});
```

### Revoking Access

You can revoke a site's access to your address at any time:

```typescript
// Revoke access from a specific site
await client.revokeSiteAccess({
  siteId: 'site-123',
  reason: 'No longer using this service'
});

console.log('Access revoked successfully');
```

### Access History

Track all interactions between sites and your addresses:

```typescript
// View history for a specific site
const history = await client.getSiteAccessHistory('site-123');

history.forEach(entry => {
  console.log(`${entry.action} - ${entry.timestamp}`);
  console.log(`Details: ${entry.details}`);
});

// Or view all access history
const allHistory = await client.getAllAccessHistory();
```

---

## Privacy & Security

### How Your Address is Protected

1. **Encrypted Storage**: All addresses are encrypted end-to-end in Veyvault
2. **ZKP Tokens**: Sites receive zero-knowledge proof tokens, not raw addresses
3. **Access Control**: You explicitly grant and can revoke access at any time
4. **Audit Trail**: All access is logged for transparency
5. **Time-Limited**: Access can have expiration dates

### What Sites Can See

When you grant a site access to your address:

- ✅ They get an **encrypted token** that proves you have a valid address
- ✅ They can use it for **delivery** without seeing the full address
- ❌ They **cannot** see your raw street address, postal code, or name
- ❌ They **cannot** share or transfer the token to other sites

### Data Sovereignty

You maintain complete control:

- 🔑 **You own** your address data
- 👁️ **You control** who can access it
- 🗑️ **You can delete** access at any time
- 📊 **You can audit** all usage

---

## Use Cases

### E-Commerce Shopping

1. Search for online stores selling specific products
2. Click on a store from search results
3. Browse and add items to cart
4. At checkout, use Veyvault address automatically
5. Complete purchase without typing address

### Restaurant Booking

1. Search for restaurants in your area
2. Find Veyform-enabled restaurants
3. Make a reservation
4. Address is used for delivery or table booking confirmation
5. No need to type address each time

### Service Providers

1. Search for local services (cleaning, delivery, repair)
2. Book a service through Veyvault search
3. Service provider gets address only when needed
4. Revoke access after service is complete

---

## API Reference

### Site Search

```typescript
searchSites(request: SiteSearchRequest): Promise<SiteSearchResponse>

interface SiteSearchRequest {
  query?: string;          // Text search
  category?: string;       // Category filter
  location?: string;       // Location filter
  country?: string;        // Country filter
  services?: string[];     // Service type filter
  limit?: number;          // Results per page
  offset?: number;         // Pagination offset
}
```

### Site Access

```typescript
// Grant access
grantSiteAccess(
  siteId: string, 
  addressId: string, 
  permissions: string[]
): Promise<SiteAccess>

// List authorized sites
listAuthorizedSites(): Promise<SiteAccess[]>

// Revoke access
revokeSiteAccess(request: RevokeAccessRequest): Promise<void>

// Get access history
getSiteAccessHistory(siteId: string): Promise<SiteAccessHistory[]>
getAllAccessHistory(): Promise<SiteAccessHistory[]>
```

---

## Future Enhancements

- 🔍 **Smart Recommendations**: AI-powered site suggestions based on your preferences
- 🎯 **Personalized Search**: Search results ranked by your usage patterns
- 📱 **Push Notifications**: Alerts when favorite sites have new offerings
- 🌐 **International Expansion**: Support for more countries and regions
- 🤝 **Social Features**: Share favorite sites with Veyvault friends
- 🎁 **Loyalty Integration**: Automatic loyalty program enrollment with consent

---

## FAQs

### Q: Is my address visible to sites when I grant access?

**A:** No. Sites only receive an encrypted token. Your raw address is only decrypted at the final delivery stage by authorized carriers.

### Q: Can I limit how many times a site can use my address?

**A:** Yes. You can set usage limits and expiration dates when granting access (feature coming soon).

### Q: What happens if I revoke access while an order is in transit?

**A:** The current order will complete normally, but the site won't be able to use your address for future orders.

### Q: Can sites transfer my address token to other sites?

**A:** No. Tokens are cryptographically bound to the specific site and cannot be transferred.

### Q: How often is the site registry updated?

**A:** The registry is updated in real-time as new sites integrate Veyform.

---

**Last Updated**: 2025-12-04
