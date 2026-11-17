import { requireTenant } from '@/lib/tenant';
import { getPackById } from '@/lib/packs';
import { getPackComments, getPackActivity } from '@/lib/collaboration';
import { canApprovePack } from '@/lib/permissions';
import { addCommentAction, submitReviewDecisionAction } from '@/lib/collaboration-actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UserRole } from '@/types';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ReviewPackPage({ params }: PageProps) {
    const tenant = await requireTenant();
    const { id } = await params;

    const [pack, comments, activity] = await Promise.all([
        getPackById(tenant.org.id, id),
        getPackComments(id),
        getPackActivity(id),
    ]);

    if (!pack) {
        notFound();
    }

    const canApprove = canApprovePack(tenant.role as UserRole);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                        <Link href="/packs" className="hover:text-blue-600 transition-colors">
                            Marketing Packs
                        </Link>
                        <span>/</span>
                        <Link href={`/packs/${pack.id}`} className="hover:text-blue-600 transition-colors truncate max-w-xs">
                            {pack.title}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium">Review & Approval</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Review & Quality Assurance</h1>
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
                            🏡 {pack.property.title} &bull; ${pack.property.price.toLocaleString()} ({pack.property.city},{' '}
                            {pack.property.state})
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={`/api/packs/${pack.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                        <span>📥</span>
                        <span>Download PDF</span>
                    </a>
                    <Link
                        href={`/packs/${pack.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                        View Pack &rarr;
                    </Link>
                </div>
            </div>

            {/* Main Review Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Document Preview (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-3">
                    <div className="flex items-center justify-between px-1 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">Document Under Review</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                            Template: {pack.templateId} &bull; Version {pack.currentVersion}
                        </span>
                    </div>

                    <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-inner flex justify-center items-start overflow-hidden min-h-[720px]">
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
                                title="Review Document"
                                srcDoc={pack.latestHtml}
                                className="w-full h-full border-0 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Review Decisions, Comments, and Audit Log (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Review Decision Panel (Admin / Owner) */}
                    {canApprove && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                Review Decision
                            </h2>

                            <form action={submitReviewDecisionAction} className="space-y-3">
                                <input type="hidden" name="orgId" value={tenant.org.id} />
                                <input type="hidden" name="packId" value={pack.id} />

                                <div>
                                    <label htmlFor="feedback" className="block text-xs font-medium text-gray-600 mb-1">
                                        Feedback or Revision Notes (Optional)
                                    </label>
                                    <textarea
                                        id="feedback"
                                        name="feedback"
                                        rows={2}
                                        placeholder="e.g. Please update the secondary photo to feature the pool area..."
                                        className="w-full text-xs rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        type="submit"
                                        name="decision"
                                        value="approve"
                                        className="py-2.5 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span>✓</span>
                                        <span>Approve Pack</span>
                                    </button>

                                    <button
                                        type="submit"
                                        name="decision"
                                        value="request_changes"
                                        className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span>✍️</span>
                                        <span>Request Changes</span>
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    name="decision"
                                    value="publish"
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                >
                                    Publish & Unlock for Clients &rarr;
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Comments / Feedback Thread */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                            Team Feedback & Discussion ({comments.length})
                        </h2>

                        {/* Existing Comments */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {comments.length === 0 ? (
                                <p className="text-xs text-gray-400 italic py-2">
                                    No feedback recorded yet. Add a note or question below.
                                </p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-1">
                                        <div className="flex items-center justify-between text-gray-500 text-[11px]">
                                            <span className="font-bold text-gray-900">{comment.userName || comment.userEmail}</span>
                                            <span>
                                                {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                                                {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Comment Input */}
                        <form action={addCommentAction} className="pt-2 border-t border-gray-100 flex gap-2">
                            <input type="hidden" name="orgId" value={tenant.org.id} />
                            <input type="hidden" name="packId" value={pack.id} />
                            <input
                                type="text"
                                name="content"
                                required
                                placeholder="Write a comment or note..."
                                className="flex-1 text-xs rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                            >
                                Send
                            </button>
                        </form>
                    </div>

                    {/* Activity Audit Trail */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 text-xs">
                        <h2 className="font-bold uppercase tracking-wider text-gray-700">
                            Activity History ({activity.length})
                        </h2>

                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-gray-600">
                            {activity.map((act) => (
                                <div key={act.id} className="flex items-start gap-2 border-b border-gray-50 pb-2">
                                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-gray-800 capitalize">
                                                {act.action.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(act.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {act.details && <p className="text-[11px] text-gray-500 mt-0.5">{act.details}</p>}
                                        <span className="text-[10px] text-gray-400">{act.userName || 'System'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
