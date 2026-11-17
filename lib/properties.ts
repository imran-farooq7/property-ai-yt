import { db } from '@/lib/schema/index';
import { properties, propertyImages } from '@/lib/schema/db/properties';
import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';

export interface PropertyFilterParams {
    query?: string;
    status?: string;
    propertyType?: string;
}

export async function getProperties(orgId: string, filters: PropertyFilterParams = {}) {
    const conditions = [eq(properties.orgId, orgId)];

    if (filters.status && filters.status !== 'all') {
        conditions.push(eq(properties.status, filters.status));
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
        conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    if (filters.query?.trim()) {
        const s = `%${filters.query.trim()}%`;
        conditions.push(or(ilike(properties.title, s), ilike(properties.city, s), ilike(properties.address, s))!);
    }

    return await db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.createdAt));
}

export async function getPropertyById(orgId: string, propertyId: string) {
    const [property] = await db
        .select()
        .from(properties)
        .where(and(eq(properties.id, propertyId), eq(properties.orgId, orgId)))
        .limit(1);

    if (!property) return null;

    const images = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, propertyId))
        .orderBy(propertyImages.order);

    let parsedAmenities: string[] = [];
    if (property.amenities) {
        try { parsedAmenities = JSON.parse(property.amenities); } catch { parsedAmenities = []; }
    }

    return { ...property, amenitiesList: parsedAmenities, images };
}

export async function getPropertyStats(orgId: string) {
    const all = await db
        .select({ status: properties.status, count: sql<number>`count(*)` })
        .from(properties)
        .where(eq(properties.orgId, orgId))
        .groupBy(properties.status);

    const stats = { total: 0, active: 0, draft: 0, sold: 0, archived: 0 };
    for (const row of all) {
        const c = Number(row.count);
        stats.total += c;
        if (row.status in stats) (stats as any)[row.status] = c;
    }
    return stats;
}
