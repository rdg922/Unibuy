import { redirect } from "next/navigation";
import Link from "next/link";

import { UserItems } from "~/app/_components/items";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { EditableProfileSection } from "~/app/_components/EditableProfileSection";

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
              <EditableProfileSection user={session.user} />
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
