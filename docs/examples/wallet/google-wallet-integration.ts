/**
 * Google Wallet Integration Example
 * 
 * This example shows how to integrate address ID cards with Google Wallet.
 * 
 * Note: This is a conceptual example. Actual Google Wallet integration
 * requires the Google Wallet API and proper authentication.
 */

import {
  createAddressIDCard,
  createFriendAddressQR,
  generateQRData,
  type DecryptedAddress,
  type AddressIDCard
} from '@vey/qr-nfc';

/**
 * Google Wallet Pass data structure (simplified)
 * 
 * For full implementation, see:
 * https://developers.google.com/wallet/generic/web
 */
interface GoogleWalletPass {
  id: string;
  classId: string;
  state: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  
  // Pass data
  cardTitle: {
    defaultValue: {
      language: string;
      value: string;
    };
  };
  
  header: {
    defaultValue: {
      language: string;
      value: string;
    };
  };
  
  textModulesData?: Array<{
    header: string;
    body: string;
  }>;
  
  // Barcode/QR
  barcode?: {
    type: 'QR_CODE';
    value: string;
    alternateText?: string;
  };
  
  // Custom data
  appLinkData?: {
    androidAppLinkInfo?: {
      appTarget: {
        packageName: string;
      };
    };
  };
}

/**
 * Create Google Wallet pass from Address ID Card
 */
async function createGoogleWalletPass(
  card: AddressIDCard,
  userAddress: DecryptedAddress
): Promise<GoogleWalletPass> {
  // Generate QR code for the pass
  const qrPayload = {
    type: 'address' as const,
    version: 1,
    data: {
      pid: card.pid,
      country: card.country,
      locale: card.locale,
      // Don't include encrypted address in public QR
      // Only include PID for verification
    }
  };
  
  const qrData = generateQRData(qrPayload);
  
  return {
    id: `address-card-${card.pid}`,
    classId: 'address-id-card-class',
    state: card.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    
    cardTitle: {
      defaultValue: {
        language: card.locale,
        value: 'Address ID Card'
      }
    },
    
    header: {
      defaultValue: {
        language: card.locale,
        value: `${card.country} / ${card.locale === 'ja' ? '日本語' : 'English'}`
      }
    },
    
    textModulesData: [
      {
        header: 'PID',
        body: card.pid
      },
      {
        header: 'Country',
        body: card.country
      },
      {
        header: 'Issued',
        body: new Date(card.issued_at).toLocaleDateString()
      },
      {
        header: 'Status',
        body: card.status.toUpperCase()
      }
    ],
    
    barcode: {
      type: 'QR_CODE',
      value: qrData,
      alternateText: card.pid
    },
    
    appLinkData: {
      androidAppLinkInfo: {
        appTarget: {
          packageName: 'com.example.vey.wallet'
        }
      }
    }
  };
}

/**
 * Example usage
 */
async function main() {
  console.log('=== Google Wallet Integration Example ===\n');

  // User's address
  const myAddress: DecryptedAddress = {
    recipient: '山田太郎',
    street_address: '千代田区千代田1-1',
    city: '千代田区',
    province: '東京都',
    postal_code: '100-0001',
    country: 'JP',
    phone: '+81-3-1234-5678'
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

  // Step 2: Create Google Wallet Pass
  console.log('2. Creating Google Wallet Pass...');
  const walletPass = await createGoogleWalletPass(addressCard, myAddress);

  console.log('✓ Google Wallet Pass created:');
  console.log('  Pass ID:', walletPass.id);
  console.log('  Class ID:', walletPass.classId);
  console.log('  State:', walletPass.state);
  console.log('  Title:', walletPass.cardTitle.defaultValue.value);
  console.log('  Header:', walletPass.header.defaultValue.value);
  console.log();

  console.log('  Pass Data:');
  walletPass.textModulesData?.forEach(module => {
    console.log(`    ${module.header}: ${module.body}`);
  });
  console.log();

  console.log('  Barcode:');
  console.log('    Type:', walletPass.barcode?.type);
  console.log('    Alternate Text:', walletPass.barcode?.alternateText);
  console.log('    Value (first 100 chars):', walletPass.barcode?.value.substring(0, 100) + '...');
  console.log();

  // Step 3: Create "Add to Google Wallet" link
  console.log('3. Generating "Add to Google Wallet" link...');
  
  // In production, you would use the Google Wallet API to create a JWT
  // and generate an "Add to Google Wallet" link
  const addToWalletLink = `https://pay.google.com/gp/v/save/${walletPass.id}`;
  
  console.log('✓ Add to Wallet Link:', addToWalletLink);
  console.log();

  // Step 4: Display pass UI (conceptual)
  console.log('4. Google Wallet Pass UI (conceptual):');
  console.log('┌─────────────────────────────────────┐');
  console.log('│  Address ID Card                    │');
  console.log('├─────────────────────────────────────┤');
  console.log('│                                     │');
  console.log('│  🌍 JP / 日本語                      │');
  console.log('│                                     │');
  console.log('│  PID: ' + addressCard.pid.substring(0, 20) + '...│');
  console.log('│                                     │');
  console.log('│  ┌─────────────────────────────┐   │');
  console.log('│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │');
  console.log('│  │  ▓▓  QR CODE HERE  ▓▓       │   │');
  console.log('│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │');
  console.log('│  └─────────────────────────────┘   │');
  console.log('│                                     │');
  console.log('│  Country: JP                        │');
  console.log('│  Issued: ' + new Date(addressCard.issued_at).toLocaleDateString() + '              │');
  console.log('│  Status: ACTIVE                     │');
  console.log('│                                     │');
  console.log('└─────────────────────────────────────┘');
  console.log();

  // Step 5: Friend sharing QR
  console.log('5. Creating Friend Sharing QR for Google Wallet...');
  const friendQR = await createFriendAddressQR(
    myAddress,
    'ja',
    privateKey,
    7
  );

  const friendQRData = generateQRData({
    type: 'address',
    version: 1,
    data: friendQR
  });

  console.log('✓ Friend QR created for sharing:');
  console.log('  Friend PID:', friendQR.pid);
  console.log('  Expires:', friendQR.expires_at);
  console.log('  QR Data (first 100 chars):', friendQRData.substring(0, 100) + '...');
  console.log();

  console.log('=== Integration Complete ===');
  console.log();
  console.log('Next Steps:');
  console.log('1. Implement Google Wallet API authentication');
  console.log('2. Create JWT for pass creation');
  console.log('3. Handle pass updates and revocation');
  console.log('4. Implement deep linking to your app');
  console.log('5. Add pass to Google Wallet using the API');
}

// Run the example
main().catch(console.error);
