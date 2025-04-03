import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const { GITHUB_ID, GITHUB_SECRET } = process.env;

// Create a mock session for development
const createMockSession = () => ({
  user: {
    id: "dev-user-id",
    email: process.env.CLOUDFLARE_EMAIL || "dev@example.com",
    name: "Development User",
    image: "https://github.com/identicons/development.png",
    emailVerified: new Date()
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});

// Create a custom auth function that returns mock session in development
const customAuth = async () => {
  if (process.env.NODE_ENV === "development") {
    console.log("Development mode: Returning mock session");
    return createMockSession();
  }
  console.log("Production mode: Using real auth");
  return baseAuth();
};

export const { auth: baseAuth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: GITHUB_ID!,
      clientSecret: GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === "development") {
        return createMockSession();
      }

      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

// Export the custom auth function
export const auth = customAuth;
