import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import UserData from "@/models/UserData";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectToDatabase();
        const user = await UserData.findOne({ clerkUserId: credentials.email });

        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await UserData.create({
            clerkUserId: credentials.email,
            password: hashedPassword,
            wallet: 0,
            tasks: [],
            history: [],
            countdowns: [],
            customGoals: [],
            inventory: []
          });
          return { id: newUser._id.toString(), email: newUser.clerkUserId };
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        return { id: user._id.toString(), email: user.clerkUserId };
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      return session;
    }
  }
};