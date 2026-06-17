import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const templates = await prisma.aiPromptTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, template, isActive } = await req.json();

  const updated = await prisma.aiPromptTemplate.update({
    where: { id },
    data: {
      ...(template ? { template } : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
    },
  });

  return NextResponse.json(updated);
}
