/**
 * VeyExpress Application
 * Main entry point for the VeyExpress platform
 */

export * from './types';
export * from './types/carrier-data';
export * from './api';
export * from './services/address-protocol';
export * from './services/carrier-verification';
export * from './services/carrier-database';
export * from './sdk';
export * from './sdk/plugins/shopify';

import VeyExpressSDK from './sdk';

export { VeyExpressSDK };
export default VeyExpressSDK;
