import { notFound } from "next/navigation";
import React from "react";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  console.log("🔍 Received params:", params);

  // ✅ Await params because it's a Promise in Next.js 15
  const { id } = await params;

  if (!id) {
    console.log("❌ Missing params.id, returning 404");
    return notFound();
  }

  try {
    // ✅ Fetch course data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const courseResponse = await fetch(`${baseUrl}/api/courses/${id}`);

    if (!courseResponse.ok) {
      console.log("❌ Course not found in API");
      return notFound();
    }

    const course = await courseResponse.json();

    // ✅ Fetch reviews for this course
    const reviewsResponse = await fetch(`${baseUrl}/api/reviews?course_id=${id}`);

    if (!reviewsResponse.ok) {
      console.log("❌ Reviews not found");
      return notFound();
    }

    const reviews = await reviewsResponse.json();

    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold">{course.name}</h1>
        <p className="text-gray-600">{course.location}</p>
        <p className="mt-2">{course.description}</p>

        {/* Review Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Anmeldelser</h2>

          {reviews.length > 0 ? (
            <div className="mt-4 space-y-4">
              {reviews.map((review: { id: string; rating: number; comment: string }) => (
                <div key={review.id} className="border rounded p-4 shadow-md">
                  <p className="text-yellow-500">{"★".repeat(review.rating)}</p>
                  <p className="italic">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">Ingen anmeldelser enda.</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Error fetching course or reviews:", error);
    return notFound();
  }
}
export async function generateStaticParams() {
  return [];
}
