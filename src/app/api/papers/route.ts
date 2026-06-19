import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGuessPaper } from "@/lib/ai";
import type { GuessPaperContent } from "@/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { universityId, courseId } = await req.json();

    const [university, course, template] = await Promise.all([
      prisma.university.findUnique({ where: { id: universityId } }),
      prisma.course.findUnique({ where: { id: courseId } }),
      prisma.aiPromptTemplate.findFirst({ where: { isActive: true } }),
    ]);

    if (!university || !course) {
      return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
    }

    const content = await generateGuessPaper(
      university.name,
      course.name,
      template?.template || ""
    );

    const title = `${university.name} - ${course.name} Guess Paper`;

    const paper = await prisma.generatedPaper.create({
      data: {
        userId: session.user.id,
        universityId,
        courseId,
        title,
        content: content as object,
        promptUsed: template?.name,
        status: "COMPLETED",
      },
      include: {
        university: { select: { name: true } },
        course: { select: { name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "GENERATE_PAPER",
        metadata: { paperId: paper.id, university: university.name, course: course.name },
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Guess Paper Ready",
        message: `Your ${course.name} guess paper for ${university.name} has been generated.`,
      },
    });

    return NextResponse.json({
      id: paper.id,
      title: paper.title,
      content: paper.content as unknown as GuessPaperContent,
      createdAt: paper.createdAt,
      university: paper.university,
      course: paper.course,
    });
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const papers = await prisma.generatedPaper.findMany({
    where: {
      userId: session.user.id,
      ...(search
        ? { title: { contains: search } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      university: { select: { name: true } },
      course: { select: { name: true } },
      savedBy: { where: { userId: session.user.id }, select: { id: true } },
    },
  });

  return NextResponse.json(papers);
}
