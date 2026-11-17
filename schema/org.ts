import { z } from 'zod';

export const createOrgSchema = z.object({
    name: z.string().min(2, 'Agency name must be at least 2 characters').max(100),
    website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
    phone: z.string().max(25).optional().or(z.literal('')),
    address: z.string().max(200).optional().or(z.literal('')),
    timezone: z.string().default('America/New_York'),
});

export const updateOrgSchema = z.object({
    name: z.string().min(2, 'Agency name must be at least 2 characters').max(100),
    website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
    phone: z.string().max(25).optional().or(z.literal('')),
    address: z.string().max(200).optional().or(z.literal('')),
    timezone: z.string().default('America/New_York'),
    logo: z.string().optional().or(z.literal('')),
});

export const inviteMemberSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    role: z.enum(['admin', 'agent', 'viewer'], {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
});

export const updateMemberRoleSchema = z.object({
    membershipId: z.string().uuid(),
    role: z.enum(['owner', 'admin', 'agent', 'viewer']),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
