/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useAuthContext } from "../auth-provider";
import classNames from "classnames";
import { usePathname, useRouter } from "next/navigation";
import qs from "query-string";

interface VideoProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  videoOn: boolean;
}
const Video = ({ chatId, video, audio, videoOn }: VideoProps) => {
  const { username } = useAuthContext();
  const [token, setToken] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (username) {
      (async () => {
        try {
          const resp = await fetch(
            `/api/video?room=${chatId}&username=${username}`
          );
          const data = await resp.json();
          setToken(data.token);
        } catch (e) {
          console.error(e);
        }
      })();
    }
    const url = qs.stringifyUrl(
      {
        url: pathname || "",
        query: {
          video: undefined,
        },
      },
      { skipNull: true }
    );
    return () => {
      router.push(url);
    };
  }, [chatId, username]);

  if (token === "")
    return (
      <div className="flex justify-center items-center">
        <span className="loading loading-infinity loading-lg text-primary" />
      </div>
    );

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      video={video}
      audio={audio}
      token={token}
      connect={true}
      className={classNames({
        "hidden ": !videoOn,
      })}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

export default Video;
