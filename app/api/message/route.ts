import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const chatID = searchParams.get("chatID");

  try {
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatID as string,
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
