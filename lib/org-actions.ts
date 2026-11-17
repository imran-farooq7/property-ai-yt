'use server';

import { auth } from '@/lib/auth';
import { db, users } from '@/lib/schema/index';
import { organisations, memberships, invitations } from '@/lib/schema/db/organisations';
import { createOrgSchema, inviteMemberSchema, updateMemberRoleSchema, updateOrgSchema } from '@/schema/org';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import { canManageTeam } from './permissions';
import { UserRole } from '@/types';

function slugify(name: string): string {
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const suffix = crypto.randomBytes(3).toString('hex');
    return `${base}-${suffix}`;
}

export async function createOrganisationAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('You must be signed in to create an organisation.');
    }

    const raw = {
        name: (formData.get('name') as string)?.trim(),
        website: (formData.get('website') as string)?.trim() || null,
        phone: (formData.get('phone') as string)?.trim() || null,
        address: (formData.get('address') as string)?.trim() || null,
        timezone: (formData.get('timezone') as string)?.trim() || 'America/New_York',
    };

    const parsed = createOrgSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message || 'Invalid agency details');
    }

    const { name, website, phone, address, timezone } = parsed.data;
    const slug = slugify(name);

    // 1. Create Organisation
    const [newOrg] = await db.insert(organisations).values({
        name,
        phone: phone || null,
        address: address || null,
        website: website || null,
        timezone: timezone || 'America/New_York',
        slug,
    }).returning();

    // 2. Assign creator as 'owner'
    await db.insert(memberships).values({
        orgId: newOrg.id,
        userId: session.user.id,
        role: 'owner',
    });

    // 3. Revalidate and Redirect to dashboard
    revalidatePath('/properties');
    redirect('/properties');
}

/**
 * Server action: Update organisation profile and preferences.
 */
export async function updateOrganisationAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    if (!orgId) {
        throw new Error('Organisation ID missing');
    }

    // Check user permission
    const [userMembership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!userMembership || !canManageTeam(userMembership.role as UserRole)) {
        throw new Error('You do not have permission to update organisation settings.');
    }

    const raw = {
        name: formData.get('name') as string,
        website: formData.get('website') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        timezone: formData.get('timezone') as string,
        logo: formData.get('logo') as string,
    };

    const parsed = updateOrgSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message || 'Invalid details');
    }

    await db
        .update(organisations)
        .set({
            name: parsed.data.name,
            website: parsed.data.website || null,
            phone: parsed.data.phone || null,
            address: parsed.data.address || null,
            timezone: parsed.data.timezone,
            logo: parsed.data.logo || null,
            updatedAt: new Date(),
        })
        .where(eq(organisations.id, orgId));

    revalidatePath('/settings/organisation');
    revalidatePath('/team');
}

/**
 * Server action: Invite a new team member by email.
 */
export async function inviteMemberAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const raw = {
        email: (formData.get('email') as string)?.toLowerCase().trim(),
        role: formData.get('role') as string,
    };

    const parsed = inviteMemberSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message || 'Invalid email or role');
    }

    // Check user permission
    const [userMembership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!userMembership || !canManageTeam(userMembership.role as UserRole)) {
        throw new Error('You do not have permission to invite team members.');
    }

    // Check if already an active member
    const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, parsed.data.email))
        .limit(1);

    if (existingUser) {
        const [existingMembership] = await db
            .select({ id: memberships.id })
            .from(memberships)
            .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, existingUser.id)))
            .limit(1);

        if (existingMembership) {
            throw new Error('This user is already a member of your organisation.');
        }
    }

    // Create an invitation token valid for 7 days
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(invitations).values({
        orgId,
        email: parsed.data.email,
        role: parsed.data.role,
        token,
        invitedBy: session.user.id,
        expiresAt,
    });

    revalidatePath('/team');
}

/**
 * Server action: Update a member's role.
 */
export async function updateMemberRoleAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const raw = {
        membershipId: formData.get('membershipId') as string,
        role: formData.get('role') as string,
    };

    const parsed = updateMemberRoleSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error('Invalid input');
    }

    // Check current user's role
    const [currentUserMembership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!currentUserMembership || !canManageTeam(currentUserMembership.role as UserRole)) {
        throw new Error('You do not have permission to change roles.');
    }

    // Verify target membership exists in this org
    const [targetMembership] = await db
        .select({ id: memberships.id, role: memberships.role, userId: memberships.userId })
        .from(memberships)
        .where(and(eq(memberships.id, parsed.data.membershipId), eq(memberships.orgId, orgId)))
        .limit(1);

    if (!targetMembership) {
        throw new Error('Member not found.');
    }

    // If demoting an owner, ensure at least one other owner exists
    if (targetMembership.role === 'owner' && parsed.data.role !== 'owner') {
        const owners = await db
            .select({ id: memberships.id })
            .from(memberships)
            .where(and(eq(memberships.orgId, orgId), eq(memberships.role, 'owner')));

        if (owners.length <= 1) {
            throw new Error('Every organisation must have at least one owner.');
        }
    }

    await db
        .update(memberships)
        .set({ role: parsed.data.role })
        .where(eq(memberships.id, parsed.data.membershipId));

    revalidatePath('/team');
}

/**
 * Server action: Remove a member from the organisation.
 */
export async function removeMemberAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const membershipId = formData.get('membershipId') as string;

    if (!orgId || !membershipId) {
        throw new Error('Missing parameters');
    }

    // Check permission
    const [currentUserMembership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!currentUserMembership || !canManageTeam(currentUserMembership.role as UserRole)) {
        throw new Error('You do not have permission to remove members.');
    }

    // Find target membership
    const [targetMembership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.id, membershipId), eq(memberships.orgId, orgId)))
        .limit(1);

    if (!targetMembership) {
        throw new Error('Member not found.');
    }

    if (targetMembership.role === 'owner') {
        const owners = await db
            .select({ id: memberships.id })
            .from(memberships)
            .where(and(eq(memberships.orgId, orgId), eq(memberships.role, 'owner')));

        if (owners.length <= 1) {
            throw new Error('Cannot remove the sole owner of the organisation.');
        }
    }

    await db.delete(memberships).where(eq(memberships.id, membershipId));

    revalidatePath('/team');
}

/**
 * Server action: Revoke a pending invitation.
 */
export async function revokeInvitationAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const orgId = formData.get('orgId') as string;
    const invitationId = formData.get('invitationId') as string;

    const [currentUserMembership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, session.user.id)))
        .limit(1);

    if (!currentUserMembership || !canManageTeam(currentUserMembership.role as UserRole)) {
        throw new Error('Unauthorized');
    }

    await db
        .delete(invitations)
        .where(and(eq(invitations.id, invitationId), eq(invitations.orgId, orgId)));

    revalidatePath('/team');
}