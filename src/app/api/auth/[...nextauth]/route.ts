import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/utils/dbConnect";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email first");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        // Update last login
        await User.updateOne(
          { _id: user._id },
          { $set: { lastLogin: new Date() } }
        );

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user from Google
            const newUser = new User({
              email: user.email,
              firstName: user.name?.split(" ")[0] || "",
              lastName: user.name?.split(" ")[1] || "",
              role: "candidate", // Default role
              avatar: user.image,
              isVerified: true,
              password: await bcrypt.hash(Math.random().toString(36), 10),
            });

            await newUser.save();
          }

          return true;
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };