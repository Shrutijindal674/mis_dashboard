export const DOMAIN_DEFS = [
  {
    id: "Institution & Governance",
    icon: "institution",
    children: [
      { id: "institutional-profile", label: "Institutional Profile", kpiId: "kpi_inst_profile_mix" },
      { id: "governance-policy", label: "Governance and Policy", kpiId: "kpi_governance_grievance" },
      { id: "rankings-accreditations", label: "Rankings & Accreditations", kpiId: "kpi_ranking_records" },
      { id: "audit-observation", label: "Audit Observation", kpiId: "kpi_audit_observations" },
      { id: "court-cases", label: "Court Cases", kpiId: "kpi_legal_cases" },
    ],
  },
  {
    id: "People & Student Life",
    icon: "people",
    children: [
      { id: "student-profile", label: "Student Profile", kpiId: "kpi_psl_student_profile" },
      { id: "student-support-system", label: "Student Support System", kpiId: "kpi_psl_medical_summary" },
      { id: "placements-alumni", label: "Placements & Alumni", kpiId: "kpi_psl_placements_alumni" },
    ],
  },
  {
    id: "Research & Innovation",
    icon: "research",
    children: [
      { id: "industrial-research", label: "Industrial Research", kpiId: "kpi_research_overview" },
      { id: "research-awards-collaborations", label: "Research Awards and Collaborations", kpiId: "kpi_research_collab_drill" },
      { id: "research-innovation", label: "Research & Innovation", kpiId: "kpi_research_overview" },
      { id: "startup-innovation-ecosystem", label: "Startup Innovation Ecosystem", kpiId: "kpi_research_patents" },
    ],
  },
  {
    id: "Collaborations & Outreach",
    icon: "outreach",
    children: [
      { id: "collaborations-mous", label: "Collaborations & MoUs", kpiId: "kpi_outreach_collab" },
      { id: "events-outreach", label: "Events & Outreach", kpiId: "kpi_outreach_events" },
      { id: "global-academic-collaborations", label: "Global Academic Collaborations", kpiId: "kpi_outreach_events" },
      { id: "internationalisation", label: "Internationalisation", kpiId: "kpi_outreach_programs" },
      { id: "special-programs", label: "Special Programs", kpiId: "kpi_outreach_programs" },
    ],
  },
  {
    id: "Infrastructure & Finance",
    icon: "infrastructure",
    children: [
      { id: "infrastructure", label: "Infrastructure", kpiId: "kpi_budget_utilisation" },
      { id: "funding-financials", label: "Funding & Financials", kpiId: "kpi_total_budget" },
      { id: "sustainability-esg", label: "Sustainability & ESG", kpiId: "kpi_budget_utilisation" },
      { id: "miscellaneous", label: "Miscellaneous", kpiId: "kpi_total_budget" },
    ],
  },
];

export const ADVANCED_ITEMS = [
  { id: "Compare", label: "Compare", icon: "compare" },
  { id: "Reports", label: "Reports", icon: "reports" },
  { id: "Data & Admin", label: "Data & Admin", icon: "admin" },
];

export const DOMAIN_BY_ID = Object.fromEntries(DOMAIN_DEFS.map((item) => [item.id, item]));
export const CHILD_BY_ID = Object.fromEntries(DOMAIN_DEFS.flatMap((item) => item.children.map((child) => [child.id, { ...child, domainId: item.id }])));
