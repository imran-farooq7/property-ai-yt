'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/schema';
import { packs } from '@/lib/schema/db/pack';
import { memberships } from '@/lib/schema/db/organisations';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { canApprovePack } from '@/lib/permissions';
import { addPackComment, logPackActivity } from '@/lib/collaboration';
import type { UserRole } from '@/types';

/**
 * Server action: Add a team comment or feedback note to a marketing pack.
 */
export async function addCommentAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const packId = formData.get('packId') as string;
    const content = formData.get('content') as string;

    if (!orgId || !packId || !content?.trim()) {
        throw new Error('Missing comment content');
    }

    // Validate user is in the organisation
    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership) {
        throw new Error('Unauthorized');
    }

    await addPackComment({
        packId,
        userId: session.user.id,
        content: content.trim(),
    });

    revalidatePath(`/packs/${packId}`);
    revalidatePath(`/packs/${packId}/review`);
}

/**
 * Server action: Submit an approval or revision review decision.
 */
export async function submitReviewDecisionAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const packId = formData.get('packId') as string;
    const decision = formData.get('decision') as 'approve' | 'request_changes' | 'publish';
    const feedback = (formData.get('feedback') as string) || '';

    if (!orgId || !packId || !decision) {
        throw new Error('Missing review decision parameters');
    }

    // Admin/Owner permission check
    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canApprovePack(membership.role as UserRole)) {
        throw new Error('Only an Admin or Owner can submit review decisions.');
    }

    let nextStatus = 'draft';
    let actionLabel = 'updated_status';

    if (decision === 'approve') {
        nextStatus = 'approved';
        actionLabel = 'approved_pack';
    } else if (decision === 'publish') {
        nextStatus = 'published';
        actionLabel = 'published_pack';
    } else if (decision === 'request_changes') {
        nextStatus = 'draft';
        actionLabel = 'requested_changes';
    }

    // Update pack status
    await db
        .update(packs)
        .set({
            status: nextStatus,
            updatedAt: new Date(),
        })
        .where(and(eq(packs.id, packId), eq(packs.orgId, orgId)));

    // If revision feedback was supplied, post it as a comment
    if (feedback.trim()) {
        await addPackComment({
            packId,
            userId: session.user.id,
            content: `[Review Feedback] ${feedback.trim()}`,
        });
    }

    // Record activity log
    await logPackActivity({
        packId,
        userId: session.user.id,
        action: actionLabel,
        details: feedback.trim() ? `Feedback: ${feedback.trim()}` : `Status changed to ${nextStatus}`,
    });

    revalidatePath('/packs');
    revalidatePath(`/packs/${packId}`);
    revalidatePath(`/packs/${packId}/review`);
}
