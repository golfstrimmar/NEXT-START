import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";

export const authConfig: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        const user = await User.findOne({ email: credentials?.email });
        if (!user) {
          console.log("No user found for:", credentials?.email);
          return null;
        }

        if (!user.isPasswordSet || !user.password) {
          console.log("User needs to set password:", credentials?.email);
          throw new Error(
            "Please set a password first. Redirecting to /auth/set-password"
          );
        }

        const isPasswordValid = bcrypt.compareSync(
          credentials?.password || "",
          user.password
        );
        if (!isPasswordValid) {
          console.log("Invalid password for:", credentials?.email);
          return null;
        }

        console.log("User authenticated via credentials:", user);
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          googleId: user.googleId,
          isPasswordSet: true,
          role: user.role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const userCount = await User.countDocuments();
          const role = userCount === 0 ? "admin" : "user";

          const newUser = new User({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
            isPasswordSet: false,
            createdAt: new Date(),
            role,
          });
          await newUser.save();
          console.log("New user created with role:", newUser);

          user.id = newUser._id.toString();
          user.googleId = newUser.googleId;
          user.image = newUser.image;
          user.name = newUser.name;
          user.isPasswordSet = newUser.isPasswordSet;
          user.role = newUser.role;
        } else {
          const updateData: any = {};
          if (!existingUser.googleId && account.providerAccountId) {
            updateData.googleId = account.providerAccountId;
          }
          if (!existingUser.image && user.image) {
            updateData.image = user.image;
          }
          if (user.name) {
            updateData.name = user.name;
          }
          if (Object.keys(updateData).length > 0) {
            await User.updateOne({ email: user.email }, { $set: updateData });
            console.log("User updated with Google data:", updateData);

            // Заново получаем пользователя после обновления
            const updatedUser = await User.findOne({ email: user.email });
            if (updatedUser) {
              user.id = updatedUser._id.toString();
              user.googleId = updatedUser.googleId;
              user.image = updatedUser.image;
              user.name = updatedUser.name;
              user.isPasswordSet = updatedUser.isPasswordSet;
              user.role = updatedUser.role;
            }
          } else {
            console.log("No updates needed for existing user:", existingUser);
            user.id = existingUser._id.toString();
            user.googleId = existingUser.googleId;
            user.image = existingUser.image;
            user.name = existingUser.name;
            user.isPasswordSet = existingUser.isPasswordSet;
            user.role = existingUser.role;
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.googleId = user.googleId;
        token.isPasswordSet = user.isPasswordSet;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.googleId = token.googleId;
        session.user.isPasswordSet = token.isPasswordSet;
        session.user.role = token.role;
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      console.log("Sign-out event triggered, token:", token);
    },
  },
  debug: true,
};

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
