import type { APIRoute } from "astro";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const SSD_TIMEOUT_MS = 3000;

// Per-process in-memory rate limit (stage 1 — resets on redeploy).
const rateLimit = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimit.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  recent.push(now);
  rateLimit.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

function deriveFirstName(email: string): string {
  const local = email.split("@")[0] ?? "";
  const letters = local.replace(/[^a-zA-Z]/g, "");
  if (!letters) return "Subscriber";
  return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const body = (payload ?? {}) as { email?: unknown; company?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const company = typeof body.company === "string" ? body.company : "";

  // Honeypot: bots fill the hidden `company` field; humans don't see it.
  if (company.length > 0) {
    return jsonResponse(200, { ok: true });
  }

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return jsonResponse(400, { ok: false, error: "invalid_email" });
  }

  if (isRateLimited(clientAddress)) {
    return jsonResponse(429, { ok: false, error: "rate_limited" });
  }

  const firstName = deriveFirstName(email);
  const ssdUrl = import.meta.env.SSD_INTAKE_URL;

  if (ssdUrl) {
    // Fire-and-forget with 3s timeout. SSD failures never surface to user.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SSD_TIMEOUT_MS);
    fetch(ssdUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        firstName,
        source: "lastthread-newsletter",
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          console.warn(`[subscribe] SSD non-2xx status=${res.status} email=${email}`);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[subscribe] SSD error email=${email} err=${msg}`);
      })
      .finally(() => clearTimeout(timeout));
  } else {
    console.warn("[subscribe] SSD_INTAKE_URL not set — lead logged only");
    console.log(`[subscribe] lead email=${email} firstName=${firstName}`);
  }

  return jsonResponse(200, { ok: true });
};
