"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import ModalMessage from "@/components/ModalMessage/ModalMessage";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("Session on client:", session);
      if (!session.user.isPasswordSet) {
        setError("Password not set, redirecting to set-password");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          setError("");
          router.push("/auth/set-password");
        }, 1500);
      } else {
        setError("Sign-in successful, redirecting to profile");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          setError("");
          router.push("/profile");
        }, 1500);
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Sign-in result:", result); // Добавляем отладку

      if (result?.error) {
        if (result.error.includes("set a password")) {
          setError("Please set a password first, redirecting...");
          setShowModal(true);
          setTimeout(() => {
            setShowModal(false);
            setError("");
            router.push("/auth/set-password");
          }, 1500);
        } else {
          setError("Invalid email or password");
          setShowModal(true);
          setTimeout(() => {
            setShowModal(false);
            setError("");
          }, 1500);
        }
      } else {
        setError("Sign-in successful, waiting for session...");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          setError("");
        }, 1500);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError((err as Error).message);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", { redirect: false });
      if (result?.error) {
        setError(result.error);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          setError("");
        }, 1500);
      }
    } catch (err) {
      setError((err as Error).message);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        {error && <ModalMessage message={error} open={showModal} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block  font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 px-4 py-2 border rounded-md w-full"
              required
            />
          </div>
          <div>
            <label className="block  font-medium text-gray-700">Password</label>
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
            className=" px-4 py-2 font-semibold italic text-gray-600 hover:text-gray-900 cursor-pointer transition-colors duration-300 ease-in-out"
          >
            signup
          </button>
        </div>
      </div>
    </div>
  );
}
