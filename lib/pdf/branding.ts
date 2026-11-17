import { db } from '@/lib/schema';
import { brandKits, templates } from '@/lib/schema/db/templates';
import { organisations } from '@/lib/schema/db/organisations';
import { eq, desc } from 'drizzle-orm';
import { TEMPLATES, getTemplateById, type TemplatePropertyData } from './template-engine';

export async function getBrandKit(orgId: string) {
    const [kit] = await db
        .select()
        .from(brandKits)
        .where(eq(brandKits.orgId, orgId))
        .limit(1);

    if (kit) {
        return kit;
    }

    // Auto-provision if not existing
    const [org] = await db
        .select({ name: organisations.name, logo: organisations.logo, phone: organisations.phone, website: organisations.website })
        .from(organisations)
        .where(eq(organisations.id, orgId))
        .limit(1);

    const [newKit] = await db
        .insert(brandKits)
        .values({
            orgId,
            name: `${org?.name || 'Agency'} Brand Kit`,
            logo: org?.logo || null,
            primaryColor: '#2563EB',
            secondaryColor: '#1E40AF',
            accentColor: '#F59E0B',
            fontFamily: 'Inter',
            tagline: 'Premier Real Estate Marketing',
            disclaimer: 'Information deemed reliable but not guaranteed. Equal Housing Opportunity.',
        })
        .returning();

    return newKit;
}

export async function getAgencyTemplates(orgId: string) {
    const custom = await db
        .select()
        .from(templates)
        .where(eq(templates.orgId, orgId))
        .orderBy(desc(templates.createdAt));

    return {
        builtIn: TEMPLATES,
        custom,
    };
}

export async function renderTemplatePreview(
    templateId: string,
    property: TemplatePropertyData,
    orgId: string
): Promise<string> {
    const kit = await getBrandKit(orgId);
    const [org] = await db
        .select({ phone: organisations.phone, website: organisations.website, name: organisations.name })
        .from(organisations)
        .where(eq(organisations.id, orgId))
        .limit(1);

    const template = getTemplateById(templateId);

    return template.render(property, {
        name: kit.name || org?.name || 'PropertyAI Real Estate',
        logo: kit.logo || undefined,
        primaryColor: kit.primaryColor || '#2563EB',
        secondaryColor: kit.secondaryColor || '#1E40AF',
        accentColor: kit.accentColor || '#F59E0B',
        fontFamily: kit.fontFamily || 'Inter',
        tagline: kit.tagline || undefined,
        disclaimer: kit.disclaimer || undefined,
        agencyPhone: org?.phone || undefined,
        agencyWebsite: org?.website || undefined,
    });
}
