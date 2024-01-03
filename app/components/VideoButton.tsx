"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { BsFillCameraVideoOffFill } from "react-icons/bs";
import qs from "query-string";

const VideoButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParms = useSearchParams();
  const isVideo = searchParms?.get("video");

  const VideoButton = isVideo
    ? BsFillCameraVideoOffFill
    : BsFillCameraVideoFill;
  const toolTipLabel = isVideo ? "End video call" : "Start video call";

  const url = qs.stringifyUrl(
    {
      url: pathname || "",
      query: {
        video: isVideo ? undefined : true,
      },
    },
    { skipNull: true }
  );
  const handleClick = () => {
    router.push(url);
  };

  return (
    <div
      className="tooltip tooltip-left tooltip-success"
      data-tip={toolTipLabel}
    >
      <button className="btn btn-ghost btn-sm" onClick={handleClick}>
        <VideoButton className="w-6 h-6 text-success" />
      </button>
    </div>
  );
};

export default VideoButton;
