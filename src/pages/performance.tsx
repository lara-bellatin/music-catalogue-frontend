import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { Performance } from "../utils/types";

const AccordionTrigger = ({ children }: { children: ReactNode }) => (
  <Accordion.Trigger className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 data-[state=open]:border-slate-300 data-[state=open]:bg-slate-50">
    {children}
    <ChevronDownIcon className="transition duration-200 group-data-[state=open]:rotate-180" />
  </Accordion.Trigger>
);

const AccordionContent = ({ children }: { children: ReactNode }) => (
  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
    <div className="px-4 py-3 text-sm text-slate-700">{children}</div>
  </Accordion.Content>
);

interface PerformancePageProps {
  performanceId?: string;
}

export default function PerformancePage({
  performanceId,
}: PerformancePageProps) {
  const { performanceId: routePerformanceId } = useParams<{
    performanceId: string;
  }>();
  const resolvedPerformanceId = performanceId ?? routePerformanceId;
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedPerformanceId) {
      setIsLoading(false);
      return;
    }

    const fetchPerformance = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/performances/${resolvedPerformanceId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch performance: ${response.status}`);
        }
        const data = await response.json();
        setPerformance(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load performance",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, [resolvedPerformanceId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        No performance data available
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const sortedArtists = performance.artists
    ? [...performance.artists].sort(
        (a, b) => (a.billing_order ?? Infinity) - (b.billing_order ?? Infinity),
      )
    : [];

  const sortedWorks = performance.works
    ? [...performance.works].sort(
        (a, b) => (a.set_order ?? Infinity) - (b.set_order ?? Infinity),
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          {performance.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {performance.performance_date && (
            <span>{formatDate(performance.performance_date)}</span>
          )}
          {performance.venue && (
            <>
              <span className="text-slate-500">&bull;</span>
              <span>{performance.venue}</span>
            </>
          )}
          {(performance.city || performance.country) && (
            <>
              <span className="text-slate-500">&bull;</span>
              <span>
                {[performance.city, performance.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-6">
          {/* Notes */}
          {performance.notes && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">Notes</h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {performance.notes}
              </p>
            </div>
          )}

          {/* External Links */}
          {performance.external_links &&
            performance.external_links.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-600">
                  External Links
                </h2>
                <div className="grid gap-2">
                  {performance.external_links.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span>{link.label}</span>
                      {link.source_verified && (
                        <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                          Verified
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

          {/* Artists */}
          {sortedArtists.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="artists" className="border-none">
                <AccordionTrigger>
                  <span>Artists ({sortedArtists.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {sortedArtists.map((pa, idx) => {
                      const linkTo = pa.artist
                        ? `/artist/${pa.artist.id}`
                        : pa.person
                          ? `/person/${pa.person.id}`
                          : null;

                      const content = (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800">
                                {pa.artist?.name ||
                                  pa.person?.name ||
                                  "Unknown"}
                              </p>
                              {pa.role && (
                                <p className="text-xs text-slate-600">
                                  {pa.role}
                                </p>
                              )}
                            </div>
                          </div>
                          {pa.notes && (
                            <p className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                              {pa.notes}
                            </p>
                          )}
                        </>
                      );

                      return linkTo ? (
                        <Link
                          key={idx}
                          to={linkTo}
                          className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          key={idx}
                          className="space-y-2 rounded-md border border-slate-200 bg-white p-3"
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {/* Works / Programme */}
          {sortedWorks.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="works" className="border-none">
                <AccordionTrigger>
                  <span>Programme ({sortedWorks.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {sortedWorks.map((pw, idx) => {
                      const linkTo = pw.version
                        ? `/version/${pw.version.id}`
                        : pw.work
                          ? `/work/${pw.work.id}`
                          : null;

                      const content = (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800">
                                {pw.work?.title ||
                                  pw.version?.title ||
                                  "Unknown"}
                              </p>
                              {pw.set_name && (
                                <p className="text-xs text-slate-600">
                                  {pw.set_name}
                                </p>
                              )}
                            </div>
                            {pw.version?.version_type && (
                              <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                {pw.version.version_type}
                              </span>
                            )}
                          </div>
                          {pw.version?.primary_artist && (
                            <p className="text-xs text-slate-500">
                              by {pw.version.primary_artist.name}
                            </p>
                          )}
                          {pw.notes && (
                            <p className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                              {pw.notes}
                            </p>
                          )}
                        </>
                      );

                      return linkTo ? (
                        <Link
                          key={idx}
                          to={linkTo}
                          className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          key={idx}
                          className="space-y-2 rounded-md border border-slate-200 bg-white p-3"
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}
        </div>
      </div>
    </div>
  );
}
