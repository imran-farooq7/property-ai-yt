'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/schema';
import { subscriptions } from '@/lib/schema/db/subscriptions';
import { memberships } from '@/lib/schema/db/organisations';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getStripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { canManageBilling } from '@/lib/permissions';
import { syncSubscriptionFromStripe } from '@/lib/billing';
import type { UserRole } from '@/types';

export async function createCheckoutSession(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const plan = formData.get('plan') as string;

    if (!orgId || !plan || !STRIPE_PRICE_IDS[plan]) {
        throw new Error('Invalid plan selection');
    }

    // 1. Role permission: Only Owner can manage billing
    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canManageBilling(membership.role as UserRole)) {
        throw new Error('Only the organisation owner can manage billing.');
    }

    // 2. Get or create Stripe Customer
    const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.orgId, orgId))
        .limit(1);

    let stripeCustomerId = sub?.stripeCustomerId;

    if (!stripeCustomerId) {
        const customer = await getStripe().customers.create({
            email: session.user.email ?? undefined,
            name: session.user.name ?? undefined,
            metadata: { orgId, userId: session.user.id },
        });
        stripeCustomerId = customer.id;

        if (sub) {
            await db
                .update(subscriptions)
                .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
                .where(eq(subscriptions.id, sub.id));
        } else {
            await db.insert(subscriptions).values({
                orgId,
                stripeCustomerId: customer.id,
                plan: 'basic',
                status: 'incomplete',
            });
        }
    }

    const appUrl = process.env.NEXT_PUBLIC_URL || process.env.AUTH_URL || 'http://localhost:3000';

    // 👇 checkout create
    const createCheckoutSession = await getStripe().checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "subscription",
        line_items: [{
            price: STRIPE_PRICE_IDS[plan],
            quantity: 1
        }],
        success_url: `${appUrl}/settings/billing?success=true`,
        cancel_url: `${appUrl}/settings/billing?canceled=true`,
        metadata: { orgId, plan },
        subscription_data: {
            metadata: { orgId, plan }
        }

    })

    if (createCheckoutSession.url) {
        redirect(createCheckoutSession.url)
    }

}

/**
 * Stripe Customer Portal (Manage card / invoices)
 */
export async function createPortalSession(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const orgId = formData.get('orgId') as string;
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.orgId, orgId)).limit(1);

    if (!sub?.stripeCustomerId) {
        throw new Error('No active billing account found.');
    }

    const appUrl = process.env.NEXT_PUBLIC_URL || process.env.AUTH_URL || 'http://localhost:3000';
    const portalSession = await getStripe().billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${appUrl}/settings/billing`,
    });

    redirect(portalSession.url);
}

/**
 * Manually sync subscription status from Stripe
 */
export async function refreshSubscriptionAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const orgId = formData.get('orgId') as string;
    if (orgId) {
        await syncSubscriptionFromStripe(orgId);
        revalidatePath('/settings/billing');
    }
}
