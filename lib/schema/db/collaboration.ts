import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { packs } from './pack';
import { users } from './users';

export const comments = pgTable('comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    packId: uuid('pack_id').references(() => packs.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const activityLog = pgTable('activity_log', {
    id: uuid('id').defaultRandom().primaryKey(),
    packId: uuid('pack_id').references(() => packs.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id),
    action: text('action').notNull(),
    details: text('details'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
