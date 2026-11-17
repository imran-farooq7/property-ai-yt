import { pgTable, uuid, text, integer, timestamp, real } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { users } from './users';

export const properties = pgTable('properties', {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }).notNull(),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    address: text('address').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zipCode: text('zip_code').notNull(),
    country: text('country').notNull().default('US'),
    price: real('price').notNull(),
    currency: text('currency').notNull().default('USD'),
    bedrooms: integer('bedrooms').notNull().default(0),
    bathrooms: real('bathrooms').notNull().default(1),
    sqft: real('sqft'),
    lotSize: real('lot_size'),
    yearBuilt: integer('year_built'),
    propertyType: text('property_type').notNull().default('house'), // 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'commercial'
    description: text('description'),
    amenities: text('amenities'), // JSON string array: ["Pool", "Garage"]
    heroImage: text('hero_image'),
    status: text('status').notNull().default('active'), // 'draft' | 'active' | 'archived' | 'sold'
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const propertyImages = pgTable('property_images', {
    id: uuid('id').defaultRandom().primaryKey(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    url: text('url').notNull(),
    alt: text('alt'),
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
