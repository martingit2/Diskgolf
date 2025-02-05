import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Make sure we extract values from `body`
    const courseId = body.courseId;
    const rating = body.rating;
    const comment = body.comment;

    // 🔍 Fetch authenticated user
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.id) {
      console.error("❌ Authentication Failed: No user found.");
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // ✅ Debugging Log
    console.log("📩 Review Data Received:", { courseId, rating, comment, user });

    // ✅ Save the review in Supabase (Prisma)
    const review = await prisma.review.create({
      data: {
        id: crypto.randomUUID(),
        courseId, // Matches `text` type in Supabase
        userId: user.id, // Matches `text` type in Supabase
        rating,
        comment,
        createdAt: new Date(),
      },
    });

    console.log("✅ Review Successfully Saved:", review);
    return NextResponse.json(review);
  } catch (error) {
    console.error("❌ Error Saving Review:", error);
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }
}
