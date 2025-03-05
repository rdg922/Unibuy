import Link from "next/link";

import { UserItems } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getUserItems.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-white py-2">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="mt-6 text-center text-4xl font-bold tracking-tight text-gray-900">
              uni <span className="text-indigo-600">Buy</span>
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your one-stop shop for all university hand-me-downs.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            {session ? (
              <>
                <p className="text-center text-lg font-medium text-gray-900">
                  Welcome back,{" "}
                  <span className="font-semibold">{session.user?.name}</span>!
                </p>
                <Link
                  href="/api/auth/signout"
                  className="w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <div className="w-full">
                  <p className="mb-4 text-center text-sm font-medium text-gray-700">
                    Get started with your account
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/login"
                      className="rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* API Status */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>{hello ? hello.greeting : "Loading tRPC query..."}</p>
          </div>

          {session?.user && <UserItems />}
        </div>
      </main>
    </HydrateClient>
  );
}
