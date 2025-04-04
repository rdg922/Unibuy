"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { ChatConversation } from "./chat-conversation";
import { useRouter } from "next/navigation";

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<number | null>(
    null,
  );
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Query for unread message count
  const { data: unreadData } = api.chat.getUnreadCount.useQuery(undefined, {
    enabled: !!session?.user,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Query for all conversations
  const { data: conversations = [] } = api.chat.getConversations.useQuery(
    undefined,
    {
      enabled: !!session?.user && isOpen,
      refetchInterval: isOpen ? 5000 : false, // Only refetch when drawer is open
    },
  );

  // Check if we should open chat on component mount
  useEffect(() => {
    const shouldOpenChat = localStorage.getItem("openChat") === "true";
    if (shouldOpenChat) {
      setIsOpen(true);
      localStorage.removeItem("openChat");
    }

    // Add click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If not logged in, don't show the chat widget
  if (!session?.user) return null;

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveConversation(null);
    }
  };

  const openConversation = (conversationId: number) => {
    setActiveConversation(conversationId);
  };

  const closeConversation = () => {
    setActiveConversation(null);
  };

  return (
    <>
      {/* Chat button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={toggleDrawer}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 shadow-lg transition duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>

          {/* Unread badge */}
          {unreadData?.count && unreadData.count > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadData.count > 9 ? "9+" : unreadData.count}
            </span>
          ) : null}
        </button>
      </div>

      {/* Chat drawer */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 right-0 z-50 h-[500px] w-80 flex-col rounded-t-lg bg-white shadow-lg transition-transform duration-300 sm:w-96 ${
          isOpen ? "flex" : "hidden translate-y-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-900">
            {activeConversation ? "Messages" : "Conversations"}
          </h3>
          <button
            onClick={toggleDrawer}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
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
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex-1 overflow-y-auto bg-white p-0">
          {activeConversation ? (
            <ChatConversation
              conversationId={activeConversation}
              onClose={closeConversation}
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.length > 0 ? (
                conversations.map((conversation) => {
                  // Determine if current user is buyer or seller
                  const isBuyer = conversation.buyerId === session.user.id;
                  const otherUser = isBuyer
                    ? conversation.seller
                    : conversation.buyer;
                  const itemName = conversation.item?.name || "Item";

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => openConversation(conversation.id)}
                      className={`flex cursor-pointer items-center space-x-3 px-4 py-3 hover:bg-gray-50 ${
                        conversation.unreadCount ? "bg-indigo-50" : ""
                      }`}
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
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

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate font-medium text-gray-900">
                            {otherUser?.name || "User"}
                          </p>
                          {conversation.latestMessage && (
                            <p className="text-xs text-gray-500">
                              {new Date(
                                conversation.latestMessage.createdAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                        <p className="truncate text-sm text-gray-500">
                          {itemName}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {conversation.latestMessage?.content ||
                            "No messages yet"}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {conversation.unreadCount > 0 && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mb-2 h-8 w-8 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                  <p className="text-gray-500">No conversations yet</p>
                  <p className="mt-1 text-sm text-gray-500">
                    When you contact a seller, your conversations will appear
                    here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
