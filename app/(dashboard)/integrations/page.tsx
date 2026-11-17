import { requireTenant } from '@/lib/tenant';
import { listApiKeys, listWebhooks } from '@/lib/integrations';
import { getPacks } from '@/lib/packs';
import { IntegrationsClient } from '@/components/dashboard/integration-client';
import Link from 'next/link';

export const metadata = {
    title: 'Integrations & API | PropertyAI',
    description: 'Manage REST API keys, developer webhooks, and automated client email delivery.',
};

export default async function IntegrationsPage() {
    const tenant = await requireTenant();

    const [keys, hooks, packList] = await Promise.all([
        listApiKeys(tenant.org.id),
        listWebhooks(tenant.org.id),
        getPacks(tenant.org.id),
    ]);

    const packOptions = packList.map((p) => ({
        id: p.id,
        title: p.title,
        propertyTitle: p.propertyTitle,
    }));

    const isOwner = tenant.role === 'owner';
    const isAdmin = tenant.role === 'owner' || tenant.role === 'admin';

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Developer API & Integrations</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Connect your agency CRM, generate programmatic API keys, subscribe to webhooks, or email marketing packs directly to clients.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/packs"
                        className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        &larr; Marketing Packs
                    </Link>
                </div>
            </div>

            {/* Main Integrations Client UI */}
            <IntegrationsClient
                orgId={tenant.org.id}
                apiKeys={keys}
                webhooks={hooks}
                packs={packOptions}
                isOwner={isOwner}
                isAdmin={isAdmin}
            />
        </div>
    );
}
