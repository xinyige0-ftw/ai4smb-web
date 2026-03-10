import { checkPlacesLimit } from "@/lib/places-rate-limit";

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return Response.json({ error: "Missing placeId" }, { status: 400 });
  }

  if (!PLACES_KEY) {
    return Response.json({ error: "Places API not configured" }, { status: 500 });
  }

  if (!checkPlacesLimit(1)) {
    return Response.json({ error: "Monthly Google Places limit reached. Please paste reviews manually." }, { status: 429 });
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": PLACES_KEY,
        "X-Goog-FieldMask": "displayName,formattedAddress,rating,userRatingCount,reviews",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || "Failed to fetch reviews" }, { status: 500 });
    }

    const reviews = (data.reviews || []).map((r: Record<string, unknown>) => {
      const author = (r.authorAttribution as Record<string, string>)?.displayName || "Anonymous";
      const text = (r.text as Record<string, string>)?.text || "";
      return {
        author,
        rating: r.rating,
        text,
        time: r.relativePublishTimeDescription,
      };
    });

    return Response.json({
      name: (data.displayName as Record<string, string>)?.text || "",
      address: data.formattedAddress,
      rating: data.rating,
      totalRatings: data.userRatingCount,
      reviews,
    });
  } catch {
    return Response.json({ error: "Failed to fetch place details" }, { status: 500 });
  }
}
