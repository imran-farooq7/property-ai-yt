import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const organisations = pgTable('organisations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    website: text('website'),
    phone: text('phone'),
    address: text('address'),
    timezone: text('timezone').default('UTC').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const memberships = pgTable('memberships', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    role: text('role').notNull().default('agent'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const invitations = pgTable('invitations', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    email: text('email').notNull(),
    role: text('role').notNull().default('agent'), // 'admin' | 'agent' | 'viewer'
    token: text('token').notNull().unique(),
    invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
    status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'revoked'
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});