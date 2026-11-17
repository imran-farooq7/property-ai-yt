import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { getCurrentTenant } from '@/lib/tenant';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const tenant = await getCurrentTenant();
    if (!tenant) {
        redirect('/onboarding');
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Left Sidebar: Navigation & Active Agency Badge */}
            <Sidebar orgName={tenant.org.name} role={tenant.role} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header: User Profile & Logout */}
                <Header orgName={tenant.org.name} role={tenant.role} />

                {/* Dynamic Pages (Properties, AI Studio, etc.) */}
                <main className="flex-1 overflow-y-auto p-6 sm:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
