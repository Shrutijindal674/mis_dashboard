const IF_MODULE_ID = "Infrastructure & Finance";

const CATEGORY_CONFIG = {
  "infrastructure": {
    "academic-infrastructure": [
      {
        "id": "classrooms-over-time",
        "label": "Classrooms Over Time",
        "sheet": "Academic_Infrastructure",
        "factKey": "academicInfrastructure",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "trend",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Classrooms",
        "measures": [
          {
            "field": "number_of_classrooms",
            "label": "Number of Classrooms",
            "type": "Int"
          }
        ],
        "primaryMeasure": "number_of_classrooms",
        "aggregation": "avg",
        "xField": "Year",
        "emptyMessage": "No academic infrastructure records are available for the selected institute/year."
      }
    ],
    "hostel-infrastructure": [
      {
        "id": "hostel-capacity-and-occupancy",
        "label": "Hostel Capacity and Occupancy",
        "sheet": "Hostel_Infrastructure",
        "factKey": "hostelInfrastructure",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Hostel Capacity Type",
        "yLabel": "Number of Students (Capacity)",
        "measures": [
          {
            "field": "total_capacity",
            "label": "Total Capacity",
            "type": "Int"
          },
          {
            "field": "current_occupancy",
            "label": "Current Occupancy",
            "type": "Int"
          },
          {
            "field": "international_student_capacity",
            "label": "International Student Capacity",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_capacity",
        "aggregation": "avg",
        "isWide": true
      },
      {
        "id": "hostel-occupancy-rate",
        "label": "Hostel Occupancy Rate",
        "sheet": "Hostel_Infrastructure",
        "factKey": "hostelInfrastructure",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "trend",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Occupancy Rate (%)",
        "measures": [
          {
            "field": "occupancy_rate",
            "label": "Occupancy Rate",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "occupancy_rate",
        "aggregation": "avg",
        "xField": "Year",
        "format": "pct"
      }
    ],
    "infrastructure-summary": [
      {
        "id": "ongoing-infrastructure-projects-count",
        "label": "Ongoing Infrastructure Projects Count",
        "sheet": "Infrastructure_Summary",
        "factKey": "infrastructureSummary",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "trend",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Ongoing Projects",
        "measures": [
          {
            "field": "total_ongoing_projects",
            "label": "Ongoing Projects",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_ongoing_projects",
        "aggregation": "sum",
        "xField": "Year"
      },
      {
        "id": "sanctioned-budget",
        "label": "Sanctioned Budget",
        "sheet": "Infrastructure_Summary",
        "factKey": "infrastructureSummary",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "trend",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Sanctioned Budget (Rs. Crore)",
        "measures": [
          {
            "field": "total_sanctioned_budget",
            "label": "Sanctioned Budget",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_sanctioned_budget",
        "aggregation": "sum",
        "xField": "Year"
      },
      {
        "id": "infrastructure-utilisation-rate",
        "label": "Infrastructure Utilisation Rate",
        "sheet": "Infrastructure_Summary",
        "factKey": "infrastructureSummary",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "trend",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Utilisation Rate (%)",
        "measures": [
          {
            "field": "total_utilisation_rate",
            "label": "Infrastructure Utilisation Rate",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "total_utilisation_rate",
        "aggregation": "avg",
        "xField": "Year",
        "format": "pct"
      }
    ],
    "ongoing-infrastructure-projects": [
      {
        "id": "top-5-infrastructure-projects-by-physical-progress",
        "label": "Top 5 Infrastructure Projects by Physical Progress",
        "sheet": "Ongoing_Infrastructure_Projects",
        "factKey": "ongoingInfrastructureProjects",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Project Name",
        "yLabel": "Physical Progress (%)",
        "measures": [
          {
            "field": "physical_progress__completed",
            "label": "Physical Progress",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "physical_progress__completed",
        "aggregation": "avg",
        "xField": "project_name",
        "topN": 5,
        "format": "pct"
      },
      {
        "id": "top-5-infrastructure-projects-by-financial-progress",
        "label": "Top 5 Infrastructure Projects by Financial Progress",
        "sheet": "Ongoing_Infrastructure_Projects",
        "factKey": "ongoingInfrastructureProjects",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Project Name",
        "yLabel": "Financial Progress (%)",
        "measures": [
          {
            "field": "financial_progress__spent",
            "label": "Financial Progress",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "financial_progress__spent",
        "aggregation": "avg",
        "xField": "project_name",
        "topN": 5,
        "format": "pct"
      }
    ]
  },
  "funding-financials": {
    "endowment-fund": [
      {
        "id": "top-5-endowment-funds-by-corpus",
        "label": "Top 5 Endowment Funds by Corpus",
        "sheet": "Endowment_Fund",
        "factKey": "endowmentFund",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Fund Name",
        "yLabel": "Total Corpus (Rs. Crore)",
        "measures": [
          {
            "field": "total_corpus",
            "label": "Total Corpus",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_corpus",
        "aggregation": "sum",
        "xField": "fund_name",
        "topN": 5
      },
      {
        "id": "top-5-endowment-funds-by-interest-coverage-ratio",
        "label": "Interest Coverage Ratio",
        "sheet": "Endowment_Fund",
        "factKey": "endowmentFund",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Fund Name",
        "yLabel": "Interest Coverage Ratio",
        "measures": [
          {
            "field": "interest_coverage_ratio",
            "label": "Interest Coverage Ratio",
            "type": "Float"
          }
        ],
        "primaryMeasure": "interest_coverage_ratio",
        "aggregation": "avg",
        "xField": "fund_name",
        "topN": 5
      },
      {
        "id": "top-5-endowment-funds-by-annual-yield",
        "label": "Annual Yield",
        "sheet": "Endowment_Fund",
        "factKey": "endowmentFund",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Fund Name",
        "yLabel": "Annual Yield (Rs. Crore)",
        "measures": [
          {
            "field": "annual_yield_interest_income",
            "label": "Annual Yield",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "annual_yield_interest_income",
        "aggregation": "sum",
        "xField": "fund_name",
        "topN": 5
      }
    ],
    "funding-financials": [
      {
        "id": "budget-allocation-by-source",
        "label": "Budget Allocation by Source",
        "sheet": "Funding_Financials",
        "factKey": "fundingFinancials",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Budget Source",
        "yLabel": "Budget Allocation (Rs. Crore)",
        "measures": [
          {
            "field": "budget_allocation_moe",
            "label": "MoE",
            "type": "Currency"
          },
          {
            "field": "budget_allocation_state_govt",
            "label": "State Govt",
            "type": "Currency"
          },
          {
            "field": "budget_allocation_hefa",
            "label": "HEFA",
            "type": "Currency"
          },
          {
            "field": "budget_allocation_internal_revenue",
            "label": "Internal Revenue",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_budget_allocation",
        "aggregation": "sum",
        "isWide": true
      },
      {
        "id": "budget-allocation-by-type",
        "label": "Budget Allocation by Type",
        "sheet": "Funding_Financials",
        "factKey": "fundingFinancials",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Budget Type",
        "yLabel": "Budget Allocation (Rs. Crore)",
        "measures": [
          {
            "field": "total_budget_allocation_capital",
            "label": "Capital",
            "type": "Currency"
          },
          {
            "field": "total_budget_allocation_revenue",
            "label": "Revenue",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_budget_allocation_capital",
        "aggregation": "sum",
        "isWide": true
      },
      {
        "id": "hefa-sanctioned-vs-pending",
        "label": "HEFA Sanctioned vs Pending",
        "sheet": "Funding_Financials",
        "factKey": "fundingFinancials",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "HEFA Status",
        "yLabel": "Amount Sanctioned / Pending (Rs. Crore)",
        "measures": [
          {
            "field": "total_sanctioned_amount_hefa",
            "label": "Sanctioned",
            "type": "Currency"
          },
          {
            "field": "total_pending_amount_hefa",
            "label": "Pending",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_sanctioned_amount_hefa",
        "aggregation": "sum",
        "isWide": true
      },
      {
        "id": "endowment-corpus-vs-annual-yield",
        "label": "Endowment Corpus vs Annual Yield",
        "sheet": "Funding_Financials",
        "factKey": "fundingFinancials",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Endowment Fund",
        "yLabel": "Endowment Corpus / Yield (Rs. Crore)",
        "measures": [
          {
            "field": "total_endowment_fund_corpus",
            "label": "Endowment Corpus",
            "type": "Currency"
          },
          {
            "field": "total_endowment_fund_annual_yield_interest_income",
            "label": "Annual Yield",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_endowment_fund_corpus",
        "aggregation": "sum",
        "isWide": true
      },
      {
        "id": "external-funds-by-source",
        "label": "External Funds by Source",
        "sheet": "Funding_Financials",
        "factKey": "fundingFinancials",
        "defaultView": "donut",
        "allowedViews": [
          "cards",
          "donut",
          "bar",
          "table"
        ],
        "xLabel": "Fund Source",
        "yLabel": "Funds Received (Rs. Crore)",
        "measures": [
          {
            "field": "total_fund_received_industrycsr",
            "label": "Industry/CSR",
            "type": "Currency"
          },
          {
            "field": "total_fund_received_national",
            "label": "National",
            "type": "Currency"
          },
          {
            "field": "total_fund_received_international",
            "label": "International",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_fund_received_industrycsr",
        "aggregation": "sum",
        "isWide": true
      },
      {
        "id": "external-funding-agency-and-donor-counts",
        "label": "External Funding Agency and Donor Counts",
        "sheet": "Funding_Financials",
        "factKey": "fundingFinancials",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Donors / Agencies",
        "measures": [
          {
            "field": "donor_count_industrycsr",
            "label": "Industry/CSR Donors",
            "type": "Int"
          },
          {
            "field": "granting_agency_count_national",
            "label": "National Agencies",
            "type": "Int"
          },
          {
            "field": "granting_agency_count_international",
            "label": "International Agencies",
            "type": "Float"
          }
        ],
        "primaryMeasure": "donor_count_industrycsr",
        "aggregation": "sum",
        "isWide": true
      },
      {
        "id": "budget-utilisation-rate",
        "label": "Budget Utilisation Rate",
        "sheet": "Funding_Financials",
        "factKey": "fundingFinancials",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "trend",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Utilisation Rate (%)",
        "measures": [
          {
            "field": "total_utilisation_rate",
            "label": "Budget Utilisation Rate",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "total_utilisation_rate",
        "aggregation": "avg",
        "xField": "Year",
        "format": "pct"
      },
      {
        "id": "budget-carry-forward-amount",
        "label": "Budget Carry Forward Amount",
        "sheet": "Funding_Financials",
        "factKey": "fundingFinancials",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "trend",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Carry Forward Amount (Rs. Crore)",
        "measures": [
          {
            "field": "budget_carry_forward_amount",
            "label": "Carry Forward Amount",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "budget_carry_forward_amount",
        "aggregation": "sum",
        "xField": "Year"
      }
    ],
    "hefa-loan-details": [
      {
        "id": "top-5-hefa-loans-by-interest-rate",
        "label": "Top 5 HEFA Loans by Interest Rate",
        "sheet": "HEFA_Loan_Details",
        "factKey": "hefaLoanDetails",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Grant Name",
        "yLabel": "Interest Rate (%)",
        "measures": [
          {
            "field": "interest_rate",
            "label": "Interest Rate",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "interest_rate",
        "aggregation": "avg",
        "xField": "grant_name",
        "topN": 5,
        "format": "pct"
      },
      {
        "id": "top-5-hefa-loans-by-funds-utilised",
        "label": "Funds Utilised",
        "sheet": "HEFA_Loan_Details",
        "factKey": "hefaLoanDetails",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Grant Name",
        "yLabel": "Funds Utilised (Rs. Crore)",
        "measures": [
          {
            "field": "funds_utilised_inr_crore",
            "label": "Funds Utilised",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "funds_utilised_inr_crore",
        "aggregation": "sum",
        "xField": "grant_name",
        "topN": 5
      },
      {
        "id": "top-5-hefa-loans-by-utilisation-rate",
        "label": "Utilisation Rate",
        "sheet": "HEFA_Loan_Details",
        "factKey": "hefaLoanDetails",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Top 5 HEFA Loans by Utilisation Rate",
        "yLabel": "Utilisation Rate (%)",
        "measures": [
          {
            "field": "utilisation_rate",
            "label": "Utilisation Rate",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "utilisation_rate",
        "aggregation": "avg",
        "xField": "grant_name",
        "topN": 5,
        "format": "pct"
      }
    ],
    "foreign-funding": [
      {
        "id": "foreign-funding-agencies-by-geography",
        "label": "Foreign Funding Agencies by Geography",
        "sheet": "Foreign_Funding",
        "factKey": "foreignFunding",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Region, Country, Reporting Audit Status, Granting Agency",
        "yLabel": "Number of Agencies",
        "measures": [
          {
            "field": "__count",
            "label": "Number of Agencies",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "levels": [
          {
            "label": "Region",
            "field": "region"
          },
          {
            "label": "Country",
            "field": "country"
          },
          {
            "label": "Reporting Audit Status",
            "field": "reporting_audit_status"
          },
          {
            "label": "Granting Agency",
            "field": "granting_agency"
          }
        ]
      }
    ],
    "industry-csr-funds": [
      {
        "id": "csr-grants-by-geography-and-purpose",
        "label": "CSR Grants by Geography and Purpose",
        "sheet": "Industry_CSR_Funds",
        "factKey": "industryCsrFunds",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Continent, Country, Purpose of Funding, Funding Agency",
        "yLabel": "Number of Grants",
        "measures": [
          {
            "field": "__count",
            "label": "Number of Grants",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "levels": [
          {
            "label": "Region",
            "field": "region"
          },
          {
            "label": "Country",
            "field": "country"
          },
          {
            "label": "Purpose of Funding",
            "field": "purpose_of_funding"
          },
          {
            "label": "Funding Agency",
            "field": "funding_agency"
          }
        ]
      }
    ],
    "internal-revenue": [
      {
        "id": "internal-revenue-generated",
        "label": "Internal Revenue Generated",
        "sheet": "Internal_Revenue",
        "factKey": "internalRevenue",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "trend",
          "bar",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Internal Revenue (Rs. Crore)",
        "measures": [
          {
            "field": "total_internal_revenue_generated_cr",
            "label": "Internal Revenue",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_internal_revenue_generated_cr",
        "aggregation": "sum",
        "xField": "Year"
      }
    ]
  },
  "miscellaneous": {
    "institutional-awards": [
      {
        "id": "awards-by-geography",
        "label": "Awards by Geography",
        "sheet": "Institutional_Awards",
        "factKey": "institutionalAwards",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Continent, Country, State",
        "yLabel": "Total Awards",
        "measures": [
          {
            "field": "__count",
            "label": "Total Awards",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "levels": [
          {
            "label": "Region",
            "field": "region"
          },
          {
            "label": "Country",
            "field": "country"
          },
          {
            "label": "State",
            "field": "state"
          }
        ]
      },
      {
        "id": "awards-by-department-and-faculty",
        "label": "Awards by Department and Faculty",
        "sheet": "Institutional_Awards",
        "factKey": "institutionalAwards",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "University, Department, Faculty",
        "yLabel": "Total Awards",
        "measures": [
          {
            "field": "__count",
            "label": "Total Awards",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "levels": [
          {
            "label": "University",
            "field": "Institute"
          },
          {
            "label": "Department",
            "field": "department"
          },
          {
            "label": "Faculty",
            "field": "faculty_employee_id"
          }
        ]
      }
    ]
  }
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
  const requestedViews = Array.isArray(category.allowedViews) && category.allowedViews.length ? category.allowedViews : ["cards", "bar", "table"];
  const views = [];
  if (state.cards?.length) views.push("cards");
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
    emptyMessage: category.emptyMessage ?? "No data is available for this Infrastructure & Finance visual.",
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

const FALLBACK_SHEETS = {
  "academic-infrastructure": ["Academic_Infrastructure", "academicInfrastructure"],
  "hostel-infrastructure": ["Hostel_Infrastructure", "hostelInfrastructure"],
  "infrastructure-summary": ["Infrastructure_Summary", "infrastructureSummary"],
  "ongoing-infrastructure-projects": ["Ongoing_Infrastructure_Projects", "ongoingInfrastructureProjects"],
  "endowment-fund": ["Endowment_Fund", "endowmentFund"],
  "funding-financials": ["Funding_Financials", "fundingFinancials"],
  "hefa-loan-details": ["HEFA_Loan_Details", "hefaLoanDetails"],
  "foreign-funding": ["Foreign_Funding", "foreignFunding"],
  "industry-csr-funds": ["Industry_CSR_Funds", "industryCsrFunds"],
  "internal-revenue": ["Internal_Revenue", "internalRevenue"],
  "institutional-awards": ["Institutional_Awards", "institutionalAwards"]
};

function buildFallbackCategory(subsectionId, viewId) {
  const entry = FALLBACK_SHEETS[viewId];
  if (!entry) return null;
  const [sheet, factKey] = entry;
  return {
    id: `${viewId}-sheet-overview`,
    label: sheet,
    sheet,
    factKey,
    defaultView: "cards",
    allowedViews: ["cards", "table"],
    xLabel: sheet,
    yLabel: "Records",
    measures: [{ field: "__count", label: "Records", type: "calculated" }],
    primaryMeasure: "__count",
    aggregation: "count",
  };
}

export function getInfrastructureFinanceCategories(subsectionId, viewId) {
  const categories = CATEGORY_CONFIG[subsectionId]?.[viewId] ?? [];
  if (categories.length) return categories;
  const fallback = buildFallbackCategory(subsectionId, viewId);
  return fallback ? [fallback] : [];
}

export function getDefaultInfrastructureFinanceCategoryId(subsectionId, viewId) {
  return getInfrastructureFinanceCategories(subsectionId, viewId)?.[0]?.id ?? null;
}

export function isInfrastructureFinanceSubsection(subsectionId) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_CONFIG, subsectionId);
}

export function buildInfrastructureFinanceVisual({
  facts,
  subsectionId,
  viewId,
  categoryId,
  instituteId,
  yearRange,
  drillPath = [],
  detailFocus = null,
}) {
  const categories = getInfrastructureFinanceCategories(subsectionId, viewId);
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
    breakdown = trend.length ? trend : wideBreakdown(latest.length ? latest : rows, category.measures ?? [{ field: primaryMeasure, label: category.yLabel }], aggregationByField);
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

export { IF_MODULE_ID };
