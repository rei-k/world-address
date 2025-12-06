/**
 * Carrier Integration SDK for Digital Handshake Logistics
 * 
 * Supports:
 * - SF Express (顺丰速运) - China
 * - JD Logistics (京东物流) - China
 * - Yamato Transport (ヤマト運輸) - Japan
 * - UPS (United Parcel Service) - Global
 * - FedEx - Global
 * - DHL Express - Global
 * 
 * Features:
 * - Unified carrier API
 * - Automatic carrier selection
 * - Performance monitoring
 * - Smart recommendations
 */

// Core types
export * from './types';

// Base adapter
export * from './adapters/base';

// Carrier adapters
export * from './adapters/sf-express';
export * from './adapters/jd-logistics';
export * from './adapters/ups';
export * from './adapters/fedex';
export * from './adapters/dhl-express';
export * from './adapters/yamato-transport';

// Registry and factory
export * from './registry';
export * from './factory';

// Utilities
export * from './utils/address-mapper';
export * from './utils/handshake-token';

// Standard formats
export * from './formats';
