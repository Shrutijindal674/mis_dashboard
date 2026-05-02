const RI_MODULE_ID = "Research & Innovation";

const CATEGORY_CONFIG = {
  "industrial-research": {
    "coe-industry": [
      {
        "id": "top-5-centers-of-excellence-by-funding-and-projects",
        "label": "Top 5 Centers of Excellence by Funding & Projects",
        "sourceTable": "Centers of Excellence Industry",
        "sheet": "CoE_Industry",
        "factKey": "coeIndustry",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "CoE Name",
        "yLabel": "Funding Amount (INR Crore) / Number of Projects Executed",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "coe_name",
        "isWide": false,
        "measures": [
          {
            "field": "funding_amount",
            "label": "Funding Amount",
            "type": "Currency"
          },
          {
            "field": "projects_executed",
            "label": "Projects Executed",
            "type": "Int"
          }
        ],
        "primaryMeasure": "funding_amount",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Dual-axis bar mixing currency and count on same Y-axis — units are incompatible; split into two separate charts",
        "whatKpiShows": "Shows Funding Amount (INR Crore) / Number of Projects Executed by CoE Name using funding_amount(Currency), projects_executed(Int).",
        "emptyMessage": "No CoE Industry records are available for the selected institute/year."
      }
    ],
    "faculty-consultancy": [
      {
        "id": "faculty-consultancy-revenue-by-university-department-faculty",
        "label": "Faculty Consultancy Revenue by University → Department → Faculty",
        "sourceTable": "Faculty Consultancy",
        "sheet": "Faculty_Consultancy",
        "factKey": "facultyConsultancy",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Institute → Discipline/Department → Faculty",
        "yLabel": "Consultancy Revenue Generated (INR Crore)",
        "format": "pct",
        "allowPercent": false,
        "barLayout": null,
        "levels": [
          {
            "label": "Institute",
            "field": "institute"
          },
          {
            "label": "Discipline/Department",
            "field": "department"
          },
          {
            "label": "Faculty",
            "field": "faculty"
          }
        ],
        "xField": "institute",
        "isWide": false,
        "measures": [
          {
            "field": "revenue_generated",
            "label": "Revenue Generated",
            "type": "Currency"
          },
          {
            "field": "__count",
            "label": "Total Projects",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "revenue_generated",
        "aggregation": "avg",
        "reviewNote": null,
        "whatKpiShows": "Shows Consultancy Revenue Generated (INR Crore) by Institute → Discipline/Department → Faculty using revenue_generated(Currency), total projects (calculated).",
        "emptyMessage": "No Faculty Consultancy records are available for the selected institute/year."
      },
      {
        "id": "faculty-consultancy-revenue-by-region-country",
        "label": "Faculty Consultancy Revenue by Region → Country",
        "sourceTable": "Faculty Consultancy",
        "sheet": "Faculty_Consultancy",
        "factKey": "facultyConsultancy",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Region → Country",
        "yLabel": "Consultancy Revenue Generated (INR Crore)",
        "format": "pct",
        "allowPercent": false,
        "barLayout": null,
        "levels": [
          {
            "label": "Region",
            "field": "region"
          },
          {
            "label": "Country",
            "field": "country"
          }
        ],
        "xField": "region",
        "isWide": false,
        "measures": [
          {
            "field": "revenue_generated",
            "label": "Revenue Generated",
            "type": "Currency"
          },
          {
            "field": "__count",
            "label": "Total Projects",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "revenue_generated",
        "aggregation": "avg",
        "reviewNote": null,
        "whatKpiShows": "Shows Consultancy Revenue Generated (INR Crore) by Region → Country using revenue_generated(Currency), total projects (calculated).",
        "emptyMessage": "No Faculty Consultancy records are available for the selected institute/year."
      }
    ],
    "industrial-grants": [
      {
        "id": "industrial-research-grants-by-continent-country-funding-agency",
        "label": "Industrial Research Grants by Continent → Country → Funding Agency",
        "sourceTable": "Industrial Research Grants",
        "sheet": "Industrial_Grants",
        "factKey": "industrialGrants",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Continent → Country → Funding Agency",
        "yLabel": "Number of Grants / Total Sanctioned Amount (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Continent",
            "field": "continent"
          },
          {
            "label": "Country",
            "field": "country"
          },
          {
            "label": "Funding Agency",
            "field": "funding_agency"
          }
        ],
        "xField": "continent",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Grants",
            "type": "calculated"
          },
          {
            "field": "total_sanctioned_amount",
            "label": "Total Sanctioned Amount",
            "type": "Currency"
          },
          {
            "field": "utilisation_percent",
            "label": "Utilisation Percent",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Grants / Total Sanctioned Amount (INR Crore) by Continent → Country → Funding Agency using total grants (calculated), total_sanctioned_amount(Currency), utilisation_percent(Percent).",
        "emptyMessage": "No Industrial Grants records are available for the selected institute/year."
      },
      {
        "id": "industrial-research-grants-by-university-department-grant-title",
        "label": "Industrial Research Grants by University → Department → Grant Title",
        "sourceTable": "Industrial Research Grants",
        "sheet": "Industrial_Grants",
        "factKey": "industrialGrants",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Institute → Discipline/Department → Grant Title",
        "yLabel": "Number of Grants / Total Sanctioned Amount (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Institute",
            "field": "institute"
          },
          {
            "label": "Discipline/Department",
            "field": "department"
          },
          {
            "label": "Grant Title",
            "field": "grant_title"
          }
        ],
        "xField": "institute",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Grants",
            "type": "calculated"
          },
          {
            "field": "total_sanctioned_amount",
            "label": "Total Sanctioned Amount",
            "type": "Currency"
          },
          {
            "field": "utilisation_percent",
            "label": "Utilisation Percent",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Grants / Total Sanctioned Amount (INR Crore) by Institute → Discipline/Department → Grant Title using total grants (calculated), total_sanctioned_amount(Currency), utilisation_percent(Percent).",
        "emptyMessage": "No Industrial Grants records are available for the selected institute/year."
      }
    ],
    "industrial-projects": [
      {
        "id": "industrial-research-projects-by-university-status-department-faculty",
        "label": "Industrial Research Projects by University → Status → Department → Faculty",
        "sourceTable": "Industrial Research Projects",
        "sheet": "Industrial_Projects",
        "factKey": "industrialProjects",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Institute → Status → Discipline/Department → Faculty",
        "yLabel": "Number of Research Projects",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Institute",
            "field": "institute"
          },
          {
            "label": "Status",
            "field": "status"
          },
          {
            "label": "Discipline/Department",
            "field": "department"
          },
          {
            "label": "Faculty",
            "field": "faculty"
          }
        ],
        "xField": "institute",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Projects",
            "type": "calculated"
          },
          {
            "field": "trl_start",
            "label": "TRL Start",
            "type": "Int"
          },
          {
            "field": "trl_level_target",
            "label": "TRL Level Target",
            "type": "Int"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Research Projects by Institute → Status → Discipline/Department → Faculty using total projects (calculated), trl_start(Int), trl_level_target(Int).",
        "emptyMessage": "No Industrial Projects records are available for the selected institute/year."
      },
      {
        "id": "industrial-research-projects-by-continent-country",
        "label": "Industrial Research Projects by Continent → Country",
        "sourceTable": "Industrial Research Projects",
        "sheet": "Industrial_Projects",
        "factKey": "industrialProjects",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Continent → Country",
        "yLabel": "Number of Research Projects",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Continent",
            "field": "continent"
          },
          {
            "label": "Country",
            "field": "country"
          }
        ],
        "xField": "continent",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Projects",
            "type": "calculated"
          },
          {
            "field": "trl_start",
            "label": "TRL Start",
            "type": "Int"
          },
          {
            "field": "trl_level_target",
            "label": "TRL Level Target",
            "type": "Int"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Research Projects by Continent → Country using total projects (calculated), trl_start(Int), trl_level_target(Int).",
        "emptyMessage": "No Industrial Projects records are available for the selected institute/year."
      }
    ],
    "industry-research-summary": [
      {
        "id": "industry-sponsored-projects-vs-grants-received",
        "label": "Industry Sponsored Projects vs Grants Received",
        "sourceTable": "Industry Research Summary",
        "sheet": "Industry_Research_Summary",
        "factKey": "industryResearchSummary",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Projects / Grants",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "number_of_industry_sponsored_projects",
            "label": "Number Of Industry Sponsored Projects",
            "type": "Int"
          },
          {
            "field": "number_of_industry_grants_received",
            "label": "Number Of Industry Grants Received",
            "type": "Int"
          }
        ],
        "primaryMeasure": "number_of_industry_sponsored_projects",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Projects / Grants by Year using number_of_industry_sponsored_projects(Int), number_of_industry_grants_received(Int).",
        "emptyMessage": "No Industry Research Summary records are available for the selected institute/year."
      },
      {
        "id": "value-of-industry-projects-vs-grants-vs-consultancy-revenue",
        "label": "Value of Industry Projects vs Grants vs Consultancy Revenue",
        "sourceTable": "Industry Research Summary",
        "sheet": "Industry_Research_Summary",
        "factKey": "industryResearchSummary",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Value (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "value_of_industry_projects",
            "label": "Value Of Industry Projects",
            "type": "Currency"
          },
          {
            "field": "total_value_of_industry_grants",
            "label": "Total Value Of Industry Grants",
            "type": "Currency"
          },
          {
            "field": "consultancy_revenue_generated",
            "label": "Consultancy Revenue Generated",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "value_of_industry_projects",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Value (INR Crore) by Year using value_of_industry_projects(Currency), total_value_of_industry_grants(Currency), consultancy_revenue_generated(Currency).",
        "emptyMessage": "No Industry Research Summary records are available for the selected institute/year."
      },
      {
        "id": "coes-mous-and-consultancy-activity-summary",
        "label": "CoEs, MoUs and Consultancy Activity Summary",
        "sourceTable": "Industry Research Summary",
        "sheet": "Industry_Research_Summary",
        "factKey": "industryResearchSummary",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of CoEs / MoU Partners / Consultancy Projects",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "consultancy_projects_count",
            "label": "Consultancy Projects Count",
            "type": "Int"
          },
          {
            "field": "total_coes_with_industry",
            "label": "Total CoEs With Industry",
            "type": "Int"
          },
          {
            "field": "coe_industry_partners_count",
            "label": "CoE Industry Partners Count",
            "type": "Int"
          },
          {
            "field": "mou_key_partners_count",
            "label": "MoU Key Partners Count",
            "type": "Int"
          }
        ],
        "primaryMeasure": "consultancy_projects_count",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Mixes counts of structurally different entities (CoEs, MoU partners, consultancy projects) on the same axis — context and scale may differ significantly; consider separate panels",
        "whatKpiShows": "Shows Number of CoEs / MoU Partners / Consultancy Projects by Year using consultancy_projects_count(Int), total_coes_with_industry(Int), coe_industry_partners_count(Int), mou_key_partners_count(Int).",
        "emptyMessage": "No Industry Research Summary records are available for the selected institute/year."
      }
    ],
    "phd-industry-funded": [
      {
        "id": "total-phd-scholars-fully-vs-partially-industry-funded",
        "label": "Total PhD Scholars: Fully vs Partially Industry Funded",
        "sourceTable": "PhDs Industry Funded",
        "sheet": "PhD_Industry_Funded",
        "factKey": "phdIndustryFunded",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Funding Type",
        "yLabel": "Number of PhD Scholars",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "total_phd_scholars",
            "label": "Total PhD Scholars",
            "type": "Int"
          },
          {
            "field": "phds_fully_industry_funded",
            "label": "Phds Fully Industry Funded",
            "type": "Int"
          },
          {
            "field": "phds_partially_industry_funded",
            "label": "Phds Partially Industry Funded",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_phd_scholars",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of PhD Scholars by Funding Type using total_phd_scholars(Int), phds_fully_industry_funded(Int), phds_partially_industry_funded(Int).",
        "emptyMessage": "No PhD Industry Funded records are available for the selected institute/year."
      },
      {
        "id": "industry-partners-and-university-partners-funding-phds",
        "label": "Industry Partners and University Partners Funding PhDs",
        "sourceTable": "PhDs Industry Funded",
        "sheet": "PhD_Industry_Funded",
        "factKey": "phdIndustryFunded",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Partner Type",
        "yLabel": "Number of Funding Partners",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "total_count_of_industry_partners_funding_phds",
            "label": "Total Count Of Industry Partners Funding Phds",
            "type": "Int"
          },
          {
            "field": "total_count_of_partner_universities_domestic",
            "label": "Total Count Of Partner Universities Domestic",
            "type": "Int"
          },
          {
            "field": "total_count_of_partner_universities_international",
            "label": "Total Count Of Partner Universities International",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_count_of_industry_partners_funding_phds",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Funding Partners by Partner Type using total_count_of_industry_partners_funding_phds(Int), total_count_of_partner_universities_domestic(Int), total_count_of_partner_universities_international(Int).",
        "emptyMessage": "No PhD Industry Funded records are available for the selected institute/year."
      }
    ],
    "tech-transfers": [
      {
        "id": "technology-transfers-by-university-department-faculty",
        "label": "Technology Transfers by University → Department → Faculty",
        "sourceTable": "Technology Transfers",
        "sheet": "Tech_Transfers",
        "factKey": "techTransfers",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Institute → Discipline/Department → Faculty",
        "yLabel": "Number of Technology Transfers",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Institute",
            "field": "institute"
          },
          {
            "label": "Discipline/Department",
            "field": "department"
          },
          {
            "label": "Faculty",
            "field": "faculty"
          }
        ],
        "xField": "institute",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Transfers",
            "type": "calculated"
          },
          {
            "field": "revenue_generated_inr_lakhs",
            "label": "Revenue Generated INR Lakhs",
            "type": "Currency"
          },
          {
            "field": "trl_level_at_transfer",
            "label": "TRL Level At Transfer",
            "type": "Int"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Technology Transfers by Institute → Discipline/Department → Faculty using Total Transfers (calculated), revenue_generated_inr_lakhs(Currency), trl_level_at_transfer(Int).",
        "emptyMessage": "No Tech Transfers records are available for the selected institute/year."
      }
    ]
  },
  "research-awards-collaborations": {
    "honors-fellowships": [
      {
        "id": "faculty-honors-and-fellowships-by-university-department-faculty",
        "label": "Faculty Honors and Fellowships by University → Department → Faculty",
        "sourceTable": "Faculty Honors and Fellowships",
        "sheet": "Honors_Fellowships",
        "factKey": "honorsFellowships",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Institute → Discipline/Department → Faculty",
        "yLabel": "Number of Honors and Fellowships Awarded",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Institute",
            "field": "institute"
          },
          {
            "label": "Discipline/Department",
            "field": "department"
          },
          {
            "label": "Faculty",
            "field": "faculty"
          }
        ],
        "xField": "institute",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Honors/fellowships",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Honors and Fellowships Awarded by Institute → Discipline/Department → Faculty using total honors/fellowships (calculated).",
        "emptyMessage": "No Honors Fellowships records are available for the selected institute/year."
      }
    ],
    "research-mous": [
      {
        "id": "research-mous-by-region-country-state-partnership-type-partner-institution",
        "label": "Research MoUs by Region → Country → State → Partnership Type → Partner Institution",
        "sourceTable": "Research and Innovation MoUs",
        "sheet": "Research_MoUs",
        "factKey": "researchMous",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Region → Country → State → Partnership Type → Partner Institution",
        "yLabel": "Number of MoUs",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
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
            "field": "state_if_india"
          },
          {
            "label": "Partnership Type",
            "field": "partnership_type"
          },
          {
            "label": "Partner Institution",
            "field": "partner_institution"
          }
        ],
        "xField": "region",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total MoUs",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of MoUs by Region → Country → State → Partnership Type → Partner Institution using total MoUs (calculated).",
        "emptyMessage": "No Research MoUs records are available for the selected institute/year."
      }
    ],
    "research-awards": [
      {
        "id": "research-awards-by-university-department-faculty",
        "label": "Research Awards by University → Department → Faculty",
        "sourceTable": "Research Awards",
        "sheet": "Research_Awards",
        "factKey": "researchAwards",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Institute → Discipline/Department → Faculty",
        "yLabel": "Number of Awards Received",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Institute",
            "field": "institute"
          },
          {
            "label": "Discipline/Department",
            "field": "department"
          },
          {
            "label": "Faculty",
            "field": "faculty"
          }
        ],
        "xField": "institute",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Awards",
            "type": "calculated"
          },
          {
            "field": "prize_money",
            "label": "Prize Money",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Awards Received by Institute → Discipline/Department → Faculty using total awards (calculated), prize_money(Currency).",
        "emptyMessage": "No Research Awards records are available for the selected institute/year."
      }
    ],
    "intl-collaborations": [
      {
        "id": "international-research-collaborations-by-region-country-partner-institution",
        "label": "International Research Collaborations by Region → Country → Partner Institution",
        "sourceTable": "Research International Collaborations",
        "sheet": "Intl_Collaborations",
        "factKey": "intlCollaborations",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Region → Country → Partner Institution",
        "yLabel": "Number of International Collaborations",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
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
            "label": "Partner Institution",
            "field": "partner_institution"
          }
        ],
        "xField": "region",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Collaborations",
            "type": "calculated"
          },
          {
            "field": "funding_amount",
            "label": "Funding Amount",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of International Collaborations by Region → Country → Partner Institution using total collaborations (calculated), funding_amount(Currency).",
        "emptyMessage": "No Intl Collaborations records are available for the selected institute/year."
      }
    ],
    "research-staff": [
      {
        "id": "research-staff-by-university-department-category",
        "label": "Research Staff by University → Department → Category",
        "sourceTable": "Research Staff",
        "sheet": "Research_Staff",
        "factKey": "researchStaff",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Institute → Discipline/Department → Category",
        "yLabel": "Number of Research Staff",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Institute",
            "field": "institute"
          },
          {
            "label": "Discipline/Department",
            "field": "department"
          }
        ],
        "xField": "institute",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Staff",
            "type": "calculated"
          },
          {
            "field": "monthly_cost",
            "label": "Monthly Cost",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Research Staff by Institute → Discipline/Department → Category using total staff (calculated), monthly_cost(Currency).",
        "emptyMessage": "No Research Staff records are available for the selected institute/year."
      }
    ]
  },
  "research-innovation": {
    "foreign-funding-grants": [
      {
        "id": "foreign-funding-research-grants-by-region-country",
        "label": "Foreign Funding Research Grants by Region → Country",
        "sourceTable": "Foreign Funding Research Grants",
        "sheet": "Foreign_Funding_Grants",
        "factKey": "foreignFundingGrants",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Region → Country",
        "yLabel": "Number of Grants Received",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Region",
            "field": "region"
          },
          {
            "label": "Country",
            "field": "country"
          }
        ],
        "xField": "region",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Total Grants",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Grants Received by Region → Country using total_grants (calculated).",
        "emptyMessage": "No Foreign Funding Grants records are available for the selected institute/year."
      }
    ],
    "patents-details": [
      {
        "id": "patents-by-institute-status-patent-type-department-faculty",
        "label": "Patents by Institute → Status → Patent Type → Department → Faculty",
        "sourceTable": "Patents Details",
        "sheet": "Patents_Details",
        "factKey": "patentsDetails",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Institute → Status → Patent Type → Department → Faculty",
        "yLabel": "Number of Patents",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [
          {
            "label": "Institute",
            "field": "institute"
          },
          {
            "label": "Status",
            "field": "status"
          },
          {
            "label": "Patent Type",
            "field": "patent_type"
          },
          {
            "label": "Department",
            "field": "department"
          },
          {
            "label": "Faculty",
            "field": "faculty"
          }
        ],
        "xField": "institute",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Patents Count",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Patents by Institute → Status → Patent Type → Department → Faculty using patents count (calculated).",
        "emptyMessage": "No Patents Details records are available for the selected institute/year."
      },
      {
        "id": "patents-by-region-country-status",
        "label": "Patents by Region → Country → Status",
        "sourceTable": "Patents Details",
        "sheet": "Patents_Details",
        "factKey": "patentsDetails",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Region → Country → Status",
        "yLabel": "Number of Patents",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
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
            "label": "Status",
            "field": "status"
          }
        ],
        "xField": "region",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Patents Count",
            "type": "calculated"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Patents by Region → Country → Status using patents count (calculated).",
        "emptyMessage": "No Patents Details records are available for the selected institute/year."
      },
      {
        "id": "number-of-patents-by-patent-type",
        "label": "Number of Patents by Patent Type",
        "sourceTable": "Patents Details",
        "sheet": "Patents_Details",
        "factKey": "patentsDetails",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Patent Type (Research / Commercial)",
        "yLabel": "Number of Patents",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "patent_type",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Patents Count",
            "type": "calculated"
          },
          {
            "field": "patent_type",
            "label": "Patent Type",
            "type": "Select"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Patents by Patent Type (Research / Commercial) using patents count (calculated), patent_type(Select).",
        "emptyMessage": "No Patents Details records are available for the selected institute/year."
      },
      {
        "id": "number-of-patents-by-status",
        "label": "Number of Patents by Status",
        "sourceTable": "Patents Details",
        "sheet": "Patents_Details",
        "factKey": "patentsDetails",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "Status (Pending, Granted, Rejected, Expired)",
        "yLabel": "Number of Patents",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "status",
        "isWide": false,
        "measures": [
          {
            "field": "__count",
            "label": "Patents Count",
            "type": "calculated"
          },
          {
            "field": "status",
            "label": "Status",
            "type": "Select"
          }
        ],
        "primaryMeasure": "__count",
        "aggregation": "count",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Patents by Status (Pending, Granted, Rejected, Expired) using patents count (calculated), status(Select).",
        "emptyMessage": "No Patents Details records are available for the selected institute/year."
      }
    ],
    "rd-expenditure": [
      {
        "id": "randd-expenditure-and-budget-allocation-over-time",
        "label": "R&D Expenditure and Budget Allocation Over Time",
        "sourceTable": "Research and Development Expenditure",
        "sheet": "RD_Expenditure",
        "factKey": "rdExpenditure",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "R&D Expenditure (INR Crore) / Budget Allocated to R&D (%)",
        "format": "pct",
        "allowPercent": false,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "total_rd_expenditure",
            "label": "Total R&D Expenditure",
            "type": "Currency"
          },
          {
            "field": "total_budget__allocated_to_r_and_d",
            "label": "Total Budget Allocated To R And D",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "total_rd_expenditure",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Dual-axis bar mixing absolute currency and percentage on same Y-axis — units are incompatible; use dual Y-axes or separate charts",
        "whatKpiShows": "Shows R&D Expenditure (INR Crore) / Budget Allocated to R&D (%) by Year using total_rd_expenditure(Currency), total_budget__allocated_to_r_and_d(Percent).",
        "emptyMessage": "No RD Expenditure records are available for the selected institute/year."
      }
    ],
    "research-innovation": [
      {
        "id": "patents-filed-total-national-vs-international",
        "label": "Patents Filed: Total → National vs International",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Patent Filing Type",
        "yLabel": "Number of Patents Filed",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "patents_filed_total",
            "label": "Patents Filed Total",
            "type": "Int"
          },
          {
            "field": "patents_filed_national",
            "label": "Patents Filed National",
            "type": "Int"
          },
          {
            "field": "patents_filed_international",
            "label": "Patents Filed International",
            "type": "Int"
          }
        ],
        "primaryMeasure": "patents_filed_total",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Patents Filed by Patent Filing Type using patents_filed_total(Int), patents_filed_national(Int), patents_filed_international(Int).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "research-funding-breakdown-by-source",
        "label": "Research Funding Breakdown by Source",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Funding Source",
        "yLabel": "Research Funding (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "research_funding_total",
            "label": "Research Funding Total",
            "type": "Currency"
          },
          {
            "field": "research_funding_public",
            "label": "Research Funding Public",
            "type": "Float"
          },
          {
            "field": "research_funding_industry",
            "label": "Research Funding Industry",
            "type": "Float"
          },
          {
            "field": "research_funding_internal_and_alumni",
            "label": "Research Funding Internal And Alumni",
            "type": "Float"
          },
          {
            "field": "research_funding_international",
            "label": "Research Funding International",
            "type": "Float"
          },
          {
            "field": "research_funding_other",
            "label": "Research Funding Other",
            "type": "Float"
          }
        ],
        "primaryMeasure": "research_funding_total",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Research Funding (INR Crore) by Funding Source using research_funding_total(Currency), research_funding_public(Float), research_funding_industry(Float), research_funding_internal_and_alumni(Float), research_funding_international(Float), research_funding_other(Float).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "research-funding-vs-expenditure-capex-opex",
        "label": "Research Funding vs Expenditure (CapEx / OpEx)",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Category",
        "yLabel": "Amount (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "research_funding_total",
            "label": "Research Funding Total",
            "type": "Currency"
          },
          {
            "field": "total_research_expenditure_cr",
            "label": "Total Research Expenditure Cr",
            "type": "Currency"
          },
          {
            "field": "total_research_capex_cr",
            "label": "Total Research CapEx Cr",
            "type": "Currency"
          },
          {
            "field": "total_research_opex_cr",
            "label": "Total Research OpEx Cr",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "research_funding_total",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Amount (INR Crore) by Category using research_funding_total(Currency), total_research_expenditure_cr(Currency), total_research_capex_cr(Currency), total_research_opex_cr(Currency).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "patents-filed-vs-granted-vs-licensed-vs-commercialised",
        "label": "Patents Filed vs Granted vs Licensed vs Commercialised",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Patent Status",
        "yLabel": "Number of Patents",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "status",
        "isWide": true,
        "measures": [
          {
            "field": "patents_filed_total",
            "label": "Patents Filed Total",
            "type": "Int"
          },
          {
            "field": "patents_granted_total",
            "label": "Patents Granted Total",
            "type": "Int"
          },
          {
            "field": "patents_under_review",
            "label": "Patents Under Review",
            "type": "Int"
          },
          {
            "field": "patents_licensed_to_industry",
            "label": "Patents Licensed To Industry",
            "type": "Int"
          },
          {
            "field": "patents_commercialiseddeployed",
            "label": "Patents Commercialiseddeployed",
            "type": "Int"
          }
        ],
        "primaryMeasure": "patents_filed_total",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Patents by Patent Status using patents_filed_total(Int), patents_granted_total(Int), patents_under_review(Int), patents_licensed_to_industry(Int), patents_commercialiseddeployed(Int).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "citations-overview-total-per-faculty-per-paper-h-index",
        "label": "Citations Overview: Total, Per Faculty, Per Paper, H-Index",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Citation Metric",
        "yLabel": "Number of Citations / h-Index Value",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "total_citations",
            "label": "Total Citations",
            "type": "Int"
          },
          {
            "field": "citations_per_faculty",
            "label": "Citations Per Faculty",
            "type": "Float"
          },
          {
            "field": "citations_per_paper",
            "label": "Citations Per Paper",
            "type": "Float"
          },
          {
            "field": "combined_h_index",
            "label": "Combined H Index",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_citations",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Mixes aggregate citation counts (potentially in thousands) with per-faculty/per-paper ratios and h-index on the same axis — vastly different scales; split total_citations onto a secondary axis or separate chart",
        "whatKpiShows": "Shows Number of Citations / h-Index Value by Citation Metric using total_citations(Int), citations_per_faculty(Float), citations_per_paper(Float), combined_h_index(Int).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "patents-commercialised-vs-revenue-generated-from-patents",
        "label": "Patents Commercialised vs Revenue Generated from Patents",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Patents Commercialised / Revenue from Patents (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "patents_commercialiseddeployed",
            "label": "Patents Commercialiseddeployed",
            "type": "Int"
          },
          {
            "field": "revenue_generated_from_patents_inr_crore",
            "label": "Revenue Generated From Patents INR Crore",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "patents_commercialiseddeployed",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Dual-axis bar mixing integer count and currency on same Y-axis — units are incompatible; use dual Y-axes or separate charts",
        "whatKpiShows": "Shows Number of Patents Commercialised / Revenue from Patents (INR Crore) by Year using patents_commercialiseddeployed(Int), revenue_generated_from_patents_inr_crore(Currency).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "publications-q1-journals-vs-conference-papers-vs-books",
        "label": "Publications: Q1 Journals vs Conference Papers vs Books",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Publication Type",
        "yLabel": "Number of Publications / Papers / Chapters",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "total_publications_in_q1_journals",
            "label": "Total Publications In Q1 Journals",
            "type": "Int"
          },
          {
            "field": "total_conference_papers",
            "label": "Total Conference Papers",
            "type": "Int"
          },
          {
            "field": "total_booksbook_chapters_authored",
            "label": "Total Booksbook Chapters Authored",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_publications_in_q1_journals",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Publications / Papers / Chapters by Publication Type using total_publications_in_q1_journals(Int), total_conference_papers(Int), total_booksbook_chapters_authored(Int).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "startups-incubated-count-jobs-generated-annual-revenue",
        "label": "Startups Incubated: Count, Jobs Generated, Annual Revenue",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Metric",
        "yLabel": "Number of Startups / Jobs Generated / Annual Revenue (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "total_startups_incubated",
            "label": "Total Startups Incubated",
            "type": "Int"
          },
          {
            "field": "startups_incubated_total_jobs_generated",
            "label": "Startups Incubated Total Jobs Generated",
            "type": "Int"
          },
          {
            "field": "startups_incubated_total_annual_revenue_cr",
            "label": "Startups Incubated Total Annual Revenue Cr",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_startups_incubated",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Mixes count of startups, count of jobs, and revenue in crore on the same Y-axis — scales will differ by orders of magnitude; split into separate panels or use a normalised index",
        "whatKpiShows": "Shows Number of Startups / Jobs Generated / Annual Revenue (INR Crore) by Metric using total_startups_incubated(Int), startups_incubated_total_jobs_generated(Int), startups_incubated_total_annual_revenue_cr(Int).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "research-staff-associates-project-staff-staff-student-ratio",
        "label": "Research Staff: Associates, Project Staff, Staff-Student Ratio",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Staff Category",
        "yLabel": "Number of Research Staff / Staff-to-Student Ratio",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "research_associates_count",
            "label": "Research Associates Count",
            "type": "Int"
          },
          {
            "field": "project_research_staff_count",
            "label": "Project Research Staff Count",
            "type": "Int"
          },
          {
            "field": "research_staff_student_ratio",
            "label": "Research Staff Student Ratio",
            "type": "Float"
          }
        ],
        "primaryMeasure": "research_associates_count",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Mixes headcount integers with a dimensionless ratio on the same Y-axis — staff counts and ratio values operate on different scales; use dual Y-axes or separate charts",
        "whatKpiShows": "Shows Number of Research Staff / Staff-to-Student Ratio by Staff Category using research_associates_count(Int), project_research_staff_count(Int), research_staff_student_ratio(Float).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "technology-transfers-consultancy-industry-grants-and-projects",
        "label": "Technology Transfers, Consultancy, Industry Grants and Projects",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Category",
        "yLabel": "Number of Projects / Grants / Transfers",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "total_technology_transfers",
            "label": "Total Technology Transfers",
            "type": "Int"
          },
          {
            "field": "consultancy_projects_count",
            "label": "Consultancy Projects Count",
            "type": "Int"
          },
          {
            "field": "industry_grants_count",
            "label": "Industry Grants Count",
            "type": "Int"
          },
          {
            "field": "industry_sponsored_projects_count",
            "label": "Industry Sponsored Projects Count",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_technology_transfers",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Projects / Grants / Transfers by Category using total_technology_transfers(Int), consultancy_projects_count(Int), industry_grants_count(Int), industry_sponsored_projects_count(Int).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "research-awards-national-international-young-researcher-industry",
        "label": "Research Awards: National, International, Young Researcher, Industry",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Award Category",
        "yLabel": "Number of Awards Received",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "national_awards_count",
            "label": "National Awards Count",
            "type": "Int"
          },
          {
            "field": "international_awards_count",
            "label": "International Awards Count",
            "type": "Int"
          },
          {
            "field": "young_researcher_awards_count",
            "label": "Young Researcher Awards Count",
            "type": "Int"
          },
          {
            "field": "industry_recognition_awards_count",
            "label": "Industry Recognition Awards Count",
            "type": "Int"
          }
        ],
        "primaryMeasure": "national_awards_count",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Awards Received by Award Category using national_awards_count(Int), international_awards_count(Int), young_researcher_awards_count(Int), industry_recognition_awards_count(Int).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "industry-engagement-sectors-outcomes-products-patents-coes",
        "label": "Industry Engagement: Sectors, Outcomes/Products/Patents, CoEs",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Metric",
        "yLabel": "Number of Sectors / Outcomes / CoEs",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": null,
        "isWide": true,
        "measures": [
          {
            "field": "sectors_industries",
            "label": "Sectors Industries",
            "type": "Int"
          },
          {
            "field": "outcomes_products_patents",
            "label": "Outcomes Products Patents",
            "type": "Int"
          },
          {
            "field": "coes_with_industry_count",
            "label": "CoEs With Industry Count",
            "type": "Int"
          }
        ],
        "primaryMeasure": "sectors_industries",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Mixes counts of heterogeneous entities (industry sectors engaged, outcome products/patents, CoEs) — unclear if these are comparable; clarify definitions and whether aggregation is meaningful",
        "whatKpiShows": "Shows Number of Sectors / Outcomes / CoEs by Metric using sectors_industries(Int), outcomes_products_patents(Int), coes_with_industry_count(Int).",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      },
      {
        "id": "utilised-vs-sanctioned-amount-kpi",
        "label": "Utilised vs Sanctioned Amount (KPI)",
        "sourceTable": "Research and Innovation",
        "sheet": "Research_Innovation",
        "factKey": "researchInnovation",
        "defaultView": "cards",
        "allowedViews": [
          "cards",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Budget Utilisation Rate (%)",
        "format": "pct",
        "allowPercent": false,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "utilised_vs_sanctioned_amount_",
            "label": "Utilised Vs Sanctioned Amount",
            "type": "Percent"
          }
        ],
        "primaryMeasure": "utilised_vs_sanctioned_amount_",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows utilised_vs_sanctioned_amount_(Percent) as a KPI value.",
        "emptyMessage": "No Research Innovation records are available for the selected institute/year."
      }
    ],
    "research-grants": [
      {
        "id": "research-grants-count-value-average-size-foreign-grants",
        "label": "Research Grants: Count, Value, Average Size, Foreign Grants",
        "sourceTable": "Research Grants",
        "sheet": "Research_Grants",
        "factKey": "researchGrants",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Grants / Average Grant Size (INR Crore) / Total Grant Value (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "number_of_grants_received",
            "label": "Number Of Grants Received",
            "type": "Int"
          },
          {
            "field": "average_grant_size",
            "label": "Average Grant Size",
            "type": "Float"
          },
          {
            "field": "total_value_of_grants_cr",
            "label": "Total Value Of Grants Cr",
            "type": "Currency"
          },
          {
            "field": "total_value_of_foreign_grants_cr",
            "label": "Total Value Of Foreign Grants Cr",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "number_of_grants_received",
        "aggregation": "avg",
        "reviewNote": "⚠ REVIEW: Mixes grant count, average size, and total value on the same Y-axis — units differ (count vs crore vs crore but at very different scales); split count onto secondary axis",
        "whatKpiShows": "Shows Number of Grants / Average Grant Size (INR Crore) / Total Grant Value (INR Crore) by Year using number_of_grants_received(Int), average_grant_size(Float), total_value_of_grants_cr(Currency), total_value_of_foreign_grants_cr(Currency).",
        "emptyMessage": "No Research Grants records are available for the selected institute/year."
      }
    ],
    "research-infrastructure": [
      {
        "id": "top-3-research-parks-by-companies-hosted",
        "label": "Top 3 Research Parks by Companies Hosted",
        "sourceTable": "Research Infrastructure",
        "sheet": "Research_Infrastructure",
        "factKey": "researchInfrastructure",
        "defaultView": "bar",
        "allowedViews": [
          "cards",
          "bar",
          "table"
        ],
        "xLabel": "Research Park Name",
        "yLabel": "Number of Companies Hosted",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "name_of_research_park",
        "isWide": false,
        "measures": [
          {
            "field": "companies_hosted_number",
            "label": "Companies Hosted Number",
            "type": "Int"
          },
          {
            "field": "annual_budget_operational_cost_cr",
            "label": "Annual Budget Operational Cost Cr",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "companies_hosted_number",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Companies Hosted by Research Park Name using companies_hosted_number(Int), annual_budget_operational_cost_cr(Currency).",
        "emptyMessage": "No Research Infrastructure records are available for the selected institute/year."
      }
    ]
  },
  "startup-innovation-ecosystem": {
    "fundraising-investment": [
      {
        "id": "total-funds-raised-over-time",
        "label": "Total Funds Raised Over Time",
        "sourceTable": "Fundraising and Investment",
        "sheet": "Fundraising_Investment",
        "factKey": "fundraisingInvestment",
        "defaultView": "trend",
        "allowedViews": [
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Total Funds Raised (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "total_funds_raised_cr",
            "label": "Total Funds Raised Cr",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "total_funds_raised_cr",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Total Funds Raised (INR Crore) by Year using total_funds_raised_cr(Currency).",
        "emptyMessage": "No Fundraising Investment records are available for the selected institute/year."
      }
    ],
    "hackathons-challenges": [
      {
        "id": "hackathons-and-innovation-challenges-conducted",
        "label": "Hackathons and Innovation Challenges Conducted",
        "sourceTable": "Hackathons and Innovation Challenges",
        "sheet": "Hackathons_Challenges",
        "factKey": "hackathonsChallenges",
        "defaultView": "trend",
        "allowedViews": [
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Events Conducted",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "events_conducted",
            "label": "Events Conducted",
            "type": "Int"
          }
        ],
        "primaryMeasure": "events_conducted",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Events Conducted by Year using events_conducted(Int).",
        "emptyMessage": "No Hackathons Challenges records are available for the selected institute/year."
      }
    ],
    "iit-stake-startups": [
      {
        "id": "iit-stake-in-startups-count-vs-portfolio-value",
        "label": "IIT Stake in Startups: Count vs Portfolio Value",
        "sourceTable": "IIT Stake in Startups",
        "sheet": "IIT_Stake_Startups",
        "factKey": "iitStakeStartups",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Startups / Equity Portfolio Value (INR Crore)",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "number_of_startups_with_iit_shareholding",
            "label": "Number Of Startups With IIT Shareholding",
            "type": "Int"
          },
          {
            "field": "value_of_iit_equity_portfolio_cr",
            "label": "Value Of IIT Equity Portfolio Cr",
            "type": "Currency"
          }
        ],
        "primaryMeasure": "number_of_startups_with_iit_shareholding",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Dual-axis bar mixing integer count and currency on same Y-axis — units are incompatible; split into two separate charts",
        "whatKpiShows": "Shows Number of Startups / Equity Portfolio Value (INR Crore) by Year using number_of_startups_with_iit_shareholding(Int), value_of_iit_equity_portfolio_cr(Currency).",
        "emptyMessage": "No IIT Stake Startups records are available for the selected institute/year."
      }
    ],
    "innovation-ip-data": [
      {
        "id": "patents-filed-vs-granted",
        "label": "Patents Filed vs Granted",
        "sourceTable": "Innovation and IP Data",
        "sheet": "Innovation_IP_Data",
        "factKey": "innovationIpData",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Patents",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "patents_filed_count",
            "label": "Patents Filed Count",
            "type": "Int"
          },
          {
            "field": "patents_granted_count",
            "label": "Patents Granted Count",
            "type": "Int"
          }
        ],
        "primaryMeasure": "patents_filed_count",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Patents by Year using patents_filed_count(Int), patents_granted_count(Int).",
        "emptyMessage": "No Innovation IP Data records are available for the selected institute/year."
      }
    ],
    "ip-commercialization": [
      {
        "id": "ip-commercialization-revenue-and-technologies-licensed",
        "label": "IP Commercialization Revenue and Technologies Licensed",
        "sourceTable": "IP Commercialization Revenue",
        "sheet": "IP_Commercialization",
        "factKey": "ipCommercialization",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "IP Commercialisation Revenue (INR Crore) / Number of Technologies Licensed",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "total_revenue",
            "label": "Total Revenue",
            "type": "Currency"
          },
          {
            "field": "technologies_licensed",
            "label": "Technologies Licensed",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_revenue",
        "aggregation": "sum",
        "reviewNote": "⚠ REVIEW: Dual-axis bar mixing currency and integer count on same Y-axis — units are incompatible; split into two separate charts or use dual Y-axes explicitly",
        "whatKpiShows": "Shows IP Commercialisation Revenue (INR Crore) / Number of Technologies Licensed by Year using total_revenue(Currency), technologies_licensed(Int).",
        "emptyMessage": "No IP Commercialization records are available for the selected institute/year."
      }
    ],
    "startup-jobs-impact": [
      {
        "id": "startup-jobs-direct-vs-indirect",
        "label": "Startup Jobs: Direct vs Indirect",
        "sourceTable": "Startup Jobs and Economic Impact",
        "sheet": "Startup_Jobs_Impact",
        "factKey": "startupJobsImpact",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Jobs Created",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "total_direct_jobs_created",
            "label": "Total Direct Jobs Created",
            "type": "Int"
          },
          {
            "field": "indirect_jobs_supported",
            "label": "Indirect Jobs Supported",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_direct_jobs_created",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Jobs Created by Year using total_direct_jobs_created(Int), indirect_jobs_supported(Int).",
        "emptyMessage": "No Startup Jobs Impact records are available for the selected institute/year."
      }
    ],
    "startups-incubated": [
      {
        "id": "startups-incubated-total-vs-research-based-vs-women-led",
        "label": "Startups Incubated: Total vs Research-Based vs Women-Led",
        "sourceTable": "Startups Incubated Summary",
        "sheet": "Startups_Incubated",
        "factKey": "startupsIncubated",
        "defaultView": "trend",
        "allowedViews": [
          "cards",
          "bar",
          "trend",
          "table"
        ],
        "xLabel": "Year",
        "yLabel": "Number of Startups",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "Year",
        "isWide": false,
        "measures": [
          {
            "field": "total_startups_incubated",
            "label": "Total Startups Incubated",
            "type": "Int"
          },
          {
            "field": "research_based_startups_count",
            "label": "Research Based Startups Count",
            "type": "Int"
          },
          {
            "field": "women_led_startups_count",
            "label": "Women Led Startups Count",
            "type": "Int"
          }
        ],
        "primaryMeasure": "total_startups_incubated",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Startups by Year using total_startups_incubated(Int), research_based_startups_count(Int), women_led_startups_count(Int).",
        "emptyMessage": "No Startups Incubated records are available for the selected institute/year."
      }
    ],
    "tech-biz-incubators": [
      {
        "id": "top-5-technology-business-incubators-by-startups-supported",
        "label": "Top 5 Technology Business Incubators by Startups Supported",
        "sourceTable": "Technology Business Incubators",
        "sheet": "Tech_Biz_Incubators",
        "factKey": "techBizIncubators",
        "defaultView": "bar",
        "allowedViews": [
          "bar",
          "table"
        ],
        "xLabel": "TBI Name",
        "yLabel": "Number of Startups Supported",
        "format": "number",
        "allowPercent": true,
        "barLayout": null,
        "levels": [],
        "xField": "name_of_tbi",
        "isWide": false,
        "measures": [
          {
            "field": "startups_supported",
            "label": "Startups Supported",
            "type": "Int"
          }
        ],
        "primaryMeasure": "startups_supported",
        "aggregation": "sum",
        "reviewNote": null,
        "whatKpiShows": "Shows Number of Startups Supported by TBI Name using startups_supported(Int).",
        "emptyMessage": "No Tech Biz Incubators records are available for the selected institute/year."
      }
    ]
  }
};

const TABLE_COLUMNS = {
  "coeIndustry": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "coe_name",
      "label": "CoE Name"
    },
    {
      "key": "industry_partner",
      "label": "Industry Partner"
    },
    {
      "key": "funding_amount",
      "label": "Funding Amount"
    },
    {
      "key": "duration",
      "label": "Duration"
    },
    {
      "key": "research_focus",
      "label": "Research Focus"
    },
    {
      "key": "infrastructure",
      "label": "Infrastructure"
    },
    {
      "key": "associated_faculty",
      "label": "Associated Faculty"
    },
    {
      "key": "projects_executed",
      "label": "Projects Executed"
    },
    {
      "key": "technologies_developed",
      "label": "Technologies Developed"
    },
    {
      "key": "ip_generated",
      "label": "IP Generated"
    },
    {
      "key": "revenue_generated",
      "label": "Revenue Generated"
    },
    {
      "key": "sustainability_plan",
      "label": "Sustainability Plan"
    },
    {
      "key": "major_achievementsoutcomes",
      "label": "Major Achievementsoutcomes"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "facultyConsultancy": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "department",
      "label": "Department"
    },
    {
      "key": "faculty_employee_id",
      "label": "Faculty Employee Id"
    },
    {
      "key": "consultancy_project_id",
      "label": "Consultancy Project Id"
    },
    {
      "key": "client_organisation",
      "label": "Client Organisation"
    },
    {
      "key": "consultancy_type",
      "label": "Consultancy Type"
    },
    {
      "key": "revenue_generated",
      "label": "Revenue Generated"
    },
    {
      "key": "hours_committed",
      "label": "Hours Committed"
    },
    {
      "key": "industry_sector",
      "label": "Industry Sector"
    },
    {
      "key": "funding_source",
      "label": "Funding Source"
    },
    {
      "key": "deliverables_submitted",
      "label": "Deliverables Submitted"
    },
    {
      "key": "royalty_clause",
      "label": "Royalty Clause"
    },
    {
      "key": "fund_allocation",
      "label": "Fund Allocation"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "honorsFellowships": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "department",
      "label": "Department"
    },
    {
      "key": "faculty_employee_id",
      "label": "Faculty Employee Id"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "title",
      "label": "Title"
    },
    {
      "key": "host_institution",
      "label": "Host Institution"
    },
    {
      "key": "duration",
      "label": "Duration"
    },
    {
      "key": "research_area",
      "label": "Research Area"
    },
    {
      "key": "sponsoring_agency",
      "label": "Sponsoring Agency"
    },
    {
      "key": "outcome_documentation",
      "label": "Outcome Documentation"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "foreignFundingGrants": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "grant_title",
      "label": "Grant Title"
    },
    {
      "key": "project_id",
      "label": "Project Id"
    },
    {
      "key": "outputs",
      "label": "Outputs"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "fundraisingInvestment": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "total_funds_raised_cr",
      "label": "Total Funds Raised Cr"
    },
    {
      "key": "breakdown_by_stage",
      "label": "Breakdown By Stage"
    },
    {
      "key": "major_investors_involved",
      "label": "Major Investors Involved"
    },
    {
      "key": "government_grants_leveraged",
      "label": "Government Grants Leveraged"
    },
    {
      "key": "csr_contributions_to_startup_funding",
      "label": "CSR Contributions To Startup Funding"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "hackathonsChallenges": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "events_conducted",
      "label": "Events Conducted"
    },
    {
      "key": "themes_focus",
      "label": "Themes Focus"
    },
    {
      "key": "participation",
      "label": "Participation"
    },
    {
      "key": "outcomes",
      "label": "Outcomes"
    },
    {
      "key": "industrygovernment_partners_involved",
      "label": "Industrygovernment Partners Involved"
    },
    {
      "key": "fundingprizes_awarded",
      "label": "Fundingprizes Awarded"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "iitStakeStartups": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "equity_stake_held_by_iit",
      "label": "Equity Stake Held By IIT"
    },
    {
      "key": "number_of_startups_with_iit_shareholding",
      "label": "Number Of Startups With IIT Shareholding"
    },
    {
      "key": "value_of_iit_equity_portfolio_cr",
      "label": "Value Of IIT Equity Portfolio Cr"
    },
    {
      "key": "dividend_exit_revenue_generated",
      "label": "Dividend Exit Revenue Generated"
    },
    {
      "key": "governance_board_participation",
      "label": "Governance Board Participation"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "industrialGrants": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "grant_title",
      "label": "Grant Title"
    },
    {
      "key": "grant_type",
      "label": "Grant Type"
    },
    {
      "key": "disbursement_schedule",
      "label": "Disbursement Schedule"
    },
    {
      "key": "utilisation_percent",
      "label": "Utilisation Percent"
    },
    {
      "key": "research_area",
      "label": "Research Area"
    },
    {
      "key": "expected_deliverables",
      "label": "Expected Deliverables"
    },
    {
      "key": "status_of_outcomes",
      "label": "Status Of Outcomes"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "industrialProjects": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "department",
      "label": "Department"
    },
    {
      "key": "faculty_employee_id",
      "label": "Faculty Employee Id"
    },
    {
      "key": "project_name",
      "label": "Project Name"
    },
    {
      "key": "research_objectives",
      "label": "Research Objectives"
    },
    {
      "key": "trl_start",
      "label": "TRL Start"
    },
    {
      "key": "trl_level_target",
      "label": "TRL Level Target"
    },
    {
      "key": "status",
      "label": "Status"
    },
    {
      "key": "key_deliverables",
      "label": "Key Deliverables"
    },
    {
      "key": "ip_generated",
      "label": "IP Generated"
    },
    {
      "key": "commercialisation",
      "label": "Commercialisation"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "industryResearchSummary": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "number_of_industry_sponsored_projects",
      "label": "Number Of Industry Sponsored Projects"
    },
    {
      "key": "value_of_industry_projects",
      "label": "Value Of Industry Projects"
    },
    {
      "key": "sectors_industries_involved",
      "label": "Sectors Industries Involved"
    },
    {
      "key": "outcomes_achieved",
      "label": "Outcomes Achieved"
    },
    {
      "key": "number_of_industry_grants_received",
      "label": "Number Of Industry Grants Received"
    },
    {
      "key": "total_value_of_industry_grants",
      "label": "Total Value Of Industry Grants"
    },
    {
      "key": "type_of_grants",
      "label": "Type Of Grants"
    },
    {
      "key": "top_industry_partners",
      "label": "Top Industry Partners"
    },
    {
      "key": "total_coes_with_industry",
      "label": "Total CoEs With Industry"
    },
    {
      "key": "coe_industry_partners_count",
      "label": "CoE Industry Partners Count"
    },
    {
      "key": "coe_major_focus_areas",
      "label": "CoE Major Focus Areas"
    },
    {
      "key": "coe_major_achievements_outcomes",
      "label": "CoE Major Achievements Outcomes"
    },
    {
      "key": "mou_key_partners_count",
      "label": "MoU Key Partners Count"
    },
    {
      "key": "mou_scope",
      "label": "MoU Scope"
    },
    {
      "key": "consultancy_projects_count",
      "label": "Consultancy Projects Count"
    },
    {
      "key": "consultancy_revenue_generated",
      "label": "Consultancy Revenue Generated"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "innovationIpData": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "patents_filed_count",
      "label": "Patents Filed Count"
    },
    {
      "key": "patents_granted_count",
      "label": "Patents Granted Count"
    },
    {
      "key": "trademarks_registered",
      "label": "Trademarks Registered"
    },
    {
      "key": "copyrights_software_ip_generated",
      "label": "Copyrights Software IP Generated"
    },
    {
      "key": "ip_licensing_agreements_with_industry",
      "label": "IP Licensing Agreements With Industry"
    },
    {
      "key": "ip_related_awards_recognition",
      "label": "IP Related Awards Recognition"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "ipCommercialization": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "total_revenue",
      "label": "Total Revenue"
    },
    {
      "key": "technologies_licensed",
      "label": "Technologies Licensed"
    },
    {
      "key": "industry_partners",
      "label": "Industry Partners"
    },
    {
      "key": "royalty_agreements_in_place",
      "label": "Royalty Agreements In Place"
    },
    {
      "key": "revenue_trend",
      "label": "Revenue Trend"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "patentsDetails": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "department",
      "label": "Department"
    },
    {
      "key": "faculty_employee_id",
      "label": "Faculty Employee Id"
    },
    {
      "key": "patent_number",
      "label": "Patent Number"
    },
    {
      "key": "patent_title",
      "label": "Patent Title"
    },
    {
      "key": "patent_details",
      "label": "Patent Details"
    },
    {
      "key": "patent_type",
      "label": "Patent Type"
    },
    {
      "key": "patent_country",
      "label": "Patent Country"
    },
    {
      "key": "student_roll_number",
      "label": "Student Roll Number"
    },
    {
      "key": "employee_id",
      "label": "Employee Id"
    },
    {
      "key": "status",
      "label": "Status"
    },
    {
      "key": "co_applicants",
      "label": "Co Applicants"
    },
    {
      "key": "company_name_if_licensed",
      "label": "Company Name If Licensed"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "phdIndustryFunded": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "total_phd_scholars",
      "label": "Total PhD Scholars"
    },
    {
      "key": "phds_fully_industry_funded",
      "label": "Phds Fully Industry Funded"
    },
    {
      "key": "phds_partially_industry_funded",
      "label": "Phds Partially Industry Funded"
    },
    {
      "key": "industry_partners",
      "label": "Industry Partners"
    },
    {
      "key": "dept_research_areas",
      "label": "Dept Research Areas"
    },
    {
      "key": "fellowship_value_and_tenure",
      "label": "Fellowship Value And Tenure"
    },
    {
      "key": "expected_outcomes",
      "label": "Expected Outcomes"
    },
    {
      "key": "placement_post_phd_support",
      "label": "Placement Post PhD Support"
    },
    {
      "key": "total_count_of_industry_partners_funding_phds",
      "label": "Total Count Of Industry Partners Funding Phds"
    },
    {
      "key": "total_count_of_partner_universities_domestic",
      "label": "Total Count Of Partner Universities Domestic"
    },
    {
      "key": "total_count_of_partner_universities_international",
      "label": "Total Count Of Partner Universities International"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "rdExpenditure": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "financial_year",
      "label": "Financial Year"
    },
    {
      "key": "total_rd_expenditure",
      "label": "Total R&D Expenditure"
    },
    {
      "key": "capex_breakdown",
      "label": "CapEx Breakdown"
    },
    {
      "key": "opex_breakdown",
      "label": "OpEx Breakdown"
    },
    {
      "key": "source_of_funds",
      "label": "Source Of Funds"
    },
    {
      "key": "dept_allocation",
      "label": "Dept Allocation"
    },
    {
      "key": "percent_utilisation",
      "label": "Percent Utilisation"
    },
    {
      "key": "major_thematic_areas",
      "label": "Major Thematic Areas"
    },
    {
      "key": "flagship_projects_supported",
      "label": "Flagship Projects Supported"
    },
    {
      "key": "total_budget__allocated_to_r_and_d",
      "label": "Total Budget Allocated To R And D"
    },
    {
      "key": "funding_breakdown",
      "label": "Funding Breakdown"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "researchInnovation": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "patents_filed_total",
      "label": "Patents Filed Total"
    },
    {
      "key": "patents_filed_national",
      "label": "Patents Filed National"
    },
    {
      "key": "patents_filed_international",
      "label": "Patents Filed International"
    },
    {
      "key": "patents_granted_total",
      "label": "Patents Granted Total"
    },
    {
      "key": "patents_licensed_to_industry",
      "label": "Patents Licensed To Industry"
    },
    {
      "key": "patents_under_review",
      "label": "Patents Under Review"
    },
    {
      "key": "research_based_patents",
      "label": "Research Based Patents"
    },
    {
      "key": "patents_commercialiseddeployed",
      "label": "Patents Commercialiseddeployed"
    },
    {
      "key": "revenue_generated_from_patents_inr_crore",
      "label": "Revenue Generated From Patents INR Crore"
    },
    {
      "key": "total_publications",
      "label": "Total Publications"
    },
    {
      "key": "total_publications_in_q1_journals",
      "label": "Total Publications In Q1 Journals"
    },
    {
      "key": "total_conference_papers",
      "label": "Total Conference Papers"
    },
    {
      "key": "total_booksbook_chapters_authored",
      "label": "Total Booksbook Chapters Authored"
    },
    {
      "key": "total_citations",
      "label": "Total Citations"
    },
    {
      "key": "citations_per_faculty",
      "label": "Citations Per Faculty"
    },
    {
      "key": "citations_per_paper",
      "label": "Citations Per Paper"
    },
    {
      "key": "combined_h_index",
      "label": "Combined H Index"
    },
    {
      "key": "research_funding_total",
      "label": "Research Funding Total"
    },
    {
      "key": "research_funding_public",
      "label": "Research Funding Public"
    },
    {
      "key": "research_funding_industry",
      "label": "Research Funding Industry"
    },
    {
      "key": "research_funding_internal_and_alumni",
      "label": "Research Funding Internal And Alumni"
    },
    {
      "key": "research_funding_international",
      "label": "Research Funding International"
    },
    {
      "key": "research_funding_other",
      "label": "Research Funding Other"
    },
    {
      "key": "total_research_expenditure_cr",
      "label": "Total Research Expenditure Cr"
    },
    {
      "key": "total_research_capex_cr",
      "label": "Total Research CapEx Cr"
    },
    {
      "key": "total_research_opex_cr",
      "label": "Total Research OpEx Cr"
    },
    {
      "key": "utilised_vs_sanctioned_amount_",
      "label": "Utilised Vs Sanctioned Amount"
    },
    {
      "key": "total_startups_incubated",
      "label": "Total Startups Incubated"
    },
    {
      "key": "startups_incubated_total_jobs_generated",
      "label": "Startups Incubated Total Jobs Generated"
    },
    {
      "key": "startups_incubated_total_annual_revenue_cr",
      "label": "Startups Incubated Total Annual Revenue Cr"
    },
    {
      "key": "total_technology_transfers",
      "label": "Total Technology Transfers"
    },
    {
      "key": "technology_transfers_total_revenue_generated",
      "label": "Technology Transfers Total Revenue Generated"
    },
    {
      "key": "research_associates_count",
      "label": "Research Associates Count"
    },
    {
      "key": "project_research_staff_count",
      "label": "Project Research Staff Count"
    },
    {
      "key": "research_staff_student_ratio",
      "label": "Research Staff Student Ratio"
    },
    {
      "key": "coes_with_industry_count",
      "label": "CoEs With Industry Count"
    },
    {
      "key": "national_awards_count",
      "label": "National Awards Count"
    },
    {
      "key": "international_awards_count",
      "label": "International Awards Count"
    },
    {
      "key": "young_researcher_awards_count",
      "label": "Young Researcher Awards Count"
    },
    {
      "key": "industry_recognition_awards_count",
      "label": "Industry Recognition Awards Count"
    },
    {
      "key": "consultancy_projects_count",
      "label": "Consultancy Projects Count"
    },
    {
      "key": "consultancy_revenue",
      "label": "Consultancy Revenue"
    },
    {
      "key": "industry_sponsored_projects_count",
      "label": "Industry Sponsored Projects Count"
    },
    {
      "key": "industry_projects_value",
      "label": "Industry Projects Value"
    },
    {
      "key": "sectors_industries",
      "label": "Sectors Industries"
    },
    {
      "key": "outcomes_products_patents",
      "label": "Outcomes Products Patents"
    },
    {
      "key": "industry_grants_count",
      "label": "Industry Grants Count"
    },
    {
      "key": "industry_grants_value",
      "label": "Industry Grants Value"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "researchMous": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "partner_institution",
      "label": "Partner Institution"
    },
    {
      "key": "industry_sector",
      "label": "Industry Sector"
    },
    {
      "key": "partnership_type",
      "label": "Partnership Type"
    },
    {
      "key": "duration",
      "label": "Duration"
    },
    {
      "key": "nodal_faculty",
      "label": "Nodal Faculty"
    },
    {
      "key": "expected_deliverables",
      "label": "Expected Deliverables"
    },
    {
      "key": "monitoring_frequency",
      "label": "Monitoring Frequency"
    },
    {
      "key": "outcomes_achieved",
      "label": "Outcomes Achieved"
    },
    {
      "key": "renewal_status",
      "label": "Renewal Status"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "researchAwards": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "department",
      "label": "Department"
    },
    {
      "key": "faculty_employee_id",
      "label": "Faculty Employee Id"
    },
    {
      "key": "award_name",
      "label": "Award Name"
    },
    {
      "key": "date_of_award_grant",
      "label": "Date Of Award Grant"
    },
    {
      "key": "awarding_body",
      "label": "Awarding Body"
    },
    {
      "key": "category",
      "label": "Category"
    },
    {
      "key": "student_roll_number",
      "label": "Student Roll Number"
    },
    {
      "key": "work_for_award",
      "label": "Work For Award"
    },
    {
      "key": "prize_money",
      "label": "Prize Money"
    },
    {
      "key": "citation_upload",
      "label": "Citation Upload"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "researchGrants": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "number_of_grants_received",
      "label": "Number Of Grants Received"
    },
    {
      "key": "total_value_of_grants_cr",
      "label": "Total Value Of Grants Cr"
    },
    {
      "key": "funding_agencies",
      "label": "Funding Agencies"
    },
    {
      "key": "average_grant_size",
      "label": "Average Grant Size"
    },
    {
      "key": "total_value_of_foreign_grants_cr",
      "label": "Total Value Of Foreign Grants Cr"
    },
    {
      "key": "technologies_transferred_by_area",
      "label": "Technologies Transferred By Area"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "researchInfrastructure": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "name_of_research_park",
      "label": "Name Of Research Park"
    },
    {
      "key": "companies_hosted_number",
      "label": "Companies Hosted Number"
    },
    {
      "key": "focus_areas__domains",
      "label": "Focus Areas Domains"
    },
    {
      "key": "trl_range_supported",
      "label": "TRL Range Supported"
    },
    {
      "key": "facilities_available",
      "label": "Facilities Available"
    },
    {
      "key": "industry_academia_projects",
      "label": "Industry Academia Projects"
    },
    {
      "key": "annual_budget_operational_cost_cr",
      "label": "Annual Budget Operational Cost Cr"
    },
    {
      "key": "ip_commercialisation_support",
      "label": "IP Commercialisation Support"
    },
    {
      "key": "startup_incubation_support",
      "label": "Startup Incubation Support"
    },
    {
      "key": "impact_metrics",
      "label": "Impact Metrics"
    },
    {
      "key": "collaborations",
      "label": "Collaborations"
    },
    {
      "key": "student_engagement",
      "label": "Student Engagement"
    },
    {
      "key": "specialized_laboratories",
      "label": "Specialized Laboratories"
    },
    {
      "key": "research_centers_of_excellence",
      "label": "Research Centers Of Excellence"
    },
    {
      "key": "high_performance_computing_facilities",
      "label": "High Performance Computing Facilities"
    },
    {
      "key": "major_equipment",
      "label": "Major Equipment"
    },
    {
      "key": "shared_facilities_for_industry_collaboration",
      "label": "Shared Facilities For Industry Collaboration"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "intlCollaborations": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "collaboration_title",
      "label": "Collaboration Title"
    },
    {
      "key": "partner_institution",
      "label": "Partner Institution"
    },
    {
      "key": "pi_employee_id",
      "label": "Pi Employee Id"
    },
    {
      "key": "nature_of_collaboration",
      "label": "Nature Of Collaboration"
    },
    {
      "key": "start_date",
      "label": "Start Date"
    },
    {
      "key": "end_date",
      "label": "End Date"
    },
    {
      "key": "funding_source",
      "label": "Funding Source"
    },
    {
      "key": "funding_amount",
      "label": "Funding Amount"
    },
    {
      "key": "joint_publications_count_and_dois",
      "label": "Joint Publications Count And Dois"
    },
    {
      "key": "joint_patents_ip_ownership_share",
      "label": "Joint Patents IP Ownership Share"
    },
    {
      "key": "research_outputs",
      "label": "Research Outputs"
    },
    {
      "key": "facultystudent_mobility_inout_counts",
      "label": "Facultystudent Mobility Inout Counts"
    },
    {
      "key": "outcomes_to_date",
      "label": "Outcomes To Date"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "researchStaff": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "department",
      "label": "Department"
    },
    {
      "key": "name_designation",
      "label": "Name Designation"
    },
    {
      "key": "designation",
      "label": "Designation"
    },
    {
      "key": "category",
      "label": "Category"
    },
    {
      "key": "research_area",
      "label": "Research Area"
    },
    {
      "key": "specialisation",
      "label": "Specialisation"
    },
    {
      "key": "project_title",
      "label": "Project Title"
    },
    {
      "key": "monthly_cost",
      "label": "Monthly Cost"
    },
    {
      "key": "outputs_contributed",
      "label": "Outputs Contributed"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "startupJobsImpact": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "total_direct_jobs_created",
      "label": "Total Direct Jobs Created"
    },
    {
      "key": "indirect_jobs_supported",
      "label": "Indirect Jobs Supported"
    },
    {
      "key": "contribution_to_local_economy",
      "label": "Contribution To Local Economy"
    },
    {
      "key": "rural_vs_urban_employment_distribution",
      "label": "Rural Vs Urban Employment Distribution"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "startupsIncubated": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "total_startups_incubated",
      "label": "Total Startups Incubated"
    },
    {
      "key": "new_vs_existing_startups_supported",
      "label": "New Vs Existing Startups Supported"
    },
    {
      "key": "founder_profile_breakup",
      "label": "Founder Profile Breakup"
    },
    {
      "key": "startups_by_technology_domain",
      "label": "Startups By Technology Domain"
    },
    {
      "key": "startups_by_urban_rural_classification",
      "label": "Startups By Urban Rural Classification"
    },
    {
      "key": "women_led_startups_count",
      "label": "Women Led Startups Count"
    },
    {
      "key": "jobs_created_direct_indirect",
      "label": "Jobs Created Direct Indirect"
    },
    {
      "key": "research_based_startups_count",
      "label": "Research Based Startups Count"
    },
    {
      "key": "total_ip_generated",
      "label": "Total IP Generated"
    },
    {
      "key": "total_revenue_generated_cr",
      "label": "Total Revenue Generated Cr"
    },
    {
      "key": "startups_by_fundraising_stage",
      "label": "Startups By Fundraising Stage"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "techBizIncubators": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "name_of_tbi",
      "label": "Name Of TBI"
    },
    {
      "key": "year_of_establishment",
      "label": "Year Of Establishment"
    },
    {
      "key": "focus_areas",
      "label": "Focus Areas"
    },
    {
      "key": "startups_supported",
      "label": "Startups Supported"
    },
    {
      "key": "funding_support",
      "label": "Funding Support"
    },
    {
      "key": "infrastructure_services",
      "label": "Infrastructure Services"
    },
    {
      "key": "facilities_provided",
      "label": "Facilities Provided"
    },
    {
      "key": "industrycsr_partners_involved",
      "label": "Industrycsr Partners Involved"
    },
    {
      "key": "government_schemes_leveraged",
      "label": "Government Schemes Leveraged"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ],
  "techTransfers": [
    {
      "key": "Institute",
      "label": "Institute"
    },
    {
      "key": "InstituteId",
      "label": "Institute ID"
    },
    {
      "key": "Year",
      "label": "Year"
    },
    {
      "key": "record_id",
      "label": "Record Id"
    },
    {
      "key": "institute",
      "label": "Institute"
    },
    {
      "key": "year",
      "label": "Year"
    },
    {
      "key": "department",
      "label": "Department"
    },
    {
      "key": "faculty_employee_id",
      "label": "Faculty Employee Id"
    },
    {
      "key": "project_name",
      "label": "Project Name"
    },
    {
      "key": "mode_of_transfer",
      "label": "Mode Of Transfer"
    },
    {
      "key": "revenue_generated_inr_lakhs",
      "label": "Revenue Generated INR Lakhs"
    },
    {
      "key": "trl_level_at_transfer",
      "label": "TRL Level At Transfer"
    },
    {
      "key": "impact_metrics",
      "label": "Impact Metrics"
    },
    {
      "key": "ip_details",
      "label": "IP Details"
    },
    {
      "key": "region",
      "label": "Region"
    },
    {
      "key": "country",
      "label": "Country"
    },
    {
      "key": "continent",
      "label": "Continent"
    },
    {
      "key": "state_if_india",
      "label": "State (if India)"
    },
    {
      "key": "faculty",
      "label": "Faculty"
    },
    {
      "key": "funding_agency",
      "label": "Funding Agency"
    }
  ]
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

function numericValue(row, field) {
  if (field === "__count") return 1;
  const value = Number(row?.[field] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function aggregate(rows, field, aggregation = "sum") {
  if (aggregation === "count" || field === "__count") return rows.length;
  const values = rows.map((row) => numericValue(row, field)).filter(Number.isFinite);
  if (!values.length) return 0;
  if (aggregation === "avg") return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
  return Number(values.reduce((a, b) => a + b, 0).toFixed(2));
}

function prettifyField(field) {
  return String(field ?? "")
    .replace(/^__count$/, "Count")
    .replaceAll("_", " ")
    .replace(/\b(iit|rd|ip|trl|tbi|phd|mou|mous|csr|q1|inr|coe|coes)\b/gi, (match) => match.toUpperCase())
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
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

function groupAggregate(rows, field, measure, aggregation = "sum") {
  const buckets = new Map();
  for (const row of rows) {
    const name = row[field] ?? "(unknown)";
    if (!name) continue;
    const current = buckets.get(name) ?? [];
    current.push(row);
    buckets.set(name, current);
  }
  return Array.from(buckets.entries())
    .map(([name, bucket]) => ({ name, value: aggregate(bucket, measure, aggregation) }))
    .filter((item) => item.name !== "(unknown)" && Number.isFinite(item.value) && item.value !== 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
}

function valueByLevels(rows, levels, drillPath, measure, aggregation) {
  const scoped = applyDrill(rows, levels, drillPath);
  const field = levels?.[drillPath.length]?.field;
  if (!field) return [];
  return groupAggregate(scoped, field, measure, aggregation);
}

function filterDetailFocus(rows, detailFocus) {
  if (!detailFocus?.field) return rows;
  return rows.filter((row) => String(row[detailFocus.field] ?? "(unknown)") === String(detailFocus.value));
}

function buildTrendFromRows(rows, yearRange, measure, aggregation) {
  const out = [];
  for (let year = Number(yearRange.from); year <= Number(yearRange.to); year += 1) {
    const yearRows = rows.filter((row) => Number(row.Year) === year);
    if (!yearRows.length) continue;
    out.push({ name: String(year), value: aggregate(yearRows, measure, aggregation) });
  }
  return out;
}

function buildTimeSeriesRows(rows, yearRange, measures, aggregationByField = {}) {
  const keys = measures.map((item) => item.label || prettifyField(item.field));
  const timeSeriesRows = [];
  for (let year = Number(yearRange.from); year <= Number(yearRange.to); year += 1) {
    const yearRows = rows.filter((row) => Number(row.Year) === year);
    if (!yearRows.length) continue;
    const out = { name: String(year) };
    measures.forEach((item, index) => {
      out[keys[index]] = aggregate(yearRows, item.field, aggregationByField[item.field] ?? (String(item.field).includes("percent") || String(item.field).includes("ratio") || String(item.field).includes("rate") ? "avg" : "sum"));
    });
    timeSeriesRows.push(out);
  }
  return { timeSeriesRows, timeSeriesKeys: keys };
}

function wideBreakdown(rows, measures, aggregationByField = {}) {
  return measures
    .map((item) => ({
      name: item.label || prettifyField(item.field),
      value: aggregate(rows, item.field, aggregationByField[item.field] ?? (String(item.field).includes("percent") || String(item.field).includes("ratio") || String(item.field).includes("rate") ? "avg" : "sum")),
    }))
    .filter((item) => Number.isFinite(item.value) && item.value !== 0);
}

function buildCards(rows, measures, yearRange, reviewNote = null) {
  const cards = measures.map((item) => {
    const field = item.field;
    const isPct = String(item.type ?? "").toLowerCase().includes("percent") || String(field).includes("percent") || String(field).includes("ratio") || String(field).includes("rate");
    const value = aggregate(rows, field, isPct ? "avg" : (field === "__count" ? "count" : "sum"));
    return { label: item.label || prettifyField(field), value, format: isPct ? "pct" : "number", note: `${yearRange.from}–${yearRange.to}` };
  });
  if (reviewNote) cards.push({ label: "Implementation note", value: "Split / review", note: reviewNote });
  return cards;
}

function uniqueViews(views) {
  return views.filter((view, index) => view && views.indexOf(view) === index);
}

function deriveAllowedViews(category, state) {
  const hasCards = Boolean(state.cards?.length);
  const hasBreakdown = Boolean(state.breakdown?.length);
  const hasTrend = Boolean(state.trend?.length || state.timeSeriesRows?.length);
  const hasTable = Boolean(state.tableRows?.length || state.detailRows?.length);
  const requestedViews = Array.isArray(category.allowedViews) && category.allowedViews.length
    ? category.allowedViews
    : ["bar", "trend", "table"];
  const views = [];
  if (hasCards) views.push("cards");
  if (hasBreakdown) views.push("bar");
  if (hasBreakdown && requestedViews.includes("donut")) views.push("donut");
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
    emptyMessage: emptyMessage ?? category.emptyMessage ?? "No data is available for this Research & Innovation visual.",
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
    drillable: Boolean((state.levels ?? category.levels ?? []).length),
    emptyTitle: category.label,
    emptyMessage: category.emptyMessage ?? "Visual for this metric is not available here.",
  };
}

export function getResearchInnovationCategories(subsectionId, viewId) {
  return CATEGORY_CONFIG[subsectionId]?.[viewId] ?? [];
}

export function getDefaultResearchInnovationCategoryId(subsectionId, viewId) {
  return getResearchInnovationCategories(subsectionId, viewId)?.[0]?.id ?? null;
}

export function isResearchInnovationSubsection(subsectionId) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_CONFIG, subsectionId);
}

export function buildResearchInnovationVisual({
  facts,
  subsectionId,
  viewId,
  categoryId,
  instituteId,
  yearRange,
  drillPath = [],
  detailFocus = null,
}) {
  const categories = getResearchInnovationCategories(subsectionId, viewId);
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  if (!category) return null;

  const sourceRows = facts?.[category.factKey] ?? [];
  const rows = rangeRows(sourceRows, instituteId, yearRange);
  const latest = latestRows(sourceRows, instituteId, yearRange);
  const tableColumns = TABLE_COLUMNS[category.factKey] ?? [];
  const tableRows = rows;
  const scoped = applyDrill(rows, category.levels, drillPath);
  const detailRows = filterDetailFocus(scoped.length ? scoped : tableRows, detailFocus);
  const aggregationByField = Object.fromEntries((category.measures ?? []).map((item) => [item.field, (String(item.field).includes("percent") || String(item.field).includes("ratio") || String(item.field).includes("rate") || String(item.field).includes("average")) ? "avg" : (item.field === "__count" ? "count" : "sum")]));
  const primaryMeasure = category.primaryMeasure ?? category.measures?.[0]?.field ?? "__count";

  let breakdown = [];
  let trend = [];
  let timeSeriesRows = [];
  let timeSeriesKeys = [];
  let visualKind = category.defaultView ?? "bar";

  if (category.levels?.length) {
    breakdown = valueByLevels(rows, category.levels, drillPath, primaryMeasure, aggregationByField[primaryMeasure] ?? category.aggregation);
  } else if (category.isWide) {
    breakdown = wideBreakdown(latest.length ? latest : rows, category.measures ?? [], aggregationByField);
  } else if (category.xField === "Year") {
    trend = buildTrendFromRows(rows, yearRange, primaryMeasure, aggregationByField[primaryMeasure] ?? category.aggregation);
    if ((category.measures ?? []).length > 1) {
      const built = buildTimeSeriesRows(rows, yearRange, category.measures, aggregationByField);
      timeSeriesRows = built.timeSeriesRows;
      timeSeriesKeys = built.timeSeriesKeys;
    }
    breakdown = wideBreakdown(latest.length ? latest : rows, category.measures ?? [{ field: primaryMeasure, label: category.yLabel }], aggregationByField);
  } else if (category.xField) {
    breakdown = groupAggregate(latest.length ? latest : rows, category.xField, primaryMeasure, aggregationByField[primaryMeasure] ?? category.aggregation);
  }

  if (!timeSeriesRows.length && (category.measures ?? []).length > 1 && (String(category.xLabel ?? "").toLowerCase() === "year" || String(category.defaultView).includes("trend"))) {
    const built = buildTimeSeriesRows(rows, yearRange, category.measures, aggregationByField);
    timeSeriesRows = built.timeSeriesRows;
    timeSeriesKeys = built.timeSeriesKeys;
  }
  if (!trend.length && timeSeriesRows.length && timeSeriesKeys.length === 1) {
    trend = timeSeriesRows.map((row) => ({ name: row.name, value: row[timeSeriesKeys[0]] }));
  }

  const cards = buildCards(rows, category.measures ?? [{ field: primaryMeasure, label: category.yLabel }], yearRange, category.reviewNote);
  if (category.defaultView === "cards") visualKind = "cards";
  else if (category.defaultView === "trend" && (trend.length || timeSeriesRows.length)) visualKind = "trend";
  else if (category.defaultView === "donut") visualKind = "donut";
  else visualKind = "bar";

  return finalize(category, {
    visualKind,
    cards,
    breakdown,
    trend,
    timeSeriesRows,
    timeSeriesKeys,
    levels: category.levels,
    tableColumns,
    tableRows,
    detailColumns: tableColumns,
    detailRows,
    barLayout: category.barLayout,
  });
}

export { RI_MODULE_ID };
