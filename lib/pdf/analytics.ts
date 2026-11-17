import { db } from '@/lib/schema';
import { analyticsEvents } from '@/lib/schema/db/analytics';

/**
 * Record a lightweight analytics event for marketing pack views, downloads, or generations.
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
