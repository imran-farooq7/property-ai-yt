import { requireTenant } from '@/lib/tenant';
import { getAgencyAnalytics } from '@/lib/analytics';
import Link from 'next/link';

export default async function AnalyticsPage() {
    const tenant = await requireTenant();
    const analytics = await getAgencyAnalytics(tenant.org.id);

    const kpis = analytics.kpis;
    const creditPercent =
        kpis.creditLimit === -1 ? 0 : Math.min(100, Math.round((kpis.creditsUsed / kpis.creditLimit) * 100));

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agency Analytics & Performance</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Real-time marketing generation statistics, PDF flyer engagement, and listing metrics for{' '}
                        <span className="font-semibold text-gray-700">{tenant.org.name}</span>.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/packs"
                        className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        View Marketing Packs &rarr;
                    </Link>
                </div>
            </div>

            {/* Top 4 Key Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Properties */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>Properties Listed</span>
                        <span>🏡</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalProperties}</div>
                    <div className="mt-2 text-[11px] text-gray-500">
                        <span className="text-green-600 font-semibold">{kpis.activeListings} active</span> &bull;{' '}
                        <span className="text-purple-600 font-semibold">{kpis.soldListings} sold</span>
                    </div>
                </div>

                {/* Marketing Packs */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>Marketing Packs</span>
                        <span>📦</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalPacks}</div>
                    <div className="mt-2 text-[11px] text-gray-500">
                        <span className="text-green-600 font-semibold">{kpis.approvedPacks} approved / ready</span>
                    </div>
                </div>

                {/* AI Generations */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>AI Copy Generated</span>
                        <span>⚡</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalGenerations}</div>
                    <div className="mt-2 text-[11px] text-gray-500">
                        <span>~{kpis.totalTokens.toLocaleString()} tokens processed</span>
                    </div>
                </div>

                {/* PDF Downloads */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>PDF Flyers Downloaded</span>
                        <span>📥</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{kpis.pdfDownloads}</div>
                    <div className="mt-2 text-[11px] text-gray-500">
                        <span className="text-blue-600 font-semibold">Print-ready materials</span>
                    </div>
                </div>
            </div>

            {/* Credit Quota & Usage Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">AI Monthly Generation Allowance</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Credits reset at the start of your billing cycle.
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                            {kpis.creditsUsed} / {kpis.creditLimit === -1 ? '∞ Unlimited' : kpis.creditLimit}
                        </span>
                        <span className="text-xs text-gray-400 ml-1.5">credits consumed</span>
                    </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mt-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${creditPercent >= 90 ? 'bg-red-500' : creditPercent >= 75 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                        style={{ width: kpis.creditLimit === -1 ? '8%' : `${creditPercent}%` }}
                    />
                </div>

                <div className="flex justify-between items-center text-xs mt-2 text-gray-500">
                    <span>{kpis.creditLimit === -1 ? 'Enterprise Plan: Unlimited Generations' : `${kpis.creditsRemaining} credits remaining this cycle`}</span>
                    <Link href="/settings/billing" className="text-blue-600 hover:underline font-medium">
                        Manage Subscription &rarr;
                    </Link>
                </div>
            </div>

            {/* Visual Analytics Breakdowns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Content Type Distribution */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                        <h2 className="text-sm font-bold text-gray-900">AI Content Asset Distribution</h2>
                        <p className="text-xs text-gray-500">Breakdown of generated copy assets across your agency.</p>
                    </div>

                    <div className="space-y-3">
                        {analytics.contentTypeBreakdown.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-4">No content generated yet.</p>
                        ) : (
                            analytics.contentTypeBreakdown.map((item) => {
                                const total = Math.max(1, kpis.totalGenerations);
                                const pct = Math.round((item.count / total) * 100);

                                return (
                                    <div key={item.type} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium text-gray-700">
                                            <span className="capitalize">{item.type.replace(/_/g, ' ')}</span>
                                            <span>{item.count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Card 2: Copywriting Tone Preferences */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                        <h2 className="text-sm font-bold text-gray-900">Copywriting Tone Preferences</h2>
                        <p className="text-xs text-gray-500">Styles most frequently selected by your agents.</p>
                    </div>

                    <div className="space-y-3">
                        {analytics.toneBreakdown.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-4">No tone records yet.</p>
                        ) : (
                            analytics.toneBreakdown.map((item) => {
                                const total = Math.max(1, kpis.totalGenerations);
                                const pct = Math.round((item.count / total) * 100);

                                const toneIcons: Record<string, string> = {
                                    luxury: '💎 Luxury & Prestige',
                                    friendly: '🏡 Warm & Friendly',
                                    formal: '💼 Formal & Investor',
                                    neutral: '⚖️ Balanced & Clear',
                                };

                                return (
                                    <div key={item.tone} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium text-gray-700">
                                            <span>{toneIcons[item.tone] || item.tone}</span>
                                            <span>{item.count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Agency Activity Log */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3">
                    <h2 className="text-sm font-bold text-gray-900">Recent Marketing Activity & Events</h2>
                    <p className="text-xs text-gray-500">Live feed of generations, PDF downloads, and pack updates.</p>
                </div>

                {analytics.recentEvents.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4 text-center">
                        No events tracked yet. Generate marketing packs or download flyers to view activity.
                    </p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {analytics.recentEvents.map((evt) => (
                            <div key={evt.id} className="py-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="text-base">
                                        {evt.event === 'pdf_downloaded' ? '📥' : '⚡'}
                                    </span>
                                    <div>
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {evt.event.replace(/_/g, ' ')}
                                        </span>
                                        {evt.packTitle && (
                                            <span className="text-gray-500 ml-1">&bull; {evt.packTitle}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-gray-400 text-[11px]">
                                    {new Date(evt.createdAt).toLocaleDateString()} at{' '}
                                    {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
