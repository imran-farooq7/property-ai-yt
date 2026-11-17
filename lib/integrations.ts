import { db } from '@/lib/schema';
import { apiKeys, webhooks, connectedServices } from '@/lib/schema/db/integrations';
import { users } from '@/lib/schema/db/users';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * List all active API keys for an organisation.
 */
export async function listApiKeys(orgId: string) {
    const list = await db
        .select({
            id: apiKeys.id,
            name: apiKeys.name,
            keyPrefix: apiKeys.keyPrefix,
            createdAt: apiKeys.createdAt,
            lastUsedAt: apiKeys.lastUsedAt,
            createdByName: users.name,
        })
        .from(apiKeys)
        .leftJoin(users, eq(apiKeys.userId, users.id))
        .where(eq(apiKeys.orgId, orgId))
        .orderBy(desc(apiKeys.createdAt));

    return list;
}

/**
 * Generate a new secure API key with prefix `pk_live_`.
 * Returns the plain secret once for copy/paste, while storing the SHA-256 hash in the database.
 */
export async function generateApiKey(orgId: string, userId: string, name: string) {
    const rawBytes = crypto.randomBytes(24).toString('hex');
    const plainKey = `pk_live_${rawBytes}`;
    const keyPrefix = `pk_live_${rawBytes.slice(0, 4)}...${rawBytes.slice(-4)}`;
    const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');

    const [created] = await db
        .insert(apiKeys)
        .values({
            orgId,
            userId,
            name,
            keyPrefix,
            keyHash,
        })
        .returning();

    return {
        id: created.id,
        plainKey,
        keyPrefix,
        name: created.name,
        createdAt: created.createdAt,
    };
}

/**
 * Revoke/delete an API key.
 */
export async function revokeApiKey(orgId: string, keyId: string) {
    await db
        .delete(apiKeys)
        .where(and(eq(apiKeys.id, keyId), eq(apiKeys.orgId, orgId)));
}

/**
 * List active webhook subscriptions for an organisation.
 */
export async function listWebhooks(orgId: string) {
    return await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.orgId, orgId))
        .orderBy(desc(webhooks.createdAt));
}

/**
 * Create a new webhook subscription with a secret for HMAC signing.
 */
export async function createWebhook(orgId: string, url: string, events: string[]) {
    const secret = `whsec_${crypto.randomBytes(20).toString('hex')}`;

    const [created] = await db
        .insert(webhooks)
        .values({
            orgId,
            url,
            events: JSON.stringify(events),
            secret,
            status: 'active',
        })
        .returning();

    return created;
}

/**
 * Delete a webhook subscription.
 */
export async function deleteWebhook(orgId: string, webhookId: string) {
    await db
        .delete(webhooks)
        .where(and(eq(webhooks.id, webhookId), eq(webhooks.orgId, orgId)));
}
