import { auth } from '@/lib/auth';
import { getCurrentTenant } from '@/lib/tenant';
import { redirect } from 'next/navigation';
import { createOrganisationAction } from '@/lib/org-actions';

export default async function OnboardingPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")
    const tenant = await getCurrentTenant()
    if (tenant) redirect("/properties")
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white font-bold text-2xl mb-4 shadow-sm">
                    P
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Welcome to PropertyAI
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Set up your real estate agency workspace to start generating AI marketing packs.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-xl sm:px-10">
                    <form action={createOrganisationAction} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                                Agency / Brokerage Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                placeholder="e.g. Prestige Coastal Properties"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Complete Workspace Setup &rarr;
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
