// Catalog data + accessor. This is the SINGLE SWAP POINT for moving off
// the in-repo seed and onto Scout's /api/products endpoint. When that's
// live, replace `getCatalog`'s body with a fetch (+ cache + fallback);
// everything else (PDP route, /go redirect, homepage rails) calls
// `getCatalog` and stays put.

export type ProductSource =
  | "amazon"
  | "etsy"
  | "ebay"
  | "printify"
  | "printful"
  | "other";

export interface Product {
  slug: string;
  name: string;
  source: ProductSource;
  price: number | null;
  description: string;
  link: string;
  imageUrl: string | null;
  sections: string[];
  sortOrder: number;
}

export interface Section {
  id: string;
  name: string;
  order: number;
}

// Empty section names are intentional — no public labels at launch.
// Jonathan edits this file (or, post-Scout, this becomes API-backed).
const sections: Section[] = [
  { id: "section-1", name: "", order: 1 },
  { id: "section-2", name: "", order: 2 },
  { id: "section-3", name: "", order: 3 },
];

const products: Product[] = [
  {
    slug: "ragg-wool-cabin-socks",
    name: "Ragg wool cabin socks",
    source: "amazon",
    price: 24,
    description:
      "Cream with brown flecks. The kind of sock he'll wear through, eventually, and ask you to find more of.",
    link: "https://amazon.com/s?k=ragg+wool+cabin+socks+men",
    imageUrl:
      "https://images.unsplash.com/photo-1591193686104-fddba4d0f9ef?w=900&q=80&fm=jpg",
    sections: ["section-1"],
    sortOrder: 1,
  },
  {
    slug: "opinel-no-8-pocket-knife",
    name: "Opinel No. 8 pocket knife",
    source: "amazon",
    price: 22,
    description:
      "Wooden handle, carbon steel. Lives in his front pocket. Opens packages, sandwich bags, fishing line. Does not pretend to be tactical.",
    link: "https://amazon.com/s?k=opinel+no+8+pocket+knife",
    imageUrl:
      "https://images.unsplash.com/photo-1589216532372-1c2a367900d9?w=900&q=80&fm=jpg",
    sections: ["section-1"],
    sortOrder: 2,
  },
  {
    slug: "horween-leather-watch-strap",
    name: "Horween leather watch strap",
    source: "etsy",
    price: 48,
    description:
      "Replaces the cracked rubber thing on the watch he's been wearing since 2014. Makes a fifteen-year-old watch look new.",
    link: "https://etsy.com/search?q=horween+leather+watch+strap+20mm",
    imageUrl:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80&fm=jpg",
    sections: ["section-1"],
    sortOrder: 3,
  },
  {
    slug: "lodge-cast-iron-skillet",
    name: "Lodge cast iron skillet, 12-inch",
    source: "amazon",
    price: 30,
    description:
      "Twelve inches across. Pre-seasoned. Outlasts both of you. If he already has one, get him a bigger one.",
    link: "https://amazon.com/s?k=lodge+cast+iron+skillet+12+inch",
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80&fm=jpg",
    sections: ["section-2"],
    sortOrder: 1,
  },
  {
    slug: "waxed-canvas-dopp-kit",
    name: "Waxed canvas dopp kit",
    source: "etsy",
    // Handmade, price varies by maker. Will surface once we pin the
    // exact listing — empty-state by design, not by accident.
    price: null,
    description:
      "Leather trim, brass zipper. Replaces the gallon Ziploc he's been using since the Obama administration. Looks better the more it gets thrown in suitcases.",
    link: "https://etsy.com/search?q=waxed+canvas+dopp+kit+leather",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80&fm=jpg",
    sections: ["section-2"],
    sortOrder: 2,
  },
  {
    slug: "brass-bottle-opener",
    name: "Solid brass bottle opener",
    source: "other",
    price: 18,
    description:
      "Heavy. Patinas with use. Opens roughly ten thousand of them before it shows much wear. Won't disappear into a drawer — it's too nice for that.",
    link: "https://example.com/brass-bottle-opener-listing",
    // No product photo yet — small workshop, hasn't shot it. Card and PDP
    // must render cleanly without an image.
    imageUrl: null,
    sections: ["section-2"],
    sortOrder: 3,
  },
  {
    slug: "enamel-camp-mug-set",
    name: "Enamel camp mug, set of two",
    source: "amazon",
    price: 24,
    description:
      "Two mugs. Chip but don't crack. The way coffee is supposed to taste outside, in March, before the sun's all the way up.",
    link: "https://amazon.com/s?k=enamel+camp+mug+set",
    imageUrl:
      "https://images.unsplash.com/photo-1485217988980-11786ced9454?w=900&q=80&fm=jpg",
    sections: ["section-3"],
    sortOrder: 1,
  },
  {
    slug: "last-thread-field-tee",
    name: "Last Thread field tee",
    source: "printify",
    // Stage-2 branded merch placeholder. Price is set on Printify side;
    // shown here as null until we wire it up.
    price: null,
    description:
      "Heavyweight, garment-dyed cotton. The kind of shirt he'll wear until you can see his elbows through it. Cut a hair longer in the body so it actually stays tucked.",
    link: "https://lastthread.printify.me/products/field-tee",
    imageUrl:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&q=80&fm=jpg",
    sections: ["section-3"],
    sortOrder: 2,
  },
];

/**
 * THE SINGLE SWAP POINT.
 *
 * For launch this returns the in-repo seed. When Scout's /api/products
 * endpoint is live, swap this body to fetch SSD_PRODUCTS_URL with a
 * cache + in-memory fallback. Pages call `await getCatalog()` and never
 * touch the underlying arrays directly — that's the whole point.
 */
export async function getCatalog(): Promise<{
  products: Product[];
  sections: Section[];
}> {
  return { products, sections };
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slug);
}

export async function getProductsForSection(id: string): Promise<Product[]> {
  const { products } = await getCatalog();
  return products
    .filter((p) => p.sections.includes(id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getSectionsInOrder(): Promise<Section[]> {
  const { sections } = await getCatalog();
  return [...sections].sort((a, b) => a.order - b.order);
}

export const SOURCE_CTA_LABEL: Record<ProductSource, string> = {
  amazon: "See it on Amazon →",
  etsy: "Find it on Etsy →",
  ebay: "View on eBay →",
  printify: "Get it →",
  printful: "Get it →",
  other: "See it →",
};
