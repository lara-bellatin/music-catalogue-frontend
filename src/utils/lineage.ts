import type {
  LineageGraph,
  LineageVersionNode,
  LineageWorkGroup,
} from "./types";

const MAX_DEPTH = 50;

type ProgressCallback = (message: string) => void;

async function fetchVersion(
  id: string,
  baseUrl: string,
): Promise<LineageVersionNode | null> {
  try {
    const res = await fetch(`${baseUrl}/versions/${id}`);
    if (!res.ok) return null;
    const v = await res.json();
    return {
      id: v.id,
      title: v.title,
      version_type: v.version_type,
      primary_artist: {
        id: v.primary_artist?.id ?? "",
        name: v.primary_artist?.name ?? "Unknown",
      },
      release_year: v.release_year,
      workId: v.work?.id,
      based_on_version_id: v.based_on_version?.id,
      derived_version_ids:
        v.derived_versions?.map((d: { id: string }) => d.id) ?? [],
    };
  } catch {
    return null;
  }
}

async function fetchWork(
  id: string,
  baseUrl: string,
): Promise<LineageWorkGroup | null> {
  try {
    const res = await fetch(`${baseUrl}/works/${id}`);
    if (!res.ok) return null;
    const w = await res.json();
    return {
      id: w.id,
      title: w.title,
      language: w.language,
      origin_year_start: w.origin_year_start,
      versionIds: w.versions?.map((v: { id: string }) => v.id) ?? [],
      based_on_work_id: w.based_on_work?.id,
      derived_work_ids: w.derived_works?.map((d: { id: string }) => d.id) ?? [],
    };
  } catch {
    return null;
  }
}

export async function buildLineageGraph(
  entryType: "version" | "work",
  entryId: string,
  baseUrl: string,
  onProgress?: ProgressCallback,
): Promise<LineageGraph> {
  const versions = new Map<string, LineageVersionNode>();
  const works = new Map<string, LineageWorkGroup>();
  const visitedVersions = new Set<string>();
  const visitedWorks = new Set<string>();

  let versionQueue: string[] = [];
  let workQueue: string[] = [];

  // Seed the queues
  if (entryType === "version") {
    versionQueue.push(entryId);
  } else {
    workQueue.push(entryId);
  }

  // Unified BFS: keep going until both queues are empty
  for (let round = 0; round < MAX_DEPTH; round++) {
    const newVersions = versionQueue.filter((id) => !visitedVersions.has(id));
    const newWorks = workQueue.filter((id) => !visitedWorks.has(id));

    if (newVersions.length === 0 && newWorks.length === 0) break;

    onProgress?.(
      `Round ${round + 1}: ${newVersions.length} version(s), ${newWorks.length} work(s)...`,
    );

    // Mark as visited
    newVersions.forEach((id) => visitedVersions.add(id));
    newWorks.forEach((id) => visitedWorks.add(id));

    // Fetch versions and works concurrently
    const [versionResults, workResults] = await Promise.all([
      Promise.allSettled(newVersions.map((id) => fetchVersion(id, baseUrl))),
      Promise.allSettled(newWorks.map((id) => fetchWork(id, baseUrl))),
    ]);

    const nextVersionQueue: string[] = [];
    const nextWorkQueue: string[] = [];

    // Process fetched versions
    for (const r of versionResults) {
      if (r.status !== "fulfilled" || !r.value) continue;
      const v = r.value;
      versions.set(v.id, v);

      // Follow version-level lineage
      if (v.based_on_version_id && !visitedVersions.has(v.based_on_version_id))
        nextVersionQueue.push(v.based_on_version_id);
      for (const did of v.derived_version_ids) {
        if (!visitedVersions.has(did)) nextVersionQueue.push(did);
      }

      // Discover parent work
      if (v.workId && !visitedWorks.has(v.workId)) nextWorkQueue.push(v.workId);
    }

    // Process fetched works
    for (const r of workResults) {
      if (r.status !== "fulfilled" || !r.value) continue;
      const w = r.value;
      works.set(w.id, w);

      // Queue all versions belonging to this work
      for (const vid of w.versionIds) {
        if (!visitedVersions.has(vid)) nextVersionQueue.push(vid);
      }

      // Follow work-level lineage
      if (w.based_on_work_id && !visitedWorks.has(w.based_on_work_id))
        nextWorkQueue.push(w.based_on_work_id);
      for (const dwid of w.derived_work_ids) {
        if (!visitedWorks.has(dwid)) nextWorkQueue.push(dwid);
      }
    }

    versionQueue = nextVersionQueue;
    workQueue = nextWorkQueue;
  }

  onProgress?.("Graph ready.");
  return { versions, works };
}
