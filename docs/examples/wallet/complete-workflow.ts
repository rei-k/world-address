/**
 * Complete Wallet Integration Example
 * 
 * This example demonstrates the full workflow of using wallet features:
 * 1. Create Address ID Cards
 * 2. Share address via Friend QR
 * 3. Generate shipping waybill
 * 4. Create hotel check-in token
 * 5. Handle address moving/forwarding
 */

import {
  createAddressIDCard,
  revokeAddressIDCard,
  createFriendAddressQR,
  revokeFriendAddressQR,
  createWaybillToken,
  createHotelCheckinToken,
  createAddressForwarding,
  addServiceNotification,
  markServiceNotified,
  createAuditLogEntry,
  isAddressCardValid,
  isFriendQRValid,
  isHotelTokenValid,
  WalletCrypto,
  generateQRData,
  type DecryptedAddress,
  type WalletFeatures
} from '@vey/qr-nfc';

// Sample addresses
const myHomeAddress: DecryptedAddress = {
  recipient: '山田太郎',
  street_address: '千代田区千代田1-1',
  city: '千代田区',
  province: '東京都',
  postal_code: '100-0001',
  country: 'JP',
  building: '皇居ビル',
  floor: '3F',
  room: '301',
  phone: '+81-3-1234-5678',
  email: 'taro.yamada@example.com'
};

const friendAddress: DecryptedAddress = {
  recipient: '田中花子',
  street_address: '渋谷区渋谷2-24-12',
  city: '渋谷区',
  province: '東京都',
  postal_code: '150-0002',
  country: 'JP',
  phone: '+81-3-9876-5432'
};

// Private key (managed by wallet - this is a demo key)
const privateKey = 'demo-private-key-for-testing-only';

// Initialize wallet features storage
const wallet: WalletFeatures = {
  address_cards: [],
  friend_qrs: [],
  waybills: [],
  hotel_checkins: [],
  forwardings: [],
  audit_log: [],
  default_country: 'JP',
  default_language: 'ja'
};

async function main() {
  console.log('=== Wallet Integration Example ===\n');

  // ============================================
  // 1. Create Address ID Card
  // ============================================
  console.log('1. Creating Address ID Card...');
  const homeCard = await createAddressIDCard(
    myHomeAddress,
    'ja',
    privateKey
  );
  wallet.address_cards.push(homeCard);

  console.log('✓ Address ID Card created:');
  console.log('  PID:', homeCard.pid);
  console.log('  Country:', homeCard.country);
  console.log('  Locale:', homeCard.locale);
  console.log('  Status:', homeCard.status);
  console.log('  Valid:', isAddressCardValid(homeCard));
  console.log();

  // Add audit log entry
  wallet.audit_log.push(createAuditLogEntry(
    homeCard.pid,
    'created',
    'User',
    'Initial card creation',
    'Tokyo'
  ));

  // ============================================
  // 2. Create Friend Address QR
  // ============================================
  console.log('2. Creating Friend Address QR...');
  const friendQR = await createFriendAddressQR(
    myHomeAddress,
    'ja',
    privateKey,
    7  // 7 days expiry
  );
  wallet.friend_qrs.push(friendQR);

  console.log('✓ Friend QR created:');
  console.log('  Friend PID:', friendQR.pid);
  console.log('  Expires at:', friendQR.expires_at);
  console.log('  Valid:', isFriendQRValid(friendQR));
  console.log();

  // Generate QR code data
  const qrData = generateQRData({
    type: 'address',
    version: 1,
    data: friendQR
  });
  console.log('  QR Data (first 100 chars):', qrData.substring(0, 100) + '...');
  console.log();

  // ============================================
  // 3. Create Shipping Waybill
  // ============================================
  console.log('3. Creating Shipping Waybill...');
  const waybill = await createWaybillToken(
    myHomeAddress,
    friendAddress,
    'yamato',
    privateKey,
    {
      pickupOptions: {
        scheduled_time: '2025-01-10T14:00:00Z',
        location_type: 'home',
        special_instructions: '玄関前に置いてください'
      },
      sizePreset: 'medium'
    }
  );
  wallet.waybills.push(waybill);

  console.log('✓ Waybill created:');
  console.log('  Waybill ID:', waybill.waybill_id);
  console.log('  Tracking Number:', waybill.tracking_number);
  console.log('  From PID:', waybill.from_pid);
  console.log('  To PID:', waybill.to_pid);
  console.log('  Carrier:', waybill.carrier);
  console.log('  Pickup Time:', waybill.pickup_options?.scheduled_time);
  console.log();

  // Add audit log for address decryption
  wallet.audit_log.push(createAuditLogEntry(
    waybill.from_pid,
    'shared',
    'Yamato Logistics',
    'Shipping waybill',
    'Kanto'
  ));

  // ============================================
  // 4. Create Hotel Check-in Token
  // ============================================
  console.log('4. Creating Hotel Check-in Token...');
  const hotelToken = await createHotelCheckinToken(
    myHomeAddress,
    'RES-2025-001',
    'HOTEL-TOKYO-001',
    '2025-01-15',
    '2025-01-17',
    privateKey,
    true  // Grant permission to facility
  );
  wallet.hotel_checkins.push(hotelToken);

  console.log('✓ Hotel Check-in Token created:');
  console.log('  Token ID:', hotelToken.token_id);
  console.log('  Guest PID:', hotelToken.guest_pid);
  console.log('  Reservation ID:', hotelToken.reservation_id);
  console.log('  Facility ID:', hotelToken.facility_id);
  console.log('  Check-in:', hotelToken.checkin_date);
  console.log('  Check-out:', hotelToken.checkout_date);
  console.log('  Permission Granted:', hotelToken.facility_permission_granted);
  console.log('  Valid:', isHotelTokenValid(hotelToken));
  console.log();

  // ============================================
  // 5. Simulate Address Moving/Forwarding
  // ============================================
  console.log('5. Simulating Address Moving...');

  const newAddress: DecryptedAddress = {
    recipient: '山田太郎',
    street_address: '港区六本木6-10-1',
    city: '港区',
    province: '東京都',
    postal_code: '106-0032',
    country: 'JP',
    building: '六本木ヒルズ',
    floor: '10F',
    room: '1001',
    phone: '+81-3-1234-5678',
    email: 'taro.yamada@example.com'
  };

  // Create new address card
  const newCard = await createAddressIDCard(
    newAddress,
    'ja',
    privateKey
  );
  wallet.address_cards.push(newCard);

  // Revoke old card
  const revokedOldCard = revokeAddressIDCard(homeCard);
  wallet.address_cards[0] = revokedOldCard;

  console.log('✓ Old card revoked:');
  console.log('  Old PID:', revokedOldCard.pid);
  console.log('  Status:', revokedOldCard.status);
  console.log('  Revoked at:', revokedOldCard.revoked_at);
  console.log();

  console.log('✓ New card created:');
  console.log('  New PID:', newCard.pid);
  console.log('  Status:', newCard.status);
  console.log();

  // Create forwarding
  let forwarding = await createAddressForwarding(
    myHomeAddress,
    newAddress,
    6,  // 6 months forwarding
    privateKey
  );
  wallet.forwardings.push(forwarding);

  console.log('✓ Address Forwarding created:');
  console.log('  Old PID:', forwarding.old_pid);
  console.log('  New PID:', forwarding.new_pid);
  console.log('  Forwarding Period:', forwarding.forwarding_period);
  console.log('  Forwarding Expires:', forwarding.forwarding_expires_at);
  console.log();

  // Add services to notify
  forwarding = addServiceNotification(forwarding, 'financial', 'My Bank');
  forwarding = addServiceNotification(forwarding, 'logistics', 'Amazon');
  forwarding = addServiceNotification(forwarding, 'hotel', 'Tokyo Hotel Chain');

  console.log('✓ Services to notify:');
  forwarding.notify_services?.forEach(service => {
    console.log(`  - ${service.service_name} (${service.service_type}): ${service.notified ? '✓ Notified' : '⏳ Pending'}`);
  });
  console.log();

  // Simulate notifying services
  forwarding = markServiceNotified(forwarding, 'My Bank');
  forwarding = markServiceNotified(forwarding, 'Amazon');

  console.log('✓ Updated notification status:');
  forwarding.notify_services?.forEach(service => {
    console.log(`  - ${service.service_name}: ${service.notified ? '✓ Notified' : '⏳ Pending'}`);
  });
  console.log();

  // ============================================
  // 6. Decrypt Address Example (for demonstration)
  // ============================================
  console.log('6. Decrypting Address (for demonstration)...');
  const crypto = new WalletCrypto();

  try {
    const decrypted = await crypto.decryptAddress(
      homeCard.encrypted_address,
      privateKey
    );

    console.log('✓ Address decrypted successfully:');
    console.log('  Recipient:', decrypted.recipient);
    console.log('  Street:', decrypted.street_address);
    console.log('  City:', decrypted.city);
    console.log('  Province:', decrypted.province);
    console.log('  Postal Code:', decrypted.postal_code);
    console.log('  Country:', decrypted.country);
    console.log();

    // Log the decryption
    wallet.audit_log.push(createAuditLogEntry(
      homeCard.pid,
      'decrypted',
      'Wallet App',
      'User verification',
      'Tokyo'
    ));
  } catch (error) {
    console.error('✗ Failed to decrypt address:', error);
  }

  // ============================================
  // 7. Revoke Friend QR
  // ============================================
  console.log('7. Revoking Friend QR...');
  const revokedQR = revokeFriendAddressQR(friendQR);
  wallet.friend_qrs[0] = revokedQR;

  console.log('✓ Friend QR revoked:');
  console.log('  PID:', revokedQR.pid);
  console.log('  Revoked:', revokedQR.revoked);
  console.log('  Revoked at:', revokedQR.revoked_at);
  console.log('  Valid:', isFriendQRValid(revokedQR));
  console.log();

  // ============================================
  // 8. Display Wallet Summary
  // ============================================
  console.log('8. Wallet Summary:');
  console.log('─────────────────────────────────────');
  console.log(`Address Cards: ${wallet.address_cards.length}`);
  wallet.address_cards.forEach((card, i) => {
    console.log(`  ${i + 1}. ${card.pid} - ${card.status}`);
  });
  console.log();

  console.log(`Friend QRs: ${wallet.friend_qrs.length}`);
  wallet.friend_qrs.forEach((qr, i) => {
    console.log(`  ${i + 1}. ${qr.pid} - ${qr.revoked ? 'Revoked' : 'Active'}`);
  });
  console.log();

  console.log(`Waybills: ${wallet.waybills.length}`);
  wallet.waybills.forEach((wb, i) => {
    console.log(`  ${i + 1}. ${wb.tracking_number} - ${wb.carrier}`);
  });
  console.log();

  console.log(`Hotel Check-ins: ${wallet.hotel_checkins.length}`);
  wallet.hotel_checkins.forEach((hc, i) => {
    console.log(`  ${i + 1}. ${hc.reservation_id} - ${hc.status}`);
  });
  console.log();

  console.log(`Forwardings: ${wallet.forwardings.length}`);
  wallet.forwardings.forEach((fw, i) => {
    console.log(`  ${i + 1}. ${fw.old_pid} → ${fw.new_pid}`);
  });
  console.log();

  console.log(`Audit Log Entries: ${wallet.audit_log.length}`);
  wallet.audit_log.forEach((log, i) => {
    console.log(`  ${i + 1}. ${log.action} - ${log.pid.substring(0, 15)}... - ${log.timestamp}`);
  });
  console.log();

  console.log(`Default Country: ${wallet.default_country}`);
  console.log(`Default Language: ${wallet.default_language}`);
  console.log('─────────────────────────────────────');
  console.log();

  console.log('=== Example Complete ===');
}

// Run the example
main().catch(console.error);
