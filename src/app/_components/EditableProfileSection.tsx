"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface EditableProfileSectionProps {
  user: Session["user"];
}

export function EditableProfileSection({ user }: EditableProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Fetch the latest user data from the server
  const { data: currentUser, refetch } = api.auth.getCurrentUser.useQuery();

  // Use the server data if available, otherwise fallback to session data
  const displayName = currentUser?.name ?? user.name ?? "";
  const [name, setName] = useState(displayName);

  // Update the input field if server data changes
  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser?.name]);

  const updateName = api.auth.updateName.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      // Refetch the user profile to get the updated name
      void refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateName.mutate({ name });
  };

  return (
    <div className="flex items-center space-x-5">
      <div className="flex-shrink-0">
        {user.image ? (
          <img
            className="h-16 w-16 rounded-full"
            src={user.image}
            alt="Profile"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-medium text-indigo-700">
            {displayName.charAt(0) ?? user.email?.charAt(0) ?? "U"}
          </div>
        )}
      </div>
      <div className="flex-grow">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Your name"
                required
                minLength={2}
                maxLength={100}
              />
              <div className="ml-3 flex space-x-2">
                <button
                  type="submit"
                  disabled={updateName.isLoading}
                  className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  {updateName.isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name || "");
                  }}
                  className="rounded bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
            {updateName.error && (
              <p className="mt-1 text-sm text-red-600">
                {updateName.error.message}
              </p>
            )}
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-4 rounded bg-white px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Edit name
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
