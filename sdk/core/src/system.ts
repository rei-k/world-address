/**
 * @vey/core - System & Reliability Types
 *
 * Types for system features:
 * - Offline mode (IndexedDB sync)
 * - Kiosk mode
 * - Audit logging
 */

import type { AddressInput } from './types';

// ============================================================================
// Offline Mode
// ============================================================================

/**
 * Sync status
 */
export type SyncStatus = 
  | 'synced'       // All data is synced
  | 'pending'      // Has unsynced changes
  | 'syncing'      // Currently syncing
  | 'conflict'     // Has sync conflicts
  | 'error'        // Sync error occurred
  | 'offline';     // No network connection

/**
 * Offline-capable entity types
 */
export type OfflineEntityType =
  | 'shipment'
  | 'customer'
  | 'address'
  | 'transaction'
  | 'receipt'
  | 'inventory_update';

/**
 * Pending sync item
 */
export interface PendingSyncItem<T = unknown> {
  /** Local ID */
  localId: string;
  /** Server ID (if known) */
  serverId?: string;
  /** Entity type */
  entityType: OfflineEntityType;
  /** Operation */
  operation: 'create' | 'update' | 'delete';
  /** Data */
  data: T;
  /** Created at (local) */
  createdAt: string;
  /** Modified at (local) */
  modifiedAt: string;
  /** Retry count */
  retryCount: number;
  /** Last error */
  lastError?: string;
  /** Priority (higher = sync first) */
  priority: number;
}

/**
 * Sync conflict
 */
export interface SyncConflict<T = unknown> {
  /** Conflict ID */
  id: string;
  /** Entity type */
  entityType: OfflineEntityType;
  /** Entity ID */
  entityId: string;
  /** Local version */
  localVersion: T;
  /** Server version */
  serverVersion: T;
  /** Local timestamp */
  localTimestamp: string;
  /** Server timestamp */
  serverTimestamp: string;
  /** Auto-resolution possible */
  autoResolvable: boolean;
  /** Suggested resolution */
  suggestedResolution?: 'use_local' | 'use_server' | 'merge';
  /** Merged version (if merge possible) */
  mergedVersion?: T;
}

/**
 * Sync result
 */
export interface SyncResult {
  /** Whether sync was successful */
  success: boolean;
  /** Items synced */
  syncedCount: number;
  /** Items failed */
  failedCount: number;
  /** Items with conflicts */
  conflictCount: number;
  /** Sync timestamp */
  timestamp: string;
  /** Failed items */
  failedItems?: Array<{
    localId: string;
    error: string;
  }>;
  /** Conflicts */
  conflicts?: SyncConflict[];
  /** Remaining pending items */
  remainingPending: number;
}

/**
 * Offline storage statistics
 */
export interface OfflineStorageStats {
  /** Total items stored */
  totalItems: number;
  /** Items by type */
  byType: Record<OfflineEntityType, number>;
  /** Pending sync count */
  pendingSync: number;
  /** Storage used (bytes) */
  storageUsed: number;
  /** Storage quota (bytes) */
  storageQuota: number;
  /** Last sync time */
  lastSyncTime?: string;
  /** Oldest pending item */
  oldestPendingItem?: string;
}

/**
 * Offline mode configuration
 */
export interface OfflineModeConfig {
  /** Enable offline mode */
  enabled: boolean;
  /** Database name */
  dbName?: string;
  /** Database version */
  dbVersion?: number;
  /** Max pending items */
  maxPendingItems?: number;
  /** Max storage size (bytes) */
  maxStorageSize?: number;
  /** Auto-sync interval (ms) */
  autoSyncInterval?: number;
  /** Sync on reconnect */
  syncOnReconnect?: boolean;
  /** Conflict resolution strategy */
  conflictResolution?: 'local_wins' | 'server_wins' | 'newest_wins' | 'manual';
  /** Entities to cache */
  entitiesToCache?: OfflineEntityType[];
}

/**
 * Offline mode event handlers
 */
export interface OfflineModeEventHandlers {
  onOnline?: () => void;
  onOffline?: () => void;
  onSyncStart?: () => void;
  onSyncComplete?: (result: SyncResult) => void;
  onSyncError?: (error: Error) => void;
  onConflict?: (conflict: SyncConflict) => void;
  onStorageLow?: (stats: OfflineStorageStats) => void;
}

/**
 * Offline mode service interface
 */
export interface OfflineModeService {
  /** Initialize offline storage */
  initialize(config?: OfflineModeConfig): Promise<void>;
  
  /** Check if online */
  isOnline(): boolean;
  
  /** Get sync status */
  getSyncStatus(): SyncStatus;
  
  /** Get storage statistics */
  getStorageStats(): Promise<OfflineStorageStats>;
  
  /** Store item locally */
  storeLocal<T>(entityType: OfflineEntityType, data: T): Promise<string>;
  
  /** Get local item */
  getLocal<T>(entityType: OfflineEntityType, localId: string): Promise<T | null>;
  
  /** Query local items */
  queryLocal<T>(
    entityType: OfflineEntityType,
    filter?: Partial<T>
  ): Promise<T[]>;
  
  /** Update local item */
  updateLocal<T>(
    entityType: OfflineEntityType,
    localId: string,
    data: Partial<T>
  ): Promise<void>;
  
  /** Delete local item */
  deleteLocal(entityType: OfflineEntityType, localId: string): Promise<void>;
  
  /** Get pending sync items */
  getPendingSyncItems(): Promise<PendingSyncItem[]>;
  
  /** Trigger sync */
  sync(): Promise<SyncResult>;
  
  /** Resolve conflict */
  resolveConflict(
    conflictId: string,
    resolution: 'use_local' | 'use_server' | 'use_merged'
  ): Promise<void>;
  
  /** Clear local storage */
  clearStorage(): Promise<void>;
  
  /** Register event handlers */
  on<K extends keyof OfflineModeEventHandlers>(
    event: K,
    handler: NonNullable<OfflineModeEventHandlers[K]>
  ): void;
  
  /** Unregister event handlers */
  off<K extends keyof OfflineModeEventHandlers>(
    event: K,
    handler: NonNullable<OfflineModeEventHandlers[K]>
  ): void;
}

// ============================================================================
// Kiosk Mode
// ============================================================================

/**
 * Kiosk restriction types
 */
export type KioskRestriction =
  | 'disable_back'           // Disable browser back button
  | 'disable_refresh'        // Disable browser refresh
  | 'disable_context_menu'   // Disable right-click menu
  | 'disable_keyboard_shortcuts' // Disable Ctrl+R, F5, etc.
  | 'disable_address_bar'    // Hide/disable address bar (requires fullscreen)
  | 'disable_dev_tools'      // Disable dev tools
  | 'disable_print'          // Disable print dialog
  | 'disable_selection'      // Disable text selection
  | 'disable_copy_paste'     // Disable copy/paste
  | 'auto_logout'            // Auto logout after inactivity
  | 'fullscreen';            // Force fullscreen mode

/**
 * Kiosk session
 */
export interface KioskSession {
  /** Session ID */
  id: string;
  /** Started at */
  startedAt: string;
  /** Last activity */
  lastActivity: string;
  /** Operator ID (if logged in) */
  operatorId?: string;
  /** Transaction count */
  transactionCount: number;
  /** Total revenue */
  totalRevenue: number;
  /** Device info */
  device: {
    id: string;
    name?: string;
    browser: string;
    os: string;
    screenResolution: string;
  };
}

/**
 * Kiosk mode configuration
 */
export interface KioskModeConfig {
  /** Enable kiosk mode */
  enabled: boolean;
  /** Restrictions to apply */
  restrictions: KioskRestriction[];
  /** Inactivity timeout (seconds) */
  inactivityTimeout?: number;
  /** Action on timeout */
  timeoutAction?: 'reset' | 'logout' | 'screensaver';
  /** Home URL (for reset) */
  homeUrl?: string;
  /** Allowed URL patterns */
  allowedUrls?: string[];
  /** Admin PIN for exit */
  adminPin?: string;
  /** Show debug info */
  showDebugInfo?: boolean;
  /** Custom CSS */
  customCss?: string;
}

/**
 * Kiosk event handlers
 */
export interface KioskModeEventHandlers {
  onEnterKioskMode?: () => void;
  onExitKioskMode?: () => void;
  onInactivityWarning?: (secondsRemaining: number) => void;
  onInactivityTimeout?: () => void;
  onNavigationBlocked?: (url: string) => void;
  onKeyboardShortcutBlocked?: (shortcut: string) => void;
  onSessionStart?: (session: KioskSession) => void;
  onSessionEnd?: (session: KioskSession) => void;
}

/**
 * Kiosk mode service interface
 */
export interface KioskModeService {
  /** Enter kiosk mode */
  enter(config?: KioskModeConfig): Promise<void>;
  
  /** Exit kiosk mode */
  exit(adminPin?: string): Promise<boolean>;
  
  /** Check if in kiosk mode */
  isActive(): boolean;
  
  /** Get current configuration */
  getConfig(): KioskModeConfig | null;
  
  /** Update configuration */
  updateConfig(config: Partial<KioskModeConfig>): void;
  
  /** Reset activity timer */
  resetInactivityTimer(): void;
  
  /** Get current session */
  getCurrentSession(): KioskSession | null;
  
  /** Navigate to home */
  navigateHome(): void;
  
  /** Check if URL is allowed */
  isUrlAllowed(url: string): boolean;
  
  /** Toggle fullscreen */
  toggleFullscreen(): Promise<boolean>;
  
  /** Is fullscreen */
  isFullscreen(): boolean;
  
  /** Register event handlers */
  on<K extends keyof KioskModeEventHandlers>(
    event: K,
    handler: NonNullable<KioskModeEventHandlers[K]>
  ): void;
  
  /** Unregister event handlers */
  off<K extends keyof KioskModeEventHandlers>(
    event: K,
    handler: NonNullable<KioskModeEventHandlers[K]>
  ): void;
}

// ============================================================================
// Audit Logging
// ============================================================================

/**
 * Audit action types
 */
export type AuditActionType =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'print'
  | 'refund'
  | 'void'
  | 'config_change'
  | 'permission_change'
  | 'system';

/**
 * Audit entity types
 */
export type AuditEntityType =
  | 'shipment'
  | 'customer'
  | 'address'
  | 'payment'
  | 'refund'
  | 'receipt'
  | 'inventory'
  | 'staff'
  | 'member'
  | 'config'
  | 'user'
  | 'session'
  | 'report'
  | 'system';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  /** Log ID */
  id: string;
  /** Timestamp */
  timestamp: string;
  /** Action type */
  action: AuditActionType;
  /** Entity type */
  entityType: AuditEntityType;
  /** Entity ID */
  entityId?: string;
  /** User/operator ID */
  userId?: string;
  /** User name */
  userName?: string;
  /** User role */
  userRole?: string;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Device ID */
  deviceId?: string;
  /** Session ID */
  sessionId?: string;
  /** Description */
  description: string;
  /** Changes made (for updates) */
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Success */
  success: boolean;
  /** Error message (if failed) */
  error?: string;
  /** Severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Audit log query
 */
export interface AuditLogQuery {
  /** Filter by date range */
  dateRange?: {
    from: string;
    to: string;
  };
  /** Filter by action types */
  actions?: AuditActionType[];
  /** Filter by entity types */
  entityTypes?: AuditEntityType[];
  /** Filter by entity ID */
  entityId?: string;
  /** Filter by user ID */
  userId?: string;
  /** Filter by success status */
  success?: boolean;
  /** Filter by severity */
  severity?: AuditLogEntry['severity'][];
  /** Filter by tags */
  tags?: string[];
  /** Search in description */
  search?: string;
  /** Limit results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort by */
  sortBy?: 'timestamp' | 'action' | 'entityType' | 'severity';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Audit log query result
 */
export interface AuditLogQueryResult {
  /** Log entries */
  entries: AuditLogEntry[];
  /** Total count */
  total: number;
  /** Limit */
  limit: number;
  /** Offset */
  offset: number;
  /** Has more */
  hasMore: boolean;
}

/**
 * Audit log export format
 */
export type AuditLogExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf';

/**
 * Audit log retention policy
 */
export interface AuditLogRetentionPolicy {
  /** Retention period (days) */
  retentionDays: number;
  /** Archive after (days) */
  archiveAfterDays?: number;
  /** Archive location */
  archiveLocation?: string;
  /** Compress archives */
  compressArchives?: boolean;
  /** Exclude entity types from retention */
  excludeEntityTypes?: AuditEntityType[];
}

/**
 * Audit log configuration
 */
export interface AuditLogConfig {
  /** Enable audit logging */
  enabled: boolean;
  /** Log level */
  logLevel?: AuditLogEntry['severity'];
  /** Actions to log */
  actionsToLog?: AuditActionType[];
  /** Entities to log */
  entitiesToLog?: AuditEntityType[];
  /** Include sensitive data */
  includeSensitiveData?: boolean;
  /** Mask fields (for sensitive data) */
  maskFields?: string[];
  /** Retention policy */
  retentionPolicy?: AuditLogRetentionPolicy;
  /** Real-time alerts */
  alerts?: Array<{
    condition: {
      action?: AuditActionType;
      entityType?: AuditEntityType;
      severity?: AuditLogEntry['severity'];
    };
    channels: ('email' | 'slack' | 'webhook')[];
    recipients: string[];
  }>;
}

/**
 * Audit log service interface
 */
export interface AuditLogService {
  /** Log an action */
  log(
    action: AuditActionType,
    entityType: AuditEntityType,
    description: string,
    options?: {
      entityId?: string;
      changes?: AuditLogEntry['changes'];
      metadata?: Record<string, unknown>;
      severity?: AuditLogEntry['severity'];
      tags?: string[];
      success?: boolean;
      error?: string;
    }
  ): Promise<string>;
  
  /** Query logs */
  query(query: AuditLogQuery): Promise<AuditLogQueryResult>;
  
  /** Get single log entry */
  getEntry(id: string): Promise<AuditLogEntry | null>;
  
  /** Export logs */
  export(
    query: AuditLogQuery,
    format: AuditLogExportFormat
  ): Promise<{
    /** Data as string (for JSON, CSV, text) or base64 encoded binary (for xlsx, pdf) */
    data: string;
    filename: string;
    mimeType: string;
  }>;
  
  /** Get audit statistics */
  getStatistics(period: {
    from: string;
    to: string;
  }): Promise<{
    totalEntries: number;
    byAction: Record<AuditActionType, number>;
    byEntity: Record<AuditEntityType, number>;
    bySeverity: Record<AuditLogEntry['severity'], number>;
    byUser: Array<{
      userId: string;
      userName?: string;
      count: number;
    }>;
    failureRate: number;
  }>;
  
  /** Get configuration */
  getConfig(): Promise<AuditLogConfig>;
  
  /** Update configuration */
  updateConfig(config: Partial<AuditLogConfig>): Promise<void>;
  
  /** Archive old logs */
  archiveLogs(olderThanDays: number): Promise<{
    archivedCount: number;
    archiveLocation: string;
  }>;
  
  /** Purge old logs */
  purgeLogs(olderThanDays: number): Promise<{
    purgedCount: number;
  }>;
}

// ============================================================================
// System Service Interface
// ============================================================================

/**
 * System health status
 */
export interface SystemHealthStatus {
  /** Overall status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Components status */
  components: {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    lastCheck: string;
  }[];
  /** Uptime (seconds) */
  uptime: number;
  /** Memory usage */
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  /** Version info */
  version: {
    sdk: string;
    app?: string;
  };
  /** Last error */
  lastError?: {
    message: string;
    timestamp: string;
    component: string;
  };
}

/**
 * System service interface
 */
export interface SystemService {
  /** Get offline mode service */
  getOfflineMode(): OfflineModeService;
  
  /** Get kiosk mode service */
  getKioskMode(): KioskModeService;
  
  /** Get audit log service */
  getAuditLog(): AuditLogService;
  
  /** Get system health */
  getHealth(): Promise<SystemHealthStatus>;
  
  /** Check for updates */
  checkForUpdates(): Promise<{
    available: boolean;
    version?: string;
    releaseNotes?: string;
  }>;
  
  /** Get system info */
  getSystemInfo(): {
    sdkVersion: string;
    environment: string;
    browser: string;
    platform: string;
    language: string;
    timezone: string;
  };
}
