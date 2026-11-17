import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const providers: any[] = [];

if (hasGoogle) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  pages: { signIn: '/login', newUser: '/signup', error: '/login' },
  providers,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isloggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup") || nextUrl.pathname === "/";
      if (!isAuthPage) return isloggedIn
      return true
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string
      return session
    }

  }
};

export default authConfig;
