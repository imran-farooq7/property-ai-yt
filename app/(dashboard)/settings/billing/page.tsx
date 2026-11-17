import { requireTenant } from '@/lib/tenant';
import { getSubscription, syncSubscriptionFromStripe, getCurrentPeriodUsage, getUsageSummary } from '@/lib/billing';
import { canManageBilling } from '@/lib/permissions';
import { getPlanLimits } from '@/lib/feature-gates';
import { createCheckoutSession, createPortalSession, refreshSubscriptionAction } from '@/lib/billing-actions';
import { PLANS } from '@/lib/constant';
import type { SubscriptionPlan, UserRole } from '@/types';

export default async function BillingPage({
    searchParams,
}: {
    searchParams?: Promise<{ success?: string; canceled?: string }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const tenant = await requireTenant();

    let sub = await getSubscription(tenant.org.id);

    // Auto-sync from Stripe if returning from successful checkout or subscription is incomplete
    if (params?.success === 'true' || (sub?.stripeCustomerId && sub?.status !== 'active')) {
        const synced = await syncSubscriptionFromStripe(tenant.org.id);
        if (synced) {
            sub = synced;
        }
    }

    const currentPlan = (sub?.plan ?? 'basic') as SubscriptionPlan;
    const limits = getPlanLimits(currentPlan);
    const creditsUsed = await getCurrentPeriodUsage(tenant.org.id);
    const isOwner = canManageBilling(tenant.role as UserRole);

    // Usage summary for the current period
    const periodStart = sub?.currentPeriodStart ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const usageSummary = await getUsageSummary(tenant.org.id, periodStart);

    const creditLimit = limits.aiCredits;
    const creditPercent = creditLimit === -1 ? 0 : Math.min(100, Math.round((creditsUsed / creditLimit) * 100));

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Notifications */}
            {params?.success === 'true' && (
                <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold text-base">✓</span>
                        <span>Your checkout was successful! Your subscription is active and synced.</span>
                    </div>
                </div>
            )}
            {params?.canceled === 'true' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold text-base">ℹ</span>
                        <span>Checkout was canceled. Your current subscription plan remains unchanged.</span>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your subscription plan, AI credit usage, and payment methods for{' '}
                    <span className="font-semibold text-gray-700">{tenant.org.name}</span>.
                </p>
            </div>

            {/* Current Plan Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-gray-900 capitalize">{currentPlan} Plan</h2>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${sub?.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : sub?.status === 'past_due'
                                        ? 'bg-amber-100 text-amber-800'
                                        : sub?.status === 'canceled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {sub?.status === 'active' ? 'Active' : sub?.status === 'past_due' ? 'Past Due' : sub?.status ?? 'Active'}
                            </span>
                            {sub?.cancelAtPeriodEnd === 'true' && (
                                <span className="text-xs text-amber-600 font-medium">Cancels at period end</span>
                            )}
                        </div>
                        {sub?.currentPeriodEnd && (
                            <p className="mt-1 text-xs text-gray-500">
                                Current period ends: {new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        )}
                    </div>

                    {isOwner && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <form action={refreshSubscriptionAction}>
                                <input type="hidden" name="orgId" value={tenant.org.id} />
                                <button
                                    type="submit"
                                    title="Recheck subscription status with Stripe"
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Sync with Stripe
                                </button>
                            </form>
                            {sub?.stripeCustomerId && (
                                <form action={createPortalSession}>
                                    <input type="hidden" name="orgId" value={tenant.org.id} />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Manage Payment Methods &rarr;
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* AI Credit Usage Bar */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">AI Credits Used This Period</span>
                        <span className="text-sm font-bold text-gray-900">
                            {creditsUsed} / {creditLimit === -1 ? '∞' : creditLimit}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${creditPercent >= 90 ? 'bg-red-500' : creditPercent >= 70 ? 'bg-amber-500' : 'bg-blue-600'
                                }`}
                            style={{ width: creditLimit === -1 ? '5%' : `${creditPercent}%` }}
                        />
                    </div>
                    {creditLimit !== -1 && creditPercent >= 80 && (
                        <p className="mt-2 text-xs text-amber-600 font-medium">
                            ⚠ You&apos;re approaching your credit limit. Consider upgrading for more AI generations.
                        </p>
                    )}
                </div>

                {/* Usage Breakdown */}
                {usageSummary.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage Breakdown</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {usageSummary.map((item) => (
                                <div key={item.type} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <div className="text-xs text-gray-500 capitalize">{item.type.replace(/_/g, ' ')}</div>
                                    <div className="text-lg font-bold text-gray-900 mt-0.5">{Number(item.total)}</div>
                                    <div className="text-[11px] text-gray-400">{Number(item.count)} events</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Plan Comparison Cards */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {isOwner ? 'Choose Your Plan' : 'Plan Comparison'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {PLANS.map((plan) => {
                        const planLimits = getPlanLimits(plan.id as SubscriptionPlan);
                        const isCurrent = plan.id === currentPlan;

                        return (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-xl border-2 p-6 flex flex-col justify-between transition-all ${isCurrent
                                    ? 'border-blue-500 shadow-md ring-1 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div>
                                    {isCurrent && (
                                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                                            Current Plan
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                    <div className="mt-2">
                                        <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                                        <span className="text-sm text-gray-500">/month</span>
                                    </div>

                                    <ul className="mt-5 space-y-2.5 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 font-bold">✓</span>
                                            <span className="text-gray-600">
                                                {planLimits.aiCredits === -1
                                                    ? 'Unlimited AI generations'
                                                    : `${planLimits.aiCredits} AI generation credits/mo`}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 font-bold">✓</span>
                                            <span className="text-gray-600">
                                                {planLimits.maxProperties === -1
                                                    ? 'Unlimited property listings'
                                                    : `Up to ${planLimits.maxProperties} property listings`}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            {planLimits.batchGeneration ? (
                                                <>
                                                    <span className="text-green-500 mt-0.5 font-bold">✓</span>
                                                    <span className="text-gray-600">Batch AI generation</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-gray-300 mt-0.5 font-bold">✗</span>
                                                    <span className="text-gray-400">Batch AI generation</span>
                                                </>
                                            )}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            {planLimits.customTemplates ? (
                                                <>
                                                    <span className="text-green-500 mt-0.5 font-bold">✓</span>
                                                    <span className="text-gray-600">Custom PDF templates</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-gray-300 mt-0.5 font-bold">✗</span>
                                                    <span className="text-gray-400">Custom PDF templates</span>
                                                </>
                                            )}
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-6">
                                    {isCurrent ? (
                                        <div className="w-full text-center py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
                                            Your Current Plan
                                        </div>
                                    ) : isOwner ? (
                                        <form action={createCheckoutSession}>
                                            <input type="hidden" name="orgId" value={tenant.org.id} />
                                            <input type="hidden" name="plan" value={plan.id} />
                                            <button
                                                type="submit"
                                                className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                                            >
                                                {currentPlan === 'basic' ? 'Upgrade' : 'Switch'} to {plan.name}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="w-full text-center py-2.5 text-sm font-medium text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                                            Contact owner to upgrade
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Feature Gate Status */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Feature Availability</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className={`text-lg ${limits.batchGeneration ? '🟢' : '🔴'}`}>
                            {limits.batchGeneration ? '✓' : '✗'}
                        </span>
                        <div>
                            <div className="text-sm font-medium text-gray-900">Batch AI Generation</div>
                            <div className="text-xs text-gray-500">
                                {limits.batchGeneration ? 'Available on your plan' : 'Upgrade to Pro to unlock'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className={`text-lg ${limits.customTemplates ? '🟢' : '🔴'}`}>
                            {limits.customTemplates ? '✓' : '✗'}
                        </span>
                        <div>
                            <div className="text-sm font-medium text-gray-900">Custom PDF Templates</div>
                            <div className="text-xs text-gray-500">
                                {limits.customTemplates ? 'Available on your plan' : 'Upgrade to Pro to unlock'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
