const PSL_MODULE_ID = "People & Student Life";

const CATEGORY_CONFIG = {
  "student-profile": {
    "admission-mode": [
      {
        id: "student-distribution-admission-mode",
        label: "Student Distribution",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Admission Mode",
        yLabel: "Number of Students",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Admission Mode / admission_channel", field: "AdmissionChannel" },
          { label: "Department / Discipline", field: "Department" },
          { label: "Degree", field: "Degree" },
        ],
        emptyMessage: "No admission-mode student-count records are available for the selected institute/year.",
      },
    ],
    "enrollment-details": [
      {
        id: "total-enrollment-university-department",
        label: "Total Enrollment",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "University / Department",
        yLabel: "Number of Students",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "University / Department", field: "Department" },
          { label: "Degree", field: "Degree" },
        ],
        emptyMessage: "No enrollment-detail records are available for the selected institute/year.",
      },
    ],
    "international-students": [
      {
        id: "international-students-region-country",
        label: "International Student Distribution by Region",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Region / Country",
        yLabel: "Number of International Students",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Region / Country", field: "Region" },
          { label: "Country", field: "Country" },
        ],
        emptyMessage: "No international-student region records are available for the selected institute/year.",
      },
      {
        id: "international-students-university-degree",
        label: "International Students by University & Degree",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "University / Department",
        yLabel: "Number of International Students",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Department / Discipline", field: "Department" },
          { label: "Degree", field: "Degree" },
        ],
        emptyMessage: "No international-student degree records are available for the selected institute/year.",
      },
    ],
    "student-death-cases": [
      {
        id: "student-death-cases-nature",
        label: "Student Death Cases",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Nature of Death",
        yLabel: "Number of Cases",
        format: "number",
        allowPercent: false,
        drillable: true,
        levels: [
          { label: "Nature of Death", field: "NatureOfDeath" },
          { label: "Department / Discipline", field: "Department" },
          { label: "Degree", field: "Degree" },
        ],
        emptyMessage: "No aggregate student-death case records are available for the selected institute/year. Individual-level records are intentionally not displayed.",
      },
    ],
    "student-profile-sheet": [
      {
        id: "enrollment-distribution-program-type",
        label: "Enrollment Distribution by Program Type",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Program Type",
        yLabel: "Number of Students",
        format: "number",
        allowPercent: true,
        emptyMessage: "No student-profile summary records are available for the selected institute/year.",
      },
      {
        id: "year-wise-enrollment-trend",
        label: "Year-wise Enrollment Trend",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Academic Year",
        yLabel: "Number of Students",
        format: "number",
        allowPercent: false,
        emptyMessage: "No year-wise enrollment records are available for the selected institute/year.",
      },
      {
        id: "gender-distribution",
        label: "Gender Distribution",
        defaultView: "donut",
        allowedViews: ["donut", "bar", "table"],
        xLabel: "Gender",
        yLabel: "Number of Students",
        format: "number",
        allowPercent: true,
        emptyMessage: "No gender-distribution records are available for the selected institute/year.",
      },
      {
        id: "reservation-category-distribution",
        label: "Reservation Category-wise Distribution",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Category",
        yLabel: "Number of Students",
        format: "number",
        allowPercent: true,
        emptyMessage: "No reservation-category records are available for the selected institute/year.",
      },
    ],
  },
  "student-support-system": {
    "career-services": [
      {
        id: "career-services-sessions",
        label: "Career Services",
        defaultView: "bar",
        allowedViews: ["bar", "trend", "table"],
        xLabel: "Year",
        yLabel: "Career Guidance Sessions",
        format: "number",
        allowPercent: false,
        emptyMessage: "No career-service records are available for the selected institute/year.",
      },
    ],
    "counselling-services": [
      {
        id: "counselling-service-utilisation",
        label: "Counselling Service",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Number of Counsellors / Counselling Service Type",
        yLabel: "Students Availing Counselling Service",
        format: "number",
        allowPercent: false,
        emptyMessage: "No counselling-service records are available for the selected institute/year.",
      },
    ],
    "entrepreneurship-support": [
      {
        id: "entrepreneurship-skills-startups",
        label: "Entrepreneurship Skills",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Year",
        yLabel: "Number of Student-led Startups",
        format: "number",
        allowPercent: false,
        emptyMessage: "No entrepreneurship-support records are available for the selected institute/year.",
      },
    ],
    "medical-staff-details": [
      {
        id: "medical-team-qualifications",
        label: "Medical Team Qualifications",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Qualification / Employee Role",
        yLabel: "Count",
        format: "number",
        allowPercent: true,
        emptyMessage: "No medical-staff detail records are available for the selected institute/year.",
      },
    ],
    "medical-staff-summary": [
      {
        id: "medical-personnel-composition",
        label: "Medical Staff → Medical Personnel",
        defaultView: "donut",
        allowedViews: ["donut", "bar", "table"],
        xLabel: "No axis; pie slices are personnel types",
        yLabel: "No axis; values are counts",
        format: "number",
        allowPercent: true,
        emptyMessage: "No medical-personnel summary records are available for the selected institute/year.",
      },
      {
        id: "medical-personnel-working-hours",
        label: "Medical Staff → Working Hours",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Average Working Hours",
        yLabel: "Medical Personnel",
        format: "number",
        allowPercent: false,
        barLayout: "horizontal",
        emptyMessage: "No medical-duty hour records are available for the selected institute/year.",
      },
    ],
    "scholarships-fellowships": [
      {
        id: "scholarships-fellowships-beneficiaries",
        label: "Scholarships and Fellowships",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Scholarship / Fellowship Type",
        yLabel: "Number of Beneficiaries",
        format: "number",
        allowPercent: true,
        emptyMessage: "No scholarship/fellowship records are available for the selected institute/year.",
      },
    ],
  },
  "placements-alumni": {
    "top-recruiters": [
      {
        id: "top-recruiters-region-wise",
        label: "Top Recruiters - Region-wise",
        defaultView: "bar",
        allowedViews: ["bar", "donut", "table"],
        xLabel: "Country → State (if India) → Company",
        yLabel: "Students Recruited",
        format: "number",
        allowPercent: true,
        drillable: true,
        levels: [
          { label: "Country → State (if India) → Company", field: "Country" },
          { label: "State (if India)", field: "StateIfIndia" },
          { label: "Company", field: "Company" },
        ],
        emptyMessage: "No top-recruiter records are available for the selected institute/year.",
      },
    ],
    "alumni-network": [
      {
        id: "alumni-network-active-members",
        label: "Alumni Network - Total Active Members",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Year",
        yLabel: "Active Members",
        format: "number",
        allowPercent: false,
        emptyMessage: "No alumni-network member records are available for the selected institute/year.",
      },
      {
        id: "alumni-network-engagement-rate",
        label: "Alumni Network - Engagement Rate",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Year",
        yLabel: "Engagement Rate",
        format: "pct",
        allowPercent: false,
        emptyMessage: "No alumni engagement-rate records are available for the selected institute/year.",
      },
      {
        id: "alumni-network-endowment-contribution",
        label: "Alumni Network - Endowment Contribution",
        defaultView: "trend",
        allowedViews: ["trend", "bar", "table"],
        xLabel: "Year",
        yLabel: "Endowment Contribution",
        format: "number",
        allowPercent: false,
        emptyMessage: "No alumni endowment contribution records are available for the selected institute/year.",
      },
    ],
  },
};

const TABLE_COLUMNS = {
  admissionMode: [
    { key: "Year", label: "Year" },
    { key: "AdmissionChannel", label: "Admission Mode" },
    { key: "Department", label: "Department / Discipline" },
    { key: "Degree", label: "Degree" },
    { key: "StudentCount", label: "Number of Students" },
    { key: "Details", label: "Details" },
  ],
  enrollmentDetails: [
    { key: "Year", label: "Year" },
    { key: "Department", label: "Department / Discipline" },
    { key: "Degree", label: "Degree" },
    { key: "Gender", label: "Gender" },
    { key: "SocialCategory", label: "Category" },
    { key: "Enrollment", label: "Enrollment" },
    { key: "DropoutCount", label: "Dropout Count" },
    { key: "DropoutRate", label: "Dropout Rate", format: (value) => `${(Number(value ?? 0) * 100).toFixed(2)}%` },
  ],
  internationalStudents: [
    { key: "Year", label: "Year" },
    { key: "Region", label: "Region" },
    { key: "Country", label: "Country" },
    { key: "Department", label: "Department / Discipline" },
    { key: "Degree", label: "Degree" },
    { key: "NumberOfStudents", label: "Number of International Students" },
  ],
  studentProfile: [
    { key: "Year", label: "Year" },
    { key: "Department", label: "Department" },
    { key: "TotalEnrolledStudents", label: "Total Enrolled" },
    { key: "UgEnrolled", label: "UG" },
    { key: "PgEnrolled", label: "PG" },
    { key: "PhdEnrolled", label: "PhD" },
    { key: "PostdoctoralEnrolled", label: "Postdoctoral" },
    { key: "StudentTeacherRatio", label: "Student Teacher Ratio" },
    { key: "TotalDropoutCount", label: "Dropout Count" },
    { key: "TotalDropoutRate", label: "Dropout Rate", format: (value) => `${(Number(value ?? 0) * 100).toFixed(2)}%` },
  ],
  studentDeathCases: [
    { key: "Year", label: "Year" },
    { key: "NatureOfDeath", label: "Nature of Death" },
    { key: "Department", label: "Department / Discipline" },
    { key: "Degree", label: "Degree" },
    { key: "NumberOfCases", label: "Number of Cases" },
    { key: "StudentSuicideCasesNumber", label: "Student Suicide Cases" },
    { key: "Details", label: "Details" },
  ],
  careerServices: [
    { key: "Year", label: "Year" },
    { key: "Department", label: "Department" },
    { key: "ServiceType", label: "Service Type" },
    { key: "CareerGuidanceSessions", label: "Career Guidance Sessions" },
    { key: "StudentsAttended", label: "Students Attended" },
    { key: "Details", label: "Details" },
  ],
  counsellingServices: [
    { key: "Year", label: "Year" },
    { key: "CounsellingServiceType", label: "Counselling Service Type" },
    { key: "NumberCounselors", label: "Number of Counsellors" },
    { key: "StudentsAvailed", label: "Students Availed" },
    { key: "ServiceUnit", label: "Service Unit" },
    { key: "Details", label: "Details" },
  ],
  entrepreneurshipSupport: [
    { key: "Year", label: "Year" },
    { key: "StartupSector", label: "Startup Sector" },
    { key: "StudentStartups", label: "Student-led Startups" },
    { key: "StudentParticipants", label: "Student Participants" },
    { key: "SupportUnit", label: "Support Unit" },
    { key: "Details", label: "Details" },
  ],
  medicalStaffDetails: [
    { key: "Year", label: "Year" },
    { key: "EmployeeRole", label: "Employee Role" },
    { key: "Qualification", label: "Qualification" },
    { key: "StaffCount", label: "Staff Count" },
    { key: "MedicalUnit", label: "Medical Unit" },
    { key: "Details", label: "Details" },
  ],
  medicalStaffSummary: [
    { key: "Year", label: "Year" },
    { key: "CampusUnit", label: "Campus Unit" },
    { key: "TotalNumberOfDoctors", label: "Doctors" },
    { key: "TotalNumberOfNurses", label: "Nurses" },
    { key: "TotalNumberOfParamedicsFirstAidStaff", label: "Paramedics / First Aid" },
    { key: "TotalNumberOfMentalHealthProfessionals", label: "Mental Health Professionals" },
    { key: "TotalNumberOfEmergencyResponsePersonnel", label: "Emergency Response Personnel" },
  ],
  scholarshipsFellowships: [
    { key: "Year", label: "Year" },
    { key: "ScholarshipFellowshipType", label: "Scholarship / Fellowship Type" },
    { key: "NumberBeneficiaries", label: "Number of Beneficiaries" },
    { key: "EstimatedAmountInrCrore", label: "Amount (INR Crore)" },
    { key: "FundingSource", label: "Funding Source" },
    { key: "Details", label: "Details" },
  ],
  topRecruiters: [
    { key: "Year", label: "Year" },
    { key: "Country", label: "Country" },
    { key: "StateIfIndia", label: "State (if India)" },
    { key: "Company", label: "Company" },
    { key: "StudentsRecruited", label: "Students Recruited" },
    { key: "Department", label: "Department" },
    { key: "Sector", label: "Sector" },
  ],
  alumniNetwork: [
    { key: "Year", label: "Year" },
    { key: "AlumniChapter", label: "Alumni Chapter" },
    { key: "ActiveMembers", label: "Active Members" },
    { key: "EngagementRate", label: "Engagement Rate", format: (value) => `${(Number(value ?? 0) * 100).toFixed(2)}%` },
    { key: "EndowmentContributionInrCrore", label: "Endowment Contribution (INR Crore)" },
    { key: "AlumniEventsCount", label: "Events Count" },
    { key: "MentorshipProgramsCount", label: "Mentorship Programs" },
  ],
};

function inRange(row, yearRange) {
  const year = Number(row.Year ?? 0);
  return year >= Number(yearRange.from) && year <= Number(yearRange.to);
}

function forInstitute(row, instituteId) {
  return !instituteId || row.InstituteId === instituteId;
}

function rangeRows(rows = [], instituteId, yearRange) {
  return rows.filter((row) => forInstitute(row, instituteId) && inRange(row, yearRange));
}

function latestRows(rows = [], instituteId, yearRange) {
  const scoped = rangeRows(rows, instituteId, yearRange);
  const latestYear = Math.max(...scoped.map((row) => Number(row.Year ?? 0)).filter(Number.isFinite));
  if (!Number.isFinite(latestYear)) return [];
  return scoped.filter((row) => Number(row.Year) === latestYear);
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

function average(rows, field) {
  const nums = rows.map((row) => Number(row[field] ?? 0)).filter(Number.isFinite);
  if (!nums.length) return 0;
  return Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
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

function groupValue(rows, field, valueField) {
  const map = new Map();
  for (const row of rows) {
    const key = row[field] ?? "(unknown)";
    const numeric = Number(row[valueField] ?? 0);
    map.set(key, (map.get(key) ?? 0) + (Number.isFinite(numeric) ? numeric : 0));
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.name !== "(unknown)" && Number.isFinite(item.value) && item.value !== 0)
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

function valueByLevels(rows, levels, drillPath, valueField) {
  const scoped = applyDrill(rows, levels, drillPath);
  const field = levels?.[drillPath.length]?.field;
  if (!field) return [];
  return groupValue(scoped, field, valueField);
}

function filterDetailFocus(rows, detailFocus) {
  if (!detailFocus?.field) return rows;
  return rows.filter((row) => String(row[detailFocus.field] ?? "(unknown)") === String(detailFocus.value));
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

function buildTimeSeriesRows(rows, yearRange, groupField, valueField, aggregation = "sum") {
  const keys = Array.from(new Set(rows.map((row) => row[groupField]).filter(Boolean))).slice(0, 10);
  const timeSeriesRows = [];
  for (let year = Number(yearRange.from); year <= Number(yearRange.to); year += 1) {
    const yearRows = rows.filter((row) => Number(row.Year) === year);
    if (!yearRows.length) continue;
    const out = { name: String(year) };
    for (const key of keys) {
      const bucket = yearRows.filter((row) => row[groupField] === key);
      out[key] = aggregation === "avg" ? average(bucket, valueField) : sum(bucket, valueField);
    }
    timeSeriesRows.push(out);
  }
  return { timeSeriesRows, timeSeriesKeys: keys };
}

function wideBreakdown(rows, defs, aggregation = "sum") {
  return defs
    .map(([name, field]) => ({
      name,
      value: aggregation === "avg" ? average(rows, field) : sum(rows, field),
    }))
    .filter((item) => Number.isFinite(item.value) && item.value !== 0);
}

function detailRowsFromWide(rows, defs, labelKey, valueKey, aggregation = "sum") {
  return defs.map(([name, field]) => ({ [labelKey]: name, [valueKey]: aggregation === "avg" ? average(rows, field) : sum(rows, field) }));
}

function uniqueViews(views) {
  return views.filter((view, index) => view && views.indexOf(view) === index);
}

function deriveAllowedViews(category, state) {
  const hasBreakdown = Boolean(state.breakdown?.length);
  const hasTrend = Boolean(state.trend?.length || state.timeSeriesRows?.length);
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
    levels: state.levels ?? category.levels ?? [],
    tableColumns: state.tableColumns ?? [],
    tableRows: state.tableRows ?? [],
    detailRows: state.detailRows ?? state.tableRows ?? [],
    detailColumns: state.detailColumns ?? state.tableColumns ?? [],
    barLayout: category.barLayout ?? state.barLayout ?? null,
    xLabel: category.xLabel,
    yLabel: category.yLabel,
    format: category.format ?? "number",
    allowPercent: false,
    emptyTitle: "No Data Available",
    emptyMessage: emptyMessage ?? category.emptyMessage ?? "No data is available for this People & Student Life visual.",
  };
}

function finalize(category, state) {
  const views = deriveAllowedViews(category, state);
  if (!views.length) return buildEmptyState(category, state);
  const defaultView = views.includes(category.defaultView) ? category.defaultView : views[0] ?? state.visualKind ?? "table";
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
    levels: state.levels ?? category.levels ?? [],
    tableColumns: state.tableColumns ?? [],
    tableRows: state.tableRows ?? [],
    detailRows: state.detailRows ?? state.tableRows ?? [],
    detailColumns: state.detailColumns ?? state.tableColumns ?? [],
    barLayout: category.barLayout ?? state.barLayout ?? null,
    xLabel: category.xLabel,
    yLabel: category.yLabel,
    format: category.format ?? "number",
    allowPercent: Boolean(category.allowPercent),
    drillable: Boolean(category.drillable),
    emptyTitle: category.label,
    emptyMessage: category.emptyMessage ?? "Visual for this metric is not available here.",
  };
}

export function getPeopleStudentLifeCategories(subsectionId, viewId) {
  return CATEGORY_CONFIG[subsectionId]?.[viewId] ?? [];
}

export function getDefaultPeopleStudentLifeCategoryId(subsectionId, viewId) {
  return getPeopleStudentLifeCategories(subsectionId, viewId)?.[0]?.id ?? null;
}

export function isPeopleStudentLifeSubsection(subsectionId) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_CONFIG, subsectionId);
}

export function buildPeopleStudentLifeVisual({
  facts,
  subsectionId,
  viewId,
  categoryId,
  instituteId,
  yearRange,
  drillPath = [],
  detailFocus = null,
}) {
  const categories = getPeopleStudentLifeCategories(subsectionId, viewId);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  if (!category) return null;

  const latest = (rows) => latestRows(rows, instituteId, yearRange);
  const ranged = (rows) => rangeRows(rows, instituteId, yearRange);

  if (category.id === "student-distribution-admission-mode") {
    const rows = ranged(facts?.admissionMode ?? []);
    const scoped = applyDrill(rows, category.levels, drillPath);
    const breakdown = valueByLevels(rows, category.levels, drillPath, "StudentCount");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.admissionMode, tableRows: scoped, detailColumns: TABLE_COLUMNS.admissionMode, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (category.id === "total-enrollment-university-department") {
    const rows = ranged(facts?.enrollmentDetails ?? []);
    const scoped = applyDrill(rows, category.levels, drillPath);
    const breakdown = valueByLevels(rows, category.levels, drillPath, "Enrollment");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.enrollmentDetails, tableRows: scoped, detailColumns: TABLE_COLUMNS.enrollmentDetails, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (["international-students-region-country", "international-students-university-degree"].includes(category.id)) {
    const rows = ranged(facts?.intlStudentRecords ?? []);
    const scoped = applyDrill(rows, category.levels, drillPath);
    const breakdown = valueByLevels(rows, category.levels, drillPath, "NumberOfStudents");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.internationalStudents, tableRows: scoped, detailColumns: TABLE_COLUMNS.internationalStudents, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (category.id === "student-death-cases-nature") {
    const rows = ranged(facts?.studentDeathCases ?? []);
    const scoped = applyDrill(rows, category.levels, drillPath);
    const breakdown = valueByLevels(rows, category.levels, drillPath, "NumberOfCases");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.studentDeathCases, tableRows: scoped, detailColumns: TABLE_COLUMNS.studentDeathCases, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (category.id === "enrollment-distribution-program-type") {
    const rows = latest(facts?.studentProfileSummaryWide ?? []);
    const tableRows = ranged(facts?.studentProfileSummaryWide ?? []);
    const defs = [["UG", "UgEnrolled"], ["PG", "PgEnrolled"], ["PhD", "PhdEnrolled"], ["Postdoctoral", "PostdoctoralEnrolled"]];
    const breakdown = wideBreakdown(rows, defs);
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.studentProfile, tableRows, detailColumns: TABLE_COLUMNS.studentProfile, detailRows: filterDetailFocus(tableRows, detailFocus) });
  }

  if (category.id === "year-wise-enrollment-trend") {
    const rows = ranged(facts?.studentProfileSummaryWide ?? []);
    const latestForBreakdown = latest(facts?.studentProfileSummaryWide ?? []);
    const defs = [["Year 1", "TotalEnrolledYear1"], ["Year 2", "TotalEnrolledYear2"], ["Year 3", "TotalEnrolledYear3"], ["Year 4", "TotalEnrolledYear4"]];
    const breakdown = wideBreakdown(latestForBreakdown, defs);
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => sum(yearRows, "TotalEnrolledStudents"));
    return finalize(category, { visualKind: "trend", breakdown, trend, tableColumns: TABLE_COLUMNS.studentProfile, tableRows: rows, detailColumns: TABLE_COLUMNS.studentProfile, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "gender-distribution") {
    const rows = latest(facts?.studentProfileSummaryWide ?? []);
    const tableRows = ranged(facts?.studentProfileSummaryWide ?? []);
    const defs = [["Male", "TotalMaleStudents"], ["Female", "TotalFemaleStudents"], ["Other", "TotalOtherStudents"]];
    const breakdown = wideBreakdown(rows, defs);
    return finalize(category, { visualKind: "donut", breakdown, tableColumns: TABLE_COLUMNS.studentProfile, tableRows, detailColumns: TABLE_COLUMNS.studentProfile, detailRows: filterDetailFocus(tableRows, detailFocus) });
  }

  if (category.id === "reservation-category-distribution") {
    const rows = latest(facts?.studentProfileSummaryWide ?? []);
    const tableRows = ranged(facts?.studentProfileSummaryWide ?? []);
    const defs = [["SC", "ScReservedCategoryStudentsNumber"], ["ST", "StReservedCategoryStudentsNumber"], ["OBC", "ObcReservedCategoryStudentsNumber"], ["EWS", "EwsReservedCategoryStudentsNumber"], ["PwD", "PwdReservedCategoryStudentsNumber"]];
    const breakdown = wideBreakdown(rows, defs);
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.studentProfile, tableRows, detailColumns: TABLE_COLUMNS.studentProfile, detailRows: filterDetailFocus(tableRows, detailFocus) });
  }

  if (category.id === "career-services-sessions") {
    const rows = ranged(facts?.careerServices ?? []);
    const latestForBreakdown = latest(facts?.careerServices ?? []);
    const totalSessions = sum(rows, "CareerGuidanceSessions");
    const totalStudents = sum(rows, "StudentsAttended");
    const breakdown = groupValue(latestForBreakdown.length ? latestForBreakdown : rows, "ServiceType", "CareerGuidanceSessions");
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => sum(yearRows, "CareerGuidanceSessions"));
    return finalize(category, {
      visualKind: "cards",
      cards: [
        { label: "Career guidance sessions", value: totalSessions, note: `${yearRange.from}–${yearRange.to}` },
        { label: "Students attended", value: totalStudents, note: "Secondary utilisation metric" },
      ],
      breakdown,
      trend,
      tableColumns: TABLE_COLUMNS.careerServices,
      tableRows: rows,
      detailColumns: TABLE_COLUMNS.careerServices,
      detailRows: filterDetailFocus(rows, detailFocus),
    });
  }

  if (category.id === "counselling-service-utilisation") {
    const rows = ranged(facts?.counsellingServices ?? []);
    const latestForBreakdown = latest(facts?.counsellingServices ?? []);
    const breakdown = groupValue(latestForBreakdown.length ? latestForBreakdown : rows, "CounsellingServiceType", "StudentsAvailed");
    const time = buildTimeSeriesRows(rows, yearRange, "CounsellingServiceType", "StudentsAvailed");
    return finalize(category, { visualKind: "bar", breakdown, timeSeriesRows: time.timeSeriesRows, timeSeriesKeys: time.timeSeriesKeys, tableColumns: TABLE_COLUMNS.counsellingServices, tableRows: rows, detailColumns: TABLE_COLUMNS.counsellingServices, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "entrepreneurship-skills-startups") {
    const rows = ranged(facts?.entrepreneurshipSupport ?? []);
    const latestForBreakdown = latest(facts?.entrepreneurshipSupport ?? []);
    const breakdown = groupValue(latestForBreakdown.length ? latestForBreakdown : rows, "StartupSector", "StudentStartups");
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => sum(yearRows, "StudentStartups"));
    return finalize(category, { visualKind: "trend", breakdown, trend, tableColumns: TABLE_COLUMNS.entrepreneurshipSupport, tableRows: rows, detailColumns: TABLE_COLUMNS.entrepreneurshipSupport, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "medical-team-qualifications") {
    const rows = ranged(facts?.medicalStaffDetails ?? []);
    const latestForBreakdown = latest(facts?.medicalStaffDetails ?? []);
    const breakdown = groupValue(latestForBreakdown.length ? latestForBreakdown : rows, "EmployeeRole", "StaffCount");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.medicalStaffDetails, tableRows: rows, detailColumns: TABLE_COLUMNS.medicalStaffDetails, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "medical-personnel-composition") {
    const rows = latest(facts?.medicalStaffSummaryWide ?? []);
    const tableRows = ranged(facts?.medicalStaffSummaryWide ?? []);
    const defs = [["Doctors", "TotalNumberOfDoctors"], ["Nurses", "TotalNumberOfNurses"], ["Paramedics / First Aid", "TotalNumberOfParamedicsFirstAidStaff"], ["Mental Health Professionals", "TotalNumberOfMentalHealthProfessionals"], ["Emergency Response Personnel", "TotalNumberOfEmergencyResponsePersonnel"]];
    const breakdown = wideBreakdown(rows, defs);
    return finalize(category, { visualKind: "donut", breakdown, tableColumns: TABLE_COLUMNS.medicalStaffSummary, tableRows, detailColumns: TABLE_COLUMNS.medicalStaffSummary, detailRows: filterDetailFocus(tableRows, detailFocus) });
  }

  if (category.id === "medical-personnel-working-hours") {
    const rows = latest(facts?.medicalStaffSummaryWide ?? []);
    const tableRows = ranged(facts?.medicalStaffSummaryWide ?? []);
    const defs = [["Nurses", "AverageDutyHoursOfNurses"], ["Paramedics / First Aid", "AverageDutyHoursOfParamedicsFirstAidStaff"], ["Mental Health Professionals", "AverageDutyHoursOfMentalHealthProfessionals"], ["Emergency Response Personnel", "AverageDutyHoursOfEmergencyResponsePersonnel"]];
    const breakdown = wideBreakdown(rows, defs, "avg");
    return finalize(category, { visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.medicalStaffSummary, tableRows, detailColumns: TABLE_COLUMNS.medicalStaffSummary, detailRows: filterDetailFocus(tableRows, detailFocus) });
  }

  if (category.id === "scholarships-fellowships-beneficiaries") {
    const rows = ranged(facts?.scholarshipsFellowships ?? []);
    const latestForBreakdown = latest(facts?.scholarshipsFellowships ?? []);
    const totalBeneficiaries = sum(rows, "NumberBeneficiaries");
    const totalAmount = Number(sum(rows, "EstimatedAmountInrCrore").toFixed(2));
    const breakdown = groupValue(latestForBreakdown.length ? latestForBreakdown : rows, "ScholarshipFellowshipType", "NumberBeneficiaries");
    return finalize(category, {
      visualKind: "cards",
      cards: [
        { label: "Beneficiaries", value: totalBeneficiaries, note: `${yearRange.from}–${yearRange.to}` },
        { label: "Estimated amount", value: totalAmount, note: "INR crore" },
      ],
      breakdown,
      tableColumns: TABLE_COLUMNS.scholarshipsFellowships,
      tableRows: rows,
      detailColumns: TABLE_COLUMNS.scholarshipsFellowships,
      detailRows: filterDetailFocus(rows, detailFocus),
    });
  }

  if (category.id === "top-recruiters-region-wise") {
    const rows = ranged(facts?.topRecruiters ?? []);
    const selectedCountry = drillPath[0];
    const topRecruiterLevels = selectedCountry && String(selectedCountry).toLowerCase() !== "india"
      ? [
          { label: "Country → State (if India) → Company", field: "Country" },
          { label: "Company", field: "Company" },
        ]
      : category.levels;
    const scoped = applyDrill(rows, topRecruiterLevels, drillPath);
    const breakdown = valueByLevels(rows, topRecruiterLevels, drillPath, "StudentsRecruited").slice(0, 12);
    return finalize(category, { levels: topRecruiterLevels, visualKind: "bar", breakdown, tableColumns: TABLE_COLUMNS.topRecruiters, tableRows: scoped, detailColumns: TABLE_COLUMNS.topRecruiters, detailRows: filterDetailFocus(scoped, detailFocus) });
  }

  if (category.id === "alumni-network-active-members") {
    const rows = ranged(facts?.alumniNetwork ?? []);
    const latestForBreakdown = latest(facts?.alumniNetwork ?? []);
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => sum(yearRows, "ActiveMembers"));
    const breakdown = groupValue(latestForBreakdown.length ? latestForBreakdown : rows, "AlumniChapter", "ActiveMembers").slice(0, 12);
    const time = buildTimeSeriesRows(rows, yearRange, "AlumniChapter", "ActiveMembers");
    return finalize(category, { visualKind: "trend", breakdown, trend, timeSeriesRows: time.timeSeriesRows, timeSeriesKeys: time.timeSeriesKeys, tableColumns: TABLE_COLUMNS.alumniNetwork, tableRows: rows, detailColumns: TABLE_COLUMNS.alumniNetwork, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "alumni-network-engagement-rate") {
    const rows = ranged(facts?.alumniNetwork ?? []);
    const latestForBreakdown = latest(facts?.alumniNetwork ?? []);
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => average(yearRows, "EngagementRate"));
    const breakdown = groupAverage(latestForBreakdown.length ? latestForBreakdown : rows, "AlumniChapter", "EngagementRate").slice(0, 12);
    const time = buildTimeSeriesRows(rows, yearRange, "AlumniChapter", "EngagementRate", "avg");
    return finalize(category, { visualKind: "trend", breakdown, trend, timeSeriesRows: time.timeSeriesRows, timeSeriesKeys: time.timeSeriesKeys, tableColumns: TABLE_COLUMNS.alumniNetwork, tableRows: rows, detailColumns: TABLE_COLUMNS.alumniNetwork, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  if (category.id === "alumni-network-endowment-contribution") {
    const rows = ranged(facts?.alumniNetwork ?? []);
    const latestForBreakdown = latest(facts?.alumniNetwork ?? []);
    const trend = buildTrendFromRows(rows, yearRange, (yearRows) => sum(yearRows, "EndowmentContributionInrCrore"));
    const breakdown = groupValue(latestForBreakdown.length ? latestForBreakdown : rows, "AlumniChapter", "EndowmentContributionInrCrore").slice(0, 12);
    const time = buildTimeSeriesRows(rows, yearRange, "AlumniChapter", "EndowmentContributionInrCrore");
    return finalize(category, { visualKind: "trend", breakdown, trend, timeSeriesRows: time.timeSeriesRows, timeSeriesKeys: time.timeSeriesKeys, tableColumns: TABLE_COLUMNS.alumniNetwork, tableRows: rows, detailColumns: TABLE_COLUMNS.alumniNetwork, detailRows: filterDetailFocus(rows, detailFocus) });
  }

  return buildEmptyState(category);
}

export { PSL_MODULE_ID };


