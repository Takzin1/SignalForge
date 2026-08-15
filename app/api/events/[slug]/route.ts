import { resolveDemoEvent } from "@/src/lib/demo/scenarios";
import { fetchEventBySlug, PolymarketApiError } from "@/src/lib/polymarket/client";
import { toDashboardEvent } from "@/src/lib/polymarket/public";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug || slug.length > 240) {
    return Response.json(
      { ok: false, error: "Invalid event slug." },
      { status: 400 },
    );
  }

  try {
    const curated = new URL(request.url).searchParams.get("curated") === "1";
    const resolved = curated
      ? await resolveDemoEvent(slug)
      : {
          event: await fetchEventBySlug(slug),
          dataSource: "live" as const,
          capturedAt: null,
        };
    const event = toDashboardEvent(resolved.event, {
      dataSource: resolved.dataSource,
      capturedAt: resolved.capturedAt,
    });
    return Response.json(
      { ok: true, event },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof PolymarketApiError
        ? error.message
        : "Could not load this event.";
    return Response.json(
      { ok: false, error: message },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
