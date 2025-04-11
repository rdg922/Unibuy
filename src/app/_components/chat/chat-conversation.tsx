"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

interface ChatConversationProps {
  conversationId: number;
  onClose: () => void;
}

export function ChatConversation({
  conversationId,
  onClose,
}: ChatConversationProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], refetch: refetchMessages } =
    api.chat.getMessages.useQuery(
      { conversationId },
      {
        enabled: !!session?.user,
        refetchInterval: 3000, // Refetch every 3 seconds
      },
    );

  const { data: conversationsData, refetch: refetchConversations } =
    api.chat.getConversations.useQuery(undefined, {
      enabled: !!session?.user,
    });

  const conversation = conversationsData?.find((c) => c.id === conversationId);
  const otherUser =
    session?.user?.id === conversation?.buyerId
      ? conversation?.seller
      : conversation?.buyer;

  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: async () => {
      setNewMessage("");
      await refetchMessages();
      await refetchConversations();
    },
  });

  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !session?.user) return;

    sendMessage.mutate({
      conversationId,
      content: newMessage.trim(),
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups: Record<string, typeof messages>, message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {},
  );

  return (
    <div className="flex h-full flex-col">
      {/* Conversation header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
        <button
          onClick={onClose}
          className="mr-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <div className="flex flex-1 items-center space-x-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
            {otherUser?.image ? (
              <Image
                src={otherUser.image}
                alt={otherUser.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-500">
                {otherUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <span className="font-medium">{otherUser?.name || "User"}</span>
        </div>
      </div>

      {/* Conversation messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date} className="mb-4">
            <div className="relative mb-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-gray-500">
                  {date === new Date().toLocaleDateString() ? "Today" : date}
                </span>
              </div>
            </div>

            {groupedMessages[date].map((message) => {
              const isMine = message.senderId === session?.user?.id;

              return (
                <div
                  key={message.id}
                  className={`mb-2 flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  {!isMine && (
                    <div className="mr-2 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                      {message.sender?.image ? (
                        <Image
                          src={message.sender.image}
                          alt={message.sender.name || "User"}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
                          {message.sender?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      isMine
                        ? "bg-indigo-100 text-indigo-900"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="break-words text-sm">{message.content}</p>
                    <p className="mt-1 text-right text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 bg-white p-2">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border-gray-300 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {sendMessage.isPending ? (
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
