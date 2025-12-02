/**
 * Apple Wallet Integration Example
 * 
 * This example shows how to integrate address ID cards with Apple Wallet (Passbook).
 * 
 * Note: This is a conceptual example. Actual Apple Wallet integration
 * requires creating .pkpass files and proper signing with Apple certificates.
 */

import {
  createAddressIDCard,
  createFriendAddressQR,
  generateQRData,
  type DecryptedAddress,
  type AddressIDCard
} from '@vey/qr-nfc';

/**
 * Apple Wallet Pass data structure (simplified)
 * 
 * For full implementation, see:
 * https://developer.apple.com/documentation/walletpasses
 */
interface AppleWalletPass {
  // Standard pass information
  formatVersion: number;
  passTypeIdentifier: string;
  serialNumber: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;
  
  // Pass style (genericPass, boardingPass, coupon, eventTicket, storeCard)
  generic?: {
    primaryFields: Array<{
      key: string;
      label: string;
      value: string;
    }>;
    secondaryFields: Array<{
      key: string;
      label: string;
      value: string;
    }>;
    auxiliaryFields: Array<{
      key: string;
      label: string;
      value: string;
    }>;
    backFields: Array<{
      key: string;
      label: string;
      value: string;
    }>;
  };
  
  // Barcode/QR
  barcodes?: Array<{
    format: 'PKBarcodeFormatQR';
    message: string;
    messageEncoding: string;
    altText?: string;
  }>;
  
  // Colors
  backgroundColor?: string;
  foregroundColor?: string;
  labelColor?: string;
  
  // Images (logo, icon, strip, thumbnail, background, footer)
  // These would be actual image files in the .pkpass bundle
  logoText?: string;
}

/**
 * Create Apple Wallet pass from Address ID Card
 */
async function createAppleWalletPass(
  card: AddressIDCard,
  userAddress: DecryptedAddress
): Promise<AppleWalletPass> {
  // Generate QR code for the pass
  const qrPayload = {
    type: 'address' as const,
    version: 1,
    data: {
      pid: card.pid,
      country: card.country,
      locale: card.locale
    }
  };
  
  const qrData = generateQRData(qrPayload);
  
  return {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.vey.address-card',
    serialNumber: card.pid,
    teamIdentifier: 'YOUR_TEAM_ID',
    organizationName: 'Vey Address System',
    description: 'Address ID Card',
    
    generic: {
      primaryFields: [
        {
          key: 'country',
          label: 'Country / Language',
          value: `${card.country} / ${card.locale === 'ja' ? '日本語' : 'English'}`
        }
      ],
      
      secondaryFields: [
        {
          key: 'pid',
          label: 'PID',
          value: card.pid
        },
        {
          key: 'status',
          label: 'Status',
          value: card.status.toUpperCase()
        }
      ],
      
      auxiliaryFields: [
        {
          key: 'issued',
          label: 'Issued',
          value: new Date(card.issued_at).toLocaleDateString()
        }
      ],
      
      backFields: [
        {
          key: 'full-address',
          label: 'Full Address (Owner Only)',
          value: [
            userAddress.recipient || '',
            userAddress.street_address,
            userAddress.city,
            userAddress.province || '',
            userAddress.postal_code,
            userAddress.country
          ].filter(Boolean).join('\n')
        },
        {
          key: 'phone',
          label: 'Phone',
          value: userAddress.phone || 'N/A'
        },
        {
          key: 'email',
          label: 'Email',
          value: userAddress.email || 'N/A'
        },
        {
          key: 'privacy-notice',
          label: 'Privacy Notice',
          value: 'This address is encrypted and can only be viewed by you. Only the PID is shared with services.'
        }
      ]
    },
    
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: qrData,
        messageEncoding: 'iso-8859-1',
        altText: card.pid
      }
    ],
    
    backgroundColor: 'rgb(33, 150, 243)',  // Blue
    foregroundColor: 'rgb(255, 255, 255)', // White
    labelColor: 'rgb(200, 230, 255)',      // Light blue
    logoText: 'Address ID'
  };
}

/**
 * Create .pkpass bundle (conceptual)
 * 
 * In production, this would:
 * 1. Create pass.json file
 * 2. Add required images (icon, logo, etc.)
 * 3. Create manifest.json with SHA-1 hashes
 * 4. Sign manifest with Apple certificate
 * 5. Create .pkpass ZIP file
 */
function createPkpassBundle(pass: AppleWalletPass): {
  passJson: string;
  requiredFiles: string[];
  instructions: string[];
} {
  return {
    passJson: JSON.stringify(pass, null, 2),
    requiredFiles: [
      'pass.json',
      'icon.png',           // 29x29 @1x
      'icon@2x.png',        // 58x58 @2x
      'icon@3x.png',        // 87x87 @3x
      'logo.png',           // 160x50 @1x
      'logo@2x.png',        // 320x100 @2x
      'logo@3x.png',        // 480x150 @3x
      'manifest.json',      // SHA-1 hashes of all files
      'signature'           // PKCS#7 signature
    ],
    instructions: [
      '1. Create pass.json with the pass data',
      '2. Add icon and logo images in PNG format',
      '3. Generate manifest.json with SHA-1 hashes',
      '4. Sign manifest.json with your Apple developer certificate',
      '5. Create a ZIP file with all contents',
      '6. Rename the ZIP to .pkpass extension',
      '7. Serve the .pkpass file with content-type: application/vnd.apple.pkpass'
    ]
  };
}

/**
 * Example usage
 */
async function main() {
  console.log('=== Apple Wallet Integration Example ===\n');

  // User's address
  const myAddress: DecryptedAddress = {
    recipient: '山田太郎',
    street_address: '千代田区千代田1-1',
    city: '千代田区',
    province: '東京都',
    postal_code: '100-0001',
    country: 'JP',
    phone: '+81-3-1234-5678',
    email: 'taro.yamada@example.com'
  };

  // Private key (managed by wallet)
  const privateKey = 'demo-private-key-for-testing-only';

  // Step 1: Create Address ID Card
  console.log('1. Creating Address ID Card...');
  const addressCard = await createAddressIDCard(
    myAddress,
    'ja',
    privateKey
  );

  console.log('✓ Address ID Card created:');
  console.log('  PID:', addressCard.pid);
  console.log('  Country:', addressCard.country);
  console.log('  Status:', addressCard.status);
  console.log();

  // Step 2: Create Apple Wallet Pass
  console.log('2. Creating Apple Wallet Pass...');
  const walletPass = await createAppleWalletPass(addressCard, myAddress);

  console.log('✓ Apple Wallet Pass created:');
  console.log('  Pass Type:', walletPass.passTypeIdentifier);
  console.log('  Serial Number:', walletPass.serialNumber);
  console.log('  Organization:', walletPass.organizationName);
  console.log('  Description:', walletPass.description);
  console.log();

  console.log('  Primary Fields:');
  walletPass.generic?.primaryFields.forEach(field => {
    console.log(`    ${field.label}: ${field.value}`);
  });
  console.log();

  console.log('  Secondary Fields:');
  walletPass.generic?.secondaryFields.forEach(field => {
    console.log(`    ${field.label}: ${field.value}`);
  });
  console.log();

  // Step 3: Create .pkpass bundle info
  console.log('3. Creating .pkpass bundle (conceptual)...');
  const pkpassBundle = createPkpassBundle(walletPass);

  console.log('✓ Required Files:');
  pkpassBundle.requiredFiles.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });
  console.log();

  console.log('✓ Build Instructions:');
  pkpassBundle.instructions.forEach((instruction, i) => {
    console.log(`  ${instruction}`);
  });
  console.log();

  // Step 4: Display pass UI (conceptual)
  console.log('4. Apple Wallet Pass UI (Front):');
  console.log('┌─────────────────────────────────────┐');
  console.log('│  Address ID     🏠                  │');
  console.log('├─────────────────────────────────────┤');
  console.log('│                                     │');
  console.log('│  JP / 日本語                         │');
  console.log('│                                     │');
  console.log('│  PID: ' + addressCard.pid.substring(0, 20) + '... │');
  console.log('│  Status: ACTIVE                     │');
  console.log('│                                     │');
  console.log('│  Issued: ' + new Date(addressCard.issued_at).toLocaleDateString() + '           │');
  console.log('│                                     │');
  console.log('└─────────────────────────────────────┘');
  console.log();

  console.log('5. Apple Wallet Pass UI (Back):');
  console.log('┌─────────────────────────────────────┐');
  console.log('│  Full Address (Owner Only)          │');
  console.log('│  ' + myAddress.recipient + '                     │');
  console.log('│  ' + myAddress.postal_code + '                     │');
  console.log('│  ' + myAddress.province + '                     │');
  console.log('│  ' + myAddress.city + '                │');
  console.log('│  ' + myAddress.street_address + '    │');
  console.log('│                                     │');
  console.log('│  Phone: ' + myAddress.phone + '       │');
  console.log('│  Email: ' + myAddress.email + '  │');
  console.log('│                                     │');
  console.log('│  ┌─────────────────────────────┐   │');
  console.log('│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │');
  console.log('│  │  ▓▓  QR CODE HERE  ▓▓       │   │');
  console.log('│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │');
  console.log('│  └─────────────────────────────┘   │');
  console.log('│                                     │');
  console.log('│  Privacy Notice:                    │');
  console.log('│  This address is encrypted and      │');
  console.log('│  can only be viewed by you.         │');
  console.log('│                                     │');
  console.log('└─────────────────────────────────────┘');
  console.log();

  // Step 5: Show pass.json snippet
  console.log('6. pass.json (snippet):');
  console.log('─────────────────────────────────────');
  console.log(pkpassBundle.passJson.substring(0, 500) + '...');
  console.log('─────────────────────────────────────');
  console.log();

  console.log('=== Integration Complete ===');
  console.log();
  console.log('Next Steps:');
  console.log('1. Get Apple Developer account and certificates');
  console.log('2. Create pass type identifier');
  console.log('3. Generate icon and logo images');
  console.log('4. Build and sign .pkpass file');
  console.log('5. Host .pkpass file on HTTPS server');
  console.log('6. Add "Add to Apple Wallet" button to your app/website');
}

// Run the example
main().catch(console.error);
