import { useState, useEffect } from "react";

type CatalogueStats = {
  works: number;
  versions: number;
  artists: number;
  releases: number;
  performances: number;
  persons: number;
};

const STAT_CARDS: { key: keyof CatalogueStats; label: string }[] = [
  { key: "works", label: "Works" },
  { key: "versions", label: "Versions" },
  { key: "artists", label: "Artists" },
  { key: "releases", label: "Releases" },
  { key: "performances", label: "Performances" },
];

export default function HomePage() {
  const [stats, setStats] = useState<CatalogueStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${baseUrl}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [baseUrl]);

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
          Stats
        </h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {STAT_CARDS.map((c) => (
              <div
                key={c.key}
                className="animate-pulse rounded-xl border border-slate-200 bg-white px-6 py-8"
              >
                <div className="mb-2 h-9 w-14 rounded bg-slate-100" />
                <div className="h-5 w-20 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {STAT_CARDS.map((c) => (
              <div
                key={c.key}
                className="rounded-xl border border-slate-200 bg-white px-6 py-8"
              >
                <p className="text-4xl font-semibold text-slate-800">
                  {stats[c.key].toLocaleString()}
                </p>
                <p className="mt-1 text-base text-slate-500">{c.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Could not load stats.</p>
        )}
      </section>
    </div>
  );
}
