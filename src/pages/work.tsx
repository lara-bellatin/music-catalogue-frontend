import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";

type Work = {
  id: string;
  title: string;
  language?: string;
  titles?: {
    title: string;
    type: string;
    language: string;
  }[];
  description?: string;
  identifiers?: {
    label: string;
    value: string;
    url: string;
  }[];
  origin_year_start?: number;
  origin_year_end?: number;
  origin_country?: string;
  themes?: string[];
  sentiment?: string;
  notes?: string;
  versions?: {
    id: string;
    title: string;
    version_type?: string;
    primary_artist?: {
      id: string;
      display_name: string;
    };
    release_year?: number;
    completeness_level?: string;
  }[];
  genres?: {
    id: string;
    name: string;
  }[];
  credits?: {
    artist?: {
      id: string;
      display_name: string;
    };
    person?: {
      id: string;
      legal_name: string;
    };
    role?: string;
    is_primary: boolean;
    credit_order?: number;
    instruments?: string[];
    notes?: string;
  }[];
  external_links?: {
    label: string;
    url: string;
    source_verified: boolean;
  }[];
};

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

interface WorkPageProps {
  workId?: string;
}

export default function WorkPage({ workId }: WorkPageProps) {
  const { workId: routeWorkId } = useParams<{ workId: string }>();
  const resolvedWorkId = workId ?? routeWorkId;
  const [work, setWork] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedWorkId) {
      setIsLoading(false);
      return;
    }

    const fetchWork = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/works/${resolvedWorkId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch work: ${response.status}`);
        }
        const data = await response.json();
        setWork(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load work");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWork();
  }, [resolvedWorkId]);

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

  if (!work) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        No work data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-semibold text-slate-900">{work.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {work.origin_year_start ? (
            <span>
              {work.origin_year_start}
              {work.origin_year_end &&
              work.origin_year_end !== work.origin_year_start
                ? `-${work.origin_year_end}`
                : ""}
            </span>
          ) : (
            <span>Unknown Dates</span>
          )}
          {work.origin_country && <span className="text-slate-500">•</span>}
          {work.origin_country && <span>{work.origin_country}</span>}
          {work.language && <span className="text-slate-500">•</span>}
          {work.language && <span className="capitalize">{work.language}</span>}
        </div>
        <p className="text-xs text-slate-500">ID: {work.id}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          {work.description && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {work.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {work.notes && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">Notes</h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {work.notes}
              </p>
            </div>
          )}

          {/* Genres */}
          {work.genres && work.genres.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {work.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Themes */}
          {work.themes && work.themes.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">Themes</h2>
              <div className="flex flex-wrap gap-2">
                {work.themes.map((theme) => (
                  <span
                    key={theme}
                    className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Titles */}
          {work.titles && work.titles.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="titles" className="border-none">
                <AccordionTrigger>
                  <span>Alternative Titles ({work.titles.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {work.titles.map((alt, idx) => (
                      <div
                        key={idx}
                        className="space-y-2 rounded-md border border-slate-200 bg-white p-3"
                      >
                        <p className="font-medium text-slate-800">
                          {alt.title}
                        </p>
                        <div className="flex gap-2 text-xs text-slate-600">
                          <span className="rounded bg-slate-100 px-2 py-0.5">
                            {alt.type}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5">
                            {alt.language}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {/* Identifiers */}
          {work.identifiers && work.identifiers.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="identifiers" className="border-none">
                <AccordionTrigger>
                  <span>Identifiers ({work.identifiers.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 columns-2">
                    {work.identifiers.map((id, idx) => (
                      <div
                        key={idx}
                        className="space-y-2 rounded-md border border-slate-200 bg-white p-3"
                      >
                        <span className="font-medium text-slate-700">
                          {id.label}
                        </span>
                        <span className="font-mono text-slate-600">
                          {id.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {/* Credits */}
          {work.credits && work.credits.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="credits" className="border-none">
                <AccordionTrigger>
                  <span>Credits ({work.credits.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 columns-2">
                    {work.credits.map((credit, idx) => (
                      <div
                        key={idx}
                        className="space-y-2 rounded-md border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800">
                              {credit.artist?.display_name ||
                                credit.person?.legal_name ||
                                "Unknown"}
                            </p>
                            {credit.role && (
                              <p className="text-xs text-slate-600">
                                {credit.role}
                              </p>
                            )}
                          </div>
                          {credit.is_primary && (
                            <span className="text-xs font-medium rounded bg-slate-900 text-white px-2 py-0.5">
                              Primary
                            </span>
                          )}
                        </div>
                        {(credit.instruments || credit.notes) && (
                          <div className="space-y-1 border-t border-slate-200 pt-2 text-xs text-slate-600">
                            {credit.instruments &&
                              credit.instruments.length > 0 && (
                                <p>
                                  <span className="font-medium">
                                    Instruments:
                                  </span>{" "}
                                  {credit.instruments.join(", ")}
                                </p>
                              )}
                            {credit.notes && (
                              <p>
                                <span className="font-medium">Notes:</span>{" "}
                                {credit.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {/* Versions */}
          {work.versions && work.versions.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="versions" className="border-none">
                <AccordionTrigger>
                  <span>Versions ({work.versions.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {work.versions.map((version) => (
                      <div
                        key={version.id}
                        className="space-y-2 rounded-md border border-slate-200 bg-white p-3"
                      >
                        <h4 className="font-medium text-slate-800">
                          {version.title}
                        </h4>
                        <div className="grid gap-2 text-xs text-slate-600">
                          {version.version_type && (
                            <div>
                              <span className="font-medium">Type:</span>{" "}
                              {version.version_type}
                            </div>
                          )}
                          {version.primary_artist && (
                            <div>
                              <span className="font-medium">Artist:</span>{" "}
                              {version.primary_artist.display_name}
                            </div>
                          )}
                          {version.release_year && (
                            <div>
                              <span className="font-medium">Released:</span>{" "}
                              {version.release_year}
                            </div>
                          )}
                          {version.completeness_level && (
                            <div>
                              <span className="font-medium">Completeness:</span>{" "}
                              {version.completeness_level}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sentiment */}
          {work.sentiment && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
                Sentiment
              </h3>
              <p className="text-sm font-medium text-slate-800 capitalize">
                {work.sentiment}
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="space-y-2">
            {work.versions && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Versions
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {work.versions.length}
                </p>
              </div>
            )}
            {work.credits && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Credits
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {work.credits.length}
                </p>
              </div>
            )}
          </div>

          {/* External Links */}
          {work.external_links && work.external_links.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                External Links
              </h3>
              <ul className="space-y-2 text-sm">
                {work.external_links.map((link) => (
                  <li key={`${link.label}-${link.url}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-between gap-3 rounded-md px-2 py-1 text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <span className="truncate" title={link.label}>
                        {link.label}
                      </span>
                      {link.source_verified && (
                        <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                          Verified
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
