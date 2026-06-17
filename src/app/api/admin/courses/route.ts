import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, universityId } = await req.json();
  const course = await prisma.course.create({
    data: { name, slug: slugify(name), universityId },
  });

  return NextResponse.json(course);
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const universityId = searchParams.get("universityId");

  const courses = await prisma.course.findMany({
    where: universityId ? { universityId } : undefined,
    orderBy: { name: "asc" },
    include: { university: { select: { name: true } } },
    take: 100,
  });

  return NextResponse.json(courses);
}
