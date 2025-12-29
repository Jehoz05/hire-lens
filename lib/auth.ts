// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import connectDB from "./utils/dbConnect";
import { User } from "./models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        await connectDB();

        // Find user by email
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error(
            "Please use the correct login method for this account"
          );
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(
          credentials.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in");
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          image: user.avatar,
          company: user.company,
          title: user.title,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.company = user.company;
        token.title = user.title;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }

      // Handle session update
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.company = token.company as string;
        session.user.title = token.title as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;

        // Ensure name is set
        if (!session.user.name && token.firstName && token.lastName) {
          session.user.name = `${token.firstName} ${token.lastName}`;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await connectDB();

          // Find existing user
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Extract name from OAuth profile
            const nameParts = user.name?.split(" ") || [];
            const firstName = nameParts[0] || "User";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Generate random password for OAuth users
            const randomPassword =
              Math.random().toString(36).slice(-8) +
              Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Create user using the Model constructor instead of create()
            const newUser = new User({
              email: user.email!,
              firstName: firstName,
              lastName: lastName,
              avatar: user.image,
              authProvider: account.provider,
              providerId: account.providerAccountId,
              isVerified: true,
              role: "candidate",
              password: hashedPassword,
            });

            await newUser.save();
            existingUser = newUser;
          } else if (
            existingUser.authProvider &&
            existingUser.authProvider !== account.provider
          ) {
            // User exists but with different auth provider
            throw new Error(`Please sign in with ${existingUser.authProvider}`);
          }

          // Update the user object that will be passed to JWT
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.company = existingUser.company || "";
          user.title = existingUser.title || "";
          user.firstName = existingUser.firstName;
          user.lastName = existingUser.lastName;

          return true;
        } catch (error: any) {
          console.error("OAuth sign in error:", error);
          throw new Error(error.message || "Failed to sign in with OAuth");
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
