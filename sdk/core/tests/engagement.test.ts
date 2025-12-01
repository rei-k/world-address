/**
 * @vey/core - Tests for engagement types
 */

import { describe, it, expect } from 'vitest';
import type {
  NotificationRequest,
  NotificationResponse,
  DigitalReceipt,
  MemberProfile,
  SavedAddress,
  AddressBook,
  ShipmentHistoryEntry,
  DuplicateShipmentRequest,
  SignageContent,
  SignagePlaylist,
} from '../src/engagement';

describe('Engagement Types', () => {
  describe('Notification Types', () => {
    it('should define notification request structure', () => {
      const request: NotificationRequest = {
        event: 'shipment.created',
        recipients: [
          {
            id: 'U1234567890',
            channel: 'line',
            name: 'Taro Yamada',
            language: 'ja',
          },
        ],
        content: {
          title: '発送完了',
          body: 'お荷物が発送されました',
          templateId: 'shipment_created_ja',
          templateVars: {
            tracking_number: '123456789',
          },
        },
        data: {
          trackingNumber: '123456789',
        },
        priority: 'high',
      };

      expect(request.event).toBe('shipment.created');
      expect(request.recipients[0].channel).toBe('line');
    });

    it('should define notification response structure', () => {
      const response: NotificationResponse = {
        success: true,
        results: [
          {
            id: 'notif_001',
            status: 'delivered',
            channel: 'line',
            recipientId: 'U1234567890',
            sentAt: '2024-01-15T10:00:00Z',
            deliveredAt: '2024-01-15T10:00:05Z',
          },
        ],
      };

      expect(response.success).toBe(true);
      expect(response.results[0].status).toBe('delivered');
    });
  });

  describe('Digital Receipt Types', () => {
    it('should define digital receipt structure', () => {
      const receipt: DigitalReceipt = {
        id: 'rcpt_001',
        receiptNumber: 'R2024011500001',
        business: {
          name: 'Tokyo Shipping Center',
          address: {
            street_address: '1-1 Shibuya',
            city: 'Shibuya-ku',
            province: 'Tokyo',
            postal_code: '150-0001',
            country: 'Japan',
          },
          taxId: 'T1234567890123',
        },
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          memberId: 'MEM001',
        },
        items: [
          {
            name: 'International Express Shipping',
            quantity: 1,
            unitPrice: 3500,
            totalPrice: 3500,
            taxRate: 0.10,
            taxAmount: 350,
          },
          {
            name: 'Insurance',
            quantity: 1,
            unitPrice: 500,
            totalPrice: 500,
            taxRate: 0.10,
            taxAmount: 50,
          },
        ],
        subtotal: 4000,
        taxBreakdown: [
          {
            rate: 0.10,
            name: 'Consumption Tax',
            taxableAmount: 4000,
            taxAmount: 400,
          },
        ],
        totalTax: 400,
        total: 4400,
        payment: {
          method: 'IC Card (Suica)',
          amount: 4400,
          reference: 'PAY123456',
        },
        pointsEarned: 44,
        dateTime: '2024-01-15T10:30:00Z',
        staff: {
          id: 'STF001',
          name: 'Hanako Sato',
        },
        shipmentInfo: {
          trackingNumber: '123456789',
          carrier: 'FedEx',
          service: 'International Priority',
        },
      };

      expect(receipt.total).toBe(4400);
      expect(receipt.items).toHaveLength(2);
      expect(receipt.shipmentInfo?.trackingNumber).toBe('123456789');
    });
  });

  describe('Member Types', () => {
    it('should define member profile structure', () => {
      const profile: MemberProfile = {
        id: 'mem_001',
        email: 'taro@example.com',
        phone: '090-1234-5678',
        name: 'Taro Yamada',
        tier: 'gold',
        points: 5000,
        lifetimePoints: 25000,
        memberSince: '2022-01-15',
        preferredLanguage: 'ja',
        preferredCurrency: 'JPY',
        notificationPreferences: [
          {
            channel: 'line',
            enabled: true,
            events: ['shipment.created', 'shipment.delivered'],
          },
        ],
      };

      expect(profile.tier).toBe('gold');
      expect(profile.points).toBe(5000);
    });

    it('should define saved address structure', () => {
      const address: SavedAddress = {
        id: 'addr_001',
        label: 'Mom\'s House',
        address: {
          recipient: 'Hanako Yamada',
          street_address: '1-2-3 Nakano',
          city: 'Nakano-ku',
          province: 'Tokyo',
          postal_code: '164-0001',
          country: 'Japan',
        },
        recipientName: 'Hanako Yamada',
        phone: '03-1234-5678',
        isDefault: false,
        usageCount: 12,
        lastUsed: '2024-01-10',
      };

      expect(address.label).toBe('Mom\'s House');
      expect(address.usageCount).toBe(12);
    });

    it('should define address book structure', () => {
      const book: AddressBook = {
        memberId: 'mem_001',
        addresses: [],
        totalCount: 0,
        groups: [
          { name: 'Family', addressIds: ['addr_001', 'addr_002'] },
          { name: 'Work', addressIds: ['addr_003'] },
        ],
      };

      expect(book.groups).toHaveLength(2);
    });
  });

  describe('Shipment History Types', () => {
    it('should define shipment history entry structure', () => {
      const entry: ShipmentHistoryEntry = {
        id: 'ship_001',
        trackingNumber: '123456789',
        createdAt: '2024-01-10T10:00:00Z',
        origin: { country: 'Japan' },
        destination: { country: 'USA' },
        carrier: 'FedEx',
        service: 'International Priority',
        status: 'delivered',
        cost: {
          amount: 8500,
          currency: 'JPY',
        },
        pointsEarned: 85,
        canDuplicate: true,
      };

      expect(entry.status).toBe('delivered');
      expect(entry.canDuplicate).toBe(true);
    });
  });

  describe('Duplicate Shipment Types', () => {
    it('should define duplicate shipment request structure', () => {
      const request: DuplicateShipmentRequest = {
        originalId: 'ship_001',
        overrides: {
          shipDate: '2024-01-20',
          reference: 'NEW-REF-001',
        },
        recalculateRate: true,
      };

      expect(request.originalId).toBe('ship_001');
      expect(request.recalculateRate).toBe(true);
    });
  });

  describe('Digital Signage Types', () => {
    it('should define signage content structure', () => {
      const content: SignageContent = {
        id: 'content_001',
        type: 'promo',
        title: 'Winter Sale',
        mediaUrl: 'https://example.com/promo.mp4',
        duration: 15,
        transition: 'fade',
        priority: 10,
        validFrom: '2024-01-01',
        validUntil: '2024-01-31',
        targetAudience: 'all',
      };

      expect(content.type).toBe('promo');
      expect(content.duration).toBe(15);
    });

    it('should define signage playlist structure', () => {
      const playlist: SignagePlaylist = {
        id: 'playlist_001',
        name: 'Default Playlist',
        items: [],
        loop: true,
        schedule: {
          days: ['mon', 'tue', 'wed', 'thu', 'fri'],
          startTime: '10:00',
          endTime: '20:00',
        },
        idleTimeout: 30,
      };

      expect(playlist.loop).toBe(true);
      expect(playlist.schedule?.days).toHaveLength(5);
    });
  });
});
