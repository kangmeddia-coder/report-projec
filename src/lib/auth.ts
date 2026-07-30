import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getPrisma } from '@/lib/prisma'
import { compare } from 'bcrypt-ts'

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
        const prisma = getPrisma()
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { school: true },
        })
        if (!user) return null
        const isValid = await compare(
          credentials.password as string,
          user.password
        )
        if (!isValid) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.school?.name,
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
