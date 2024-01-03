import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { deleteSchema } from "@/app/validationSchemas";

export const DELETE = async (req: NextRequest) => {
  const body = await req.json();

  const validation = deleteSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.format() },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.delete({
      where: {
        username: body.username,
      },
    });

    return NextResponse.json(
      { message: "successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
};
