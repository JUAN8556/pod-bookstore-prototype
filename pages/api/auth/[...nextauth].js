import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Códice Login',
      credentials: {
        email: { label: "Correo", type: "email", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Mock DB: Any email with password "123456" logs in
        if (credentials.email && credentials.password === '123456') {
          return {
            id: "u123",
            name: credentials.email.split('@')[0],
            email: credentials.email,
            image: `https://ui-avatars.com/api/?name=${credentials.email.split('@')[0]}&background=random`
          }
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "secreto_temporal_para_prototipo_123",
}

export default NextAuth(authOptions)