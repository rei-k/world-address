import AddressForm from './components/AddressForm';

export default function Home() {
  return (
    <main className="container">
      <h1>🌍 Next.js Address Form Example</h1>
      <p className="subtitle">
        Demonstrating @vey/core SDK with Next.js App Router
      </p>
      <AddressForm />
    </main>
  );
}
