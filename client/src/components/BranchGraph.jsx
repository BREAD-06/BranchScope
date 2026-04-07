import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "../context/ThemeContext";

const STALE_COLORS = {
  fresh:      "#22c55e",
  aging:      "#f59e0b",
  stale:      "#f97316",
  very_stale: "#ef4444",
};

const CARD_W = 220;
const CARD_H = 115;
const COL_W  = 270;
const ROW_H  = 140;
const COLS   = 3;
const ROOT_Y = 40;

function computeLayout(branches) {
  const cols = [[], [], []];
  branches.forEach((b, i) => cols[i % COLS].push(b));
  const maxRows = Math.max(...cols.map(c => c.length), 1);
  const pos = {};
  cols.forEach((col, ci) => {
    col.forEach((b, ri) => {
      pos[b.name] = { x: ci * COL_W, y: ROOT_Y + 75 + ri * ROW_H };
    });
  });
  const totalW = COLS * COL_W;
  const totalH = ROOT_Y + 75 + maxRows * ROW_H + 30;
  const rootX  = totalW / 2;
  return { cols, pos, totalW, totalH, rootX, maxRows };
}

export default function BranchGraph({ branches, defaultBranch, owner, repo }) {
  const { isDark }   = useTheme();
  const graphRef     = useRef();   // the inner graph area (SVG + cards share this)
  const svgRef       = useRef();
  const cardLayerRef = useRef();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!branches || branches.length === 0) return;

    const { cols, pos, totalW, totalH, rootX } = computeLayout(branches);
    const viewW = graphRef.current?.clientWidth || 900;

    const svg = d3.select(svgRef.current)
      .attr("width",  viewW)
      .attr("height", totalH);

    svg.selectAll("*").remove();
    const g = svg.append("g");

    // ── Sync zoom to SVG <g> AND HTML card layer ─────────────
    const syncTransform = (t) => {
      g.attr("transform", t.toString());
      if (cardLayerRef.current) {
        cardLayerRef.current.style.transform =
          `translate(${t.x}px,${t.y}px) scale(${t.k})`;
        cardLayerRef.current.style.transformOrigin = "0 0";
      }
    };

    const zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .on("zoom", e => {
        syncTransform(e.transform);
        svg.style("cursor", e.sourceEvent?.buttons ? "grabbing" : "grab");
      });

    svg.call(zoom).style("cursor", "grab");

    // Initial transform: fit horizontally
    const scale = Math.min(1.0, (viewW - 40) / (totalW + 10));
    const tx    = (viewW - totalW * scale) / 2;
    const ty    = 20;
    const initT = d3.zoomIdentity.translate(tx, ty).scale(scale);
    // Apply without emitting zoom event (to avoid react state update loop)
    g.attr("transform", initT.toString());
    if (cardLayerRef.current) {
      cardLayerRef.current.style.transform =
        `translate(${initT.x}px,${initT.y}px) scale(${initT.k})`;
      cardLayerRef.current.style.transformOrigin = "0 0";
    }
    svg.call(zoom.transform, initT);

    // ── Draw root → top-of-each-column curved paths ─────────
    cols.forEach((col, ci) => {
      if (!col.length) return;
      const first     = col[0];
      const cardPos   = pos[first.name];
      const cx        = cardPos.x + CARD_W / 2;
      const isDefault = first.name === defaultBranch;
      const color     = isDefault ? "#f59e0b"
        : (STALE_COLORS[first.stale_level] || "#22c55e");

      const x1 = rootX, y1 = ROOT_Y + 16;
      const x2 = cx,    y2 = cardPos.y;
      const mid = y1 + (y2 - y1) * 0.5;

      const path = g.append("path")
        .attr("d", `M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`)
        .attr("fill",           "none")
        .attr("stroke",         color)
        .attr("stroke-width",   isDefault ? 2.5 : 1.5)
        .attr("stroke-opacity", isDefault ? 0.8 : 0.45)
        .attr("data-col",       ci)             // ← tag for selection
        .attr("data-linetype",  "root");

      const len = path.node().getTotalLength();
      path.attr("stroke-dasharray", `${len},${len}`)
        .attr("stroke-dashoffset",  len)
        .transition().duration(700).delay(ci * 100).ease(d3.easeCubicOut)
        .attr("stroke-dashoffset",  0)
        .on("end", function () {
          if (!isDefault) d3.select(this).attr("stroke-dasharray", "7,5");
          else            d3.select(this).attr("stroke-dasharray", null);
        });
    });

    // ── Draw VERTICAL DASHED lines between cards in same col ──
    cols.forEach((col, ci) => {
      col.forEach((b, ri) => {
        if (ri === col.length - 1) return;
        const curr  = pos[b.name];
        const next  = pos[col[ri + 1].name];
        const cx    = curr.x + CARD_W / 2;
        const y1    = curr.y + CARD_H;
        const y2    = next.y;
        const color = STALE_COLORS[col[ri + 1].stale_level] || "#22c55e";

        g.append("line")
          .attr("x1", cx).attr("y1", y1)
          .attr("x2", cx).attr("y2", y2)
          .attr("stroke",           color)
          .attr("stroke-width",     2)
          .attr("stroke-opacity",   0.65)
          .attr("stroke-dasharray", "7,5")
          .attr("data-from",        b.name)          // ← tag for selection
          .attr("data-to",          col[ri + 1].name)
          .attr("data-col",         ci)
          .attr("data-linetype",    "chain")
          .style("opacity", 0)
          .transition()
          .delay(500 + ci * 100 + ri * 80)
          .duration(400)
          .style("opacity", 1);
      });
    });

    // ── Root pill ────────────────────────────────────────────
    const rg = g.append("g").attr("transform", `translate(${rootX},${ROOT_Y})`);
    rg.append("rect")
      .attr("x", -58).attr("y", -14).attr("width", 116).attr("height", 28).attr("rx", 14)
      .attr("fill", "rgba(34,197,94,0.08)").attr("stroke", "#22c55e").attr("stroke-width", 1.5);
    rg.append("text")
      .attr("text-anchor", "middle").attr("dy", "0.35em")
      .attr("fill", "#22c55e").attr("font-size", 12).attr("font-weight", 600)
      .attr("font-family", "monospace").text("⎇ repo root");

  }, [branches, defaultBranch, isDark]);

  // ── Highlight lines when selection changes ───────────────
  useEffect(() => {
    if (!svgRef.current || !branches) return;
    const svg = d3.select(svgRef.current);

    if (!selected) {
      // Reset everything to default state
      svg.selectAll("[data-linetype='root']")
        .attr("stroke-width",   (_, i, nodes) => {
          const el = d3.select(nodes[i]);
          // default branch line gets the thicker stroke back
          return el.attr("stroke") === "#f59e0b" ? 2.5 : 1.5;
        })
        .attr("stroke-opacity", (_, i, nodes) => {
          const el = d3.select(nodes[i]);
          return el.attr("stroke") === "#f59e0b" ? 0.8 : 0.45;
        });
      svg.selectAll("[data-linetype='chain']")
        .attr("stroke-width",   2)
        .attr("stroke-opacity", 0.65);
      return;
    }

    // Find which column and row the selected branch is in
    const { cols } = computeLayout(branches);
    let selCol = -1, selRow = -1;
    cols.forEach((col, ci) => {
      const ri = col.findIndex(b => b.name === selected);
      if (ri !== -1) { selCol = ci; selRow = ri; }
    });
    if (selCol === -1) return;

    const selColor = STALE_COLORS[
      branches.find(b => b.name === selected)?.stale_level
    ] || "#22c55e";

    // Dim all lines first
    svg.selectAll("[data-linetype='root']")
      .attr("stroke-opacity", 0.12)
      .attr("stroke-width",   1);
    svg.selectAll("[data-linetype='chain']")
      .attr("stroke-opacity", 0.12)
      .attr("stroke-width",   1);

    // Highlight root line for selected column
    svg.selectAll(`[data-linetype='root'][data-col='${selCol}']`)
      .attr("stroke",         selColor)
      .attr("stroke-opacity", 0.95)
      .attr("stroke-width",   3)
      .attr("stroke-dasharray", null);   // solid when highlighted

    // Highlight all chain lines from top of col down to selected row
    for (let ri = 0; ri < selRow; ri++) {
      svg.selectAll(`[data-linetype='chain'][data-col='${selCol}'][data-from='${cols[selCol][ri].name}']`)
        .attr("stroke",         selColor)
        .attr("stroke-opacity", 0.9)
        .attr("stroke-width",   3)
        .attr("stroke-dasharray", "7,5");
    }
    // Also highlight the chain line leading INTO the selected card
    if (selRow > 0) {
      svg.selectAll(`[data-linetype='chain'][data-to='${selected}']`)
        .attr("stroke",         selColor)
        .attr("stroke-opacity", 0.95)
        .attr("stroke-width",   3)
        .attr("stroke-dasharray", "7,5");
    }

  }, [selected, branches]);

  if (!branches || branches.length === 0) return null;

  const { cols, pos, totalW, totalH } = computeLayout(branches);
  const viewW0 = graphRef.current?.clientWidth || 900;
  const scale0 = Math.min(1.0, (viewW0 - 40) / (totalW + 10));
  const tx0    = (viewW0 - totalW * scale0) / 2;
  const ty0    = 20;

  return (
    <div style={{
      background:   isDark ? "#090e1d" : "#f8fafc",
      borderRadius: 18,
      border:       isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.08)",
      boxShadow:    isDark
        ? "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)"
        : "0 4px 20px rgba(0,0,0,0.08)",
      overflow:     "hidden",
    }}>
      {/* Hint — outside graph area so it never offsets card layer */}
      <div style={{ fontSize: 11, color: "#4b5563", padding: "10px 16px 6px" }}>
        Scroll to zoom · Drag to pan · Click a branch to select · ↗ opens on GitHub
      </div>

      {/* Graph area — SVG and card layer share this as parent */}
      <div ref={graphRef} style={{ position: "relative", overflow: "hidden" }}>

        {/* SVG: lines, root pill, zoom listener */}
        <svg
          ref={svgRef}
          style={{ display: "block", width: "100%", height: totalH }}
        />

        {/* Card layer: absolutely positioned, top:0 = SVG top, synced by zoom */}
        <div
          ref={cardLayerRef}
          style={{
            position:        "absolute",
            top:             0,
            left:            0,
            transformOrigin: "0 0",
            transform:       `translate(${tx0}px,${ty0}px) scale(${scale0})`,
            pointerEvents:   "none",
          }}
        >
          {branches.map((b, i) => {
            const p = pos[b.name];
            if (!p) return null;
            const isDefault = b.name === defaultBranch;
            const isSel     = selected === b.name;
            const color     = STALE_COLORS[b.stale_level] || STALE_COLORS.fresh;
            const author    = b.last_commit?.author   ?? "unknown";
            const daysAgo   = b.last_commit?.days_ago ?? "?";
            const githubUrl = owner && repo
              ? `https://github.com/${owner}/${repo}/tree/${encodeURIComponent(b.name)}`
              : null;

            const borderColor = isSel     ? color
              : isDefault ? "#f59e0b"
              : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)";

            return (
              <div
                key={b.name}
                onClick={() => setSelected(isSel ? null : b.name)}
                style={{
                  position:            "absolute",
                  left:                p.x,
                  top:                 p.y,
                  width:               CARD_W,
                  height:              CARD_H,
                  background:          isSel
                    ? `${color}12`
                    : isDark
                    ? "rgba(10, 16, 35, 0.92)"
                    : "rgba(248, 250, 252, 0.92)",
                  backdropFilter:      "blur(10px)",
                  WebkitBackdropFilter:"blur(10px)",
                  border:              `${isSel ? "2px" : "1px"} solid ${borderColor}`,
                  borderRadius:        12,
                  boxSizing:           "border-box",
                  padding:             "10px 12px",
                  cursor:              "pointer",
                  fontFamily:          "'Inter', sans-serif",
                  overflow:            "hidden",
                  pointerEvents:       "all",
                  transition:          "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                  boxShadow:           isSel
                    ? `0 0 0 1px ${color}30, 0 6px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`
                    : isDark
                    ? `0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`
                    : `0 2px 10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)`,
                  opacity:             0,
                  animation:           `cardIn 0.4s cubic-bezier(0.22,1,0.36,1) ${80 + i * 45}ms forwards`,
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 600,
                    color: isDark ? "#e2e8f0" : "#0f172a",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>
                    {b.name}
                  </span>
                  {b.is_stale && (
                    <span style={{ fontSize: 9, fontWeight: 700, color,
                      padding: "1px 5px", background: `${color}18`,
                      border: `1px solid ${color}30`, borderRadius: 4 }}>
                      ⚠ {b.stale_level.replace("_", " ")}
                    </span>
                  )}
                  {isDefault && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e",
                      padding: "1px 5px", background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.25)", borderRadius: 4 }}>
                      default
                    </span>
                  )}
                </div>

                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <span style={{ color: "#6366f1", fontSize: 11 }}>👤</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{author}</span>
                </div>

                {/* Days ago */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>🌙</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color }}>{daysAgo} days ago</span>
                </div>

                {/* Status */}
                <div style={{ fontSize: 9, color: "#374151" }}>
                  Status: {b.stale_level?.replace("_", " ") ?? "fresh"}
                </div>

                {/* GitHub ↗ */}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = color;
                      e.currentTarget.style.borderColor = `${color}50`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "#4b5563";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                    style={{
                      position: "absolute", bottom: 8, right: 8,
                      width: 22, height: 22, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#4b5563",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      textDecoration: "none",
                      transition: "color 0.2s, border-color 0.2s",
                    }}
                  >↗</a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
