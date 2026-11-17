import Link from 'next/link';

interface SidebarProps {
    orgName?: string;
    role?: string;
}

export function Sidebar({ orgName = 'My Agency', role = 'agent' }: SidebarProps) {
    return (
        <aside className="w-64 border-r border-gray-200 h-full bg-white flex flex-col justify-between p-4 select-none">
            <div className="space-y-6">
                {/* Brand & Agency Switcher Card */}
                <div className="px-2">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                            P
                        </div>
                        <span className="font-bold text-lg text-gray-900 tracking-tight">PropertyAI</span>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Agency</div>
                        <div className="font-semibold text-sm text-gray-900 truncate mt-0.5">{orgName}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            <span className="text-[11px] font-medium text-gray-500 capitalize">{role}</span>
                        </div>
                    </div>
                </div>

                {/* Navigation items */}
                <nav className="space-y-1">
                    <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Marketing Core
                    </div>
                    <Link
                        href="/properties"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <span className="text-base">🏠</span>
                        <span>Properties</span>
                    </Link>
                    <Link
                        href="/packs"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <span className="text-base">📦</span>
                        <span>Marketing Packs</span>
                    </Link>
                    <Link
                        href="/editor"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <span className="text-base">🎨</span>
                        <span>PDF Templates</span>
                    </Link>

                    {/* 👥 Management Section (Phase 4 Team Link) */}
                    <div className="px-2 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Management
                    </div>
                    <Link
                        href="/team"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <span className="text-base">👥</span>
                        <span>Team & Agents</span>
                    </Link>
                    <Link
                        href="/analytics"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <span className="text-base">📊</span>
                        <span>Analytics</span>
                    </Link>
                    <Link
                        href="/integrations"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <span className="text-base">🔌</span>
                        <span>Integrations</span>
                    </Link>
                </nav>
            </div>

            {/* Footer Navigation */}
            <div className="space-y-1 pt-4 border-t border-gray-200">
                <Link
                    href="/settings/organisation"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                    <span className="text-base">⚙️</span>
                    <span>Agency Settings</span>
                </Link>
                <Link
                    href="/settings/billing"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                    <span className="text-base">💳</span>
                    <span>Billing & Plan</span>
                </Link>
            </div>
        </aside>
    );
}