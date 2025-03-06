"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setStatus("error");
        setMessage(
          "Invalid verification link. Please check your email for the correct link.",
        );
        return;
      }

      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");

          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            data.error || "Failed to verify email. The link may have expired.",
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Email Verification
          </h2>
        </div>

        {status === "loading" && (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-md bg-green-50 p-4 text-center">
            <p className="text-sm text-green-700">{message}</p>
            <p className="mt-2 text-sm text-green-700">
              Redirecting to login page...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-md bg-red-50 p-4 text-center">
            <p className="text-sm text-red-700">{message}</p>
            <div className="mt-4">
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Go to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
