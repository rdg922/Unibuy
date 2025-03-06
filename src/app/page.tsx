import Link from "next/link";

import { Marketplace } from "~/app/_components/marketplace";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  // Prefetch marketplace items
  await api.item.getAllItems.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50 pb-10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              uni <span className="text-indigo-600">Buy</span>
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Your one-stop shop for all university hand-me-downs
            </p>
          </div>

          {!session && (
            <div className="mb-8 rounded-md bg-white p-6 shadow-sm">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  Join uniBuy to start buying and selling
                </p>
                <div className="mt-4 flex justify-center gap-4">
                  <Link
                    href="/login"
                    className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Marketplace />
        </div>
      </main>
    </HydrateClient>
  );
}
