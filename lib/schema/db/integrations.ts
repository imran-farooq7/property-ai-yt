import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { users } from './users';

export const apiKeys = pgTable('api_keys', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    keyPrefix: text('key_prefix').notNull(),
    keyHash: text('key_hash').notNull(),
    lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const webhooks = pgTable('webhooks', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    url: text('url').notNull(),
    events: text('events').notNull().default('["pack.published"]'),
    secret: text('secret').notNull(),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const connectedServices = pgTable('connected_services', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    service: text('service').notNull(), // 'resend' | 'hubspot' | 'zapier' | 'salesforce'
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    config: text('config'),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
