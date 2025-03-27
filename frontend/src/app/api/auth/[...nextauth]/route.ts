import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

// Создаём клиент один раз
const client = new MongoClient(process.env.MONGODB_URI!);
let db;

// Функция для инициализации подключения
async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db("shop");
    console.log("Connected to MongoDB");
  }
  return db;
}

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
        const database = await connectToDatabase();
        const usersCollection = database.collection("users");

        const user = await usersCollection.findOne({
          email: credentials?.email,
        });
        if (
          !user ||
          !user.password ||
          !bcrypt.compareSync(credentials?.password || "", user.password)
        ) {
          console.log("Invalid credentials for:", credentials?.email);
          return null;
        }

        console.log("User authenticated via credentials:", user);
        return {
          id: user.googleId || user.email,
          email: user.email,
          name: user.name,
          image: user.image,
          googleId: user.googleId,
          isPasswordSet: true,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        const database = await connectToDatabase();
        const usersCollection = database.collection("users");
        const existingUser = await usersCollection.findOne({
          email: user.email,
        });

        if (!existingUser) {
          // Новый пользователь через Google
          const newUser = {
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
            isPasswordSet: false,
            createdAt: new Date(),
          };
          await usersCollection.insertOne(newUser);
          console.log("New user created:", newUser);
          user.id = newUser.googleId || newUser.email;
          user.googleId = newUser.googleId;
          user.image = newUser.image;
          user.name = newUser.name;
          user.isPasswordSet = newUser.isPasswordSet;
        } else {
          // Пользователь существует, обновляем данные от Google
          const updateData: any = {};
          if (!existingUser.googleId && account.providerAccountId) {
            updateData.googleId = account.providerAccountId;
          }
          if (!existingUser.image && user.image) {
            updateData.image = user.image;
          }
          // Всегда обновляем name из Google
          if (user.name) {
            updateData.name = user.name;
          }
          if (Object.keys(updateData).length > 0) {
            await usersCollection.updateOne(
              { email: user.email },
              { $set: updateData }
            );
            console.log("User updated with Google data:", updateData);
          } else {
            console.log("No updates needed for existing user:", existingUser);
          }
          // Обновляем объект user для передачи в jwt и session
          user.id = existingUser.googleId || existingUser.email;
          user.googleId = updateData.googleId || existingUser.googleId;
          user.image = updateData.image || existingUser.image;
          user.name = updateData.name || existingUser.name;
          user.isPasswordSet = existingUser.isPasswordSet;
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
      }
      console.log("JWT token:", token);
      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.googleId = token.googleId;
        session.user.isPasswordSet = token.isPasswordSet;
      }
      console.log("Session after update:", session);
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
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
