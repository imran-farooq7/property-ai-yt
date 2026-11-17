import { requireTenant } from '@/lib/tenant';
import { canManageTeam, canDeleteOrg } from '@/lib/permissions';
import { updateOrganisationAction } from '@/lib/org-actions';
import { UserRole } from '@/types';

export default async function OrganisationSettingsPage() {
    const tenant = await requireTenant();
    const canEdit = canManageTeam(tenant.role as UserRole);
    const isOwner = canDeleteOrg(tenant.role as UserRole);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Agency Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Update agency profile, contact information, and localization defaults.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
                <form action={updateOrganisationAction} className="space-y-6">
                    <input type="hidden" name="orgId" value={tenant.org.id} />

                    {/* Role badge */}
                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-600 font-medium">Your Role in Agency:</span>
                        <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {tenant.role}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                                Agency Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                defaultValue={tenant.org.name}
                                required
                                disabled={!canEdit}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                Agency Slug / Portal ID
                            </label>
                            <input
                                type="text"
                                id="slug"
                                defaultValue={tenant.org.slug || ''}
                                readOnly
                                disabled
                                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-500 shadow-sm cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-400">Used in unique shareable links.</p>
                        </div>

                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                                Primary Timezone
                            </label>
                            <select
                                id="timezone"
                                name="timezone"
                                defaultValue={tenant.org.timezone}
                                disabled={!canEdit}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white disabled:bg-gray-100"
                            >
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Chicago">Central Time (CT)</option>
                                <option value="America/Denver">Mountain Time (MT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                <option value="Europe/London">London (GMT / BST)</option>
                                <option value="Australia/Sydney">Sydney (AEST)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                Website URL
                            </label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                defaultValue={tenant.org.website || ''}
                                disabled={!canEdit}
                                placeholder="https://agency.com"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Office Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                defaultValue={tenant.org.phone || ''}
                                disabled={!canEdit}
                                placeholder="+1 (555) 123-4567"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Office Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                defaultValue={tenant.org.address || ''}
                                disabled={!canEdit}
                                placeholder="Suite 400, 500 Boylston St, Boston, MA"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                                Logo Image URL
                            </label>
                            <input
                                type="url"
                                id="logo"
                                name="logo"
                                defaultValue={tenant.org.logo || ''}
                                disabled={!canEdit}
                                placeholder="https://example.com/logo.png"
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Will be printed automatically at the top of PDF marketing packs and brochures.
                            </p>
                        </div>
                    </div>

                    {canEdit && (
                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Danger Zone (Owner Only) */}
            {isOwner && (
                <div className="bg-red-50/60 border border-red-200 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-red-900">Danger Zone</h3>
                    <p className="mt-1 text-xs text-red-700">
                        Deleting the organisation will permanently remove all properties, generated AI content,
                        and marketing packs associated with this agency. This action cannot be undone.
                    </p>
                    <div className="mt-4">
                        <button
                            type="button"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        >
                            Delete Organisation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
