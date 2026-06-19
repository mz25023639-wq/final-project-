import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const universityId = searchParams.get("universityId");
  const search = searchParams.get("search") || "";

  if (!universityId) {
    return NextResponse.json({ error: "universityId required" }, { status: 400 });
  }

  const courses = await prisma.course.findMany({
    where: {
      universityId,
      ...(search
        ? { name: { contains: search } }
        : {}),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json(courses);
}
