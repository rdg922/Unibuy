"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function UserItems() {
  const { data: items = [] } = api.post.getUserItems.useQuery();
  const utils = api.useUtils();

  // State for new item form
  const [formOpen, setFormOpen] = useState(false);
  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    price: 0,
    condition: "used",
    category: "textbooks",
  });

  const createItem = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setItemData({
        name: "",
        description: "",
        price: 0,
        condition: "used",
        category: "textbooks",
      });
      setFormOpen(false);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setItemData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createItem.mutate(itemData);
  };

  return (
    <div className="mt-8 w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Your University Items</h3>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          {formOpen ? "Cancel" : "Add New Item"}
        </button>
      </div>

      {formOpen && (
        <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-700"
              >
                Item Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={itemData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-xs font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={itemData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="price"
                  className="block text-xs font-medium text-gray-700"
                >
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={itemData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="condition"
                  className="block text-xs font-medium text-gray-700"
                >
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={itemData.condition}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
              disabled={createItem.isPending}
            >
              {createItem.isPending ? "Adding Item..." : "Add Item"}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
        {items.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="p-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="font-medium text-indigo-600">
                        ${item.price?.toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {item.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-2 text-xs">
                      <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-800">
                        {item.condition}
                      </span>
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-gray-800">
                        {item.category}
                      </span>
                      <span className="text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>You haven't listed any items yet.</p>
            <button
              onClick={() => setFormOpen(true)}
              className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Add your first item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
