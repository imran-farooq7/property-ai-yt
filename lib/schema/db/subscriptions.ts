import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';

/**
 * Subscriptions table — tracks Stripe subscription state per agency.
 */
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripePriceId: text('stripe_price_id'),
    plan: text('plan').notNull().default('basic'), // 'basic' | 'pro' | 'enterprise'

    status: text('status').notNull().default('active'), // 'active' | 'past_due' | 'canceled' | 'trialing'
    currentPeriodStart: timestamp('current_period_start', { mode: 'date' }),
    currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
    cancelAtPeriodEnd: text('cancel_at_period_end').default('false'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * Usage records — tracks AI credit consumption per agency.
 */
export const usageRecords = pgTable('usage_records', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    type: text('type').notNull(), // 'ai_generation' | 'pdf_render' | 'image_upload'
    amount: integer('amount').notNull().default(1),
    metadata: text('metadata'), // JSON string with details (model, tokens, propertyId, etc.)
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
