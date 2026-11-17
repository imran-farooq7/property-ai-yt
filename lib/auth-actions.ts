'use server';

import { signIn, signOut } from '@/lib/auth';
import { db } from '@/lib/schema/index';
import { users } from '@/lib/schema/db/users';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signupSchema, loginSchema } from '@/schema/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export type AuthActionResult = { success: boolean; error?: string };

// 1. User Registration Action
export async function registerUser(formData: FormData): Promise<AuthActionResult> {
    const raw = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
    };

    // Zod validation
    const parsed = signupSchema.safeParse(raw);
    if (!parsed.success) {
        return { success: false, error: parsed.error.errors[0]?.message || 'Invalid input' };
    }

    const { name, email, password } = parsed.data;

    try {
        // Check if user already exists
        const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (existing) {
            return { success: false, error: 'An account with this email already exists' };
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user into Supabase
        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
        });

        // Auto-login after registration
        await signIn('credentials', { email, password, redirectTo: '/properties' });
        return { success: true };
    } catch (error: any) {
        if (isRedirectError(error)) {
            throw error;
        }

        console.error('Registration error:', error);

        if (
            error?.code === 'database_timeout' ||
            error?.code === 'ETIMEDOUT' ||
            error?.message?.includes('TIMEOUT') ||
            error?.message?.includes('ETIMEDOUT') ||
            error?.name === 'AggregateError'
        ) {
            return {
                success: false,
                error: 'Database connection timed out. Your ISP is blocking Supabase port 6543. Please turn on a VPN (e.g. Cloudflare WARP) or switch to a mobile hotspot.',
            };
        }

        return {
            success: false,
            error: error?.message || 'Failed to create account. Please try again.',
        };
    }
}

// 2. User Login Action
export async function loginWithCredentials(formData: FormData): Promise<AuthActionResult> {
    const raw = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
        return { success: false, error: parsed.error.errors[0]?.message || 'Invalid input' };
    }

    try {
        await signIn('credentials', {
            email: parsed.data.email,
            password: parsed.data.password,
            redirectTo: '/properties',
        });
        return { success: true };
    } catch (error: any) {
        if (isRedirectError(error)) {
            throw error;
        }

        console.error('Login error:', error);

        if (
            error?.code === 'database_timeout' ||
            error?.message?.includes('database_timeout') ||
            error?.code === 'ETIMEDOUT' ||
            error?.message?.includes('TIMEOUT') ||
            error?.message?.includes('ETIMEDOUT') ||
            error?.name === 'AggregateError'
        ) {
            return {
                success: false,
                error: 'Database connection timed out. Your ISP is blocking Supabase port 6543. Please turn on a VPN (e.g. Cloudflare WARP) or switch to a mobile hotspot.',
            };
        }

        if (error?.type === 'CredentialsSignin') {
            return { success: false, error: 'Invalid email or password' };
        }

        return {
            success: false,
            error: error?.message || 'Invalid email or password',
        };
    }
}

// 3. User Logout Action
export async function logoutUser(): Promise<void> {
    await signOut({ redirectTo: '/login' });
}
