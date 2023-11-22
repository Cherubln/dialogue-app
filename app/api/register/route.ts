import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";
import jwt, { verify } from "jsonwebtoken";

const jwtSecretKey = `${process.env.SECRET_KEY}`;

const variations = [
  "neutral",
  "info",
  "success",
  "warning",
  "error",
  "primary",
];

type User = {
  username: string;
  id: string;
  password: string;
  picture: string;
} | null;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const validation = registerSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const hashPassoword = await bcrypt.hash(body.password, 10);
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

  const user: User = await prisma.user.create({
    data: {
      username: body.username,
      password: hashPassoword,
      picture: variations[Math.floor(Math.random() * variations.length)],
    },
  });

  if (user) {
    const { username, id } = user;
    const token = await createToken(id);
    const response = NextResponse.json({ username, id }, { status: 201 });
    response.cookies.set("X-Authorization", `${token}`);
    return response;
  }
  return NextResponse.json(
    { message: "internal server Error" },
    { status: 500 }
  );
};
