import { db } from '@/lib/schema';
import { analyticsEvents } from '@/lib/schema/db/analytics';
import { properties } from '@/lib/schema/db/properties';
import { packs } from '@/lib/schema/db/pack';
import { generatedContent } from '@/lib/schema/db/content';
import { usageRecords } from '@/lib/schema/db/subscriptions';
import { getPropertyStats } from '@/lib/properties';
import { getPackStats } from '@/lib/packs';
import { checkCreditAllowance } from '@/lib/billing';
import { eq, desc, sql, and } from 'drizzle-orm';

/**
 * 1. Lightweight event logging helper
 */
export async function trackAnalyticsEvent(
    orgId: string,
    event: string,
    options: {
        packId?: string | null;
        metadata?: Record<string, unknown>;
    } = {}
) {
    try {
        await db.insert(analyticsEvents).values({
            orgId,
            packId: options.packId || null,
            event,
            metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        });
    } catch (err: any) {
        console.error('Failed to log analytics event:', err.message);
    }
}

/**
 * 2. Fetch comprehensive performance analytics & reporting KPIs
 */
export async function getAgencyAnalytics(orgId: string) {
    // Parallel fetch: Properties, Packs, and Credit Allowance
    const [propertyStats, packStats, creditAllowance] = await Promise.all([
        getPropertyStats(orgId),
        getPackStats(orgId),
        checkCreditAllowance(orgId),
    ]);

    // 👇 YAHAN SE LIVE CODE SHURU HOGA (Section 2)
    const contentStatsRes = await db.select({
        totalGenerations: sql<number>`count(*)`,
        totalTokens: sql<number>`COALESCE(SUM(${generatedContent.tokensUsed}),0)`
    }).from(generatedContent).where(eq(generatedContent.orgId, orgId))
    const totalGenerations = Number(contentStatsRes[0].totalGenerations || 0)
    const totalTokens = Number(contentStatsRes[0].totalTokens || 0)

    const contentTypeBreakdown = await db
        .select({
            type: generatedContent.contentType,
            count: sql<number>`count(*)`,
        })
        .from(generatedContent)
        .where(eq(generatedContent.orgId, orgId))
        .groupBy(generatedContent.contentType);

    const eventsCountResult = await db
        .select({
            event: analyticsEvents.event,
            count: sql<number>`count(*)`,
        })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.orgId, orgId))
        .groupBy(analyticsEvents.event);

    const pdfDownloads = Number(
        eventsCountResult.find((r) => r.event === 'pdf_downloaded')?.count || 0
    );
    // Content generation breakdown by tone (luxury, friendly, formal, neutral)
    const toneBreakdown = await db
        .select({
            tone: generatedContent.tone,
            count: sql<number>`count(*)`,
        })
        .from(generatedContent)
        .where(eq(generatedContent.orgId, orgId))
        .groupBy(generatedContent.tone);

    // Recent 10 analytics events with pack context
    const recentEvents = await db
        .select({
            id: analyticsEvents.id,
            event: analyticsEvents.event,
            metadata: analyticsEvents.metadata,
            createdAt: analyticsEvents.createdAt,
            packTitle: packs.title,
        })
        .from(analyticsEvents)
        .leftJoin(packs, eq(analyticsEvents.packId, packs.id))
        .where(eq(analyticsEvents.orgId, orgId))
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(10);

    return {
        kpis: {
            totalProperties: propertyStats.total,
            activeListings: propertyStats.active,
            soldListings: propertyStats.sold,
            totalPacks: packStats.total,
            approvedPacks: packStats.approved + packStats.published,
            totalGenerations,
            totalTokens,
            pdfDownloads,
            creditsUsed: creditAllowance.used,
            creditLimit: creditAllowance.limit,
            creditsRemaining: creditAllowance.remaining,
        },
        propertyStats,
        packStats,
        contentTypeBreakdown: contentTypeBreakdown.map((r) => ({
            type: r.type,
            count: Number(r.count),
        })),
        toneBreakdown: toneBreakdown.map((r) => ({
            tone: r.tone,
            count: Number(r.count),
        })),
        recentEvents,
    };
}
