import { requireTenant } from '@/lib/tenant';
import { getPackById } from '@/lib/packs';
import { canApprovePack } from '@/lib/permissions';
import { updatePackStatusAction, deletePackAction } from '@/lib/pack-actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UserRole } from '@/types';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PackDetailPage({ params }: PageProps) {
    const tenant = await requireTenant();
    const { id } = await params;

    const pack = await getPackById(tenant.org.id, id);
    if (!pack) {
        notFound();
    }

    const canApprove = canApprovePack(tenant.role as UserRole);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Breadcrumb & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                        <Link href="/packs" className="hover:text-blue-600 transition-colors">
                            Marketing Packs
                        </Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium truncate max-w-xs">{pack.title}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{pack.title}</h1>
                        <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${pack.status === 'approved' || pack.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : pack.status === 'in_review'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {pack.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            v{pack.currentVersion}
                        </span>
                    </div>

                    {pack.property && (
                        <p className="text-xs text-gray-500 mt-1">
                            🏡 Listing:{' '}
                            <Link href={`/properties/${pack.property.id}`} className="text-blue-600 hover:underline font-medium">
                                {pack.property.title}
                            </Link>{' '}
                            &bull; ${pack.property.price.toLocaleString()} ({pack.property.city}, {pack.property.state})
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/packs/${pack.id}/review`}
                        className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                        <span>💬</span>
                        <span>Review & QA Studio</span>
                    </Link>
                    <a
                        href={`/api/packs/${pack.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                        <span>📥</span>
                        <span>Download Print PDF</span>
                    </a>
                </div>
            </div>

            {/* Main Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: High-Res A4 Preview (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-3">
                    <div className="flex items-center justify-between px-1 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">A4 Document Preview</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">Print Ready &bull; Version {pack.currentVersion}</span>
                    </div>

                    <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-inner flex justify-center items-start overflow-hidden min-h-[700px]">
                        <div
                            className="bg-white shadow-2xl rounded-sm overflow-hidden"
                            style={{
                                width: '595px',
                                height: '842px',
                                transform: 'scale(0.82)',
                                transformOrigin: 'top center',
                            }}
                        >
                            <iframe
                                title="A4 Preview"
                                srcDoc={pack.latestHtml}
                                className="w-full h-full border-0 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Workflow Status, Versions, and Details (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Status Workflow Control */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Approval Workflow</h3>
                        <p className="text-xs text-gray-500">
                            Manage the review and publishing state of this marketing document.
                        </p>

                        <form action={updatePackStatusAction} className="pt-2 flex flex-col gap-2">
                            <input type="hidden" name="orgId" value={tenant.org.id} />
                            <input type="hidden" name="packId" value={pack.id} />

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                    type="submit"
                                    name="status"
                                    value="in_review"
                                    disabled={pack.status === 'in_review'}
                                    className={`py-2 px-3 rounded-lg border font-semibold transition-colors ${pack.status === 'in_review'
                                            ? 'bg-amber-50 border-amber-300 text-amber-800 cursor-default'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    Submit for Review
                                </button>

                                {canApprove ? (
                                    <button
                                        type="submit"
                                        name="status"
                                        value="approved"
                                        disabled={pack.status === 'approved'}
                                        className={`py-2 px-3 rounded-lg border font-semibold transition-colors ${pack.status === 'approved'
                                                ? 'bg-green-50 border-green-300 text-green-800 cursor-default'
                                                : 'border-gray-200 hover:bg-green-50 hover:border-green-300 text-green-700'
                                            }`}
                                    >
                                        ✓ Approve Pack
                                    </button>
                                ) : (
                                    <div className="py-2 px-3 rounded-lg border border-gray-100 bg-gray-50 text-[11px] text-gray-400 text-center font-medium">
                                        Admin Approval Required
                                    </div>
                                )}
                            </div>

                            {canApprove && (
                                <button
                                    type="submit"
                                    name="status"
                                    value="published"
                                    disabled={pack.status === 'published'}
                                    className="w-full mt-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 rounded-lg transition-colors"
                                >
                                    Mark as Published
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Version History */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                Version History ({pack.versions.length})
                            </h3>
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                                Latest: v{pack.currentVersion}
                            </span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {pack.versions.map((ver) => (
                                <div
                                    key={ver.id}
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-xs"
                                >
                                    <div>
                                        <span className="font-bold text-gray-900">Version {ver.version}</span>
                                        <span className="text-[10px] text-gray-500 ml-2">
                                            {new Date(ver.createdAt).toLocaleDateString()} at{' '}
                                            {new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {ver.version === pack.currentVersion && (
                                        <span className="text-[10px] text-green-700 font-semibold bg-green-100 px-1.5 py-0.5 rounded">
                                            Current
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pack Details Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 text-xs">
                        <h3 className="font-bold uppercase tracking-wider text-gray-700">Metadata</h3>
                        <div className="space-y-2 text-gray-600">
                            <div className="flex justify-between">
                                <span>Template:</span>
                                <span className="font-semibold text-gray-800 capitalize">{pack.templateId.replace(/-/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Created:</span>
                                <span className="font-semibold text-gray-800">{new Date(pack.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last Updated:</span>
                                <span className="font-semibold text-gray-800">{new Date(pack.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delete Action */}
                    <div className="pt-2">
                        <form action={deletePackAction}>
                            <input type="hidden" name="orgId" value={tenant.org.id} />
                            <input type="hidden" name="packId" value={pack.id} />
                            <button
                                type="submit"
                                className="w-full py-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-lg transition-colors"
                            >
                                Delete Marketing Pack
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
