import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900">PropertyAI</h1>
      <p className="mt-4 text-lg text-gray-600">The Ultimate Real Estate Marketing Platform</p>
      <Link href="/login" className="mt-8 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
        Get Started
      </Link>
    </main>
  );
}
