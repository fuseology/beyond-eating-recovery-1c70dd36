import { useState } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Issue {
  type: string;
  severity: "warning" | "error";
  detail: string;
  fix: string;
}

interface PageAnalysis {
  path: string;
  severity: "ok" | "warning" | "error";
  issues: Issue[];
}

interface Facts {
  path: string;
  status: number | null;
  error?: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
  jsonLdTypes: string[];
  jsonLdInvalid: number;
  bodyTextLength: number;
}

interface ScanResult {
  scannedAt: string;
  origin: string;
  facts: Facts[];
  analysis: { summary: string; pages: PageAnalysis[] } | null;
  rawAnalysis?: string;
}

const DEFAULT_SELECTION = [
  "/",
  "/about",
  "/services",
  "/conditions",
  "/conditions/anorexia-nervosa",
  "/conditions/binge-eating-disorder",
];

const SeoDiagnostics = () => {
  const allPaths = routes.map((r) => r.path);
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const toggle = (path: string) =>
    setSelected((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : prev.length >= 12
        ? prev
        : [...prev, path],
    );

  const runScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "seo-diagnostics",
        { body: { paths: selected } },
      );
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      setResult(data as ScanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const severityIcon = (severity: string) =>
    severity === "error" ? (
      <XCircle className="h-4 w-4 text-destructive" />
    ) : severity === "warning" ? (
      <AlertTriangle className="h-4 w-4 text-amber-600" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    );

  const factFor = (path: string) => result?.facts.find((f) => f.path === path);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Page Check (internal) | Beyond Eating Recovery</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground">Page Check</h1>
        <p className="mt-2 text-muted-foreground">
          Reads each live page exactly as a search engine sees it — before any
          scripts run — and reports what is missing or inconsistent.
        </p>

        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">
              Pages to check{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({selected.length} of 12 max)
              </span>
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelected(DEFAULT_SELECTION)}
                disabled={loading}
              >
                Reset
              </Button>
              <Button onClick={runScan} disabled={loading || selected.length === 0}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Checking…" : "Run check"}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
            {allPaths.map((path) => (
              <label
                key={path}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
              >
                <Checkbox
                  checked={selected.includes(path)}
                  onCheckedChange={() => toggle(path)}
                  disabled={loading}
                />
                <span className="truncate">{path}</span>
              </label>
            ))}
          </div>
        </Card>

        {error && (
          <Card className="mt-6 border-destructive/40 p-5">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {loading && (
          <p className="mt-6 text-sm text-muted-foreground">
            Reading each page and reviewing it. This can take a minute.
          </p>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {result.analysis?.summary && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold">Summary</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.analysis.summary}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Checked {result.origin} on{" "}
                  {new Date(result.scannedAt).toLocaleString()}
                </p>
              </Card>
            )}

            {result.analysis?.pages?.map((page) => {
              const facts = factFor(page.path);
              return (
                <Card key={page.path} className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {severityIcon(page.severity)}
                    <h3 className="font-semibold">{page.path}</h3>
                    {facts?.status && facts.status !== 200 && (
                      <Badge variant="destructive">HTTP {facts.status}</Badge>
                    )}
                    {facts && (
                      <Badge variant="secondary">
                        {facts.jsonLdTypes.length} schema item
                        {facts.jsonLdTypes.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>

                  {facts && (
                    <dl className="mt-4 space-y-1 text-sm">
                      <div className="flex gap-2">
                        <dt className="w-28 shrink-0 text-muted-foreground">Title</dt>
                        <dd>{facts.title ?? "— missing —"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-28 shrink-0 text-muted-foreground">
                          Description
                        </dt>
                        <dd>{facts.description ?? "— missing —"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-28 shrink-0 text-muted-foreground">
                          Canonical
                        </dt>
                        <dd className="break-all">{facts.canonical ?? "— missing —"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-28 shrink-0 text-muted-foreground">Schema</dt>
                        <dd>
                          {facts.jsonLdTypes.length
                            ? facts.jsonLdTypes.join(", ")
                            : "— none —"}
                        </dd>
                      </div>
                    </dl>
                  )}

                  {page.issues?.length ? (
                    <ul className="mt-4 space-y-3">
                      {page.issues.map((issue, i) => (
                        <li key={i} className="rounded-md border p-3 text-sm">
                          <div className="flex items-center gap-2 font-medium">
                            {severityIcon(issue.severity)}
                            {issue.type}
                          </div>
                          <p className="mt-1 text-muted-foreground">{issue.detail}</p>
                          <p className="mt-1">
                            <span className="font-medium">Suggested fix: </span>
                            {issue.fix}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-emerald-700">
                      No problems found on this page.
                    </p>
                  )}
                </Card>
              );
            })}

            {!result.analysis && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold">Raw review</h2>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground">
                  {result.rawAnalysis}
                </pre>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeoDiagnostics;
