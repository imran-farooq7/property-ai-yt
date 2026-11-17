import { db } from '@/lib/schema/index';
import { packs, packVersions } from '@/lib/schema/db/pack';
import { properties } from '@/lib/schema/db/properties';
import { users } from '@/lib/schema/db/users';
import { getPropertyById } from '@/lib/properties';
import { renderTemplatePreview } from '@/lib/pdf/branding';
import { eq, and, desc, sql, ilike } from 'drizzle-orm';

export interface PackFilterParams {
    query?: string;
    status?: string;
}

/**
 * Fetch all marketing packs for an organisation with optional filters.
 */
export async function getPacks(orgId: string, filters: PackFilterParams = {}) {
    const conditions = [eq(packs.orgId, orgId)];

    if (filters.status && filters.status !== 'all') {
        conditions.push(eq(packs.status, filters.status));
    }

    if (filters.query && filters.query.trim()) {
        conditions.push(ilike(packs.title, `%${filters.query.trim()}%`));
    }

    const list = await db
        .select({
            id: packs.id,
            title: packs.title,
            status: packs.status,
            templateId: packs.templateId,
            currentVersion: packs.currentVersion,
            createdAt: packs.createdAt,
            updatedAt: packs.updatedAt,
            propertyId: properties.id,
            propertyTitle: properties.title,
            propertyAddress: properties.address,
            propertyCity: properties.city,
            propertyPrice: properties.price,
            propertyCurrency: properties.currency,
            propertyHeroImage: properties.heroImage,
            createdByName: users.name,
        })
        .from(packs)
        .innerJoin(properties, eq(packs.propertyId, properties.id))
        .leftJoin(users, eq(packs.createdById, users.id))
        .where(and(...conditions))
        .orderBy(desc(packs.createdAt));

    return list;
}

/**
 * Fetch a single pack with its latest version, HTML content, and full property specs.
 */
export async function getPackById(orgId: string, packId: string) {
    const [pack] = await db
        .select({
            id: packs.id,
            orgId: packs.orgId,
            propertyId: packs.propertyId,
            templateId: packs.templateId,
            title: packs.title,
            status: packs.status,
            currentVersion: packs.currentVersion,
            createdAt: packs.createdAt,
            updatedAt: packs.updatedAt,
            createdById: packs.createdById,
        })
        .from(packs)
        .where(and(eq(packs.id, packId), eq(packs.orgId, orgId)))
        .limit(1);

    if (!pack) {
        return null;
    }

    const property = await getPropertyById(orgId, pack.propertyId);

    // Fetch all versions
    const versions = await db
        .select()
        .from(packVersions)
        .where(eq(packVersions.packId, packId))
        .orderBy(desc(packVersions.version));

    const latestVersion = versions[0] || null;

    return {
        ...pack,
        property,
        versions,
        latestHtml: latestVersion?.htmlContent || '',
    };
}

/**
 * Aggregate metrics for marketing packs in the organisation.
 */
export async function getPackStats(orgId: string) {
    const rows = await db
        .select({
            status: packs.status,
            count: sql<number>`count(*)`,
        })
        .from(packs)
        .where(eq(packs.orgId, orgId))
        .groupBy(packs.status);

    const stats = {
        total: 0,
        approved: 0,
        in_review: 0,
        draft: 0,
        published: 0,
    };

    for (const row of rows) {
        const c = Number(row.count);
        stats.total += c;
        if (row.status === 'approved') stats.approved = c;
        if (row.status === 'in_review') stats.in_review = c;
        if (row.status === 'draft') stats.draft = c;
        if (row.status === 'published') stats.published = c;
    }

    return stats;
}

/**
 * Create a new marketing pack, compile the initial HTML with brand kit, and store Version 1.
 */
export async function createMarketingPack(params: {
    orgId: string;
    propertyId: string;
    templateId: string;
    title: string;
    createdById: string;
    customDescription?: string;
}) {
    const { orgId, propertyId, templateId, title, createdById, customDescription } = params;

    const property = await getPropertyById(orgId, propertyId);
    if (!property) {
        throw new Error('Property not found');
    }

    // Compile initial HTML using the chosen template & active brand kit
    const htmlContent = await renderTemplatePreview(
        templateId,
        {
            title: property.title,
            address: property.address,
            city: property.city,
            state: property.state,
            zipCode: property.zipCode,
            country: property.country,
            price: property.price,
            currency: property.currency,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            sqft: property.sqft,
            lotSize: property.lotSize,
            yearBuilt: property.yearBuilt,
            propertyType: property.propertyType,
            heroImage: property.heroImage,
            amenities: property.amenitiesList,
            description: customDescription || property.description,
        },
        orgId
    );

    // Insert Pack record
    const [newPack] = await db
        .insert(packs)
        .values({
            orgId,
            propertyId,
            createdById,
            templateId,
            title,
            status: 'draft',
            currentVersion: 1,
            thumbnail: property.heroImage,
        })
        .returning();

    // Insert Version 1
    await db.insert(packVersions).values({
        packId: newPack.id,
        version: 1,
        htmlContent,
    });

    return newPack;
}
