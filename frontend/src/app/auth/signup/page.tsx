"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalMessage from "@/components/ModalMessage/ModalMessage";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
      return;
    }

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
      setError("Registration successful, waiting for session...");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
        router.push("/auth/signin");
      }, 1500);
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
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

        {error && <ModalMessage message={error} open={showModal} />}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block  font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 px-4 py-2 border rounded-md w-full"
              required
            />
          </div>
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
      </div>
    </div>
  );
}
