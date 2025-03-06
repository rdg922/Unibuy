"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Session } from "next-auth";

export function Navbar({ session }: { session: Session | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                uniBuy
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link
              href="/"
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isActive("/")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Home
            </Link>
            {session ? (
              <>
                <Link
                  href="/user"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    isActive("/user")
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  My Profile
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    isActive("/login")
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu (3 horizontal lines) */}
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              href="/"
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                isActive("/")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            {session ? (
              <>
                <Link
                  href="/user"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isActive("/user")
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isActive("/login")
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block rounded-md px-3 py-2 text-base font-medium text-indigo-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
