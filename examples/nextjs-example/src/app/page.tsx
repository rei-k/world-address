import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Next.js 14 Address Example
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
          
          {session ? (
            <div>
              <p className="mb-4">
                Logged in as: <strong>{session.user?.email}</strong>
              </p>
              <div className="space-x-4">
                <Link
                  href="/addresses"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                >
                  Manage Addresses
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="inline-block bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
                >
                  Sign Out
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4">
                Please sign in to manage your addresses.
              </p>
              <Link
                href="/api/auth/signin"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>✅ Next.js 14 App Router with Server Components</li>
            <li>✅ NextAuth.js authentication</li>
            <li>✅ API routes for address CRUD operations</li>
            <li>✅ Webhook integration support</li>
            <li>✅ TypeScript with type safety</li>
            <li>✅ Tailwind CSS for styling</li>
            <li>✅ @vey/core SDK integration</li>
          </ul>
        </div>

        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Demo credentials: <br />
            Email: <code>demo@example.com</code><br />
            Password: <code>demo123</code>
          </p>
        </div>
      </div>
    </main>
  );
}
