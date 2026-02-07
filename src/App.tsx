import { useState, useEffect, useRef } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import WorkPage from "./pages/work";
import PersonPage from "./pages/person";
import ArtistPage from "./pages/artist";

type EntityType = "artist" | "person" | "version" | "work";

type SearchResult = {
  entity_type: EntityType;
  entity_id: string;
  display_text: string;
  rank: number;
};

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const debounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("query", trimmed);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/search?${params.toString()}`,
        );
        if (response.ok) {
          const payload: SearchResult[] = await response.json();
          setResults(payload.slice(0, 8));
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setQuery("");
    setIsOpen(false);
    navigate(`/${result.entity_type}/${result.entity_id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {results.map((result) => (
            <button
              key={`${result.entity_type}-${result.entity_id}`}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-slate-50"
            >
              <span className="truncate font-medium text-slate-800">
                {result.display_text}
              </span>
              <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {result.entity_type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
        <header className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Music Catalogue
          </h1>
          <SearchBar />
        </header>

        <Routes>
          <Route index element={null} />
          <Route path="/work/:workId" element={<WorkPage />} />
          <Route path="/person/:personId" element={<PersonPage />} />
          <Route path="/artist/:artistId" element={<ArtistPage />} />
        </Routes>
      </div>
    </div>
  );
}
