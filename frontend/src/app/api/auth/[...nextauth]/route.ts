import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
let db;

(async () => {
  await client.connect();
  db = client.db("shop");
  console.log("Connected to MongoDB");
})();

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
    async signIn({ user, account, profile }) {
      try {
        const usersCollection = db.collection("users");
        const existingUser = await usersCollection.findOne({
          email: user.email,
        });
        if (!existingUser) {
          await usersCollection.insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
            isPasswordSet: false, // Флаг, что пароль не задан
            createdAt: new Date(),
          });
          return "/auth/set-password"; // Перенаправляем на страницу задания пароля
        }
        return true; // Разрешаем вход для существующих пользователей
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Если URL — страница задания пароля, перенаправляем туда
      if (url === "/auth/set-password") {
        return baseUrl + url;
      }
      // Иначе — на /products
      return baseUrl + "/products";
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
