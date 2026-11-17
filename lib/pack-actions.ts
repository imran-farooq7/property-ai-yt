'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/schema';
import { packs, packVersions } from '@/lib/schema/db/pack';
import { memberships } from '@/lib/schema/db/organisations';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canEditProperty, canApprovePack } from '@/lib/permissions';
import { createMarketingPack } from '@/lib/packs';
import type { UserRole, PackStatus } from '@/types';

/**
 * Server action: Create a new marketing pack.
 */
export async function createPackAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const propertyId = formData.get('propertyId') as string;
    const templateId = (formData.get('templateId') as string) || 'modern-minimal';
    const title = (formData.get('title') as string) || 'Marketing Flyer';
    const customDescription = (formData.get('customDescription') as string) || undefined;

    if (!orgId || !propertyId) {
        throw new Error('Missing organization or property ID');
    }

    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canEditProperty(membership.role as UserRole)) {
        throw new Error('You do not have permission to create marketing packs.');
    }

    const newPack = await createMarketingPack({
        orgId,
        propertyId,
        templateId,
        title,
        createdById: session.user.id,
        customDescription,
    });

    revalidatePath('/packs');
    redirect(`/packs/${newPack.id}`);
}

/**
 * Server action: Update pack review/approval status.
 */
export async function updatePackStatusAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const packId = formData.get('packId') as string;
    const status = formData.get('status') as PackStatus;

    if (!orgId || !packId || !status) {
        throw new Error('Missing required fields');
    }

    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership) {
        throw new Error('Unauthorized');
    }

    // If approving or publishing, require admin or owner
    if ((status === 'approved' || status === 'published') && !canApprovePack(membership.role as UserRole)) {
        throw new Error('Only an Admin or Owner can approve and publish marketing packs.');
    }

    await db
        .update(packs)
        .set({
            status,
            updatedAt: new Date(),
        })
        .where(and(eq(packs.id, packId), eq(packs.orgId, orgId)));

    revalidatePath('/packs');
    revalidatePath(`/packs/${packId}`);
}

/**
 * Server action: Save an edited HTML version of the pack.
 */
export async function saveNewPackVersionAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const packId = formData.get('packId') as string;
    const htmlContent = formData.get('htmlContent') as string;

    if (!orgId || !packId || !htmlContent) {
        throw new Error('Missing parameters');
    }

    const [pack] = await db
        .select({ currentVersion: packs.currentVersion })
        .from(packs)
        .where(and(eq(packs.id, packId), eq(packs.orgId, orgId)))
        .limit(1);

    if (!pack) {
        throw new Error('Pack not found');
    }

    const nextVersion = (pack.currentVersion || 1) + 1;

    // Insert new version
    await db.insert(packVersions).values({
        packId,
        version: nextVersion,
        htmlContent,
    });

    // Increment currentVersion on pack
    await db
        .update(packs)
        .set({
            currentVersion: nextVersion,
            updatedAt: new Date(),
        })
        .where(eq(packs.id, packId));

    revalidatePath(`/packs/${packId}`);
}

/**
 * Server action: Delete a marketing pack.
 */
export async function deletePackAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const packId = formData.get('packId') as string;

    if (!orgId || !packId) {
        throw new Error('Missing parameters');
    }

    await db
        .delete(packs)
        .where(and(eq(packs.id, packId), eq(packs.orgId, orgId)));

    revalidatePath('/packs');
    redirect('/packs');
}
