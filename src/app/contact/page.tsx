"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("itemId");
  const sellerId = searchParams.get("sellerId");

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, you would send this message to your backend
    console.log("Message sent:", {
      itemId,
      sellerId,
      message,
    });

    setIsSending(false);
    setIsSent(true);
  };

  if (!itemId || !sellerId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Missing Information
          </h1>
          <p className="mt-2 text-gray-600">
            Unable to contact seller. Missing item or seller information.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (isSent) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Message sent successfully
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your message has been sent to the seller. They will contact
                  you soon.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                >
                  Return to Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900">Contact Seller</h2>
        <p className="mt-2 text-gray-600">
          Send a message to the seller about this item.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm interested in this item. Is it still available?"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Link
              href={`/items/${itemId}`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
