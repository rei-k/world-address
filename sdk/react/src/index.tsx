/**
 * @vey/react - React SDK for World Address
 * 
 * Premium, production-ready address form components
 * Built with Stripe-like quality and developer experience
 */

// Re-export core types
export type {
  AddressInput,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  CountryAddressFormat,
  VeyConfig,
  RegionHierarchy,
} from '@vey/core';

// Hooks
export {
  VeyProvider,
  useVeyClient,
  useAddressValidation,
  useCountryFormat,
  useAddressForm,
  useRegionHierarchy,
  useRequiredFields,
} from './hooks';
export type { VeyProviderProps } from './hooks';

// Components (Original)
export {
  AddressForm,
  AddressField,
  CountrySelect,
} from './components';
export type {
  AddressFormProps,
  AddressFieldProps,
  CountrySelectProps,
} from './components';

// Multilingual Components
export {
  MultilingualAddressForm,
} from './multilingual-components';
export type {
  MultilingualAddressFormProps,
} from './multilingual-components';

// Veyform - Universal Address Form System
export { VeyformAddressForm } from './VeyformAddressForm';
export type { VeyformAddressFormProps } from './VeyformAddressForm';

// ============================================================================
// Premium Components (Stripe-like Quality) - RECOMMENDED
// ============================================================================

/**
 * Premium address form components with world-class UX
 * - Beautiful, accessible UI
 * - Real-time validation
 * - Smart field ordering by country
 * - WCAG 2.1 AA compliant
 * - Fully customizable theming
 */
export {
  AddressElement,
  PostalCodeElement,
  CountrySelectElement,
} from './premium-components';
export type {
  AddressElementProps,
  PostalCodeElementProps,
  CountrySelectElementProps,
  AddressElementTheme,
} from './premium-components';

/**
 * Complete premium address form
 * All-in-one solution with dynamic field generation
 */
export { AddressFormPremium } from './AddressFormPremium';
export type { AddressFormPremiumProps } from './AddressFormPremium';

// Make AddressFormPremium the default export for convenience
export { AddressFormPremium as default } from './AddressFormPremium';

