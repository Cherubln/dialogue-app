import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "./socket-provider";
import { UserContextProvider } from "./auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dialogue",
  description:
    "A chat platform that allows users to create and join chat with different topics and participants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserContextProvider>
          <SocketProvider>{children}</SocketProvider>
        </UserContextProvider>
      </body>
    </html>
  );
}
