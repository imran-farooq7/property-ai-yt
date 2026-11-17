import { auth } from '@/lib/auth';
import { db, users } from '@/lib/schema/index';
import { invitations, memberships, organisations, } from '@/lib/schema/db/organisations';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function getCurrentTenant() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [active] = await db
        .select({
            orgId: organisations.id,
            orgName: organisations.name,
            role: memberships.role,
            slug: organisations.slug,
            timezone: organisations.timezone,
            website: organisations.website,
            phone: organisations.phone,
            address: organisations.address,
            logo: organisations.logo
        })
        .from(memberships)
        .innerJoin(organisations, eq(memberships.orgId, organisations.id))
        .where(eq(memberships.userId, session.user.id))
        .limit(1);

    if (!active) return null;

    return {
        user: session.user,
        org: { id: active.orgId, name: active.orgName, timezone: active.timezone, website: active.website, logo: active.logo, phone: active.phone, address: active.address, slug: active.slug },
        role: active.role,
    };
}
export const requireTenant = async () => {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")
    const tenant = await getCurrentTenant()
    if (!tenant) redirect("/onboarding")
    return tenant
}
export async function getOrganisationMembers(orgId: string) {
    return await db
        .select({
            id: memberships.id,
            role: memberships.role,
            joinedAt: memberships.createdAt,
            userId: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
        })
        .from(memberships)
        .innerJoin(users, eq(memberships.userId, users.id))
        .where(eq(memberships.orgId, orgId));
}
/**
 * Fetch pending invitations for an organisation.
 */
export async function getOrganisationInvitations(orgId: string) {
    return await db
        .select({
            id: invitations.id,
            email: invitations.email,
            role: invitations.role,
            token: invitations.token,
            status: invitations.status,
            expiresAt: invitations.expiresAt,
            createdAt: invitations.createdAt,
            invitedByName: users.name,
        })
        .from(invitations)
        .leftJoin(users, eq(invitations.invitedBy, users.id))
        .where(and(eq(invitations.orgId, orgId), eq(invitations.status, 'pending')));
}