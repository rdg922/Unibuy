"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="mt-8 w-full">
      <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 text-center text-gray-700 shadow-sm">
        {latestPost ? (
          <p className="truncate">
            Your most recent post:{" "}
            <span className="font-medium">{latestPost.name}</span>
          </p>
        ) : (
          <p>You have no posts yet.</p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-3"
      >
        <div className="rounded-md shadow-sm">
          <input
            type="text"
            placeholder="What's on your mind?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Posting..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
