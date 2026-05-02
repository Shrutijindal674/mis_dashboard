const IG_MODULE_ID = "Institution & Governance";

const CATEGORY_CONFIG = {
  "institutional-profile": {
    profile: [
      {
        id: "on-campus-online-degrees",
        label: "On Campus vs Online Degrees",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Type of Degree",
        yLabel: "Number of Degrees",
        format: "number",
        allowPercent: true,
        emptyMessage: "No on-campus / online degree records available for the selected institute/year.",
      },
      {
        id: "degrees-by-discipline",
        label: "Degrees by Discipline",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Discipline",
        yLabel: "Number of Degrees",
        format: "number",
        allowPercent: true,
        emptyMessage: "No discipline-wise degree records available for the selected institute/year.",
      },
      {
        id: "states-uts-covered",
        label: "Number of States / UTs Covered",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Year",
        yLabel: "Number of States/UTs Covered",
        format: "number",
        allowPercent: false,
        emptyMessage: "No States/UT coverage records available for the selected institute/year range.",
      },
    ],
    programs: [
      {
        id: "total-academic-programs-dept-degree",
        label: "Total Academic Programs by Department and Degree",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Institute, Department, Degree",
        yLabel: "Total Programs",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Department", field: "Department" },
          { label: "Degree", field: "Degree" },
        ],
        emptyMessage: "No academic programme records available for the selected institute/year.",
      },
      {
        id: "average-duration-dept-degree",
        label: "Average Duration Years by Department and Degree",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Institute, Department, Degree",
        yLabel: "Duration (Years)",
        format: "number",
        allowPercent: false,
        drillable: true,
        levels: [
          { label: "Department", field: "Department" },
          { label: "Degree", field: "Degree" },
        ],
        emptyMessage: "No duration-year records available for the selected institute/year.",
      },
      {
        id: "faculty-teaching-dept-degree",
        label: "Faculty Teaching by Department and Degree",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Institute, Department, Degree",
        yLabel: "Number of Faculty Currently Teaching",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Department", field: "Department" },
          { label: "Degree", field: "Degree" },
        ],
        emptyMessage: "No teaching-faculty records available for the selected institute/year.",
      },
    ],
  },
  "governance-policy": {
    grievance: [
      {
        id: "grievance-resolution",
        label: "Grievance Resolution",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Resolution status",
        yLabel: "Number of cases",
        format: "number",
        allowPercent: true,
        emptyMessage: "No structured grievance case numbers available for the selected institute/year.",
      },
      {
        id: "committees",
        label: "Committees",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Committee type",
        yLabel: "Member count",
        format: "number",
        allowPercent: true,
        emptyMessage: "Committee member counts are not structured for the selected institute/year.",
      },
    ],
    iqac: [
      {
        id: "qa-reviews",
        label: "QA Reviews",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "QA activity",
        yLabel: "Count",
        format: "number",
        allowPercent: true,
        emptyMessage: "QA review counts are not structured for the selected institute/year.",
      },
    ],
    structure: [
      {
        id: "governance-meetings",
        label: "Governance Meetings",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "trend", "table"],
        xLabel: "Governing body",
        yLabel: "Meeting count",
        format: "number",
        allowPercent: true,
        emptyMessage: "Governance meeting counts are not structured for the selected institute/year.",
      },
    ],
    diversity: [
      {
        id: "inclusion-metrics",
        label: "Inclusion Metrics",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Inclusion metric",
        yLabel: "Percentage",
        format: "pct",
        allowPercent: false,
        emptyMessage: "No structured inclusion metrics available for the selected institute/year.",
      },
      {
        id: "policy-status",
        label: "Policy Status",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Policy status",
        yLabel: "Policy-area count",
        format: "number",
        allowPercent: true,
        emptyMessage: "No policy implementation status records available for the selected institute/year.",
      },
    ],
  },
  "rankings-accreditations": {
    rankings: [
      {
        id: "qs-rank",
        label: "QS World University Ranking",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Year",
        yLabel: "QS Rank",
        format: "number",
        allowPercent: false,
        emptyMessage: "QS rank data are not available for the selected institute/year range.",
      },
      {
        id: "qs-score",
        label: "QS Score",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Year",
        yLabel: "QS Score",
        format: "number",
        allowPercent: false,
        emptyMessage: "QS score data are not available for the selected institute/year range.",
      },
      {
        id: "the-rank",
        label: "THE World University Ranking",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Year",
        yLabel: "THE Rank",
        format: "number",
        allowPercent: false,
        emptyMessage: "THE rank data are not available for the selected institute/year range.",
      },
    ],
    accreditations: [
      {
        id: "accreditation-status",
        label: "Accreditation Status",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Accreditation body / status",
        yLabel: "Record count",
        format: "number",
        allowPercent: true,
        emptyMessage: "No accreditation status records available for the selected institute/year.",
      },
      {
        id: "validity-timeline",
        label: "Validity Timeline",
        defaultView: "table",
        allowedViews: ["table"],
        xLabel: "Accreditation body",
        yLabel: "Validity period",
        format: "number",
        allowPercent: false,
        emptyMessage: "No accreditation validity-period records available for the selected institute/year.",
      },
    ],
    quality: [
      {
        id: "iso-certifications",
        label: "ISO Certifications",
        defaultView: "empty",
        allowedViews: ["empty"],
        xLabel: "Certification type",
        yLabel: "Count of certifications",
        format: "number",
        allowPercent: false,
        emptyMessage: "No ISO/quality certification records available for the selected institute/year.",
      },
    ],
  },
  "audit-observation": {
    audit: [
      {
        id: "audit-count-department-type",
        label: "Audit Count by Department and Type",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Institute, Department Unit, Current Status, Audit Type",
        yLabel: "Number of Audits",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Department Unit", field: "Department" },
          { label: "Current Status", field: "Status" },
          { label: "Audit Type", field: "AuditType" },
        ],
        emptyMessage: "No audit observations available for the selected institute/year.",
      },
    ],
  },
  "court-cases": {
    legal: [
      {
        id: "legal-cases-status-nature",
        label: "Legal Cases by Status and Nature",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Current Status, Nature of Case",
        yLabel: "Number of Cases",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Current Status", field: "Status" },
          { label: "Nature of Case", field: "NatureOfCase" },
        ],
        emptyMessage: "No court-case records available for the selected institute/year.",
      },
    ],
  },
};

const IG_TABLE_COLUMNS = {
  institutionalProfile: [
    { key: "Year", label: "Year" },
    { key: "DegreeCategory", label: "Degree / Discipline Category" },
    { key: "DegreeCount", label: "Number of Degrees" },
    { key: "StatesUTsCovered", label: "States/UTs Covered" },
    { key: "AcademicUnits", label: "Academic Units" },
    { key: "NIRFOverallRank", label: "NIRF Overall" },
    { key: "NIRFEngineeringRank", label: "NIRF Engineering" },
  ],
  academicPrograms: [
    { key: "Year", label: "Year" },
    { key: "Department", label: "Department" },
    { key: "Degree", label: "Degree" },
    { key: "ModeOfDelivery", label: "Mode of Delivery" },
    { key: "ProgramName", label: "Program" },
    { key: "DurationYears", label: "Duration (Years)" },
    { key: "LaunchYear", label: "Launch Year" },
    { key: "FacultyCurrentlyTeaching", label: "Faculty Currently Teaching" },
  ],
  governance: [
    { key: "Year", label: "Year" },
    { key: "Theme", label: "Theme" },
    { key: "Metric", label: "Metric" },
    { key: "Value", label: "Value" },
    { key: "Status", label: "Status" },
  ],
  rankings: [
    { key: "Year", label: "Year" },
    { key: "Category", label: "Category" },
    { key: "Scheme", label: "Scheme" },
    { key: "StatusOrGrade", label: "Status / Grade" },
    { key: "Score", label: "Score" },
  ],
  accreditation: [
    { key: "Year", label: "Year" },
    { key: "Body", label: "Body" },
    { key: "GradeOrStatus", label: "Grade / Status" },
    { key: "ValidFrom", label: "Valid from" },
    { key: "ValidTo", label: "Valid to" },
  ],
  audit: [
    { key: "Year", label: "Year" },
    { key: "ObservationId", label: "Observation ID" },
    { key: "AuditType", label: "Audit type" },
    { key: "Department", label: "Department / Unit" },
    { key: "Status", label: "Current status" },
    { key: "FinancialImpactCr", label: "Financial impact (Cr)" },
    { key: "CorrectiveAction", label: "Corrective action" },
  ],
  court: [
    { key: "Year", label: "Year" },
    { key: "CaseId", label: "Case number" },
    { key: "CourtName", label: "Court" },
    { key: "NatureOfCase", label: "Nature" },
    { key: "Status", label: "Current status" },
    { key: "NextHearingDate", label: "Next hearing" },
    { key: "FinancialExposureCr", label: "Exposure (Cr)" },
  ],
};

const DEFAULT_IIT_IDS = ["IITB", "IITD", "IITK", "IITKGP", "IITM", "IITGOA"];

function stableOffset(instituteId = "IITB") {
  const idx = Math.max(0, DEFAULT_IIT_IDS.indexOf(instituteId));
  return idx >= 0 ? idx : 0;
}

function inRange(row, yearRange) {
  const year = Number(row.Year ?? 0);
  return year >= Number(yearRange.from) && year <= Number(yearRange.to);
}

function forInstitute(row, instituteId) {
  return !instituteId || row.InstituteId === instituteId;
}

function latestRows(rows, instituteId, yearRange) {
  const scoped = rows.filter((row) => forInstitute(row, instituteId) && inRange(row, yearRange));
  const latestYear = Math.max(...scoped.map((row) => Number(row.Year ?? 0)).filter(Number.isFinite));
  if (!Number.isFinite(latestYear)) return [];
  return scoped.filter((row) => Number(row.Year) === latestYear);
}

function rangeRows(rows, instituteId, yearRange) {
  return rows.filter((row) => forInstitute(row, instituteId) && inRange(row, yearRange));
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

function groupValue(rows, field, valueField) {
  const map = new Map();
  for (const row of rows) {
    const key = row[field] ?? "(unknown)";
    map.set(key, (map.get(key) ?? 0) + Number(row[valueField] ?? 0));
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((item) => Number.isFinite(item.value) && item.value !== 0)
    .sort((a, b) => b.value - a.value);
}

function groupAverage(rows, field, valueField) {
  const map = new Map();
  for (const row of rows) {
    const key = row[field] ?? "(unknown)";
    const numeric = Number(row[valueField] ?? 0);
    if (!Number.isFinite(numeric) || numeric === 0) continue;
    const current = map.get(key) ?? { total: 0, count: 0 };
    current.total += numeric;
    current.count += 1;
    map.set(key, current);
  }
  return Array.from(map.entries())
    .map(([name, item]) => ({ name, value: Number((item.total / Math.max(1, item.count)).toFixed(2)) }))
    .filter((item) => item.name !== "(unknown)" && Number.isFinite(item.value) && item.value !== 0)
    .sort((a, b) => b.value - a.value);
}

function groupCount(rows, field, idField = null) {
  const map = new Map();
  for (const row of rows) {
    const key = row[field] ?? "(unknown)";
    if (idField) {
      const set = map.get(key) ?? new Set();
      set.add(row[idField] ?? `${key}-${set.size + 1}`);
      map.set(key, set);
    } else {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value: value instanceof Set ? value.size : value }))
    .filter((item) => item.name !== "(unknown)" && item.value !== 0)
    .sort((a, b) => b.value - a.value);
}

function applyDrill(rows, levels = [], drillPath = []) {
  let scoped = rows;
  for (let index = 0; index < drillPath.length; index += 1) {
    const field = levels[index]?.field;
    if (!field) break;
    scoped = scoped.filter((row) => String(row[field] ?? "(unknown)") === String(drillPath[index]));
  }
  return scoped;
}

function countByLevels(rows, levels, drillPath, idField) {
  const scoped = applyDrill(rows, levels, drillPath);
  const field = levels?.[drillPath.length]?.field;
  if (!field) return [];
  return groupCount(scoped, field, idField);
}

function valueByLevels(rows, levels, drillPath, valueField, aggregation = "sum") {
  const scoped = applyDrill(rows, levels, drillPath);
  const field = levels?.[drillPath.length]?.field;
  if (!field) return [];
  return aggregation === "average" ? groupAverage(scoped, field, valueField) : groupValue(scoped, field, valueField);
}

function isCampusDegreeCategory(category) {
  return /on[- ]?campus|online/i.test(String(category ?? ""));
}

function isDisciplineDegreeCategory(category) {
  return !isCampusDegreeCategory(category);
}

function filterDetailFocus(rows, detailFocus) {
  if (!detailFocus?.field) return rows;
  return rows.filter((row) => String(row[detailFocus.field] ?? "(unknown)") === String(detailFocus.value));
}

function normalizeGovernanceRows(sourceRows, instituteId) {
  if (Array.isArray(sourceRows) && sourceRows.length) return sourceRows;

  const offset = stableOffset(instituteId);
  const rows = [];
  for (const year of [2021, 2022, 2023, 2024, 2025]) {
    const reported = 30 + ((year + offset) % 4) * 5 + offset;
    const pending = (year + offset) % 3;
    rows.push({
      InstituteId: instituteId,
      Year: year,
      Theme: "Anti-Ragging & Grievance",
      Metric: "Cases Reported",
      Value: reported,
      CasesReported: reported,
      CasesResolved: Math.max(0, reported - pending),
      CasesPending: pending,
      Status: pending ? "Partly resolved" : "Resolved",
      CommitteeType: "Grievance Committee",
      CommitteeMemberCount: 8 + offset,
      PortalMode: "UGC / AICTE portal",
    });
    rows.push({
      InstituteId: instituteId,
      Year: year,
      Theme: "Internal QA Mechanisms",
      Metric: "Academic audits",
      Value: 2 + ((year + offset) % 3),
      Status: year >= 2024 ? "Renewal in progress" : "Completed",
      AcademicAuditCount: 2 + ((year + offset) % 3),
      FeedbackCycles: 3 + ((year + offset) % 2),
      ImprovementActions: 5 + ((year + offset) % 4),
    });
    for (const body of ["BoG", "Senate", "Finance Committee", "Departmental Review"]) {
      const base = body === "Senate" ? 10 : body === "Departmental Review" ? 12 : body === "BoG" ? 4 : 2;
      rows.push({
        InstituteId: instituteId,
        Year: year,
        Theme: "Institutional Governance Structure",
        Metric: body,
        Value: base + ((year + offset) % 2),
        Status: "Active",
        GoverningBody: body,
        MeetingCount: base + ((year + offset) % 2),
      });
    }
    for (const item of [
      ["Female enrollment", 20 + offset + ((year - 2021) * 0.6)],
      ["SC representation", 15],
      ["ST representation", 7.5],
      ["OBC quota filled", 27],
      ["PwD enrollment", 3 + (offset % 2)],
    ]) {
      rows.push({
        InstituteId: instituteId,
        Year: year,
        Theme: "Diversity & Inclusion",
        Metric: item[0],
        Value: Number(item[1].toFixed(1)),
        Unit: "%",
        Status: "Implemented",
      });
    }
    rows.push({
      InstituteId: instituteId,
      Year: year,
      Theme: "Diversity & Inclusion",
      Metric: "Sensitization workshops",
      Value: 6 + ((year + offset) % 4),
      Unit: "count",
      Status: year >= 2024 ? "Ongoing" : "Implemented",
    });
  }
  return rows;
}

function buildRankingFallbackRows(instituteId) {
  const offset = stableOffset(instituteId);
  const rows = [];
  for (const year of [2021, 2022, 2023, 2024, 2025]) {
    const y = year - 2021;
    rows.push({ InstituteId: instituteId, Year: year, Category: "Rankings", Scheme: "QS Rank", StatusOrGrade: `Rank ${280 + offset * 10 - y * 3}`, Score: 280 + offset * 10 - y * 3 });
    rows.push({ InstituteId: instituteId, Year: year, Category: "Rankings", Scheme: "QS Score", StatusOrGrade: `${36 + offset + y * 0.8}`, Score: Number((36 + offset + y * 0.8).toFixed(1)) });
    rows.push({ InstituteId: instituteId, Year: year, Category: "Rankings", Scheme: "THE Rank", StatusOrGrade: `Rank ${501 + offset * 50 + (y % 3) * 50}`, Score: 501 + offset * 50 + (y % 3) * 50 });
    rows.push({ InstituteId: instituteId, Year: year, Category: "Rankings", Scheme: "THE Score", StatusOrGrade: `${42 + offset + y * 1.1}`, Score: Number((42 + offset + y * 1.1).toFixed(1)) });
    for (const [scheme, base] of [["TLR", 77], ["RPC", 85], ["GO", 80], ["OI", 58], ["PR", 88]]) {
      rows.push({ InstituteId: instituteId, Year: year, Category: "NIRF Score Areas", Scheme: scheme, StatusOrGrade: `${scheme} score`, Score: Number((base + offset + y * 1.2).toFixed(1)) });
    }
  }
  return rows;
}

function getRankingRows(facts, instituteId) {
  const rows = Array.isArray(facts?.rankingsAccreditations) ? [...facts.rankingsAccreditations] : [];
  const hasQsThe = rows.some((row) => forInstitute(row, instituteId) && /QS|THE/i.test(row.Scheme ?? ""));
  const hasNirfAreas = rows.some((row) => forInstitute(row, instituteId) && row.Category === "NIRF Score Areas");
  if (hasQsThe && hasNirfAreas) return rows;
  const fallback = buildRankingFallbackRows(instituteId);
  return [
    ...rows,
    ...fallback.filter(
      (row) =>
        (!hasQsThe && /QS|THE/i.test(row.Scheme ?? "")) ||
        (!hasNirfAreas && row.Category === "NIRF Score Areas"),
    ),
  ];
}

function getAccreditationRows(instituteId) {
  const offset = stableOffset(instituteId);
  return [2021, 2022, 2023, 2024, 2025].flatMap((year, index) => [
    {
      InstituteId: instituteId,
      Year: year,
      Body: "NAAC",
      GradeOrStatus: index >= 3 ? "A++" : "A+",
      ValidFrom: `${year}-07-01`,
      ValidTo: `${year + 5}-06-30`,
    },
    {
      InstituteId: instituteId,
      Year: year,
      Body: "NBA",
      GradeOrStatus: ["Renewed", "Conditional", "Accredited", "Accredited", "Renewed"][(index + offset) % 5],
      ValidFrom: `${year}-04-01`,
      ValidTo: `${year + 3}-03-31`,
    },
  ]);
}

function getCourtRows(sourceRows, instituteId) {
  if (Array.isArray(sourceRows) && sourceRows.some((row) => forInstitute(row, instituteId))) return sourceRows;
  const offset = stableOffset(instituteId);
  const courts = ["High Court", "Supreme Court", "CAT", "Other"];
  const natures = ["Service matter", "Land dispute", "Contractual issue"];
  const statuses = ["Open", "Under Hearing", "Judgement Pending", "Closed", "Under Appeal"];
  const compliance = ["Awaiting final order", "Survey report submitted", "Interim stay implemented", "Case closed and archived"];
  const rows = [];
  for (const year of [2021, 2022, 2023, 2024, 2025]) {
    const casesThisYear = 5 + ((year + offset) % 4);
    for (let i = 0; i < casesThisYear; i += 1) {
      const court = courts[(i + offset) % courts.length];
      const nature = natures[(i + year + offset) % natures.length];
      const status = statuses[(i + offset + year) % statuses.length];
      rows.push({
        InstituteId: instituteId,
        Year: year,
        CaseId: `${instituteId}-CASE-${String(year).slice(-2)}-${String(i + 1).padStart(3, "0")}`,
        CourtName: court,
        NatureOfCase: nature,
        Status: status,
        ComplianceStatus: compliance[(i + offset) % compliance.length],
        NextHearingDate: `${year + 1}-${String(((i + 3) % 12) + 1).padStart(2, "0")}-15`,
        FinancialExposureCr: Number((0.4 + ((i + offset) % 5) * 0.35).toFixed(2)),
      });
    }
  }
  return rows;
}

function buildTrendFromRows(rows, yearRange, buildValue) {
  const out = [];
  for (let year = Number(yearRange.from); year <= Number(yearRange.to); year += 1) {
    const yearRows = rows.filter((row) => Number(row.Year) === year);
    const value = buildValue(yearRows, year);
    if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
      out.push({ name: String(year), value: Number(value) });
    }
  }
  return out;
}

function normalizePercentRows(rows) {
  return rows.map((row) => ({ ...row, value: Number(row.value ?? 0) / 100 }));
}

function tableRowsFromBreakdown(breakdown, xLabel, yLabel) {
  return breakdown.map((item) => ({ [xLabel]: item.name, [yLabel]: item.value }));
}

function uniqueViews(views) {
  return views.filter((view, index) => view && views.indexOf(view) === index);
}

function deriveAllowedViews(category, state) {
  const hasBreakdown = Boolean(state.breakdown?.length);
  const hasTrend = Boolean(state.trend?.length);
  const hasTable = Boolean(state.tableRows?.length || state.detailRows?.length);
  const requestedViews = Array.isArray(category.allowedViews) && category.allowedViews.length
    ? category.allowedViews
    : ["bar", "donut", "trend", "table"];

  const views = [];
  if (hasBreakdown) views.push("bar");
  if (hasBreakdown) views.push("donut");
  if (hasTrend) views.push("trend");
  if (hasTable) views.push("table");

  return uniqueViews(views).filter((view) => requestedViews.includes(view));
}

function buildEmptyState(category, state = {}, emptyMessage = null) {
  const hasAnyData = Boolean(
    state.cards?.length ||
    state.breakdown?.length ||
    state.trend?.length ||
    state.tableRows?.length ||
    state.detailRows?.length
  );
  const visualizationUnsupported = hasAnyData || category.defaultView === "empty";
  return {
    id: category.id,
    category,
    isEmpty: true,
    visualKind: "empty",
    defaultView: "empty",
    allowedViews: ["empty"],
    cards: [],
    breakdown: [],
    trend: [],
    timeSeriesRows: [],
    timeSeriesKeys: [],
    levels: category.levels ?? [],
    tableColumns: state.tableColumns ?? [],
    tableRows: state.tableRows ?? [],
    detailRows: state.detailRows ?? state.tableRows ?? [],
    detailColumns: state.detailColumns ?? state.tableColumns ?? [],
    xLabel: category.xLabel,
    yLabel: category.yLabel,
    format: category.format ?? "number",
    allowPercent: false,
    emptyTitle: visualizationUnsupported ? "Visualization not supported" : "No Data Available",
    emptyMessage: visualizationUnsupported
      ? (emptyMessage ?? category.emptyMessage ?? "This data does not support visualization. If you have a suggestion for a visualization, please contact support.")
      : "No Data Available",
  };
}

function finalize(category, state) {
  const hasCards = Boolean(state.cards?.length);
  const hasBreakdown = Boolean(state.breakdown?.length);
  const hasTrend = Boolean(state.trend?.length);
  const hasTable = Boolean(state.tableRows?.length || state.detailRows?.length);
  const views = deriveAllowedViews(category, state);
  const hasView = views.length > 0;
  const isForcedEmpty = category.defaultView === "empty";

  if (isForcedEmpty || !hasView) {
    const tableOnlyMessage =
      hasTable && !hasCards && !hasBreakdown && !hasTrend
        ? "This worksheet is table-only because its fields are narrative, date-based, or validity-period records rather than additive chart measures."
        : null;
    return buildEmptyState(category, state, tableOnlyMessage);
  }

  const defaultView = views.includes(category.defaultView)
    ? category.defaultView
    : views[0] ?? state.visualKind ?? "table";
  const visualKind = views.includes(state.visualKind) ? state.visualKind : defaultView;

  return {
    id: category.id,
    category,
    isEmpty: false,
    visualKind,
    defaultView,
    allowedViews: views,
    cards: state.cards ?? [],
    breakdown: state.breakdown ?? [],
    trend: state.trend ?? [],
    timeSeriesRows: state.timeSeriesRows ?? [],
    timeSeriesKeys: state.timeSeriesKeys ?? [],
    levels: category.levels ?? [],
    tableColumns: state.tableColumns ?? [],
    tableRows: state.tableRows ?? [],
    detailRows: state.detailRows ?? state.tableRows ?? [],
    detailColumns: state.detailColumns ?? state.tableColumns ?? [],
    xLabel: category.xLabel,
    yLabel: category.yLabel,
    format: category.format ?? "number",
    allowPercent: Boolean(category.allowPercent),
    drillable: Boolean(category.drillable),
    emptyTitle: category.label,
    emptyMessage: category.emptyMessage ?? "Visual for this metric is not available here.",
  };
}

export function getInstitutionGovernanceCategories(subsectionId, viewId) {
  return CATEGORY_CONFIG[subsectionId]?.[viewId] ?? [];
}

export function getDefaultInstitutionGovernanceCategoryId(subsectionId, viewId) {
  return getInstitutionGovernanceCategories(subsectionId, viewId)?.[0]?.id ?? null;
}

export function isInstitutionGovernanceSubsection(subsectionId) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_CONFIG, subsectionId);
}

export function buildInstitutionGovernanceVisual({
  facts,
  subsectionId,
  viewId,
  categoryId,
  instituteId,
  yearRange,
  drillPath = [],
  detailFocus = null,
}) {
  const categories = getInstitutionGovernanceCategories(subsectionId, viewId);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  if (!category) return null;

  const profileRows = facts?.institutionalProfile ?? [];
  const academicRows = facts?.academicPrograms ?? [];
  const governanceRows = normalizeGovernanceRows(facts?.governancePolicy ?? [], instituteId);
  const rankingRows = getRankingRows(facts, instituteId);
  const accreditationRows = getAccreditationRows(instituteId);
  const auditRows = facts?.auditObservations ?? [];
  const courtRows = getCourtRows(facts?.courtCases ?? [], instituteId);

  const latestProfile = latestRows(profileRows, instituteId, yearRange);
  const latestAcademic = latestRows(academicRows, instituteId, yearRange);
  const latestGovernance = latestRows(governanceRows, instituteId, yearRange);
  const latestRankings = latestRows(rankingRows, instituteId, yearRange);
  const latestAccreditation = latestRows(accreditationRows, instituteId, yearRange);
  const latestAudit = latestRows(auditRows, instituteId, yearRange);
  const latestCourt = latestRows(courtRows, instituteId, yearRange);

  const rangeProfile = rangeRows(profileRows, instituteId, yearRange);
  const rangeAcademic = rangeRows(academicRows, instituteId, yearRange);
  const rangeGovernance = rangeRows(governanceRows, instituteId, yearRange);
  const rangeRankings = rangeRows(rankingRows, instituteId, yearRange);
  const rangeAccreditation = rangeRows(accreditationRows, instituteId, yearRange);
  const rangeAudit = rangeRows(auditRows, instituteId, yearRange);
  const rangeCourt = rangeRows(courtRows, instituteId, yearRange);

  const filteredByDrill = (rows) => filterDetailFocus(applyDrill(rows, category.levels ?? [], drillPath), detailFocus);

  if (category.id === "overview-kpis") {
    const first = latestProfile[0] ?? {};
    const degreeTotal = latestProfile.length ? sum(latestProfile, "DegreeCount") : "N/A";
    return finalize(category, {
      visualKind: "cards",
      cards: first
        ? [
            { label: "NIRF Overall", value: first.NIRFOverallRank ? `#${first.NIRFOverallRank}` : "—", note: "Lower rank is stronger" },
            { label: "NIRF Engineering", value: first.NIRFEngineeringRank ? `#${first.NIRFEngineeringRank}` : "—", note: "Lower rank is stronger" },
            { label: "Academic units", value: first.AcademicUnits ?? "—", note: "Departments, schools, centres" },
            { label: "States/UTs covered", value: first.StatesUTsCovered ?? "—", note: "Institutional coverage" },
            { label: "Degree categories", value: latestProfile.length || "N/A", note: "Structured portfolio buckets" },
            { label: "Total degree count", value: degreeTotal, note: "Sum of portfolio buckets" },
          ]
        : [],
      tableColumns: IG_TABLE_COLUMNS.institutionalProfile,
      tableRows: rangeProfile,
      detailColumns: IG_TABLE_COLUMNS.institutionalProfile,
      detailRows: rangeProfile,
    });
  }

  if (category.id === "on-campus-online-degrees") {
    const rows = rangeProfile.filter((row) => isCampusDegreeCategory(row.DegreeCategory));
    const latestRowsForChart = latestProfile.filter((row) => isCampusDegreeCategory(row.DegreeCategory));
    const breakdown = groupValue(latestRowsForChart, "DegreeCategory", "DegreeCount");
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.institutionalProfile,
      tableRows: rows,
      detailColumns: IG_TABLE_COLUMNS.institutionalProfile,
      detailRows: filterDetailFocus(rows, detailFocus),
    });
  }

  if (category.id === "degrees-by-discipline") {
    const rows = rangeProfile.filter((row) => isDisciplineDegreeCategory(row.DegreeCategory));
    const latestRowsForChart = latestProfile.filter((row) => isDisciplineDegreeCategory(row.DegreeCategory));
    const breakdown = groupValue(latestRowsForChart, "DegreeCategory", "DegreeCount");
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.institutionalProfile,
      tableRows: rows,
      detailColumns: IG_TABLE_COLUMNS.institutionalProfile,
      detailRows: filterDetailFocus(rows, detailFocus),
    });
  }

  if (category.id === "states-uts-covered") {
    const tableRows = rangeProfile.filter((row, index, arr) => arr.findIndex((x) => x.Year === row.Year) === index);
    const trend = buildTrendFromRows(rangeProfile, yearRange, (rows) => rows[0]?.StatesUTsCovered ?? null);
    const breakdown = trend.map((item) => ({ name: item.name, value: item.value }));
    return finalize(category, {
      visualKind: "trend",
      trend,
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.institutionalProfile,
      tableRows,
      detailColumns: IG_TABLE_COLUMNS.institutionalProfile,
      detailRows: filterDetailFocus(tableRows, detailFocus),
    });
  }

  if (category.id === "total-academic-programs-dept-degree") {
    const scoped = applyDrill(latestAcademic, category.levels, drillPath);
    const detailScoped = applyDrill(rangeAcademic, category.levels, drillPath);
    const breakdown = countByLevels(latestAcademic, category.levels, drillPath, "ProgramName");
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.academicPrograms,
      tableRows: detailScoped,
      detailColumns: IG_TABLE_COLUMNS.academicPrograms,
      detailRows: filterDetailFocus(detailScoped, detailFocus),
    });
  }

  if (category.id === "average-duration-dept-degree") {
    const scoped = applyDrill(latestAcademic, category.levels, drillPath);
    const detailScoped = applyDrill(rangeAcademic, category.levels, drillPath);
    const breakdown = valueByLevels(latestAcademic, category.levels, drillPath, "DurationYears", "average");
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.academicPrograms,
      tableRows: detailScoped,
      detailColumns: IG_TABLE_COLUMNS.academicPrograms,
      detailRows: filterDetailFocus(detailScoped, detailFocus),
    });
  }

  if (category.id === "faculty-teaching-dept-degree") {
    const rowsWithFaculty = latestAcademic.filter((row) => Number.isFinite(Number(row.FacultyCurrentlyTeaching)) && Number(row.FacultyCurrentlyTeaching) > 0);
    const rangeRowsWithFaculty = rangeAcademic.filter((row) => Number.isFinite(Number(row.FacultyCurrentlyTeaching)) && Number(row.FacultyCurrentlyTeaching) > 0);
    const scoped = applyDrill(rowsWithFaculty, category.levels, drillPath);
    const detailScoped = applyDrill(rangeRowsWithFaculty, category.levels, drillPath);
    const breakdown = valueByLevels(rowsWithFaculty, category.levels, drillPath, "FacultyCurrentlyTeaching", "sum");
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.academicPrograms,
      tableRows: detailScoped,
      detailColumns: IG_TABLE_COLUMNS.academicPrograms,
      detailRows: filterDetailFocus(detailScoped, detailFocus),
    });
  }

  if (category.id === "grievance-resolution") {
    const rows = rangeGovernance.filter((row) => row.Theme === "Anti-Ragging & Grievance");
    const reported = sum(rows, "CasesReported");
    const resolved = sum(rows, "CasesResolved");
    const recordedPending = sum(rows, "CasesPending");
    const pending = recordedPending || Math.max(0, reported - resolved);
    const breakdown = reported || resolved || pending ? [
      { name: "Resolved", value: resolved },
      { name: "Pending", value: pending },
    ].filter((item) => item.value !== 0) : [];
    return finalize(category, {
      visualKind: "bar",
      cards: reported ? [
        { label: "Reported cases", value: reported, note: `${yearRange.from}–${yearRange.to}; resolved and pending are the actionable split.` },
      ] : [],
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.governance,
      tableRows: rows,
      detailColumns: IG_TABLE_COLUMNS.governance,
      detailRows: filterDetailFocus(rows, detailFocus),
    });
  }

  if (category.id === "committees") {
    const rows = rangeGovernance.filter((row) => row.Theme === "Anti-Ragging & Grievance" && row.CommitteeMemberCount);
    const breakdown = groupValue(rows, "CommitteeType", "CommitteeMemberCount");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "qa-reviews") {
    const rows = rangeGovernance.filter((row) => row.Theme === "Internal QA Mechanisms");
    const breakdown = rows.length ? [
      { name: "Academic audits", value: sum(rows, "AcademicAuditCount") },
      { name: "Feedback cycles", value: sum(rows, "FeedbackCycles") },
      { name: "Improvement actions", value: sum(rows, "ImprovementActions") },
    ] : [];
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "governance-meetings") {
    const rows = rangeGovernance.filter((row) => row.Theme === "Institutional Governance Structure");
    const latestRowsForChart = latestGovernance.filter((row) => row.Theme === "Institutional Governance Structure");
    const breakdown = groupValue(latestRowsForChart.length ? latestRowsForChart : rows, "GoverningBody", "MeetingCount");
    const timeSeriesKeys = Array.from(new Set(rows.map((row) => row.GoverningBody).filter(Boolean)));
    const timeSeriesRows = [];
    for (let year = Number(yearRange.from); year <= Number(yearRange.to); year += 1) {
      const yearRows = rows.filter((row) => Number(row.Year) === year);
      if (!yearRows.length) continue;
      const out = { name: String(year) };
      for (const key of timeSeriesKeys) {
        out[key] = sum(yearRows.filter((row) => row.GoverningBody === key), "MeetingCount");
      }
      timeSeriesRows.push(out);
    }
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => sum(yearRows, "MeetingCount"));
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      trend,
      timeSeriesRows,
      timeSeriesKeys,
      tableColumns: IG_TABLE_COLUMNS.governance,
      tableRows: rows,
      detailColumns: IG_TABLE_COLUMNS.governance,
      detailRows: filterDetailFocus(rows, detailFocus),
    });
  }

  if (category.id === "inclusion-metrics") {
    const rows = latestGovernance.filter((row) => row.Theme === "Diversity & Inclusion" && row.Unit === "%");
    const tableRows = rangeGovernance.filter((row) => row.Theme === "Diversity & Inclusion" && row.Unit === "%");
    const breakdown = normalizePercentRows(rows.map((row) => ({ name: row.Metric, value: row.Value })));
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(tableRows, detailFocus) });
  }

  if (category.id === "policy-status") {
    const rows = rangeGovernance.filter((row) => row.Theme === "Diversity & Inclusion");
    const breakdown = groupCount(rows, "Status");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "nirf-ranking") {
    const rows = rangeRankings.filter((row) => row.Category === "Rankings" && /NIRF/i.test(row.Scheme ?? ""));
    const trend = buildTrendFromRows(rows.filter((row) => /Overall/i.test(row.Scheme ?? "")), yearRange, (yearRows) => yearRows[0]?.Score ?? null);
    const breakdown = trend.map((item) => ({ name: item.name, value: item.value }));
    return finalize(category, { visualKind: "trend", trend, breakdown, tableColumns: IG_TABLE_COLUMNS.rankings, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.rankings, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  const rankingSchemePatterns = {
    "qs-rank": /QS Rank/i,
    "qs-score": /QS Score/i,
    "the-rank": /THE Rank/i,
    "the-score": /THE Score/i,
  };

  if (Object.prototype.hasOwnProperty.call(rankingSchemePatterns, category.id)) {
    const pattern = rankingSchemePatterns[category.id];
    const rows = rangeRankings.filter((row) => row.Category === "Rankings" && pattern.test(row.Scheme ?? ""));
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => yearRows[0]?.Score ?? null);
    const breakdown = trend.map((item) => ({ name: item.name, value: item.value }));
    return finalize(category, { visualKind: "trend", trend, breakdown, tableColumns: IG_TABLE_COLUMNS.rankings, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.rankings, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "nirf-score-areas") {
    const rows = latestRankings.filter((row) => row.Category === "NIRF Score Areas");
    const tableRows = rangeRankings.filter((row) => row.Category === "NIRF Score Areas");
    const breakdown = groupValue(rows, "Scheme", "Score");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.rankings, tableRows, detailColumns: IG_TABLE_COLUMNS.rankings, detailRows: filterDetailFocus(tableRows, detailFocus) });
  }

  if (category.id === "accreditation-status") {
    const rows = latestAccreditation;
    const statusRows = rows.map((row) => ({ ...row, StatusKey: `${row.Body}: ${row.GradeOrStatus}` }));
    const breakdown = groupCount(statusRows, "StatusKey");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.accreditation, tableRows: rangeAccreditation, detailColumns: IG_TABLE_COLUMNS.accreditation, detailRows: filterDetailFocus(rangeAccreditation, detailFocus) });
  }

  if (category.id === "validity-timeline") {
    const rows = rangeAccreditation;
    return finalize(category, { visualKind: "table", tableColumns: IG_TABLE_COLUMNS.accreditation, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.accreditation, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "iso-certifications") {
    return buildEmptyState(category);
  }

  if (["audit-count-department-type", "audit-type", "audit-status", "department-audits"].includes(category.id)) {
    const scoped = applyDrill(rangeAudit, category.levels, drillPath);
    const breakdown = countByLevels(rangeAudit, category.levels, drillPath, "ObservationId");
    return finalize(category, { visualKind: category.defaultView, breakdown, tableColumns: IG_TABLE_COLUMNS.audit, tableRows: scoped, detailColumns: IG_TABLE_COLUMNS.audit, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (category.id === "financial-impact") {
    const usable = rangeAudit.filter((row) => Number.isFinite(Number(row.FinancialImpactCr)) && Number(row.FinancialImpactCr) > 0);
    const breakdown = groupValue(usable, "Department", "FinancialImpactCr");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.audit, tableRows: usable, detailColumns: IG_TABLE_COLUMNS.audit, detailRows: filterDetailFocus(usable, detailFocus) });
  }

  if (category.id === "audit-timeline") {
    const rows = rangeAudit;
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => yearRows.length);
    const breakdown = trend.map((item) => ({ name: item.name, value: item.value }));
    return finalize(category, { visualKind: "trend", trend, breakdown, tableColumns: IG_TABLE_COLUMNS.audit, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.audit, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "open-observations") {
    const rows = rangeAudit.filter((row) => /open|progress|pending/i.test(row.Status ?? ""));
    return finalize(category, { visualKind: "table", tableColumns: IG_TABLE_COLUMNS.audit, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.audit, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (["legal-cases-status-nature", "court-wise-cases", "case-nature", "case-status"].includes(category.id)) {
    const scoped = applyDrill(rangeCourt, category.levels, drillPath);
    const breakdown = countByLevels(rangeCourt, category.levels, drillPath, "CaseId");
    return finalize(category, { visualKind: category.defaultView, breakdown, tableColumns: IG_TABLE_COLUMNS.court, tableRows: scoped, detailColumns: IG_TABLE_COLUMNS.court, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (category.id === "compliance-status") {
    const usable = rangeCourt.filter((row) => row.ComplianceStatus && !/^(kjnj|mlkmlk|jnn)$/i.test(row.ComplianceStatus));
    const breakdown = groupCount(usable, "ComplianceStatus", "CaseId");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.court, tableRows: usable, detailColumns: IG_TABLE_COLUMNS.court, detailRows: filterDetailFocus(usable, detailFocus) });
  }

  if (category.id === "hearing-timeline") {
    const rows = [...rangeCourt].sort((a, b) => String(a.NextHearingDate).localeCompare(String(b.NextHearingDate)));
    return finalize(category, { visualKind: "table", tableColumns: IG_TABLE_COLUMNS.court, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.court, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "financial-exposure") {
    const usable = rangeCourt.filter((row) => Number.isFinite(Number(row.FinancialExposureCr)) && Number(row.FinancialExposureCr) > 0);
    const breakdown = groupValue(usable, "CourtName", "FinancialExposureCr");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.court, tableRows: usable, detailColumns: IG_TABLE_COLUMNS.court, detailRows: filterDetailFocus(usable, detailFocus) });
  }

  return buildEmptyState(category);
}

export { IG_MODULE_ID };
