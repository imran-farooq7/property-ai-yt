import { requireTenant } from '@/lib/tenant';
import { getProperties, getPropertyStats } from '@/lib/properties';
import { canEditProperty } from '@/lib/permissions';
import { PropertyTypeFilter } from '@/components/dashboard/property-type-filter';
import Link from 'next/link';
import { UserRole } from '@/types';

interface PageProps {
    searchParams: Promise<{
        q?: string;
        status?: string;
        type?: string;
    }>;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
    const tenant = await requireTenant();
    const params = await searchParams;
    const canEdit = canEditProperty(tenant.role as UserRole);

    const filterQuery = params.q || '';
    const filterStatus = params.status || 'all';
    const filterType = params.type || 'all';

    const [propertiesList, stats] = await Promise.all([
        getProperties(tenant.org.id, {
            query: filterQuery,
            status: filterStatus,
            propertyType: filterType,
        }),
        getPropertyStats(tenant.org.id),
    ]);

    const currencySymbols: Record<string, string> = {
        USD: '$',
        GBP: '£',
        AUD: 'A$',
        CAD: 'C$',
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Property Listings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your real estate listings and generate AI marketing packs for{' '}
                        <span className="font-semibold text-gray-700">{tenant.org.name}</span>.
                    </p>
                </div>

                {canEdit && (
                    <div className="flex items-center gap-3">
                        <Link
                            href="/properties/import"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <span>📥</span>
                            <span>Import CSV</span>
                        </Link>
                        <Link
                            href="/properties/new"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <span>+</span>
                            <span>Add Property</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link
                    href="/properties"
                    className={`p-4 rounded-xl border transition-all ${filterStatus === 'all'
                        ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-xs font-medium text-gray-500">Total Listings</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
                </Link>
                <Link
                    href="/properties?status=active"
                    className={`p-4 rounded-xl border transition-all ${filterStatus === 'active'
                        ? 'bg-green-50/60 border-green-200 ring-1 ring-green-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-xs font-medium text-green-700">Active Listings</div>
                    <div className="text-2xl font-bold text-green-800 mt-1">{stats.active}</div>
                </Link>
                <Link
                    href="/properties?status=draft"
                    className={`p-4 rounded-xl border transition-all ${filterStatus === 'draft'
                        ? 'bg-gray-100 border-gray-300 ring-1 ring-gray-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-xs font-medium text-gray-500">Drafts</div>
                    <div className="text-2xl font-bold text-gray-700 mt-1">{stats.draft}</div>
                </Link>
                <Link
                    href="/properties?status=sold"
                    className={`p-4 rounded-xl border transition-all ${filterStatus === 'sold'
                        ? 'bg-purple-50/60 border-purple-200 ring-1 ring-purple-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-xs font-medium text-purple-700">Sold / Closed</div>
                    <div className="text-2xl font-bold text-purple-800 mt-1">{stats.sold}</div>
                </Link>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                <form method="GET" action="/properties" className="flex-1 flex gap-2">
                    <input
                        type="text"
                        name="q"
                        defaultValue={filterQuery}
                        placeholder="Search by title, address, city, or zip..."
                        className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    {filterStatus !== 'all' && <input type="hidden" name="status" value={filterStatus} />}
                    {filterType !== 'all' && <input type="hidden" name="type" value={filterType} />}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <PropertyTypeFilter defaultValue={filterType} />
                </div>
            </div>

            {/* Property Grid */}
            {propertiesList.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                    <div className="text-4xl mb-3">🏡</div>
                    <h3 className="text-lg font-bold text-gray-900">No properties found</h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                        {filterQuery || filterStatus !== 'all'
                            ? 'Try changing your search query or filters to find what you are looking for.'
                            : 'Add your first property listing or import a batch via CSV to start generating AI marketing packs.'}
                    </p>
                    {canEdit && (
                        <div className="mt-6 flex justify-center gap-3">
                            <Link
                                href="/properties/new"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                + Add Property
                            </Link>
                            <Link
                                href="/properties/import"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                Import CSV
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {propertiesList.map((property) => {
                        const sym = currencySymbols[property.currency] || '$';
                        const formattedPrice = `${sym}${property.price.toLocaleString()}`;

                        return (
                            <div
                                key={property.id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Property Cover Image */}
                                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                        {property.heroImage ? (
                                            <img
                                                src={property.heroImage}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                                <span className="text-3xl">🏠</span>
                                                <span className="text-xs mt-1">No photo uploaded</span>
                                            </div>
                                        )}
                                        {/* Status Badge */}
                                        <span
                                            className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm capitalize ${property.status === 'active'
                                                ? 'bg-green-600 text-white'
                                                : property.status === 'sold'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-700 text-white'
                                                }`}
                                        >
                                            {property.status}
                                        </span>
                                        {/* Property Type Badge */}
                                        <span className="absolute bottom-3 left-3 text-[11px] font-medium bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded capitalize">
                                            {property.propertyType}
                                        </span>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5">
                                        <div className="text-xl font-bold text-gray-900">{formattedPrice}</div>
                                        <Link
                                            href={`/properties/${property.id}`}
                                            className="mt-1 font-semibold text-gray-800 hover:text-blue-600 block line-clamp-1 transition-colors"
                                        >
                                            {property.title}
                                        </Link>
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                                            {property.address}, {property.city}, {property.state} {property.zipCode}
                                        </p>

                                        {/* Specs Row */}
                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                                            <div className="flex items-center gap-1 font-medium">
                                                <span>🛏</span>
                                                <span>{property.bedrooms} Beds</span>
                                            </div>
                                            <div className="flex items-center gap-1 font-medium">
                                                <span>🚿</span>
                                                <span>{property.bathrooms} Baths</span>
                                            </div>
                                            {property.sqft && (
                                                <div className="flex items-center gap-1 font-medium">
                                                    <span>📐</span>
                                                    <span>{property.sqft.toLocaleString()} sqft</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center gap-2">
                                    <Link
                                        href={`/generate/${property.id}`}
                                        className="flex-1 py-2 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span>⚡</span>
                                        <span>AI Pack</span>
                                    </Link>
                                    <Link
                                        href={`/properties/${property.id}`}
                                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
