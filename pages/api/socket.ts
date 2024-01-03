import { Server as ServerIO } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/app/custom-types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log("Socket running");
  } else {
    console.log("Socket initializing");
    const io = new ServerIO(res.socket.server as any, {
      path: "/api/socket",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default socketHandler;
