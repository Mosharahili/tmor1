import { compare } from 'bcryptjs';
import type { NextAuthOptions, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { SessionStrategy } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    }
  }
  interface User {
    id: string;
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        login: { label: 'Email or Phone', type: 'text', placeholder: 'your@email.com or phone number' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          return null;
        }

        // Check if login is an email or a phone number
        const isEmail = credentials.login.includes('@');

        const user = await prisma.user.findUnique({
          where: isEmail
            ? { email: credentials.login }
            : { phone: credentials.login },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (isValid) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 