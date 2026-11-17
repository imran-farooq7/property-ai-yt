import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { packs } from './pack';

export const analyticsEvents = pgTable('analytics_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    packId: uuid('pack_id').references(() => packs.id),
    event: text('event').notNull(),
    metadata: text('metadata'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
