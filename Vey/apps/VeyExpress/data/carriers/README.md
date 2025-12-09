# Worldwide Shipping Carriers Database

世界の配送業者データベース

## Overview

This directory contains comprehensive data for 89 major shipping and logistics carriers from around the world. The data is provided in both YAML and JSON formats for easy integration with various systems.

## 📊 Database Statistics

- **Total Carriers**: 89
- **Countries Covered**: 52
- **Regions**: 6 (Asia, Americas, Europe, Oceania, Middle East, Africa)
- **Version**: 1.0.0
- **Last Updated**: 2025-12-09

## 🌍 Regional Coverage

### Asia (36 carriers)
- **Japan**: Yamato Transport, Sagawa Express, Japan Post
- **China**: SF Express, JD Logistics, China Post, YTO, ZTO, STO, BEST Express, Cainiao
- **Korea**: Korea Post, CJ Logistics, Hanjin
- **Southeast Asia**: Singapore Post, Thailand Post, Vietnam Post, JNE, GrabExpress, Ninja Van, J&T Express, Kerry Express, Lalamove, Shopee Express, Flash Express, SkyNet
- **India**: India Post, Delhivery, Blue Dart
- **Hong Kong & Taiwan**: Hongkong Post, Chunghwa Post

### Americas (12 carriers)
- **United States**: USPS, FedEx, UPS, Amazon Logistics, Uber Direct, DoorDash Drive
- **Canada**: Canada Post, Purolator
- **Latin America**: Correios (Brazil), Correo Argentino, Correos de Chile, Sepomex (Mexico)

### Europe (15 carriers)
- **Global**: DHL Express, TNT
- **Regional**: Royal Mail (UK), DPD (Germany), Hermes (Germany), La Poste (France), Deutsche Post (Germany), GLS, PostNord (Sweden), Poste Italiane (Italy), Russian Post, CDEK

### Oceania (2 carriers)
- Australia Post
- New Zealand Post

### Middle East (2 carriers)
- Aramex (UAE)
- Emirates Post (UAE)

### Africa (2 carriers)
- South African Post Office
- Posta Kenya

### Freight & Logistics (4 carriers)
- Maersk (Sea freight)
- MSC (Sea freight)
- TIKI (Indonesia)
- PostalExpress (Philippines)

## 📋 Data Structure

Each carrier entry includes:

### Basic Information
- `id`: Unique carrier identifier
- `name`: Carrier name (English and local language)
- `code`: Short code for API usage
- `country`: ISO 3166-1 alpha-2 country code
- `region`: Geographic region
- `type`: Carrier type (postal, express, freight, 3pl, 4pl, sea, rail, air, instant)

### Business Information
- `founded`: Year established
- `market_share`: Market share (if available)
- `website`: Official website URL
- `tracking_url`: Package tracking URL
- `api_available`: Whether API integration is available

### Services
Array of services offered, including:
- Service name
- Service type
- Delivery timeframes
- Coverage (countries/regions)
- Weight/dimension limits

### Capabilities
Boolean flags for:
- `tracking`: Real-time tracking
- `proof_of_delivery`: POD support
- `signature_required`: Signature options
- `insurance`: Insurance availability
- `international_shipping`: Cross-border capability
- `pickup_points`: Pickup location support
- `lockers`: Locker delivery support
- Additional specialized capabilities (cold chain, dangerous goods, customs clearance, etc.)

### Coverage
- `domestic`: Domestic shipping availability
- `international`: International shipping availability

## 🔧 Usage

### YAML Format
```yaml
carriers:
  - id: yamato_transport
    name:
      en: Yamato Transport
      local: ヤマト運輸
    code: yamato
    country: JP
    region: asia
    type: express
    # ... more fields
```

### JSON Format
```json
{
  "carriers": [
    {
      "id": "yamato_transport",
      "name": {
        "en": "Yamato Transport",
        "local": "ヤマト運輸"
      },
      "code": "yamato",
      "country": "JP",
      "region": "asia",
      "type": "express"
      // ... more fields
    }
  ]
}
```

### Integration with VeyExpress

This carrier database integrates with the VeyExpress platform for:

1. **Multi-Carrier Comparison** - Compare rates and services across carriers
2. **Carrier Selection** - Choose optimal carrier based on destination and requirements
3. **Tracking Integration** - Unified tracking across all supported carriers
4. **API Integration** - Direct API connections where available
5. **Service Level Selection** - Match customer requirements to carrier capabilities

## 🚀 Carrier Types

- **postal**: National postal services (government-operated)
- **express**: Express courier services (private)
- **freight**: Heavy freight/cargo services
- **3pl/4pl**: Third-party/Fourth-party logistics providers
- **sea/rail/air**: Specialized transport modes
- **instant**: On-demand/same-day delivery services

## 📖 Examples

### Find Carriers by Country
```javascript
const carriers = require('./worldwide-carriers.json');
const jpCarriers = carriers.carriers.filter(c => c.country === 'JP');
// Returns: Yamato, Sagawa, Japan Post
```

### Find International Express Carriers
```javascript
const expressCarriers = carriers.carriers.filter(c => 
  c.type === 'express' && 
  c.coverage.international === true
);
```

### Get Carriers with API Support
```javascript
const apiCarriers = carriers.carriers.filter(c => c.api_available === true);
```

### Find Carriers Supporting Lockers
```javascript
const lockerCarriers = carriers.carriers.filter(c => 
  c.capabilities.lockers === true
);
```

## 🔄 Updates

This database is maintained and updated regularly to ensure accuracy. Updates include:
- New carrier additions
- Service changes
- Capability updates
- Coverage expansions
- API availability changes

## 📚 Data Sources

- Official carrier websites
- Industry reports and market research
- Carrier API documentation
- Logistics industry databases
- Regional postal union data

## 🤝 Contributing

To suggest updates or additions to the carrier database:
1. Verify information from official sources
2. Follow the existing data structure
3. Include both YAML and JSON formats
4. Document data sources

## 📄 License

This data is provided under the MIT License as part of the VeyExpress platform.

## 📞 Support

For questions or issues with the carrier data:
- Email: support@veyexpress.com
- Documentation: https://docs.veyexpress.com
- Discord: https://discord.gg/veyexpress

---

**Last Updated**: 2025-12-09
**Version**: 1.0.0
**Maintained by**: VeyExpress Team
