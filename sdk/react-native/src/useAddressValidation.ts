import { useState } from 'react';
import { useVey } from './useVey';

export function useAddressValidation() {
  const { validateAddress } = useVey();
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function validate(address: any, countryCode: string) {
    setIsValidating(true);
    setErrors([]);

    try {
      const result = await validateAddress(address, countryCode);
      
      if (!result.valid) {
        setErrors(result.errors || []);
      }
      
      return result;
    } catch (error: any) {
      setErrors([error.message]);
      return { valid: false, errors: [error.message] };
    } finally {
      setIsValidating(false);
    }
  }

  return {
    validate,
    isValidating,
    errors,
  };
}
