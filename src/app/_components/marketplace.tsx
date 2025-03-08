"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function Marketplace() {
  const { data: items = [], isLoading } = api.item.getAllItems.useQuery();

  const [filter, setFilter] = useState({
    category: "all",
    condition: "all",
  });
  const [sort, setSort] = useState("newest");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "textbooks", label: "Textbooks" },
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "clothing", label: "Clothing" },
    { value: "supplies", label: "School Supplies" },
    { value: "other", label: "Other" },
  ];

  const conditions = [
    { value: "all", label: "Any Condition" },
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
  ];

  const sortOptions = [
    {
      value: "newest",
      label: "Newest",
      sortFunction: (a: any, b: any) => b.createdAt - a.createdAt,
    },
    {
      value: "oldest",
      label: "Oldest",
      sortFunction: (a: any, b: any) => a.createdAt - b.createdAt,
    },
    {
      value: "price-asc",
      label: "Price: Low to High",
      sortFunction: (a: any, b: any) => a.price - b.price,
    },
    {
      value: "price-desc",
      label: "Price: High to Low",
      sortFunction: (a: any, b: any) => b.price - a.price,
    },
  ];

  // Filter items based on selected filters and sort by selected sort option
  const filteredItems = items
    .filter((item) => {
      return (
        (filter.category === "all" || item.category === filter.category) &&
        (filter.condition === "all" || item.condition === filter.condition)
      );
    })
    .sort(sortOptions.find((option) => option.value === sort)?.sortFunction);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="mb-6 text-2xl font-bold">Marketplace</h2>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-md bg-white p-4 shadow-sm">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="condition"
            className="block text-sm font-medium text-gray-700"
          >
            Condition
          </label>
          <select
            id="condition"
            value={filter.condition}
            onChange={(e) =>
              setFilter({ ...filter, condition: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            {conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="sort"
            className="block text-sm font-medium text-gray-700"
          >
            Sort by
          </label>
          <select
            id="sort"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg bg-white shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <p className="font-medium text-indigo-600">
                    ${item.price?.toFixed(2)}
                  </p>
                </div>
                <p className="mt-1 line-clamp-3 text-sm text-gray-500">
                  {item.description}
                </p>
                <div className="mt-4 flex justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-800">
                      {item.condition}
                    </span>
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-gray-800">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3">
                <div className="text-sm text-gray-600">
                  Listed by:{" "}
                  <span className="font-semibold">
                    {item.user?.name || "Anonymous"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md bg-white p-6 text-center shadow">
          <p className="text-lg text-gray-500">
            No items found matching your filters.
          </p>
          <button
            onClick={() => setFilter({ category: "all", condition: "all" })}
            className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
