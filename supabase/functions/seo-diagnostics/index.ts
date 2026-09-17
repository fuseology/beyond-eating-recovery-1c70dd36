// SEO diagnostics: fetches the raw (prerendered) HTML of live routes,
// extracts head tags + JSON-LD without running JS, then asks Lovable AI
// to report what is missing or mismatched.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SITE_ORIGIN = "https://www.beyondeatingrecovery.com";
const MAX_PATHS = 12;

interface PageFacts {
  path: string;
  url: string;
  status: number | null;
  error?: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
  h1: string[];
  jsonLdTypes: string[];
  jsonLdInvalid: number;
  jsonLdRaw: string[];
  htmlBytes: number;
  bodyTextLength: number;
}

const decode = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

function metaContent(html: string, attr: string, value: string) {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${value}["'][^>]*>`,
    "i",
  );
  const tag = html.match(re)?.[0];
  if (!tag) return null;
  const content = tag.match(/content=["']([\s\S]*?)["']/i)?.[1];
  return content ? decode(content) : null;
}

function collectMeta(html: string, attr: string, prefix: string) {
  const out: Record<string, string> = {};
  const re = new RegExp(
    `<meta[^>]+${attr}=["'](${prefix}:[a-z0-9:_-]+)["'][^>]*content=["']([\\s\\S]*?)["'][^>]*>`,
    "gi",
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out[m[1]] = decode(m[2]);
  return out;
}

function parsePage(path: string, html: string, status: number): PageFacts {
  const head = html.split(/<\/head>/i)[0] ?? html;
  const jsonLdTypes: string[] = [];
  const jsonLdRaw: string[] = [];
  let jsonLdInvalid = 0;

  const ldRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldRe.exec(html)) !== null) {
    const raw = m[1].trim();
    jsonLdRaw.push(raw.slice(0, 4000));
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed)
        ? parsed
        : parsed["@graph"] && Array.isArray(parsed["@graph"])
        ? parsed["@graph"]
        : [parsed];
      for (const node of nodes) {
        const t = node?.["@type"];
        if (Array.isArray(t)) jsonLdTypes.push(...t);
        else if (t) jsonLdTypes.push(String(t));
      }
    } catch {
      jsonLdInvalid++;
    }
  }

  const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((x) => decode(x[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")))
    .filter(Boolean)
    .slice(0, 3);

  const bodyText = (html.split(/<body[^>]*>/i)[1] ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    path,
    url: SITE_ORIGIN + path,
    status,
    title: head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      ? decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)![1])
      : null,
    description: metaContent(head, "name", "description"),
    canonical: (() => {
      const tag = head.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0];
      const href = tag?.match(/href=["']([\s\S]*?)["']/i)?.[1];
      return href ? decode(href) : null;
    })(),
    robots: metaContent(head, "name", "robots"),
    og: collectMeta(head, "property", "og"),
    twitter: collectMeta(head, "name", "twitter"),
    h1,
    jsonLdTypes,
    jsonLdInvalid,
    jsonLdRaw,
    htmlBytes: html.length,
    bodyTextLength: bodyText.length,
  };
}

async function fetchPage(path: string): Promise<PageFacts> {
  const url = SITE_ORIGIN + path;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BER-SEO-Diagnostics/1.0 (no-js crawler)" },
      redirect: "follow",
    });
    const html = await res.text();
    return parsePage(path, html, res.status);
  } catch (error) {
    return {
      path,
      url,
      status: null,
      error: error instanceof Error ? error.message : String(error),
      title: null,
      description: null,
      canonical: null,
      robots: null,
      og: {},
      twitter: {},
      h1: [],
      jsonLdTypes: [],
      jsonLdInvalid: 0,
      jsonLdRaw: [],
      htmlBytes: 0,
      bodyTextLength: 0,
    };
  }
}

async function analyze(pages: PageFacts[], apiKey: string) {
  const summary = pages.map((p) => ({
    path: p.path,
    status: p.status,
    error: p.error ?? null,
    title: p.title,
    titleLength: p.title?.length ?? 0,
    description: p.description,
    descriptionLength: p.description?.length ?? 0,
    canonical: p.canonical,
    robots: p.robots,
    og: p.og,
    twitter: p.twitter,
    h1: p.h1,
    jsonLdTypes: p.jsonLdTypes,
    jsonLdInvalidBlocks: p.jsonLdInvalid,
    jsonLd: p.jsonLdRaw.map((r) => r.slice(0, 1500)),
    prerenderedTextChars: p.bodyTextLength,
  }));

  const prompt = `You are a technical SEO auditor. Below is the RAW server HTML (no JavaScript executed) for pages of an eating-disorder treatment practice site at ${SITE_ORIGIN}.

For each page, report problems only where evidence exists in the data. Check:
- missing or duplicated <title> / meta description (flag titles shared across different pages, titles outside 30-65 chars, descriptions outside 70-160 chars)
- missing or wrong canonical (must be an absolute ${SITE_ORIGIN} URL matching the page path)
- missing or inconsistent og:title / og:description / og:url / og:type / twitter:card
- missing, invalid, or mismatched JSON-LD (e.g. a condition page with no MedicalCondition/MedicalWebPage, a bio page with no Person, no BreadcrumbList, schema whose name contradicts the page title)
- pages that appear not to be prerendered (near-zero prerenderedTextChars) or non-200 status

Never invent clinical, insurance, or outcome claims. Do not suggest wording that guarantees results.

Return ONLY json matching this shape (respond with json, no prose):
{"summary": string, "pages": [{"path": string, "severity": "ok"|"warning"|"error", "issues": [{"type": string, "severity": "warning"|"error", "detail": string, "fix": string}]}]}

DATA:
${JSON.stringify(summary)}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      input: prompt,
      stream: true,
      reasoning: { effort: "low", summary: "auto" },
      text: { format: { type: "json_object" } },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    return { status: res.status, text: "", detail };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "response.output_text.delta" && evt.delta) {
          text += evt.delta;
        } else if (evt.type === "response.completed" && !text) {
          text = evt.response?.output_text ?? "";
        }
      } catch {
        // ignore keep-alive / partial frames
      }
    }
  }
  return { status: 200, text, detail: "" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI is not configured for this project." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const paths: string[] = Array.isArray(body.paths)
      ? body.paths
          .filter((p: unknown): p is string => typeof p === "string")
          .map((p: string) => (p.startsWith("/") ? p : `/${p}`))
          .slice(0, MAX_PATHS)
      : [];

    if (paths.length === 0) {
      return new Response(JSON.stringify({ error: "No pages selected." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pages = await Promise.all(paths.map(fetchPage));
    const ai = await analyze(pages, apiKey);

    if (ai.status === 429) {
      return new Response(
        JSON.stringify({ error: "The AI service is busy right now. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (ai.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits are exhausted. Add credits to keep using this checker." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (ai.status !== 200) {
      return new Response(
        JSON.stringify({ error: `AI request failed (${ai.status}). ${ai.detail.slice(0, 300)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let analysis: unknown = null;
    try {
      analysis = JSON.parse(ai.text);
    } catch {
      analysis = null;
    }

    return new Response(
      JSON.stringify({
        scannedAt: new Date().toISOString(),
        origin: SITE_ORIGIN,
        facts: pages.map(({ jsonLdRaw: _raw, ...rest }) => rest),
        analysis,
        rawAnalysis: analysis ? undefined : ai.text.slice(0, 5000),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
