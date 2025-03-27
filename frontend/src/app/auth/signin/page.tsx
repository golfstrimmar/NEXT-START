"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { set } from "mongoose";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession(); // Получаем сессию и статус

  // Проверяем сессию после входа
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("Session on client:", session);
      // Если пароль не установлен, перенаправляем на страницу установки пароля
      if (session.user.isPasswordSet === false) {
        console.log("Password not set, redirecting to set-password");
        router.push("/auth/set-password");
      } else {
        console.log("Password is set, redirecting to products");
        router.push("/products");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Остаёмся на странице, редирект в useEffect
      });

      if (result?.error) {
        setError("Invalid email or password");
        console.log("Sign-in error:", result.error);
      } else {
        console.log("Sign-in successful, waiting for session...");
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Unexpected error during sign-in:", err);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", { redirect: true });
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Unexpected error during Google sign-in:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 px-4 py-2 border rounded-md w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 px-4 py-2 border rounded-md w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
          >
            Sign In with Google
          </button>
        </div>
        <div className="mt-4 flex items-center">
          <span className=""> Don't have an account yet?</span>
          <button
            onClick={() => {
              router.push("/auth/signup");
            }}
            className=" px-4 py-2 font-semibold italic  text-gray-600  hover:text-gray-900 cursor-pointer transition-colors duration-300 ease-in-out"
          >
            signup
          </button>
        </div>
      </div>
    </div>
  );
}
