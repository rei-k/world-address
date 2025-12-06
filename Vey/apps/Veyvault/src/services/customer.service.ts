/**
 * Customer Management Service
 * Handles customer/recipient list management for delivery tracking
 */

import type {
  Customer,
  CustomerListFilter,
  Address,
} from '../types';

/**
 * Get customer list with filtering and pagination
 */
export async function getCustomerList(
  userId: string,
  filter?: CustomerListFilter
): Promise<Customer[]> {
  // TODO: Replace with actual API call
  const mockCustomers: Customer[] = [
    {
      id: 'cust-001',
      userId,
      name: '山田太郎',
      email: 'yamada@example.com',
      phone: '090-1234-5678',
      companyName: '株式会社サンプル',
      tags: ['regular', 'business'],
      totalDeliveries: 15,
      lastDeliveryDate: new Date('2024-12-01'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01'),
    },
    {
      id: 'cust-002',
      userId,
      name: '佐藤花子',
      email: 'sato@example.com',
      phone: '080-9876-5432',
      tags: ['regular'],
      totalDeliveries: 8,
      lastDeliveryDate: new Date('2024-11-28'),
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-11-28'),
    },
    {
      id: 'cust-003',
      userId,
      name: '鈴木一郎',
      email: 'suzuki@example.com',
      phone: '070-5555-6666',
      companyName: '鈴木商事',
      tags: ['business', 'vip'],
      totalDeliveries: 25,
      lastDeliveryDate: new Date('2024-12-05'),
      createdAt: new Date('2023-11-10'),
      updatedAt: new Date('2024-12-05'),
    },
  ];

  let result = mockCustomers;

  // Apply search filter
  if (filter?.search) {
    const searchLower = filter.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.companyName?.toLowerCase().includes(searchLower)
    );
  }

  // Apply tag filter
  if (filter?.tags && filter.tags.length > 0) {
    result = result.filter((c) =>
      c.tags?.some((tag) => filter.tags!.includes(tag))
    );
  }

  // Apply date range filter
  if (filter?.startDate) {
    result = result.filter(
      (c) =>
        c.lastDeliveryDate &&
        c.lastDeliveryDate >= filter.startDate!
    );
  }
  if (filter?.endDate) {
    result = result.filter(
      (c) =>
        c.lastDeliveryDate &&
        c.lastDeliveryDate <= filter.endDate!
    );
  }

  // Apply sorting
  if (filter?.sortBy) {
    result = result.sort((a, b) => {
      let aVal: string | number | Date | undefined;
      let bVal: string | number | Date | undefined;

      // Type-safe property access based on sortBy field
      switch (filter.sortBy) {
        case 'lastDelivery':
          aVal = a.lastDeliveryDate?.getTime();
          bVal = b.lastDeliveryDate?.getTime();
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'totalDeliveries':
          aVal = a.totalDeliveries;
          bVal = b.totalDeliveries;
          break;
        case 'createdAt':
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
          break;
      }

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return filter.sortOrder === 'desc'
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return filter.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }

      return 0;
    });
  }

  // Apply pagination
  if (filter?.offset !== undefined) {
    result = result.slice(filter.offset);
  }
  if (filter?.limit !== undefined) {
    result = result.slice(0, filter.limit);
  }

  return result;
}

/**
 * Get customer by ID
 */
export async function getCustomer(
  customerId: string,
  userId: string
): Promise<Customer | null> {
  const customers = await getCustomerList(userId);
  return customers.find((c) => c.id === customerId) || null;
}

/**
 * Create new customer
 */
export async function createCustomer(
  userId: string,
  data: Omit<Customer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Customer> {
  // TODO: Replace with actual API call
  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newCustomer;
}

/**
 * Update customer
 */
export async function updateCustomer(
  customerId: string,
  userId: string,
  data: Partial<Omit<Customer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<Customer> {
  // TODO: Replace with actual API call
  const customer = await getCustomer(customerId, userId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  return {
    ...customer,
    ...data,
    updatedAt: new Date(),
  };
}

/**
 * Delete customer
 */
export async function deleteCustomer(
  customerId: string,
  userId: string
): Promise<void> {
  // TODO: Replace with actual API call
  console.log(`Deleting customer ${customerId} for user ${userId}`);
}

/**
 * Export customer list to CSV
 */
export function exportCustomersToCSV(customers: Customer[]): string {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Company',
    'Tags',
    'Total Deliveries',
    'Last Delivery',
    'Created At',
  ];

  const rows = customers.map((c) => [
    c.id,
    c.name,
    c.email || '',
    c.phone || '',
    c.companyName || '',
    c.tags?.join(';') || '',
    c.totalDeliveries?.toString() || '0',
    c.lastDeliveryDate?.toISOString().split('T')[0] || '',
    c.createdAt.toISOString().split('T')[0],
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
