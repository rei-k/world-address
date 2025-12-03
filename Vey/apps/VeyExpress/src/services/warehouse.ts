/**
 * Warehouse Management Service
 * Manages warehouse operations, inventory, and logistics
 */

import {
  Warehouse,
  WarehouseZone,
  WarehouseOperation,
  InventoryItem,
} from '../types';

export class WarehouseService {
  private warehouses: Map<string, Warehouse>;

  constructor() {
    this.warehouses = new Map();
  }

  /**
   * Create a new warehouse
   */
  async createWarehouse(
    name: string,
    address: any,
    capacity: number
  ): Promise<Warehouse> {
    const warehouse: Warehouse = {
      id: this.generateId(),
      name,
      address,
      capacity,
      currentStock: 0,
      zones: this.createDefaultZones(),
      operations: [],
    };

    this.warehouses.set(warehouse.id, warehouse);
    return warehouse;
  }

  /**
   * Get warehouse by ID
   */
  getWarehouse(warehouseId: string): Warehouse | undefined {
    return this.warehouses.get(warehouseId);
  }

  /**
   * Get all warehouses
   */
  getAllWarehouses(): Warehouse[] {
    return Array.from(this.warehouses.values());
  }

  /**
   * Record a warehouse operation
   */
  async recordOperation(
    warehouseId: string,
    operation: Omit<WarehouseOperation, 'id'>
  ): Promise<WarehouseOperation> {
    const warehouse = this.warehouses.get(warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const op: WarehouseOperation = {
      ...operation,
      id: this.generateId(),
    };

    warehouse.operations.push(op);

    // Update stock levels
    if (op.type === 'receive' || op.type === 'store') {
      const quantity = op.items.reduce((sum, item) => sum + item.quantity, 0);
      warehouse.currentStock += quantity;
    } else if (op.type === 'pick' || op.type === 'ship') {
      const quantity = op.items.reduce((sum, item) => sum + item.quantity, 0);
      warehouse.currentStock -= quantity;
    }

    this.warehouses.set(warehouseId, warehouse);
    return op;
  }

  /**
   * Get inventory for a warehouse
   */
  async getInventory(warehouseId: string): Promise<InventoryItem[]> {
    const warehouse = this.warehouses.get(warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    // Aggregate inventory from all operations
    const inventory = new Map<string, InventoryItem>();

    for (const operation of warehouse.operations) {
      for (const item of operation.items) {
        const existing = inventory.get(item.sku);
        if (existing) {
          if (operation.type === 'receive' || operation.type === 'store') {
            existing.quantity += item.quantity;
          } else if (operation.type === 'pick' || operation.type === 'ship') {
            existing.quantity -= item.quantity;
          }
        } else if (operation.type === 'receive' || operation.type === 'store') {
          inventory.set(item.sku, { ...item });
        }
      }
    }

    return Array.from(inventory.values()).filter(item => item.quantity > 0);
  }

  /**
   * Find item in warehouses
   */
  async findItem(sku: string): Promise<Array<{
    warehouse: Warehouse;
    quantity: number;
    location?: string;
  }>> {
    const results: Array<any> = [];

    for (const warehouse of this.warehouses.values()) {
      const inventory = await this.getInventory(warehouse.id);
      const item = inventory.find(i => i.sku === sku);
      
      if (item && item.quantity > 0) {
        results.push({
          warehouse,
          quantity: item.quantity,
          location: item.location,
        });
      }
    }

    return results;
  }

  /**
   * Get warehouse capacity utilization
   */
  async getUtilization(warehouseId: string): Promise<{
    capacity: number;
    current: number;
    percentage: number;
    zones: Array<{
      name: string;
      capacity: number;
      occupancy: number;
      percentage: number;
    }>;
  }> {
    const warehouse = this.warehouses.get(warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return {
      capacity: warehouse.capacity,
      current: warehouse.currentStock,
      percentage: (warehouse.currentStock / warehouse.capacity) * 100,
      zones: warehouse.zones.map(zone => ({
        name: zone.name,
        capacity: zone.capacity,
        occupancy: zone.currentOccupancy,
        percentage: (zone.currentOccupancy / zone.capacity) * 100,
      })),
    };
  }

  /**
   * Transfer inventory between warehouses
   */
  async transferInventory(
    fromWarehouseId: string,
    toWarehouseId: string,
    items: InventoryItem[]
  ): Promise<{
    success: boolean;
    transferId: string;
  }> {
    const fromWarehouse = this.warehouses.get(fromWarehouseId);
    const toWarehouse = this.warehouses.get(toWarehouseId);

    if (!fromWarehouse || !toWarehouse) {
      throw new Error('Warehouse not found');
    }

    const transferId = this.generateId();

    // Record ship operation at source
    await this.recordOperation(fromWarehouseId, {
      type: 'transfer',
      status: 'completed',
      timestamp: new Date(),
      items,
    });

    // Record receive operation at destination
    await this.recordOperation(toWarehouseId, {
      type: 'receive',
      status: 'completed',
      timestamp: new Date(),
      items,
    });

    return {
      success: true,
      transferId,
    };
  }

  /**
   * Get warehouse operations history
   */
  async getOperations(
    warehouseId: string,
    filters?: {
      type?: WarehouseOperation['type'];
      status?: WarehouseOperation['status'];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<WarehouseOperation[]> {
    const warehouse = this.warehouses.get(warehouseId);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    let operations = warehouse.operations;

    if (filters) {
      if (filters.type) {
        operations = operations.filter(op => op.type === filters.type);
      }
      if (filters.status) {
        operations = operations.filter(op => op.status === filters.status);
      }
      if (filters.startDate) {
        operations = operations.filter(op => op.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        operations = operations.filter(op => op.timestamp <= filters.endDate!);
      }
    }

    return operations;
  }

  // ========== Private Helper Methods ==========

  private generateId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private createDefaultZones(): WarehouseZone[] {
    return [
      {
        id: 'receiving',
        name: 'Receiving',
        type: 'receiving',
        capacity: 1000,
        currentOccupancy: 0,
      },
      {
        id: 'storage',
        name: 'Storage',
        type: 'storage',
        capacity: 10000,
        currentOccupancy: 0,
      },
      {
        id: 'picking',
        name: 'Picking',
        type: 'picking',
        capacity: 500,
        currentOccupancy: 0,
      },
      {
        id: 'packing',
        name: 'Packing',
        type: 'packing',
        capacity: 500,
        currentOccupancy: 0,
      },
      {
        id: 'shipping',
        name: 'Shipping',
        type: 'shipping',
        capacity: 1000,
        currentOccupancy: 0,
      },
    ];
  }
}
