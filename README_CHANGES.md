# Institution & Governance dashboard patch

Apply these files over the same paths in your dashboard project. This patch only changes the first module logic and shared chart formatting helpers needed by that module.

## Files changed

1. `src/data/institutionGovernanceVisuals.js`
   - Fixes year-range handling so tables/detail rows use the full selected span, not only the final year.
   - Keeps latest-year snapshots for charts where summing multiple years would duplicate the same institutional structure.
   - Makes time-series available only where a metric is meaningfully tracked across multiple years.
   - Removes semantically weak visual options, for example donut for ranks and mixed score/rank views.
   - Splits the earlier combined QS/THE view into four clearer worksheet categories: QS Rank, QS Score, THE Rank, and THE Score.
   - Revises grievance logic so Reported Cases appear as a KPI/context card, while the main chart shows the actionable split: Resolved vs Pending.
   - Allows table-only categories to display a proper table instead of an empty state when the data are narrative, date-based, or validity-period records.

2. `src/pages/Dashboard.jsx`
   - Opens Institution & Governance categories with their configured default visual type rather than forcing every category into a bar chart.
   - Automatically switches the selected toolbar view if the current visual type is no longer valid for the selected worksheet/category/year range.

3. `src/utils/helpers.js`
   - Fixes compact number formatting so decimal values such as 0.25 or 0.75 are not rounded to 0 or 1.

4. `src/components/charts/BreakdownBar.jsx`
   - Fixes percentage/ratio axes so values stored from 0 to 1 render with a 0–100% axis and readable decimal percentage ticks.

5. `src/components/charts/BreakdownLine.jsx`
   - Applies the same percentage/ratio axis correction to line/time-series charts.

## Main behaviour changes

- Selecting a range such as 2022–2025 now keeps all matching rows in tables and detail views.
- First-module charts use either latest-year snapshot, part-to-whole breakdown, or trend logic depending on the metric semantics.
- Raw counts and percentages are no longer mixed in the same chart unless they are explicitly transformed into a common unit.
- Ranks and scores are separated so rank directionality and score magnitude are not interpreted as the same metric.

## Validation performed

- `src/data/institutionGovernanceVisuals.js` was syntax-checked with Node.
- Full Vite build was not run because the uploaded zip did not include `node_modules`.
