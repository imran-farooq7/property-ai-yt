import { requireTenant, getOrganisationMembers, getOrganisationInvitations } from '@/lib/tenant';
import { canManageTeam } from '@/lib/permissions';
import {
    inviteMemberAction,
    updateMemberRoleAction,
    removeMemberAction,
    revokeInvitationAction,
} from '@/lib/org-actions';
import { UserRole } from '@/types';

export default async function TeamPage() {
    const tenant = await requireTenant();
    const members = await getOrganisationMembers(tenant.org.id);
    const pendingInvitations = await getOrganisationInvitations(tenant.org.id);
    const canManage = canManageTeam(tenant.role as UserRole);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team & Agents</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage agents, marketing coordinators, and permissions for{' '}
                        <span className="font-semibold text-gray-700">{tenant.org.name}</span>.
                    </p>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                    Active Members: <span className="text-blue-600 font-bold">{members.length}</span>
                </div>
            </div>

            {/* Invite Member Section (if user has permission) */}
            {canManage && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Invite New Team Member</h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Send an email invitation with a secure link to join your real estate agency.
                    </p>
                    <form action={inviteMemberAction} className="flex flex-col sm:flex-row gap-3">
                        <input type="hidden" name="orgId" value={tenant.org.id} />
                        <div className="flex-1">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="agent@brokerage.com"
                                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <select
                                name="role"
                                defaultValue="agent"
                                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                            >
                                <option value="agent">Agent (Create & Edit)</option>
                                <option value="admin">Admin (Manage & Approve)</option>
                                <option value="viewer">Viewer (Read-Only)</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap"
                        >
                            Send Invitation
                        </button>
                    </form>
                </div>
            )}

            {/* Active Members Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Current Members ({members.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left">
                        <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Member</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Joined</th>
                                {canManage && <th className="px-6 py-3 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {members.map((member) => {
                                const isCurrentUser = member.userId === tenant.user.id;
                                const isOwner = member.role === 'owner';

                                return (
                                    <tr key={member.id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {member.image ? (
                                                    <img
                                                        src={member.image}
                                                        alt=""
                                                        className="h-9 w-9 rounded-full object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                                                        {(member.name || member.email)[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                                        {member.name || 'Unnamed Agent'}
                                                        {isCurrentUser && (
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-normal">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {canManage && !isOwner && !isCurrentUser ? (
                                                <form action={updateMemberRoleAction} className="inline-block">
                                                    <input type="hidden" name="orgId" value={tenant.org.id} />
                                                    <input type="hidden" name="membershipId" value={member.id} />
                                                    <select
                                                        name="role"
                                                        defaultValue={member.role}
                                                        // Form auto-submits on change for seamless UX
                                                        className="text-xs rounded-md border border-gray-300 py-1 px-2 shadow-sm font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="owner">Owner</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="agent">Agent</option>
                                                        <option value="viewer">Viewer</option>
                                                    </select>
                                                    <button
                                                        type="submit"
                                                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        Save
                                                    </button>
                                                </form>
                                            ) : (
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${member.role === 'owner'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : member.role === 'admin'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : member.role === 'agent'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {member.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(member.joinedAt).toLocaleDateString()}
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                                {!isOwner && !isCurrentUser && (
                                                    <form action={removeMemberAction} className="inline-block">
                                                        <input type="hidden" name="orgId" value={tenant.org.id} />
                                                        <input type="hidden" name="membershipId" value={member.id} />
                                                        <button
                                                            type="submit"
                                                            className="text-red-600 hover:text-red-900 font-medium transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </form>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Invitations Table */}
            {pendingInvitations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Pending Invitations ({pendingInvitations.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Invited Email</th>
                                    <th className="px-6 py-3">Invited Role</th>
                                    <th className="px-6 py-3">Invited By</th>
                                    <th className="px-6 py-3">Expires</th>
                                    {canManage && <th className="px-6 py-3 text-right">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {pendingInvitations.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50/70">
                                        <td className="px-6 py-3.5 font-medium text-gray-900">{inv.email}</td>
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                                                {inv.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-gray-500">{inv.invitedByName || 'Admin'}</td>
                                        <td className="px-6 py-3.5 text-xs text-gray-500">
                                            {new Date(inv.expiresAt).toLocaleDateString()}
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-3.5 text-right text-xs">
                                                <form action={revokeInvitationAction} className="inline-block">
                                                    <input type="hidden" name="orgId" value={tenant.org.id} />
                                                    <input type="hidden" name="invitationId" value={inv.id} />
                                                    <button
                                                        type="submit"
                                                        className="text-gray-500 hover:text-red-600 transition-colors"
                                                    >
                                                        Revoke
                                                    </button>
                                                </form>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Role Explanations Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="font-semibold text-xs text-purple-700 uppercase tracking-wide">Owner</div>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                        Full authority over agency settings, Stripe subscription, team management, and workspace deletion.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="font-semibold text-xs text-blue-700 uppercase tracking-wide">Admin</div>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                        Can invite and manage team members, approve marketing packs, and edit all agency listings.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="font-semibold text-xs text-green-700 uppercase tracking-wide">Agent</div>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                        Can create and manage property listings, generate AI marketing packs, and download branded PDFs.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="font-semibold text-xs text-gray-700 uppercase tracking-wide">Viewer</div>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                        Read-only access to view published listings and preview generated marketing assets.
                    </p>
                </div>
            </div>
        </div>
    );
}
