import { notFound } from "next/navigation";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Await the params

  if (!id) {
    return notFound();
  }

  // ✅ Fetch the review data
  const reviewResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews/${id}`);
  const review = await reviewResponse.json();

  if (!reviewResponse.ok || !review) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold">Anmeldelse</h1>
      <p className="text-yellow-500">{"★".repeat(review.rating)}</p>
      <p className="italic">{review.comment}</p>
      <p className="text-gray-500 mt-2">Bruker ID: {review.userId}</p>
    </div>
  );
}
