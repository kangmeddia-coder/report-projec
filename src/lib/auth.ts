import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcrypt-ts'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Use D1 directly — Prisma D1 adapter has a silent initialization issue
// getCloudflareContext().env.school_db is confirmed to work in production
async function getUserFromD1(email: string) {
  try {
    const ctx = getCloudflareContext()
    const d1 = ctx?.env?.school_db as any
    if (!d1) return null

    const user = await d1
      .prepare('SELECT u.*, s.name as schoolName FROM "User" u LEFT JOIN "School" s ON u.schoolId = s.id WHERE u.email = ?')
      .bind(email)
      .first()

    return user || null
  } catch (e) {
    console.error('D1 auth query error:', e)
    return null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await getUserFromD1(credentials.email as string)
        if (!user) return null

        const isValid = await compare(
          credentials.password as string,
          user.password as string
        )
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.schoolName,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.schoolId = (user as any).schoolId
        token.schoolName = (user as any).schoolName
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).schoolId = token.schoolId
        ;(session.user as any).schoolName = token.schoolName
      }
      return session
    },
  },
})
