import { auth } from '@/lib/auth';
import { logoutUser } from '@/lib/auth-actions';

interface HeaderProps {
    orgName?: string;
    role?: string;
}

export async function Header({ orgName, role }: HeaderProps) {
    const session = await auth();

    return (
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sm:px-8">
            <div className="flex items-center gap-3">
                {orgName && (
                    <span className="text-sm font-semibold text-gray-800 hidden sm:inline-block">
                        {orgName}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                {session?.user && (
                    <>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {session.user.name || 'Agent'}
                            </p>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                <span className="text-xs text-gray-500">{session.user.email}</span>
                                {role && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                        {role}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                        </div>

                        <form action={logoutUser}>
                            <button
                                type="submit"
                                className="text-xs text-gray-500 hover:text-red-600 font-medium px-2 py-1 rounded transition-colors border border-transparent hover:border-gray-200"
                            >
                                Sign out
                            </button>
                        </form>
                    </>
                )}
            </div>
        </header>
    );
}
