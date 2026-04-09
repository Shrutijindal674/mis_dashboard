import { sumBy, groupSum, formatCompact, formatPct } from "../utils/helpers";

// ----------------------------- KPI definitions -----------------------------
export const KPI_DEFS = [
  {
    id: "kpi_inst_degree_portfolio",
    module: "Institution & Governance",
    label: "Degree Portfolio (Legacy)",
    fact: "academicPrograms",
    kind: "count_distinct",
    distinctField: "ProgramName",
    valueField: "ProgramName",
    levels: [
      { label: "Degree", field: "Degree" },
      { label: "Department / Discipline", field: "Department" },
      { label: "Mode of Delivery", field: "ModeOfDelivery" },
    ],
    format: "number",
  },
  {
    id: "kpi_governance_resolution_rate",
    module: "Institution & Governance",
    label: "Grievance Resolution Rate",
    fact: "governancePolicy",
    kind: "ratio",
    numField: "CasesResolved",
    denField: "CasesReported",
    levels: [
      { label: "Theme", field: "Theme" },
      { label: "Status", field: "Status" },
    ],
    format: "pct",
  },
  {
    id: "kpi_ranking_records",
    module: "Institution & Governance",
    label: "Ranking & Accreditation Records",
    fact: "rankingsAccreditations",
    kind: "count_distinct",
    distinctField: "RecordId",
    valueField: "RecordId",
    levels: [
      { label: "Category", field: "Category" },
      { label: "Scheme", field: "Scheme" },
      { label: "Status / Grade", field: "StatusOrGrade" },
    ],
    format: "number",
  },
  {
    id: "kpi_audit_observations",
    drillable: false,
    module: "Institution & Governance",
    label: "Audit Observations",
    fact: "auditObservations",
    kind: "count_distinct",
    distinctField: "ObservationId",
    valueField: "ObservationId",
    levels: [
      { label: "Current Status", field: "Status" },
      { label: "Audit Type", field: "AuditType" },
      { label: "Department / Unit", field: "Department" },
    ],
    format: "number",
  },
  {
    id: "kpi_legal_cases",
    drillable: false,
    module: "Institution & Governance",
    label: "Legal Cases",
    fact: "courtCases",
    kind: "count_distinct",
    distinctField: "CaseId",
    valueField: "CaseId",
    levels: [
      { label: "Current Status", field: "Status" },
      { label: "Court Name", field: "CourtName" },
      { label: "Nature of Case", field: "NatureOfCase" },
    ],
    format: "number",
  },
  {
    id: "kpi_inst_profile_mix",
    drillable: false,
    module: "Institution & Governance",
    label: "Institutional Snapshot",
    fact: "institutionalProfile",
    kind: "sum",
    valueField: "DegreeCount",
    levels: [
      { label: "Degree Category", field: "DegreeCategory" },
    ],
    format: "number",
  },
  {
    id: "kpi_inst_program_portfolio",
    drillable: true,
    module: "Institution & Governance",
    label: "Academic Programs",
    fact: "academicPrograms",
    kind: "count_distinct",
    distinctField: "ProgramName",
    valueField: "ProgramName",
    levels: [
      { label: "Degree", field: "Degree" },
      { label: "Department / Discipline", field: "Department" },
      { label: "Mode of Delivery", field: "ModeOfDelivery" },
    ],
    format: "number",
  },
  {
    id: "kpi_governance_grievance",
    drillable: false,
    module: "Institution & Governance",
    label: "Grievance Resolution Rate",
    fact: "governancePolicy",
    kind: "ratio",
    numField: "CasesResolved",
    denField: "CasesReported",
    rowFilter: (r) => r.Theme === "Anti-Ragging & Grievance",
    levels: [
      { label: "Status", field: "Status" },
      { label: "Portal Mode", field: "PortalMode" },
    ],
    format: "pct",
  },
  {
    id: "kpi_governance_iqac",
    drillable: false,
    module: "Institution & Governance",
    label: "Internal QA Mechanisms",
    fact: "governancePolicy",
    kind: "sum",
    valueField: "CasesReported",
    rowFilter: (r) => r.Theme === "Internal QA Mechanisms",
    levels: [
      { label: "Status", field: "Status" },
      { label: "Committee Type", field: "CommitteeType" },
    ],
    format: "number",
  },
  {
    id: "kpi_governance_structure",
    drillable: false,
    module: "Institution & Governance",
    label: "Institutional Governance Structure",
    fact: "governancePolicy",
    kind: "sum",
    valueField: "CasesReported",
    rowFilter: (r) => r.Theme === "Institutional Governance Structure",
    levels: [
      { label: "Status", field: "Status" },
      { label: "Committee Type", field: "CommitteeType" },
    ],
    format: "number",
  },
  {
    id: "kpi_governance_diversity",
    drillable: false,
    module: "Institution & Governance",
    label: "Diversity & Inclusion Policies",
    fact: "governancePolicy",
    kind: "sum",
    valueField: "CasesReported",
    rowFilter: (r) => r.Theme === "Diversity & Inclusion",
    levels: [
      { label: "Status", field: "Status" },
      { label: "Committee Type", field: "CommitteeType" },
    ],
    format: "number",
  },
  {
    id: "kpi_rankings_only",
    drillable: false,
    module: "Institution & Governance",
    label: "Institute Rankings",
    fact: "rankingsAccreditations",
    kind: "count_distinct",
    distinctField: "RecordId",
    valueField: "RecordId",
    rowFilter: (r) => r.Category === "Rankings",
    levels: [
      { label: "Scheme", field: "Scheme" },
      { label: "Status / Grade", field: "StatusOrGrade" },
    ],
    format: "number",
  },
  {
    id: "kpi_accreditations_only",
    drillable: false,
    module: "Institution & Governance",
    label: "Institute Accreditations",
    fact: "rankingsAccreditations",
    kind: "count_distinct",
    distinctField: "RecordId",
    valueField: "RecordId",
    rowFilter: (r) => r.Category === "Accreditations",
    levels: [
      { label: "Scheme", field: "Scheme" },
      { label: "Status / Grade", field: "StatusOrGrade" },
    ],
    format: "number",
  },
  {
    id: "kpi_quality_certs_only",
    drillable: false,
    module: "Institution & Governance",
    label: "ISO & Quality Certifications",
    fact: "rankingsAccreditations",
    kind: "count_distinct",
    distinctField: "RecordId",
    valueField: "RecordId",
    rowFilter: (r) => r.Category === "Quality Certifications",
    levels: [
      { label: "Scheme", field: "Scheme" },
      { label: "Status / Grade", field: "StatusOrGrade" },
    ],
    format: "number",
  },

  {
    id: "kpi_total_students",
    module: "People & Student Life",
    label: "Total Students",
    fact: "enrollment",
    kind: "sum",
    valueField: "Students",
    levels: [
      { label: "Program", field: "Program" },
      { label: "Discipline", field: "Discipline" },
      { label: "Gender", field: "Gender" },
      { label: "Category", field: "Category" },
    ],
    format: "number",
  },
  {
    id: "kpi_female_share",
    module: "People & Student Life",
    label: "Female Share",
    fact: "enrollment",
    kind: "share",
    numeratorFilter: (r) => r.Gender === "Female",
    denomField: "Students",
    levels: [
      { label: "Program", field: "Program" },
      { label: "Discipline", field: "Discipline" },
    ],
    format: "pct",
  },
  {
    id: "kpi_international_students",
    module: "People & Student Life",
    label: "International Students",
    fact: "intlStudents",
    kind: "sum",
    valueField: "Students",
    levels: [{ label: "Level", field: "Level" }],
    format: "number",
  },
  {
    id: "kpi_placement_rate",
    module: "People & Student Life",
    label: "Placement Rate",
    fact: "placements",
    kind: "ratio",
    numField: "Placed",
    denField: "Registered",
    levels: [{ label: "Program", field: "Program" }],
    format: "pct",
  },
  {
    id: "kpi_median_ctc",
    module: "People & Student Life",
    label: "Median CTC (LPA)",
    fact: "placements",
    kind: "avg_weighted",
    valueField: "MedianCTC_LPA",
    weightField: "Placed",
    levels: [{ label: "Program", field: "Program" }],
    format: "number",
  },
  {
    id: "kpi_psl_entrance_exam",
    drillable: false,
    module: "People & Student Life",
    label: "Entrance Exam",
    fact: "entranceExam",
    kind: "avg_weighted",
    valueField: "RankScore",
    weightField: "RecordWeight",
    levels: [
      { label: "Exam Name", field: "ExamName" },
      { label: "Reservation Category", field: "ReservationCategory" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_student_profile",
    drillable: false,
    module: "People & Student Life",
    label: "Student Profile",
    fact: "studentProfileSummary",
    kind: "sum",
    valueField: "Students",
    levels: [
      { label: "Student Segment", field: "StudentSegment" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_international_students",
    drillable: true,
    module: "People & Student Life",
    label: "International Students",
    fact: "intlStudentRecords",
    kind: "sum",
    valueField: "NumberOfStudents",
    levels: [
      { label: "Region", field: "Region" },
      { label: "Country", field: "Country" },
      { label: "Program", field: "Program" },
      { label: "Degree", field: "Degree" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_enrollment_details",
    drillable: true,
    module: "People & Student Life",
    label: "Enrollment Details",
    fact: "enrollmentDetails",
    kind: "sum",
    valueField: "Enrollment",
    levels: [
      { label: "Program", field: "Program" },
      { label: "Academic Area", field: "AcademicArea" },
      { label: "Discipline", field: "Discipline" },
      { label: "Degree", field: "Degree" },
      { label: "Gender", field: "Gender" },
      { label: "Social Category", field: "SocialCategory" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_admission_mode",
    drillable: true,
    module: "People & Student Life",
    label: "Admission Mode",
    fact: "admissionMode",
    kind: "sum",
    valueField: "StudentCount",
    levels: [
      { label: "Admission Channel", field: "AdmissionChannel" },
      { label: "Program", field: "Program" },
      { label: "Degree", field: "Degree" },
      { label: "Discipline", field: "Discipline" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_student_death_cases",
    drillable: true,
    module: "People & Student Life",
    label: "Student Death Cases",
    fact: "studentDeathCases",
    kind: "count_distinct",
    distinctField: "CaseId",
    valueField: "CaseId",
    levels: [
      { label: "Nature of Death", field: "NatureOfDeath" },
      { label: "Year of Program", field: "YearOfProgram" },
      { label: "Program", field: "Program" },
      { label: "Discipline", field: "Discipline" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_faculty_staff",
    drillable: false,
    module: "People & Student Life",
    label: "Faculty and Staff",
    fact: "facultyStaffSummary",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Workforce Bucket", field: "Bucket" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_faculty_research",
    drillable: true,
    module: "People & Student Life",
    label: "Faculty Research Engagement",
    fact: "facultyResearchEngagement",
    kind: "sum",
    valueField: "PublicationsCount",
    levels: [
      { label: "Department", field: "Department" },
      { label: "Faculty", field: "Faculty" },
      { label: "Source", field: "DataSource" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_mission_recruitment",
    drillable: false,
    module: "People & Student Life",
    label: "Mission Recruitment",
    fact: "missionRecruitment",
    kind: "sum",
    valueField: "TotalCount",
    levels: [
      { label: "Tranche", field: "Tranche" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_faculty_awards",
    drillable: true,
    module: "People & Student Life",
    label: "Faculty Awards and Recognitions",
    fact: "facultyAwards",
    kind: "count_distinct",
    distinctField: "AwardId",
    valueField: "AwardId",
    levels: [
      { label: "Award Level", field: "Level" },
      { label: "Issuing Body", field: "IssuingBody" },
      { label: "Faculty Name", field: "FacultyName" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_international_faculty",
    drillable: true,
    module: "People & Student Life",
    label: "International Faculty",
    fact: "internationalFacultyRecords",
    kind: "count_distinct",
    distinctField: "Name",
    valueField: "Name",
    levels: [
      { label: "Country", field: "Country" },
      { label: "Appointment Type", field: "AppointmentType" },
      { label: "Role Type", field: "RoleType" },
      { label: "Degree Level", field: "DegreeLevel" },
      { label: "Name", field: "Name" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_medical_staff_details",
    drillable: false,
    module: "People & Student Life",
    label: "Medical Staff Details",
    fact: "medicalStaffDetails",
    kind: "count_distinct",
    distinctField: "EmployeeId",
    valueField: "EmployeeId",
    levels: [
      { label: "Employee Role", field: "EmployeeRole" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_medical_summary",
    drillable: false,
    module: "People & Student Life",
    label: "Medical Staff Summary",
    fact: "medicalStaffSummary",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Staff Type", field: "StaffType" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_entrepreneurship",
    drillable: false,
    module: "People & Student Life",
    label: "Entrepreneurship Support",
    fact: "entrepreneurshipSupport",
    kind: "sum",
    valueField: "StudentStartups",
    levels: [
      { label: "Support Type", field: "SupportType" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_career_services",
    drillable: false,
    module: "People & Student Life",
    label: "Career Services",
    fact: "careerServices",
    kind: "sum",
    valueField: "SessionCount",
    levels: [
      { label: "Service Type", field: "ServiceType" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_counselling_services",
    drillable: false,
    module: "People & Student Life",
    label: "Counselling Services",
    fact: "counsellingServices",
    kind: "sum",
    valueField: "StudentsAvailed",
    levels: [
      { label: "Service Type", field: "ServiceType" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_scholarships",
    drillable: false,
    module: "People & Student Life",
    label: "Scholarships and Fellowships",
    fact: "scholarshipsFellowships",
    kind: "sum",
    valueField: "NumberBeneficiaries",
    levels: [
      { label: "Type Offered", field: "TypeOffered" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_alumni_engagement",
    drillable: false,
    module: "People & Student Life",
    label: "Alumni Engagement",
    fact: "alumniEngagement",
    kind: "sum",
    valueField: "ParticipationMetric",
    levels: [
      { label: "Program Name", field: "ProgramName" },
      { label: "Mode", field: "Mode" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_alumni_network",
    drillable: false,
    module: "People & Student Life",
    label: "Alumni Network",
    fact: "alumniNetwork",
    kind: "sum",
    valueField: "ActiveMembers",
    levels: [
      { label: "Chapter Region", field: "ChapterRegion" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_phd_careers",
    drillable: false,
    module: "People & Student Life",
    label: "PhD Alumni Career Distribution",
    fact: "phdAlumniCareerDistribution",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Career Path", field: "CareerPath" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_placements_alumni",
    drillable: false,
    module: "People & Student Life",
    label: "Placements and Alumni",
    fact: "placementsAndAlumni",
    kind: "sum",
    valueField: "StudentsCount",
    levels: [
      { label: "Outcome Type", field: "OutcomeType" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_placement_statistics",
    drillable: true,
    module: "People & Student Life",
    label: "Placement Statistics",
    fact: "placementStatistics",
    kind: "sum",
    valueField: "TotalPlacedCount",
    levels: [
      { label: "Program", field: "Program" },
      { label: "Degree", field: "Degree" },
      { label: "Gender", field: "Gender" },
      { label: "Social Category", field: "SocialCategory" },
      { label: "Student Nationality", field: "StudentNationality" },
    ],
    format: "number",
  },
  {
    id: "kpi_psl_top_recruiters",
    drillable: true,
    module: "People & Student Life",
    label: "Top Recruiters",
    fact: "topRecruiters",
    kind: "sum",
    valueField: "StudentsRecruited",
    levels: [
      { label: "Company", field: "Company" },
    ],
    format: "number",
  },
  {
    id: "kpi_publications",
    module: "Research & Innovation",
    label: "Publications",
    fact: "publications",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Type", field: "Type" },
      { label: "Discipline", field: "Discipline" },
    ],
    format: "number",
  },
  {
    id: "kpi_patents_granted",
    module: "Research & Innovation",
    label: "Patents Granted",
    fact: "patents",
    kind: "sum_where",
    where: (r) => r.Status === "Granted",
    valueField: "Count",
    levels: [{ label: "Status", field: "Status" }],
    format: "number",
  },
  {
    id: "kpi_research_overview",
    drillable: false,
    module: "Research & Innovation",
    label: "Research Overview",
    fact: "publications",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Type", field: "Type" },
      { label: "Discipline", field: "Discipline" },
    ],
    format: "number",
  },
  {
    id: "kpi_research_overview_drill",
    drillable: true,
    module: "Research & Innovation",
    label: "Research Register",
    fact: "publications",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Type", field: "Type" },
      { label: "Discipline", field: "Discipline" },
    ],
    format: "number",
  },
  {
    id: "kpi_research_budget",
    drillable: false,
    module: "Research & Innovation",
    label: "Research Funding",
    fact: "budget",
    kind: "sum_where",
    where: (r) => ["Research", "Capex", "Total"].includes(r.Head),
    valueField: "Allocated_Cr",
    levels: [{ label: "Budget Head", field: "Head" }],
    format: "number",
  },
  {
    id: "kpi_research_budget_drill",
    drillable: true,
    module: "Research & Innovation",
    label: "Research Funding Register",
    fact: "budget",
    kind: "sum_where",
    where: (r) => ["Research", "Capex", "Total"].includes(r.Head),
    valueField: "Allocated_Cr",
    levels: [{ label: "Budget Head", field: "Head" }],
    format: "number",
  },
  {
    id: "kpi_research_collab",
    drillable: false,
    module: "Research & Innovation",
    label: "Research Collaborations",
    fact: "collaborations",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Geography", field: "Geography" },
      { label: "Type", field: "Type" },
    ],
    format: "number",
  },
  {
    id: "kpi_research_collab_drill",
    drillable: true,
    module: "Research & Innovation",
    label: "Research Collaboration Register",
    fact: "collaborations",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Geography", field: "Geography" },
      { label: "Type", field: "Type" },
    ],
    format: "number",
  },
  {
    id: "kpi_research_patents",
    drillable: false,
    module: "Research & Innovation",
    label: "Patent Status",
    fact: "patents",
    kind: "sum",
    valueField: "Count",
    levels: [{ label: "Status", field: "Status" }],
    format: "number",
  },
  {
    id: "kpi_research_ai_ml_drill",
    drillable: true,
    module: "Research & Innovation",
    label: "AI / ML Research",
    fact: "publications",
    kind: "sum",
    valueField: "Count",
    rowFilter: (r) => ["CSE", "Math", "Bio", "Physics"].includes(r.Discipline),
    levels: [
      { label: "Discipline", field: "Discipline" },
      { label: "Type", field: "Type" },
    ],
    format: "number",
  },
  {
    id: "kpi_collaborations",
    module: "Collaborations & Outreach",
    label: "Collaborations",
    fact: "collaborations",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Geography", field: "Geography" },
      { label: "Type", field: "Type" },
    ],
    format: "number",
  },
  {
    id: "kpi_outreach_collab",
    drillable: false,
    module: "Collaborations & Outreach",
    label: "Collaboration Portfolio",
    fact: "collaborations",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Geography", field: "Geography" },
      { label: "Type", field: "Type" },
    ],
    format: "number",
  },
  {
    id: "kpi_outreach_collab_drill",
    drillable: true,
    module: "Collaborations & Outreach",
    label: "Collaboration Register",
    fact: "collaborations",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Geography", field: "Geography" },
      { label: "Type", field: "Type" },
    ],
    format: "number",
  },
  {
    id: "kpi_outreach_rankings",
    drillable: false,
    module: "Collaborations & Outreach",
    label: "International Rankings Participation",
    fact: "rankingsAccreditations",
    kind: "count_distinct",
    distinctField: "RecordId",
    valueField: "RecordId",
    rowFilter: (r) => r.Category === "Rankings",
    levels: [
      { label: "Scheme", field: "Scheme" },
      { label: "Status / Grade", field: "StatusOrGrade" },
    ],
    format: "number",
  },
  {
    id: "kpi_outreach_students",
    drillable: false,
    module: "Collaborations & Outreach",
    label: "International Students",
    fact: "intlStudents",
    kind: "sum",
    valueField: "Students",
    levels: [{ label: "Level", field: "Level" }],
    format: "number",
  },
  {
    id: "kpi_outreach_programs",
    drillable: false,
    module: "Collaborations & Outreach",
    label: "Joint Programmes",
    fact: "academicPrograms",
    kind: "count_distinct",
    distinctField: "ProgramName",
    valueField: "ProgramName",
    rowFilter: (r) => ["PhD", "MBA", "MTech"].includes(r.Degree),
    levels: [
      { label: "Degree", field: "Degree" },
      { label: "Department / Discipline", field: "Department" },
      { label: "Mode of Delivery", field: "ModeOfDelivery" },
    ],
    format: "number",
  },
  {
    id: "kpi_outreach_programs_drill",
    drillable: true,
    module: "Collaborations & Outreach",
    label: "Scholar Register",
    fact: "academicPrograms",
    kind: "count_distinct",
    distinctField: "ProgramName",
    valueField: "ProgramName",
    rowFilter: (r) => ["PhD", "MBA", "MTech"].includes(r.Degree),
    levels: [
      { label: "Degree", field: "Degree" },
      { label: "Department / Discipline", field: "Department" },
      { label: "Mode of Delivery", field: "ModeOfDelivery" },
    ],
    format: "number",
  },
  {
    id: "kpi_outreach_events",
    drillable: false,
    module: "Collaborations & Outreach",
    label: "Events & Outreach",
    fact: "collaborations",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Type", field: "Type" },
      { label: "Geography", field: "Geography" },
    ],
    format: "number",
  },
  {
    id: "kpi_total_budget",
    module: "Infrastructure & Finance",
    label: "Funding Envelope (Cr)",
    fact: "budget",
    kind: "sum_where",
    where: (r) => r.Head === "Total",
    valueField: "Allocated_Cr",
    levels: [{ label: "Head", field: "Head" }],
    format: "number",
  },
  {
    id: "kpi_budget_utilisation",
    module: "Infrastructure & Finance",
    label: "Budget Utilisation",
    fact: "budget",
    kind: "ratio",
    numField: "Utilised_Cr",
    denField: "Allocated_Cr",
    levels: [{ label: "Head", field: "Head" }],
    format: "pct",
  },
  {
    id: "kpi_infra_budget",
    drillable: false,
    module: "Infrastructure & Finance",
    label: "Infrastructure Portfolio",
    fact: "budget",
    kind: "sum",
    valueField: "Allocated_Cr",
    levels: [{ label: "Budget Head", field: "Head" }],
    format: "number",
  },
  {
    id: "kpi_infra_budget_drill",
    drillable: true,
    module: "Infrastructure & Finance",
    label: "Infrastructure Register",
    fact: "budget",
    kind: "sum",
    valueField: "Allocated_Cr",
    levels: [{ label: "Budget Head", field: "Head" }],
    format: "number",
  },
  {
    id: "kpi_infra_collab",
    drillable: false,
    module: "Infrastructure & Finance",
    label: "Institutional Activities",
    fact: "collaborations",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Geography", field: "Geography" },
      { label: "Type", field: "Type" },
    ],
    format: "number",
  },
  {
    id: "kpi_infra_collab_drill",
    drillable: true,
    module: "Infrastructure & Finance",
    label: "Activity Register",
    fact: "collaborations",
    kind: "sum",
    valueField: "Count",
    levels: [
      { label: "Geography", field: "Geography" },
      { label: "Type", field: "Type" },
    ],
    format: "number",
  },
];

// ----------------------------- KPI computation -----------------------------
export function scopeRowsForKpi(kpi, rows = []) {
  if (!kpi?.rowFilter) return rows;
  return rows.filter(kpi.rowFilter);
}

export function applyDrill(rows, drillPath, levels) {
  let out = rows;
  for (let li = 0; li < drillPath.length; li++) {
    const sel = drillPath[li];
    const field = levels[li]?.field;
    if (!field) break;
    out = out.filter((r) => (r[field] ?? "(unknown)") === sel);
  }
  return out;
}

export function kpiValue(kpi, rows) {
  rows = scopeRowsForKpi(kpi, rows);
  if (!rows || rows.length === 0) return null;

  if (kpi.kind === "sum") return sumBy(rows, kpi.valueField);
  if (kpi.kind === "sum_where") return sumBy(rows.filter(kpi.where), kpi.valueField);
  if (kpi.kind === "count_distinct") return new Set(rows.map((r) => r[kpi.distinctField || kpi.valueField]).filter(Boolean)).size;

  if (kpi.kind === "ratio") {
    const num = sumBy(rows, kpi.numField);
    const den = sumBy(rows, kpi.denField);
    if (!den) return null;
    return num / den;
  }

  if (kpi.kind === "avg_weighted") {
    let num = 0;
    let den = 0;
    for (const r of rows) {
      const w = Number(r[kpi.weightField] ?? 0);
      num += Number(r[kpi.valueField] ?? 0) * w;
      den += w;
    }
    if (!den) return null;
    return num / den;
  }

  if (kpi.kind === "share") {
    const denom = sumBy(rows, kpi.denomField);
    if (!denom) return null;
    const num = sumBy(rows.filter(kpi.numeratorFilter), kpi.denomField);
    return num / denom;
  }

  return null;
}

export function kpiBreakdown(kpi, rows, drillPath) {
  rows = scopeRowsForKpi(kpi, rows);
  const levels = kpi.levels ?? [];
  const levelIndex = drillPath.length;
  const levelField = levels[levelIndex]?.field;
  if (!levelField) return [];

  const scoped = applyDrill(rows, drillPath, levels);

  if (kpi.kind === "ratio") {
    const m = new Map();
    for (const r of scoped) {
      const key = r[levelField] ?? "(unknown)";
      const prev = m.get(key) ?? { num: 0, den: 0 };
      prev.num += Number(r[kpi.numField] ?? 0);
      prev.den += Number(r[kpi.denField] ?? 0);
      m.set(key, prev);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value: value.den ? value.num / value.den : 0 })).sort((a, b) => b.value - a.value);
  }

  if (kpi.kind === "avg_weighted") {
    const m = new Map();
    for (const r of scoped) {
      const key = r[levelField] ?? "(unknown)";
      const prev = m.get(key) ?? { num: 0, den: 0 };
      const w = Number(r[kpi.weightField] ?? 0);
      prev.num += Number(r[kpi.valueField] ?? 0) * w;
      prev.den += w;
      m.set(key, prev);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value: value.den ? value.num / value.den : 0 })).sort((a, b) => b.value - a.value);
  }

  if (kpi.kind === "share") {
    const m = new Map();
    for (const r of scoped) {
      const key = r[levelField] ?? "(unknown)";
      const prev = m.get(key) ?? { num: 0, den: 0 };
      prev.den += Number(r[kpi.denomField] ?? 0);
      if (kpi.numeratorFilter(r)) prev.num += Number(r[kpi.denomField] ?? 0);
      m.set(key, prev);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value: value.den ? value.num / value.den : 0 })).sort((a, b) => b.value - a.value);
  }

  if (kpi.kind === "count_distinct") {
    const m = new Map();
    for (const r of scoped) {
      const key = r[levelField] ?? "(unknown)";
      const prev = m.get(key) ?? new Set();
      prev.add(r[kpi.distinctField || kpi.valueField] ?? "(unknown)");
      m.set(key, prev);
    }
    return Array.from(m.entries()).map(([name, set]) => ({ name, value: set.size })).sort((a, b) => b.value - a.value);
  }

  if (kpi.kind === "sum_where") {
    return groupSum(scoped.filter(kpi.where), levelField, kpi.valueField);
  }

  return groupSum(scoped, levelField, kpi.valueField);
}

export function kpiFormat(kpi, value) {
  if (value === null || value === undefined) return "—";
  return kpi.format === "pct" ? formatPct(value) : formatCompact(value);
}
