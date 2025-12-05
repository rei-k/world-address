# Default Address Feature with QR and Barcode Support

## Overview

This implementation adds comprehensive default address functionality to Veyvault with dual QR code and barcode support, enabling seamless integration with hotel check-ins, financial institutions, and VeyPOS systems.

## Features Implemented

### 1. Default Address Management

**Type System Updates:**
- Added `isDefault` field to `Address` type
- Added `defaultAddressId` to `User` type for quick reference
- Added `AutoFillData` interface for auto-fill functionality

**User Interface:**
- **Address Card:** Displays "⭐ Default" badge for default addresses
- **Set as Default Button:** One-click default address assignment
- **Settings Page:** Dropdown to select default address from existing addresses
- **Auto-fill Support:** Name, phone, and address data ready for external use

**Use Cases:**
- Hotel check-in systems
- Financial institution forms
- Government services
- Emergency contacts
- Any form requiring standard address information

### 2. Dual QR Code & Barcode Display

**QRBarcodeDisplay Component:**
- Toggle between QR code and barcode display modes
- Uses `qrcode.react` for QR code generation
- Uses `jsbarcode` for CODE128 barcode generation
- Unified download and share functionality

**Display Modes:**
- **QR Code:** For mobile scanning and friend sharing
- **Barcode (CODE128):** For hotel check-ins and financial institutions

**Features:**
- Download as PNG or SVG
- Share functionality (Web Share API with clipboard fallback)
- Encrypted address tokens in both formats
- Privacy-preserving design

### 3. Notification System

**NotificationService:**
- Dual notification delivery (Veyvault + VeyPOS)
- Notification types:
  - `address_registered`: New address added
  - `address_updated`: Default address changed
  - `qr_scanned`: QR code scanned by another user
  - `barcode_scanned`: Barcode scanned at a terminal

**Notification Flow:**
1. User registers or updates default address
2. Notification sent to Veyvault (user notification)
3. Notification sent to VeyPOS (system integration)
4. Real-time updates on both platforms

### 4. Enhanced Address Service

**New Methods:**
- `setDefaultAddress(addressId, userId)`: Set address as default
- `getAutoFillData(user)`: Get auto-fill data for forms
- `registerAddress(address, userId)`: Register with notifications

**Integration:**
- Automatic notification on address registration
- Automatic notification on default address change
- Privacy-preserving ZKP token handling

## Technical Implementation

### Dependencies Added

```json
{
  "jsbarcode": "^3.11.6",
  "@types/jsbarcode": "^3.11.3"
}
```

### Key Files Modified/Created

1. **src/types/index.ts**
   - Extended `User` interface with `defaultAddressId`
   - Extended `Address` interface with `isDefault`
   - Added notification and barcode types

2. **src/services/notification.service.ts** (NEW)
   - Notification management for Veyvault and VeyPOS
   - Multi-channel notification delivery

3. **src/services/address.service.ts**
   - Default address management methods
   - Auto-fill data retrieval
   - Notification integration

4. **app/components/QRBarcodeDisplay.tsx** (NEW)
   - Dual display mode (QR/Barcode)
   - Download and share functionality
   - Privacy-preserving design

5. **app/components/AddressCard.tsx**
   - Default address badge display
   - "Set as Default" button
   - Updated QR/Barcode link

6. **app/addresses/page.tsx**
   - Default address setting handler
   - Updated tips section

7. **app/qr/page.tsx**
   - Updated to use QRBarcodeDisplay
   - Enhanced feature descriptions

8. **app/settings/page.tsx**
   - Default address selection dropdown
   - Enhanced profile management
   - Barcode scan notifications toggle

## Usage Examples

### Setting a Default Address

```typescript
// From UI
const handleSetDefault = async (id: string) => {
  try {
    await AddressService.setDefaultAddress(id, userId);
    // Notifications automatically sent to Veyvault and VeyPOS
    alert('Default address updated');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Getting Auto-fill Data

```typescript
// For hotel check-in forms
const autoFillData = await AddressService.getAutoFillData(currentUser);
if (autoFillData) {
  // Fill form fields
  formData.name = autoFillData.name;
  formData.phone = autoFillData.phone;
  formData.address = autoFillData.address;
}
```

### Generating QR Code and Barcode

```typescript
// Component automatically generates both formats
<QRBarcodeDisplay address={selectedAddress} />

// User can toggle between:
// - QR Code (for mobile scanning)
// - Barcode CODE128 (for terminal scanning)
```

## Integration Points

### VeyPOS Integration

When an address is registered or set as default:
1. Notification sent to VeyPOS API
2. VeyPOS can pre-populate user data
3. Faster checkout at physical locations

### Hotel Check-in Systems

1. User shows barcode at check-in counter
2. Staff scans barcode with VeyPOS-compatible scanner
3. System retrieves encrypted address token
4. Auto-fills guest information
5. User notified of scan event

### Financial Institutions

1. User selects default address in settings
2. Forms auto-fill name, phone, and address
3. Privacy maintained through encryption
4. Audit trail via notifications

## Privacy & Security

### End-to-End Encryption
- All address data encrypted before storage
- QR codes and barcodes contain encrypted tokens only
- Raw addresses never exposed in transit

### Zero-Knowledge Proof
- Address verification without revealing details
- Compatible with existing ZKP protocol
- Delivery capability proven without disclosure

### Notification Privacy
- Scan notifications don't include scanner identity (optional)
- Access logs maintained for audit
- User controls all sharing permissions

## Future Enhancements

1. **Barcode Format Options**
   - Support for EAN13, UPC, ITF14
   - Regional format preferences

2. **Auto-fill API**
   - Public API for third-party integration
   - OAuth-based authorization
   - Rate limiting and usage tracking

3. **Smart Default Selection**
   - AI-based context-aware defaults
   - Time-based default switching
   - Location-based recommendations

4. **Notification Channels**
   - Email notifications
   - SMS notifications
   - Push notifications (mobile apps)

5. **Advanced QR/Barcode Features**
   - Custom branding on QR codes
   - Multi-address QR codes
   - Expiring QR codes for temporary use

## Testing Checklist

- [x] TypeScript type checking passes
- [x] ESLint validation passes
- [x] Component renders correctly
- [ ] Default address setting works
- [ ] QR code generation works
- [ ] Barcode generation works
- [ ] Toggle between QR/barcode works
- [ ] Download functionality works (PNG/SVG)
- [ ] Share functionality works
- [ ] Notifications sent on registration
- [ ] Notifications sent on default change
- [ ] Settings page displays addresses correctly
- [ ] Auto-fill data retrieval works

## API Reference

### NotificationService

```typescript
// Send address registered notification
await NotificationService.sendAddressRegisteredNotification(
  userId: string,
  addressId: string,
  addressLabel: string
);

// Send default address updated notification
await NotificationService.sendDefaultAddressUpdatedNotification(
  userId: string,
  addressId: string,
  addressLabel: string
);

// Send QR scanned notification
await NotificationService.sendQRScannedNotification(
  userId: string,
  addressId: string,
  scannedBy?: string
);

// Send barcode scanned notification
await NotificationService.sendBarcodeScannedNotification(
  userId: string,
  addressId: string,
  scannedBy?: string
);
```

### AddressService

```typescript
// Set default address
await AddressService.setDefaultAddress(
  addressId: string,
  userId: string
);

// Get auto-fill data
const data = await AddressService.getAutoFillData(
  user: User
): Promise<AutoFillData | null>;

// Register address with notifications
await AddressService.registerAddress(
  address: CreateAddressRequest,
  userId: string
);
```

## Conclusion

This implementation provides a complete default address management system with dual QR/barcode support, meeting the requirements for hotel check-ins, financial institutions, and VeyPOS integration. The system maintains privacy through encryption while providing seamless auto-fill functionality for users.
