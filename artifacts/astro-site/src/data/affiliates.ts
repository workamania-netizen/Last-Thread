// Slug → outbound affiliate URL. Server-side only.
// Placeholder Amazon search URLs for launch; replace with real affiliate
// links post-launch (Amazon Associates tag will be appended via a wrapper
// if needed). Slug naming: kebab-case, scoped to product, not brand.

export const affiliates: Record<string, string> = {
  // Father's Day guide
  "cabin-socks": "https://amazon.com/s?k=ragg+wool+cabin+socks+men",
  "leather-bifold-wallet": "https://amazon.com/s?k=full+grain+leather+bifold+wallet",
  "pocket-knife": "https://amazon.com/s?k=opinel+no+8+pocket+knife",
  "cast-iron-skillet": "https://amazon.com/s?k=lodge+cast+iron+skillet+12+inch",
  "whiskey-glasses": "https://amazon.com/s?k=glencairn+whiskey+glasses+set",
  "leather-work-gloves": "https://amazon.com/s?k=leather+work+gloves+men",
  "beard-balm": "https://amazon.com/s?k=honest+amish+beard+balm",
  "edc-flashlight": "https://amazon.com/s?k=olight+i3t+edc+flashlight",
  "leather-watch-strap": "https://amazon.com/s?k=horween+leather+watch+strap+20mm",
  "canvas-dopp-kit": "https://amazon.com/s?k=waxed+canvas+dopp+kit+leather",
  "waxed-hunting-cap": "https://amazon.com/s?k=stormy+kromer+wool+cap",
  "leatherman-multitool": "https://amazon.com/s?k=leatherman+wave+plus+multitool",
  "fishing-lures-set": "https://amazon.com/s?k=rapala+original+floating+lures",
  "single-origin-coffee": "https://amazon.com/s?k=stumptown+hair+bender+whole+bean",
  "leather-field-notebook": "https://amazon.com/s?k=leather+field+notebook+refillable",

  // Cabin sock edit
  "merino-crew-sock": "https://amazon.com/s?k=darn+tough+merino+crew+sock",
  "ragg-wool-boot-sock": "https://amazon.com/s?k=ragg+wool+boot+sock",
  "alpaca-slipper-sock": "https://amazon.com/s?k=alpaca+slipper+sock",
  "heavyweight-thermal-sock": "https://amazon.com/s?k=heavyweight+thermal+sock+wool",
  "hunting-sock": "https://amazon.com/s?k=fox+river+wick+dry+hunting+sock",
  "smartwool-hiker": "https://amazon.com/s?k=smartwool+hike+full+cushion",
  "cotton-work-crew": "https://amazon.com/s?k=carhartt+cotton+work+crew+sock",
};

export function getAffiliateUrl(slug: string): string | undefined {
  return affiliates[slug];
}
