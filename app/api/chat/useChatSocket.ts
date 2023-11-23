/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useAuthContext } from "@/app/auth-provider";
import { useSocket } from "@/app/socket-provider";
import prisma from "@/prisma/client";
import { useEffect } from "react";

type Message = typeof prisma.message & {
  author: typeof prisma.user;
};

export const useChatSocket = (addKey: string) => {
  const { socket } = useSocket();
  const { setMessages } = useAuthContext();

  useEffect(() => {
    if (!socket) return;

    socket.on(addKey, (message: Message) => {
      setMessages((messages: Message[]) => [...messages, message]);
    });
    console.log(socket);
    return () => {
      socket.off(addKey);
    };
  }, [socket, addKey]);
};
