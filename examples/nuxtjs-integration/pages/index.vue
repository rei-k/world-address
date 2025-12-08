<template>
  <div class="min-h-screen p-8 md:p-24">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Nuxt.js 3 Address Example
      </h1>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Welcome!</h2>
        
        <div v-if="status === 'authenticated'" class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            Logged in as: <strong>{{ data?.user?.email }}</strong>
          </p>
          <div class="flex space-x-4">
            <NuxtLink
              to="/addresses"
              class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
              Manage Addresses
            </NuxtLink>
            <button
              @click="signOut"
              class="inline-block bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            Please sign in to manage your addresses.
          </p>
          <NuxtLink
            to="/login"
            class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
            Sign In
          </NuxtLink>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Features</h2>
        <ul class="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
          <li>✅ Nuxt.js 3 with TypeScript</li>
          <li>✅ Server API routes with Nitro</li>
          <li>✅ Authentication with @sidebase/nuxt-auth</li>
          <li>✅ API routes for address CRUD operations</li>
          <li>✅ Webhook integration support</li>
          <li>✅ Type-safe with Zod validation</li>
          <li>✅ Tailwind CSS for styling</li>
          <li>✅ @vey/core SDK integration</li>
        </ul>
      </div>

      <div class="mt-8 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Demo credentials: <br />
          Email: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">demo@example.com</code><br />
          Password: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">demo123</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { status, data, signOut } = useAuth();
</script>
