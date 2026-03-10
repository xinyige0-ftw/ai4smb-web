import { checkPlacesLimit } from "@/lib/places-rate-limit";

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return Response.json({ error: "Query too short" }, { status: 400 });
  }

  if (!PLACES_KEY) {
    return Response.json({ error: "Places API not configured" }, { status: 500 });
  }

  if (!checkPlacesLimit(1)) {
    return Response.json({ error: "Monthly Google Places limit reached. Please paste reviews manually." }, { status: 429 });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": PLACES_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 5,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || "Places search failed" }, { status: 500 });
    }

    const results = (data.places || []).map((p: Record<string, unknown>) => ({
      placeId: p.id,
      name: (p.displayName as Record<string, string>)?.text || "",
      address: p.formattedAddress,
      rating: p.rating,
      totalRatings: p.userRatingCount,
    }));

    return Response.json({ results });
  } catch {
    return Response.json({ error: "Failed to search places" }, { status: 500 });
  }
}
