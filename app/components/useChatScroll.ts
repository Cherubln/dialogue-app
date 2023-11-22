import { useState, useEffect } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLElement>;
  bottomRef: React.RefObject<HTMLElement>;
};

export const useChatScroll = ({ chatRef, bottomRef }: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const topDiv = chatRef?.current;
    const bottomDiv = bottomRef?.current;

    const shouldAutoScroll = () => {
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }

      if (!topDiv) return false;

      const scrollDistance =
        topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
      return scrollDistance <= 100;
    };

    let timeID: NodeJS.Timeout;

    if (shouldAutoScroll()) {
      timeID = setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
    return () => {
      clearTimeout(timeID);
    };
  }, [bottomRef, chatRef, hasInitialized]);
};
