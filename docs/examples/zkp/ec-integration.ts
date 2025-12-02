/**
 * Example: E-Commerce Site Integration
 * 
 * This example shows how an EC site can integrate with the ZKP Address Protocol
 * to validate customer addresses without storing raw address data.
 */

import {
  createZKCircuit,
  validateShippingRequest,
  verifyZKProof,
  createZKPWaybill,
  type ShippingCondition,
  type ShippingValidationRequest,
  type ZKCircuit,
} from '@vey/core';

/**
 * EC Site Class
 * Manages product orders and shipping validation
 */
class ECSite {
  private readonly siteId: string;
  private readonly siteDid: string;
  private zkCircuit: ZKCircuit | null = null;
  private addressProviderEndpoint: string;

  constructor(siteId: string, siteDid: string, providerEndpoint: string) {
    this.siteId = siteId;
    this.siteDid = siteDid;
    this.addressProviderEndpoint = providerEndpoint;
  }

  /**
   * Initialize ZK circuit (done once during setup)
   */
  async initialize(): Promise<void> {
    // In production, this would fetch the circuit from the provider
    this.zkCircuit = createZKCircuit(
      'address-validation-v1',
      'Address Validation Circuit',
      'Validates shipping addresses using ZK proofs'
    );
    console.log('EC Site initialized with ZK circuit:', this.zkCircuit.id);
  }

  /**
   * Create an order with address validation
   */
  async createOrder(
    customerId: string,
    customerPID: string,
    userSignature: string,
    items: Array<{ id: string; quantity: number }>,
    shippingRegion: string
  ): Promise<{ orderId: string; waybillId: string; trackingNumber: string } | null> {
    console.log('\n=== Creating Order ===');
    console.log('Customer ID:', customerId);
    console.log('Customer PID:', customerPID);
    console.log('Items:', items.length);

    if (!this.zkCircuit) {
      throw new Error('EC Site not initialized');
    }

    // Step 1: Define shipping conditions based on the order
    const conditions = this.getShippingConditions(shippingRegion);
    console.log('Shipping conditions:', conditions);

    // Step 2: Request validation from Address Provider
    const validationRequest: ShippingValidationRequest = {
      pid: customerPID,
      userSignature,
      conditions,
      requesterId: this.siteDid,
      timestamp: new Date().toISOString(),
    };

    console.log('Requesting shipping validation from Address Provider...');

    // In production, this would be an HTTP request to the provider's API
    const validationResponse = await this.requestShippingValidation(validationRequest);

    if (!validationResponse.valid || !validationResponse.zkProof) {
      console.log('Shipping validation FAILED:', validationResponse.error);
      return null;
    }

    console.log('Shipping validation PASSED');
    console.log('PID Token:', validationResponse.pidToken);

    // Step 3: Verify the ZK proof
    const verificationResult = verifyZKProof(validationResponse.zkProof, this.zkCircuit);

    if (!verificationResult.valid) {
      console.log('ZK Proof verification FAILED:', verificationResult.error);
      return null;
    }

    console.log('ZK Proof verified successfully');

    // Step 4: Create the order in our system
    const orderId = `ORD-${Date.now()}`;
    const waybillId = `WB-${Date.now()}`;
    const trackingNumber = `TN-${Date.now()}`;

    // We store ONLY the PID token and ZK proof, NOT the raw address
    const orderRecord = {
      orderId,
      customerId,
      pidToken: validationResponse.pidToken, // Anonymized reference
      zkProof: validationResponse.zkProof,
      items,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    console.log('Order created:', orderId);
    console.log('Stored: PID Token (not raw address)');

    // Step 5: Create waybill for carrier
    const waybill = createZKPWaybill(
      waybillId,
      customerPID,
      validationResponse.zkProof,
      trackingNumber,
      {
        parcelWeight: this.calculateWeight(items),
        parcelSize: this.calculateSize(items),
        carrierZone: shippingRegion,
        senderName: 'My EC Store',
        recipientName: 'Customer', // We don't know the actual name
        carrierInfo: {
          id: 'carrier-001',
          name: 'Delivery Service Inc.',
        },
      }
    );

    console.log('Waybill created:', waybillId);
    console.log('Tracking number:', trackingNumber);

    return {
      orderId,
      waybillId,
      trackingNumber,
    };
  }

  /**
   * Get shipping conditions based on region
   */
  private getShippingConditions(region: string): ShippingCondition {
    // Example: Different conditions for different regions
    const conditions: ShippingCondition = {
      allowedCountries: ['JP'],
      maxWeight: 30,
      maxDimensions: {
        length: 100,
        width: 60,
        height: 60,
        unit: 'cm',
      },
    };

    switch (region) {
      case 'kanto':
        conditions.allowedRegions = ['13', '14', '11', '12', '08', '09', '10'];
        break;
      case 'kansai':
        conditions.allowedRegions = ['27', '28', '29', '30', '25', '26'];
        break;
      case 'nationwide':
        // No region restriction
        break;
      default:
        conditions.allowedRegions = [region];
    }

    return conditions;
  }

  /**
   * Request shipping validation from Address Provider
   * In production, this would be an actual HTTP API call
   */
  private async requestShippingValidation(
    request: ShippingValidationRequest
  ): Promise<any> {
    // Placeholder: In production, make HTTP request to provider
    console.log(`  POST ${this.addressProviderEndpoint}/validate`);
    
    // Simulated response
    return {
      valid: true,
      zkProof: {
        circuitId: this.zkCircuit!.id,
        proofType: 'groth16',
        proof: 'proof-data-here',
        publicInputs: {
          pid: request.pid,
          allowedCountries: request.conditions.allowedCountries,
        },
        timestamp: new Date().toISOString(),
      },
      pidToken: `tok_${Buffer.from(request.pid).toString('base64').substring(0, 16)}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate total weight from items
   */
  private calculateWeight(items: Array<{ id: string; quantity: number }>): number {
    // Simplified: assume 1kg per item
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calculate size code from items
   */
  private calculateSize(items: Array<{ id: string; quantity: number }>): string {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    if (totalItems <= 3) return '60';
    if (totalItems <= 7) return '80';
    return '100';
  }
}

// ============================================================================
// Usage Example
// ============================================================================

async function main() {
  console.log('=== EC Site Integration Example ===\n');

  // Step 1: Initialize EC site
  const ecSite = new ECsite(
    'my-ec-store',
    'did:web:my-ec-store.example',
    'https://api.vey.example/v1'
  );

  await ecSite.initialize();

  // Step 2: Customer adds items to cart and proceeds to checkout
  const customerId = 'customer-12345';
  const customerPID = 'JP-13-113-01-T07-B12-BN02-R342';
  const userSignature = 'user-signature-consenting-to-use-address';

  const cartItems = [
    { id: 'product-001', quantity: 2 },
    { id: 'product-042', quantity: 1 },
  ];

  // Step 3: Create order with address validation
  const orderResult = await ecSite.createOrder(
    customerId,
    customerPID,
    userSignature,
    cartItems,
    'kanto'
  );

  if (orderResult) {
    console.log('\n=== Order Successful ===');
    console.log('Order ID:', orderResult.orderId);
    console.log('Waybill ID:', orderResult.waybillId);
    console.log('Tracking Number:', orderResult.trackingNumber);
    console.log('\nNote: EC site does NOT have access to raw address!');
    console.log('Only PID token and ZK proof are stored.');
  } else {
    console.log('\n=== Order Failed ===');
    console.log('Address validation or ZK proof verification failed.');
  }

  // Step 4: Demonstrate that we cannot access raw address
  console.log('\n=== Privacy Verification ===');
  console.log('Can EC site see customer name? NO');
  console.log('Can EC site see street address? NO');
  console.log('Can EC site see building/room number? NO');
  console.log('What EC site knows: PID token + ZK proof (address is valid)');
}

// Run the example
main().catch(console.error);
