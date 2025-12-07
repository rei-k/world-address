<script setup lang="ts">
import { ref } from 'vue';
import AddressForm from './components/AddressForm.vue';

const submittedAddress = ref<any>(null);

const handleSubmit = (address: any) => {
  submittedAddress.value = address;
  console.log('Address submitted:', address);
};
</script>

<template>
  <div class="app">
    <header>
      <h1>🌍 Vue 3 Address Form Example</h1>
      <p>International address validation using @vey/core SDK</p>
    </header>

    <main>
      <div class="container">
        <AddressForm @submit="handleSubmit" />

        <div v-if="submittedAddress" class="result">
          <h2>✅ Submitted Address</h2>
          <pre>{{ JSON.stringify(submittedAddress, null, 2) }}</pre>
        </div>
      </div>
    </main>

    <footer>
      <p>
        Powered by 
        <a href="https://github.com/rei-k/world-address-yaml" target="_blank">
          World Address YAML
        </a>
      </p>
    </footer>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

header p {
  margin: 0;
  opacity: 0.9;
}

main {
  flex: 1;
  padding: 2rem 1rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.result {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.result h2 {
  margin-top: 0;
  color: #28a745;
  font-size: 1.25rem;
}

.result pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
}

footer {
  background: #f8f9fa;
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

footer a {
  color: #667eea;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}
</style>
