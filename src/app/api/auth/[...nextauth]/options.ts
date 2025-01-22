import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req: any): Promise<any> {
        await dbConnect();
        console.log(credentials);
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.Identifier },
              { username: credentials.Identifier },
            ],
          });

          if (!user) throw new Error("No user found with this email");

          if (!user.isVerified)
            throw new Error("Please verify your account before login");

          const isPassowrdCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPassowrdCorrect) {
            return user;
          } else {
            throw new Error("Incorrect Password");
          }
        } catch (error: any) {
          console.log("Error: ",error)
          throw new Error(error);
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessage = token.isAcceptingMessage
        session.user.username = token.username
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXT_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};
