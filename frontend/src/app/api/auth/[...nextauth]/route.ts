import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
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
          return null; // Неверный email или пароль
        }

        console.log("User authenticated via credentials:", user);
        return {
          id: user.googleId || user.email, // id обязателен для NextAuth
          email: user.email,
          name: user.name,
          googleId: user.googleId,
          isPasswordSet: true, // Всегда true для логина по паролю
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
        } else {
          console.log("Existing user found:", existingUser);
        }
        return true; // Продолжаем процесс создания сессии
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      console.log("Session created:", session);
      console.log("Token:", token);
      const database = await connectToDatabase();
      const usersCollection = database.collection("users");
      const user = await usersCollection.findOne({ email: session.user.email });

      if (user) {
        session.user.googleId = user.googleId;
        session.user.isPasswordSet = user.isPasswordSet;
      }
      return session;
    },
    // async redirect({ url, baseUrl }) {
    // if (url === `${baseUrl}/`) {
    //   console.log("Sign-out detected, redirecting to:", url);
    //   return url;
    // }
    // console.log("Sign-in flow, redirecting to /auth/set-password");
    // return `${baseUrl}/products`;
    // },
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
