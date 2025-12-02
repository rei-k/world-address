/**
 * Carrier Integration SDK for Digital Handshake Logistics
 * 
 * Supports:
 * - SF Express (顺丰速运)
 * - JD Logistics (京东物流)
 * - China Post (中国邮政)
 * - YTO Express (圆通速递)
 * - ZTO Express (中通快递)
 */

export * from './types';
export * from './adapters/base';
export * from './adapters/sf-express';
export * from './adapters/jd-logistics';
export * from './utils/address-mapper';
export * from './utils/handshake-token';
