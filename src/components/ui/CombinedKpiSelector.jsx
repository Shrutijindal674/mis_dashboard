import { useEffect, useRef, useState } from "react";
import { cx } from "../../utils/helpers";

function UnavailableIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M5.5 14.5 14.5 5.5" />
    </svg>
  );
}

function DisabledHoverTooltip({ message, children }) {
  if (!message) return children;

  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-[170] mb-2 hidden -translate-x-1/2 items-center gap-1.5 whitespace-nowrap border border-slate-950 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm group-hover:inline-flex group-focus-within:inline-flex">
        <UnavailableIcon className="h-3.5 w-3.5 text-rose-500" />
        <span>{message}</span>
      </span>
    </span>
  );
}

function PillScrollRow({
  items,
  activeId,
  activeIds = [],
  autoScrollTargetId = null,
  onPick,
  accent,
  soft,
  rowLabel,
  onRightAction,
  disabled = false,
  disabledMessage = "",
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
  }, [activeId, activeIds, autoScrollTargetId, items]);

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
    if (disabled) return;
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
        disabled={disabled || !canScrollLeft}
        className={arrowClass}
        style={{
          color: disabled ? "#94a3b8" : canScrollLeft ? accent : "#64748b",
          borderColor: disabled ? "rgba(148,163,184,0.24)" : canScrollLeft ? `${accent}55` : "rgba(100,116,139,0.34)",
          background: disabled ? "rgba(148,163,184,0.08)" : canScrollLeft ? soft : "rgba(255,255,255,0.82)",
          opacity: disabled ? 0.72 : canScrollLeft ? 1 : 0.72,
        }}
        aria-label={`Scroll ${rowLabel} left`}
        title={disabled ? disabledMessage : "Scroll left"}
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
            const itemDisabled = disabled || Boolean(item.disabled);
            const itemDisabledMessage = item.disabledMessage || disabledMessage;
            const active = !itemDisabled && (item.id === activeId || activeIds.includes(item.id));
            const isMappedDrill = item.variant === "mapped-drill";
            const isNestedParentToggle = item.variant === "nested-parent-toggle";
            const parentExpanded = Boolean(item.expanded);
            const showTrailingAction =
              !itemDisabled && isNestedParentToggle && (active || hoveredItemId === item.id || parentExpanded);
            const itemAccent = item.accent || accent;
            const itemSoft = item.soft || soft;

            const button = (
              <button
                ref={(node) => {
                  if (node) itemRefs.current.set(item.id, node);
                  else itemRefs.current.delete(item.id);
                }}
                type="button"
                onClick={(event) => {
                  if (itemDisabled) {
                    event.preventDefault();
                    return;
                  }
                  onPick(item.id);
                }}
                onMouseEnter={() => !itemDisabled && setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId((value) => (value === item.id ? null : value))}
                onFocus={() => !itemDisabled && setHoveredItemId(item.id)}
                onBlur={() => setHoveredItemId((value) => (value === item.id ? null : value))}
                aria-disabled={itemDisabled}
                tabIndex={itemDisabled ? -1 : 0}
                aria-expanded={!itemDisabled && isNestedParentToggle ? parentExpanded : undefined}
                aria-label={
                  !itemDisabled && isNestedParentToggle
                    ? `${item.label}. ${parentExpanded ? "Collapse sub-categories" : "Expand sub-categories"}`
                    : undefined
                }
                className={cx(
                  "flex h-9 min-w-[124px] max-w-[240px] items-center rounded-full border px-3 text-[12.5px] font-semibold transition",
                  itemDisabled ? "cursor-not-allowed grayscale" : "",
                  isNestedParentToggle ? "justify-between gap-2 text-left" : "justify-center text-center",
                )}
                style={{
                  background: itemDisabled
                    ? "rgba(148,163,184,0.08)"
                    : isNestedParentToggle
                    ? parentExpanded || active
                      ? itemSoft
                      : "rgba(255,255,255,0.96)"
                    : active
                      ? itemAccent
                      : isMappedDrill
                        ? itemSoft
                        : "rgba(255,255,255,0.96)",
                  color: itemDisabled
                    ? "#94a3b8"
                    : isNestedParentToggle
                    ? itemAccent
                    : active
                      ? "white"
                      : isMappedDrill
                        ? itemAccent
                        : "#334155",
                  borderColor: itemDisabled
                    ? "rgba(148,163,184,0.22)"
                    : isNestedParentToggle
                    ? parentExpanded || active
                      ? `${itemAccent}45`
                      : "rgba(148,163,184,0.18)"
                    : active
                      ? itemAccent
                      : isMappedDrill
                        ? `${itemAccent}30`
                        : "rgba(148,163,184,0.18)",
                  boxShadow: itemDisabled
                    ? "none"
                    : active || parentExpanded
                    ? `0 8px 18px ${itemAccent}1f`
                    : "0 1px 2px rgba(15,23,42,0.04)",
                  opacity: itemDisabled ? 0.74 : 1,
                }}
                title={itemDisabled ? itemDisabledMessage : item.tooltip || item.label}
              >
                <span className="truncate">{item.label}</span>
                {!itemDisabled && isNestedParentToggle ? (
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

            return itemDisabled ? (
              <DisabledHoverTooltip key={item.id} message={itemDisabledMessage}>
                {button}
              </DisabledHoverTooltip>
            ) : (
              <span key={item.id} className="inline-flex">
                {button}
              </span>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          if (onRightAction) onRightAction();
          else nudgeRow(1);
        }}
        disabled={disabled || (!onRightAction && !canScrollRight)}
        className={arrowClass}
        style={{
          color: disabled ? "#94a3b8" : onRightAction || canScrollRight ? accent : "#64748b",
          borderColor: disabled ? "rgba(148,163,184,0.24)" : onRightAction || canScrollRight ? `${accent}55` : "rgba(100,116,139,0.34)",
          background: disabled ? "rgba(148,163,184,0.08)" : onRightAction || canScrollRight ? soft : "rgba(255,255,255,0.82)",
          opacity: disabled ? 0.72 : onRightAction || canScrollRight ? 1 : 0.72,
        }}
        aria-label={onRightAction ? `Open ${rowLabel} filters` : `Scroll ${rowLabel} right`}
        title={disabled ? disabledMessage : onRightAction ? "Open filters" : "Scroll right"}
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
      className="h-full overflow-visible rounded-[24px] shadow-sm"
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

      <div className="divide-y" style={{ borderColor: divider }}>
        {visibleRows.map((row) => (
          <div
            key={row.id}
            className="grid min-h-[58px] items-center gap-2 px-3 py-2.5 sm:grid-cols-[120px_minmax(0,1fr)]"
          >
            <div className="flex items-center sm:justify-start">
              <div className="grid grid-cols-[minmax(0,max-content)_auto] items-center gap-x-1 text-[12px] font-extrabold leading-tight" style={{ color: "#334155" }}>
                <span className="whitespace-nowrap text-right min-w-[88px]">{String(row.label).replace(/:$/, "")}</span>
                <span>:</span>
              </div>
            </div>
            <div className="min-w-0">
              <PillScrollRow
                items={row.items}
                activeId={row.activeId}
                activeIds={row.activeIds ?? []}
                autoScrollTargetId={row.autoScrollTargetId}
                onPick={row.onPick}
                accent={row.accent || accent}
                soft={row.soft || soft}
                rowLabel={row.label}
                onRightAction={row.onRightAction}
                disabled={Boolean(row.disabled)}
                disabledMessage={row.disabledMessage}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
