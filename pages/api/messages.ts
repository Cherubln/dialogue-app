import { NextApiResponseServerIO } from "@/app/custom-types";
import prisma from "@/prisma/client";
import jwt, { verify } from "jsonwebtoken";
import { NextApiRequest } from "next";
const jwtSecretKey = `${process.env.SECRET_KEY}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed." });
  }

  try {
    const token = req.cookies["X-Authorization"];
    if (!token) {
      throw "error";
    }
    const member = verify(token, jwtSecretKey);
    let userId;

    if (typeof member === "string") {
      userId = member;
    } else userId = member.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const { message, fileUrl } = req.body;
    const { chatID } = req.query;

    if (!user) return res.status(401).json({ error: "Not authorized" });
    if (!chatID) return res.status(400).json({ error: "Chat ID missing" });
    if (!message) return res.status(400).json({ error: "Message missing" });

    const createdMessage = await prisma.message.create({
      data: {
        content: message,
        chatId: chatID as string,
        authorId: user.id,
        fileUrl,
      },
      include: {
        author: {
          include: {
            messages: true,
          },
        },
      },
    });

    const chatKey = `chat:${chatID}:messages`;

    res?.socket?.server?.io?.emit(chatKey, createdMessage);

    return res.status(201).json(createdMessage);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: "Internal server error" });
  }
}
