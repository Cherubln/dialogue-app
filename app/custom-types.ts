import { Server as ServerIO } from "socket.io";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};
