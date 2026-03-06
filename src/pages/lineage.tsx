import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import { buildLineageGraph } from "../utils/lineage";
import type {
  LineageGraph,
  LineageVersionNode,
  LineageWorkGroup,
} from "../utils/types";

// --- Constants ---
const VERSION_WIDTH = 240;
const VERSION_HEIGHT = 100;
const WORK_PADDING = 24;
const WORK_HEADER = 36;

// --- Nodes ---
type VersionNodeData = LineageVersionNode & { isEntry: boolean };

function VersionNode({ data }: { data: VersionNodeData }) {
  return (
    <div
      className={`rounded-lg border bg-white px-3 py-2 shadow-sm transition cursor-pointer ${
        data.isEntry
          ? "border-slate-500 ring-2 ring-slate-400 ring-offset-1"
          : "border-slate-200 hover:border-slate-300"
      }`}
      style={{ width: VERSION_WIDTH }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !w-0 !h-0 !border-0 !min-w-0 !min-h-0"
        isConnectable={false}
      />
      <div className="text-sm font-medium text-slate-800 leading-tight">
        {data.title}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="truncate text-xs text-slate-500">
          {data.primary_artist.name}
        </span>
        {data.release_year && (
          <span className="text-xs text-slate-400">{data.release_year}</span>
        )}
      </div>
      <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
        {data.version_type.replace(/_/g, " ")}
      </span>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-transparent !w-0 !h-0 !border-0 !min-w-0 !min-h-0"
        isConnectable={false}
      />
    </div>
  );
}

type WorkGroupData = LineageWorkGroup;

function WorkGroupNode({ data }: { data: WorkGroupData }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 h-full w-full">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !w-0 !h-0 !border-0 !min-w-0 !min-h-0"
        isConnectable={false}
      />
      <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 transition">
        {data.title}
        {data.language && (
          <span className="ml-1.5 font-normal normal-case">
            ({data.language})
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-transparent !w-0 !h-0 !border-0 !min-w-0 !min-h-0"
        isConnectable={false}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  versionNode: VersionNode,
  workGroup: WorkGroupNode,
} as unknown as NodeTypes;

// --- Layout ---

function layoutGraph(
  graph: LineageGraph,
  entryType: "version" | "work",
  entryId: string,
): { nodes: Node[]; edges: Edge[] } {
  // Use compound graph so dagre treats work groups as clusters
  const g = new dagre.graphlib.Graph({ compound: true });
  g.setGraph({
    rankdir: "LR",
    nodesep: 40,
    ranksep: 120,
    marginx: 20,
    marginy: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Register work groups as compound parent nodes
  for (const [workId] of graph.works) {
    g.setNode(`work-${workId}`, {});
  }

  // Add version nodes and parent them to their work group
  for (const [id, v] of graph.versions) {
    g.setNode(id, { width: VERSION_WIDTH, height: VERSION_HEIGHT });
    if (v.workId && graph.works.has(v.workId)) {
      g.setParent(id, `work-${v.workId}`);
    }
  }

  // Add version-level edges
  const edgeList: { source: string; target: string; crossWork: boolean }[] = [];
  for (const [id, v] of graph.versions) {
    if (v.based_on_version_id && graph.versions.has(v.based_on_version_id)) {
      g.setEdge(v.based_on_version_id, id);
      const sourceWork = graph.versions.get(v.based_on_version_id)?.workId;
      edgeList.push({
        source: v.based_on_version_id,
        target: id,
        crossWork: sourceWork !== v.workId,
      });
    }
  }

  // For works linked by based_on_work without any version-level edge between
  // them, add a layout-only edge so dagre orders the clusters correctly.
  for (const [, w] of graph.works) {
    if (!w.based_on_work_id || !graph.works.has(w.based_on_work_id)) continue;
    const sourceWork = graph.works.get(w.based_on_work_id)!;

    const alreadyConnected = edgeList.some((e) => {
      const sv = graph.versions.get(e.source);
      const tv = graph.versions.get(e.target);
      return (
        (sv?.workId === w.based_on_work_id && tv?.workId === w.id) ||
        (sv?.workId === w.id && tv?.workId === w.based_on_work_id)
      );
    });

    if (!alreadyConnected) {
      const sourceVid = sourceWork.versionIds.find((vid) =>
        graph.versions.has(vid),
      );
      const targetVid = w.versionIds.find((vid) => graph.versions.has(vid));
      if (sourceVid && targetVid) {
        g.setEdge(sourceVid, targetVid); // layout only, not rendered
      }
    }
  }

  dagre.layout(g);

  const nodes: Node[] = [];

  // Add work group nodes using dagre-computed compound bounding boxes
  for (const [workId] of graph.works) {
    const work = graph.works.get(workId);
    const dn = g.node(`work-${workId}`);
    if (!work || !dn) continue;

    const totalW = dn.width + WORK_PADDING * 2;
    const totalH = dn.height + WORK_PADDING * 2 + WORK_HEADER;

    nodes.push({
      id: `work-${workId}`,
      type: "workGroup",
      position: {
        x: dn.x - totalW / 2,
        y: dn.y - totalH / 2,
      },
      style: { width: totalW, height: totalH },
      data: work,
      selectable: false,
      draggable: false,
    });
  }

  // Determine the entry version id for highlighting
  let entryVersionId: string | null = null;
  if (entryType === "version") {
    entryVersionId = entryId;
  }

  // Add version nodes with positions relative to parent work group
  for (const [id, v] of graph.versions) {
    const pos = g.node(id);
    if (!pos) continue;

    const isEntry = id === entryVersionId;
    const absX = pos.x - VERSION_WIDTH / 2;
    const absY = pos.y - VERSION_HEIGHT / 2;
    let position = { x: absX, y: absY };
    let parentId: string | undefined;

    if (v.workId && graph.works.has(v.workId)) {
      const dn = g.node(`work-${v.workId}`);
      if (dn) {
        parentId = `work-${v.workId}`;
        const totalW = dn.width + WORK_PADDING * 2;
        const totalH = dn.height + WORK_PADDING * 2 + WORK_HEADER;
        position = {
          x: absX - (dn.x - totalW / 2),
          y: absY - (dn.y - totalH / 2),
        };
      }
    }

    nodes.push({
      id,
      type: "versionNode",
      position,
      data: { ...v, isEntry } as VersionNodeData,
      parentId,
      extent: "parent" as const,
      draggable: false,
    });
  }

  // Create React Flow edges for version lineage
  const edges: Edge[] = edgeList.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    type: "bezier",
    style: e.crossWork
      ? { stroke: "#64748b", strokeWidth: 1.5, strokeDasharray: "6 3" }
      : { stroke: "#94a3b8", strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: e.crossWork ? "#64748b" : "#94a3b8",
      width: 14,
      height: 14,
    },
  }));

  return { nodes, edges };
}

// --- Detail Dialog ---

function DetailDialog({
  open,
  onClose,
  version,
  work,
}: {
  open: boolean;
  onClose: () => void;
  version?: LineageVersionNode | null;
  work?: LineageWorkGroup | null;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95">
          <Dialog.Close asChild>
            <button className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:text-slate-600 transition">
              <Cross2Icon />
            </button>
          </Dialog.Close>

          {version && (
            <div className="space-y-3">
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                {version.title}
              </Dialog.Title>
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-medium">Artist:</span>{" "}
                  {version.primary_artist.name}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {version.version_type.replace(/_/g, " ")}
                </p>
                {version.release_year && (
                  <p>
                    <span className="font-medium">Year:</span>{" "}
                    {version.release_year}
                  </p>
                )}
              </div>
              <Link
                to={`/version/${version.id}`}
                className="inline-block mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
              >
                Go to Page
              </Link>
            </div>
          )}

          {work && (
            <div className="space-y-3">
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                {work.title}
              </Dialog.Title>
              <div className="space-y-1 text-sm text-slate-600">
                {work.language && (
                  <p>
                    <span className="font-medium">Language:</span>{" "}
                    <span className="capitalize">{work.language}</span>
                  </p>
                )}
                {work.origin_year_start && (
                  <p>
                    <span className="font-medium">Origin:</span>{" "}
                    {work.origin_year_start}
                  </p>
                )}
                <p>
                  <span className="font-medium">Versions:</span>{" "}
                  {work.versionIds.length}
                </p>
              </div>
              <Link
                to={`/work/${work.id}`}
                className="inline-block mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
              >
                Go to Page
              </Link>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// --- Legend ---

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500">
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded border-2 border-slate-500 ring-2 ring-slate-400 ring-offset-1 bg-white" />
        <span>Entry point</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-0.5 w-5 bg-slate-400" />
        <span>Same-work edge</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="h-0.5 w-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #64748b 0, #64748b 4px, transparent 4px, transparent 7px)",
          }}
        />
        <span>Cross-work edge</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-4 w-6 rounded border-2 border-dashed border-slate-300 bg-slate-50/50" />
        <span>Work group</span>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function LineagePage() {
  const { versionId, workId } = useParams<{
    versionId?: string;
    workId?: string;
  }>();

  const entryType = versionId ? "version" : "work";
  const entryId = (versionId ?? workId)!;

  const [graph, setGraph] = useState<LineageGraph | null>(null);
  const [progress, setProgress] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const [dialogVersion, setDialogVersion] = useState<LineageVersionNode | null>(
    null,
  );
  const [dialogWork, setDialogWork] = useState<LineageWorkGroup | null>(null);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    buildLineageGraph(entryType, entryId, baseUrl, setProgress)
      .then((g) => setGraph(g))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load graph"),
      );
  }, [entryType, entryId]);

  useEffect(() => {
    if (!graph) return;
    const { nodes: n, edges: e } = layoutGraph(graph, entryType, entryId);
    setNodes(n);
    setEdges(e);
  }, [graph, entryType, entryId, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!graph) return;
      if (node.type === "versionNode") {
        setDialogVersion(graph.versions.get(node.id) ?? null);
        setDialogWork(null);
      } else if (node.type === "workGroup") {
        const realId = node.id.replace("work-", "");
        setDialogWork(graph.works.get(realId) ?? null);
        setDialogVersion(null);
      }
    },
    [graph],
  );

  const closeDialog = useCallback(() => {
    setDialogVersion(null);
    setDialogWork(null);
  }, []);

  const memoNodeTypes = useMemo(() => nodeTypes, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <p className="text-sm text-slate-500">{progress}</p>
      </div>
    );
  }

  if (graph.versions.size === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        No lineage data found.
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      style={{ height: "calc(100vh - 160px)" }}
    >
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-semibold text-slate-900">
          Version Lineage
        </h2>
        <span className="text-xs text-slate-400">
          {graph.versions.size} version{graph.versions.size !== 1 ? "s" : ""},{" "}
          {graph.works.size} work{graph.works.size !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={memoNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e2e8f0" gap={20} size={1} />
          <Controls showInteractive={false} className="react-flow-controls" />
          <MiniMap
            nodeColor={(n) => (n.type === "workGroup" ? "#f1f5f9" : "#e2e8f0")}
            maskColor="rgba(241, 245, 249, 0.7)"
            className="react-flow-minimap"
          />
        </ReactFlow>
      </div>

      <div className="shrink-0">
        <Legend />
      </div>

      <DetailDialog
        open={!!dialogVersion || !!dialogWork}
        onClose={closeDialog}
        version={dialogVersion}
        work={dialogWork}
      />
    </div>
  );
}
