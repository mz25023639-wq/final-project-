import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paperId } = await req.json();

  const paper = await prisma.generatedPaper.findFirst({
    where: { id: paperId, userId: session.user.id },
  });

  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }

  const saved = await prisma.savedPaper.upsert({
    where: {
      userId_paperId: { userId: session.user.id, paperId },
    },
    update: {},
    create: { userId: session.user.id, paperId },
  });

  return NextResponse.json(saved);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedPaper.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      paper: {
        include: {
          university: { select: { name: true } },
          course: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(saved);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const paperId = searchParams.get("paperId");

  if (!paperId) {
    return NextResponse.json({ error: "paperId required" }, { status: 400 });
  }

  await prisma.savedPaper.deleteMany({
    where: { userId: session.user.id, paperId },
  });

  return NextResponse.json({ success: true });
}
