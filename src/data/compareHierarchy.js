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
    { id: "admission-mode", label: "Admission_Mode", kpiId: "kpi_psl_admission_mode", helper: "Sheet: Admission_Mode. KPI: Student Distribution." },
    { id: "enrollment-details", label: "Enrollment_Details", kpiId: "kpi_psl_enrollment_details", helper: "Sheet: Enrollment_Details. KPI: Total Enrollment." },
    { id: "international-students", label: "International_Students", kpiId: "kpi_psl_international_students", helper: "Sheet: International_Students. KPIs: Region-wise distribution and University & Degree distribution." },
    { id: "student-profile-sheet", label: "Student_Profile_Summary", kpiId: "kpi_psl_student_profile", helper: "Sheet: Student_Profile_Summary. KPIs: Program Type, Year-wise Trend, Gender, Reservation Category." },
    { id: "student-death-cases", label: "Student_Death_Cases", kpiId: "kpi_psl_student_death_cases", helper: "Sheet: Student_Death_Cases. KPI: Student Death Cases." },
  ],
  "faculty-staff": [
    { id: "faculty-staff-summary", label: "Faculty and Staff", kpiId: "kpi_psl_faculty_staff", helper: "Summary workforce view for sanctioned, in-position, vacant, and staff buckets." },
    { id: "faculty-research-engagement", label: "Faculty Research Engagement", kpiId: "kpi_psl_faculty_research", helper: "Drill path: Department > Faculty > Source." },
    { id: "mission-recruitment", label: "Mission Recruitment", kpiId: "kpi_psl_mission_recruitment", helper: "Recruitment by tranche with derived gender / category mix kept as details-on-demand." },
    { id: "faculty-awards", label: "Faculty Awards & Recognition", kpiId: "kpi_psl_faculty_awards", helper: "Drill path: Award Level > Issuing Body > Faculty Name." },
    { id: "international-faculty", label: "International Faculty", kpiId: "kpi_psl_international_faculty", helper: "Drill path: Country > Appointment Type > Role Type > Degree Level > Name." },
  ],
  "student-support-system": [
    { id: "career-services", label: "Career_Services", kpiId: "kpi_psl_career_services", helper: "Sheet: Career_Services. KPI: Career Services." },
    { id: "counselling-services", label: "Counselling_Services", kpiId: "kpi_psl_counselling_services", helper: "Sheet: Counselling_Services. KPI: Counselling Service." },
    { id: "entrepreneurship-support", label: "Entrepreneurship_Support", kpiId: "kpi_psl_entrepreneurship", helper: "Sheet: Entrepreneurship_Support. KPI: Entrepreneurship Skills." },
    { id: "medical-staff-details", label: "Medical_Staff_Details", kpiId: "kpi_psl_medical_staff_details", helper: "Sheet: Medical_Staff_Details. KPI: Medical Team Qualifications." },
    { id: "medical-staff-summary", label: "Medical_Staff_Summary", kpiId: "kpi_psl_medical_summary", helper: "Sheet: Medical_Staff_Summary. KPIs: Medical Personnel and Working Hours." },
    { id: "scholarships-fellowships", label: "Scholarships_Fellowships", kpiId: "kpi_psl_scholarships", helper: "Sheet: Scholarships_Fellowships. KPI: Scholarships and Fellowships." },
  ],
  "placements-alumni": [
    { id: "top-recruiters", label: "Top_Recruiters", kpiId: "kpi_psl_top_recruiters", helper: "Sheet: Top_Recruiters. KPI: Top Recruiters - Region-wise." },
    { id: "alumni-network", label: "Alumni_Network", kpiId: "kpi_psl_alumni_network", helper: "Sheet: Alumni_Network. KPIs: Total Active Members, Engagement Rate, Endowment Contribution." },
  ],
  "industrial-research": [
    { id: "coe-industry", label: "CoE_Industry", kpiId: "kpi_research_overview", helper: "Sheet: CoE_Industry. KPIs: Top 5 Centers of Excellence by Funding & Projects." },
    { id: "faculty-consultancy", label: "Faculty_Consultancy", kpiId: "kpi_research_overview", helper: "Sheet: Faculty_Consultancy. KPIs: Faculty Consultancy Revenue by University → Department → Faculty; Faculty Consultancy Revenue by Region → Country." },
    { id: "industrial-grants", label: "Industrial_Grants", kpiId: "kpi_research_overview", helper: "Sheet: Industrial_Grants. KPIs: Industrial Research Grants by Continent → Country → Funding Agency; Industrial Research Grants by University → Department → Grant Title." },
    { id: "industrial-projects", label: "Industrial_Projects", kpiId: "kpi_research_overview", helper: "Sheet: Industrial_Projects. KPIs: Industrial Research Projects by University → Status → Department → Faculty; Industrial Research Projects by Continent → Country." },
    { id: "industry-research-summary", label: "Industry_Research_Summary", kpiId: "kpi_research_overview", helper: "Sheet: Industry_Research_Summary. KPIs: Industry Sponsored Projects vs Grants Received; Value of Industry Projects vs Grants vs Consultancy Revenue; CoEs, MoUs and Consultancy Activity Summary." },
    { id: "phd-industry-funded", label: "PhD_Industry_Funded", kpiId: "kpi_research_overview", helper: "Sheet: PhD_Industry_Funded. KPIs: Total PhD Scholars: Fully vs Partially Industry Funded; Industry Partners and University Partners Funding PhDs." },
    { id: "tech-transfers", label: "Tech_Transfers", kpiId: "kpi_research_overview", helper: "Sheet: Tech_Transfers. KPIs: Technology Transfers by University → Department → Faculty." },
  ],
  "research-awards-collaborations": [
    { id: "honors-fellowships", label: "Honors_Fellowships", kpiId: "kpi_research_collab_drill", helper: "Sheet: Honors_Fellowships. KPIs: Faculty Honors and Fellowships by University → Department → Faculty." },
    { id: "research-mous", label: "Research_MoUs", kpiId: "kpi_research_collab_drill", helper: "Sheet: Research_MoUs. KPIs: Research MoUs by Region → Country → State → Partnership Type → Partner Institution." },
    { id: "research-awards", label: "Research_Awards", kpiId: "kpi_research_collab_drill", helper: "Sheet: Research_Awards. KPIs: Research Awards by University → Department → Faculty." },
    { id: "intl-collaborations", label: "Intl_Collaborations", kpiId: "kpi_research_collab_drill", helper: "Sheet: Intl_Collaborations. KPIs: International Research Collaborations by Region → Country → Partner Institution." },
    { id: "research-staff", label: "Research_Staff", kpiId: "kpi_research_collab_drill", helper: "Sheet: Research_Staff. KPIs: Research Staff by University → Department → Category." },
  ],
  "research-innovation": [
    { id: "foreign-funding-grants", label: "Foreign_Funding_Grants", kpiId: "kpi_research_overview", helper: "Sheet: Foreign_Funding_Grants. KPIs: Foreign Funding Research Grants by Region → Country." },
    { id: "patents-details", label: "Patents_Details", kpiId: "kpi_research_overview", helper: "Sheet: Patents_Details. KPIs: Patents by Institute → Status → Patent Type → Department → Faculty; Patents by Region → Country → Status; Number of Patents by Patent Type; Number of Patents by Status." },
    { id: "rd-expenditure", label: "RD_Expenditure", kpiId: "kpi_research_overview", helper: "Sheet: RD_Expenditure. KPIs: R&D Expenditure and Budget Allocation Over Time." },
    { id: "research-grants", label: "Research_Grants", kpiId: "kpi_research_overview", helper: "Sheet: Research_Grants. KPIs: Research Grants: Count, Value, Average Size, Foreign Grants." },
    { id: "research-infrastructure", label: "Research_Infrastructure", kpiId: "kpi_research_overview", helper: "Sheet: Research_Infrastructure. KPIs: Top 3 Research Parks by Companies Hosted." },
    { id: "research-innovation", label: "Research_Innovation", kpiId: "kpi_research_overview", helper: "Sheet: Research_Innovation. KPIs: Patents Filed: Total → National vs International; Research Funding Breakdown by Source; Research Funding vs Expenditure (CapEx / OpEx); Patents Filed vs Granted vs Licensed vs Commercialised; Citations Overview: Total, Per Faculty, Per Paper, H-Index; Patents Commercialised vs Revenue Generated from Patents; Publications: Q1 Journals vs Conference Papers vs Books; Startups Incubated: Count, Jobs Generated, Annual Revenue; Research Staff: Associates, Project Staff, Staff-Student Ratio; Technology Transfers, Consultancy, Industry Grants and Projects; Research Awards: National, International, Young Researcher, Industry; Industry Engagement: Sectors, Outcomes/Products/Patents, CoEs; Utilised vs Sanctioned Amount (KPI)." },
  ],
  "startup-innovation-ecosystem": [
    { id: "fundraising-investment", label: "Fundraising_Investment", kpiId: "kpi_research_patents", helper: "Sheet: Fundraising_Investment. KPIs: Total Funds Raised Over Time." },
    { id: "hackathons-challenges", label: "Hackathons_Challenges", kpiId: "kpi_research_patents", helper: "Sheet: Hackathons_Challenges. KPIs: Hackathons and Innovation Challenges Conducted." },
    { id: "iit-stake-startups", label: "IIT_Stake_Startups", kpiId: "kpi_research_patents", helper: "Sheet: IIT_Stake_Startups. KPIs: IIT Stake in Startups: Count vs Portfolio Value." },
    { id: "innovation-ip-data", label: "Innovation_IP_Data", kpiId: "kpi_research_patents", helper: "Sheet: Innovation_IP_Data. KPIs: Patents Filed vs Granted." },
    { id: "ip-commercialization", label: "IP_Commercialization", kpiId: "kpi_research_patents", helper: "Sheet: IP_Commercialization. KPIs: IP Commercialization Revenue and Technologies Licensed." },
    { id: "startup-jobs-impact", label: "Startup_Jobs_Impact", kpiId: "kpi_research_patents", helper: "Sheet: Startup_Jobs_Impact. KPIs: Startup Jobs: Direct vs Indirect." },
    { id: "startups-incubated", label: "Startups_Incubated", kpiId: "kpi_research_patents", helper: "Sheet: Startups_Incubated. KPIs: Startups Incubated: Total vs Research-Based vs Women-Led." },
    { id: "tech-biz-incubators", label: "Tech_Biz_Incubators", kpiId: "kpi_research_patents", helper: "Sheet: Tech_Biz_Incubators. KPIs: Top 5 Technology Business Incubators by Startups Supported." },
  ],
  "collaborations-mous": [
    { id: "co-mous-summary", label: "CO_MoUs_Summary", kpiId: "kpi_outreach_collab", helper: "Sheet: CO_MoUs_Summary. KPIs: Industry-Sponsored Research Overview; Collaboration Partnerships Overview; Joint Academic Programs; Industry Revenue Breakdown." },
    { id: "co-collaboration-details", label: "CO_Collaboration_Details", kpiId: "kpi_outreach_collab_drill", helper: "Sheet: CO_Collaboration_Details. KPIs: Geographical Distribution, Institutional Financial Contributions, Faculty Participation, Collaboration Duration." },
  ],
  "events-outreach": [
    { id: "co-events-summary", label: "CO_Events_Summary", kpiId: "kpi_outreach_events", helper: "Sheet: CO_Events_Summary. KPIs: Engagement & Investment Activities; Innovation & Global Programs." },
    { id: "co-partnerships-outreach", label: "CO_Partnerships_Outreach", kpiId: "kpi_outreach_events", helper: "Sheet: CO_Partnerships_Outreach. KPIs: Domestic vs International Collaborations; Campus Fest Distribution; Fest Participation Analysis; Academic Events and Outreach Activities." },
  ],
  "global-academic-collaborations": [
    { id: "co-intl-conferences", label: "CO_Intl_Conferences", kpiId: "kpi_outreach_events", helper: "Sheet: CO_Intl_Conferences. KPI: Top 5 Research Conferences." },
  ],
  internationalisation: [
    { id: "co-joint-programs", label: "CO_Joint_Programs", kpiId: "kpi_outreach_programs", helper: "Sheet: CO_Joint_Programs. KPIs: Regional Breakdown of Programs; Geographic Distribution of Students." },
  ],
  "special-programs": [
    { id: "co-pmrf-program", label: "CO_PMRF_Program", kpiId: "kpi_outreach_programs", helper: "Sheet: CO_PMRF_Program. KPIs: Gender Distribution; Category-wise Distribution; Scholar Progress; Patent Portfolio; Publications; Startups." },
    { id: "co-pmrf-scholar-details", label: "CO_PMRF_Scholar_Details", kpiId: "kpi_outreach_programs_drill", helper: "Sheet: CO_PMRF_Scholar_Details. KPIs: Patents Filed; Patent Distribution; Journal Publications; Conference Publications; Citation Performance; H-Index Analysis." },
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
