"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("<==== session status ====>", status);
    console.log("<==== session ====>", session);
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "loading") {
      setError("Session is still loading, please wait...");
      return;
    }

    if (status !== "authenticated" || !session?.user?.email) {
      setError("User not authenticated");
      return;
    }

    console.log("Sending request to set password:", {
      email: session.user.email,
      password,
    });

    try {
      const response = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, password }),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to set password");
      }

      router.push("/products");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Set Your Password</h1>
        <p className="mb-4">Please set a password to enable email login.</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {status === "loading" && <p className="mb-4">Loading session...</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={status === "loading"}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 cursor-pointer"
          >
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
}
