import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cookies } from "next/headers";
import { TRPCReactProvider } from "~/trpc/react";

import { Navbar } from "~/app/_components/navbar";
import { auth } from "~/server/auth";

export const metadata = {
  title: "UniBuy",
  description: "Your university marketplace",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <TRPCReactProvider cookies={cookies()}>
          <Navbar session={session} />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
