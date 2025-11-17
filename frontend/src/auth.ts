import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    //  Google Sign-In (SSO)
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
    }),

    //  Email/Password via Flask
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing email or password");

        const res = await fetch(
          `${process.env.NEXT_PRIVATE_API_URL || "http://localhost:5000"}/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Login failed:", data);
          throw new Error(data.error || "Invalid credentials");
        }

        //  Return to NextAuth; token will be stored in its own JWT
        return {
          id: data.user_id,
          email: data.email,
          name: data.username,
          role: data.role,
          accessToken: data.token, // Flask JWT
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },

  callbacks: {
    // 🔹 Runs whenever a JWT is created or updated
    async jwt({ token, user, account }) {
      //  Google Sign-In → Exchange for Flask JWT
      if (account?.provider === "google" && user?.email) {
        try {
          const exchangeRes = await fetch(
            `${process.env.NEXT_PRIVATE_API_URL || "http://localhost:5000"}/exchange-token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
              }),
            }
          );

          const data = await exchangeRes.json();
          if (exchangeRes.ok && data.token) {
            token.accessToken = data.token; // Flask-issued JWT
            token.user = data.user;
          } else {
            console.warn(" Token exchange failed:", data);
          }
        } catch (err) {
          console.error(" Error exchanging Google token:", err);
        }
      }

      // ✅ Credentials Login → Attach Flask JWT directly
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }

      return token;
    },

    // 🔹 Build the session object returned to the client
    async session({ session, token }) {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string | undefined;

      if (process.env.NODE_ENV === "development") {
        console.log(" Session built with accessToken:", session.accessToken);
      }

      return session;
    },

    async signIn({ user, account }) {
      // Allow all users (add domain or role checks later if needed)
      return true;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  // Must match Flask Config.SECRET_KEY
  secret: process.env.NEXTAUTH_SECRET!,
});
