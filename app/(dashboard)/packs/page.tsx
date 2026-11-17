import { requireTenant } from '@/lib/tenant';
import { getPacks, getPackStats } from '@/lib/packs';
import { canEditProperty } from '@/lib/permissions';
import Link from 'next/link';
import { UserRole } from '@/types';

interface PageProps {
    searchParams: Promise<{
        q?: string;
        status?: string;
    }>;
}

export default async function MarketingPacksPage({ searchParams }: PageProps) {
    const tenant = await requireTenant();
    const params = await searchParams;
    const canCreate = canEditProperty(tenant.role as UserRole);

    const filterQuery = params.q || '';
    const filterStatus = params.status || 'all';

    const [packsList, stats] = await Promise.all([
        getPacks(tenant.org.id, {
            query: filterQuery,
            status: filterStatus,
        }),
        getPackStats(tenant.org.id),
    ]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Marketing Packs & PDFs</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Generate, review, and download branded print-ready flyers and PDF reports for{' '}
                        <span className="font-semibold text-gray-700">{tenant.org.name}</span>.
                    </p>
                </div>

                {canCreate && (
                    <Link
                        href="/packs/new"
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
                    >
                        <span>+</span>
                        <span>Create Marketing Pack</span>
                    </Link>
                )}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link
                    href="/packs"
                    className={`p-4 rounded-xl border transition-all ${filterStatus === 'all'
                        ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-xs font-medium text-gray-500">Total Packs</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
                </Link>
                <Link
                    href="/packs?status=approved"
                    className={`p-4 rounded-xl border transition-all ${filterStatus === 'approved'
                        ? 'bg-green-50/60 border-green-200 ring-1 ring-green-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-xs font-medium text-green-700">Approved & Ready</div>
                    <div className="text-2xl font-bold text-green-800 mt-1">{stats.approved + stats.published}</div>
                </Link>
                <Link
                    href="/packs?status=in_review"
                    className={`p-4 rounded-xl border transition-all ${filterStatus === 'in_review'
                        ? 'bg-amber-50/60 border-amber-200 ring-1 ring-amber-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-xs font-medium text-amber-700">In Review</div>
                    <div className="text-2xl font-bold text-amber-800 mt-1">{stats.in_review}</div>
                </Link>
                <Link
                    href="/packs?status=draft"
                    className={`p-4 rounded-xl border transition-all ${filterStatus === 'draft'
                        ? 'bg-gray-100 border-gray-300 ring-1 ring-gray-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-xs font-medium text-gray-500">Drafts</div>
                    <div className="text-2xl font-bold text-gray-700 mt-1">{stats.draft}</div>
                </Link>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                <form method="GET" action="/packs" className="flex-1 flex gap-2">
                    <input
                        type="text"
                        name="q"
                        defaultValue={filterQuery}
                        placeholder="Search packs by title..."
                        className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    {filterStatus !== 'all' && <input type="hidden" name="status" value={filterStatus} />}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Packs Grid */}
            {packsList.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                    <div className="text-4xl mb-3">📦</div>
                    <h3 className="text-lg font-bold text-gray-900">No marketing packs found</h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                        {filterQuery || filterStatus !== 'all'
                            ? 'No packs matched your search or status filter.'
                            : 'Generate your first branded marketing pack or PDF flyer for any listing in seconds.'}
                    </p>
                    {canCreate && (
                        <div className="mt-6 flex justify-center">
                            <Link
                                href="/packs/new"
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                + Create Marketing Pack
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packsList.map((pack) => {
                        return (
                            <div
                                key={pack.id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Thumbnail / Header */}
                                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                                        {pack.propertyHeroImage ? (
                                            <img
                                                src={pack.propertyHeroImage}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                                <span className="text-3xl">📄</span>
                                                <span className="text-xs mt-1">Marketing Flyer</span>
                                            </div>
                                        )}
                                        {/* Status badge */}
                                        <span
                                            className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm capitalize ${pack.status === 'approved' || pack.status === 'published'
                                                ? 'bg-green-600 text-white'
                                                : pack.status === 'in_review'
                                                    ? 'bg-amber-500 text-white'
                                                    : 'bg-gray-700 text-white'
                                                }`}
                                        >
                                            {pack.status.replace(/_/g, ' ')}
                                        </span>
                                        {/* Version Badge */}
                                        <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                                            v{pack.currentVersion}
                                        </span>
                                    </div>

                                    {/* Body Content */}
                                    <div className="p-5">
                                        <Link
                                            href={`/packs/${pack.id}`}
                                            className="font-bold text-base text-gray-900 hover:text-blue-600 block line-clamp-1 transition-colors"
                                        >
                                            {pack.title}
                                        </Link>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                            🏡 {pack.propertyTitle} &bull; {pack.propertyCity}
                                        </p>

                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                                            <span className="capitalize">{pack.templateId.replace(/-/g, ' ')}</span>
                                            <span>{new Date(pack.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="p-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center gap-2">
                                    <a
                                        href={`/api/packs/${pack.id}/pdf`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 py-2 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <span>📥</span>
                                        <span>Download PDF</span>
                                    </a>
                                    <Link
                                        href={`/packs/${pack.id}`}
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
