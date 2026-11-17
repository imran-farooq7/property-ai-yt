import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { organisations } from './organisations';

export const generatedContent = pgTable('generated_content', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    contentType: text('content_type').notNull(), // 'description' | 'bullets' | 'headline' | 'social'
    tone: text('tone').notNull().default('neutral'),
    content: text('content').notNull(),
    tokensUsed: integer('tokens_used').default(0),
    model: text('model'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
