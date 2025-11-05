import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { syncUserToBosbase } from "@/lib/bosbase/sync-user";

// For NextAuth v5, you export handlers from NextAuth
const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  // Trust host for development (required in some NextAuth v5 setups)
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // After successful Google login, sync user to Bosbase
      if (account?.provider === "google" && user.email) {
        try {
          const bosbaseUserId = await syncUserToBosbase({
            id: user.id || account.providerAccountId,
            email: user.email,
            name: user.name || profile?.name,
            image: user.image || profile?.picture,
          });

          // Store Bosbase user ID in the user object for later use
          if (bosbaseUserId) {
            user.bosbaseUserId = bosbaseUserId;
          }
        } catch (error) {
          console.error("Failed to sync user to Bosbase during sign in:", error);
          // Don't block sign-in if Bosbase sync fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user ID and Bosbase user ID to session
      if (token?.sub) {
        session.user.id = token.sub;
      }
      if (token?.bosbaseUserId) {
        (session.user as any).bosbaseUserId = token.bosbaseUserId;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Store user ID and Bosbase user ID in token
      if (user) {
        token.id = user.id;
        if ((user as any).bosbaseUserId) {
          token.bosbaseUserId = (user as any).bosbaseUserId;
        }
      }
      return token;
    },
  },
});

export const { GET, POST } = handlers;
export { signIn, signOut, auth };

