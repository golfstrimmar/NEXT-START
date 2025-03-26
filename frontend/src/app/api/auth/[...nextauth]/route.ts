import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";

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
    async redirect({ url, baseUrl }) {
      console.log("Redirecting to:", url);
      return `${baseUrl}/auth/set-password`; // Фиксируем перенаправление для теста
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
