import type { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth'
import { type Adapter } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
         
        session.user.id = token.sub!
      }
      return session
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      authorize: authorize(db),
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
}

function authorize(prisma: PrismaClient) {
  return async (
    credentials: Record<'email' | 'password', string> | undefined,
  ) => {
    if (!credentials) throw new Error('Missing credentials')

    if (!credentials.email)
      throw new Error('"email" is required in credentials')

    if (!credentials.password)
      throw new Error('"password" is required in credentials')

    const maybeUser = await prisma.user.findFirst({
      where: { email: credentials.email },
      select: { id: true, email: true, password: true, name: true, role: true },
    })

    if (!maybeUser?.password) return null

    const isValid = await compare(credentials.password, maybeUser.password)
    if (!isValid) return null
    return {
      id: maybeUser.id,
      email: maybeUser.email,
      name: maybeUser.name,
      role: maybeUser.role,
    }
  }
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions)

export const getCurrentUser = async () => {
  const session = await getServerAuthSession()
  console.log('session', session);
  const userId = session?.user?.id

  if (!userId) return null

  const user = await db.user.findUnique({
    where: { id: userId },
  })
  return user
}
