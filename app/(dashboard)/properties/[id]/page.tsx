import { requireTenant } from '@/lib/tenant';
import { getPropertyById } from '@/lib/properties';
import { canEditProperty } from '@/lib/permissions';
import { deletePropertyAction, updatePropertyAction } from '@/lib/property-actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UserRole } from '@/types';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
    const tenant = await requireTenant();
    const { id } = await params;

    const property = await getPropertyById(tenant.org.id, id);
    if (!property) {
        notFound();
    }

    const canEdit = canEditProperty(tenant.role as UserRole);

    const currencySymbols: Record<string, string> = {
        USD: '$',
        GBP: '£',
        AUD: 'A$',
        CAD: 'C$',
    };
    const sym = currencySymbols[property.currency] || '$';
    const priceFormatted = `${sym}${property.price.toLocaleString()}`;
    const pricePerSqft = property.sqft ? Math.round(property.price / property.sqft) : null;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Link href="/properties" className="hover:text-blue-600 transition-colors">
                            Properties
                        </Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium truncate max-w-xs">{property.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                        <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${property.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : property.status === 'sold'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {property.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        📍 {property.address}, {property.city}, {property.state} {property.zipCode}, {property.country}
                    </p>
                </div>

                {/* Primary CTA: Launch AI Content Generator */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/generate/${property.id}`}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                        <span>⚡</span>
                        <span>Generate Marketing Pack</span>
                    </Link>
                </div>
            </div>

            {/* Main Visuals & Specs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Photos & Description */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cover Photo */}
                    <div className="h-96 w-full rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                        {property.heroImage ? (
                            <img
                                src={property.heroImage}
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                <span className="text-5xl">🏡</span>
                                <span className="text-sm mt-2">No cover photo uploaded</span>
                            </div>
                        )}
                    </div>

                    {/* Additional Photos Gallery (if any) */}
                    {property.images && property.images.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                                Gallery Photos ({property.images.length})
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {property.images.map((img) => (
                                    <div key={img.id} className="h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description & Agent Notes */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                            Listing Description & Notes
                        </h3>
                        {property.description ? (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {property.description}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">
                                No description provided yet. Click &apos;Generate Marketing Pack&apos; to create one with AI!
                            </p>
                        )}
                    </div>

                    {/* Key Amenities */}
                    {property.amenitiesList && property.amenitiesList.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                                Amenities & Features
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {property.amenitiesList.map((amenity) => (
                                    <span
                                        key={amenity}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                    >
                                        <span>✓</span>
                                        <span>{amenity}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Pricing & Property Specifications */}
                <div className="space-y-6">
                    {/* Price Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Asking Price</div>
                        <div className="text-3xl font-extrabold text-gray-900 mt-1">{priceFormatted}</div>
                        {pricePerSqft && (
                            <div className="text-xs text-gray-500 mt-1 font-medium">
                                {sym}{pricePerSqft.toLocaleString()} / sqft
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Property Type:</span>
                                <span className="font-semibold text-gray-800 capitalize">{property.propertyType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Bedrooms:</span>
                                <span className="font-semibold text-gray-800">{property.bedrooms}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Bathrooms:</span>
                                <span className="font-semibold text-gray-800">{property.bathrooms}</span>
                            </div>
                            {property.sqft && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Square Footage:</span>
                                    <span className="font-semibold text-gray-800">{property.sqft.toLocaleString()} sqft</span>
                                </div>
                            )}
                            {property.lotSize && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Lot Size:</span>
                                    <span className="font-semibold text-gray-800">{property.lotSize} acres</span>
                                </div>
                            )}
                            {property.yearBuilt && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Year Built:</span>
                                    <span className="font-semibold text-gray-800">{property.yearBuilt}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Currency:</span>
                                <span className="font-semibold text-gray-800">{property.currency}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Generation Quick Link */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-sm">
                        <h3 className="font-bold text-lg">Marketing Hub</h3>
                        <p className="mt-1 text-xs text-blue-100 leading-relaxed">
                            Generate property descriptions, headline copy, feature bullet points, and social media captions ready for export.
                        </p>
                        <Link
                            href={`/generate/${property.id}`}
                            className="mt-4 block w-full text-center py-2.5 px-4 bg-white text-blue-700 font-semibold text-xs rounded-lg shadow hover:bg-blue-50 transition-colors"
                        >
                            Start AI Generation &rarr;
                        </Link>
                    </div>

                    {/* Management Actions */}
                    {canEdit && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Management</div>
                            <form action={deletePropertyAction}>
                                <input type="hidden" name="orgId" value={tenant.org.id} />
                                <input type="hidden" name="propertyId" value={property.id} />
                                <button
                                    type="submit"
                                    className="w-full py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                                >
                                    Delete Listing
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
