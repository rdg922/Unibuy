"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";
import Link from "next/link";

export function Marketplace() {
  const { data: items = [] } = api.item.getAllItems.useQuery();
  const [filter, setFilter] = useState({
    category: "all",
    condition: "all",
  });

  // Filter items based on category and condition
  const filteredItems = items.filter((item) => {
    return (
      (filter.category === "all" || item.category === filter.category) &&
      (filter.condition === "all" || item.condition === filter.condition)
    );
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: "category" | "condition",
  ) => {
    setFilter((prev) => ({ ...prev, [type]: e.target.value }));
  };

  return (
    <div>
      {/* Filtering controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Marketplace</h2>

        <div className="flex flex-wrap gap-3">
          <div>
            <label
              htmlFor="category-filter"
              className="mr-2 text-sm font-medium text-gray-700"
            >
              Category:
            </label>
            <select
              id="category-filter"
              value={filter.category}
              onChange={(e) => handleFilterChange(e, "category")}
              className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="textbooks">Textbooks</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="condition-filter"
              className="mr-2 text-sm font-medium text-gray-700"
            >
              Condition:
            </label>
            <select
              id="condition-filter"
              value={filter.condition}
              onChange={(e) => handleFilterChange(e, "condition")}
              className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Any Condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image container with fixed aspect ratio */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name || "Item image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={false}
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
                    No image available
                  </div>
                )}
              </div>

              {/* Item details */}
              <div className="p-4">
                <Link href={`/items/${item.id}`}>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600">
                    {item.name}
                  </h3>
                </Link>
                <p className="mt-1 text-lg font-semibold text-indigo-600">
                  ${item.price?.toFixed(2)}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {item.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-800">
                    {item.condition}
                  </span>
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-gray-800">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <p className="text-lg text-gray-500">No items match your filters.</p>
          {filter.category !== "all" || filter.condition !== "all" ? (
            <button
              onClick={() => setFilter({ category: "all", condition: "all" })}
              className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Clear filters
            </button>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Check back later for new listings!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
