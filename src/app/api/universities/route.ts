import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const universities = await prisma.university.findMany({
    where: {
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { city: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 50,
    select: { id: true, name: true, city: true, slug: true },
  });

  return NextResponse.json(universities);
}
