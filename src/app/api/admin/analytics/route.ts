import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalUsers, activeUsers, totalPapers, topUniversities, topCourses] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isSuspended: false } }),
      prisma.generatedPaper.count(),
      prisma.generatedPaper.groupBy({
        by: ["universityId"],
        _count: true,
        orderBy: { _count: { universityId: "desc" } },
        take: 5,
      }),
      prisma.generatedPaper.groupBy({
        by: ["courseId"],
        _count: true,
        orderBy: { _count: { courseId: "desc" } },
        take: 5,
      }),
    ]);

  const uniIds = topUniversities.map((u) => u.universityId);
  const courseIds = topCourses.map((c) => c.courseId);

  const [universities, courses] = await Promise.all([
    prisma.university.findMany({ where: { id: { in: uniIds } } }),
    prisma.course.findMany({ where: { id: { in: courseIds } } }),
  ]);

  return NextResponse.json({
    totalUsers,
    activeUsers,
    totalPapers,
    topUniversities: topUniversities.map((u) => ({
      name: universities.find((x) => x.id === u.universityId)?.name,
      count: u._count,
    })),
    topCourses: topCourses.map((c) => ({
      name: courses.find((x) => x.id === c.courseId)?.name,
      count: c._count,
    })),
  });
}
