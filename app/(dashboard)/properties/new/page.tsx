import { requireTenant } from '@/lib/tenant';
import { canEditProperty } from '@/lib/permissions';
import { createPropertyAction } from '@/lib/property-actions';
import { COMMON_AMENITIES } from '@/schema/property';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types';

export default async function NewPropertyPage() {
    const tenant = await requireTenant();
    if (!canEditProperty(tenant.role as UserRole)) {
        redirect('/properties');
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Breadcrumb & Header */}
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Link href="/properties" className="hover:text-blue-600 transition-colors">
                        Properties
                    </Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">Add New Property</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Add Property Listing</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Enter listing specs and features. Our AI will turn these into marketing packs and flyers.
                </p>
            </div>

            <form action={createPropertyAction} className="space-y-8">
                <input type="hidden" name="orgId" value={tenant.org.id} />

                {/* Section 1: Core Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                        1. Core Information
                    </h2>

                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                            Listing Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            placeholder="e.g. Modern Coastal Luxury Villa with Infinity Pool"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                                Property Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="propertyType"
                                id="propertyType"
                                defaultValue="house"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                            >
                                <option value="house">Single Family House</option>
                                <option value="apartment">Apartment</option>
                                <option value="condo">Condominium</option>
                                <option value="townhouse">Townhouse</option>
                                <option value="land">Land / Plot</option>
                                <option value="commercial">Commercial Space</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Listing Status
                            </label>
                            <select
                                name="status"
                                id="status"
                                defaultValue="active"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                            >
                                <option value="active">Active Listing</option>
                                <option value="draft">Draft (Private)</option>
                                <option value="sold">Sold / Closed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Address & Location */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                        2. Location & Address
                    </h2>

                    <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                            Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            required
                            placeholder="e.g. 742 Evergreen Terrace"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                id="city"
                                required
                                placeholder="Springfield"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                State / County <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="state"
                                id="state"
                                required
                                placeholder="OR"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                                Zip / Postcode <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="zipCode"
                                id="zipCode"
                                required
                                placeholder="97477"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                Country
                            </label>
                            <select
                                name="country"
                                id="country"
                                defaultValue="US"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                            >
                                <option value="US">United States (US)</option>
                                <option value="UK">United Kingdom (UK)</option>
                                <option value="CA">Canada (CA)</option>
                                <option value="AU">Australia (AU)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Pricing & Specifications */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                        3. Pricing & Specs
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
                                Listing Price <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex rounded-lg shadow-sm">
                                <select
                                    name="currency"
                                    defaultValue="USD"
                                    className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:outline-none"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD (C$)</option>
                                    <option value="AUD">AUD (A$)</option>
                                </select>
                                <input
                                    type="number"
                                    name="price"
                                    id="price"
                                    required
                                    min="0"
                                    step="1000"
                                    placeholder="850000"
                                    className="block w-full rounded-r-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                                Bedrooms
                            </label>
                            <input
                                type="number"
                                name="bedrooms"
                                id="bedrooms"
                                defaultValue="3"
                                min="0"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                                Bathrooms
                            </label>
                            <input
                                type="number"
                                name="bathrooms"
                                id="bathrooms"
                                defaultValue="2"
                                min="0"
                                step="0.5"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
                                Living Area (sqft)
                            </label>
                            <input
                                type="number"
                                name="sqft"
                                id="sqft"
                                placeholder="2400"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="lotSize" className="block text-sm font-medium text-gray-700">
                                Lot Size (acres / sqft)
                            </label>
                            <input
                                type="number"
                                name="lotSize"
                                id="lotSize"
                                step="0.01"
                                placeholder="0.25"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700">
                                Year Built
                            </label>
                            <input
                                type="number"
                                name="yearBuilt"
                                id="yearBuilt"
                                placeholder="2018"
                                min="1700"
                                max="2030"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Amenities & Features */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">4. Key Amenities & Features</h2>
                            <p className="text-xs text-gray-500">
                                Select highlights that will be highlighted in AI marketing copy and brochures.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {COMMON_AMENITIES.map((amenity) => (
                            <label
                                key={amenity}
                                className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors text-xs text-gray-700 font-medium select-none"
                            >
                                <input
                                    type="checkbox"
                                    name="amenities"
                                    value={amenity}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                />
                                <span>{amenity}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Section 5: Photos & Cover Image */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                        5. Photos & Visuals
                    </h2>

                    <div>
                        <label htmlFor="heroImage" className="block text-sm font-semibold text-gray-700">
                            Primary Cover Photo URL
                        </label>
                        <input
                            type="url"
                            name="heroImage"
                            id="heroImage"
                            placeholder="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            This photo will be prominently displayed on flyer hero sections and listing cards.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="additionalImages" className="block text-sm font-medium text-gray-700">
                            Additional Photo URLs (One URL per line)
                        </label>
                        <textarea
                            name="additionalImages"
                            id="additionalImages"
                            rows={3}
                            placeholder="https://example.com/kitchen.jpg&#10;https://example.com/backyard.jpg"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                        />
                    </div>
                </div>

                {/* Section 6: Agent Notes */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                        6. Agent Notes / Starter Description (Optional)
                    </h2>
                    <textarea
                        name="description"
                        id="description"
                        rows={4}
                        placeholder="Add any specific selling points (e.g. recently renovated master suite, award-winning school district, motivated seller) to help AI write better copy."
                        className="block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Link
                        href="/properties"
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                    >
                        Save & View Property &rarr;
                    </button>
                </div>
            </form>
        </div>
    );
}
