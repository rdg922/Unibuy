"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Show message if redirected after registration
  const registered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error.includes("Email not verified")) {
          setError("Please verify your email before signing in.");
        } else {
          setError("Invalid email or password");
        }
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsResendingVerification(true);
    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to resend verification email");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>

        {registered && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Registration successful! Please check your email to verify your
              account before signing in.
            </p>
          </div>
        )}

        {resendSuccess && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Verification email sent. Please check your inbox.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
            {error.includes("verify your email") && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                {isResendingVerification
                  ? "Sending..."
                  : "Resend verification email"}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-t-md border-0 px-3 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-b-md border-0 px-3 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
