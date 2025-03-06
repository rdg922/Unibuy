"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  // Check for registered=true query param
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setJustRegistered(true);
    }
  }, [searchParams]);

  const loginMutation = api.auth.login.useMutation({
    onSuccess: async () => {
      try {
        // After tRPC validation succeeds, use NextAuth to create the session
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Authentication failed. Please try again.");
          setIsLoading(false);
        } else {
          // Redirect to homepage on successful login
          router.push("/");
          router.refresh();
        }
      } catch (err) {
        setError("Failed to sign in");
        setIsLoading(false);
      }
    },
    onError: (error) => {
      if (error.message === "EMAIL_NOT_VERIFIED") {
        setShowVerificationNotice(true);
        setError("");
      } else {
        setError(error.message || "Failed to login");
      }
      setIsLoading(false);
    },
  });

  const resendVerificationMutation = api.auth.resendVerification.useMutation({
    onSuccess: () => {
      // Just show a message that email has been sent, regardless of whether user exists
      alert(
        "If an account exists with that email, a verification link has been sent.",
      );
    },
    onError: () => {
      // Generic error to avoid leaking information
      alert(
        "There was a problem sending the verification email. Please try again later.",
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowVerificationNotice(false);
    setIsLoading(true);

    try {
      loginMutation.mutate({ email, password });
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleResendVerification = () => {
    resendVerificationMutation.mutate({ email });
  };

  // Determine if we're in a loading state
  const isLoadingState = isLoading || loginMutation.isLoading;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>

        {justRegistered && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Registration successful! Please check your email for a
              verification link before logging in.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {showVerificationNotice && (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">
              Your email has not been verified. Please check your inbox for a
              verification link.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendVerificationMutation.isLoading}
              className="mt-2 text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
            >
              {resendVerificationMutation.isLoading
                ? "Sending..."
                : "Resend verification email"}
            </button>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
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

          <div className="flex items-center justify-between">
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
              disabled={isLoadingState}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {isLoadingState ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
