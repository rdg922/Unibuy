"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Email Verification
          </h2>

          {status === "loading" && (
            <div className="mt-6 text-center">
              <p className="text-lg">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="mt-6 text-center">
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-700">{message}</p>
              </div>
              <Link
                href="/login"
                className="inline-block rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Sign in
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 text-center">
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{message}</p>
              </div>
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
