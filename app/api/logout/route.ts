import { NextRequest, NextResponse } from "next/server";

export const GET = (req: NextRequest) => {
  const response = NextResponse.json(
    { message: "successfully logged out" },
    { status: 200 }
  );
  response.cookies.delete("X-Authorization");
  return response;
};
