"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("itemId");
  const sellerId = searchParams.get("sellerId");

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const startConversation = api.chat.startConversation.useMutation({
    onSuccess: () => {
      router.push("/");
      // This will trigger the chat drawer to open from localStorage
      localStorage.setItem("openChat", "true");
      localStorage.setItem("chatJustStarted", "true");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemId || !sellerId || !message.trim()) return;

    setIsSending(true);

    try {
      await startConversation.mutateAsync({
        sellerId,
        itemId: parseInt(itemId),
        initialMessage: message.trim(),
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
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
