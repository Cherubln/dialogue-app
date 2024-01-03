import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";
import jwt, { verify } from "jsonwebtoken";

const jwtSecretKey = `${process.env.SECRET_KEY}`;

type User = {
  username: string;
  id: string;
  password: string;
} | null;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const validation = registerSchema.safeParse(body);

  try {
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const createToken = (userID: string) => {
      return new Promise((resolve, reject) => {
        jwt.sign(
          { userId: userID },
          jwtSecretKey,
          (err: Error | null, token: string | undefined) => {
            if (err) reject(err);
            resolve(token);
          }
        );
      });
    };

    const existingUser: User = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      body.password,
      existingUser?.password as string
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Incorrect password." },
        { status: 400 }
      );
    }

    const { username, id } = existingUser;
    const token = await createToken(id);
    const response = NextResponse.json({ username, id }, { status: 200 });
    response.cookies.set("X-Authorization", token as string);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  const token = req.cookies.get("X-Authorization");

  if (!token) {
    return NextResponse.json({ message: "not logged in" }, { status: 401 });
  }

  const member = verify(token.value, jwtSecretKey);
  let userId;

  if (typeof member === "string") {
    userId = member;
  } else userId = member.userId;

  const user: User = await prisma.user.findUnique({
    where: {
      id: userId as string,
    },
  });

  if (user) {
    const { username, id } = user;
    return NextResponse.json({ username, id }, { status: 200 });
  }

  return NextResponse.json({ messsage: "User not found" }, { status: 404 });
};
