'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/schema';
import { brandKits, templates } from '@/lib/schema/db/templates';
import { memberships } from '@/lib/schema/db/organisations';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { canManageTeam } from '@/lib/permissions';
import type { UserRole } from '@/types';

/**
 * Server action: Update agency brand kit (colors, typography, logo, tagline, disclaimer).
 */
export async function updateBrandKitAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    if (!orgId) {
        throw new Error('Organisation ID is required');
    }

    // Permission check
    const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!membership || !canManageTeam(membership.role as UserRole)) {
        throw new Error('You do not have permission to modify brand kit settings.');
    }

    const primaryColor = (formData.get('primaryColor') as string) || '#2563EB';
    const secondaryColor = (formData.get('secondaryColor') as string) || '#1E40AF';
    const accentColor = (formData.get('accentColor') as string) || '#F59E0B';
    const fontFamily = (formData.get('fontFamily') as string) || 'Inter';
    const logo = (formData.get('logo') as string) || null;
    const tagline = (formData.get('tagline') as string) || null;
    const disclaimer = (formData.get('disclaimer') as string) || null;
    const name = (formData.get('name') as string) || 'Agency Brand Kit';

    const [existing] = await db
        .select({ id: brandKits.id })
        .from(brandKits)
        .where(eq(brandKits.orgId, orgId))
        .limit(1);

    if (existing) {
        await db
            .update(brandKits)
            .set({
                name,
                primaryColor,
                secondaryColor,
                accentColor,
                fontFamily,
                logo,
                tagline,
                disclaimer,
                updatedAt: new Date(),
            })
            .where(eq(brandKits.id, existing.id));
    } else {
        await db.insert(brandKits).values({
            orgId,
            name,
            primaryColor,
            secondaryColor,
            accentColor,
            fontFamily,
            logo,
            tagline,
            disclaimer,
        });
    }

    revalidatePath('/editor');
}

/**
 * Server action: Save a new custom template.
 */
export async function createCustomTemplateAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const name = formData.get('name') as string;
    const type = (formData.get('type') as string) || 'flyer';
    const html = formData.get('html') as string;

    if (!orgId || !name) {
        throw new Error('Missing template name or organization');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    await db.insert(templates).values({
        orgId,
        name,
        slug,
        type,
        html: html || '',
    });

    revalidatePath('/editor');
}
