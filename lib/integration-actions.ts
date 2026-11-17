'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/schema';
import { memberships } from '@/lib/schema/db/organisations';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { canManageTeam, canManageBilling } from '@/lib/permissions';
import { generateApiKey, revokeApiKey, createWebhook, deleteWebhook } from '@/lib/integrations';
import { getPackById } from '@/lib/packs';
import type { UserRole } from '@/types';

/**
 * Server action: Create an API key for the agency.
 */
export async function createApiKeyAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const name = (formData.get('name') as string) || 'Default API Key';

    if (!orgId) {
        throw new Error('Organisation ID is required');
    }

    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canManageBilling(membership.role as UserRole)) {
        throw new Error('Only the agency owner can manage API keys.');
    }

    await generateApiKey(orgId, session.user.id, name.trim());
    revalidatePath('/integrations');
}

/**
 * Server action: Revoke an existing API key.
 */
export async function revokeApiKeyAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const keyId = formData.get('keyId') as string;

    if (!orgId || !keyId) {
        throw new Error('Missing parameters');
    }

    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canManageBilling(membership.role as UserRole)) {
        throw new Error('Only the agency owner can revoke API keys.');
    }

    await revokeApiKey(orgId, keyId);
    revalidatePath('/integrations');
}

/**
 * Server action: Add a new webhook subscription.
 */
export async function createWebhookAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const url = formData.get('url') as string;
    const events = formData.getAll('events') as string[];

    if (!orgId || !url?.trim()) {
        throw new Error('Valid webhook URL is required');
    }

    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canManageTeam(membership.role as UserRole)) {
        throw new Error('Admin permissions required to configure webhooks.');
    }

    const selectedEvents = events.length > 0 ? events : ['pack.published'];
    await createWebhook(orgId, url.trim(), selectedEvents);

    revalidatePath('/integrations');
}

/**
 * Server action: Delete a webhook subscription.
 */
export async function deleteWebhookAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const webhookId = formData.get('webhookId') as string;

    if (!orgId || !webhookId) {
        throw new Error('Missing parameters');
    }

    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canManageTeam(membership.role as UserRole)) {
        throw new Error('Unauthorized');
    }

    await deleteWebhook(orgId, webhookId);
    revalidatePath('/integrations');
}

/**
 * Server action: Direct email dispatch of a marketing pack PDF to a client/buyer.
 */
export async function sendClientEmailAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const packId = formData.get('packId') as string;
    const recipientEmail = formData.get('recipientEmail') as string;
    const subject = (formData.get('subject') as string) || 'Exclusive Property Presentation';
    const message = (formData.get('message') as string) || '';

    if (!orgId || !packId || !recipientEmail?.trim()) {
        throw new Error('Recipient email and marketing pack are required');
    }

    const pack = await getPackById(orgId, packId);
    if (!pack || !pack.property) {
        throw new Error('Marketing pack not found');
    }

    const pdfUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/packs/${pack.id}/pdf`;


    revalidatePath('/integrations');
}
