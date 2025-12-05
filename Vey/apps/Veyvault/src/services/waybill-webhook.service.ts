/**
 * Waybill Webhook Service
 * Handles async notifications for waybill status updates
 * 
 * Improvements:
 * - Communication: Webhook-based push notifications
 * - Speed: Async processing with queue
 * - Reliability: Retry mechanism with dead letter queue
 */

import type { Waybill, DeliveryRequest } from '../types';

/**
 * Webhook event types
 */
export enum WebhookEventType {
  WAYBILL_CREATED = 'waybill.created',
  WAYBILL_UPDATED = 'waybill.updated',
  WAYBILL_SUBMITTED = 'waybill.submitted',
  DELIVERY_PICKUP_SCHEDULED = 'delivery.pickup_scheduled',
  DELIVERY_IN_TRANSIT = 'delivery.in_transit',
  DELIVERY_OUT_FOR_DELIVERY = 'delivery.out_for_delivery',
  DELIVERY_DELIVERED = 'delivery.delivered',
  DELIVERY_FAILED = 'delivery.failed',
  CARRIER_RESPONSE = 'carrier.response',
}

/**
 * Webhook payload
 */
export interface WebhookPayload {
  eventType: WebhookEventType;
  timestamp: Date;
  waybillId: string;
  userId: string;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Webhook subscription
 */
export interface WebhookSubscription {
  id: string;
  userId: string;
  url: string;
  events: WebhookEventType[];
  secret: string; // For signature verification
  isActive: boolean;
  retryConfig: {
    maxAttempts: number;
    backoffMultiplier: number;
  };
  createdAt: Date;
}

/**
 * Webhook delivery result
 */
export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
  attemptCount: number;
  deliveredAt?: Date;
}

/**
 * Webhook queue item
 */
interface QueueItem {
  id: string;
  subscription: WebhookSubscription;
  payload: WebhookPayload;
  attemptCount: number;
  nextRetryAt?: Date;
  createdAt: Date;
}

/**
 * Waybill Webhook Service
 */
export class WaybillWebhookService {
  private subscriptions: Map<string, WebhookSubscription[]>;
  private queue: QueueItem[];
  private deadLetterQueue: QueueItem[];
  private processing: boolean;

  constructor() {
    this.subscriptions = new Map();
    this.queue = [];
    this.deadLetterQueue = [];
    this.processing = false;
  }

  /**
   * Register webhook subscription
   */
  async subscribe(subscription: Omit<WebhookSubscription, 'id' | 'createdAt'>): Promise<WebhookSubscription> {
    const newSubscription: WebhookSubscription = {
      ...subscription,
      id: this.generateId(),
      createdAt: new Date(),
    };

    const userSubs = this.subscriptions.get(subscription.userId) || [];
    userSubs.push(newSubscription);
    this.subscriptions.set(subscription.userId, userSubs);

    return newSubscription;
  }

  /**
   * Unsubscribe webhook
   */
  async unsubscribe(userId: string, subscriptionId: string): Promise<boolean> {
    const userSubs = this.subscriptions.get(userId);
    if (!userSubs) {
      return false;
    }

    const filtered = userSubs.filter(sub => sub.id !== subscriptionId);
    this.subscriptions.set(userId, filtered);
    return true;
  }

  /**
   * Emit webhook event
   */
  async emit(eventType: WebhookEventType, data: {
    waybillId: string;
    userId: string;
    data: any;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const payload: WebhookPayload = {
      eventType,
      timestamp: new Date(),
      ...data,
    };

    // Find matching subscriptions
    const userSubs = this.subscriptions.get(data.userId) || [];
    const matchingSubs = userSubs.filter(
      sub => sub.isActive && sub.events.includes(eventType)
    );

    // Queue webhook deliveries
    for (const subscription of matchingSubs) {
      const queueItem: QueueItem = {
        id: this.generateId(),
        subscription,
        payload,
        attemptCount: 0,
        createdAt: new Date(),
      };
      this.queue.push(queueItem);
    }

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process webhook queue
   */
  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;

      // Check if should retry
      if (item.nextRetryAt && item.nextRetryAt > new Date()) {
        // Not ready for retry yet, put back in queue
        this.queue.push(item);
        continue;
      }

      const result = await this.deliverWebhook(item);

      if (!result.success) {
        await this.handleFailedDelivery(item, result);
      }
    }

    this.processing = false;
  }

  /**
   * Deliver webhook to endpoint
   */
  private async deliverWebhook(item: QueueItem): Promise<WebhookDeliveryResult> {
    const { subscription, payload } = item;
    item.attemptCount++;

    try {
      // Generate signature
      const signature = this.generateSignature(payload, subscription.secret);

      // Send webhook
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.eventType,
          'X-Webhook-Timestamp': payload.timestamp.toISOString(),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          response: await response.text(),
          attemptCount: item.attemptCount,
          deliveredAt: new Date(),
        };
      } else {
        return {
          success: false,
          statusCode: response.status,
          error: `HTTP ${response.status}: ${await response.text()}`,
          attemptCount: item.attemptCount,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptCount: item.attemptCount,
      };
    }
  }

  /**
   * Handle failed webhook delivery
   */
  private async handleFailedDelivery(
    item: QueueItem,
    result: WebhookDeliveryResult
  ): Promise<void> {
    const maxAttempts = item.subscription.retryConfig.maxAttempts;

    if (item.attemptCount < maxAttempts) {
      // Schedule retry with exponential backoff
      const backoffMs = Math.pow(item.subscription.retryConfig.backoffMultiplier, item.attemptCount) * 1000;
      item.nextRetryAt = new Date(Date.now() + backoffMs);
      this.queue.push(item);

      console.log(
        `Webhook delivery failed (attempt ${item.attemptCount}/${maxAttempts}). ` +
        `Retrying in ${backoffMs}ms. Error: ${result.error}`
      );
    } else {
      // Max attempts reached, move to dead letter queue
      this.deadLetterQueue.push(item);
      
      console.error(
        `Webhook delivery failed after ${maxAttempts} attempts. ` +
        `Moved to dead letter queue. Error: ${result.error}`
      );

      // TODO: Alert administrators
      await this.alertFailedWebhook(item, result);
    }
  }

  /**
   * Generate HMAC signature for webhook
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    // In production, use crypto.createHmac
    // For now, simple hash
    const data = JSON.stringify(payload);
    return Buffer.from(`${secret}:${data}`).toString('base64');
  }

  /**
   * Alert about failed webhook
   */
  private async alertFailedWebhook(
    item: QueueItem,
    result: WebhookDeliveryResult
  ): Promise<void> {
    // TODO: Send alert to monitoring system or admin
    console.error('Failed webhook alert:', {
      subscriptionId: item.subscription.id,
      userId: item.subscription.userId,
      eventType: item.payload.eventType,
      error: result.error,
      attempts: item.attemptCount,
    });
  }

  /**
   * Get dead letter queue items
   */
  getDeadLetterQueue(): QueueItem[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Retry dead letter queue item
   */
  async retryDeadLetter(itemId: string): Promise<void> {
    const index = this.deadLetterQueue.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error('Dead letter item not found');
    }

    const item = this.deadLetterQueue[index];
    this.deadLetterQueue.splice(index, 1);
    
    item.attemptCount = 0;
    item.nextRetryAt = undefined;
    this.queue.push(item);

    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number;
    deadLetter: number;
    processing: boolean;
  } {
    return {
      pending: this.queue.length,
      deadLetter: this.deadLetterQueue.length,
      processing: this.processing,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Webhook event helpers
 */
export class WaybillWebhookEvents {
  private webhookService: WaybillWebhookService;

  constructor(webhookService: WaybillWebhookService) {
    this.webhookService = webhookService;
  }

  /**
   * Emit waybill created event
   */
  async onWaybillCreated(waybill: Waybill): Promise<void> {
    await this.webhookService.emit(WebhookEventType.WAYBILL_CREATED, {
      waybillId: waybill.id,
      userId: waybill.userId,
      data: {
        waybill: this.sanitizeWaybill(waybill),
      },
    });
  }

  /**
   * Emit delivery status update
   */
  async onDeliveryStatusUpdate(
    delivery: DeliveryRequest,
    waybill: Waybill
  ): Promise<void> {
    const eventMap: Record<DeliveryRequest['status'], WebhookEventType> = {
      new: WebhookEventType.DELIVERY_PICKUP_SCHEDULED,
      accepted: WebhookEventType.DELIVERY_PICKUP_SCHEDULED,
      in_transit: WebhookEventType.DELIVERY_IN_TRANSIT,
      delivered: WebhookEventType.DELIVERY_DELIVERED,
      failed: WebhookEventType.DELIVERY_FAILED,
    };

    const eventType = eventMap[delivery.status];
    if (!eventType) return;

    await this.webhookService.emit(eventType, {
      waybillId: waybill.id,
      userId: waybill.userId,
      data: {
        delivery,
        waybill: this.sanitizeWaybill(waybill),
      },
    });
  }

  /**
   * Sanitize waybill for webhook (remove sensitive data)
   */
  private sanitizeWaybill(waybill: Waybill): Partial<Waybill> {
    return {
      id: waybill.id,
      status: waybill.status,
      carrierId: waybill.carrierId,
      trackingNumber: waybill.trackingNumber,
      createdAt: waybill.createdAt,
      updatedAt: waybill.updatedAt,
      // Don't include sensitive address data or ZKP tokens
    };
  }
}
