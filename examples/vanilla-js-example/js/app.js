// Main application logic
(function () {
  'use strict';

  // DOM elements
  const form = document.getElementById('addressForm');
  const countrySelect = document.getElementById('country');
  const addressFields = document.getElementById('addressFields');
  const submitBtn = document.getElementById('submitBtn');
  const resultContainer = document.getElementById('resultContainer');
  const postalHint = document.getElementById('postalHint');
  const provinceLabel = document.getElementById('provinceLabel');

  // State
  let currentFormat = null;

  // Initialize
  function init() {
    countrySelect.addEventListener('change', handleCountryChange);
    form.addEventListener('submit', handleSubmit);
  }

  /**
   * Handles country selection change
   */
  function handleCountryChange(e) {
    const country = e.target.value;

    if (!country) {
      addressFields.style.display = 'none';
      submitBtn.disabled = true;
      resultContainer.style.display = 'none';
      return;
    }

    currentFormat = COUNTRY_FORMATS[country];
    
    if (currentFormat) {
      // Update UI based on country format
      updateFieldLabels();
      updateFieldRequirements();
      
      // Show address fields
      addressFields.style.display = 'block';
      submitBtn.disabled = false;
      resultContainer.style.display = 'none';
      
      // Clear previous values
      clearAddressFields();
    }
  }

  /**
   * Updates field labels based on country format
   */
  function updateFieldLabels() {
    // Update postal code hint
    const example = AddressValidator.getPostalCodeExample(currentFormat);
    postalHint.textContent = example ? `(e.g., ${example})` : '';

    // Update province label
    provinceLabel.textContent = AddressValidator.getFieldLabel('province', currentFormat);
  }

  /**
   * Updates field requirements based on country format
   */
  function updateFieldRequirements() {
    const fields = ['postal_code', 'province', 'city', 'street_address'];
    
    fields.forEach((field) => {
      const input = document.getElementById(field);
      const isRequired = AddressValidator.isFieldRequired(field, currentFormat);
      
      if (input) {
        input.required = isRequired;
      }
    });
  }

  /**
   * Clears all address field values
   */
  function clearAddressFields() {
    const fields = ['postal_code', 'province', 'city', 'street_address'];
    fields.forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        input.value = '';
        input.classList.remove('error-field');
      }
    });
  }

  /**
   * Handles form submission
   */
  function handleSubmit(e) {
    e.preventDefault();

    if (!currentFormat) return;

    // Get form data
    const formData = new FormData(form);
    const address = {
      country: formData.get('country'),
      postal_code: formData.get('postal_code'),
      province: formData.get('province'),
      city: formData.get('city'),
      street_address: formData.get('street_address'),
    };

    // Validate address
    const result = AddressValidator.validate(address, currentFormat);

    // Display result
    displayResult(result);

    // Log to console
    if (result.valid) {
      console.log('✅ Address validated successfully:', result.normalized);
    } else {
      console.error('❌ Validation errors:', result.errors);
    }
  }

  /**
   * Displays validation result
   */
  function displayResult(result) {
    // Clear previous error highlights
    clearErrorHighlights();

    if (result.valid) {
      displaySuccess(result.normalized);
    } else {
      displayErrors(result.errors);
    }

    resultContainer.style.display = 'block';
  }

  /**
   * Displays success message with formatted address
   */
  function displaySuccess(address) {
    const formattedAddress = AddressValidator.formatAddress(address);
    
    resultContainer.className = 'result-container success';
    resultContainer.innerHTML = `
      <h3>✅ Address is valid!</h3>
      <div class="formatted-address">
        <strong>Formatted Address:</strong>
        <pre>${formattedAddress}</pre>
      </div>
    `;
  }

  /**
   * Displays validation errors
   */
  function displayErrors(errors) {
    // Highlight error fields
    errors.forEach((error) => {
      const input = document.getElementById(error.field);
      if (input) {
        input.classList.add('error-field');
      }
    });

    // Display error messages
    const errorList = errors.map((error) => `<li>${error.message}</li>`).join('');
    
    resultContainer.className = 'result-container error';
    resultContainer.innerHTML = `
      <h3>❌ Validation Errors</h3>
      <ul>${errorList}</ul>
    `;
  }

  /**
   * Clears error field highlights
   */
  function clearErrorHighlights() {
    const inputs = form.querySelectorAll('input');
    inputs.forEach((input) => {
      input.classList.remove('error-field');
    });
  }

  // Start the application
  init();
})();
