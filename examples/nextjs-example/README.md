# Next.js 14 Address Form Example

This example demonstrates how to use the `@vey/core` SDK with Next.js 14 App Router, including API routes and authentication.

## Features

- ✅ **Next.js 14 App Router** - Uses the latest App Router architecture
- ✅ **Server and Client Components** - Optimal performance with RSC
- ✅ **API Routes** - Full CRUD API for addresses
- ✅ **Authentication** - NextAuth.js integration with credentials provider
- ✅ **TypeScript** - Full type safety with Zod validation
- ✅ **Real-time validation** - Client-side validation with immediate feedback
- ✅ **Country-specific validation** - Different rules for different countries
- ✅ **Responsive design** - Tailwind CSS for modern UI
- ✅ **Webhooks** - Webhook integration support
- ✅ **Server Actions** - Modern data mutations with Server Actions

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to see the example in action.

## Project Structure

```
nextjs-example/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home page (server component)
│   │   ├── layout.tsx         # Root layout
│   │   └── api/
│   │       └── addresses/
│   │           └── route.ts   # API endpoint
│   └── components/
│       ├── AddressForm.tsx    # Client component
│       └── CountrySelect.tsx  # Client component
├── public/
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Key Concepts

### 1. Server Components (RSC)

The main page is a Server Component, which means it's rendered on the server:

```tsx
// src/app/page.tsx
export default function Home() {
  // This runs on the server
  return (
    <main>
      <AddressForm />
    </main>
  );
}
```

### 2. Client Components

Interactive components use the `'use client'` directive:

```tsx
'use client';

import { useState } from 'react';

export default function AddressForm() {
  const [address, setAddress] = useState({...});
  // Client-side interactivity
}
```

### 3. API Routes

Next.js 14 uses Route Handlers for API endpoints:

```typescript
// src/app/api/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const address = await request.json();
  // Process address
  return NextResponse.json({ success: true });
}
```

### 4. TypeScript Integration

Full TypeScript support with auto-completion:

```typescript
import type { AddressInput, ValidationResult } from '@vey/core';

const [address, setAddress] = useState<AddressInput>({
  country: 'JP',
  postal_code: '',
  province: '',
  city: '',
  street_address: '',
});
```

## Features in Detail

### Server-Side Rendering (SSR)

- Fast initial page load
- SEO-friendly
- Pre-rendered HTML

### Client-Side Interactivity

- Real-time validation
- Dynamic form fields based on country
- Smooth user experience

### API Integration

```typescript
// Submit address to API
const response = await fetch('/api/addresses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(address),
});

const result = await response.json();
```

## Extending This Example

### Add Database Integration

```typescript
// src/app/api/addresses/route.ts
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const address = await request.json();
  
  const saved = await prisma.address.create({
    data: address,
  });
  
  return NextResponse.json(saved);
}
```

### Add Authentication

```typescript
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Process authenticated request
}
```

### Add Server Actions

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function submitAddress(formData: FormData) {
  const address = {
    country: formData.get('country'),
    postal_code: formData.get('postal_code'),
    // ...
  };
  
  // Save to database
  await saveAddress(address);
  
  // Revalidate page
  revalidatePath('/addresses');
  
  return { success: true };
}
```

## Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Add other environment variables
DATABASE_URL=...
```

## Testing

```bash
# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Performance

This example uses Next.js 14 optimizations:

- **React Server Components** - Reduce client-side JavaScript
- **Streaming** - Progressive rendering
- **Automatic Code Splitting** - Load only what's needed
- **Image Optimization** - Optimized images with next/image

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [@vey/core SDK Documentation](../../sdk/core/README.md)

## License

MIT
