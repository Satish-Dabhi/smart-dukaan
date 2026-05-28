import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { headers, cookies } from "next/headers";

const client = new MongoClient(process.env.MONGODB_URI!);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(client),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        if (user.isVerified === false) {
          throw new Error("EmailUnverified");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          businessId: user.businessId?.toString(),
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "business_owner";
        token.businessId = (user as { businessId?: string }).businessId;
        token.isVerified = (user as { isVerified?: boolean }).isVerified ?? false;
      }
      if (account?.provider === "google") {
        await connectDB();
        let isCustomerAuth = false;
        try {
          const reqHeaders = await headers();
          const referer = reqHeaders.get("referer") || "";

          const cookieStore = await cookies();
          const callbackUrlCookie =
            cookieStore.get("authjs.callback-url")?.value ||
            cookieStore.get("next-auth.callback-url")?.value ||
            cookieStore.get("__Secure-authjs.callback-url")?.value ||
            cookieStore.get("__Secure-next-auth.callback-url")?.value ||
            "";

          isCustomerAuth =
            referer.includes("customer-auth") ||
            referer.includes("role=customer") ||
            callbackUrlCookie.includes("customer-auth") ||
            callbackUrlCookie.includes("role=customer");
        } catch (e) {
          console.error("[AUTH] Failed to read headers/cookies in next/headers", e);
        }

        const existingUser = await User.findOne({ email: token.email });
        const updateFields: {
          isVerified: boolean;
          authProvider: string;
          role?: string;
        } = { isVerified: true, authProvider: "google" };
        if (isCustomerAuth && (!existingUser || existingUser.role === "business_owner")) {
          updateFields.role = "customer";
        }

        // Google has already verified the email — always mark as verified and track provider.
        const dbUser = await User.findOneAndUpdate(
          { email: token.email },
          { $set: updateFields },
          { new: true }
        );
        if (dbUser) {
          token.role = dbUser.role;
          token.businessId = dbUser.businessId?.toString();
          token.isVerified = true;
          token.authProvider = "google";
        } else {
          token.isVerified = true;
          token.authProvider = "google";
        }
      }
      // Re-fetch businessId if not in token (e.g. business created after sign-in)
      if (!token.businessId && token.sub) {
        await connectDB();
        const dbUser = await User.findById(token.sub).select("businessId isVerified");
        if (dbUser) {
          if (dbUser.businessId) {
            token.businessId = dbUser.businessId.toString();
          }
          token.isVerified = dbUser.isVerified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { businessId?: string }).businessId = token.businessId as string;
        (session.user as { isVerified?: boolean }).isVerified = token.isVerified as boolean;
        (session.user as { authProvider?: string }).authProvider = token.authProvider as string;
      }
      return session;
    },
  },
});
