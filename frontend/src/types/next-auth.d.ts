import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    accessToken?: string;
  }

  interface Session extends DefaultSession {
    user?: {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    };
    accessToken?: string;
  }

  interface JWT {
    user?: {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    };
    accessToken?: string;
  }
}
