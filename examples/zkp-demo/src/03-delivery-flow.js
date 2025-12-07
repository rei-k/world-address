/**
 * ZKP Demo - Flow 3: Delivery Execution & Tracking
 * 
 * This demo shows how a carrier accesses the address only when needed
 * for actual delivery, with full audit logging.
 */

import {
  validateAccessPolicy,
  resolvePID,
  createAuditLogEntry,
  createTrackingEvent,
} from '@vey/core';

console.log('📦 ZKP Demo - Flow 3: Delivery Execution & Tracking\n');
console.log('='.repeat(60));

// Mock data (from Flow 2)
const waybillId = 'WAYBILL-ABC-12345';
const pidToken = 'encrypted-pid-token-abc123';
const carrierAccessPolicy = {
  canRevealPID: true,
  accessLevel: 'full',
  allowedCarriers: ['yamato', 'sagawa', 'japan-post'],
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
};

// Step 1: Carrier receives waybill from merchant
console.log('\n📨 Step 1: Carrier receives waybill from merchant...');
console.log('   Waybill ID:', waybillId);
console.log('   Carrier: Yamato Transport');
console.log('   Package Weight: 2.5 kg');
console.log('   Destination: JP-13 (revealed)');
console.log('   Full Address: 🔒 Encrypted');

// Step 2: Carrier validates access policy
console.log('\n🔐 Step 2: Validating carrier access policy...');
const carrier = 'yamato';
const currentTime = Date.now();

const accessValidation = validateAccessPolicy(
  carrierAccessPolicy,
  carrier,
  currentTime
);

if (accessValidation.allowed) {
  console.log('✅ Access GRANTED:');
  console.log('   ✓ Carrier is authorized:', carrier);
  console.log('   ✓ Access policy not expired');
  console.log('   ✓ Access level:', carrierAccessPolicy.accessLevel);
  console.log('   ✓ Can reveal PID:', carrierAccessPolicy.canRevealPID);
} else {
  console.log('❌ Access DENIED:');
  console.log('   Reason:', accessValidation.reason);
  process.exit(1);
}

// Step 3: Resolve PID to actual address (only when needed for delivery)
console.log('\n🗺️  Step 3: Resolving PID to actual address...');
console.log('   ⚠️  This action will be logged for audit purposes');

const pidResolution = resolvePID({
  pidToken: pidToken,
  requestor: `carrier:${carrier}`,
  purpose: 'delivery_execution',
  timestamp: new Date().toISOString(),
  ipAddress: '192.168.1.100',
});

// Mock resolved address
const resolvedAddress = {
  country: 'JP',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
  building: 'サンプルビル',
  room: '301',
  recipient: '山田 太郎',
  phone: '+81-3-1234-5678',
};

console.log('✅ PID resolved to full address:');
console.log('   Recipient:', resolvedAddress.recipient);
console.log('   Phone:', resolvedAddress.phone);
console.log('   Postal Code:', resolvedAddress.postalCode);
console.log('   Prefecture:', resolvedAddress.prefecture);
console.log('   City:', resolvedAddress.city);
console.log('   Street:', resolvedAddress.street);
console.log('   Building:', resolvedAddress.building);
console.log('   Room:', resolvedAddress.room);

// Step 4: Create audit log entry
console.log('\n📝 Step 4: Creating audit log entry...');
const auditEntry = createAuditLogEntry({
  action: 'PID_RESOLVED',
  requestor: `carrier:${carrier}`,
  pidToken: pidToken,
  waybillId: waybillId,
  timestamp: new Date().toISOString(),
  ipAddress: '192.168.1.100',
  purpose: 'delivery_execution',
  accessLevel: 'full',
});

console.log('✅ Audit log created:');
console.log('   Log ID:', auditEntry.id);
console.log('   Action:', auditEntry.action);
console.log('   Requestor:', auditEntry.requestor);
console.log('   Timestamp:', auditEntry.timestamp);
console.log('   Purpose:', auditEntry.purpose);
console.log('   IP Address:', auditEntry.ipAddress);

// Step 5: Update delivery tracking
console.log('\n🚛 Step 5: Updating delivery tracking...');

// Out for delivery
const tracking1 = createTrackingEvent({
  waybillId: waybillId,
  status: 'OUT_FOR_DELIVERY',
  location: { lat: 35.6812, lon: 139.7671 }, // Tokyo
  timestamp: new Date().toISOString(),
  note: 'Package loaded on delivery vehicle',
});

console.log('✅ Tracking updated: OUT_FOR_DELIVERY');
console.log('   Location:', `${tracking1.location.lat}, ${tracking1.location.lon}`);
console.log('   Time:', tracking1.timestamp);
console.log('   Note:', tracking1.note);

// Simulate delivery
console.log('\n⏳ Simulating delivery...');
console.log('   Driver en route to delivery address...');

// Delivered
setTimeout(() => {
  const tracking2 = createTrackingEvent({
    waybillId: waybillId,
    status: 'DELIVERED',
    location: { lat: 35.6892, lon: 139.6917 }, // Delivery location
    timestamp: new Date().toISOString(),
    note: 'Delivered to recipient',
    proof: {
      type: 'signature',
      signedBy: '山田 太郎',
      signatureImage: 'data:image/png;base64,...',
    },
  });

  console.log('\n✅ Tracking updated: DELIVERED');
  console.log('   Location:', `${tracking2.location.lat}, ${tracking2.location.lon}`);
  console.log('   Time:', tracking2.timestamp);
  console.log('   Proof:', tracking2.proof.type);
  console.log('   Signed by:', tracking2.proof.signedBy);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('   ✅ Carrier access validated');
  console.log('   ✅ PID resolved to full address');
  console.log('   ✅ Audit log created');
  console.log('   ✅ Delivery tracked and completed');
  console.log('\n💡 Key Points:');
  console.log('   • Address accessed ONLY when needed');
  console.log('   • All access logged for audit');
  console.log('   • Delivery completed with proof');
  console.log('   • User can view audit trail');
  console.log('='.repeat(60));
}, 1000);

// Export for potential use
export { auditEntry, resolvedAddress };
