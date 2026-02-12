import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { Version } from "../utils/types";

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

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface VersionPageProps {
  versionId?: string;
}

export default function VersionPage({ versionId }: VersionPageProps) {
  const { versionId: routeVersionId } = useParams<{ versionId: string }>();
  const resolvedVersionId = versionId ?? routeVersionId;
  const [version, setVersion] = useState<Version | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedVersionId) {
      setIsLoading(false);
      return;
    }

    const fetchVersion = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/versions/${resolvedVersionId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch version: ${response.status}`);
        }
        const data = await response.json();
        setVersion(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load version");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersion();
  }, [resolvedVersionId]);

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

  if (!version) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        No version data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          {version.title}
        </h1>
        {version.based_on_version && (
          <p className="text-sm text-slate-600">
            Based on{" "}
            <Link
              to={`/version/${version.based_on_version.id}`}
              className="text-slate-800 underline decoration-slate-300 hover:decoration-slate-800"
            >
              {version.based_on_version.title}
            </Link>
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <Link
            to={`/artist/${version.primary_artist.id}`}
            className="text-slate-800 underline decoration-slate-300 hover:decoration-slate-800"
          >
            {version.primary_artist.name}
          </Link>
          {version.release_year && (
            <>
              <span className="text-slate-500">•</span>
              <span>{version.release_year}</span>
            </>
          )}
          <span className="text-slate-500">•</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
            {version.version_type.replace(/_/g, " ")}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
            {version.completeness_level}
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Work Reference */}
          {version.work && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">Work</h2>
              <Link
                to={`/work/${version.work.id}`}
                className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="font-medium">{version.work.title}</span>
                {version.work.language && (
                  <span className="ml-2 text-slate-500 capitalize">
                    ({version.work.language})
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* Technical Details */}
          {(version.duration_seconds ||
            version.bpm ||
            version.key_signature) && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">
                Technical Details
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                {version.duration_seconds && (
                  <div>
                    <span className="font-medium">Duration:</span>{" "}
                    {formatDuration(version.duration_seconds)}
                  </div>
                )}
                {version.bpm && (
                  <div>
                    <span className="font-medium">BPM:</span> {version.bpm}
                  </div>
                )}
                {version.key_signature && (
                  <div>
                    <span className="font-medium">Key:</span>{" "}
                    {version.key_signature}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Release Date */}
          {version.release_date && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">
                Release Date
              </h2>
              <p className="text-sm text-slate-700">{version.release_date}</p>
            </div>
          )}

          {/* Lyrics Reference */}
          {version.lyrics_reference && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">
                Lyrics Reference
              </h2>
              <p className="text-sm text-slate-700">
                {version.lyrics_reference}
              </p>
            </div>
          )}

          {/* Notes */}
          {version.notes && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">Notes</h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {version.notes}
              </p>
            </div>
          )}

          {/* External Links */}
          {version.external_links && version.external_links.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-slate-600">
                External Links
              </h2>
              <div className="grid gap-2">
                {version.external_links.map((link) => (
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

          {/* Credits */}
          {version.credits && version.credits.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="credits" className="border-none">
                <AccordionTrigger>
                  <span>Credits ({version.credits.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 columns-2">
                    {version.credits.map((credit, idx) => {
                      const linkTo = credit.artist
                        ? `/artist/${credit.artist.id}`
                        : credit.person
                          ? `/person/${credit.person.id}`
                          : null;

                      const content = (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800">
                                {credit.artist?.name ||
                                  credit.person?.name ||
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

          {/* Derived Versions */}
          {version.derived_versions && version.derived_versions.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="derived-versions" className="border-none">
                <AccordionTrigger>
                  <span>
                    Derived Versions ({version.derived_versions.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {version.derived_versions.map((derived) => (
                      <Link
                        key={derived.id}
                        to={`/version/${derived.id}`}
                        className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800">
                              {derived.title}
                            </p>
                            <p className="text-xs text-slate-600">
                              {derived.primary_artist.name}
                              {derived.release_year &&
                                ` • ${derived.release_year}`}
                            </p>
                          </div>
                          <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {derived.version_type.replace(/_/g, " ")}
                          </span>
                        </div>
                      </Link>
                    ))}
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
