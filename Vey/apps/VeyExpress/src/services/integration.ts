/**
 * Integration Service
 * Manages connections to EC, ERP, OMS, WMS, TMS, DMS systems
 */

import {
  Integration,
  IntegrationType,
  IntegrationCredentials,
  IntegrationConfig,
} from '../types';

export class IntegrationService {
  private integrations: Map<string, Integration>;

  constructor() {
    this.integrations = new Map();
  }

  /**
   * Connect to an external system
   */
  async connect(
    type: IntegrationType,
    platform: string,
    credentials: IntegrationCredentials,
    config?: Partial<IntegrationConfig>
  ): Promise<Integration> {
    const integration: Integration = {
      id: this.generateId(),
      type,
      platform,
      status: 'connected',
      credentials,
      lastSync: new Date(),
      config: {
        autoSync: config?.autoSync ?? true,
        syncInterval: config?.syncInterval ?? 15, // minutes
        webhookUrl: config?.webhookUrl,
        mappings: config?.mappings ?? {},
      },
    };

    this.integrations.set(integration.id, integration);
    
    // Test connection
    const testResult = await this.testConnection(integration);
    if (!testResult.success) {
      integration.status = 'error';
    }

    return integration;
  }

  /**
   * Disconnect an integration
   */
  async disconnect(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (integration) {
      integration.status = 'disconnected';
      this.integrations.set(integrationId, integration);
    }
  }

  /**
   * Sync data from external system
   */
  async sync(integrationId: string): Promise<{
    success: boolean;
    recordsProcessed: number;
    errors: string[];
  }> {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.status !== 'connected') {
      return {
        success: false,
        recordsProcessed: 0,
        errors: ['Integration not connected'],
      };
    }

    try {
      // Actual sync logic would go here
      const recordsProcessed = await this.performSync(integration);
      
      integration.lastSync = new Date();
      this.integrations.set(integrationId, integration);

      return {
        success: true,
        recordsProcessed,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get all integrations
   */
  getIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Get integrations by type
   */
  getIntegrationsByType(type: IntegrationType): Integration[] {
    return Array.from(this.integrations.values()).filter(i => i.type === type);
  }

  /**
   * Update integration configuration
   */
  async updateConfig(
    integrationId: string,
    config: Partial<IntegrationConfig>
  ): Promise<Integration> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    integration.config = {
      ...integration.config,
      ...config,
    };

    this.integrations.set(integrationId, integration);
    return integration;
  }

  /**
   * Test connection to external system
   */
  async testConnection(integration: Integration): Promise<{
    success: boolean;
    message: string;
  }> {
    // Simplified test - in production would actually call the external API
    try {
      switch (integration.type) {
        case IntegrationType.EC:
          return await this.testECConnection(integration);
        case IntegrationType.ERP:
          return await this.testERPConnection(integration);
        case IntegrationType.OMS:
          return await this.testOMSConnection(integration);
        case IntegrationType.WMS:
          return await this.testWMSConnection(integration);
        case IntegrationType.TMS:
          return await this.testTMSConnection(integration);
        case IntegrationType.DMS:
          return await this.testDMSConnection(integration);
        default:
          return { success: false, message: 'Unknown integration type' };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ========== Private Helper Methods ==========

  private generateId(): string {
    return `int_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private async performSync(integration: Integration): Promise<number> {
    // Simulate sync operation
    // In production, this would fetch data from the external system
    return Math.floor(Math.random() * 100) + 50;
  }

  private async testECConnection(integration: Integration): Promise<{
    success: boolean;
    message: string;
  }> {
    // Test EC platform connection (Shopify, WooCommerce, etc.)
    if (!integration.credentials?.apiKey) {
      return { success: false, message: 'API key required' };
    }
    return { success: true, message: 'Connected to ' + integration.platform };
  }

  private async testERPConnection(integration: Integration): Promise<{
    success: boolean;
    message: string;
  }> {
    // Test ERP connection
    return { success: true, message: 'ERP connected' };
  }

  private async testOMSConnection(integration: Integration): Promise<{
    success: boolean;
    message: string;
  }> {
    // Test OMS connection
    return { success: true, message: 'OMS connected' };
  }

  private async testWMSConnection(integration: Integration): Promise<{
    success: boolean;
    message: string;
  }> {
    // Test WMS connection
    return { success: true, message: 'WMS connected' };
  }

  private async testTMSConnection(integration: Integration): Promise<{
    success: boolean;
    message: string;
  }> {
    // Test TMS connection
    return { success: true, message: 'TMS connected' };
  }

  private async testDMSConnection(integration: Integration): Promise<{
    success: boolean;
    message: string;
  }> {
    // Test DMS connection
    return { success: true, message: 'DMS connected' };
  }
}
