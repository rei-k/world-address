import { validateAddress, normalizeAddress } from '@vey/core';
import { useVeyContext } from './VeyProvider';

export function useVey() {
  const config = useVeyContext();

  return {
    validateAddress: (address: any, countryCode: string) =>
      validateAddress(address, countryCode),
    normalizeAddress: (address: any, countryCode: string) =>
      normalizeAddress(address, countryCode),
    config,
  };
}
