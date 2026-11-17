import type { UserRole } from '@/types';

// Role hierarchy: viewer (0) < agent (1) < admin (2) < owner (3)
const ROLE_HIERARCHY: UserRole[] = ['viewer', 'agent', 'admin', 'owner'];

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole);
}

// 1. Property Management (Agent, Admin, Owner)
export function canEditProperty(role: UserRole): boolean {
    return hasPermission(role, 'agent');
}

// 2. AI Content Generation (Agent, Admin, Owner)
export function canGenerateContent(role: UserRole): boolean {
    return hasPermission(role, 'agent');
}

// 3. Marketing Pack QA Approval (Admin, Owner only)
export function canApprovePack(role: UserRole): boolean {
    return hasPermission(role, 'admin');
}

// 4. Team & Brand Kit Management (Admin, Owner only)
export function canManageTeam(role: UserRole): boolean {
    return hasPermission(role, 'admin');
}

// 5. Analytics Viewing (Agent, Admin, Owner)
export function canViewAnalytics(role: UserRole): boolean {
    return hasPermission(role, 'agent');
}

// 6. Billing & Subscription (Owner only)
export function canManageBilling(role: UserRole): boolean {
    return hasPermission(role, 'owner');
}

// 7. Danger Zone: Delete Organisation (Owner only)
export function canDeleteOrg(role: UserRole): boolean {
    return hasPermission(role, 'owner');
}
