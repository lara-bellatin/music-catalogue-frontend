import { useState, useEffect, useCallback } from "react";
import { ToggleGroup } from "radix-ui";
import { Link, useSearchParams } from "react-router-dom";
import type { EntityType, SearchResult } from "../utils/types";
import { ENTITY_TYPES } from "../utils/types";

const PAGE_SIZE = 20;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [selectedEntities, setSelectedEntities] = useState<EntityType[]>(
    ENTITY_TYPES.map(({ value }) => value),
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(
    async (searchQuery: string, searchOffset: number, append: boolean) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("query", trimmed);
        params.append("offset", String(searchOffset));

        if (selectedEntities.length > 0) {
          selectedEntities.forEach((entityType) =>
            params.append("entity_types", entityType),
          );
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/search?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }

        const payload = await response.json();
        const items: SearchResult[] = payload.results ?? payload;
        setResults((prev) => (append ? [...prev, ...items] : items));
        setHasMore(items.length >= PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
        if (!append) setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedEntities],
  );

  // Auto-search when URL query param changes
  useEffect(() => {
    const urlQuery = searchParams.get("query") ?? "";
    if (urlQuery) {
      setOffset(0);
      fetchResults(urlQuery, 0, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLoadMore = () => {
    const urlQuery = searchParams.get("query") ?? "";
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchResults(urlQuery, nextOffset, true);
  };

  const urlQuery = searchParams.get("query");

  return (
    <div className="flex flex-col gap-6">
      {urlQuery && (
        <h2 className="text-lg font-semibold text-slate-700">
          Results for "{urlQuery}"
        </h2>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-600">
          Filter by type
        </span>
        <ToggleGroup.Root
          type="multiple"
          value={selectedEntities}
          onValueChange={(value) => setSelectedEntities(value as EntityType[])}
          className="flex flex-wrap gap-2"
        >
          {ENTITY_TYPES.map(({ label, value }) => (
            <ToggleGroup.Item
              key={value}
              value={value}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition data-[state=on]:border-slate-900 data-[state=on]:bg-slate-900 data-[state=on]:text-white"
            >
              {label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>

      <section className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && results.length === 0 && !isLoading && (
          <div className="rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            {urlQuery
              ? "No results found."
              : "Search to see matching catalogue entries."}
          </div>
        )}

        {results.length > 0 && (
          <ul className="grid gap-3">
            {results.map((result) => (
              <li key={`${result.entity_type}-${result.entity_id}`}>
                <Link
                  to={`/${result.entity_type}/${result.entity_id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-slate-800">
                          {result.display_text}
                        </h3>
                        {result.secondary_text && (
                          <p className="truncate text-sm text-slate-500">
                            {result.secondary_text}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-slate-300 px-3 text-xs font-medium uppercase tracking-wide text-slate-600">
                        {result.entity_type}
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {hasMore && !isLoading && (
          <button
            type="button"
            onClick={handleLoadMore}
            className="mx-auto inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Load more
          </button>
        )}

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          </div>
        )}
      </section>
    </div>
  );
}
