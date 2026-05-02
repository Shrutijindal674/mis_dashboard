import { Fragment, useEffect, useRef, useState } from "react";
import { cx } from "../../utils/helpers";

function PillScrollRow({
  items,
  activeId,
  autoScrollTargetId = null,
  onPick,
  accent,
  soft,
  rowLabel,
}) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const scrollRef = useRef(null);
  const itemRefs = useRef(new Map());

  useEffect(() => {
    const track = scrollRef.current;
    const targetId = autoScrollTargetId ?? activeId;
    const targetItem = itemRefs.current.get(targetId);
    if (!track || !targetItem) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const visibleLeft = track.scrollLeft;
      const visibleRight = visibleLeft + track.clientWidth;
      const itemLeft = targetItem.offsetLeft;
      const itemRight = itemLeft + targetItem.offsetWidth;

      if (itemLeft < visibleLeft + 12 || itemRight > visibleRight - 12) {
        const centeredLeft = itemLeft - Math.max(12, (track.clientWidth - targetItem.offsetWidth) / 2);
        track.scrollTo({
          left: Math.max(0, centeredLeft),
          behavior: "smooth",
        });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId, autoScrollTargetId, items]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;

    const updateArrows = () => {
      const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      setCanScrollLeft(node.scrollLeft > 8);
      setCanScrollRight(node.scrollLeft < maxScrollLeft - 8);
    };

    updateArrows();
    node.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    const raf = window.requestAnimationFrame(updateArrows);

    return () => {
      node.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      window.cancelAnimationFrame(raf);
    };
  }, [items, activeId]);

  const nudgeRow = (direction) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.min(280, Math.max(170, node.clientWidth * 0.58)),
      behavior: "smooth",
    });
  };

  const arrowClass =
    "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[13px] font-bold transition disabled:cursor-not-allowed";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={() => nudgeRow(-1)}
        disabled={!canScrollLeft}
        className={arrowClass}
        style={{
          color: canScrollLeft ? accent : "#64748b",
          borderColor: canScrollLeft ? `${accent}55` : "rgba(100,116,139,0.34)",
          background: canScrollLeft ? soft : "rgba(255,255,255,0.82)",
          opacity: canScrollLeft ? 1 : 0.72,
        }}
        aria-label={`Scroll ${rowLabel} left`}
        title="Scroll left"
      >
        {"<"}
      </button>

      <div
        ref={scrollRef}
        className="carousel-scroll-track min-w-0 flex-1 overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollBehavior: "smooth",
        }}
      >
        <div className="flex w-max items-center gap-2 pr-1">
          {items.map((item) => {
            const active = item.id === activeId;
            const isMappedDrill = item.variant === "mapped-drill";
            const isNestedParentToggle = item.variant === "nested-parent-toggle";
            const parentExpanded = Boolean(item.expanded);
            const showTrailingAction =
              isNestedParentToggle && (active || hoveredItemId === item.id || parentExpanded);
            const itemAccent = item.accent || accent;
            const itemSoft = item.soft || soft;

            return (
              <button
                key={item.id}
                ref={(node) => {
                  if (node) itemRefs.current.set(item.id, node);
                  else itemRefs.current.delete(item.id);
                }}
                type="button"
                onClick={() => onPick(item.id)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId((value) => (value === item.id ? null : value))}
                onFocus={() => setHoveredItemId(item.id)}
                onBlur={() => setHoveredItemId((value) => (value === item.id ? null : value))}
                aria-expanded={isNestedParentToggle ? parentExpanded : undefined}
                aria-label={
                  isNestedParentToggle
                    ? `${item.label}. ${parentExpanded ? "Collapse sub-categories" : "Expand sub-categories"}`
                    : undefined
                }
                className={cx(
                  "flex h-9 min-w-[124px] max-w-[240px] items-center rounded-full border px-3 text-[12.5px] font-semibold transition",
                  isNestedParentToggle ? "justify-between gap-2 text-left" : "justify-center text-center",
                )}
                style={{
                  background: isNestedParentToggle
                    ? parentExpanded || active
                      ? itemSoft
                      : "rgba(255,255,255,0.96)"
                    : active
                      ? itemAccent
                      : isMappedDrill
                        ? itemSoft
                        : "rgba(255,255,255,0.96)",
                  color: isNestedParentToggle
                    ? itemAccent
                    : active
                      ? "white"
                      : isMappedDrill
                        ? itemAccent
                        : "#334155",
                  borderColor: isNestedParentToggle
                    ? parentExpanded || active
                      ? `${itemAccent}45`
                      : "rgba(148,163,184,0.18)"
                    : active
                      ? itemAccent
                      : isMappedDrill
                        ? `${itemAccent}30`
                        : "rgba(148,163,184,0.18)",
                  boxShadow: active || parentExpanded
                    ? `0 8px 18px ${itemAccent}1f`
                    : "0 1px 2px rgba(15,23,42,0.04)",
                }}
                title={item.tooltip || item.label}
              >
                <span className="truncate">{item.label}</span>
                {isNestedParentToggle ? (
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full border transition duration-200"
                    style={{
                      background: `${itemAccent}12`,
                      borderColor: `${itemAccent}30`,
                      color: itemAccent,
                      opacity: showTrailingAction ? 1 : 0.9,
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3 transition-transform duration-300"
                      style={{ transform: parentExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      fill="none"
                    >
                      <path
                        d="M6 3.5 10.5 8 6 12.5"
                        stroke="currentColor"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => nudgeRow(1)}
        disabled={!canScrollRight}
        className={arrowClass}
        style={{
          color: canScrollRight ? accent : "#64748b",
          borderColor: canScrollRight ? `${accent}55` : "rgba(100,116,139,0.34)",
          background: canScrollRight ? soft : "rgba(255,255,255,0.82)",
          opacity: canScrollRight ? 1 : 0.72,
        }}
        aria-label={`Scroll ${rowLabel} right`}
        title="Scroll right"
      >
        {">"}
      </button>
    </div>
  );
}

export default function CombinedKpiSelector({ title, helper, rows, accent, soft }) {
  const visibleRows = rows.filter((row) => row?.items?.length);
  const divider = "rgba(59,130,246,0.13)";

  return (
    <div
      className="overflow-hidden rounded-[24px] shadow-sm"
      style={{
        background: "rgba(255,255,255,0.94)",
        border: "1px solid rgba(59,130,246,0.15)",
      }}
    >
      <div
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        <div className="text-sm font-extrabold leading-tight" style={{ color: "#0f172a" }}>
          {title}
        </div>
        {helper ? (
          <div className="mt-1 text-[11px] font-semibold leading-4" style={{ color: "#64748b" }}>
            {helper}
          </div>
        ) : null}
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "clamp(118px, 24vw, 172px) minmax(0, 1fr)" }}
      >
        {visibleRows.map((row) => (
          <Fragment key={row.id}>
            <div
              className="flex min-h-[58px] items-center border-r px-4 py-2"
              style={{ borderColor: divider }}
            >
              <div className="text-[12px] font-extrabold leading-tight" style={{ color: "#334155" }}>
                {row.label}
                {String(row.label).trim().endsWith(":") ? "" : ":"}
              </div>
            </div>
            <div
              className="min-w-0 px-3 py-2.5"
            >
              <PillScrollRow
                items={row.items}
                activeId={row.activeId}
                autoScrollTargetId={row.autoScrollTargetId}
                onPick={row.onPick}
                accent={row.accent || accent}
                soft={row.soft || soft}
                rowLabel={row.label}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
