import { useState, useLayoutEffect } from "react";
import { useAuthContext } from "../auth-provider";

type ChatScrollProps = {
  bottomRef: React.RefObject<HTMLElement>;
};

export const useChatScroll = ({ bottomRef }: ChatScrollProps) => {
  const { messages } = useAuthContext();

  useLayoutEffect(() => {
    const bottomDiv = bottomRef?.current;

    bottomDiv?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
};
