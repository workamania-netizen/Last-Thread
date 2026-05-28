import type { APIRoute } from "astro";
import { getProductBySlug } from "../../data/products";

export const prerender = false;

export const GET: APIRoute = async ({ params, request, clientAddress }) => {
  const slug = params.slug ?? "";
  const product = await getProductBySlug(slug);

  if (!product) {
    console.warn(`[outbound] 404 unmapped slug=${slug}`);
    return new Response("Not found", { status: 404 });
  }

  // Authoritative outbound-click log. Client-side tracking is supplementary.
  const referer = request.headers.get("referer") ?? "-";
  const ua = request.headers.get("user-agent") ?? "-";
  console.log(
    `[outbound] slug=${slug} source=${product.source} ip=${clientAddress} referer=${referer} ua="${ua}"`,
  );

  return new Response(null, {
    status: 302,
    headers: {
      Location: product.link,
      "Cache-Control": "no-store",
    },
  });
};
