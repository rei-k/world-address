import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAddressValidation } from './useAddressValidation';

interface AddressFormProps {
  countryCode: string;
  onSubmit?: (address: any, validation: any) => void;
  submitLabel?: string;
}

export function AddressForm({
  countryCode,
  onSubmit,
  submitLabel = 'Submit',
}: AddressFormProps) {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const { validate, isValidating, errors } = useAddressValidation();

  async function handleSubmit() {
    const validation = await validate(address, countryCode);
    
    if (validation.valid && onSubmit) {
      onSubmit(address, validation);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={styles.input}
          value={address.street}
          onChangeText={(text) => setAddress({ ...address, street: text })}
          placeholder="Enter street address"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={address.city}
          onChangeText={(text) => setAddress({ ...address, city: text })}
          placeholder="Enter city"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Province/State</Text>
        <TextInput
          style={styles.input}
          value={address.province}
          onChangeText={(text) => setAddress({ ...address, province: text })}
          placeholder="Enter province/state"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          style={styles.input}
          value={address.postalCode}
          onChangeText={(text) => setAddress({ ...address, postalCode: text })}
          placeholder="Enter postal code"
        />
      </View>

      {isValidating ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button title={submitLabel} onPress={handleSubmit} />
      )}

      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              {error}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fee',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c00',
  },
});
