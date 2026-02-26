import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { Release, ReleaseTrack } from "../utils/types";

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

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface ReleasePageProps {
  releaseId?: string;
}

export default function ReleasePage({ releaseId }: ReleasePageProps) {
  const { releaseId: routeReleaseId } = useParams<{ releaseId: string }>();
  const resolvedReleaseId = releaseId ?? routeReleaseId;
  const [release, setRelease] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedReleaseId) {
      setIsLoading(false);
      return;
    }

    const fetchRelease = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/releases/${resolvedReleaseId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch release: ${response.status}`);
        }
        const data = await response.json();
        setRelease(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load release");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelease();
  }, [resolvedReleaseId]);

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

  if (!release) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        No release data available
      </div>
    );
  }

  // Group tracks by disc number
  const sortedTracks = release.tracks
    ? [...release.tracks].sort(
        (a, b) =>
          a.disc_number - b.disc_number || a.track_number - b.track_number,
      )
    : [];

  const tracksByDisc = sortedTracks.reduce<Record<number, ReleaseTrack[]>>(
    (acc, track) => {
      const disc = track.disc_number;
      if (!acc[disc]) acc[disc] = [];
      acc[disc].push(track);
      return acc;
    },
    {},
  );

  const discNumbers = Object.keys(tracksByDisc)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-start gap-5">
          {release.cover_art_url && (
            <img
              src={release.cover_art_url}
              alt={release.title}
              className="h-28 w-28 shrink-0 rounded-lg border border-slate-200 object-cover"
            />
          )}
          <div className="min-w-0 space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">
              {release.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              {release.release_date && (
                <span>{formatDate(release.release_date)}</span>
              )}
              {release.label && (
                <>
                  <span className="text-slate-500">&bull;</span>
                  <span>{release.label}</span>
                </>
              )}
              {release.region && (
                <>
                  <span className="text-slate-500">&bull;</span>
                  <span>{release.region}</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                {release.release_category.replace(/_/g, " ")}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                {release.release_stage.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-6">
          {/* Catalog Details */}
          {(release.catalog_number ||
            release.publisher_number ||
            release.total_discs > 1) && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">
                Catalog Details
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                {release.catalog_number && (
                  <div>
                    <span className="font-medium">Catalog #:</span>{" "}
                    {release.catalog_number}
                  </div>
                )}
                {release.publisher_number && (
                  <div>
                    <span className="font-medium">Publisher #:</span>{" "}
                    {release.publisher_number}
                  </div>
                )}
                <div>
                  <span className="font-medium">Tracks:</span>{" "}
                  {release.total_tracks}
                </div>
                {release.total_discs > 1 && (
                  <div>
                    <span className="font-medium">Discs:</span>{" "}
                    {release.total_discs}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {release.notes && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">Notes</h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {release.notes}
              </p>
            </div>
          )}

          {/* External Links */}
          {release.external_links && release.external_links.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-slate-600">
                External Links
              </h2>
              <div className="grid gap-2">
                {release.external_links.map((link) => (
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

          {/* Tracklist */}
          {sortedTracks.length > 0 && (
            <Accordion.Root
              type="single"
              collapsible
              className="space-y-2"
              defaultValue="tracklist"
            >
              <Accordion.Item value="tracklist" className="border-none">
                <AccordionTrigger>
                  <span>Tracklist ({sortedTracks.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {discNumbers.map((disc) => (
                      <div key={disc} className="space-y-2">
                        {release.total_discs > 1 && (
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Disc {disc}
                          </p>
                        )}
                        <div className="space-y-1">
                          {tracksByDisc[disc].map((track) => (
                            <Link
                              key={track.id}
                              to={`/version/${track.version.id}`}
                              className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-slate-400">
                                {track.side
                                  ? `${track.side}${track.track_number}`
                                  : track.track_number}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-slate-800">
                                  {track.version.title}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  {track.version.primary_artist.name}
                                  {track.version.version_type !== "ORIGINAL" &&
                                    ` · ${track.version.version_type.replace(/_/g, " ")}`}
                                </p>
                              </div>
                              {track.is_hidden && (
                                <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                  Hidden
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {/* Media Items */}
          {release.media_items && release.media_items.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="media-items" className="border-none">
                <AccordionTrigger>
                  <span>Media Formats ({release.media_items.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {release.media_items.map((item) => (
                      <div
                        key={item.id}
                        className="space-y-2 rounded-md border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800">
                              {item.format_name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {item.medium_type.replace(/_/g, " ")}
                              {item.platform_or_vendor &&
                                ` · ${item.platform_or_vendor}`}
                            </p>
                          </div>
                          <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {item.availability_status.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* Audio specs */}
                        {(item.bitrate_kbps ||
                          item.sample_rate_hz ||
                          item.bit_depth ||
                          item.channels ||
                          item.rpm) && (
                          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-2 text-xs text-slate-600">
                            {item.bitrate_kbps && (
                              <span>{item.bitrate_kbps} kbps</span>
                            )}
                            {item.sample_rate_hz && (
                              <span>
                                {(item.sample_rate_hz / 1000).toFixed(1)} kHz
                              </span>
                            )}
                            {item.bit_depth && (
                              <span>{item.bit_depth}-bit</span>
                            )}
                            {item.channels && (
                              <span>{item.channels.replace(/_/g, " ")}</span>
                            )}
                            {item.rpm && <span>{item.rpm} RPM</span>}
                          </div>
                        )}

                        {/* Physical details */}
                        {(item.packaging ||
                          item.barcode ||
                          item.sku ||
                          item.catalog_variation ||
                          item.accessories ||
                          item.notes) && (
                          <div className="space-y-1 border-t border-slate-200 pt-2 text-xs text-slate-600">
                            {item.packaging && (
                              <p>
                                <span className="font-medium">Packaging:</span>{" "}
                                {item.packaging}
                              </p>
                            )}
                            {item.barcode && (
                              <p>
                                <span className="font-medium">Barcode:</span>{" "}
                                {item.barcode}
                              </p>
                            )}
                            {item.sku && (
                              <p>
                                <span className="font-medium">SKU:</span>{" "}
                                {item.sku}
                              </p>
                            )}
                            {item.catalog_variation && (
                              <p>
                                <span className="font-medium">Variation:</span>{" "}
                                {item.catalog_variation}
                              </p>
                            )}
                            {item.accessories && (
                              <p>
                                <span className="font-medium">
                                  Accessories:
                                </span>{" "}
                                {item.accessories}
                              </p>
                            )}
                            {item.notes && (
                              <p>
                                <span className="font-medium">Notes:</span>{" "}
                                {item.notes}
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
        </div>
      </div>
    </div>
  );
}
