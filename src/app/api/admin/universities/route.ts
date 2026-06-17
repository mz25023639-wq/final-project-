import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  return NextResponse.json(universities);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, city } = await req.json();
  const university = await prisma.university.create({
    data: { name, city, slug: slugify(name) },
  });

  return NextResponse.json(university);
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, name, city, isActive } = await req.json();
  const university = await prisma.university.update({
    where: { id },
    data: {
      ...(name ? { name, slug: slugify(name) } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
    },
  });

  return NextResponse.json(university);
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.university.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
