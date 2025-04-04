import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "~/server/db";
import { items } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// In Next.js App Router, we need to handle params properly
export default async function ItemPage({ params }: { params: { id: string } }) {
  try {
    // Convert id to number
    const itemId = parseInt(params.id);

    if (isNaN(itemId)) {
      return notFound();
    }

    // Use direct DB query instead of tRPC in server component
    const item = await db.query.items.findFirst({
      where: eq(items.id, itemId),
      with: {
        user: true,
      },
    });

    if (!item) {
      return notFound();
    }

    // Format the date
    const postedDate = new Date(item.createdAt).toLocaleDateString();

    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Marketplace
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            {/* Item Image */}
            <div className="relative min-h-[300px] overflow-hidden bg-gray-100 sm:min-h-[400px] md:min-h-[500px]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name || "Item image"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                  No image available
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {item.name}
              </h1>

              <div className="mt-2">
                <p className="text-3xl font-bold text-indigo-600">
                  ${item.price?.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Description
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-gray-600">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Condition
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {item.condition}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Category
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {item.category}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Posted
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {postedDate}
                      </dd>
                    </div>

                    {item.user?.name && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Seller
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {item.user.name}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Interested?
                  </h2>
                  <div className="mt-2">
                    <Link
                      href={`/contact?itemId=${item.id}&sellerId=${item.createdById}`}
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Contact Seller
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ItemPage:", error);
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2">Unable to load item details</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }
}
