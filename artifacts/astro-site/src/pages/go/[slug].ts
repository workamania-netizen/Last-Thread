import type { APIRoute } from "astro";
import { getAffiliateUrl } from "../../data/affiliates";

export const prerender = false;

export const GET: APIRoute = ({ params, request, clientAddress }) => {
  const slug = params.slug ?? "";
  const url = getAffiliateUrl(slug);

  if (!url) {
    console.warn(`[outbound] 404 unmapped slug=${slug}`);
    return new Response("Not found", { status: 404 });
  }

  // Authoritative outbound-click log. Client-side beacon is supplementary.
  const referer = request.headers.get("referer") ?? "-";
  const ua = request.headers.get("user-agent") ?? "-";
  console.log(
    `[outbound] slug=${slug} ip=${clientAddress} referer=${referer} ua="${ua}"`,
  );

  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Cache-Control": "no-store",
    },
  });
};
