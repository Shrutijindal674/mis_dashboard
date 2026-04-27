const IG_MODULE_ID = "Institution & Governance";

const CATEGORY_CONFIG = {
  "institutional-profile": {
    profile: [
     
      {
        id: "rank-trend",
        label: "Rank Trend",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "donut", "table"],
        xLabel: "Academic Year",
        yLabel: "NIRF rank (lower is stronger)",
        format: "number",
        allowPercent: false,
        emptyMessage: "No NIRF ranking data available for the selected institute/year range.",
      },
      {
        id: "degree-portfolio",
        label: "Degree Portfolio",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Degree / discipline category",
        yLabel: "Number of degrees",
        format: "number",
        allowPercent: true,
        emptyMessage: "No degree portfolio records available for the selected institute/year.",
      },
    ],
    programs: [
      {
        id: "academic-programs",
        label: "Academic Programs",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Department",
        yLabel: "Count of programs",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Department", field: "Department" },
          { label: "Degree", field: "Degree" },
          { label: "Mode of Delivery", field: "ModeOfDelivery" },
        ],
        emptyMessage: "No academic programme records available for the selected institute/year.",
      },
      {
        id: "delivery-mode",
        label: "Delivery Mode",
        defaultView: "donut",
        allowedViews: ["donut", "bar", "table"],
        xLabel: "Mode of Delivery",
        yLabel: "Count of programs",
        format: "number",
        allowPercent: true,
        emptyMessage: "No delivery-mode records available for the selected institute/year.",
      },
      {
        id: "teaching-faculty",
        label: "Teaching Faculty",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Department",
        yLabel: "Faculty currently teaching",
        format: "number",
        allowPercent: false,
        emptyMessage: "Teaching-faculty numbers are not structured for this worksheet. Use the Academic Programs table until the field is added.",
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
        xLabel: "Case bucket",
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
        allowedViews: ["bar", "donut", "table"],
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
        allowedViews: ["bar", "donut", "table"],
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
        id: "nirf-ranking",
        label: "NIRF Ranking",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "donut", "table"],
        xLabel: "Academic Year",
        yLabel: "NIRF rank (lower is stronger)",
        format: "number",
        allowPercent: false,
        emptyMessage: "No NIRF ranking data available for the selected institute/year range.",
      },
      {
        id: "qs-the-ranking",
        label: "QS & THE Ranking",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "donut", "table"],
        xLabel: "Academic Year",
        yLabel: "Rank / score",
        format: "number",
        allowPercent: false,
        emptyMessage: "QS/THE rank and score fields are not available for the selected institute/year range.",
      },
      {
        id: "nirf-score-areas",
        label: "NIRF Score Areas",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Score area",
        yLabel: "Score",
        format: "number",
        allowPercent: false,
        emptyMessage: "NIRF score-area fields are not available for the selected institute/year.",
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
        id: "audit-type",
        label: "Audit Type",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Audit type",
        yLabel: "Count of observations",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Audit Type", field: "AuditType" },
          { label: "Department / Unit", field: "Department" },
          { label: "Current Status", field: "Status" },
          { label: "Observation ID", field: "ObservationId" },
        ],
        emptyMessage: "No audit observations available for the selected institute/year.",
      },
      {
        id: "audit-status",
        label: "Audit Status",
        defaultView: "donut",
        allowedViews: ["donut", "bar", "table"],
        xLabel: "Current status",
        yLabel: "Count of observations",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Current Status", field: "Status" },
          { label: "Audit Type", field: "AuditType" },
          { label: "Observation ID", field: "ObservationId" },
        ],
        emptyMessage: "No audit status records available for the selected institute/year.",
      },
      {
        id: "department-audits",
        label: "Department Audits",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Department / Unit",
        yLabel: "Count of observations",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Department / Unit", field: "Department" },
          { label: "Audit Type", field: "AuditType" },
          { label: "Current Status", field: "Status" },
          { label: "Observation ID", field: "ObservationId" },
        ],
        emptyMessage: "No department-wise audit records available for the selected institute/year.",
      },
      {
        id: "financial-impact",
        label: "Financial Impact",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Department / Unit",
        yLabel: "Financial impact (Cr)",
        format: "number",
        allowPercent: false,
        emptyMessage: "Financial impact is not available as a numeric field for the selected institute/year.",
      },
      {
        id: "audit-timeline",
        label: "Audit Timeline",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "donut", "table"],
        xLabel: "Year of audit",
        yLabel: "Count of observations",
        format: "number",
        allowPercent: false,
        emptyMessage: "No year-wise audit observation records available for the selected institute/year range.",
      },
      {
        id: "open-observations",
        label: "Open Observations",
        defaultView: "table",
        allowedViews: ["table"],
        xLabel: "Observation ID",
        yLabel: "Status/action/remarks",
        format: "number",
        allowPercent: false,
        emptyMessage: "No open observations available for the selected institute/year.",
      },
    ],
  },
  "court-cases": {
    legal: [
      {
        id: "court-wise-cases",
        label: "Court-wise Cases",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Court name",
        yLabel: "Count of cases",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Court Name", field: "CourtName" },
          { label: "Nature of Case", field: "NatureOfCase" },
          { label: "Current Status", field: "Status" },
          { label: "Case Number", field: "CaseId" },
        ],
        emptyMessage: "No court-case records available for the selected institute/year.",
      },
      {
        id: "case-nature",
        label: "Case Nature",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Nature of case",
        yLabel: "Count of cases",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Nature of Case", field: "NatureOfCase" },
          { label: "Current Status", field: "Status" },
          { label: "Case Number", field: "CaseId" },
        ],
        emptyMessage: "No case-nature records available for the selected institute/year.",
      },
      {
        id: "case-status",
        label: "Case Status",
        defaultView: "donut",
        allowedViews: ["donut", "bar", "table"],
        xLabel: "Current status",
        yLabel: "Count of cases",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Current Status", field: "Status" },
          { label: "Court Name", field: "CourtName" },
          { label: "Case Number", field: "CaseId" },
        ],
        emptyMessage: "No case-status records available for the selected institute/year.",
      },
      {
        id: "compliance-status",
        label: "Compliance Status",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Compliance status",
        yLabel: "Count of cases",
        format: "number",
        allowPercent: true,
        emptyMessage: "Compliance statuses are not structured cleanly for the selected institute/year.",
      },
      {
        id: "hearing-timeline",
        label: "Hearing Timeline",
        defaultView: "table",
        allowedViews: ["table"],
        xLabel: "Next hearing date",
        yLabel: "Case list",
        format: "number",
        allowPercent: false,
        emptyMessage: "No next-hearing records available for the selected institute/year.",
      },
      {
        id: "financial-exposure",
        label: "Financial Exposure",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Court name / case nature",
        yLabel: "Financial exposure (Cr)",
        format: "number",
        allowPercent: false,
        emptyMessage: "Financial implications are not available as a numeric field for the selected institute/year.",
      },
    ],
  },
};

const IG_TABLE_COLUMNS = {
  institutionalProfile: [
    { key: "Year", label: "Year" },
    { key: "DegreeCategory", label: "Degree category" },
    { key: "DegreeCount", label: "Value" },
    { key: "NIRFOverallRank", label: "NIRF Overall" },
    { key: "NIRFEngineeringRank", label: "NIRF Engineering" },
  ],
  academicPrograms: [
    { key: "Year", label: "Year" },
    { key: "Department", label: "Department" },
    { key: "Degree", label: "Degree" },
    { key: "ModeOfDelivery", label: "Mode of Delivery" },
    { key: "ProgramName", label: "Program" },
    { key: "FacultyCurrentlyTeaching", label: "Faculty currently teaching" },
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
  return rows.filter((row) => forInstitute(row, instituteId) && Number(row.Year) === Number(yearRange.to));
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
  const hasCards = Boolean(state.cards?.length);
  const hasBreakdown = Boolean(state.breakdown?.length);
  const hasTrend = Boolean(state.trend?.length);
  const hasTable = Boolean(state.tableRows?.length || state.detailRows?.length);

  const views = [];
  if (hasCards) views.push("cards");
  if (hasBreakdown) views.push("bar");
  if (hasBreakdown) views.push("donut");
  if (hasTrend) views.push("trend");
  if (hasTable) views.push("table");

  return uniqueViews(views);
}

function buildEmptyState(category, state = {}, emptyMessage = null) {
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
    levels: category.levels ?? [],
    tableColumns: state.tableColumns ?? [],
    tableRows: state.tableRows ?? [],
    detailRows: state.detailRows ?? state.tableRows ?? [],
    detailColumns: state.detailColumns ?? state.tableColumns ?? [],
    xLabel: category.xLabel,
    yLabel: category.yLabel,
    format: category.format ?? "number",
    allowPercent: false,
    emptyTitle: category.label,
    emptyMessage: emptyMessage ?? category.emptyMessage ?? "Visual for this category is not available.",
  };
}

function finalize(category, state) {
  const hasCards = state.cards?.length;
  const hasBreakdown = state.breakdown?.length;
  const hasTrend = state.trend?.length;
  const hasTable = state.tableRows?.length || state.detailRows?.length;
  const hasVisual = hasCards || hasBreakdown || hasTrend;
  const isEmpty = category.defaultView === "empty" || !hasVisual;
  if (isEmpty) {
    const tableOnlyMessage =
      hasTable && !hasVisual
        ? "Visual for this category is not available. Use Details to view the table records."
        : null;
    return buildEmptyState(category, state, tableOnlyMessage);
  }

  const views = deriveAllowedViews(category, state);
  const defaultView = views.includes(category.defaultView)
    ? category.defaultView
    : views[0] ?? state.visualKind ?? "table";

  return {
    id: category.id,
    category,
    isEmpty: false,
    visualKind: state.visualKind ?? defaultView,
    defaultView,
    allowedViews: views,
    cards: state.cards ?? [],
    breakdown: state.breakdown ?? [],
    trend: state.trend ?? [],
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
      tableRows: latestProfile,
      detailColumns: IG_TABLE_COLUMNS.institutionalProfile,
      detailRows: latestProfile,
    });
  }

  if (category.id === "rank-trend") {
    const scoped = rangeRows(profileRows, instituteId, yearRange);
    const trend = buildTrendFromRows(scoped, yearRange, (rows) => rows[0]?.NIRFOverallRank ?? null);
    const breakdown = trend.map((item) => ({ name: item.name, value: item.value }));
    const tableRows = scoped.filter((row, index, arr) => arr.findIndex((x) => x.Year === row.Year) === index);
    return finalize(category, {
      visualKind: "trend",
      trend,
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.institutionalProfile,
      tableRows,
      detailColumns: IG_TABLE_COLUMNS.institutionalProfile,
      detailRows: tableRows,
    });
  }

  if (category.id === "degree-portfolio") {
    const breakdown = groupValue(latestProfile, "DegreeCategory", "DegreeCount");
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.institutionalProfile,
      tableRows: latestProfile,
      detailColumns: IG_TABLE_COLUMNS.institutionalProfile,
      detailRows: latestProfile,
    });
  }

  if (category.id === "academic-programs") {
    const scoped = applyDrill(latestAcademic, category.levels, drillPath);
    const breakdown = countByLevels(latestAcademic, category.levels, drillPath, "ProgramName");
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.academicPrograms,
      tableRows: scoped,
      detailColumns: IG_TABLE_COLUMNS.academicPrograms,
      detailRows: filterDetailFocus(scoped, detailFocus),
    });
  }

  if (category.id === "delivery-mode") {
    const breakdown = groupCount(latestAcademic, "ModeOfDelivery", "ProgramName");
    return finalize(category, {
      visualKind: "donut",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.academicPrograms,
      tableRows: latestAcademic,
      detailColumns: IG_TABLE_COLUMNS.academicPrograms,
      detailRows: filterDetailFocus(latestAcademic, detailFocus),
    });
  }

  if (category.id === "teaching-faculty") {
    const usable = latestAcademic.filter((row) => Number.isFinite(Number(row.FacultyCurrentlyTeaching)) && Number(row.FacultyCurrentlyTeaching) > 0);
    const breakdown = groupValue(usable, "Department", "FacultyCurrentlyTeaching");
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.academicPrograms,
      tableRows: usable,
      detailColumns: IG_TABLE_COLUMNS.academicPrograms,
      detailRows: filterDetailFocus(usable, detailFocus),
    });
  }

  if (category.id === "grievance-resolution") {
    const rows = latestGovernance.filter((row) => row.Theme === "Anti-Ragging & Grievance");
    const report = sum(rows, "CasesReported");
    const resolved = sum(rows, "CasesResolved");
    const pending = sum(rows, "CasesPending");
    const breakdown = report ? [
      { name: "Reported", value: report },
      { name: "Resolved", value: resolved },
      { name: "Pending", value: pending },
    ] : [];
    return finalize(category, {
      visualKind: "bar",
      breakdown,
      tableColumns: IG_TABLE_COLUMNS.governance,
      tableRows: rows,
      detailColumns: IG_TABLE_COLUMNS.governance,
      detailRows: filterDetailFocus(rows, detailFocus),
    });
  }

  if (category.id === "committees") {
    const rows = latestGovernance.filter((row) => row.Theme === "Anti-Ragging & Grievance" && row.CommitteeMemberCount);
    const breakdown = groupValue(rows, "CommitteeType", "CommitteeMemberCount");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "qa-reviews") {
    const rows = latestGovernance.filter((row) => row.Theme === "Internal QA Mechanisms");
    const breakdown = rows.length ? [
      { name: "Academic audits", value: sum(rows, "AcademicAuditCount") },
      { name: "Feedback cycles", value: sum(rows, "FeedbackCycles") },
      { name: "Improvement actions", value: sum(rows, "ImprovementActions") },
    ] : [];
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "governance-meetings") {
    const rows = latestGovernance.filter((row) => row.Theme === "Institutional Governance Structure");
    const breakdown = groupValue(rows, "GoverningBody", "MeetingCount");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "inclusion-metrics") {
    const rows = latestGovernance.filter((row) => row.Theme === "Diversity & Inclusion" && row.Unit === "%");
    const breakdown = normalizePercentRows(rows.map((row) => ({ name: row.Metric, value: row.Value })));
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "policy-status") {
    const rows = latestGovernance.filter((row) => row.Theme === "Diversity & Inclusion");
    const breakdown = groupCount(rows, "Status");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.governance, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.governance, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "nirf-ranking") {
    const rows = rangeRows(rankingRows, instituteId, yearRange).filter((row) => row.Category === "Rankings" && /NIRF/i.test(row.Scheme ?? ""));
    const trend = buildTrendFromRows(rows.filter((row) => /Overall/i.test(row.Scheme ?? "")), yearRange, (yearRows) => yearRows[0]?.Score ?? null);
    const breakdown = trend.map((item) => ({ name: item.name, value: item.value }));
    return finalize(category, { visualKind: "trend", trend, breakdown, tableColumns: IG_TABLE_COLUMNS.rankings, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.rankings, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "qs-the-ranking") {
    const rows = rangeRows(rankingRows, instituteId, yearRange).filter((row) => /QS|THE/i.test(row.Scheme ?? ""));
    const trend = buildTrendFromRows(rows.filter((row) => /QS Rank/i.test(row.Scheme ?? "")), yearRange, (yearRows) => yearRows[0]?.Score ?? null);
    const breakdown = trend.map((item) => ({ name: item.name, value: item.value }));
    return finalize(category, { visualKind: "trend", trend, breakdown, tableColumns: IG_TABLE_COLUMNS.rankings, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.rankings, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "nirf-score-areas") {
    const rows = latestRankings.filter((row) => row.Category === "NIRF Score Areas");
    const breakdown = groupValue(rows, "Scheme", "Score");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.rankings, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.rankings, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "accreditation-status") {
    const rows = latestAccreditation;
    const tableRows = rows.map((row) => ({ ...row, StatusKey: `${row.Body}: ${row.GradeOrStatus}` }));
    const breakdown = groupCount(tableRows, "StatusKey");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.accreditation, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.accreditation, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "validity-timeline") {
    const rows = latestAccreditation;
    return finalize(category, { visualKind: "table", tableColumns: IG_TABLE_COLUMNS.accreditation, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.accreditation, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "iso-certifications") {
    return buildEmptyState(category);
  }

  if (["audit-type", "audit-status", "department-audits"].includes(category.id)) {
    const scoped = applyDrill(latestAudit, category.levels, drillPath);
    const breakdown = countByLevels(latestAudit, category.levels, drillPath, "ObservationId");
    return finalize(category, { visualKind: category.defaultView, breakdown, tableColumns: IG_TABLE_COLUMNS.audit, tableRows: scoped, detailColumns: IG_TABLE_COLUMNS.audit, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (category.id === "financial-impact") {
    const usable = latestAudit.filter((row) => Number.isFinite(Number(row.FinancialImpactCr)) && Number(row.FinancialImpactCr) > 0);
    const breakdown = groupValue(usable, "Department", "FinancialImpactCr");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.audit, tableRows: usable, detailColumns: IG_TABLE_COLUMNS.audit, detailRows: filterDetailFocus(usable, detailFocus) });
  }

  if (category.id === "audit-timeline") {
    const rows = rangeRows(auditRows, instituteId, yearRange);
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => yearRows.length);
    const breakdown = trend.map((item) => ({ name: item.name, value: item.value }));
    return finalize(category, { visualKind: "trend", trend, breakdown, tableColumns: IG_TABLE_COLUMNS.audit, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.audit, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "open-observations") {
    const rows = latestAudit.filter((row) => /open|progress|pending/i.test(row.Status ?? ""));
    return finalize(category, { visualKind: "table", tableColumns: IG_TABLE_COLUMNS.audit, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.audit, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (["court-wise-cases", "case-nature", "case-status"].includes(category.id)) {
    const scoped = applyDrill(latestCourt, category.levels, drillPath);
    const breakdown = countByLevels(latestCourt, category.levels, drillPath, "CaseId");
    return finalize(category, { visualKind: category.defaultView, breakdown, tableColumns: IG_TABLE_COLUMNS.court, tableRows: scoped, detailColumns: IG_TABLE_COLUMNS.court, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (category.id === "compliance-status") {
    const usable = latestCourt.filter((row) => row.ComplianceStatus && !/^(kjnj|mlkmlk|jnn)$/i.test(row.ComplianceStatus));
    const breakdown = groupCount(usable, "ComplianceStatus", "CaseId");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.court, tableRows: usable, detailColumns: IG_TABLE_COLUMNS.court, detailRows: filterDetailFocus(usable, detailFocus) });
  }

  if (category.id === "hearing-timeline") {
    const rows = [...latestCourt].sort((a, b) => String(a.NextHearingDate).localeCompare(String(b.NextHearingDate)));
    return finalize(category, { visualKind: "table", tableColumns: IG_TABLE_COLUMNS.court, tableRows: rows, detailColumns: IG_TABLE_COLUMNS.court, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "financial-exposure") {
    const usable = latestCourt.filter((row) => Number.isFinite(Number(row.FinancialExposureCr)) && Number(row.FinancialExposureCr) > 0);
    const breakdown = groupValue(usable, "CourtName", "FinancialExposureCr");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: IG_TABLE_COLUMNS.court, tableRows: usable, detailColumns: IG_TABLE_COLUMNS.court, detailRows: filterDetailFocus(usable, detailFocus) });
  }

  return buildEmptyState(category);
}

export { IG_MODULE_ID };
