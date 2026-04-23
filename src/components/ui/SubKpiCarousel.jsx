import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "../../utils/helpers";

export default function SubKpiCarousel({
  kpis,
  activeId,
  onPick,
  autoScrollTargetId = null,
  accent,
  soft,
  title = "Section",
  helper = "Click on the metric below to analyze.",
  compact = false,
  infoText = "",
  nestedItems = [],
  activeNestedId = null,
  onPickNested = null,
  nestedTitle = "Sub-module",
  nestedHelper = "Choose the internal worksheet for the active submodule.",
  nestedInfoText = "",
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [nestedInfoOpen, setNestedInfoOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const scrollRef = useRef(null);
  const popoverRef = useRef(null);
  const itemRefs = useRef(new Map());
  const expandedParentIdRef = useRef(null);
  const skipActiveAutoScrollRef = useRef(false);

  const activeCard = useMemo(
    () => kpis.find((card) => card.id === activeId) ?? null,
    [kpis, activeId],
  );

  useEffect(() => {
    const expandedParent = kpis.find((item) => item.variant === "parent-drill-toggle" && item.expanded);
    const previousExpandedParentId = expandedParentIdRef.current;
    expandedParentIdRef.current = expandedParent?.id ?? null;

    if (!expandedParent || previousExpandedParentId === expandedParent.id) return undefined;

    const track = scrollRef.current;
    const parentItem = itemRefs.current.get(expandedParent.id);
    if (!track || !parentItem) return undefined;

    skipActiveAutoScrollRef.current = true;
    let unlockTimer = null;
    const frame = window.requestAnimationFrame(() => {
      track.scrollTo({
        left: Math.max(0, parentItem.offsetLeft - 18),
        behavior: "smooth",
      });
      unlockTimer = window.setTimeout(() => {
        skipActiveAutoScrollRef.current = false;
      }, 320);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (unlockTimer) window.clearTimeout(unlockTimer);
      skipActiveAutoScrollRef.current = false;
    };
  }, [kpis]);

  useEffect(() => {
    if (skipActiveAutoScrollRef.current) return undefined;

    const track = scrollRef.current;
    const targetId = autoScrollTargetId ?? activeId;
    const targetItem = itemRefs.current.get(targetId);
    if (!track || !targetItem) return undefined;

    const frame = window.requestAnimationFrame(() => {
      if (autoScrollTargetId && autoScrollTargetId !== activeId) {
        track.scrollTo({
          left: Math.max(0, targetItem.offsetLeft - 18),
          behavior: "smooth",
        });
        return;
      }

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
  }, [activeId, autoScrollTargetId, kpis]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;

    const updateArrows = () => {
      const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      const nextPageCount = Math.max(1, Math.ceil(node.scrollWidth / Math.max(node.clientWidth, 1)));
      setCanScrollLeft(node.scrollLeft > 8);
      setCanScrollRight(node.scrollLeft < maxScrollLeft - 8);
      setPageCount(nextPageCount);
      if (nextPageCount <= 1 || maxScrollLeft <= 0) {
        setCurrentPage(1);
      } else {
        const ratio = node.scrollLeft / maxScrollLeft;
        setCurrentPage(Math.min(nextPageCount, Math.max(1, Math.round(ratio * (nextPageCount - 1)) + 1)));
      }
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
  }, [kpis, nestedItems, activeId, activeNestedId]);

  useEffect(() => {
    if (!infoOpen && !nestedInfoOpen) return undefined;

    const handleOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setInfoOpen(false);
        setNestedInfoOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setInfoOpen(false);
        setNestedInfoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [infoOpen, nestedInfoOpen]);

  const nudgeCarousel = (direction) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.min(240, Math.max(160, node.clientWidth * 0.52)),
      behavior: "smooth",
    });
  };

  const controlBtnClass =
    "grid h-7 w-7 place-items-center rounded-full border text-[13px] font-bold transition disabled:cursor-not-allowed";

  return (
    <div
      ref={popoverRef}
      className={cx("rounded-[24px] px-3 py-3 shadow-sm", compact ? "" : "")}
      style={{
        background: "rgba(255,255,255,0.94)",
        border: "1px solid rgba(59,130,246,0.15)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-full">
          <div className="flex items-center gap-2">
            <div
              className={compact ? "text-[13px]" : "text-sm"}
              style={{ color: "#0f172a", fontWeight: 800 }}
            >
              {title}
            </div>
            {infoText ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNestedInfoOpen(false);
                    setInfoOpen((value) => !value);
                  }}
                  className="grid h-5 w-5 place-items-center rounded-full border text-[10px] font-extrabold"
                  style={{
                    borderColor: "rgba(59,130,246,0.18)",
                    color: accent,
                    background: "white",
                  }}
                >
                  i
                </button>
                {infoOpen ? (
                  <div
                    className="absolute left-0 top-full z-20 mt-2 w-[280px] rounded-2xl px-3 py-3 text-xs leading-5 shadow-lg"
                    style={{
                      background: "white",
                      border: "1px solid rgba(59,130,246,0.16)",
                      color: "#334155",
                    }}
                  >
                    <div className="font-bold" style={{ color: accent }}>
                      {activeCard?.label || title}
                    </div>
                    <div className="mt-1">{infoText}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="mt-1 text-xs" style={{ color: "#64748b" }}>
            {helper}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {nestedItems?.length && nestedInfoText ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setInfoOpen(false);
                  setNestedInfoOpen((value) => !value);
                }}
                className="grid h-7 w-7 place-items-center rounded-full border text-[10px] font-extrabold"
                style={{
                  borderColor: `${accent}35`,
                  color: accent,
                  background: "white",
                }}
                title="Open worksheet information"
              >
                i
              </button>
              {nestedInfoOpen ? (
                <div
                  className="absolute right-0 top-full z-20 mt-2 w-[320px] rounded-2xl px-3 py-3 text-xs leading-5 shadow-lg"
                  style={{
                    background: "white",
                    border: "1px solid rgba(59,130,246,0.16)",
                    color: "#334155",
                  }}
                >
                  <div className="font-bold" style={{ color: accent }}>
                    {nestedTitle}
                  </div>
                  <div className="mt-1">{nestedHelper}</div>
                  <div className="mt-2">{nestedInfoText}</div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            className="flex items-center gap-2 rounded-full border px-1.5 py-1"
            style={{ background: "rgba(255,255,255,0.96)", borderColor: `${accent}20` }}
          >
            <button
              type="button"
              onClick={() => nudgeCarousel(-1)}
              disabled={!canScrollLeft}
              className={controlBtnClass}
              style={{
                color: accent,
                borderColor: canScrollLeft ? `${accent}26` : "rgba(148,163,184,0.18)",
                background: canScrollLeft ? `${soft}` : "transparent",
                opacity: canScrollLeft ? 1 : 0.45,
              }}
              aria-label="Scroll carousel left"
              title="Scroll left"
            >
              {"<"}
            </button>
            <div
              className="min-w-[44px] text-center text-[11px] font-semibold tabular-nums"
              style={{ color: "#64748b" }}
            >
              {currentPage} / {pageCount}
            </div>
            <button
              type="button"
              onClick={() => nudgeCarousel(1)}
              disabled={!canScrollRight}
              className={controlBtnClass}
              style={{
                color: accent,
                borderColor: canScrollRight ? `${accent}26` : "rgba(148,163,184,0.18)",
                background: canScrollRight ? `${soft}` : "transparent",
                opacity: canScrollRight ? 1 : 0.45,
              }}
              aria-label="Scroll carousel right"
              title="Scroll right"
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div
          ref={scrollRef}
          className="carousel-scroll-track overflow-x-auto pb-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
          }}
        >
          <div className="flex w-max items-center gap-2 pr-1">
            {kpis.map((kpi) => {
              const active = kpi.id === activeId;
              const isMappedDrill = kpi.variant === "mapped-drill";
              const isParentDrillToggle = kpi.variant === "parent-drill-toggle";
              const parentExpanded = Boolean(kpi.expanded);
              const parentUsesExpandedShape = isParentDrillToggle && parentExpanded;
              const isActiveTopLevelHeading = active && !isMappedDrill && !isParentDrillToggle;
              const showTrailingAction = !isMappedDrill && (active || hoveredItemId === kpi.id);
              const itemAccent = kpi.accent || accent;
              const itemSoft = kpi.soft || soft;
              const parentIsProminent = isParentDrillToggle && (active || parentExpanded);

              return (
                <div
                  key={kpi.id}
                  ref={(node) => {
                    if (node) itemRefs.current.set(kpi.id, node);
                    else itemRefs.current.delete(kpi.id);
                  }}
                  className="flex items-center gap-2"
                  onMouseEnter={() => setHoveredItemId(kpi.id)}
                  onMouseLeave={() => {
                    setHoveredItemId((value) => (value === kpi.id ? null : value));
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onPick(kpi.id)}
                    aria-expanded={isParentDrillToggle ? parentExpanded : undefined}
                    aria-label={
                      isParentDrillToggle
                        ? `${kpi.label}. ${parentExpanded ? "Collapse drill pills" : "Expand drill pills"}`
                        : undefined
                    }
                    className={cx(
                      isParentDrillToggle
                        ? parentUsesExpandedShape
                          ? "group flex min-w-[198px] items-center justify-between gap-3 rounded-[20px] border px-4 py-2.5 text-left text-[13px] font-extrabold leading-tight transition duration-200"
                          : "group flex items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-left text-[12.5px] font-semibold transition"
                        : isMappedDrill
                          ? "max-w-[220px] flex items-center rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition"
                        : isActiveTopLevelHeading
                            ? "flex items-center justify-between gap-2 rounded-[18px] border px-4 py-2 text-[13px] font-semibold transition"
                            : "flex items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition",
                    )}
                    style={{
                      background: isParentDrillToggle
                        ? parentExpanded || active
                            ? `linear-gradient(135deg, ${itemAccent}, ${itemAccent}DD)`
                            : "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))"
                        : active
                          ? itemAccent
                          : isMappedDrill
                            ? itemSoft
                            : "rgba(255,255,255,0.96)",
                      color: isParentDrillToggle
                        ? parentExpanded || active
                          ? "white"
                          : "#334155"
                        : active
                          ? "white"
                          : isMappedDrill
                            ? itemAccent
                            : "#334155",
                      borderColor: isParentDrillToggle
                        ? parentIsProminent
                          ? `${itemAccent}66`
                          : "rgba(148,163,184,0.18)"
                        : active
                          ? itemAccent
                          : isMappedDrill
                            ? `${itemAccent}30`
                            : "rgba(148,163,184,0.18)",
                      boxShadow: isParentDrillToggle
                        ? parentIsProminent
                          ? `0 16px 32px ${itemAccent}20, inset 0 1px 0 rgba(255,255,255,0.8)`
                          : "0 1px 2px rgba(15,23,42,0.04)"
                        : active
                          ? `0 10px 22px ${itemAccent}22`
                          : "0 1px 2px rgba(15,23,42,0.04)",
                    }}
                    title={kpi.tooltip || kpi.label}
                  >
                    {isParentDrillToggle ? (
                      <>
                        <span className="truncate">{kpi.label}</span>
                        <span
                          className={cx(
                            "grid shrink-0 place-items-center border transition duration-200",
                            parentUsesExpandedShape
                              ? "h-9 w-9 rounded-[14px]"
                              : "h-6 w-6 rounded-full",
                          )}
                          style={{
                            background: parentExpanded
                              ? `linear-gradient(135deg, ${itemAccent}, ${itemAccent}D6)`
                              : active
                                ? "rgba(255,255,255,0.18)"
                                : `${itemAccent}12`,
                            borderColor: parentExpanded
                              ? `${itemAccent}B5`
                              : active
                                ? "rgba(255,255,255,0.34)"
                                : `${itemAccent}2E`,
                            color: parentExpanded || (active && !parentExpanded) ? "white" : itemAccent,
                            boxShadow: parentExpanded
                              ? `0 10px 20px ${itemAccent}26`
                              : "inset 0 1px 0 rgba(255,255,255,0.6)",
                            opacity: showTrailingAction ? 1 : 0,
                          }}
                          aria-hidden="true"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className={cx(
                              "transition-transform duration-300",
                              parentUsesExpandedShape ? "h-4 w-4" : "h-3 w-3",
                            )}
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
                      </>
                    ) : (
                      isMappedDrill ? (
                        <span className="truncate">{kpi.label}</span>
                      ) : (
                      <>
                        <span className="truncate">{kpi.label}</span>
                        <span
                          className={cx(
                            "grid shrink-0 place-items-center border transition duration-200",
                            isActiveTopLevelHeading ? "h-8 w-8 rounded-[12px]" : "h-6 w-6 rounded-full",
                          )}
                          style={{
                            background: active
                              ? "rgba(255,255,255,0.18)"
                              : `${itemAccent}12`,
                            borderColor: active
                              ? "rgba(255,255,255,0.34)"
                              : `${itemAccent}2E`,
                            color: active ? "white" : itemAccent,
                            boxShadow: active
                              ? "0 8px 18px rgba(255,255,255,0.14)"
                              : "inset 0 1px 0 rgba(255,255,255,0.6)",
                            opacity: showTrailingAction ? 1 : 0,
                          }}
                          aria-hidden="true"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className={cx(
                              "transition-transform duration-300",
                              isActiveTopLevelHeading ? "h-4 w-4" : "h-3 w-3",
                            )}
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
                      </>
                      )
                    )}
                  </button>

                  {active && nestedItems?.length ? (
                    <div
                      className="flex items-center gap-2 rounded-full border px-2 py-1"
                      style={{ background: `${soft}`, borderColor: `${accent}35` }}
                    >
                      <div
                        className="text-[9px] font-extrabold uppercase tracking-[0.12em]"
                        style={{ color: accent }}
                      >
                        {nestedTitle}
                      </div>
                      <select
                        value={activeNestedId ?? ""}
                        onChange={(event) => onPickNested?.(event.target.value)}
                        className="min-w-[170px] rounded-full border bg-white px-3 py-1.5 text-[12.5px] font-medium outline-none"
                        style={{
                          borderColor: `${accent}40`,
                          color: "#334155",
                        }}
                      >
                        {nestedItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
