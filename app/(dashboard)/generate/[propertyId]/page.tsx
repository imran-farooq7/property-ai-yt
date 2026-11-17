import { requireTenant } from '@/lib/tenant';
import { getPropertyById } from '@/lib/properties';
import { checkCreditAllowance } from '@/lib/billing';
import { getPropertyGenerations } from '@/lib/ai/generator';
import { canGenerateContent } from '@/lib/permissions';
import { AiGeneratorClient } from '@/components/ai/ai-generator-client';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { UserRole } from '@/types';

interface PageProps {
    params: Promise<{
        propertyId: string;
    }>;
}

export default async function GenerateContentPage({ params }: PageProps) {
    const tenant = await requireTenant();
    const { propertyId } = await params;

    if (!canGenerateContent(tenant.role as UserRole)) {
        redirect('/properties');
    }

    const property = await getPropertyById(tenant.org.id, propertyId);
    if (!property) {
        notFound();
    }

    const [allowance, history] = await Promise.all([
        checkCreditAllowance(tenant.org.id),
        getPropertyGenerations(tenant.org.id, propertyId),
    ]);

    const currencySymbols: Record<string, string> = {
        USD: '$',
        GBP: '£',
        AUD: 'A$',
        CAD: 'C$',
    };
    const sym = currencySymbols[property.currency] || '$';

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Breadcrumb & Navigation */}
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Link href="/properties" className="hover:text-blue-600 transition-colors">
                        Properties
                    </Link>
                    <span>/</span>
                    <Link href={`/properties/${property.id}`} className="hover:text-blue-600 transition-colors truncate max-w-xs">
                        {property.title}
                    </Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">AI Marketing Hub</span>
                </div>

                {/* Listing Summary Bar with Credit Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            {property.heroImage ? (
                                <img src={property.heroImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">🏡</div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-gray-900">{property.title}</h1>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                    {sym}{property.price.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                📍 {property.address}, {property.city}, {property.state} &bull; {property.bedrooms} Beds &bull; {property.bathrooms} Baths
                                {property.sqft ? ` &bull; ${property.sqft.toLocaleString()} sqft` : ''}
                            </p>
                        </div>
                    </div>

                    {/* AI Credits Badge */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-xs font-medium text-gray-500">AI Credits Remaining</div>
                            <div className="text-sm font-bold text-gray-900">
                                {allowance.limit === -1 ? 'Unlimited' : `${allowance.remaining} / ${allowance.limit}`}
                            </div>
                        </div>
                        <Link
                            href="/settings/billing"
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                            Get More &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Interactive AI Workbench */}
            <AiGeneratorClient
                orgId={tenant.org.id}
                propertyId={property.id}
                propertyTitle={property.title}
                creditsRemaining={allowance.remaining}
                creditLimit={allowance.limit}
                initialHistory={history}
            />
        </div>
    );
}
