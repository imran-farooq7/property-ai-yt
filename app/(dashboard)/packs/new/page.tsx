import { requireTenant } from '@/lib/tenant';
import { getProperties } from '@/lib/properties';
import { canEditProperty } from '@/lib/permissions';
import { createPackAction } from '@/lib/pack-actions';
import { TEMPLATES } from '@/lib/pdf/template-engine';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types';

export default async function NewPackPage() {
    const tenant = await requireTenant();
    if (!canEditProperty(tenant.role as UserRole)) {
        redirect('/packs');
    }

    const propertiesList = await getProperties(tenant.org.id);

    if (propertiesList.length === 0) {
        redirect('/properties/new');
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Breadcrumb & Header */}
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Link href="/packs" className="hover:text-blue-600 transition-colors">
                        Marketing Packs
                    </Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">Create New Pack</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Create Marketing Pack & PDF</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Select a property listing and a branded template layout to generate a high-resolution marketing pack.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <form action={createPackAction} className="space-y-6">
                    <input type="hidden" name="orgId" value={tenant.org.id} />

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                            Marketing Pack Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            defaultValue="Exclusive Property Showcase Flyer"
                            placeholder="e.g. Luxury Open House Flyer, Digital Brokerage Pack"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Property Selection */}
                    <div>
                        <label htmlFor="propertyId" className="block text-sm font-semibold text-gray-700">
                            Select Property Listing <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="propertyId"
                            name="propertyId"
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                            {propertiesList.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title} &bull; ${p.price.toLocaleString()} ({p.city}, {p.state})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Template Layout Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Select Template Layout <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {TEMPLATES.map((t, idx) => (
                                <label
                                    key={t.id}
                                    className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-all"
                                >
                                    <input
                                        type="radio"
                                        name="templateId"
                                        value={t.id}
                                        defaultChecked={idx === 0}
                                        className="mt-1 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <div className="font-bold text-xs text-gray-900">{t.name}</div>
                                        <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{t.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Custom Description / Notes Override */}
                    <div>
                        <label htmlFor="customDescription" className="block text-sm font-medium text-gray-700">
                            Custom Body Copy / Notes Override (Optional)
                        </label>
                        <textarea
                            name="customDescription"
                            id="customDescription"
                            rows={3}
                            placeholder="Leave blank to use the listing's description or AI generated copy."
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <Link
                            href="/packs"
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            Generate Marketing Pack &rarr;
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
