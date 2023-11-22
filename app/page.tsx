"use client";
import { useAuthContext } from "./auth-provider";
import Chat from "./components/Chat";
import AuthPage from "./components/Auth";

export default function Home() {
  const { username } = useAuthContext();

  if (username) return <Chat />;
  return <AuthPage />;
}
