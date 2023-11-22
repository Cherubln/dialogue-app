import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, res: NextResponse) => {
  const { participantOneId, participantTwoId } = await req.json();
  const chat = await findOrCreateChat(participantOneId, participantTwoId);

  if (!chat) {
    return NextResponse.json({ error: "chat not found" }, { status: 404 });
  }
  return NextResponse.json(chat, { status: 200 });
};

const findOrCreateChat = async (
  participantOneId: string,
  participantTwoId: string
) => {
  let chat =
    (await findChat(participantOneId, participantTwoId)) ||
    (await findChat(participantTwoId, participantOneId));

  if (!chat) {
    chat = await createChat(participantOneId, participantTwoId);
  }

  return chat;
};

const findChat = async (participantOneId: string, participantTwoId: string) => {
  try {
    return await prisma.chat.findFirst({
      where: {
        AND: [
          { participantOneId: participantOneId },
          { participantTwoId: participantTwoId },
        ],
      },
      include: {
        participantOne: { include: { messages: true } },
        participantTwo: { include: { messages: true } },
      },
    });
  } catch (error) {
    return null;
  }
};

const createChat = async (
  participantOneId: string,
  participantTwoId: string
) => {
  try {
    return await prisma.chat.create({
      data: {
        participantOneId,
        participantTwoId,
      },
      include: {
        participantOne: { include: { messages: true } },
        participantTwo: { include: { messages: true } },
      },
    });
  } catch (error) {
    return null;
  }
};
