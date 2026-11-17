import { db } from '@/lib/schema';
import { subscriptions, usageRecords } from '@/lib/schema/db/subscriptions';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getAiCreditLimit } from '@/lib/feature-gates';
import { getStripe, getPlanFromPriceId } from '@/lib/stripe';
import type { SubscriptionPlan } from '@/types';

/**
 * Get the current subscription for an organisation.
 */
export async function getSubscription(orgId: string) {
    const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.orgId, orgId))
        .limit(1);

    return sub ?? null;
}

/**
 * Synchronize subscription details from Stripe to our database for an organisation.
 * Retrieves any active, trialing, or existing subscription for the customer from Stripe
 * and updates the subscriptions table.
 */
export async function syncSubscriptionFromStripe(orgId: string) {
    try {
        const stripe = getStripe();
        if (!stripe) return null;

        // 1. Get current subscription record from DB
        const [sub] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.orgId, orgId))
            .limit(1);

        let customerId = sub?.stripeCustomerId;

        // 2. If no customerId in DB, search Stripe by orgId metadata
        if (!customerId) {
            const customerSearch = await stripe.customers.search({
                query: `metadata['orgId']:'${orgId}'`,
                limit: 1,
            });
            if (customerSearch.data.length > 0) {
                customerId = customerSearch.data[0].id;
            }
        }

        if (!customerId) {
            return sub ?? null;
        }

        // 3. Retrieve subscriptions for this customer from Stripe
        const stripeSubs = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            limit: 10,
        });

        if (stripeSubs.data.length === 0) {
            return sub ?? null;
        }

        // Prioritize active > trialing > past_due > others, then newest
        const statusPriority: Record<string, number> = {
            active: 1,
            trialing: 2,
            past_due: 3,
            incomplete: 4,
            canceled: 5,
        };

        const sortedSubs = [...stripeSubs.data].sort((a, b) => {
            const prioA = statusPriority[a.status] ?? 99;
            const prioB = statusPriority[b.status] ?? 99;
            if (prioA !== prioB) return prioA - prioB;
            return b.created - a.created;
        });

        const targetSub = sortedSubs[0];
        const priceId = targetSub.items.data[0]?.price?.id;
        const planName = priceId ? getPlanFromPriceId(priceId) : (sub?.plan ?? 'basic');

        const updateData = {
            stripeCustomerId: customerId,
            stripeSubscriptionId: targetSub.id,
            stripePriceId: priceId || null,
            plan: planName,
            status: targetSub.status,
            currentPeriodStart: targetSub.current_period_start
                ? new Date(targetSub.current_period_start * 1000)
                : null,
            currentPeriodEnd: targetSub.current_period_end
                ? new Date(targetSub.current_period_end * 1000)
                : null,
            cancelAtPeriodEnd: targetSub.cancel_at_period_end ? 'true' : 'false',
            updatedAt: new Date(),
        };

        if (sub) {
            await db
                .update(subscriptions)
                .set(updateData)
                .where(eq(subscriptions.id, sub.id));
        } else {
            await db.insert(subscriptions).values({
                orgId,
                ...updateData,
            });
        }

        const [updatedSub] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.orgId, orgId))
            .limit(1);

        return updatedSub ?? null;
    } catch (error) {
        console.error('Error syncing subscription from Stripe:', error);
        return null;
    }
}

/**
 * Get AI credit usage for the current billing period.
 */
export async function getCurrentPeriodUsage(orgId: string): Promise<number> {
    const sub = await getSubscription(orgId);

    // If no subscription or no period info, count from the start of the current month
    const periodStart = sub?.createdAt ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const result = await db
        .select({
            total: sql<number>`COALESCE(SUM(${usageRecords.amount}), 0)`,
        })
        .from(usageRecords)
        .where(
            and(
                eq(usageRecords.orgId, orgId),
                eq(usageRecords.type, 'ai_generation'),
                gte(usageRecords.createdAt, periodStart)
            )
        );

    return Number(result[0]?.total ?? 0);
}

/**
 * Check if an organisation has remaining AI credits.
 * Returns { allowed: boolean, used: number, limit: number, remaining: number }.
 */
export async function checkCreditAllowance(orgId: string) {
    const sub = await getSubscription(orgId);
    const plan = (sub?.plan ?? 'basic') as SubscriptionPlan;
    const limit = getAiCreditLimit(plan);
    const used = await getCurrentPeriodUsage(orgId);

    // -1 means unlimited
    if (limit === -1) {
        return { allowed: true, used, limit: -1, remaining: -1 };
    }

    const remaining = Math.max(0, limit - used);
    return {
        allowed: remaining > 0,
        used,
        limit,
        remaining,
    };
}

/**
 * Record a usage event (e.g., AI generation, PDF render).
 */
export async function recordUsage(
    orgId: string,
    type: string,
    amount: number = 1,
    metadata?: Record<string, unknown>
) {
    await db.insert(usageRecords).values({
        orgId,
        type,
        amount,
        metadata: metadata ? JSON.stringify(metadata) : null,
    });
}

/**
 * Get a usage summary breakdown for a given period.
 */
export async function getUsageSummary(orgId: string, since: Date) {
    const result = await db
        .select({
            type: usageRecords.type,
            total: sql<number>`COALESCE(SUM(${usageRecords.amount}), 0)`,
            count: sql<number>`COUNT(*)`,
        })
        .from(usageRecords)
        .where(
            and(
                eq(usageRecords.orgId, orgId),
                gte(usageRecords.createdAt, since)
            )
        )
        .groupBy(usageRecords.type);

    return result;
}
