import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { Artist } from "../utils/types";

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

interface ArtistPageProps {
  artistId?: string;
}

export default function ArtistPage({ artistId }: ArtistPageProps) {
  const { artistId: routeArtistId } = useParams<{ artistId: string }>();
  const resolvedArtistId = artistId ?? routeArtistId;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedArtistId) {
      setIsLoading(false);
      return;
    }

    const fetchArtist = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/artists/${resolvedArtistId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch artist: ${response.status}`);
        }
        const data = await response.json();
        setArtist(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load artist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtist();
  }, [resolvedArtistId]);

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

  if (!artist) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        No artist data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold text-slate-900">
            {artist.display_name}
          </h1>
          <span className="shrink-0 rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white">
            {artist.artist_type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {artist.start_year && (
            <span>
              {artist.start_year}
              {artist.end_year ? ` – ${artist.end_year}` : " – Present"}
            </span>
          )}
          {artist.sort_name && artist.sort_name !== artist.display_name && (
            <>
              <span className="text-slate-500">•</span>
              <span>Sort: {artist.sort_name}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Associated Person (for solo artists) */}
          {artist.person && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-slate-600">Person</h2>
              <Link
                to={`/person/${artist.person.id}`}
                className="block rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                <p className="font-medium text-slate-800">
                  {artist.person.name}
                </p>
              </Link>
            </div>
          )}

          {/* Alternative Names */}
          {artist.alternative_names && artist.alternative_names.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">
                Alternative Names
              </h2>
              <div className="flex flex-wrap gap-2">
                {artist.alternative_names.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          {artist.external_links && artist.external_links.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-slate-600">
                External Links
              </h2>
              <div className="grid gap-2">
                {artist.external_links.map((link) => (
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

          {/* Members (for groups) */}
          {artist.members && artist.members.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="members" className="border-none">
                <AccordionTrigger>
                  <span>Members ({artist.members.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {artist.members.map((member) => {
                      const content = (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800">
                                {member.person?.name || "Unknown"}
                              </p>
                              {member.role && (
                                <p className="text-xs text-slate-600">
                                  {member.role}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-slate-600">
                            {member.start_year && (
                              <span>
                                {member.start_year}
                                {member.end_year
                                  ? ` – ${member.end_year}`
                                  : " – Present"}
                              </span>
                            )}
                          </div>
                          {member.notes && (
                            <p className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                              {member.notes}
                            </p>
                          )}
                        </>
                      );

                      return member.person ? (
                        <Link
                          key={member.id}
                          to={`/person/${member.person.id}`}
                          className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          key={member.id}
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

          {/* Songs (versions where this artist is primary) */}
          {artist.versions && artist.versions.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="songs" className="border-none">
                <AccordionTrigger>
                  <span>Songs ({artist.versions.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {artist.versions.map((version) => (
                      <Link
                        key={version.id}
                        to={`/version/${version.id}`}
                        className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800">
                              {version.title}
                            </p>
                            {version.release_year && (
                              <p className="text-xs text-slate-600">
                                {version.release_year}
                              </p>
                            )}
                          </div>
                          {version.version_type && (
                            <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {version.version_type}
                            </span>
                          )}
                        </div>
                        {version.work && (
                          <p className="text-xs text-slate-500">
                            from "{version.work.title}"
                            {version.work.language &&
                              ` • ${version.work.language}`}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {/* Releases */}
          {artist.releases && artist.releases.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="releases" className="border-none">
                <AccordionTrigger>
                  <span>Releases ({artist.releases.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {artist.releases.map((release) => (
                      <Link
                        key={release.id}
                        to={`/release/${release.id}`}
                        className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                      >
                        {release.cover_art_url && (
                          <img
                            src={release.cover_art_url}
                            alt={release.title}
                            className="h-10 w-10 shrink-0 rounded border border-slate-200 object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800">
                            {release.title}
                          </p>
                          <p className="text-xs text-slate-600">
                            {release.release_category.replace(/_/g, " ")}
                            {release.release_year &&
                              ` · ${release.release_year}`}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {/* Credits */}
          {artist.credits &&
            artist.credits.length > 0 &&
            (() => {
              const workCredits = artist.credits.filter((c) => c.work);
              const versionCredits = artist.credits.filter((c) => c.version);

              return (
                <Accordion.Root type="multiple" className="space-y-2">
                  {workCredits.length > 0 && (
                    <Accordion.Item
                      value="work-credits"
                      className="border-none"
                    >
                      <AccordionTrigger>
                        <span>Work Credits ({workCredits.length})</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {workCredits.map((credit, index) => (
                            <Link
                              key={credit.work!.id + index}
                              to={`/work/${credit.work!.id}`}
                              className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {credit.work!.title}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    {credit.role || "Artist"}
                                    {credit.is_primary && " • Primary"}
                                  </p>
                                </div>
                                {credit.work!.language && (
                                  <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                    {credit.work!.language}
                                  </span>
                                )}
                              </div>
                              {credit.instruments &&
                                credit.instruments.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {credit.instruments.map((instrument) => (
                                      <span
                                        key={instrument}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                                      >
                                        {instrument}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              {credit.notes && (
                                <p className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                                  {credit.notes}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </Accordion.Item>
                  )}

                  {versionCredits.length > 0 && (
                    <Accordion.Item
                      value="version-credits"
                      className="border-none"
                    >
                      <AccordionTrigger>
                        <span>Version Credits ({versionCredits.length})</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {versionCredits.map((credit, index) => (
                            <Link
                              key={credit.version!.id + index}
                              to={`/version/${credit.version!.id}`}
                              className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {credit.version!.title}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    {credit.role || "Artist"}
                                    {credit.is_primary && " • Primary"}
                                    {credit.version!.release_year &&
                                      ` • ${credit.version!.release_year}`}
                                  </p>
                                </div>
                                {credit.version!.version_type && (
                                  <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                    {credit.version!.version_type}
                                  </span>
                                )}
                              </div>
                              {credit.version!.primary_artist && (
                                <p className="text-xs text-slate-500">
                                  by {credit.version!.primary_artist.name}
                                </p>
                              )}
                              {credit.instruments &&
                                credit.instruments.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {credit.instruments.map((instrument) => (
                                      <span
                                        key={instrument}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                                      >
                                        {instrument}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              {credit.notes && (
                                <p className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                                  {credit.notes}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </Accordion.Item>
                  )}
                </Accordion.Root>
              );
            })()}
        </div>
      </div>
    </div>
  );
}
