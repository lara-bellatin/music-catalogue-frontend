import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { Person } from "../utils/types";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getUTCDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  const month = date.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();

  return `${month} ${day}${suffix}, ${year}`;
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

interface PersonPageProps {
  personId?: string;
}

export default function PersonPage({ personId }: PersonPageProps) {
  const { personId: routePersonId } = useParams<{ personId: string }>();
  const resolvedPersonId = personId ?? routePersonId;
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedPersonId) {
      setIsLoading(false);
      return;
    }

    const fetchPerson = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/persons/${resolvedPersonId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch person: ${response.status}`);
        }
        const data = await response.json();
        setPerson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load person");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerson();
  }, [resolvedPersonId]);

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

  if (!person) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        No person data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          {person.legal_name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {person.birth_date && (
            <span>Born: {formatDate(person.birth_date)}</span>
          )}
          {person.death_date && (
            <>
              <span className="text-slate-500">•</span>
              <span>Died: {formatDate(person.death_date)}</span>
            </>
          )}
          {person.pronouns && (
            <>
              <span className="text-slate-500">•</span>
              <span>{person.pronouns}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Notes */}
          {person.notes && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-slate-600">Notes</h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {person.notes}
              </p>
            </div>
          )}

          {/* External Links */}
          {person.external_links && person.external_links.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-slate-600">
                External Links
              </h2>
              <div className="grid gap-2">
                {person.external_links.map((link) => (
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

          {/* Musical Career - Solo Artist + Group Memberships */}
          {(person.artist ||
            (person.memberships && person.memberships.length > 0)) && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-slate-600">
                Musical Career
              </h2>
              <div className="space-y-3">
                {/* Solo Artist Persona */}
                {person.artist && (
                  <Link
                    to={`/artist/${person.artist.id}`}
                    className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800">
                          {person.artist.name}
                        </p>
                        <p className="text-xs text-slate-600">Solo Artist</p>
                      </div>
                      <span className="text-xs rounded bg-slate-900 px-2 py-0.5 text-white font-medium">
                        {person.artist.artist_type}
                      </span>
                    </div>
                  </Link>
                )}

                {/* Group Memberships */}
                {person.memberships?.map((membership) => (
                  <Link
                    key={membership.id}
                    to={`/artist/${membership.artist.id}`}
                    className="block space-y-2 rounded-md border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800">
                          {membership.artist.name}
                        </p>
                        {membership.role && (
                          <p className="text-xs text-slate-600">
                            {membership.role}
                          </p>
                        )}
                      </div>
                      <span className="text-xs rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                        {membership.artist.artist_type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {membership.start_year && (
                        <span>
                          {membership.start_year}
                          {membership.end_year
                            ? ` – ${membership.end_year}`
                            : " – Present"}
                        </span>
                      )}
                    </div>
                    {membership.notes && (
                      <p className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                        {membership.notes}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Credits */}
          {person.credits && person.credits.length > 0 && (
            <Accordion.Root type="single" collapsible className="space-y-2">
              <Accordion.Item value="credits" className="border-none">
                <AccordionTrigger>
                  <span>Credits ({person.credits.length})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {person.credits.map((credit, idx) => {
                      const linkTo = credit.work
                        ? `/work/${credit.work.id}`
                        : credit.version
                          ? `/version/${credit.version.id}`
                          : null;

                      const content = (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800">
                                {credit.work?.title ||
                                  credit.version?.title ||
                                  "Unknown"}
                              </p>
                              {credit.role && (
                                <p className="text-xs text-slate-600">
                                  {credit.role}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {credit.is_primary && (
                                <span className="text-xs font-medium rounded bg-slate-900 text-white px-2 py-0.5">
                                  Primary
                                </span>
                              )}
                              {credit.work && (
                                <span className="text-xs rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                                  Work
                                </span>
                              )}
                              {credit.version && (
                                <span className="text-xs rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                                  Version
                                </span>
                              )}
                            </div>
                          </div>
                          {credit.version?.primary_artist && (
                            <p className="text-xs text-slate-600">
                              <span className="font-medium">Artist:</span>{" "}
                              {credit.version.primary_artist.name}
                            </p>
                          )}
                          {credit.version?.release_year && (
                            <p className="text-xs text-slate-600">
                              <span className="font-medium">Released:</span>{" "}
                              {credit.version.release_year}
                            </p>
                          )}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="space-y-2">
            {person.memberships && person.memberships.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Memberships
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {person.memberships.length}
                </p>
              </div>
            )}
            {person.credits && person.credits.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Credits
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {person.credits.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
