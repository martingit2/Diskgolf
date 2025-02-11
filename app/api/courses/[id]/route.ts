import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ Await params just like your review page

  if (!id) {
    return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("❌ Prisma error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
export async function generateStaticParams() {
    return [];
  }