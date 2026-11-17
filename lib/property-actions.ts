'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/schema/index';
import { properties, propertyImages } from '@/lib/schema/db/properties';
import { memberships } from '@/lib/schema/db/organisations';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canEditProperty } from '@/lib/permissions';
import { createPropertySchema } from '@/schema/property';
import type { UserRole } from '@/types';

export async function createPropertyAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const orgId = formData.get('orgId') as string;
    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canEditProperty(membership.role as UserRole)) {
        throw new Error('Permission denied.');
    }

    const amenitiesList = formData.getAll('amenities') as string[];
    const raw = {
        title: formData.get('title'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country') || 'US',
        price: formData.get('price'),
        currency: formData.get('currency') || 'USD',
        bedrooms: formData.get('bedrooms') || 0,
        bathrooms: formData.get('bathrooms') || 1,
        sqft: formData.get('sqft') || null,
        lotSize: formData.get('lotSize') || null,
        yearBuilt: formData.get('yearBuilt') || null,
        propertyType: formData.get('propertyType') || 'house',
        description: formData.get('description') || null,
        heroImage: formData.get('heroImage') || null,
        status: formData.get('status') || 'active',
        amenities: amenitiesList,
    };

    const parsed = createPropertySchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message || 'Validation failed');
    }

    // new property
    const [newProp] = await db.insert(properties).values({
        ...parsed.data,
        orgId,
        createdById: session.user.id,
        amenities: JSON.stringify(parsed.data.amenities)
    }).returning()

    // Handle gallery URLs
    const additional = formData.get('additionalImages') as string;
    if (additional) {
        const urls = additional.split('\n').map((u) => u.trim()).filter((u) => u.startsWith('http'));
        if (urls.length) {
            await db.insert(propertyImages).values(
                urls.map((url, i) => ({ propertyId: newProp.id, url, order: i + 1 }))
            );
        }
    }

    revalidatePath('/properties');
    redirect(`/properties/${newProp.id}`);
}
export async function updatePropertyAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const propertyId = formData.get('propertyId') as string;
    const orgId = formData.get('orgId') as string;

    if (!propertyId || !orgId) {
        throw new Error('Property and Organisation ID are required');
    }

    // 1. Permission check (Sirf Agents/Admins/Owners update kar sakte hain)
    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canEditProperty(membership.role as UserRole)) {
        throw new Error('You do not have permission to edit property listings.');
    }

    const amenitiesList = formData.getAll('amenities') as string[];

    const raw = {
        title: formData.get('title'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country') || 'US',
        price: formData.get('price'),
        currency: formData.get('currency') || 'USD',
        bedrooms: formData.get('bedrooms') || 0,
        bathrooms: formData.get('bathrooms') || 1,
        sqft: formData.get('sqft') || null,
        lotSize: formData.get('lotSize') || null,
        yearBuilt: formData.get('yearBuilt') || null,
        propertyType: formData.get('propertyType') || 'house',
        description: formData.get('description') || null,
        heroImage: formData.get('heroImage') || null,
        status: formData.get('status') || 'active',
        amenities: amenitiesList,
    };

    const parsed = createPropertySchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message || 'Invalid property data');
    }

    const data = parsed.data;

    // 2. Database mein property update karein
    await db
        .update(properties)
        .set({
            title: data.title,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            price: data.price,
            currency: data.currency,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            sqft: data.sqft || null,
            lotSize: data.lotSize || null,
            yearBuilt: data.yearBuilt || null,
            propertyType: data.propertyType,
            description: data.description || null,
            amenities: JSON.stringify(data.amenities),
            heroImage: data.heroImage || null,
            status: data.status,
            updatedAt: new Date(),
        })
        .where(and(eq(properties.id, propertyId), eq(properties.orgId, orgId)));

    revalidatePath('/properties');
    revalidatePath(`/properties/${propertyId}`);
}

/**
 * Server action: Delete a property listing.
 */
export async function deletePropertyAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const propertyId = formData.get('propertyId') as string;
    const orgId = formData.get('orgId') as string;

    if (!propertyId || !orgId) {
        throw new Error('Property and Organisation ID are required');
    }

    // 1. Role permission check
    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canEditProperty(membership.role as UserRole)) {
        throw new Error('You do not have permission to delete properties.');
    }

    // 2. Database se property delete karein (Cascade delete attached images ko bhi clean kar dega)
    await db
        .delete(properties)
        .where(and(eq(properties.id, propertyId), eq(properties.orgId, orgId)));

    revalidatePath('/properties');
    redirect('/properties');
}
