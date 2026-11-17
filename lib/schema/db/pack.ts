import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { properties } from './properties';
import { organisations } from './organisations';
import { users } from './users';

export const packs = pgTable('packs', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    templateId: text('template_id').notNull().default('modern-minimal'), // 'modern-minimal' | 'luxury-estate' | 'family-home' | 'urban-showcase'
    title: text('title').notNull(),
    status: text('status').notNull().default('draft'), // 'draft' | 'in_review' | 'approved' | 'published'
    currentVersion: integer('current_version').notNull().default(1),
    thumbnail: text('thumbnail'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const packVersions = pgTable('pack_versions', {
    id: uuid('id').defaultRandom().primaryKey(),
    packId: uuid('pack_id').references(() => packs.id, { onDelete: 'cascade' }).notNull(),
    version: integer('version').notNull(),
    pdfUrl: text('pdf_url'),
    htmlContent: text('html_content'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
