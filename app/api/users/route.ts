import prisma from "@/prisma/client";
import { NextResponse, NextRequest } from "next/server";
import jwt, { verify } from "jsonwebtoken";

const jwtSecretKey = `${process.env.SECRET_KEY}`;

export const GET = async (req: NextRequest) => {
  const token = req.cookies.get("X-Authorization")?.value;
  if (!token) {
    return NextResponse.json({ message: "not authorized" }, { status: 401 });
  }

  const member = verify(token, jwtSecretKey);

  let userId;

  if (typeof member === "string") {
    userId = member;
  } else userId = member.userId;

  const users = await prisma.user.findMany({
    where: {
      NOT: {
        id: userId,
      },
    },
    orderBy: {
      username: "asc",
    },
  });
  return NextResponse.json(users, { status: 200 });
};
