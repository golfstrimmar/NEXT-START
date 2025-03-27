"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register");
      }
      router.push("/auth/signin");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // const handleGoogleSignUp = async () => {
  //   try {
  //     const result = await signIn("google", { redirect: false });
  //     console.log("Google sign-in result:", result); // Добавляем лог результата
  //     if (result?.error) {
  //       setError(result.error);
  //       console.error("Google sign-in error:", result.error); // Лог ошибки
  //     } else {
  //       router.push("/products");
  //     }
  //   } catch (err) {
  //     setError((err as Error).message);
  //     console.error("Unexpected error during Google sign-in:", err); // Лог неожиданной ошибки
  //   }
  // };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 px-4 py-2 border rounded-md w-full"
              required
            />
          </div>
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
            Sign Up
          </button>
          <div className="mt-4 flex items-center">
            <span className=""> Do you already have an account?</span>
            <button
              onClick={() => {
                router.push("/auth/signin");
              }}
              className=" px-4 py-2 font-semibold italic  text-gray-600  hover:text-gray-900 cursor-pointer transition-colors duration-300 ease-in-out"
            >
              signin
            </button>
          </div>
        </form>
        {/* <div className="mt-4">
          <button
            onClick={handleGoogleSignUp}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Up with Google
          </button>
        </div> */}
      </div>
    </div>
  );
}
