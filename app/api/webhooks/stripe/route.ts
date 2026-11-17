import { NextResponse } from 'next/server';
import { getStripe, getPlanFromPriceId } from '@/lib/stripe';
import { db } from '@/lib/schema';
import { subscriptions } from '@/lib/schema/db/subscriptions';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

/**
 * Stripe Webhook Handler.
 * Processes subscription lifecycle events to keep our DB in sync with Stripe.
 */
export async function POST(request: Request) {
    // 1. Read raw text body and Stripe signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    // 2. Cryptographic signature verification
    try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        const stripe = getStripe();

        switch (event.type) {
            // 👇 checkout.session.completed
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orgId = session.metadata?.orgId;
                const plan = session.metadata?.plan;

                if (orgId && session.subscription) {
                    const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
                    const priceId = stripeSub?.items.data[0]?.price.id;
                    const resolvedPlan = plan || (priceId ? getPlanFromPriceId(priceId) : 'basic');

                    await db
                        .update(subscriptions)
                        .set({
                            stripeCustomerId: session.customer as string,
                            stripeSubscriptionId: stripeSub?.id,
                            stripePriceId: priceId || null,
                            plan: resolvedPlan,
                            status: stripeSub?.status ?? 'active',
                            currentPeriodEnd: stripeSub?.current_period_end
                                ? new Date(stripeSub.current_period_end * 1000)
                                : null,
                            currentPeriodStart: stripeSub?.current_period_start
                                ? new Date(stripeSub.current_period_start * 1000)
                                : null,
                            cancelAtPeriodEnd: stripeSub?.cancel_at_period_end ? 'true' : 'false',
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.orgId, orgId));
                }
                break;
            }

            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription;
                const orgId = sub.metadata?.orgId;
                const priceId = sub.items.data[0]?.price?.id;

                if (orgId) {
                    await db
                        .update(subscriptions)
                        .set({
                            plan: priceId ? getPlanFromPriceId(priceId) : undefined,
                            stripePriceId: priceId || undefined,
                            status: sub.status,
                            currentPeriodStart: new Date(sub.current_period_start * 1000),
                            currentPeriodEnd: new Date(sub.current_period_end * 1000),
                            cancelAtPeriodEnd: sub.cancel_at_period_end ? 'true' : 'false',
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.orgId, orgId));
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                const orgId = sub.metadata?.orgId;

                if (orgId) {
                    await db
                        .update(subscriptions)
                        .set({
                            plan: 'basic',
                            status: 'canceled',
                            stripeSubscriptionId: null,
                            stripePriceId: null,
                            cancelAtPeriodEnd: 'false',
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.orgId, orgId));
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subId = invoice.subscription as string;

                if (subId) {
                    await db
                        .update(subscriptions)
                        .set({
                            status: 'past_due',
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.stripeSubscriptionId, subId));
                }
                break;
            }

            default:
                break;
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Webhook handler error:', err.message);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
