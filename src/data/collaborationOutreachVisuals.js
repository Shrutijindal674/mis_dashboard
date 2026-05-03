const CO_MODULE_ID = "Collaborations & Outreach";

const CATEGORY_CONFIG = {
  "collaborations-mous": {
    "co-mous-summary": [
      {
        id: "industry-sponsored-research-overview",
        label: "Industry-Sponsored Research Overview",
        sheet: "CO_MoUs_Summary",
        factKey: "coMoUsSummary",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Category",
        yLabel: "Count / Amount",
        isWide: true,
        measures: [
          { field: "industrial_research_projects", label: "Industrial Research Projects", type: "Int" },
          { field: "industrial_research_grants", label: "Industrial Research Grants", type: "Int" },
          { field: "total_industrial_research_grant_amount_cr", label: "Industrial Research Grant Amount (Cr)", type: "Currency" },
          { field: "total_coes_with_industry", label: "CoEs with Industry", type: "Int" },
          { field: "total_industry_consultancy_income_cr", label: "Industry Consultancy Income (Cr)", type: "Currency" },
          { field: "total_joint_phd_programs", label: "Joint PhD Programs", type: "Int" },
          { field: "total_joint_dual_degree_programs", label: "Joint Dual Degree Programs", type: "Int" },
          { field: "domestic_collaborations_total", label: "Domestic Collaborations", type: "Int" },
          { field: "international_collaborations_total", label: "International Collaborations", type: "Int" },
        ],
        primaryMeasure: "industrial_research_projects",
        aggregation: "sum",
        emptyMessage: "No Collaboration & MoU summary records are available for the selected institute/year.",
      },
      {
        id: "collaboration-partnerships-overview",
        label: "Collaboration Partnerships Overview",
        sheet: "CO_MoUs_Summary",
        factKey: "coMoUsSummary",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Collaboration Type",
        yLabel: "Number of Collaborations",
        isWide: true,
        measures: [
          { field: "domestic_collaborations_total", label: "Domestic Collaborations", type: "Int" },
          { field: "international_collaborations_total", label: "International Collaborations", type: "Int" },
        ],
        primaryMeasure: "domestic_collaborations_total",
        aggregation: "sum",
      },
      {
        id: "joint-academic-programs",
        label: "Joint Academic Programs",
        sheet: "CO_MoUs_Summary",
        factKey: "coMoUsSummary",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Program Category",
        yLabel: "Total Programs",
        isWide: true,
        measures: [
          { field: "total_joint_phd_programs", label: "Joint PhD Programs", type: "Int" },
          { field: "total_joint_dual_degree_programs", label: "Joint Dual Degree Programs", type: "Int" },
        ],
        primaryMeasure: "total_joint_phd_programs",
        aggregation: "sum",
      },
      {
        id: "industry-collaboration-and-research-initiatives",
        label: "Industry Collaboration and Research Initiatives",
        sheet: "CO_MoUs_Summary",
        factKey: "coMoUsSummary",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Industry Engagement Metrics",
        yLabel: "Count",
        isWide: true,
        measures: [
          { field: "total_coes_with_industry", label: "CoEs with Industry", type: "Int" },
          { field: "industrial_research_projects", label: "Industrial Research Projects", type: "Int" },
          { field: "industrial_research_grants", label: "Industrial Research Grants", type: "Int" },
        ],
        primaryMeasure: "total_coes_with_industry",
        aggregation: "sum",
      },
      {
        id: "industry-revenue-breakdown",
        label: "Industry Revenue Breakdown",
        sheet: "CO_MoUs_Summary",
        factKey: "coMoUsSummary",
        defaultView: "donut",
        allowedViews: ["donut", "bar", "table"],
        xLabel: "Industrial Research Grant Amount",
        yLabel: "Industry Consultancy Income",
        isWide: true,
        measures: [
          { field: "total_industrial_research_grant_amount_cr", label: "Industrial Research Grant Amount (Cr)", type: "Currency" },
          { field: "total_industry_consultancy_income_cr", label: "Industry Consultancy Income (Cr)", type: "Currency" },
        ],
        primaryMeasure: "total_industrial_research_grant_amount_cr",
        aggregation: "sum",
      },
    ],
    "co-collaboration-details": [
      {
        id: "geographical-distribution-of-collaborations",
        label: "Geographical Distribution of Collaborations",
        sheet: "CO_Collaboration_Details",
        factKey: "coCollaborationDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Geographical Hierarchy (Region)",
        yLabel: "Number of Collaborations",
        levels: [
          { label: "Region", field: "region" },
          { label: "Country", field: "country" },
          { label: "State", field: "state" },
          { label: "Partner Institution", field: "partner_institution" },
          { label: "Funding Source", field: "funding_source" },
        ],
        measures: [{ field: "__count", label: "Number of Collaborations", type: "calculated" }],
        primaryMeasure: "__count",
        aggregation: "count",
      },
      {
        id: "geographic-view-of-institutional-financial-contributions",
        label: "Institutional Financial Contributions",
        sheet: "CO_Collaboration_Details",
        factKey: "coCollaborationDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Geographical Hierarchy (Region)",
        yLabel: "Financial Contribution (₹ Cr)",
        levels: [
          { label: "Region", field: "region" },
          { label: "Country", field: "country" },
          { label: "State", field: "state" },
          { label: "Partner Institution", field: "partner_institution" },
          { label: "Funding Source", field: "funding_source" },
        ],
        measures: [{ field: "institute_financial_contribution_cr", label: "Financial Contribution (₹ Cr)", type: "Currency" }],
        primaryMeasure: "institute_financial_contribution_cr",
        aggregation: "sum",
      },
      {
        id: "faculty-participation-across-global-collaborations",
        label: "Faculty Participation",
        sheet: "CO_Collaboration_Details",
        factKey: "coCollaborationDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Geographical Hierarchy (Region)",
        yLabel: "Faculty Count",
        levels: [
          { label: "Region", field: "region" },
          { label: "Country", field: "country" },
          { label: "State", field: "state" },
          { label: "Partner Institution", field: "partner_institution" },
          { label: "Funding Source", field: "funding_source" },
        ],
        measures: [{ field: "number_of_faculty_involved", label: "Faculty Count", type: "Int" }],
        primaryMeasure: "number_of_faculty_involved",
        aggregation: "sum",
      },
      {
        id: "collaboration-duration-across-world",
        label: "Collaboration Duration",
        sheet: "CO_Collaboration_Details",
        factKey: "coCollaborationDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Geographical Hierarchy (Region)",
        yLabel: "Collaboration Duration (Years)",
        levels: [
          { label: "Region", field: "region" },
          { label: "Country", field: "country" },
          { label: "State", field: "state" },
          { label: "Partner Institution", field: "partner_institution" },
          { label: "Funding Source", field: "funding_source" },
        ],
        measures: [{ field: "time_periodcollaboration_duration_years", label: "Collaboration Duration (Years)", type: "Float" }],
        primaryMeasure: "time_periodcollaboration_duration_years",
        aggregation: "avg",
      },
    ],
  },
  "events-outreach": {
    "co-events-summary": [
      {
        id: "engagement-investment-activities",
        label: "Engagement & Investment Activities",
        sheet: "CO_Events_Summary",
        factKey: "coEventsSummary",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Engagement Type",
        yLabel: "Number of Activities",
        isWide: true,
        measures: [
          { field: "entrepreneurship_summits_count", label: "Entrepreneurship Summits", type: "Int" },
          { field: "startup_demo_days_count", label: "Startup Demo Days", type: "Int" },
          { field: "investor_meetups_count", label: "Investor Meetups", type: "Int" },
          { field: "csr_driven_innovation_programs_count", label: "CSR-driven Innovation Programs", type: "Int" },
        ],
        primaryMeasure: "entrepreneurship_summits_count",
        aggregation: "sum",
      },
      {
        id: "innovation-global-programs",
        label: "Innovation & Global Programs",
        sheet: "CO_Events_Summary",
        factKey: "coEventsSummary",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Program Type",
        yLabel: "Number of Programs",
        isWide: true,
        measures: [
          { field: "csr_driven_innovation_programs_count", label: "CSR-driven Innovation Programs", type: "Int" },
          { field: "international_startup_exchange_programs_count", label: "International Startup Exchange Programs", type: "Int" },
        ],
        primaryMeasure: "international_startup_exchange_programs_count",
        aggregation: "sum",
      },
    ],
    "co-partnerships-outreach": [
      {
        id: "domestic-vs-international-collaborations",
        label: "Domestic vs International Collaborations",
        sheet: "CO_Partnerships_Outreach",
        factKey: "coPartnershipsOutreach",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Collaboration Type",
        yLabel: "Number of Collaborations",
        isWide: true,
        measures: [
          { field: "total_domestic_collaborations", label: "Domestic Collaborations", type: "Int" },
          { field: "total_international_collaborations", label: "International Collaborations", type: "Int" },
        ],
        primaryMeasure: "total_domestic_collaborations",
        aggregation: "sum",
      },
      {
        id: "campus-fest-distribution",
        label: "Campus Fest Distribution",
        sheet: "CO_Partnerships_Outreach",
        factKey: "coPartnershipsOutreach",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Festival Type",
        yLabel: "Number of Festivals",
        isWide: true,
        measures: [
          { field: "total_cultural_fests", label: "Cultural Fests", type: "Int" },
          { field: "total_technical_fests", label: "Technical Fests", type: "Int" },
        ],
        primaryMeasure: "total_cultural_fests",
        aggregation: "sum",
      },
      {
        id: "fest-participation-analysis",
        label: "Fest Participation Analysis",
        sheet: "CO_Partnerships_Outreach",
        factKey: "coPartnershipsOutreach",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Fest Type",
        yLabel: "Number of Participants",
        isWide: true,
        measures: [
          { field: "total_cultural_fests_participants", label: "Cultural Fest Participants", type: "Int" },
          { field: "total_technical_fests_participants", label: "Technical Fest Participants", type: "Int" },
        ],
        primaryMeasure: "total_cultural_fests_participants",
        aggregation: "sum",
      },
      {
        id: "academic-events-and-outreach-activities",
        label: "Academic Events and Outreach Activities",
        sheet: "CO_Partnerships_Outreach",
        factKey: "coPartnershipsOutreach",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Event / Activity Type",
        yLabel: "Number of Events",
        isWide: true,
        measures: [
          { field: "total_academic_events", label: "Academic Events", type: "Int" },
          { field: "total_international_conferences", label: "International Conferences", type: "Int" },
          { field: "total_community_outreach_programs", label: "Community Outreach Programs", type: "Int" },
        ],
        primaryMeasure: "total_academic_events",
        aggregation: "sum",
      },
    ],
  },
  "global-academic-collaborations": {
    "co-intl-conferences": [
      {
        id: "top-5-research-conferences",
        label: "Top 5 Research Conferences",
        sheet: "CO_Intl_Conferences",
        factKey: "coIntlConferences",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Conference Name",
        yLabel: "Papers Presented (Count)",
        xField: "conference_name",
        measures: [{ field: "number_of_papers_presented", label: "Papers Presented", type: "Int" }],
        primaryMeasure: "number_of_papers_presented",
        aggregation: "sum",
        topN: 5,
      },
    ],
  },
  internationalisation: {
    "co-joint-programs": [
      {
        id: "regional-breakdown-of-programs",
        label: "Regional Breakdown of Programs",
        sheet: "CO_Joint_Programs",
        factKey: "coJointPrograms",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Geographic Region",
        yLabel: "Total Programs",
        levels: [
          { label: "Region", field: "region" },
          { label: "Country", field: "country" },
          { label: "State", field: "state" },
        ],
        measures: [{ field: "__count", label: "Total Programs", type: "calculated" }],
        primaryMeasure: "__count",
        aggregation: "count",
      },
      {
        id: "geographic-distribution-of-students",
        label: "Geographic Distribution of Students",
        sheet: "CO_Joint_Programs",
        factKey: "coJointPrograms",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Geographic Region",
        yLabel: "Number of Students",
        levels: [
          { label: "Region", field: "region" },
          { label: "Country", field: "country" },
          { label: "State", field: "state" },
        ],
        measures: [{ field: "number_of_students", label: "Number of Students", type: "Int" }],
        primaryMeasure: "number_of_students",
        aggregation: "sum",
      },
    ],
  },
  "special-programs": {
    "co-pmrf-program": [
      {
        id: "gender-distribution-of-scholars",
        label: "Gender Distribution",
        sheet: "CO_PMRF_Program",
        factKey: "coPmrfProgram",
        defaultView: "donut",
        allowedViews: ["donut", "bar", "table"],
        xLabel: "Gender",
        yLabel: "Number of Scholars (Count)",
        isWide: true,
        measures: [
          { field: "total_male_scholars", label: "Male Scholars", type: "Int" },
          { field: "total_female_scholars", label: "Female Scholars", type: "Int" },
        ],
        primaryMeasure: "total_male_scholars",
        aggregation: "sum",
      },
      {
        id: "category-wise-scholar-distribution",
        label: "Category-wise Distribution",
        sheet: "CO_PMRF_Program",
        factKey: "coPmrfProgram",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Category",
        yLabel: "Number of Scholars (Count)",
        isWide: true,
        measures: [
          { field: "total_sc_scholars", label: "SC Scholars", type: "Int" },
          { field: "total_st_scholars", label: "ST Scholars", type: "Int" },
          { field: "total_obc_scholars", label: "OBC Scholars", type: "Int" },
          { field: "total_ews_scholars", label: "EWS Scholars", type: "Int" },
          { field: "total_pwd_scholars", label: "PwD Scholars", type: "Int" },
        ],
        primaryMeasure: "total_sc_scholars",
        aggregation: "sum",
      },
      {
        id: "scholar-progress-overview",
        label: "Scholar Progress",
        sheet: "CO_PMRF_Program",
        factKey: "coPmrfProgram",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Scholar Progress",
        yLabel: "Number of Scholars (Count)",
        isWide: true,
        measures: [
          { field: "total_scholars", label: "Total Scholars", type: "Int" },
          { field: "total_scholars_thesis_submitted", label: "Thesis Submitted", type: "Int" },
        ],
        primaryMeasure: "total_scholars",
        aggregation: "sum",
      },
      {
        id: "patent-portfolio-overview",
        label: "Patent Portfolio",
        sheet: "CO_PMRF_Program",
        factKey: "coPmrfProgram",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Patent Category",
        yLabel: "Number of Patents (Count)",
        isWide: true,
        measures: [
          { field: "total_patents_filed", label: "Patents Filed", type: "Int" },
          { field: "total_patents_granted", label: "Patents Granted", type: "Int" },
        ],
        primaryMeasure: "total_patents_filed",
        aggregation: "sum",
      },
      {
        id: "academic-publications-overview",
        label: "Publications",
        sheet: "CO_PMRF_Program",
        factKey: "coPmrfProgram",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Publication Type",
        yLabel: "Number of Publications (Count)",
        isWide: true,
        measures: [
          { field: "total_journal_publications", label: "Journal Publications", type: "Int" },
          { field: "total_conference_publications", label: "Conference Publications", type: "Int" },
        ],
        primaryMeasure: "total_journal_publications",
        aggregation: "sum",
      },
      {
        id: "total-startups-initiated",
        label: "Startups",
        sheet: "CO_PMRF_Program",
        factKey: "coPmrfProgram",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Startups Initiated",
        yLabel: "Startup Count",
        isWide: true,
        measures: [{ field: "total_startups_initiated", label: "Startups Initiated", type: "Int" }],
        primaryMeasure: "total_startups_initiated",
        aggregation: "sum",
      },
    ],
    "co-pmrf-scholar-details": [
      {
        id: "patents-filed",
        label: "Patents Filed",
        sheet: "CO_PMRF_Scholar_Details",
        factKey: "coPmrfScholarDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Academic Hierarchy",
        yLabel: "Number of Patents Filed",
        levels: [
          { label: "University", field: "Institute" },
          { label: "Discipline/Department", field: "department" },
          { label: "Current Status", field: "current_status" },
        ],
        measures: [{ field: "patents_filed", label: "Patents Filed", type: "Int" }],
        primaryMeasure: "patents_filed",
        aggregation: "sum",
      },
      {
        id: "patent-distribution",
        label: "Patent Distribution",
        sheet: "CO_PMRF_Scholar_Details",
        factKey: "coPmrfScholarDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Academic Hierarchy",
        yLabel: "Number of Patents Granted",
        levels: [
          { label: "University", field: "Institute" },
          { label: "Discipline/Department", field: "department" },
          { label: "Current Status", field: "current_status" },
        ],
        measures: [{ field: "patents_granted", label: "Patents Granted", type: "Int" }],
        primaryMeasure: "patents_granted",
        aggregation: "sum",
      },
      {
        id: "pmrf-journal-publications",
        label: "PMRF Journal Publications",
        sheet: "CO_PMRF_Scholar_Details",
        factKey: "coPmrfScholarDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Academic Hierarchy",
        yLabel: "Number of Journal Publications",
        levels: [
          { label: "University", field: "Institute" },
          { label: "Discipline/Department", field: "department" },
          { label: "Current Status", field: "current_status" },
        ],
        measures: [{ field: "publications_journals", label: "Journal Publications", type: "Int" }],
        primaryMeasure: "publications_journals",
        aggregation: "sum",
      },
      {
        id: "pmrf-conference-publication",
        label: "Conference Publications",
        sheet: "CO_PMRF_Scholar_Details",
        factKey: "coPmrfScholarDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Academic Hierarchy",
        yLabel: "Number of Conference Publications",
        levels: [
          { label: "University", field: "Institute" },
          { label: "Discipline/Department", field: "department" },
          { label: "Current Status", field: "current_status" },
        ],
        measures: [{ field: "publications_conferences", label: "Conference Publications", type: "Int" }],
        primaryMeasure: "publications_conferences",
        aggregation: "sum",
      },
      {
        id: "pmrf-citation-performance",
        label: "Citation Performance",
        sheet: "CO_PMRF_Scholar_Details",
        factKey: "coPmrfScholarDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Academic Hierarchy",
        yLabel: "Number of Citations",
        levels: [
          { label: "University", field: "Institute" },
          { label: "Discipline/Department", field: "department" },
          { label: "Current Status", field: "current_status" },
        ],
        measures: [{ field: "citations", label: "Citations", type: "Int" }],
        primaryMeasure: "citations",
        aggregation: "sum",
      },
      {
        id: "pmrf-h-index-analysis",
        label: "H-Index Analysis",
        sheet: "CO_PMRF_Scholar_Details",
        factKey: "coPmrfScholarDetails",
        defaultView: "bar",
        allowedViews: ["bar", "table"],
        xLabel: "Academic Hierarchy",
        yLabel: "H-Index",
        levels: [
          { label: "University", field: "Institute" },
          { label: "Discipline/Department", field: "department" },
          { label: "Current Status", field: "current_status" },
        ],
        measures: [{ field: "h_index", label: "H-Index", type: "Int" }],
        primaryMeasure: "h_index",
        aggregation: "avg",
      },
    ],
  },
};

function prettifyField(field) {
  return String(field ?? "")
    .replace(/^total_/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function valueFor(row, field) {
  if (field === "__count") return 1;
  const raw = row?.[field];
  const value = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(/[,₹$%]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function rowsForRange(rows = [], instituteId, yearRange) {
  const from = Number(yearRange?.from ?? yearRange?.to ?? 2025);
  const to = Number(yearRange?.to ?? yearRange?.from ?? 2025);
  return rows.filter((row) => {
    const rowYear = Number(row.Year ?? row.year);
    const rowInstitute = row.InstituteId ?? row.institute_id;
    return rowInstitute === instituteId && rowYear >= from && rowYear <= to;
  });
}

function latestRows(rows = [], instituteId, yearRange) {
  const scoped = rowsForRange(rows, instituteId, yearRange);
  const maxYear = Math.max(...scoped.map((row) => Number(row.Year ?? row.year)).filter(Number.isFinite));
  if (!Number.isFinite(maxYear)) return scoped;
  return scoped.filter((row) => Number(row.Year ?? row.year) === maxYear);
}

function aggregate(rows = [], field, mode = "sum") {
  if (field === "__count" || mode === "count") return rows.length;
  const values = rows.map((row) => valueFor(row, field)).filter(Number.isFinite);
  if (!values.length) return 0;
  if (mode === "avg") return values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + value, 0);
}

function groupAggregate(rows = [], groupField, measureField, aggregation = "sum", topN = null) {
  const grouped = new Map();
  rows.forEach((row) => {
    const name = String(row?.[groupField] ?? "Unknown").trim() || "Unknown";
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name).push(row);
  });
  const out = [...grouped.entries()]
    .map(([name, groupRows]) => ({ name, value: aggregate(groupRows, measureField, aggregation) }))
    .filter((item) => Number.isFinite(item.value))
    .sort((left, right) => Number(right.value ?? 0) - Number(left.value ?? 0));
  return topN ? out.slice(0, topN) : out;
}

function valueByLevels(rows = [], levels = [], drillPath = [], measureField = "__count", aggregation = "sum") {
  const depth = Math.min(drillPath.length, levels.length - 1);
  const filtered = rows.filter((row) => drillPath.every((step) => String(row?.[step.field] ?? "Unknown") === String(step.value)));
  const level = levels[depth] ?? levels[0];
  if (!level) return [];
  return groupAggregate(filtered, level.field, measureField, aggregation);
}

function wideBreakdown(rows = [], measures = [], aggregationByField = {}) {
  return measures
    .map((item) => ({
      name: item.label ?? prettifyField(item.field),
      value: aggregate(rows, item.field, aggregationByField[item.field] ?? inferAggregation(item.field, item.type)),
    }))
    .filter((item) => Number.isFinite(item.value) && item.value !== 0);
}

function inferAggregation(field, type) {
  const key = String(field ?? "").toLowerCase();
  const valueType = String(type ?? "").toLowerCase();
  if (field === "__count") return "count";
  if (valueType.includes("percent") || key.includes("percent") || key.includes("ratio") || key.includes("rate") || key.includes("duration") || key.includes("h_index")) return "avg";
  return "sum";
}

function buildTrendFromRows(rows = [], yearRange, measure, aggregation = "sum") {
  const out = [];
  const from = Number(yearRange?.from ?? yearRange?.to ?? 2025);
  const to = Number(yearRange?.to ?? yearRange?.from ?? 2025);
  for (let year = from; year <= to; year += 1) {
    const yearRows = rows.filter((row) => Number(row.Year ?? row.year) === year);
    if (!yearRows.length) continue;
    out.push({ name: String(year), value: aggregate(yearRows, measure, aggregation) });
  }
  return out;
}

function buildCards(rows = [], measures = [], yearRange, category = null) {
  const cards = measures.map((item) => {
    const mode = inferAggregation(item.field, item.type);
    const isPct = mode === "avg" && (String(item.field).includes("percent") || String(item.field).includes("rate") || String(item.field).includes("ratio"));
    return {
      label: item.label ?? prettifyField(item.field),
      value: aggregate(rows, item.field, mode),
      format: isPct ? "pct" : "number",
      note: `${yearRange?.from ?? ""}–${yearRange?.to ?? ""}`,
    };
  });
  if (!cards.length && category) {
    cards.push({ label: category.sheet ?? category.label, value: rows.length, format: "number", note: "records" });
  }
  return cards;
}

function filterDetailFocus(rows = [], detailFocus = null) {
  if (!detailFocus?.field) return rows;
  return rows.filter((row) => String(row?.[detailFocus.field] ?? "Unknown") === String(detailFocus.value));
}

function uniqueViews(views) {
  return views.filter((view, index) => view && views.indexOf(view) === index);
}

function deriveAllowedViews(category, state) {
  const requestedViews = Array.isArray(category.allowedViews) && category.allowedViews.length ? category.allowedViews : ["bar", "donut", "trend", "table"];
  const views = [];
  if (state.breakdown?.length) views.push("bar");
  if (state.breakdown?.length && requestedViews.includes("donut")) views.push("donut");
  if (state.trend?.length) views.push("trend");
  if (state.tableRows?.length || state.detailRows?.length) views.push("table");
  return uniqueViews(views).filter((view) => requestedViews.includes(view));
}

function buildEmptyState(category, state = {}) {
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
    barLayout: category.barLayout ?? null,
    xLabel: category.xLabel,
    yLabel: category.yLabel,
    format: category.format ?? "number",
    allowPercent: false,
    emptyTitle: "No Data Available",
    emptyMessage: category.emptyMessage ?? "No data is available for this Collaboration & Outreach visual.",
  };
}

function finalize(category, state) {
  const views = deriveAllowedViews(category, state);
  if (!views.length) return buildEmptyState(category, state);
  const defaultView = views.includes(category.defaultView) ? category.defaultView : views[0] ?? "table";
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
    timeSeriesRows: [],
    timeSeriesKeys: [],
    levels: state.levels ?? category.levels ?? [],
    tableColumns: state.tableColumns ?? [],
    tableRows: state.tableRows ?? [],
    detailRows: state.detailRows ?? state.tableRows ?? [],
    detailColumns: state.detailColumns ?? state.tableColumns ?? [],
    barLayout: category.barLayout ?? null,
    xLabel: category.xLabel,
    yLabel: category.yLabel,
    format: category.format ?? "number",
    allowPercent: Boolean(category.allowPercent),
    drillable: Boolean((state.levels ?? category.levels ?? []).length),
    emptyTitle: category.label,
    emptyMessage: category.emptyMessage ?? "Visual for this metric is not available here.",
  };
}

function buildTableColumns(rows = []) {
  const sample = rows[0] ?? {};
  const hidden = new Set(["InstituteId", "YearLabel", "Region", "Country", "state_if_india"]);
  return Object.keys(sample)
    .filter((key) => !hidden.has(key))
    .slice(0, 12)
    .map((key) => ({ key, label: prettifyField(key) }));
}

function buildFallbackCategory(subsectionId, viewId) {
  const sheetLabels = {
    "co-mous-summary": "CO_MoUs_Summary",
    "co-collaboration-details": "CO_Collaboration_Details",
    "co-events-summary": "CO_Events_Summary",
    "co-partnerships-outreach": "CO_Partnerships_Outreach",
    "co-intl-conferences": "CO_Intl_Conferences",
    "co-joint-programs": "CO_Joint_Programs",
    "co-pmrf-program": "CO_PMRF_Program",
    "co-pmrf-scholar-details": "CO_PMRF_Scholar_Details",
  };
  const factKeys = {
    "co-mous-summary": "coMoUsSummary",
    "co-collaboration-details": "coCollaborationDetails",
    "co-events-summary": "coEventsSummary",
    "co-partnerships-outreach": "coPartnershipsOutreach",
    "co-intl-conferences": "coIntlConferences",
    "co-joint-programs": "coJointPrograms",
    "co-pmrf-program": "coPmrfProgram",
    "co-pmrf-scholar-details": "coPmrfScholarDetails",
  };
  if (!factKeys[viewId]) return null;
  return {
    id: `${viewId}-sheet-overview`,
    label: sheetLabels[viewId],
    sheet: sheetLabels[viewId],
    factKey: factKeys[viewId],
    defaultView: "bar",
    allowedViews: ["table"],
    xLabel: sheetLabels[viewId],
    yLabel: "Records",
    measures: [{ field: "__count", label: "Records", type: "calculated" }],
    primaryMeasure: "__count",
    aggregation: "count",
  };
}

export function getCollaborationOutreachCategories(subsectionId, viewId) {
  const categories = CATEGORY_CONFIG[subsectionId]?.[viewId] ?? [];
  if (categories.length) return categories;
  const fallback = buildFallbackCategory(subsectionId, viewId);
  return fallback ? [fallback] : [];
}

export function getDefaultCollaborationOutreachCategoryId(subsectionId, viewId) {
  return getCollaborationOutreachCategories(subsectionId, viewId)?.[0]?.id ?? null;
}

export function isCollaborationOutreachSubsection(subsectionId) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_CONFIG, subsectionId);
}

export function buildCollaborationOutreachVisual({
  facts,
  subsectionId,
  viewId,
  categoryId,
  instituteId,
  yearRange,
  drillPath = [],
  detailFocus = null,
}) {
  const categories = getCollaborationOutreachCategories(subsectionId, viewId);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  if (!category) return null;

  const sourceRows = facts?.[category.factKey] ?? [];
  const rows = rowsForRange(sourceRows, instituteId, yearRange);
  const latest = latestRows(sourceRows, instituteId, yearRange);
  const scoped = category.levels?.length ? rows.filter((row) => drillPath.every((step) => String(row?.[step.field] ?? "Unknown") === String(step.value))) : rows;
  const tableRows = rows;
  const tableColumns = buildTableColumns(rows.length ? rows : sourceRows);
  const detailRows = filterDetailFocus(scoped.length ? scoped : tableRows, detailFocus);
  const aggregationByField = Object.fromEntries((category.measures ?? []).map((item) => [item.field, inferAggregation(item.field, item.type)]));
  const primaryMeasure = category.primaryMeasure ?? category.measures?.[0]?.field ?? "__count";
  const primaryAggregation = category.aggregation ?? aggregationByField[primaryMeasure] ?? "sum";

  let breakdown = [];
  let trend = [];
  let visualKind = category.defaultView ?? "bar";

  if (category.levels?.length) {
    breakdown = valueByLevels(rows, category.levels, drillPath, primaryMeasure, primaryAggregation);
  } else if (category.isWide) {
    breakdown = wideBreakdown(latest.length ? latest : rows, category.measures ?? [], aggregationByField);
  } else if (category.xField === "Year") {
    trend = buildTrendFromRows(rows, yearRange, primaryMeasure, primaryAggregation);
    breakdown = wideBreakdown(latest.length ? latest : rows, category.measures ?? [{ field: primaryMeasure, label: category.yLabel }], aggregationByField);
  } else if (category.xField) {
    breakdown = groupAggregate(latest.length ? latest : rows, category.xField, primaryMeasure, primaryAggregation, category.topN);
  } else {
    breakdown = wideBreakdown(latest.length ? latest : rows, category.measures ?? [], aggregationByField);
  }

  const cards = buildCards(rows, category.measures ?? [{ field: primaryMeasure, label: category.yLabel }], yearRange, category);
  if (category.defaultView === "cards") visualKind = "cards";
  else if (category.defaultView === "trend" && trend.length) visualKind = "trend";
  else if (category.defaultView === "donut") visualKind = "donut";
  else visualKind = "bar";

  return finalize(category, {
    visualKind,
    cards,
    breakdown,
    trend,
    levels: category.levels,
    tableColumns,
    tableRows,
    detailColumns: tableColumns,
    detailRows,
    barLayout: category.barLayout,
  });
}

export { CO_MODULE_ID };


