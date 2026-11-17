import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/schema';
import { users } from '@/lib/schema/db/users';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/schema/auth';
import authConfig from './auth.config';

class DatabaseTimeoutError extends CredentialsSignin {
    code = 'database_timeout';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: 'jwt' },
    providers: [
        ...authConfig.providers,
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;
                const { email, password } = parsed.data;
                try {
                    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
                    if (!user || !user.password) return null;
                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) return null;
                    return { id: user.id, name: user.name, email: user.email, image: user.image };
                } catch (err: any) {
                    console.error('Auth authorize error:', err);
                    if (err?.code === 'ETIMEDOUT' || err?.message?.includes('TIMEOUT') || err?.name === 'AggregateError') {
                        throw new DatabaseTimeoutError();
                    }
                    return null;
                }
            },
        }),
    ],
});
