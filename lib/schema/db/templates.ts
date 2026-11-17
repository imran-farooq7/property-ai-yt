import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';

export const brandKits = pgTable('brand_kits', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull().default('Default Brand Kit'),
    logo: text('logo'),
    primaryColor: text('primary_color').default('#2563EB'),
    secondaryColor: text('secondary_color').default('#1E40AF'),
    accentColor: text('accent_color').default('#F59E0B'),
    fontFamily: text('font_family').default('Inter'),
    tagline: text('tagline'),
    disclaimer: text('disclaimer'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const templates = pgTable('templates', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    type: text('type').notNull().default('flyer'), // 'flyer' | 'brochure' | 'featuresheet'
    html: text('html'),
    thumbnail: text('thumbnail'),
    isDefault: text('is_default').default('false'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
