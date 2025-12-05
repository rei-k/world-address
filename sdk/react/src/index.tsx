/**
 * @vey/react - React SDK for World Address
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

// Components
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

