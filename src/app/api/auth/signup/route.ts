import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
import { avatarUrl } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { fullName, fatherName, cnic, email, password, profileImage } =
      parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { cnic }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email or CNIC already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        fatherName,
        cnic,
        email,
        passwordHash,
        profileImage: profileImage || avatarUrl(email),
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome!",
        message: "Your account has been created successfully. Start generating guess papers!",
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
