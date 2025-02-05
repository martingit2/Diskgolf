import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 🔥 Fix variable redeclaration issues
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    console.error("❌ No authenticated user:", error);
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  // 📌 Parse request body properly
  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("❌ Invalid JSON:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { courseId, rating, comment } = body;

  if (!courseId || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ✅ Save review in database (Assuming Supabase)
  const { error: insertError } = await supabase
    .from("reviews")
    .insert([{ course_id: courseId, rating, comment, user_id: user.id }]);

  if (insertError) {
    console.error("❌ Error saving review:", insertError);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }

  return NextResponse.json({ message: "Review submitted successfully!" }, { status: 201 });
}
