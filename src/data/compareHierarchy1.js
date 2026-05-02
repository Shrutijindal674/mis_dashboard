import { DOMAIN_DEFS } from "./sectionDefs";
import { KPI_DEFS } from "./kpiDefs";

export const SUBSECTION_VIEW_OPTIONS = {
  "institutional-profile": [
    { id: "profile", label: "Institutional Profile", kpiId: "kpi_inst_profile_mix", helper: "Institutional snapshot with KPI cards, degree mix, and reference contacts." },
    { id: "programs", label: "Academic Programs", kpiId: "kpi_inst_program_portfolio", helper: "Academic Programs is the drillable table here: Degree > Department / Discipline > Mode of Delivery > records." },
  ],
  "governance-policy": [
    { id: "grievance", label: "Anti-Ragging & Grievance", kpiId: "kpi_governance_grievance", helper: "Narrative governance records stay table-first and open as details-on-demand." },
    { id: "iqac", label: "Internal QA Mechanisms", kpiId: "kpi_governance_iqac", helper: "IQAC structure, accreditation timelines, audit processes, and improvement plans." },
    { id: "structure", label: "Institutional Governance Structure", kpiId: "kpi_governance_structure", helper: "Governing bodies, hierarchy, meeting frequency, and accountability mechanisms." },
    { id: "diversity", label: "Diversity & Inclusion", kpiId: "kpi_governance_diversity", helper: "Inclusion metrics, sensitisation, affirmative action, and implementation status." },
  ],
  "rankings-accreditations": [
    { id: "rankings", label: "Institute Rankings", kpiId: "kpi_rankings_only", helper: "Separate ranking views from accreditation and quality portfolios." },
    { id: "accreditations", label: "Institute Accreditations", kpiId: "kpi_accreditations_only", helper: "NAAC / NBA status, validity, coverage, and follow-up actions." },
    { id: "quality", label: "ISO & Quality Certifications", kpiId: "kpi_quality_certs_only", helper: "Certification portfolios, certifying agency, validity, and renewal cycles." },
  ],
  "audit-observation": [
    { id: "audit", label: "Audit Observations", kpiId: "kpi_audit_observations", helper: "Status distributions should cross-filter the audit register without hierarchy drilldown." },
  ],
  "court-cases": [
    { id: "legal", label: "Legal Cases", kpiId: "kpi_legal_cases", helper: "Status mix, case nature, hearing context, and legal exposure." },
  ],
  "student-profile": [
    { id: "entrance-exam", label: "Entrance Exam", kpiId: "kpi_psl_entrance_exam", helper: "Non-drillable view with exam records, rank / score context, and reservation-category slices." },
    { id: "student-profile-sheet", label: "Student Profile", kpiId: "kpi_psl_student_profile", helper: "Summary view for enrolled students, cohort mix, and headline student-life counts." },
    { id: "international-students", label: "International Students", kpiId: "kpi_psl_international_students", helper: "Drill path: Region > Country > Program > Degree, then detail records." },
    { id: "enrollment-details", label: "Enrollment Details", kpiId: "kpi_psl_enrollment_details", helper: "Drill path: Program > Academic Area > Discipline > Degree > Gender > Social Category." },
    { id: "admission-mode", label: "Admission Mode", kpiId: "kpi_psl_admission_mode", helper: "Drill path: Admission Channel > Program > Degree > Discipline." },
    { id: "student-death-cases", label: "Student Death Cases", kpiId: "kpi_psl_student_death_cases", helper: "High-sensitivity view that should stay aggregate-first and role-restricted." },
  ],
  "faculty-staff": [
    { id: "faculty-staff-summary", label: "Faculty and Staff", kpiId: "kpi_psl_faculty_staff", helper: "Summary workforce view for sanctioned, in-position, vacant, and staff buckets." },
    { id: "faculty-research-engagement", label: "Faculty Research Engagement", kpiId: "kpi_psl_faculty_research", helper: "Drill path: Department > Faculty > Source." },
    { id: "mission-recruitment", label: "Mission Recruitment", kpiId: "kpi_psl_mission_recruitment", helper: "Recruitment by tranche with derived gender / category mix kept as details-on-demand." },
    { id: "faculty-awards", label: "Faculty Awards & Recognition", kpiId: "kpi_psl_faculty_awards", helper: "Drill path: Award Level > Issuing Body > Faculty Name." },
    { id: "international-faculty", label: "International Faculty", kpiId: "kpi_psl_international_faculty", helper: "Drill path: Country > Appointment Type > Role Type > Degree Level > Name." },
  ],
  "student-support-system": [
    { id: "medical-staff-details", label: "Medical Staff Details", kpiId: "kpi_psl_medical_staff_details", helper: "Register-first view with counts by role and details-on-demand." },
    { id: "medical-staff-summary", label: "Medical Staff Summary", kpiId: "kpi_psl_medical_summary", helper: "Headline staffing counts for doctors, nurses, paramedics, and mental-health professionals." },
    { id: "entrepreneurship-support", label: "Entrepreneurship Support", kpiId: "kpi_psl_entrepreneurship", helper: "KPIs plus startup-support text, with student-startup counts in the chart." },
    { id: "career-services", label: "Career Services", kpiId: "kpi_psl_career_services", helper: "Narrative + KPI view for internships, guidance sessions, alumni mentoring, and industry feedback." },
    { id: "counselling-services", label: "Counselling Services", kpiId: "kpi_psl_counselling_services", helper: "Counsellor and utilisation view with details-on-demand only." },
    { id: "scholarships-fellowships", label: "Scholarships and Fellowships", kpiId: "kpi_psl_scholarships", helper: "Beneficiary-first view for scholarship types, funding, and timelines." },
  ],
  "placements-alumni": [
    { id: "alumni-engagement", label: "Alumni Engagement", kpiId: "kpi_psl_alumni_engagement", helper: "Programme-frequency and participation view for alumni engagement activities." },
    { id: "alumni-network", label: "Alumni Network", kpiId: "kpi_psl_alumni_network", helper: "Member and chapter view for network coverage and engagement." },
    { id: "phd-alumni-careers", label: "PhD Alumni Career Distribution", kpiId: "kpi_psl_phd_careers", helper: "Career-path mix across academia, labs, industry, and entrepreneurship." },
    { id: "placements-and-alumni", label: "Placements and Alumni", kpiId: "kpi_psl_placements_alumni", helper: "Outcome summary view for placement, higher education, entrepreneurship, and unplaced counts." },
    { id: "placement-statistics", label: "Placement Statistics", kpiId: "kpi_psl_placement_statistics", helper: "Drill path: Program > Degree > Gender > Social Category > Student Nationality." },
    { id: "top-recruiters", label: "Top Recruiters", kpiId: "kpi_psl_top_recruiters", helper: "Top-N recruiter view with drillthrough by company." },
  ],
  "research-innovation": [
    { id: "research-and-innovation", label: "Research and Innovation", kpiId: "kpi_research_overview", helper: "Overview page for R&D expenditure, publication volume, grants, and innovation totals." },
    { id: "rnd-expenditure", label: "R&D Expenditure", kpiId: "kpi_research_budget", helper: "Budget-first view for expenditure categories, department allocation, and utilisation percentages." },
    { id: "research-grants", label: "Research Grants", kpiId: "kpi_research_budget", helper: "Grant-focused summary for agency allocations and project counts with details-on-demand only." },
    { id: "foreign-funding-grants", label: "Foreign Funding Grants", kpiId: "kpi_research_collab_drill", helper: "Drill path: Country > Funder Institution > Grant details." },
    { id: "research-infrastructure", label: "Research Infrastructure", kpiId: "kpi_research_budget", helper: "Asset and facility portfolio view; treat this as non-drill until clarified." },
    { id: "patents-details", label: "Patents Details", kpiId: "kpi_research_patents", helper: "Patent register with status mix, filing context, and filtered details only." },
  ],
  "industrial-research": [
    { id: "industrial-research-projects", label: "Industrial Research Projects", kpiId: "kpi_research_collab_drill", helper: "Drill path: Sector > Industry Partner > Project." },
    { id: "industry-research-summary", label: "Industry Research Summary", kpiId: "kpi_research_overview", helper: "Summary cards and comparison bars for industry-linked research activity." },
    { id: "phds-industry-funded", label: "PhDs Industry Funded", kpiId: "kpi_research_overview", helper: "Programme summary for industry-funded doctoral work with no hierarchy drilldown." },
    { id: "industry-centers-of-excellence", label: "Industry Centers of Excellence", kpiId: "kpi_research_collab_drill", helper: "Drill path: Industry Partner > CoE name." },
    { id: "technology-transfers", label: "Technology Transfers", kpiId: "kpi_research_collab_drill", helper: "Drill path: Technology Area > Partner." },
    { id: "industrial-research-grants", label: "Industrial Research Grants", kpiId: "kpi_research_budget_drill", helper: "Drill path: Company > Research Area." },
    { id: "faculty-consultancy", label: "Faculty Consultancy", kpiId: "kpi_research_budget_drill", helper: "Drill path: Sector > Company." },
  ],
  "research-awards-collaborations": [
    { id: "research-staff", label: "Research Staff", kpiId: "kpi_research_overview_drill", helper: "Drill path: Role > Project." },
    { id: "research-awards", label: "Research Awards", kpiId: "kpi_research_overview_drill", helper: "Drill path: Category > Agency > Faculty." },
    { id: "research-innovation-mous", label: "Research & Innovation MoUs", kpiId: "kpi_research_collab_drill", helper: "Drill path: Sector > Partner." },
    { id: "faculty-honors-fellowships", label: "Faculty Honors & Fellowships", kpiId: "kpi_research_overview_drill", helper: "Drill path: Level > Issuer > Faculty." },
    { id: "intl-research-collaborations", label: "Intl Research Collaborations", kpiId: "kpi_research_collab_drill", helper: "Drill path: Country > Project." },
  ],
  "startup-innovation-ecosystem": [
    { id: "technology-business-incubators", label: "Technology Business Incubators", kpiId: "kpi_research_collab_drill", helper: "Drill path: Sector > TBI." },
    { id: "innovation-ip-data", label: "Innovation and IP Data", kpiId: "kpi_research_patents", helper: "IP and innovation summary view with KPI cards and year comparisons." },
    { id: "startup-jobs-impact", label: "Startup Jobs & Impact", kpiId: "kpi_research_overview", helper: "Jobs, economic impact, and trend summaries without hierarchical drilldown." },
    { id: "fundraising-investment", label: "Fundraising and Investment", kpiId: "kpi_research_budget", helper: "Funding portfolio view with share-based comparisons when Percent mode is active." },
    { id: "iit-stake-in-startups", label: "IIT Stake in Startups", kpiId: "kpi_research_collab", helper: "Reference-style view for institute stake, portfolio mix, and details-on-demand." },
    { id: "startups-incubated-summary", label: "Startups Incubated Summary", kpiId: "kpi_research_overview", helper: "Incubated startup counts and trend view for the selected years." },
    { id: "ip-commercialization-revenue", label: "IP Commercialization Revenue", kpiId: "kpi_research_budget", helper: "Revenue view for licensing and commercialization outcomes." },
    { id: "hackathons-innovation", label: "Hackathons & Innovation", kpiId: "kpi_research_overview", helper: "Participation and event summary with chart-first trend view." },
  ],
  "emerging-areas": [
    { id: "climate-sustainability", label: "Climate & Sustainability", kpiId: "kpi_research_budget", helper: "Outcome and grant summary for climate-focused initiatives; keep this filter-first and non-drillable." },
    { id: "ai-ml-research", label: "AI ML Research", kpiId: "kpi_research_ai_ml_drill", helper: "Drill path: Funding Source / discipline slice > project records." },
  ],
  "collaborations-mous": [
    { id: "collaborations-details", label: "Collaborations Details", kpiId: "kpi_outreach_collab_drill", helper: "Drill path: Partner Type > Partner Name > Project." },
    { id: "collaborations-and-mous", label: "Collaborations and MoUs", kpiId: "kpi_outreach_collab", helper: "Flat portfolio view for MoU category mix with filter-only interactions." },
  ],
  internationalisation: [
    { id: "qs-the-rankings", label: "QS & THE Rankings Participation", kpiId: "kpi_outreach_rankings", helper: "Rank participation and year comparisons should stay non-drillable." },
    { id: "global-faculty-exchange", label: "Global Faculty Exchange", kpiId: "kpi_outreach_collab", helper: "Inbound and outbound exchange view with trend-style filtering." },
    { id: "international-student-recruitment", label: "International Student Recruitment", kpiId: "kpi_outreach_students", helper: "Country-level recruitment summary with filtered detail access only." },
    { id: "joint-phd-dual-degree", label: "Joint PhD & Dual Degree", kpiId: "kpi_outreach_programs", helper: "Programme reference view with university and enrolment counts, without hierarchy drilldown." },
  ],
  "global-academic-collaborations": [
    { id: "international-conferences", label: "International Conferences", kpiId: "kpi_outreach_events", helper: "Conference register with role-based grouping and details-on-demand." },
  ],
  "events-outreach": [
    { id: "community-outreach", label: "Community Outreach", kpiId: "kpi_outreach_events", helper: "Audience and feedback summary with flat filtering." },
    { id: "partnerships-outreach", label: "Partnerships & Outreach", kpiId: "kpi_outreach_collab", helper: "Participants-by-event-type view with detail drawer available on demand." },
    { id: "events-summary", label: "Events Summary", kpiId: "kpi_outreach_events", helper: "Trend-first summary for events and attendees across years." },
  ],
  "special-programs": [
    { id: "pmrf-program", label: "PMRF Program", kpiId: "kpi_outreach_programs", helper: "Programme view for PMRF-linked faculty and research areas; keep flat and table-friendly." },
    { id: "pmrf-scholar-details", label: "PMRF Scholar Details", kpiId: "kpi_outreach_programs_drill", helper: "Drill path: Year > Institute > Scholar." },
    { id: "national-missions", label: "National Missions", kpiId: "kpi_outreach_collab_drill", helper: "Drill path: Mission > Faculty." },
    { id: "social-impact-work", label: "Social Impact Work", kpiId: "kpi_outreach_events", helper: "Initiative and beneficiary summary with no hierarchy drilldown." },
  ],
  infrastructure: [
    { id: "health-facilities-summary", label: "Health Facilities Summary", kpiId: "kpi_infra_budget", helper: "Facility counts by type should stay filter-only with details available manually." },
    { id: "hostel-infrastructure", label: "Hostel Infrastructure", kpiId: "kpi_infra_budget", helper: "Hostel inventory and capacity view with no hierarchy drilldown." },
    { id: "academic-infrastructure", label: "Academic Infrastructure", kpiId: "kpi_infra_budget", helper: "Academic buildings and labs overview in a flat comparison layout." },
    { id: "digital-infrastructure", label: "Digital Infrastructure", kpiId: "kpi_infra_budget", helper: "Computing and digital services summary with KPI-first presentation." },
    { id: "sports-recreation", label: "Sports & Recreation", kpiId: "kpi_infra_budget", helper: "Facility and capacity summary with filter-only charts." },
    { id: "infrastructure-core", label: "Infrastructure", kpiId: "kpi_budget_utilisation", helper: "Vacancy and utilisation metrics should remain non-drillable summary visuals." },
    { id: "ongoing-infra-projects", label: "Ongoing Infra Projects", kpiId: "kpi_infra_budget_drill", helper: "Drill path: Department > Project." },
  ],
  "funding-financials": [
    { id: "endowment-fund", label: "Endowment Fund", kpiId: "kpi_infra_budget_drill", helper: "Drill path: Donor > Fund usage details." },
    { id: "hefa-loan-details", label: "HEFA Loan Details", kpiId: "kpi_infra_budget_drill", helper: "Drill path: Status > Loan ID." },
    { id: "internal-revenue-generation", label: "Internal Revenue Generation", kpiId: "kpi_infra_budget", helper: "Revenue source mix should stay flat, with doughnut use limited to low-cardinality views." },
    { id: "funding-and-financials", label: "Funding and Financials", kpiId: "kpi_total_budget", helper: "Top-level funding totals and year comparisons; no hierarchy drilldown." },
    { id: "industry-csr-funds", label: "Industry CSR Funds", kpiId: "kpi_infra_collab_drill", helper: "Drill path: Sector > Company." },
    { id: "foreign-funding", label: "Foreign Funding", kpiId: "kpi_infra_collab_drill", helper: "Drill path: Country > Agency." },
  ],
  "sustainability-esg": [
    { id: "waste-management-systems", label: "Waste Management Systems", kpiId: "kpi_infra_budget", helper: "Waste-type comparisons should remain non-drillable summary charts." },
    { id: "green-campus-initiatives", label: "Green Campus Initiatives", kpiId: "kpi_infra_budget", helper: "Table-first view for initiatives, status, and investment totals." },
    { id: "energy-efficiency-projects", label: "Energy Efficiency Projects", kpiId: "kpi_infra_budget", helper: "Project and savings summary with KPI-first layout and no hierarchy drilldown." },
    { id: "esg-reporting", label: "ESG Reporting", kpiId: "kpi_infra_budget", helper: "Trend view for reporting metrics such as carbon footprint and water use." },
  ],
  miscellaneous: [
    { id: "inst-achievements-awards", label: "Inst. Achievements & Awards", kpiId: "kpi_infra_collab_drill", helper: "Drill path: Year > Award." },
    { id: "media-coverage-perception", label: "Media Coverage & Perception", kpiId: "kpi_infra_collab", helper: "Line-and-KPI view for articles and sentiment; no hierarchy drilldown." },
    { id: "unique-initiatives", label: "Unique Initiatives", kpiId: "kpi_infra_collab", helper: "Flat initiative summary with table + bar combination." },
    { id: "notable-visitors-lectures", label: "Notable Visitors & Lectures", kpiId: "kpi_infra_collab", helper: "Events register with counts by year and event type, without drilldown." },
  ],
};

export const KPI_BY_ID = Object.fromEntries(KPI_DEFS.map((item) => [item.id, item]));

export function buildCompareHierarchy() {
  return DOMAIN_DEFS.map((module) => {
    const submodules = module.children.map((submodule) => {
      const worksheets = (SUBSECTION_VIEW_OPTIONS[submodule.id] ?? []).map((worksheet) => {
        const kpi = KPI_BY_ID[worksheet.kpiId];
        return {
          ...worksheet,
          moduleId: module.id,
          submoduleId: submodule.id,
          submoduleLabel: submodule.label,
          kpi,
          comparable: Boolean(kpi && ["number", "pct"].includes(kpi.format ?? "")),
          scaleEligible: Boolean(kpi && ["number", "pct"].includes(kpi.format ?? "")),
        };
      });
      return {
        ...submodule,
        moduleId: module.id,
        worksheets,
      };
    });
    return {
      ...module,
      submodules,
    };
  });
}

export const COMPARE_HIERARCHY = buildCompareHierarchy();
