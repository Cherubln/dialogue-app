"use client";

import { createContext, PropsWithChildren, useContext, useState } from "react";

export type Message = {
  id: string;
  content: string;
  chatId?: string;
  authorId?: string;
  username?: string;
  createdAt: string | number | Date;
};

type UserContextType = {
  username: string | null;
  id: string | null;
  setUsername: (arg: string) => void;
  setId: (arg: string) => void;
  setMessages: (arg: any) => void;
  messages: Message[];
};
const UserContext = createContext<UserContextType>({
  username: null,
  id: null,
  setId: (string) => {},
  setUsername: (string) => {},
  setMessages: (arg) => {},
  messages: [],
});

export const useAuthContext = () => useContext(UserContext);

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [username, setUsername] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <UserContext.Provider
      value={{ username, setUsername, setId, id, messages, setMessages }}
    >
      {children}
    </UserContext.Provider>
  );
};
