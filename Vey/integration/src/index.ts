/**
 * @vey/integration - Vey Integration SDK
 * 
 * Main entry point for the Vey Integration SDK.
 * Provides ZKP Address Protocol with ConveyID delivery system.
 */

// Main integration classes
export {
  ZKPIntegration,
  createZKPIntegration,
  createSandboxIntegration,
  createProductionIntegration,
  type ZKPIntegrationConfig,
  type AddressRegistration,
  type ConveyDeliveryRequest,
  type DeliveryAcceptance,
  type CarrierAccess,
} from './zkp-integration';

export {
  ConveyProtocol,
  createConveyProtocol,
  parseConveyID,
  formatConveyID,
  isValidConveyID,
  generateConveyID,
  getNamespacePriority,
  isAnonymousNamespace,
  requiresBusinessVerification,
  type ConveyID,
  type ConveyUser,
  type DeliveryAcceptancePolicy,
  type DeliveryRequest,
  type DeliveryResponse,
} from './convey-protocol';

export {
  DeliveryFlow,
  createDeliveryFlow,
  executeCompleteDeliveryWorkflow,
  type Carrier,
  type ShippingQuote,
  type Waybill,
  type TrackingEvent,
  type DeliveryCompletion,
} from './delivery-flow';

// Recipient resolver - Email-like delivery recipient determination
export {
  RecipientResolver,
  createRecipientResolver,
  createDefaultAcceptancePolicy,
  createPermissiveAcceptancePolicy,
  createStrictAcceptancePolicy,
  createDefaultAddressSelectionRules,
  mergeAcceptancePolicies,
  type RecipientInfo,
  type AddressSelectionRule,
  type AddressCondition,
  type RecipientValidationResult,
  type DeliveryAcceptanceResult,
  type PackageDetails,
  type DeliveryRequestInfo,
} from './recipient-resolver';

// Re-export core ZKP types for convenience
export type {
  DIDDocument,
  VerifiableCredential,
  ZKProof,
} from '../../../sdk/core/src/types';
