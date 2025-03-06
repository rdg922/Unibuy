import { redirect } from "next/navigation";
import Link from "next/link";

import { UserItems } from "~/app/_components/items";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function UserHomePage() {
  const session = await auth();

  // Redirect to login if user is not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50 pb-10">
        <div className="bg-white shadow">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  My Profile
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account and listed items
                </p>
              </div>
              <Link
                href="/"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-5">
                <div className="flex-shrink-0">
                  {session.user.image ? (
                    <img
                      className="h-16 w-16 rounded-full"
                      src={session.user.image}
                      alt="Profile"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-medium text-indigo-700">
                      {session.user.name?.charAt(0) ??
                        session.user.email?.charAt(0) ??
                        "U"}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {session.user.name}
                  </h2>
                  <p className="text-sm text-gray-500">{session.user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <UserItems />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
