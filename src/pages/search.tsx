import { useState } from "react";
import type { FormEvent } from "react";
import { ToggleGroup } from "radix-ui";
import { Link } from "react-router-dom";
import type { EntityType, SearchResult } from "../utils/types";
import { ENTITY_TYPES } from "../utils/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedEntities, setSelectedEntities] = useState<EntityType[]>(
    ENTITY_TYPES.map(({ value }) => value),
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a search term first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("query", trimmedQuery);

      if (selectedEntities.length > 0) {
        selectedEntities.forEach((entityType) =>
          params.append("entity_type", entityType),
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/search?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const payload: SearchResult[] = await response.json();
      setResults(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchResults();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-slate-600"
            htmlFor="search-input"
          >
            Search
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="search-input"
              type="text"
              placeholder="Search by people, works, releases..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-600">
            Included Entities
          </span>
          <ToggleGroup.Root
            type="multiple"
            value={selectedEntities}
            onValueChange={(value) =>
              setSelectedEntities(value as EntityType[])
            }
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
      </form>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-700">Results</h2>
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {!error && results.length === 0 && !isLoading && (
          <div className="rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            Search to see matching catalogue entries.
          </div>
        )}
        {!error && results.length > 0 && (
          <ul className="grid gap-3">
            {results.map((result) => {
              const card = (
                <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">
                        {result.display_text}
                      </h3>
                      <p className="text-sm text-slate-500">
                        ID: {result.entity_id}
                      </p>
                    </div>
                    <span className="inline-flex h-7 items-center rounded-full border border-slate-300 px-3 text-xs font-medium uppercase tracking-wide text-slate-600">
                      {result.entity_type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Rank score: {result.rank.toFixed(2)}
                  </p>
                </article>
              );

              return (
                <li key={`${result.entity_type}-${result.entity_id}`}>
                  <Link
                    to={`/${result.entity_type}/${result.entity_id}`}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  >
                    {card}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
