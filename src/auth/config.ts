import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { syncUserToBosbase } from "@/lib/bosbase/sync-user";

// NextAuth configuration
export const { handlers, signIn, signOut, auth } = NextAuth({
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
      // The bosbaseUserId will be stored in the token during the jwt callback
      if (account?.provider === "google" && user.email) {
        try {
          await syncUserToBosbase({
            id: user.id || account.providerAccountId,
            email: user.email,
            name: user.name || profile?.name,
            image: user.image || profile?.picture,
          });
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
    async jwt({ token, user, account, trigger }) {
      // Store user ID in token
      if (user) {
        token.id = user.id;
      }

      // On sign in, sync user to Bosbase and store the ID
      if (trigger === "signIn" && account?.provider === "google" && user?.email) {
        try {
          const bosbaseUserId = await syncUserToBosbase({
            id: user.id || account.providerAccountId,
            email: user.email,
            name: user.name || undefined,
            image: user.image || undefined,
          });
          if (bosbaseUserId) {
            token.bosbaseUserId = bosbaseUserId;
          }
        } catch (error) {
          console.error("Failed to sync user to Bosbase during JWT creation:", error);
          // Don't block sign-in if Bosbase sync fails
        }
      }

      return token;
    },
  },
});

