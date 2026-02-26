import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "radix-ui";

type ExtractSource = "cnw" | "spotify-album";

function extractSpotifyAlbumId(url: string): string | null {
  const match = url.match(/\/album\/([^?/]+)/);
  return match ? match[1] : null;
}

export default function ExtractDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<ExtractSource>("cnw");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const resetForm = () => {
    setSource("cnw");
    setUrl("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Please enter a URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      let endpoint: string;
      let body: Record<string, string>;

      if (source === "cnw") {
        endpoint = `${baseUrl}/extract/cnw`;
        body = { source: trimmedUrl };
      } else {
        const albumId = extractSpotifyAlbumId(trimmedUrl);
        if (!albumId) {
          setError(
            "Could not extract album ID from URL. Expected format: https://open.spotify.com/album/...",
          );
          setIsSubmitting(false);
          return;
        }
        endpoint = `${baseUrl}/extract/spotify-album`;
        body = { album_id: albumId };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const path =
        source === "cnw" ? `/work/${data.id}` : `/release/${data.id}`;
      setOpen(false);
      resetForm();
      navigate(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <Dialog.Trigger asChild>
        <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          Extract
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-lg focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            Extract from Source
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">
            Import data from an external catalogue or platform.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-slate-700">
                Source
              </legend>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="source"
                  value="cnw"
                  checked={source === "cnw"}
                  onChange={() => setSource("cnw")}
                  className="accent-slate-700"
                />
                Carl Nielsen Works Catalogue
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="source"
                  value="spotify-album"
                  checked={source === "spotify-album"}
                  onChange={() => setSource("spotify-album")}
                  className="accent-slate-700"
                />
                Spotify Album
              </label>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="extract-url"
                className="text-sm font-medium text-slate-700"
              >
                URL
              </label>
              <input
                id="extract-url"
                type="url"
                placeholder={
                  source === "cnw"
                    ? "https://..."
                    : "https://open.spotify.com/album/..."
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {isSubmitting ? "Extracting..." : "Extract"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
