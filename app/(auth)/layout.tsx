import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Left Column: Branding Banner */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center p-12">
                <div className="max-w-md text-white">
                    <h1 className="text-4xl font-bold">PropertyAI</h1>
                    <p className="mt-4 text-lg text-blue-100">
                        Transform property details into stunning marketing packs and branded PDF reports — powered by AI.
                    </p>
                    <ul className="mt-8 space-y-3 text-blue-100">
                        <li className="flex items-center gap-2">✓ AI-generated property descriptions</li>
                        <li className="flex items-center gap-2">✓ Branded PDF reports in seconds</li>
                        <li className="flex items-center gap-2">✓ Professional templates for estate agents</li>
                    </ul>
                </div>
            </div>

            {/* Right Column: Form Container */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="text-2xl font-bold text-blue-600">PropertyAI</Link>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
