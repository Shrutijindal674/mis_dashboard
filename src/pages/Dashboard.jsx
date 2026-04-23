import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildEmbedCode,
  copyToClipboard,
  downloadElementImage,
  downloadElementPdf,
  downloadElementSvg,
  downloadTableSvg,
  downloadText,
  formatCompact,
  formatPct,
  safeDelta,
  toCsv,
} from "../utils/helpers";
import {
  COMPARE_FILTER_SCHEMA,
  EVIDENCE_LINKS,
  IITs,
  MODULES,
  REPORTS_FILTER_SCHEMA,
  THEME_COLORS,
  YEARS,
  MONTHS,
} from "../constants";
import {
  ADVANCED_ITEMS,
  CHILD_BY_ID,
  DOMAIN_BY_ID,
  DOMAIN_DEFS,
} from "../data/sectionDefs";
import {
  KPI_DEFS,
  applyDrill,
  kpiBreakdown,
  kpiFormat,
  kpiValue,
  scopeRowsForKpi,
} from "../data/kpiDefs";
import {
  FACULTY_STAFF_HIERARCHY_GROUPS,
  getFacultyStaffPathwayShortLabel,
} from "../data/hierarchyMap";
import {
  FACULTY_STAFF_FIELD_LABELS,
  buildFacultyStaffRowsForPathway,
  getFacultyStaffRootValue,
} from "../data/facultyStaffSheetData";

import Select from "../components/ui/Select";
import SubKpiCarousel from "../components/ui/SubKpiCarousel";
import Drawer from "../components/ui/Drawer";
import Modal from "../components/ui/Modal";
import DataTable from "../components/ui/DataTable";
import CurtainFilter from "../components/filters/CurtainFilter";
import TrendArea from "../components/charts/TrendArea";
import BreakdownBar from "../components/charts/BreakdownBar";
import BreakdownDonut from "../components/charts/BreakdownDonut";
import BreakdownLine from "../components/charts/BreakdownLine";
import VisualToolbar from "../components/ui/VisualToolbar";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import misLandingLogo from "../../public/mis-landing-logo.png";
import ComparePage from "./ComparePage";
import ReportsHubPage, { buildTemplateForFact } from "./ReportsPage";

const IIT_HOME_LOGOS = {
  IITB: "/iitb-logo.png",
  IITD: "/iitd-logo.png",
  IITK: "/iitk-logo-home.png",
  IITKGP: "/iitkgp-logo.png",
  IITM: "/iitm-logo.png",
};

const LEGACY_COMPARE_IITS = ["IITD", "IITB", "IITKGP", "IITM", "IITK"];

function facultyStaffFieldLabel(fieldKey) {
  return FACULTY_STAFF_FIELD_LABELS[fieldKey] ?? String(fieldKey ?? "").replaceAll("_", " ");
}

function facultyStaffFieldIsNonCountMetric(fieldKey) {
  const key = String(fieldKey ?? "").trim().toLowerCase();
  return key.includes("percent") || key.includes("ratio") || key.includes("experience");
}

function blendHexColor(baseHex, targetHex, amount) {
  const normalizedBase = String(baseHex ?? "").trim();
  const normalizedTarget = String(targetHex ?? "").trim();
  const blendAmount = Math.min(1, Math.max(0, Number(amount) || 0));

  const toRgb = (hex) => {
    const clean = hex.replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    return {
      r: Number.parseInt(clean.slice(0, 2), 16),
      g: Number.parseInt(clean.slice(2, 4), 16),
      b: Number.parseInt(clean.slice(4, 6), 16),
    };
  };

  const base = toRgb(normalizedBase);
  const target = toRgb(normalizedTarget);
  if (!base || !target) return normalizedBase || normalizedTarget || "#2563eb";

  const blendChannel = (from, to) => Math.round(from + (to - from) * blendAmount);
  const toHex = (value) => value.toString(16).padStart(2, "0");

  return `#${toHex(blendChannel(base.r, target.r))}${toHex(blendChannel(base.g, target.g))}${toHex(blendChannel(base.b, target.b))}`;
}

function dedupeList(values) {
  return Array.from(new Set((values ?? []).filter(Boolean)));
}

function iconSvg(kind, active = false, tone = null) {
  const stroke = active ? "white" : tone || "#64748b";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (kind) {
    case "institution":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M3 9l9-5 9 5" />
          <path {...common} d="M5 10v7" />
          <path {...common} d="M10 10v7" />
          <path {...common} d="M14 10v7" />
          <path {...common} d="M19 10v7" />
          <path {...common} d="M3 19h18" />
        </svg>
      );
    case "people":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle {...common} cx="9.5" cy="7" r="3.5" />
          <path {...common} d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path {...common} d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "research":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle {...common} cx="11" cy="11" r="7" />
          <path {...common} d="m20 20-3.5-3.5" />
          <path {...common} d="M11 8v6" />
          <path {...common} d="M8 11h6" />
        </svg>
      );
    case "outreach":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M4 12h6" />
          <path {...common} d="M14 12h6" />
          <path {...common} d="M12 4v6" />
          <path {...common} d="M12 14v6" />
          <circle {...common} cx="12" cy="12" r="3" />
        </svg>
      );
    case "infrastructure":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M4 20V6l8-3 8 3v14" />
          <path {...common} d="M9 20v-5h6v5" />
          <path {...common} d="M9 9h.01" />
          <path {...common} d="M15 9h.01" />
          <path {...common} d="M9 12h.01" />
          <path {...common} d="M15 12h.01" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M3 10.5 12 4l9 6.5" />
          <path {...common} d="M5 9.75V20h14V9.75" />
          <path {...common} d="M10 20v-5h4v5" />
          <path {...common} d="M16.5 6.8V4.8" />
        </svg>
      );
    case "compare":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M12 3v18" />
          <path {...common} d="M6 7h12" />
          <path {...common} d="M8.5 7 6 17" />
          <path {...common} d="M15.5 7 18 17" />
          <path {...common} d="M4 17h5" />
          <path {...common} d="M15 17h5" />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            {...common}
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <path {...common} d="M14 2v6h6" />
          <path {...common} d="M8 13h8" />
          <path {...common} d="M8 17h6" />
        </svg>
      );
    case "admin":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle {...common} cx="12" cy="12" r="3" />
          <path
            {...common}
            d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .15 1.7 1.7 0 0 0-.92 1.53V21a2 2 0 0 1-4 0v-.08a1.7 1.7 0 0 0-.92-1.53A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.15-1 1.7 1.7 0 0 0-1.53-.92H2.9a2 2 0 0 1 0-4h.02a1.7 1.7 0 0 0 1.53-.92A1.7 1.7 0 0 0 4.6 7a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.15 1.7 1.7 0 0 0 .92-1.53V2.9a2 2 0 0 1 4 0v.02a1.7 1.7 0 0 0 .92 1.53A1.7 1.7 0 0 0 17 4.6a1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c0 .35.05.68.15 1 .27.56.83.92 1.45.92H21a2 2 0 0 1 0 4h-.02a1.7 1.7 0 0 0-1.53.92c-.1.32-.15.65-.15 1z"
          />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle {...common} cx="12" cy="8" r="4" />
          <path {...common} d="M4 20c1.7-3.3 4.3-5 8-5s6.3 1.7 8 5" />
        </svg>
      );
    case "theme":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            {...common}
            d="M12 3a9 9 0 1 0 9 9c0-.34-.02-.67-.06-1A7 7 0 0 1 12 3z"
          />
        </svg>
      );
    case "history":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M3 12a9 9 0 1 0 3-6.7" />
          <path {...common} d="M3 4v5h5" />
          <path {...common} d="M12 7v5l3 2" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path {...common} d="M16 17l5-5-5-5" />
          <path {...common} d="M21 12H9" />
        </svg>
      );
    case "share":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle {...common} cx="18" cy="5" r="3" />
          <circle {...common} cx="6" cy="12" r="3" />
          <circle {...common} cx="18" cy="19" r="3" />
          <path {...common} d="m8.6 13.5 6.8 4" />
          <path {...common} d="m15.4 6.5-6.8 4" />
        </svg>
      );
    case "download":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M12 3v12" />
          <path {...common} d="m7 10 5 5 5-5" />
          <path {...common} d="M4 20h16" />
        </svg>
      );
    case "fullscreen":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M8 3H3v5" />
          <path {...common} d="M16 3h5v5" />
          <path {...common} d="M21 16v5h-5" />
          <path {...common} d="M8 21H3v-5" />
        </svg>
      );
    case "details":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <rect {...common} x="4" y="5" width="16" height="14" rx="2" />
          <path {...common} d="M8 9h8" />
          <path {...common} d="M8 13h3" />
          <path {...common} d="M13 13h3" />
          <path {...common} d="M8 17h8" />
        </svg>
      );
    case "ai":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path {...common} d="M12 3l1.6 3.8L17 8.4l-3.4 1.6L12 14l-1.6-4L7 8.4l3.4-1.6L12 3Z" />
          <path {...common} d="M19 13l.9 2.1L22 16l-2.1.9L19 19l-.9-2.1L16 16l2.1-.9L19 13Z" />
          <path {...common} d="M6 14l.7 1.7L8.4 16l-1.7.7L6 18.4l-.7-1.7L3.6 16l1.7-.7L6 14Z" />
        </svg>
      );
    default:
      return (
        <div
          className="h-5 w-5 rounded-full"
          style={{ background: active ? "white" : "#94a3b8" }}
        />
      );
  }
}

function detailColumnsForFact(fact) {
  if (fact === "institutionalProfile") {
    return [
      { key: "DegreeCategory", label: "Degree Category" },
      { key: "DegreeCount", label: "Degree Count", format: formatCompact },
      { key: "AcademicUnits", label: "Academic Units" },
      { key: "NIRFOverallRank", label: "NIRF Overall Rank", format: formatCompact },
      { key: "NIRFEngineeringRank", label: "NIRF Engineering Rank", format: formatCompact },
      { key: "StatesUTsCovered", label: "States/UTs Covered", format: formatCompact },
      { key: "DirectorOffice", label: "Director Office" },
      { key: "RegistrarOffice", label: "Registrar Office" },
    ];
  }
  if (fact === "academicPrograms") {
    return [
      { key: "Degree", label: "Degree" },
      { key: "Department", label: "Department / Discipline" },
      { key: "ModeOfDelivery", label: "Mode of Delivery" },
      { key: "ProgramName", label: "Programme" },
      { key: "DurationYears", label: "Duration (Years)" },
      { key: "LaunchYear", label: "Launch Year" },
      { key: "FacultyCurrentlyTeaching", label: "Faculty Teaching", format: formatCompact },
    ];
  }
  if (fact === "governancePolicy") {
    return [
      { key: "Theme", label: "Theme" },
      { key: "Status", label: "Status" },
      { key: "CasesReported", label: "Cases Reported", format: formatCompact },
      { key: "CasesResolved", label: "Cases Resolved", format: formatCompact },
      { key: "PortalMode", label: "Portal Mode" },
      { key: "CommitteeType", label: "Committee Type" },
    ];
  }
  if (fact === "rankingsAccreditations") {
    return [
      { key: "Category", label: "Category" },
      { key: "Scheme", label: "Scheme" },
      { key: "StatusOrGrade", label: "Status / Grade" },
      { key: "Score", label: "Score", format: (value) => Number(value ?? 0).toFixed(1) },
      { key: "Year", label: "Year" },
    ];
  }
  if (fact === "auditObservations") {
    return [
      { key: "ObservationId", label: "Observation ID" },
      { key: "Status", label: "Status" },
      { key: "AuditType", label: "Audit Type" },
      { key: "Department", label: "Department / Unit" },
      { key: "FinancialImpactCr", label: "Financial Impact (Cr)", format: (value) => Number(value ?? 0).toFixed(2) },
      { key: "CorrectiveAction", label: "Corrective Action" },
    ];
  }
  if (fact === "courtCases") {
    return [
      { key: "CaseId", label: "Case ID" },
      { key: "Status", label: "Status" },
      { key: "CourtName", label: "Court Name" },
      { key: "NatureOfCase", label: "Nature of Case" },
      { key: "AgeBucket", label: "Ageing" },
      { key: "FinancialImplicationCr", label: "Financial Implication (Cr)", format: (value) => Number(value ?? 0).toFixed(2) },
      { key: "NextHearingMonth", label: "Next Hearing" },
    ];
  }
  if (fact === "placements") {
    return [
      { key: "Program", label: "Program" },
      { key: "Registered", label: "Registered", format: formatCompact },
      { key: "Placed", label: "Placed", format: formatCompact },
      { key: "PlacementRate", label: "Placement Rate", format: formatPct },
      {
        key: "MedianCTC_LPA",
        label: "Median CTC (LPA)",
        format: (value) => Number(value ?? 0).toFixed(1),
      },
    ];
  }
  if (fact === "budget") {
    return [
      { key: "Head", label: "Head" },
      {
        key: "Allocated_Cr",
        label: "Allocated (Cr)",
        format: (value) => Number(value ?? 0).toFixed(1),
      },
      {
        key: "Utilised_Cr",
        label: "Utilised (Cr)",
        format: (value) => Number(value ?? 0).toFixed(1),
      },
      { key: "Utilisation", label: "Utilisation", format: formatPct },
    ];
  }
  return null;
}

const SUBSECTION_VIEW_OPTIONS = {
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

const DEFAULT_SUBSECTION_VIEWS = Object.fromEntries(
  Object.entries(SUBSECTION_VIEW_OPTIONS).map(([key, value]) => [key, value[0].id]),
);

function resolveSubsectionKpiId(subsectionId, viewState) {
  const options = SUBSECTION_VIEW_OPTIONS[subsectionId];
  if (!options?.length) return CHILD_BY_ID[subsectionId]?.kpiId ?? KPI_DEFS[0].id;
  const selectedId = viewState?.[subsectionId] ?? options[0].id;
  return options.find((item) => item.id === selectedId)?.kpiId ?? options[0].kpiId;
}

function buildMonthlyAverage(rows, year) {
  const bucket = new Map();
  for (const row of rows) {
    const key = `${row.Year}-${row.Month}`;
    const prev = bucket.get(key) ?? { Month: row.Month, sum: 0, count: 0 };
    prev.sum += Number(row.Value ?? 0);
    prev.count += 1;
    bucket.set(key, prev);
  }
  return MONTHS.map((month) => {
    const value = bucket.get(`${year}-${month}`);
    return {
      Year: year,
      Month: month,
      Value: value && value.count ? Math.round(value.sum / value.count) : 0,
    };
  });
}

function formatDateTime(value) {
  if (!value) return "Not recorded yet";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export default function Dashboard({
  role,
  instituteId,
  facts,
  onLogout,
  onChangeInstitute,
  onSelectInstitute,
  loginMeta,
}) {
  const initialDomain = MODULES[0];
  const initialChild = DOMAIN_DEFS[0].children[0];

  const [section, setSection] = useState("Home");
  const [module, setModule] = useState(initialDomain);
  const [selectedSubsectionId, setSelectedSubsectionId] = useState(
    initialChild.id,
  );
  const [selectedKpiId, setSelectedKpiId] = useState(initialChild.kpiId);
  const [drillPath, setDrillPath] = useState([]);
  const [yearRange, setYearRange] = useState({ from: 2022, to: 2024 });
  const [kpiView, setKpiView] = useState("bar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState(
    Object.fromEntries(
      DOMAIN_DEFS.map((item) => [item.id, item.id === initialDomain]),
    ),
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [appearance, setAppearance] = useState("soft");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [valueMode, setValueMode] = useState("value");
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailFocus, setDetailFocus] = useState(null);
  const [selectedFacultyStaffHierarchyKey, setSelectedFacultyStaffHierarchyKey] = useState("vacancy-staffing");
  const [selectedFacultyStaffPathwayNo, setSelectedFacultyStaffPathwayNo] = useState(1);
  const [facultyStaffDrillCarouselOpen, setFacultyStaffDrillCarouselOpen] = useState(false);
  const [shareEmbedOpen, setShareEmbedOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterContext, setFilterContext] = useState(null);
  const [filterDraft, setFilterDraft] = useState(null);
  const [reportAutoOpenKey, setReportAutoOpenKey] = useState(0);
  const [homeSearch, setHomeSearch] = useState("");
  const [recent, setRecent] = useState([]);
  const [notice, setNotice] = useState("");
  const [lastDownloadedAt, setLastDownloadedAt] = useState(null);
  const [subsectionViews, setSubsectionViews] = useState(DEFAULT_SUBSECTION_VIEWS);

  const profileRef = useRef(null);
  const headerSearchRef = useRef(null);
  const navigationRestoringRef = useRef(false);
  const navigationReadyRef = useRef(false);
  const navigationKeyRef = useRef("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartRenderNonce, setChartRenderNonce] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900,
  );
  const kpiChartRef = useRef(null);
  const chartOnlyRef = useRef(null);
  const chartExportRef = useRef(null);
  const lastUpdated = useMemo(
    () => facts?.meta?.generatedAt ?? new Date().toISOString(),
    [facts],
  );
  const lastUpdatedLabel = formatDateTime(lastUpdated);
  const lastDownloadedLabel = formatDateTime(lastDownloadedAt);
  const activeInstituteId = instituteId && instituteId !== "__ALL__" ? instituteId : IITs[0].id;
  const currentInstitute = useMemo(() => {
    return IITs.find((item) => item.id === activeInstituteId) ?? IITs[0];
  }, [activeInstituteId]);
  const currentInstituteLogo = IIT_HOME_LOGOS[activeInstituteId] ?? null;

  const activeSectionTheme =
    THEME_COLORS[MODULES.includes(section) ? section : module] ??
    THEME_COLORS["People & Student Life"];
  const accent = activeSectionTheme.accent;
  const soft = activeSectionTheme.soft;
  const appearanceTheme = {
    soft: {
      pageBg: "linear-gradient(135deg,#f0f6ff 0%,#e8f0fb 50%,#f5f8ff 100%)",
      topBg: "rgba(255,255,255,0.92)",
    },
    light: {
      pageBg: "linear-gradient(135deg,#f8fafc 0%,#ffffff 55%,#f8fafc 100%)",
      topBg: "rgba(255,255,255,0.96)",
    },
    slate: {
      pageBg: "linear-gradient(135deg,#eef2f7 0%,#e2e8f0 50%,#f3f6fb 100%)",
      topBg: "rgba(248,250,252,0.96)",
    },
  }[appearance] ?? {
    pageBg: "linear-gradient(135deg,#f0f6ff 0%,#e8f0fb 50%,#f5f8ff 100%)",
    topBg: "rgba(255,255,255,0.92)",
  };

  useEffect(() => {
    function onDocClick(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (headerSearchRef.current && !headerSearchRef.current.contains(event.target)) {
        setHeaderSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      setProfileOpen(false);
      setSpeedDialOpen(false);
    }
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  const [compareCfg, setCompareCfg] = useState({
    MetricId: initialChild.kpiId,
    CompareModule: CHILD_BY_ID[initialChild.id]?.domainId || module,
    CompareSubmoduleId: initialChild.id,
    CompareMetricIds: dedupeList([
      initialChild.kpiId,
      ...(SUBSECTION_VIEW_OPTIONS[initialChild.id] ?? []).slice(1, 3).map((item) => item.kpiId),
    ]),
    CompareView: "grouped",
    CompareScale: "raw",
    ActiveYear: YEARS[YEARS.length - 1],
    InstituteId: [...LEGACY_COMPARE_IITS],
    YearRange: { from: YEARS[0], to: YEARS[YEARS.length - 1] },
    Normalization: "absolute",
    Sort: "latest",
    ChartCap: 8,
    CompareAutoApply: true,
    CompareRequestKey: 1,
  });

  const [reportsCfg, setReportsCfg] = useState({
    KpiIds: [],
    InstituteId: [],
    YearRange: { from: YEARS[0], to: YEARS[YEARS.length - 1] },
    MaxRows: 1000,
  });

  const activeDomain = MODULES.includes(section) ? section : module;
  const activeDomainDef = DOMAIN_BY_ID[activeDomain] ?? DOMAIN_DEFS[0];
  const subsectionCards = activeDomainDef.children;

  const headerSearchResults = useMemo(() => {
    const query = headerSearch.trim().toLowerCase();
    if (!query) return [];

    const results = [];
    for (const domain of DOMAIN_DEFS) {
      if (`${domain.id}`.toLowerCase().includes(query)) {
        results.push({
          key: `module-${domain.id}`,
          type: "module",
          label: domain.id,
          subtitle: `${domain.children.length} sub-modules`,
          domainId: domain.id,
        });
      }

      for (const subsection of domain.children) {
        const subsectionText = `${domain.id} ${subsection.label}`.toLowerCase();
        if (subsectionText.includes(query)) {
          results.push({
            key: `submodule-${subsection.id}`,
            type: "submodule",
            label: subsection.label,
            subtitle: domain.id,
            domainId: domain.id,
            subsectionId: subsection.id,
          });
        }

        for (const worksheet of SUBSECTION_VIEW_OPTIONS[subsection.id] ?? []) {
          const worksheetText = `${domain.id} ${subsection.label} ${worksheet.label} ${worksheet.helper ?? ""}`.toLowerCase();
          if (worksheetText.includes(query)) {
            results.push({
              key: `worksheet-${worksheet.id}-${subsection.id}`,
              type: "worksheet",
              label: worksheet.label,
              subtitle: `${domain.id} › ${subsection.label}`,
              domainId: domain.id,
              subsectionId: subsection.id,
              viewId: worksheet.id,
            });
          }
        }
      }
    }

    return results.slice(0, 8);
  }, [headerSearch]);

  function handleHeaderSearchSelect(result) {
    if (!result) return;
    if (result.type === "module") {
      openDomain(result.domainId);
    } else {
      openSubsection(result.domainId, result.subsectionId, result.viewId ?? null);
    }
    setHeaderSearch(result.label);
    setHeaderSearchOpen(false);
  }

  useEffect(() => {
    const child = CHILD_BY_ID[selectedSubsectionId];
    if (!child || child.domainId !== activeDomainDef.id) {
      const fallback = activeDomainDef.children[0];
      setSelectedSubsectionId(fallback.id);
      setSelectedKpiId(resolveSubsectionKpiId(fallback.id, subsectionViews));
      setDrillPath([]);
      return;
    }
    const targetKpiId = resolveSubsectionKpiId(selectedSubsectionId, subsectionViews);
    if (targetKpiId !== selectedKpiId) {
      setSelectedKpiId(targetKpiId);
      setDrillPath([]);
    }
  }, [activeDomainDef, selectedSubsectionId, selectedKpiId, subsectionViews]);

  const selectedKpi = useMemo(
    () => KPI_DEFS.find((item) => item.id === selectedKpiId) ?? KPI_DEFS[0],
    [selectedKpiId],
  );
  const currentSubsection = useMemo(
    () => CHILD_BY_ID[selectedSubsectionId] ?? CHILD_BY_ID[initialChild.id],
    [selectedSubsectionId],
  );
  const currentIgViewOptions = SUBSECTION_VIEW_OPTIONS[selectedSubsectionId] ?? [];
  const currentIgViewId = subsectionViews[selectedSubsectionId] ?? currentIgViewOptions[0]?.id;
  const currentIgViewMeta = currentIgViewOptions.find((item) => item.id === currentIgViewId) ?? null;
  const currentViewLabel = currentIgViewMeta?.label ?? currentSubsection?.label ?? selectedKpi?.label;

  const compareSeedMetricIds = useMemo(() => {
    const worksheetOptions = (currentIgViewOptions.length
      ? currentIgViewOptions
      : [{ id: selectedSubsectionId, label: currentSubsection.label, kpiId: selectedKpiId }])
      .map((item) => item.kpiId)
      .filter(Boolean);

    return dedupeList([selectedKpiId, ...worksheetOptions]).slice(0, 3);
  }, [currentIgViewOptions, currentSubsection.label, selectedKpiId, selectedSubsectionId]);

  const compareSeedInstituteIds = useMemo(() => {
    return dedupeList([
      ...LEGACY_COMPARE_IITS,
      ...(activeInstituteId && !LEGACY_COMPARE_IITS.includes(activeInstituteId) ? [activeInstituteId] : []),
    ]);
  }, [activeInstituteId]);

  function buildCompareDefaults({ autoApply = true } = {}) {
    return {
      MetricId: selectedKpiId,
      CompareModule: activeDomain,
      CompareSubmoduleId: selectedSubsectionId,
      CompareMetricIds: [...compareSeedMetricIds],
      CompareView: "grouped",
      CompareScale: "raw",
      ActiveYear: YEARS[YEARS.length - 1],
      InstituteId: [...compareSeedInstituteIds],
      YearRange: { from: YEARS[0], to: YEARS[YEARS.length - 1] },
      Normalization: "absolute",
      Sort: "latest",
      ChartCap: 8,
      CompareAutoApply: autoApply,
      CompareRequestKey: Date.now(),
    };
  }

  useEffect(() => {
    setRecent((prev) => {
      const nextMetric = {
        id: selectedKpi.id,
        label: currentIgViewMeta?.label ?? currentSubsection?.label ?? selectedKpi.label,
        module: selectedKpi.module,
      };
      return [
        nextMetric,
        ...prev.filter((item) => item.id !== nextMetric.id),
      ].slice(0, 6);
    });
  }, [
    selectedKpi.id,
    selectedKpi.label,
    selectedKpi.module,
    currentSubsection,
  ]);

  const scopedFacts = useMemo(() => {
    const matchesInstitute = (row) =>
      !activeInstituteId || row.InstituteId === activeInstituteId;
    const thisYear = (rows) =>
      rows.filter((row) => row.Year === yearRange.to && matchesInstitute(row));
    const prevYearRows = (rows) =>
      rows.filter(
        (row) => row.Year === yearRange.to - 1 && matchesInstitute(row),
      );
    const allThisYear = (rows) =>
      rows.filter((row) => row.Year === yearRange.to);
    return {
      thisIIT: {
        enrollment: thisYear(facts.enrollment),
        placements: thisYear(facts.placements),
        publications: thisYear(facts.publications),
        patents: thisYear(facts.patents),
        budget: thisYear(facts.budget),
        collaborations: thisYear(facts.collaborations),
        intlStudents: thisYear(facts.intlStudents),
        monthly: facts.monthly.filter(
          (row) => row.Year === yearRange.to && matchesInstitute(row),
        ),
        institutionalProfile: thisYear(facts.institutionalProfile ?? []),
        academicPrograms: thisYear(facts.academicPrograms ?? []),
        governancePolicy: thisYear(facts.governancePolicy ?? []),
        rankingsAccreditations: thisYear(facts.rankingsAccreditations ?? []),
        auditObservations: thisYear(facts.auditObservations ?? []),
        courtCases: thisYear(facts.courtCases ?? []),
        entranceExam: thisYear(facts.entranceExam ?? []),
        studentProfileSummary: thisYear(facts.studentProfileSummary ?? []),
        intlStudentRecords: thisYear(facts.intlStudentRecords ?? []),
        enrollmentDetails: thisYear(facts.enrollmentDetails ?? []),
        admissionMode: thisYear(facts.admissionMode ?? []),
        studentDeathCases: thisYear(facts.studentDeathCases ?? []),
        facultyStaffSummary: thisYear(facts.facultyStaffSummary ?? []),
        facultyResearchEngagement: thisYear(facts.facultyResearchEngagement ?? []),
        missionRecruitment: thisYear(facts.missionRecruitment ?? []),
        facultyAwards: thisYear(facts.facultyAwards ?? []),
        internationalFacultyRecords: thisYear(facts.internationalFacultyRecords ?? []),
        medicalStaffDetails: thisYear(facts.medicalStaffDetails ?? []),
        medicalStaffSummary: thisYear(facts.medicalStaffSummary ?? []),
        entrepreneurshipSupport: thisYear(facts.entrepreneurshipSupport ?? []),
        careerServices: thisYear(facts.careerServices ?? []),
        counsellingServices: thisYear(facts.counsellingServices ?? []),
        scholarshipsFellowships: thisYear(facts.scholarshipsFellowships ?? []),
        alumniEngagement: thisYear(facts.alumniEngagement ?? []),
        alumniNetwork: thisYear(facts.alumniNetwork ?? []),
        phdAlumniCareerDistribution: thisYear(facts.phdAlumniCareerDistribution ?? []),
        placementsAndAlumni: thisYear(facts.placementsAndAlumni ?? []),
        placementStatistics: thisYear(facts.placementStatistics ?? []),
        topRecruiters: thisYear(facts.topRecruiters ?? []),
      },
      allIITs: {
        enrollment: allThisYear(facts.enrollment),
        placements: allThisYear(facts.placements),
        publications: allThisYear(facts.publications),
        patents: allThisYear(facts.patents),
        budget: allThisYear(facts.budget),
        collaborations: allThisYear(facts.collaborations),
        intlStudents: allThisYear(facts.intlStudents),
        monthly: facts.monthly.filter((row) => row.Year === yearRange.to),
        institutionalProfile: allThisYear(facts.institutionalProfile ?? []),
        academicPrograms: allThisYear(facts.academicPrograms ?? []),
        governancePolicy: allThisYear(facts.governancePolicy ?? []),
        rankingsAccreditations: allThisYear(facts.rankingsAccreditations ?? []),
        auditObservations: allThisYear(facts.auditObservations ?? []),
        courtCases: allThisYear(facts.courtCases ?? []),
        entranceExam: allThisYear(facts.entranceExam ?? []),
        studentProfileSummary: allThisYear(facts.studentProfileSummary ?? []),
        intlStudentRecords: allThisYear(facts.intlStudentRecords ?? []),
        enrollmentDetails: allThisYear(facts.enrollmentDetails ?? []),
        admissionMode: allThisYear(facts.admissionMode ?? []),
        studentDeathCases: allThisYear(facts.studentDeathCases ?? []),
        facultyStaffSummary: allThisYear(facts.facultyStaffSummary ?? []),
        facultyResearchEngagement: allThisYear(facts.facultyResearchEngagement ?? []),
        missionRecruitment: allThisYear(facts.missionRecruitment ?? []),
        facultyAwards: allThisYear(facts.facultyAwards ?? []),
        internationalFacultyRecords: allThisYear(facts.internationalFacultyRecords ?? []),
        medicalStaffDetails: allThisYear(facts.medicalStaffDetails ?? []),
        medicalStaffSummary: allThisYear(facts.medicalStaffSummary ?? []),
        entrepreneurshipSupport: allThisYear(facts.entrepreneurshipSupport ?? []),
        careerServices: allThisYear(facts.careerServices ?? []),
        counsellingServices: allThisYear(facts.counsellingServices ?? []),
        scholarshipsFellowships: allThisYear(facts.scholarshipsFellowships ?? []),
        alumniEngagement: allThisYear(facts.alumniEngagement ?? []),
        alumniNetwork: allThisYear(facts.alumniNetwork ?? []),
        phdAlumniCareerDistribution: allThisYear(facts.phdAlumniCareerDistribution ?? []),
        placementsAndAlumni: allThisYear(facts.placementsAndAlumni ?? []),
        placementStatistics: allThisYear(facts.placementStatistics ?? []),
        topRecruiters: allThisYear(facts.topRecruiters ?? []),
      },
      prevYear: {
        thisIIT: {
          enrollment: prevYearRows(facts.enrollment),
          placements: prevYearRows(facts.placements),
          publications: prevYearRows(facts.publications),
          patents: prevYearRows(facts.patents),
          budget: prevYearRows(facts.budget),
          collaborations: prevYearRows(facts.collaborations),
          intlStudents: prevYearRows(facts.intlStudents),
          monthly: facts.monthly.filter(
            (row) => row.Year === yearRange.to - 1 && matchesInstitute(row),
          ),
          institutionalProfile: prevYearRows(facts.institutionalProfile ?? []),
          academicPrograms: prevYearRows(facts.academicPrograms ?? []),
          governancePolicy: prevYearRows(facts.governancePolicy ?? []),
          rankingsAccreditations: prevYearRows(facts.rankingsAccreditations ?? []),
          auditObservations: prevYearRows(facts.auditObservations ?? []),
          courtCases: prevYearRows(facts.courtCases ?? []),
          entranceExam: prevYearRows(facts.entranceExam ?? []),
          studentProfileSummary: prevYearRows(facts.studentProfileSummary ?? []),
          intlStudentRecords: prevYearRows(facts.intlStudentRecords ?? []),
          enrollmentDetails: prevYearRows(facts.enrollmentDetails ?? []),
          admissionMode: prevYearRows(facts.admissionMode ?? []),
          studentDeathCases: prevYearRows(facts.studentDeathCases ?? []),
          facultyStaffSummary: prevYearRows(facts.facultyStaffSummary ?? []),
          facultyResearchEngagement: prevYearRows(facts.facultyResearchEngagement ?? []),
          missionRecruitment: prevYearRows(facts.missionRecruitment ?? []),
          facultyAwards: prevYearRows(facts.facultyAwards ?? []),
          internationalFacultyRecords: prevYearRows(facts.internationalFacultyRecords ?? []),
          medicalStaffDetails: prevYearRows(facts.medicalStaffDetails ?? []),
          medicalStaffSummary: prevYearRows(facts.medicalStaffSummary ?? []),
          entrepreneurshipSupport: prevYearRows(facts.entrepreneurshipSupport ?? []),
          careerServices: prevYearRows(facts.careerServices ?? []),
          counsellingServices: prevYearRows(facts.counsellingServices ?? []),
          scholarshipsFellowships: prevYearRows(facts.scholarshipsFellowships ?? []),
          alumniEngagement: prevYearRows(facts.alumniEngagement ?? []),
          alumniNetwork: prevYearRows(facts.alumniNetwork ?? []),
          phdAlumniCareerDistribution: prevYearRows(facts.phdAlumniCareerDistribution ?? []),
          placementsAndAlumni: prevYearRows(facts.placementsAndAlumni ?? []),
          placementStatistics: prevYearRows(facts.placementStatistics ?? []),
          topRecruiters: prevYearRows(facts.topRecruiters ?? []),
        },
      },
    };
  }, [facts, activeInstituteId, yearRange.to]);

  const nationalMonthly = useMemo(
    () => buildMonthlyAverage(scopedFacts.allIITs.monthly, yearRange.to),
    [scopedFacts, yearRange.to],
  );
  const currentMonthly = useMemo(
    () => buildMonthlyAverage(scopedFacts.thisIIT.monthly, yearRange.to),
    [scopedFacts, yearRange.to],
  );

  const breakdown = useMemo(() => {
    const rows = scopedFacts.thisIIT[selectedKpi.fact] ?? [];
    return kpiBreakdown(selectedKpi, rows, drillPath).slice(0, 14);
  }, [scopedFacts, selectedKpi, drillPath]);

  const displayBreakdown = useMemo(() => {
    if (valueMode !== "percent" || selectedKpi.format === "pct")
      return breakdown;
    const total =
      breakdown.reduce((sum, item) => sum + Number(item.value ?? 0), 0) || 1;
    return breakdown.map((item) => ({
      ...item,
      value: Number(item.value ?? 0) / total,
    }));
  }, [breakdown, valueMode, selectedKpi.format]);

  const isFacultyStaffHierarchyView =
    selectedSubsectionId === "faculty-staff" &&
    selectedKpiId === "kpi_psl_faculty_staff";

  const allFacultyStaffMappedPathways = useMemo(
    () => FACULTY_STAFF_HIERARCHY_GROUPS.flatMap((group) =>
      group.pathways.map((pathway) => ({
        ...pathway,
        hierarchyKey: group.key,
        hierarchyLabel: group.label,
        hierarchyShortLabel: group.shortLabel,
        hierarchyColor: group.color,
        hierarchyBg: group.bg,
      })),
    ),
    [],
  );

  const selectedFacultyStaffCarouselId = `faculty-staff-pathway-${selectedFacultyStaffPathwayNo}`;

  const activeFacultyStaffHierarchy = useMemo(() => {
    return (
      FACULTY_STAFF_HIERARCHY_GROUPS.find(
        (group) => group.key === selectedFacultyStaffHierarchyKey,
      ) ?? FACULTY_STAFF_HIERARCHY_GROUPS[0]
    );
  }, [selectedFacultyStaffHierarchyKey]);

  const facultyStaffPathways = isFacultyStaffHierarchyView
    ? allFacultyStaffMappedPathways
    : [];

  const activeFacultyStaffPathway = useMemo(() => {
    if (!isFacultyStaffHierarchyView || !facultyStaffPathways.length) return null;
    return (
      facultyStaffPathways.find(
        (pathway) => Number(pathway.pathwayNo) === Number(selectedFacultyStaffPathwayNo),
      ) ?? facultyStaffPathways[0]
    );
  }, [isFacultyStaffHierarchyView, facultyStaffPathways, selectedFacultyStaffPathwayNo]);

  useEffect(() => {
    if (!isFacultyStaffHierarchyView || !activeFacultyStaffPathway) return;
    setSelectedFacultyStaffHierarchyKey(activeFacultyStaffPathway.hierarchyKey ?? "workforce-composition");
  }, [isFacultyStaffHierarchyView, activeFacultyStaffPathway]);

  useEffect(() => {
    if (!isFacultyStaffHierarchyView) {
      setFacultyStaffDrillCarouselOpen(false);
    }
  }, [isFacultyStaffHierarchyView]);

  const facultyStaffRawRowsByPathway = useMemo(() => {
    if (!isFacultyStaffHierarchyView) return {};
    const out = {};
    for (const group of FACULTY_STAFF_HIERARCHY_GROUPS) {
      for (const pathway of group.pathways) {
        const rows = buildFacultyStaffRowsForPathway(pathway)
          .filter(
            (row) =>
              row.InstituteId === activeInstituteId &&
              Number(row.Year ?? 0) === Number(yearRange.to),
          )
          .map((row) => ({
            name: row.Breakdown ?? "Not available",
            value: Number(row.Value ?? 0),
            rawValue: Number(row.Value ?? 0),
            fieldKey: row.FieldKey,
            isPercentField: Boolean(row.IsPercentField),
            pathwayNo: pathway.pathwayNo,
            metricKey: pathway.metricKey,
            breadcrumb: row.Breadcrumb,
          }));
        out[pathway.pathwayNo] = rows;
      }
    }
    return out;
  }, [isFacultyStaffHierarchyView, activeInstituteId, yearRange.to]);

  const facultyStaffDisplayRowsByPathway = useMemo(() => {
    if (!isFacultyStaffHierarchyView) return {};
    const out = {};
    for (const [pathwayNo, rows] of Object.entries(facultyStaffRawRowsByPathway)) {
      if (valueMode !== "percent") {
        out[pathwayNo] = rows;
        continue;
      }
      const countRows = rows.filter((item) => !item.isPercentField);
      const total = countRows.reduce((sum, item) => sum + Number(item.value ?? 0), 0) || 1;
      out[pathwayNo] = rows.map((item) => ({
        ...item,
        value: item.isPercentField ? Number(item.rawValue ?? 0) / 100 : Number(item.rawValue ?? 0) / total,
      }));
    }
    return out;
  }, [isFacultyStaffHierarchyView, facultyStaffRawRowsByPathway, valueMode]);

  const facultyStaffRootValues = useMemo(() => {
    if (!isFacultyStaffHierarchyView) return {};
    const allPathways = FACULTY_STAFF_HIERARCHY_GROUPS.flatMap((group) => group.pathways);
    return Object.fromEntries(
      allPathways.map((pathway) => [
        pathway.pathwayNo,
        getFacultyStaffRootValue(pathway, activeInstituteId, yearRange.to),
      ]),
    );
  }, [isFacultyStaffHierarchyView, activeInstituteId, yearRange.to]);

  const facultyStaffDisplayBreakdown = activeFacultyStaffPathway
    ? facultyStaffDisplayRowsByPathway[activeFacultyStaffPathway.pathwayNo] ?? []
    : [];

  const facultyStaffChartBreakdown = facultyStaffDisplayBreakdown;

  const visibleBreakdown = isFacultyStaffHierarchyView
    ? facultyStaffDisplayBreakdown
    : displayBreakdown;

  const visibleChartBreakdown = isFacultyStaffHierarchyView
    ? facultyStaffChartBreakdown
    : displayBreakdown;

  const trendSeries = useMemo(() => {
    const years = YEARS.filter(
      (year) => year >= yearRange.from && year <= yearRange.to,
    );

    if (isFacultyStaffHierarchyView && activeFacultyStaffPathway) {
      const allRows = buildFacultyStaffRowsForPathway(activeFacultyStaffPathway);
      return years.map((year) => {
        const rows = allRows.filter(
          (row) =>
            row.InstituteId === activeInstituteId &&
            Number(row.Year ?? 0) === Number(year),
        );
        return {
          name: String(year),
          value: rows.reduce((sum, row) => sum + Number(row.Value ?? 0), 0),
        };
      });
    }

    return years.map((year) => {
      let rows = facts?.[selectedKpi.fact] ?? [];
      rows = scopeRowsForKpi(selectedKpi, rows);
      rows = rows.filter((row) => Number(row.Year ?? 0) === Number(year));
      if (activeInstituteId) {
        rows = rows.filter((row) => row.InstituteId === activeInstituteId);
      }
      return {
        name: String(year),
        value: kpiValue(selectedKpi, rows) ?? 0,
      };
    });
  }, [facts, selectedKpi, activeInstituteId, yearRange, isFacultyStaffHierarchyView, activeFacultyStaffPathway]);

  const noFurtherDrill =
    drillPath.length >= ((selectedKpi.levels?.length ?? 1) - 1);

  const headline = useMemo(() => {
    const rows = scopeRowsForKpi(selectedKpi, scopedFacts.thisIIT[selectedKpi.fact] ?? []);
    const prev = scopeRowsForKpi(selectedKpi, scopedFacts.prevYear.thisIIT[selectedKpi.fact] ?? []);
    const national = scopeRowsForKpi(selectedKpi, scopedFacts.allIITs[selectedKpi.fact] ?? []);
    const value = kpiValue(selectedKpi, rows);
    const prevValue = kpiValue(selectedKpi, prev);
    const nationalValue = kpiValue(selectedKpi, national);
    return {
      value,
      prev: prevValue,
      delta:
        value == null || prevValue == null ? null : safeDelta(value, prevValue),
      national: nationalValue,
    };
  }, [scopedFacts, selectedKpi]);

  const homeSnapshot = useMemo(() => {
    const studentRows = scopedFacts.thisIIT.studentProfileSummary ?? [];
    const facultyRows = scopedFacts.thisIIT.facultyStaffSummary ?? [];
    const profileRows = scopedFacts.thisIIT.institutionalProfile ?? [];
    const programRows = scopedFacts.thisIIT.academicPrograms ?? [];
    const publicationRows = scopedFacts.thisIIT.publications ?? [];
    const patentRows = scopedFacts.thisIIT.patents ?? [];
    const budgetRows = scopedFacts.thisIIT.budget ?? [];
    const collaborationRows = scopedFacts.thisIIT.collaborations ?? [];

    const sumStudents = (segment) =>
      studentRows
        .filter((row) => row.StudentSegment === segment)
        .reduce((sum, row) => sum + Number(row.Students ?? 0), 0);

    const pickFaculty = (bucket) =>
      facultyRows.find((row) => row.Bucket === bucket)?.Count ?? null;

    const rankValues = (field) =>
      profileRows
        .map((row) => Number(row[field]))
        .filter((value) => Number.isFinite(value));

    const researchFundingRow = budgetRows.find((row) => row.Head === "Research") ?? null;

    return {
      ugStudents: sumStudents("UG Enrolled"),
      pgStudents: sumStudents("PG Enrolled"),
      phdStudents: sumStudents("PhD Enrolled"),
      internationalStudents: sumStudents("International Students"),
      facultyInPosition: pickFaculty("In Position") ?? pickFaculty("Total Faculty Strength"),
      programmeCount: new Set(programRows.map((row) => row.ProgramName)).size,
      nirfOverallRank: rankValues("NIRFOverallRank").length ? Math.min(...rankValues("NIRFOverallRank")) : null,
      nirfEngineeringRank: rankValues("NIRFEngineeringRank").length ? Math.min(...rankValues("NIRFEngineeringRank")) : null,
      publications: publicationRows.reduce((sum, row) => sum + Number(row.Count ?? 0), 0),
      patents: patentRows.reduce((sum, row) => sum + Number(row.Count ?? 0), 0),
      researchFundingCr: Number(researchFundingRow?.Allocated_Cr ?? 0),
      collaborations: collaborationRows.reduce((sum, row) => sum + Number(row.Count ?? 0), 0),
    };
  }, [scopedFacts]);

  const homeModuleCards = useMemo(
    () => [
      {
        id: "ug",
        value: homeSnapshot.ugStudents,
        label: "UG students",
        note: "Student Profile",
        color: "#1d4ed8",
        onClick: () => openSubsection("People & Student Life", "student-profile", "student-profile-sheet"),
      },
      {
        id: "pg",
        value: homeSnapshot.pgStudents,
        label: "PG students",
        note: "Student Profile",
        color: "#ec4899",
        onClick: () => openSubsection("People & Student Life", "student-profile", "student-profile-sheet"),
      },
      {
        id: "phd",
        value: homeSnapshot.phdStudents,
        label: "PhD students",
        note: "Student Profile",
        color: "#f97316",
        onClick: () => openSubsection("People & Student Life", "student-profile", "student-profile-sheet"),
      },
      {
        id: "faculty",
        value: homeSnapshot.facultyInPosition,
        label: "Faculty in position",
        note: "Faculty & Staff",
        color: "#7c3aed",
        onClick: () => openSubsection("People & Student Life", "faculty-staff", "faculty-staff-summary"),
      },
      {
        id: "intl",
        value: homeSnapshot.internationalStudents,
        label: "International students",
        note: "International Students",
        color: "#16a34a",
        onClick: () => openSubsection("People & Student Life", "student-profile", "international-students"),
      },
      {
        id: "programmes",
        value: homeSnapshot.programmeCount,
        label: "Programmes",
        note: "Academic Programs",
        color: "#eab308",
        onClick: () => openSubsection("Institution & Governance", "institutional-profile", "programs"),
      },
    ],
    [homeSnapshot],
  );

  const homeReportCards = useMemo(
    () => [
      {
        id: "nirf-overall",
        label: "NIRF overall",
        value: homeSnapshot.nirfOverallRank != null ? `#${homeSnapshot.nirfOverallRank}` : "—",
        note: "Rankings report",
        color: "#2563eb",
        kpiId: "kpi_rankings_only",
      },
      {
        id: "nirf-engineering",
        label: "Engineering",
        value: homeSnapshot.nirfEngineeringRank != null ? `#${homeSnapshot.nirfEngineeringRank}` : "—",
        note: "Rankings report",
        color: "#7c3aed",
        kpiId: "kpi_rankings_only",
      },
      {
        id: "publications",
        label: "Publications",
        value: formatCompact(homeSnapshot.publications),
        note: `${yearRange.to}`,
        color: "#0f766e",
        kpiId: "kpi_publications",
      },
      {
        id: "research-funding",
        label: "Research funding",
        value: homeSnapshot.researchFundingCr ? `₹${formatCompact(homeSnapshot.researchFundingCr)} Cr` : "—",
        note: `${yearRange.to}`,
        color: "#ea580c",
        kpiId: "kpi_research_budget",
      },
      {
        id: "patents",
        label: "Patents",
        value: formatCompact(homeSnapshot.patents),
        note: `${yearRange.to}`,
        color: "#dc2626",
        kpiId: "kpi_research_patents",
      },
      {
        id: "collaborations",
        label: "Collaborations",
        value: formatCompact(homeSnapshot.collaborations),
        note: `${yearRange.to}`,
        color: "#ca8a04",
        kpiId: "kpi_collaborations",
      },
    ],
    [homeSnapshot, yearRange.to],
  );

  const openReportsForKpis = (kpiIds, focusKpiId = null) => {
    const nextIds = kpiIds?.length ? Array.from(new Set(kpiIds)) : [];
    setReportsCfg((prev) => ({
      ...prev,
      KpiIds: nextIds,
      InstituteId:
        role === "iit"
          ? [activeInstituteId || IITs[0].id]
          : prev.InstituteId?.length
            ? prev.InstituteId
            : [activeInstituteId || IITs[0].id],
      YearRange: { from: yearRange.from, to: yearRange.to },
    }));
    if (focusKpiId) setSelectedKpiId(focusKpiId);
    setReportAutoOpenKey((value) => value + 1);
    setSection("Reports");
  };

  const dashboardInterpretation = useMemo(() => {
    if (!breakdown.length) return "Select a metric to analyse.";
    const top = breakdown[0];
    const next = breakdown[1];
    const parts = [
      `${currentViewLabel} is open for ${currentInstitute.name} for ${yearRange.from}–${yearRange.to}.`,
      top
        ? `${top.name} is the strongest visible contributor at ${selectedKpi.format === "pct" ? formatPct(top.value) : formatCompact(top.value)}.`
        : null,
      next
        ? `${next.name} follows next, so the distribution is not concentrated in a single bucket.`
        : null,
      headline.delta != null
        ? `Compared with the previous year, the overall figure is ${headline.delta >= 0 ? "moving up" : "moving down"}.`
        : null,
      `Use the chart or the detail drawer to drill deeper into this section.`,
    ].filter(Boolean);
    return parts.join(" ");
  }, [
    breakdown,
    currentInstitute.name,
    currentViewLabel,
    yearRange,
    selectedKpi.format,
    headline.delta,
  ]);

  const currentBreakdownField =
    selectedKpi.levels?.[drillPath.length]?.field ?? null;
  const currentBreakdownLabel =
    selectedKpi.levels?.[drillPath.length]?.label ?? "Breakdown";

  const detailTable = useMemo(() => {
    if (isFacultyStaffHierarchyView && activeFacultyStaffPathway) {
      let scoped = buildFacultyStaffRowsForPathway(activeFacultyStaffPathway).filter(
        (row) =>
          row.InstituteId === activeInstituteId &&
          Number(row.Year ?? 0) === Number(yearRange.to),
      );
      if (detailFocus?.field === "Breakdown") {
        scoped = scoped.filter((row) => String(row.Breakdown ?? "") === String(detailFocus.value));
      }
      return {
        columns: [
          { key: "Year", label: "Year" },
          { key: "RootLabel", label: "Total node" },
          { key: "RootValue", label: "Total value", format: formatCompact },
          { key: "Breakdown", label: "Part node" },
          { key: "Value", label: activeFacultyStaffPathway.valueLabel, format: formatCompact },
          { key: "Breadcrumb", label: "Breadcrumb" },
        ],
        rows: scoped.slice(0, 250),
      };
    }

    const rows = scopeRowsForKpi(selectedKpi, scopedFacts.thisIIT[selectedKpi.fact] ?? []);
    let scoped = applyDrill(rows, drillPath, selectedKpi.levels ?? []);
    if (detailFocus?.field) {
      scoped = scoped.filter(
        (row) => String(row[detailFocus.field] ?? "(unknown)") === String(detailFocus.value),
      );
    }
    const specific = detailColumnsForFact(selectedKpi.fact);
    if (specific) {
      const transformed =
        selectedKpi.fact === "placements"
          ? scoped.map((row) => ({
              ...row,
              PlacementRate: row.Registered ? row.Placed / row.Registered : 0,
            }))
          : selectedKpi.fact === "budget"
            ? scoped.map((row) => ({
                ...row,
                Utilisation: row.Allocated_Cr
                  ? row.Utilised_Cr / row.Allocated_Cr
                  : 0,
              }))
            : scoped;
      return { columns: specific, rows: transformed.slice(0, 250) };
    }
    const sample = scoped[0] ?? {};
    const columns = Object.keys(sample)
      .filter((key) => !["InstituteId", "Institute"].includes(key))
      .slice(0, 10)
      .map((key) => ({ key, label: key }));
    return { columns, rows: scoped.slice(0, 250) };
  }, [
    scopedFacts,
    selectedKpi,
    drillPath,
    detailFocus,
    isFacultyStaffHierarchyView,
    activeFacultyStaffPathway,
    activeInstituteId,
    yearRange.to,
  ]);
  const rootBreakdownLabel =
    selectedKpi.levels?.[0]?.label ?? currentBreakdownLabel;
  const displayBaseBreakdownLabel =
    String(rootBreakdownLabel || "").trim().toLowerCase() === "category"
      ? null
      : rootBreakdownLabel;
  const currentValueLabel =
    valueMode === "percent" && selectedKpi.format !== "pct"
      ? `${currentViewLabel}`
      : currentViewLabel;
  const activeFacultyStaffPathwayLabel = isFacultyStaffHierarchyView
    ? getFacultyStaffPathwayShortLabel(activeFacultyStaffPathway)
    : null;

  const facultyStaffBreadcrumbPath = isFacultyStaffHierarchyView
    ? [currentSubsection.label, currentViewLabel, activeFacultyStaffPathwayLabel].filter(Boolean)
    : [];

  const facultyStaffValueAxisLabel = isFacultyStaffHierarchyView
    ? valueMode === "percent"
      ? "Share"
      : (activeFacultyStaffPathway?.children ?? []).some(facultyStaffFieldIsNonCountMetric)
        ? "Metric value"
        : "Total number"
    : currentValueLabel;

  const visibleCurrentBreakdownLabel = isFacultyStaffHierarchyView
    ? activeFacultyStaffPathwayLabel ?? "Breakdown"
    : currentBreakdownLabel;

  const visibleCurrentValueLabel = isFacultyStaffHierarchyView
    ? facultyStaffValueAxisLabel
    : currentValueLabel;

  const visibleBaseBreakdownLabel = isFacultyStaffHierarchyView
    ? activeDomain
    : displayBaseBreakdownLabel;

  const chartDrillHint =
    kpiView !== "bar" && kpiView !== "donut"
      ? ""
      : isFacultyStaffHierarchyView
        ? ""
        : selectedKpi.drillable && !noFurtherDrill
          ? "Click to drill down."
          : "";

  // Added for SVG download  // Added for SVG download Chart with Title and breadcrumbs
  const breadcrumbText = useMemo(() => {
    if (isFacultyStaffHierarchyView) {
      return [activeDomain, ...facultyStaffBreadcrumbPath].filter(Boolean).join(" > ");
    }
    return [displayBaseBreakdownLabel, ...drillPath].filter(Boolean).join(" > ");
  }, [activeDomain, displayBaseBreakdownLabel, drillPath, isFacultyStaffHierarchyView, facultyStaffBreadcrumbPath]);

  useEffect(() => {
    if (!visualToolbarItems.some((item) => item.id === kpiView)) {
      setKpiView("bar");
    }
  }, [kpiView]);

  function popDrillTo(depth) {
    setDetailFocus(null);
    setDrillPath((prev) => prev.slice(0, depth));
  }

  function openDomain(domainId) {
    setSection(domainId);
    setModule(domainId);
    setExpandedDomains(Object.fromEntries(DOMAIN_DEFS.map((item) => [item.id, item.id === domainId])));
    setDetailFocus(null);
    const fallback = DOMAIN_BY_ID[domainId]?.children?.[0];
    if (fallback) {
      setSelectedSubsectionId(fallback.id);
      setSelectedKpiId(resolveSubsectionKpiId(fallback.id, subsectionViews));
      setDrillPath([]);
      setKpiView("bar");
    }
  }

  function openSubsection(domainId, subsectionId, viewId = null) {
    const nextViews =
      viewId && (SUBSECTION_VIEW_OPTIONS[subsectionId] ?? []).length
        ? { ...subsectionViews, [subsectionId]: viewId }
        : subsectionViews;
    if (viewId && (SUBSECTION_VIEW_OPTIONS[subsectionId] ?? []).length) {
      setSubsectionViews((prev) => ({ ...prev, [subsectionId]: viewId }));
    }
    setSection(domainId);
    setModule(domainId);
    setExpandedDomains(Object.fromEntries(DOMAIN_DEFS.map((item) => [item.id, item.id === domainId])));
    setSelectedSubsectionId(subsectionId);
    setSelectedKpiId(resolveSubsectionKpiId(subsectionId, nextViews));
    setDrillPath([]);
    setDetailFocus(null);
    setKpiView("bar");
    setSpeedDialOpen(false);
  }

  function handleSubviewChange(subsectionId, nextViewId) {
    setSubsectionViews((prev) => {
      const next = { ...prev, [subsectionId]: nextViewId };
      setSelectedKpiId(resolveSubsectionKpiId(subsectionId, next));
      return next;
    });
    setDrillPath([]);
    setDetailFocus(null);
    setKpiView("bar");
  }

  function toggleDomain(domainId) {
    setExpandedDomains((prev) => {
      const willOpen = !prev[domainId];
      return Object.fromEntries(DOMAIN_DEFS.map((item) => [item.id, willOpen && item.id === domainId]));
    });
  }

  function openFilterFor(ctx) {
    setFilterContext(ctx);
    if (ctx === "compare") {
      setFilterDraft({
        ...compareCfg,
        YearRange: { ...compareCfg.YearRange },
        InstituteId: [...(compareCfg.InstituteId ?? [])],
      });
    }
    if (ctx === "reports") {
      setFilterDraft({
        ...reportsCfg,
        YearRange: { ...reportsCfg.YearRange },
        InstituteId: [...(reportsCfg.InstituteId ?? [])],
      });
    }
    setFilterOpen(true);
  }

  function setFocusedSelection(name, nextLabel = currentBreakdownLabel, nextField = currentBreakdownField) {
    if (!nextField) {
      setDetailFocus(null);
      return;
    }
    setDetailFocus({
      field: nextField,
      label: nextLabel,
      value: name,
    });
  }

  function openFocusedDetails(name) {
    setFocusedSelection(name);
    setDetailsOpen(true);
  }

  function selectFacultyStaffBreakdown(name) {
    setDetailFocus({
      field: "Breakdown",
      value: name,
      label: activeFacultyStaffPathwayLabel ?? "Part node",
    });
    setNotice(`${name} selected. Use Details to view the worksheet-derived records.`);
  }

  function onFacultyStaffChartDrill(name) {
    selectFacultyStaffBreakdown(name);
  }

  function onDrillNext(name) {
    if (isFacultyStaffHierarchyView) {
      selectFacultyStaffBreakdown(name);
      return;
    }

    const lastIndex = (selectedKpi.levels?.length ?? 1) - 1;
    if (!selectedKpi.drillable) {
      setFocusedSelection(name);
      setNotice(`Selection applied for ${name}. Use Details to open the filtered records.`);
      return;
    }
    if (drillPath.length >= lastIndex) {
      setFocusedSelection(name);
      setNotice(`Last drill level reached for ${name}. Use Details to view the filtered records.`);
      return;
    }
    setDetailFocus(null);
    setDrillPath((prev) => [...prev, name]);
  }

  function markDownloaded(message, timestamp = new Date().toISOString()) {
    setLastDownloadedAt(timestamp);
    setNotice(message);
  }

  function handleFullscreen() {
    setIsFullscreen((value) => !value);
    setSpeedDialOpen(false);
    setChartRenderNonce((value) => value + 1);
    window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    window.setTimeout(() => window.dispatchEvent(new Event("resize")), 80);
  }

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      if (kpiChartRef.current) kpiChartRef.current.scrollTop = 0;
      if (chartOnlyRef.current) chartOnlyRef.current.scrollTop = 0;
      window.dispatchEvent(new Event("resize"));
      window.setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [kpiView, isFullscreen, chartRenderNonce, valueMode, selectedKpiId, drillPath.join("|"), section]);

  async function handleShare() {
    const message = `IITMIS Dashboard — ${currentViewLabel}\n${currentInstitute.name} • ${yearRange.to}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "IITMIS Dashboard",
          text: message,
          url: window.location.href,
        });
        setNotice("Shared.");
        return;
      } catch {
        // fall through to clipboard
      }
    }
    const ok = await copyToClipboard(`${message}\n${window.location.href}`);
    setNotice(ok ? "Link copied." : "Share failed.");
  }

  async function handleDownload() {
    const downloadStamp = new Date().toISOString();
    const exportMeta = {
      title: currentViewLabel,
      breadcrumb: breadcrumbText,
      subtitle: `${yearRange.from}–${yearRange.to} · ${currentInstitute.name}`,
      lastUpdatedAt: lastUpdated,
      lastDownloadedAt: downloadStamp,
    };

    if (kpiView === "table") {
      const tableColumns = [
        { key: "name", label: visibleCurrentBreakdownLabel },
        {
          key: "value",
          label: visibleCurrentValueLabel,
          format: (value) =>
            valueMode === "percent" && selectedKpi.format !== "pct"
              ? formatPct(value)
              : selectedKpi.format === "pct"
                ? formatPct(value)
                : formatCompact(value),
        },
      ];
      downloadTableSvg(
        `${selectedKpi.id}_${yearRange.to}.svg`,
        tableColumns,
        visibleBreakdown,
        exportMeta,
      );
      markDownloaded("SVG downloaded.", downloadStamp);
      return;
    }

    await downloadElementSvg(
      chartOnlyRef.current || chartExportRef.current || kpiChartRef.current,
      `${selectedKpi.id}_${yearRange.to}.svg`,
      exportMeta,
    );
    markDownloaded("SVG downloaded.", downloadStamp);
  }

  const speedDialItems = [
    {
      id: "share",
      label: "Share / Embed",
      icon: "share",
      action: handleShare,
    },
    {
      id: "download",
      label: "Download SVG",
      icon: "download",
      action: handleDownload,
    },
    {
      id: "compare",
      label: "Compare",
      icon: "compare",
      action: () => {
        setSpeedDialOpen(false);
        if (isFullscreen) setIsFullscreen(false);
        setCompareCfg(buildCompareDefaults({ autoApply: true }));
        setSection("Compare");
      },
    },
    {
      id: "raw-data",
      label: "Details",
      icon: "details",
      action: () => {
        setSpeedDialOpen(false);
        if (isFullscreen) {
          setIsFullscreen(false);
          window.setTimeout(() => setDetailsOpen(true), 120);
          return;
        }
        setDetailsOpen(true);
      },
    },
    {
      id: "ai",
      label: "AI interpretation",
      icon: "ai",
      action: () => {
        setSpeedDialOpen(false);
        if (isFullscreen) {
          setIsFullscreen(false);
          window.setTimeout(() => setAiPanelOpen(true), 120);
          return;
        }
        setAiPanelOpen(true);
      },
    },
  ];

  const visualToolbarItems = [
    { id: "bar", label: "Bar", icon: "📊" },
    { id: "trend", label: "Time series", icon: "↗" },
    { id: "donut", label: "Donut", icon: "◔" },
    { id: "table", label: "Table", icon: "▦" },
  ];

  const fullscreenChartReserve = isFacultyStaffHierarchyView ? 360 : 300;
  const fullscreenBarHeight = Math.max(
    250,
    Math.min(420, viewportHeight - fullscreenChartReserve),
  );
  const fullscreenDonutHeight = Math.max(
    240,
    Math.min(390, viewportHeight - fullscreenChartReserve),
  );
  const chartCanvasHeight = isFullscreen
    ? kpiView === "table"
      ? Math.max(
          280,
          Math.min(
            400,
            viewportHeight - (isFacultyStaffHierarchyView ? 340 : 300),
          ),
        )
      : kpiView === "bar" || kpiView === "trend"
        ? fullscreenBarHeight
        : fullscreenDonutHeight
    : kpiView === "table"
      ? 420
      : kpiView === "bar" || kpiView === "trend"
        ? 380
        : 420;
  const chartPanelWidthClass = isFullscreen
    ? "w-full max-w-[1020px]"
    : "w-full max-w-[980px]";
  const visualChartBodyStyle =
    !isFullscreen || kpiView === "table"
      ? undefined
      : {
          overflowY: "hidden",
          overflowX: "hidden",
        };

  const canShowFilters = section === "Compare" || section === "Reports";

  const facultyStaffBreadcrumbForSheet = (sheetLabel) =>
    `People & Student Life > Faculty & Staff > ${sheetLabel}`;

  const facultyStaffCarouselParentAccent = accent;
  const facultyStaffCarouselParentSoft = soft;
  const facultyStaffCarouselChildAccent = blendHexColor(accent, "#ffffff", 0.18);
  const facultyStaffCarouselChildSoft = blendHexColor(accent, "#ffffff", 0.86);

  const facultyStaffCarouselItems = useMemo(() => {
    const decorateSheetItem = (item) => {
      const isFacultyStaffParent = item.id === "faculty-staff-summary";
      return {
        id: item.id,
        label: item.label,
        tooltip: facultyStaffBreadcrumbForSheet(item.label),
        ...(isFacultyStaffParent
          ? {
              variant: "parent-drill-toggle",
              expanded: facultyStaffDrillCarouselOpen,
              accent: facultyStaffCarouselParentAccent,
              soft: facultyStaffCarouselParentSoft,
            }
          : {}),
      };
    };

    if (!isFacultyStaffHierarchyView || !facultyStaffDrillCarouselOpen) {
      return currentIgViewOptions.length
        ? currentIgViewOptions.map(decorateSheetItem)
        : [decorateSheetItem({ id: selectedSubsectionId, label: currentSubsection.label })];
    }

    return [
      {
        id: "faculty-staff-summary",
        label: "Faculty and Staff",
        tooltip: "People & Student Life > Faculty & Staff > Faculty and Staff > drill pills open. Click to collapse them.",
        variant: "parent-drill-toggle",
        expanded: true,
        accent: facultyStaffCarouselParentAccent,
        soft: facultyStaffCarouselParentSoft,
      },
      ...allFacultyStaffMappedPathways.map((pathway) => ({
        id: `faculty-staff-pathway-${pathway.pathwayNo}`,
        label: getFacultyStaffPathwayShortLabel(pathway),
        tooltip: `People & Student Life > Faculty & Staff > Faculty and Staff > ${pathway.hierarchyLabel} > ${getFacultyStaffPathwayShortLabel(pathway)} > ${facultyStaffFieldLabel(pathway.rootField)}${pathway.children?.length ? ` > ${pathway.children.map(facultyStaffFieldLabel).join(" > ")}` : ""}`,
        variant: "mapped-drill",
        accent: facultyStaffCarouselChildAccent,
        soft: facultyStaffCarouselChildSoft,
      })),
    ];
  }, [
    isFacultyStaffHierarchyView,
    facultyStaffDrillCarouselOpen,
    currentIgViewOptions,
    selectedSubsectionId,
    currentSubsection.label,
    allFacultyStaffMappedPathways,
    facultyStaffCarouselParentAccent,
    facultyStaffCarouselParentSoft,
    facultyStaffCarouselChildAccent,
    facultyStaffCarouselChildSoft,
  ]);

  const facultyStaffCarouselActiveId =
    isFacultyStaffHierarchyView && facultyStaffDrillCarouselOpen
      ? selectedFacultyStaffCarouselId
      : currentIgViewOptions.length
        ? currentIgViewId
        : selectedSubsectionId;

  const lastFacultyStaffCarouselId = allFacultyStaffMappedPathways.length
    ? `faculty-staff-pathway-${allFacultyStaffMappedPathways[allFacultyStaffMappedPathways.length - 1].pathwayNo}`
    : null;

  const facultyStaffCarouselScrollTargetId =
    selectedSubsectionId === "faculty-staff" &&
    facultyStaffDrillCarouselOpen &&
    facultyStaffCarouselActiveId === lastFacultyStaffCarouselId
      ? "faculty-staff-summary"
      : null;

  function pickFacultyStaffCarouselItem(itemId) {
    if (itemId === "faculty-staff-summary") {
      if (isFacultyStaffHierarchyView && currentIgViewId === "faculty-staff-summary") {
        setFacultyStaffDrillCarouselOpen((value) => !value);
      } else {
        handleSubviewChange("faculty-staff", "faculty-staff-summary");
        setFacultyStaffDrillCarouselOpen(true);
      }
      setDrillPath([]);
      setDetailFocus(null);
      setKpiView("bar");
      setChartRenderNonce((value) => value + 1);
      return;
    }

    if (itemId?.startsWith("faculty-staff-pathway-")) {
      const pathwayNo = Number(itemId.replace("faculty-staff-pathway-", ""));
      const pathway = allFacultyStaffMappedPathways.find((item) => Number(item.pathwayNo) === pathwayNo);
      if (pathway) {
        setSelectedFacultyStaffPathwayNo(pathway.pathwayNo);
        setSelectedFacultyStaffHierarchyKey(pathway.hierarchyKey);
        setFacultyStaffDrillCarouselOpen(true);
        setDrillPath([]);
        setDetailFocus(null);
        setChartRenderNonce((value) => value + 1);
      }
      return;
    }

    handleSubviewChange(selectedSubsectionId, itemId);
    setFacultyStaffDrillCarouselOpen(false);
  }

  function navigateFacultyStaffBreadcrumb(levelIndex) {
    if (!isFacultyStaffHierarchyView) return;

    if (levelIndex === 0) {
      const moduleDefaultSubsectionId = activeDomainDef?.children?.[0]?.id;
      if (moduleDefaultSubsectionId) {
        openSubsection(activeDomain, moduleDefaultSubsectionId);
      }
      return;
    }

    if (levelIndex === 1) {
      openSubsection(activeDomain, "faculty-staff", "faculty-staff-summary");
      setFacultyStaffDrillCarouselOpen(false);
      setChartRenderNonce((value) => value + 1);
      return;
    }

    if (levelIndex === 2) {
      openSubsection(activeDomain, "faculty-staff", "faculty-staff-summary");
      setFacultyStaffDrillCarouselOpen(true);
      setChartRenderNonce((value) => value + 1);
      return;
    }

    if (levelIndex === 3 && activeFacultyStaffPathway) {
      openSubsection(activeDomain, "faculty-staff", "faculty-staff-summary");
      setSelectedFacultyStaffPathwayNo(activeFacultyStaffPathway.pathwayNo);
      setSelectedFacultyStaffHierarchyKey(activeFacultyStaffPathway.hierarchyKey);
      setFacultyStaffDrillCarouselOpen(true);
      setChartRenderNonce((value) => value + 1);
    }
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: appearanceTheme.pageBg, zoom: isFullscreen ? 1 : 0.94 }}
    >
      <CurtainFilter
        open={filterOpen}
        title={
          filterContext === "compare" ? "Compare Filters" : "Reports Filters"
        }
        accent={isFacultyStaffHierarchyView ? activeFacultyStaffHierarchy?.color ?? accent : accent}
        schema={
          filterContext === "compare"
            ? COMPARE_FILTER_SCHEMA
            : REPORTS_FILTER_SCHEMA
        }
        draft={filterDraft}
        setDraft={setFilterDraft}
        role={role}
        lockedInstituteId={activeInstituteId || IITs[0].id}
        onReset={() => {
          if (filterContext === "compare") {
            setFilterDraft({
              ...compareCfg,
              CompareMetricIds: [...(compareCfg.CompareMetricIds ?? [])],
              InstituteId: [...(compareCfg.InstituteId ?? [])],
              YearRange: { from: 2022, to: 2025 },
            });
          }
          if (filterContext === "reports") {
            setFilterDraft({
              ...reportsCfg,
              YearRange: { ...reportsCfg.YearRange },
              InstituteId: [...(reportsCfg.InstituteId ?? [])],
            });
          }
        }}
        onApply={() => {
          if (filterContext === "compare") setCompareCfg(filterDraft);
          if (filterContext === "reports") setReportsCfg(filterDraft);
          setFilterOpen(false);
        }}
        onClose={() => setFilterOpen(false)}
      />

      <div
        className="relative z-[120] overflow-visible backdrop-blur duration-200"
        style={{
          background: appearanceTheme.topBg,
          borderBottom: "1px solid rgba(59,130,246,0.15)",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-1">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center gap-3">
              <div
                className="grid h-[52px] w-[52px] place-items-center overflow-hidden rounded-[18px] bg-white shadow-sm"
                style={{ border: "1px solid rgba(59,130,246,0.18)" }}
              >
                <img src={misLandingLogo} alt="IITMIS" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 leading-none">
                <div className="flex items-center gap-3 text-[17px] font-black tracking-[0.1em]" style={{ color: "#0f2a5e" }}>
                  <span>IIT</span>
                  <span>MIS</span>
                </div>
                <div className="mt-1 text-[12px] font-bold uppercase tracking-[0.22em]" style={{ color: "#475569" }}>
                  Management
                </div>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              {role === "ministry" ? (
                <div className="min-w-[176px] max-w-[220px]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] leading-tight" style={{ color: "#64748b" }}>
                    Select IIT
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <select
                      value={instituteId}
                      onChange={(event) => onSelectInstitute?.(event.target.value)}
                      className="h-[34px] min-w-0 flex-1 rounded-xl px-2.5 text-[11px] font-normal outline-none"
                      style={{
                        background: "#ffffff",
                        border: "1px solid rgba(59,130,246,0.18)",
                        color: "#1252a0",
                      }}
                    >
                      {IITs.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={onChangeInstitute}
                      className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5"
                      style={{
                        border: "1px solid rgba(59,130,246,0.18)",
                        color: "#1d4ed8",
                      }}
                      title="Change IIT on the map"
                      aria-label="Change IIT on the map"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                  return;
                }
                if (section !== "Home") setSection("Home");
              }}
              className="grid h-9 w-9 place-items-center rounded-2xl bg-white shadow-sm"
              style={{ border: "1px solid rgba(59,130,246,0.15)", color: "#1252a0" }}
              title="Go back"
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div ref={headerSearchRef} className="relative hidden lg:block">
              <div
                className="flex h-10 w-[320px] items-center gap-2 rounded-[18px] bg-white px-3 shadow-sm"
                style={{ border: "1px solid rgba(59,130,246,0.15)" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  value={headerSearch}
                  onFocus={() => setHeaderSearchOpen(Boolean(headerSearchResults.length))}
                  onChange={(event) => {
                    setHeaderSearch(event.target.value);
                    setHeaderSearchOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && headerSearchResults[0]) {
                      handleHeaderSearchSelect(headerSearchResults[0]);
                    }
                  }}
                  placeholder="Search module, sub-module, or worksheet"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none"
                />
                {headerSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setHeaderSearch("");
                      setHeaderSearchOpen(false);
                    }}
                    className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-500"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                ) : null}
              </div>

              {headerSearchOpen ? (
                <div
                  className="absolute right-0 top-full z-[160] mt-2 w-[360px] overflow-hidden rounded-[22px] bg-white shadow-xl"
                  style={{ border: "1px solid rgba(59,130,246,0.14)" }}
                >
                  {headerSearchResults.length ? (
                    <div className="max-h-[320px] overflow-auto py-2">
                      {headerSearchResults.map((result) => (
                        <button
                          key={result.key}
                          type="button"
                          onClick={() => handleHeaderSearchSelect(result)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-800">{result.label}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">{result.subtitle}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : headerSearch.trim() ? (
                    <div className="px-4 py-4 text-sm text-slate-500">No matching module, sub-module, or worksheet found.</div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div ref={profileRef} className="relative z-[130] shrink-0">
              <div className="flex items-center gap-2">
                <div className="hidden text-right leading-tight sm:block">
                  <div className="text-xs font-semibold" style={{ color: "#0f2a5e" }}>
                    {role === "ministry" ? "Ministry" : currentInstitute.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="grid h-9 w-9 place-items-center rounded-2xl bg-white"
                  style={{ border: "1px solid rgba(59,130,246,0.15)" }}
                >
                  <span
                    className="grid h-7 w-7 place-items-center rounded-xl"
                    style={{ background: `${accent}14`, color: accent }}
                  >
                    {iconSvg("profile")}
                  </span>
                </button>
              </div>

              {profileOpen ? (
                <div
                  className="absolute right-0 top-full z-[140] mt-1.5 w-56 overflow-hidden rounded-[18px] bg-white shadow-xl"
                  style={{ border: "1px solid rgba(59,130,246,0.15)" }}
                >
                  <div className="px-3 py-3">
                    <div
                      className="mb-2 text-[10px] uppercase tracking-[0.14em]"
                      style={{ color: "#64748b" }}
                    >
                      Theme
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "soft", label: "Soft blue" },
                        { id: "light", label: "Light" },
                        { id: "slate", label: "Slate" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAppearance(item.id)}
                          className="rounded-full px-2.5 py-1.5 text-[11px]"
                          style={{
                            background:
                              appearance === item.id ? `${accent}14` : "white",
                            color: appearance === item.id ? accent : "#475569",
                            border: `1px solid ${appearance === item.id ? accent : "rgba(148,163,184,0.22)"}`,
                          }}
                        >
                          {appearance === item.id ? "✓ " : ""}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      setHistoryOpen(true);
                      setProfileOpen(false);
                    }}
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-xl"
                      style={{
                        background: "rgba(25,117,190,0.08)",
                        color: "#1252a0",
                      }}
                    >
                      {iconSvg("history")}
                    </span>
                    <span>Login history</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={onLogout}
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-xl"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        color: "#dc2626",
                      }}
                    >
                      {iconSvg("logout")}
                    </span>
                    <span>Logout</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isFullscreen ? (
        <div
          className="fixed inset-0 z-[260] bg-slate-900/30 backdrop-blur-[1px]"
          onClick={() => setIsFullscreen(false)}
        />
      ) : null}

      <div
        className={`grid gap-2 px-3 py-1.5 ${sidebarCollapsed ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-[292px_1fr]"}`}
      >
        <aside
          className="relative rounded-[32px] p-3 shadow-sm"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(59,130,246,0.15)",
          }}
          onMouseEnter={() => setSidebarCollapsed(false)}
          onMouseLeave={() => setSidebarCollapsed(true)}
        >
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setSection("Home")}
              className={`flex w-full items-center gap-3 rounded-[24px] px-3 py-3 text-left transition ${sidebarCollapsed ? "justify-center" : ""}`}
              style={
                section === "Home"
                  ? {
                      background: `${accent}12`,
                      color: accent,
                      border: `1px solid ${accent}40`,
                    }
                  : {
                      color: "#0f2a5e",
                      border: "1px solid rgba(59,130,246,0.08)",
                    }
              }
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{
                  background:
                    section === "Home" ? accent : "rgba(148,163,184,0.14)",
                  color: section === "Home" ? "white" : "#475569",
                }}
              >
                {iconSvg("home", section === "Home")}
              </span>
              {!sidebarCollapsed ? (
                <span>
                  <span className="block text-sm font-semibold">Home</span>
                </span>
              ) : null}
            </button>
          </div>

          <div className="mt-4">
            {!sidebarCollapsed ? (
              <div
                className="px-2 text-[11px] uppercase tracking-[0.16em]"
                style={{ color: "#64748b" }}
              >
                Modules
              </div>
            ) : null}
            <div className="mt-2 space-y-2">
              {DOMAIN_DEFS.map((domain) => {
                const active =
                  section === domain.id ||
                  (section !== "Home" &&
                    module === domain.id &&
                    !["Compare", "Reports", "Data & Admin"].includes(section));
                return (
                  <div
                    key={domain.id}
                    className="rounded-[24px]"
                    style={{
                      background:
                        active && !sidebarCollapsed
                          ? "rgba(248,250,252,0.75)"
                          : "transparent",
                    }}
                  >
                    <div
                      className={`flex items-center gap-2 ${sidebarCollapsed ? "justify-center" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => openDomain(domain.id)}
                        className={`flex flex-1 items-center gap-3 rounded-[22px] px-3 py-2.5 text-left transition ${sidebarCollapsed ? "justify-center" : ""}`}
                        style={
                          active
                            ? { background: `${accent}12`, color: accent }
                            : { color: "#334155" }
                        }
                        title={domain.id}
                      >
                        <span
                          className="grid h-10 w-10 place-items-center rounded-2xl"
                          style={{
                            background: active
                              ? accent
                              : "rgba(148,163,184,0.14)",
                            color: active ? "white" : "#64748b",
                          }}
                        >
                          {iconSvg(domain.icon, active)}
                        </span>
                        {!sidebarCollapsed ? (
                          <span className="text-sm font-semibold">
                            {domain.id}
                          </span>
                        ) : null}
                      </button>
                      {!sidebarCollapsed ? (
                        <button
                          type="button"
                          onClick={() => toggleDomain(domain.id)}
                          className="grid h-10 w-10 place-items-center rounded-2xl"
                          style={{ color: "#64748b" }}
                          title={
                            expandedDomains[domain.id] ? "Collapse" : "Expand"
                          }
                        >
                          <span
                            style={{
                              transform: expandedDomains[domain.id]
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.18s ease",
                            }}
                          >
                            ›
                          </span>
                        </button>
                      ) : null}
                    </div>
                    {!sidebarCollapsed && expandedDomains[domain.id] ? (
                      <div className="mt-1 space-y-1 pb-2 pl-3 pr-2">
                        {domain.children.map((child) => {
                          const childActive =
                            section === domain.id &&
                            selectedSubsectionId === child.id;
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() =>
                                openSubsection(domain.id, child.id)
                              }
                              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition"
                              style={
                                childActive
                                  ? {
                                      background: "rgba(37,99,235,0.08)",
                                      color: "#1252a0",
                                      fontWeight: 700,
                                    }
                                  : { color: "#475569" }
                              }
                              title={child.label}
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  background: childActive
                                    ? accent
                                    : "rgba(148,163,184,0.36)",
                                }}
                              />
                              <span>{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="mt-5 border-t pt-4"
            style={{ borderColor: "rgba(59,130,246,0.12)" }}
          >
            {!sidebarCollapsed ? (
              <div
                className="px-2 text-[11px] uppercase tracking-[0.16em]"
                style={{ color: "#64748b" }}
              >
                Advanced
              </div>
            ) : null}
            <div className="mt-2 space-y-2">
              {ADVANCED_ITEMS.map((item) => {
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === "Compare") {
                        setCompareCfg(buildCompareDefaults({ autoApply: true }));
                      }
                      setSection(item.id);
                    }}
                    className={`flex w-full items-center gap-3 rounded-[22px] px-3 py-2.5 text-left transition ${sidebarCollapsed ? "justify-center" : ""}`}
                    style={
                      active
                        ? { background: `${accent}12`, color: accent }
                        : { color: "#334155" }
                    }
                    title={item.label}
                  >
                    <span
                      className="grid h-10 w-10 place-items-center rounded-2xl"
                      style={{
                        background: active ? accent : "rgba(148,163,184,0.14)",
                        color: active ? "white" : "#64748b",
                      }}
                    >
                      {iconSvg(item.icon, active)}
                    </span>
                    {!sidebarCollapsed ? (
                      <span className="text-sm font-semibold">
                        {item.label}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-2">
          {MODULES.includes(section) ? (
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <SubKpiCarousel
                  kpis={facultyStaffCarouselItems}
                  activeId={facultyStaffCarouselActiveId}
                  autoScrollTargetId={facultyStaffCarouselScrollTargetId}
                  onPick={(itemId) => {
                    if (selectedSubsectionId === "faculty-staff") {
                      pickFacultyStaffCarouselItem(itemId);
                    } else if (currentIgViewOptions.length) {
                      handleSubviewChange(selectedSubsectionId, itemId);
                    } else {
                      openSubsection(activeDomain, itemId);
                    }
                  }}
                  accent={accent}
                  soft={soft}
                  title={currentSubsection.label}
                  helper={
                    isFacultyStaffHierarchyView && facultyStaffDrillCarouselOpen
                      ? "Select a mapped drill from the Faculty and Staff sheet. Click Faculty and Staff to return to the sheet carousel."
                      : "Select the metric to analyze."
                  }
                />
              </div>
              <div
                className="flex h-full flex-col rounded-[28px] p-3 shadow-sm xl:max-w-none"
                style={{
                  background: "rgba(255,255,255,0.94)",
                  border: "1px solid rgba(59,130,246,0.15)",
                }}
              >
                <div className="text-sm font-bold" style={{ color: "#0f172a" }}>
                  Filters
                </div>
                <div className="mt-3 grid flex-1 content-start gap-3 xl:grid-cols-1 2xl:grid-cols-2">
                  <Select
                    label="From"
                    value={String(yearRange.from)}
                    onChange={(value) =>
                      setYearRange((prev) => ({
                        ...prev,
                        from: Math.min(Number(value), prev.to),
                      }))
                    }
                    options={YEARS.map((value) => ({
                      value: String(value),
                      label: String(value),
                    }))}
                  />
                  <Select
                    label="To"
                    value={String(yearRange.to)}
                    onChange={(value) =>
                      setYearRange((prev) => ({
                        ...prev,
                        to: Math.max(Number(value), prev.from),
                      }))
                    }
                    options={YEARS.map((value) => ({
                      value: String(value),
                      label: String(value),
                    }))}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {section === "Home" ? (
            <div className="space-y-4">
              <div
                className="rounded-[32px] p-6 shadow-sm"
                style={{
                  background: "rgba(255,255,255,0.94)",
                  border: "1px solid rgba(59,130,246,0.15)",
                }}
              >
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "#64748b" }}>
                    Institute snapshot · AY {yearRange.from}–{yearRange.to}
                  </div>
                  <div className="mt-3 text-5xl font-black leading-none" style={{ color: "#0f2a5e" }}>
                    {currentInstitute.name}
                  </div>
                  <div className="mt-3 max-w-3xl text-sm" style={{ color: "#475569" }}>
                    Quick links to modules and institute reports.
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={homeSearch}
                      onChange={(event) => setHomeSearch(event.target.value)}
                      placeholder="Search reports, rankings, student data"
                      className="h-12 flex-1 rounded-[18px] px-4 outline-none"
                      style={{
                        border: "1px solid rgba(59,130,246,0.16)",
                        background: "#ffffff",
                        color: "#0f172a",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openReportsForKpis(
                          homeReportCards.map((item) => item.kpiId),
                          homeReportCards[0]?.kpiId,
                        )
                      }
                      className="h-12 rounded-[18px] px-6 text-sm font-bold text-white"
                      style={{ background: accent }}
                    >
                      Search
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {homeModuleCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={card.onClick}
                        className="rounded-[24px] px-4 py-4 text-left transition hover:-translate-y-0.5"
                        style={{
                          background: "rgba(248,250,252,0.82)",
                          border: "1px solid rgba(59,130,246,0.12)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1 h-14 w-1.5 rounded-full" style={{ background: card.color }} />
                          <span className="block min-w-0">
                            <span className="block text-3xl font-extrabold leading-none" style={{ color: "#0f172a" }}>
                              {formatCompact(card.value)}
                            </span>
                            <span className="mt-2 block text-[1.02rem] font-semibold leading-tight" style={{ color: "#0f2a5e" }}>
                              {card.label}
                            </span>
                            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#64748b" }}>
                              {card.note}
                            </span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {homeReportCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => openReportsForKpis([card.kpiId], card.kpiId)}
                        className="rounded-[24px] px-4 py-4 text-left transition hover:-translate-y-0.5"
                        style={{
                          background: "rgba(248,250,252,0.82)",
                          border: "1px solid rgba(59,130,246,0.12)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1 h-14 w-1.5 rounded-full" style={{ background: card.color }} />
                          <span className="block min-w-0">
                            <span className="block text-3xl font-extrabold leading-none" style={{ color: "#0f172a" }}>
                              {card.value}
                            </span>
                            <span className="mt-2 block text-[1.02rem] font-semibold leading-tight" style={{ color: "#0f2a5e" }}>
                              {card.label}
                            </span>
                            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#64748b" }}>
                              {card.note}
                            </span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        openReportsForKpis(
                          homeReportCards.map((item) => item.kpiId),
                          homeReportCards[0]?.kpiId,
                        )
                      }
                      className="rounded-2xl px-4 py-2.5 text-sm font-bold text-white"
                      style={{ background: accent }}
                    >
                      Explore institute reports
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection("Compare")}
                      className="rounded-2xl px-4 py-2.5 text-sm font-bold"
                      style={{
                        color: "#1252a0",
                        border: "1px solid rgba(59,130,246,0.18)",
                        background: "#ffffff",
                      }}
                    >
                      Compare IITs
                    </button>
                  </div>
                  </div>

                  <div
                    className="flex h-full items-center justify-center rounded-[28px] p-5"
                    style={{
                      background: "rgba(238,245,255,0.52)",
                      border: "1px solid rgba(59,130,246,0.12)",
                    }}
                  >
                    <div
                      className="flex min-h-[320px] w-full items-center justify-center rounded-[24px] bg-white p-6"
                      style={{ border: "1px solid rgba(59,130,246,0.12)" }}
                    >
                      {currentInstituteLogo ? (
                        <img
                          src={currentInstituteLogo}
                          alt={`${currentInstitute.name} logo`}
                          className="max-h-[280px] w-auto object-contain"
                        />
                      ) : (
                        <div
                          className="flex h-40 w-40 items-center justify-center rounded-full border text-center text-lg font-extrabold uppercase tracking-[0.18em]"
                          style={{
                            borderColor: "rgba(59,130,246,0.18)",
                            color: "#0f2a5e",
                            background: "rgba(248,250,252,0.82)",
                          }}
                        >
                          {currentInstitute.id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {section === "Compare" ? (
            <ComparePage
              facts={facts}
              config={compareCfg}
              accent={THEME_COLORS.Compare.accent}
              role={role}
              onConfigChange={setCompareCfg}
              onOpenFilters={() => openFilterFor("compare")}
              onBack={() => setSection(module)}
              onViewReports={(metricIds) => {
                setReportsCfg((prev) => ({ ...prev, KpiIds: metricIds }));
                setSection("Reports");
              }}
            />
          ) : null}

          {section === "Reports" ? (
            <ReportsHubPage
              facts={facts}
              config={reportsCfg}
              accent={THEME_COLORS.Reports.accent}
              role={role}
              instituteId={activeInstituteId || IITs[0].id}
              onOpenFilters={() => openFilterFor("reports")}
              onOpenSource={() => setSourceOpen(true)}
              onOpenInstructions={() => setInstructionsOpen(true)}
              onBack={() => setSection(module)}
              focusKpiId={selectedKpiId}
              autoOpenKey={reportAutoOpenKey}
            />
          ) : null}

          {section === "Data & Admin" ? (
            <div className="space-y-4">
              <div
                className="rounded-[32px] p-5 shadow-sm"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(59,130,246,0.15)",
                }}
              >
                <div
                  className="text-2xl font-extrabold"
                  style={{ color: "#0f2a5e" }}
                >
                  Data & Admin
                </div>
                <div className="mt-1 text-sm" style={{ color: "#64748b" }}>
                  Admin tools, data templates, and operational controls remain
                  grouped here.
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "Data Import Batch",
                      copy: "Track the latest batch, refresh, and source coverage.",
                    },
                    {
                      title: "Table Activity Tracker",
                      copy: "Monitor insert, update, and delete operations.",
                    },
                    {
                      title: "Master Data Maintenance",
                      copy: "Maintain IIT, country, degree, and other master tables.",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="rounded-[24px] p-4"
                      style={{
                        background: "rgba(248,250,252,0.8)",
                        border: "1px solid rgba(59,130,246,0.12)",
                      }}
                    >
                      <div
                        className="text-sm font-extrabold"
                        style={{ color: "#0f172a" }}
                      >
                        {card.title}
                      </div>
                      <div
                        className="mt-2 text-sm"
                        style={{ color: "#64748b" }}
                      >
                        {card.copy}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {[
                    "enrollment",
                    "placements",
                    "publications",
                    "patents",
                    "budget",
                    "collaborations",
                    "intlStudents",
                  ].map((fact) => (
                    <button
                      key={fact}
                      type="button"
                      onClick={() => {
                        const template = buildTemplateForFact(fact);
                        downloadText(
                          `${fact}_template.csv`,
                          toCsv(
                            template.rows,
                            template.cols.map((key) => ({ key, label: key })),
                          ),
                        );
                      }}
                      className="rounded-2xl px-4 py-2 text-sm font-semibold"
                      style={{
                        color: "#1252a0",
                        border: "1px solid rgba(59,130,246,0.18)",
                        background: "white",
                      }}
                    >
                      Download {fact} template
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {MODULES.includes(section) ? (
            <div
              className="rounded-[30px] p-4 shadow-sm"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(59,130,246,0.15)",
              }}
            >
              <div
                ref={kpiChartRef}
                className="dashboard-chart-surface relative min-w-0 overflow-visible rounded-[30px] p-4"
                style={
                  isFullscreen
                    ? {
                        background: "rgba(255,255,255,0.98)",
                        border: "1px solid rgba(59,130,246,0.16)",
                        position: "fixed",
                        inset: "16px",
                        zIndex: 280,
                        boxShadow: "0 28px 70px rgba(15,23,42,0.18)",
                        overflow: "hidden",
                        height: "calc(100dvh - 32px)",
                        maxHeight: "calc(100dvh - 32px)",
                        display: "flex",
                        flexDirection: "column",
                      }
                    : {
                        background: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(59,130,246,0.12)",
                        minHeight: "600px",
                      }
                }
              >
                <button
                  type="button"
                  data-export-hide="true"
                  onClick={handleFullscreen}
                  title={isFullscreen ? "Close fullscreen" : "Open fullscreen"}
                  className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm"
                  style={{
                    border: "1px solid rgba(59,130,246,0.18)",
                    color: isFullscreen ? "#dc2626" : "#1252a0",
                  }}
                >
                  {isFullscreen ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>
                  ) : (
                    iconSvg("fullscreen", false, "#1252a0")
                  )}
                </button>

                <div ref={chartExportRef} className="relative flex min-h-0 flex-1 flex-col">
                <div className={`dashboard-chart-header absolute inset-x-5 z-10 flex items-start gap-3 pr-14 ${isFullscreen ? "top-5" : "top-5"}`}>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setValueMode("value")}
                      className="rounded-full px-3 py-1.5 text-xs font-bold"
                      style={{
                        background:
                          valueMode === "value" ? `${accent}15` : "white",
                        border: `1px solid ${valueMode === "value" ? accent : "rgba(148,163,184,0.22)"}`,
                        color: valueMode === "value" ? accent : "#475569",
                      }}
                    >
                      Raw
                    </button>
                    <button
                      type="button"
                      onClick={() => setValueMode("percent")}
                      className="rounded-full px-3 py-1.5 text-xs font-bold"
                      style={{
                        background:
                          valueMode === "percent" ? `${accent}15` : "white",
                        border: `1px solid ${valueMode === "percent" ? accent : "rgba(148,163,184,0.22)"}`,
                        color: valueMode === "percent" ? accent : "#475569",
                      }}
                    >
                      Percent
                    </button>
                  </div>

                  <div className="min-w-0 flex-1 px-12 text-center">
                    <div
                      className="text-[1.18rem] font-extrabold leading-tight tracking-[0.01em]"
                      style={{ color: "#0f172a" }}
                    >
                      {currentViewLabel}
                    </div>
                    <div className="mt-2 flex justify-center">
                      <Breadcrumbs
                        base={visibleBaseBreakdownLabel}
                        levels={isFacultyStaffHierarchyView ? [] : selectedKpi.levels ?? []}
                        drillPath={isFacultyStaffHierarchyView ? facultyStaffBreadcrumbPath : drillPath}
                        onPopTo={isFacultyStaffHierarchyView ? navigateFacultyStaffBreadcrumb : popDrillTo}
                      />
                    </div>
                    <div
                      className="mt-2.5 text-[13px] font-semibold"
                      style={{ color: "#334155" }}
                    >
                      {yearRange.from}–{yearRange.to} · {currentInstitute.name}
                    </div>
                  </div>

                  <div className="absolute right-14 top-0 flex shrink-0 items-center" data-export-hide="true">
                    <VisualToolbar
                      items={visualToolbarItems}
                      value={kpiView}
                      exportHidden
                      orientation="horizontal"
                      className="shrink-0"
                      style={{ position: "static", transform: "none" }}
                      onChange={(nextView) => {
                        setKpiView(nextView);
                        setChartRenderNonce((value) => value + 1);
                      }}
                    />
                  </div>
                </div>

                <div
                  key={`${kpiView}-${isFullscreen ? "fs" : "std"}-${chartRenderNonce}-${selectedKpi.id}-${drillPath.join("-")}-${selectedFacultyStaffHierarchyKey}-${selectedFacultyStaffPathwayNo}`}
                  ref={chartOnlyRef}
                  className={`dashboard-chart-body min-w-0 ${isFullscreen ? (kpiView === "table" ? "flex flex-1 min-h-0 items-center justify-center overflow-hidden pt-24 pb-14" : "flex flex-1 min-h-0 items-start justify-center pt-24 pb-14" ) : "flex min-h-[460px] items-center justify-center pt-24 pb-10"}`}
                  style={{
                    ...visualChartBodyStyle,
                    ...(isFullscreen ? {} : { transform: "translateY(12px)" }),
                  }}
                >
                  <div className={`${chartPanelWidthClass} mx-auto`}>
                    {kpiView === "bar" ? (
                      <BreakdownBar
                        data={visibleChartBreakdown}
                        format={
                          valueMode === "percent" && selectedKpi.format !== "pct"
                            ? "pct"
                            : selectedKpi.format
                        }
                        onBarClick={isFacultyStaffHierarchyView ? onFacultyStaffChartDrill : selectedKpi.drillable ? onDrillNext : undefined}
                        accent={isFacultyStaffHierarchyView ? activeFacultyStaffHierarchy?.color ?? accent : accent}
                        xLabel={visibleCurrentBreakdownLabel}
                        yLabel={visibleCurrentValueLabel}
                        height={chartCanvasHeight}
                        interactive={selectedKpi.drillable || isFacultyStaffHierarchyView}
                        drillHint={chartDrillHint}
                      />
                    ) : kpiView === "trend" ? (
                      <BreakdownLine
                        data={trendSeries}
                        format={
                          valueMode === "percent" && selectedKpi.format !== "pct"
                            ? "pct"
                            : selectedKpi.format
                        }
                        accent={isFacultyStaffHierarchyView ? activeFacultyStaffHierarchy?.color ?? accent : accent}
                        yLabel={visibleCurrentValueLabel}
                        height={chartCanvasHeight}
                      />
                    ) : kpiView === "donut" ? (
                      <BreakdownDonut
                        data={visibleChartBreakdown}
                        format={
                          valueMode === "percent" && selectedKpi.format !== "pct"
                            ? "pct"
                            : selectedKpi.format
                        }
                        onSliceClick={isFacultyStaffHierarchyView ? onFacultyStaffChartDrill : selectedKpi.drillable ? onDrillNext : undefined}
                        accent={isFacultyStaffHierarchyView ? activeFacultyStaffHierarchy?.color ?? accent : accent}
                        soft={soft}
                        metricLabel={visibleCurrentValueLabel}
                        height={chartCanvasHeight}
                        interactive={selectedKpi.drillable || isFacultyStaffHierarchyView}
                        drillHint={chartDrillHint}
                      />
                    ) : (
                      <div className="w-full pt-4">
                        <DataTable
                          columns={[
                            { key: "name", label: visibleCurrentBreakdownLabel },
                            {
                              key: "value",
                              label: visibleCurrentValueLabel,
                              format: (value) =>
                                valueMode === "percent" &&
                                selectedKpi.format !== "pct"
                                  ? formatPct(value)
                                  : selectedKpi.format === "pct"
                                    ? formatPct(value)
                                    : formatCompact(value),
                            },
                          ]}
                          rows={visibleBreakdown}
                          maxHeight={500}
                          onRowClick={selectedKpi.drillable || isFacultyStaffHierarchyView ? (row) => onDrillNext(row.name) : undefined}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`dashboard-chart-footer absolute left-1/2 -translate-x-1/2 text-center text-[10px] font-medium ${isFullscreen ? "bottom-3 inset-x-0" : "bottom-1 w-full max-w-[72%]"}`}
                  style={{ color: "#64748b" }}
                >
                  Last updated: {lastUpdatedLabel} · Last downloaded: {lastDownloadedLabel}
                </div>

                </div>

                <div
                  data-export-hide="true"
                  className={`${isFullscreen ? "fixed bottom-8 right-8 z-[340]" : "absolute bottom-4 right-4 z-20"} flex flex-col items-end gap-2`}
                >
                  {speedDialOpen
                    ? speedDialItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            item.action();
                            setSpeedDialOpen(false);
                          }}
                          className="dashboard-speed-action group relative z-[141] grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-lg transition hover:-translate-y-0.5"
                          style={{ color: "#0f172a", border: "1px solid rgba(15,42,94,0.14)" }}
                        >
                          <span
                            className="dashboard-speed-tooltip pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-[142] -translate-y-1/2 whitespace-nowrap rounded-xl border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 opacity-0 shadow-sm transition"
                          >
                            {item.label}
                          </span>
                          <span>{iconSvg(item.icon, false, "#0f172a")}</span>
                        </button>
                      ))
                    : null}
                  <button
                    type="button"
                    onClick={() => setSpeedDialOpen((value) => !value)}
                    className="dashboard-speed-action group relative z-[141] grid h-12 w-12 place-items-center rounded-2xl text-3xl text-white shadow-lg"
                    style={{ background: "#1e6cc8", lineHeight: 1 }}
                  >
                    <span
                      className="dashboard-speed-tooltip pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-[142] -translate-y-1/2 whitespace-nowrap rounded-xl border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 opacity-0 shadow-sm transition"
                    >
                      {speedDialOpen ? "Close actions" : "Open actions"}
                    </span>
                    <span style={{ transform: speedDialOpen ? "translateY(-1px)" : "translateY(-2px)" }}>
                      {speedDialOpen ? "×" : "+"}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          ) : null}

          {notice ? (
            <div className="text-sm font-semibold" style={{ color: "#1252a0" }}>
              {notice}
            </div>
          ) : null}
        </main>
      </div>

      <div
        className="flex items-center justify-center gap-3 px-4 pb-3 pt-1.5 text-[13px]"
        style={{ color: "#64748b" }}
      >
        <img
          src="/cdis-logo.png"
          alt="CDIS"
          className="h-6 w-6 object-contain"
        />
        <span>Developed by CDIS, IIT Kanpur</span>
      </div>

      <Drawer
        open={detailsOpen}
        title={`${currentViewLabel} • Detail Report`}
        onClose={() => {
          setDetailsOpen(false);
        }}
      >
        {detailFocus ? (
          <div className="mb-3 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: soft, color: accent }}>
            {detailFocus.label}: {detailFocus.value}
          </div>
        ) : null}
        <div className="text-xs" style={{ color: "#64748b" }}>
          Last updated: {lastUpdatedLabel} • Last downloaded: {lastDownloadedLabel}
        </div>
        <div className="mt-4">
          <DataTable
            columns={detailTable.columns}
            rows={detailTable.rows}
            maxHeight={620}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              downloadText(
                `${selectedKpi.id}_${yearRange.to}.csv`,
                toCsv(detailTable.rows, detailTable.columns),
              );
              markDownloaded("CSV downloaded.");
            }}
            className="rounded-2xl px-4 py-2 text-sm font-semibold"
            style={{
              color: "#ffffff",
              border: `1px solid ${accent}`,
              background: accent,
            }}
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={async () => {
              const downloadStamp = new Date().toISOString();
              downloadTableSvg(
                `${selectedKpi.id}_${yearRange.to}.svg`,
                detailTable.columns,
                detailTable.rows,
                {
                  title: `${currentViewLabel} Detail Report`,
                  breadcrumb: breadcrumbText,
                  subtitle: `${yearRange.from}–${yearRange.to} · ${currentInstitute.name}`,
                  lastUpdatedAt: lastUpdated,
                  lastDownloadedAt: downloadStamp,
                },
              );
              markDownloaded("SVG downloaded.", downloadStamp);
            }}
            className="rounded-2xl px-4 py-2 text-sm font-semibold"
            style={{
              color: "#ffffff",
              border: `1px solid ${accent}`,
              background: accent,
            }}
          >
            Download SVG
          </button>
          <button
            type="button"
            onClick={() => {
              downloadElementPdf(
                kpiChartRef.current,
                `${currentViewLabel} (${yearRange.to})`,
              );
              markDownloaded("Print dialog opened.");
            }}
            className="rounded-2xl px-4 py-2 text-sm font-semibold"
            style={{
              color: "#ffffff",
              border: `1px solid ${accent}`,
              background: accent,
            }}
          >
            PDF
          </button>
          <button
            type="button"
            onClick={async () => {
              const ok = await copyToClipboard(
                buildEmbedCode(`${currentViewLabel} — IITMIS`),
              );
              setNotice(ok ? "Embed code copied." : "Copy failed.");
            }}
            className="rounded-2xl px-4 py-2 text-sm font-semibold"
            style={{
              color: "#ffffff",
              border: `1px solid ${accent}`,
              background: accent,
            }}
          >
            Embed code
          </button>
        </div>
      </Drawer>

      <Drawer
        open={aiPanelOpen}
        title={`AI interpretation • ${currentViewLabel}`}
        onClose={() => setAiPanelOpen(false)}
      >
        <div className="text-sm" style={{ color: "#334155" }}>
          Current context: {currentViewLabel} • {currentInstitute.name} • {yearRange.from}–{yearRange.to}
        </div>
        <div className="mt-2 text-xs" style={{ color: "#64748b" }}>
          Last updated: {lastUpdatedLabel} • Last downloaded: {lastDownloadedLabel}
        </div>
        <div className="mt-4 rounded-[24px] border p-4" style={{ borderColor: "rgba(59,130,246,0.12)", background: "rgba(248,250,252,0.85)" }}>
          {dashboardInterpretation}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              downloadText(
                `${selectedKpi.id}_${yearRange.to}_ai_interpretation.txt`,
                `AI interpretation

${currentViewLabel} • ${currentInstitute.name} • ${yearRange.from}–${yearRange.to}

${String(dashboardInterpretation).replace(/<[^>]+>/g, " ")}`,
              );
              markDownloaded("AI interpretation downloaded.");
            }}
            className="rounded-2xl px-4 py-2 text-sm font-semibold"
            style={{ color: "#1252a0", border: "1px solid rgba(59,130,246,0.18)", background: "white" }}
          >
            Download AI interpretation
          </button>
        </div>
      </Drawer>

      <Modal
        open={shareEmbedOpen}
        title="Share / Embed"
        onClose={() => setShareEmbedOpen(false)}
      >
        <div className="space-y-4 text-sm" style={{ color: "#334155" }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "#64748b" }}>
              Share link
            </div>
            <div className="mt-2 rounded-2xl border bg-slate-50 px-4 py-3" style={{ borderColor: "rgba(59,130,246,0.12)" }}>
              {window.location.href}
            </div>
            <button
              type="button"
              onClick={async () => {
                const ok = await copyToClipboard(window.location.href);
                setNotice(ok ? "Link copied." : "Copy failed.");
              }}
              className="mt-3 rounded-2xl px-4 py-2 text-sm font-semibold"
              style={{ color: "#1252a0", border: "1px solid rgba(59,130,246,0.18)", background: "white" }}
            >
              Copy link
            </button>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "#64748b" }}>
              Embed code
            </div>
            <textarea
              readOnly
              value={buildEmbedCode(`IIT MIS • ${currentViewLabel}`)}
              className="mt-2 h-36 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-xs outline-none"
              style={{ borderColor: "rgba(59,130,246,0.12)" }}
            />
            <button
              type="button"
              onClick={async () => {
                const ok = await copyToClipboard(buildEmbedCode(`IIT MIS • ${currentViewLabel}`));
                setNotice(ok ? "Embed code copied." : "Copy failed.");
              }}
              className="mt-3 rounded-2xl px-4 py-2 text-sm font-semibold"
              style={{ color: "#1252a0", border: "1px solid rgba(59,130,246,0.18)", background: "white" }}
            >
              Copy embed code
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={historyOpen}
        title="Login history"
        onClose={() => setHistoryOpen(false)}
      >
        <div
          className="rounded-[24px] p-4"
          style={{
            background: "rgba(248,250,252,0.9)",
            border: "1px solid rgba(59,130,246,0.12)",
          }}
        >
          <div className="text-sm font-semibold" style={{ color: "#0f172a" }}>
            {loginMeta?.email || "user@example.com"}
          </div>
          <div className="mt-2 text-sm" style={{ color: "#475569" }}>
            Logged in at:{" "}
            {loginMeta?.loggedInAt
              ? new Date(loginMeta.loggedInAt).toLocaleString()
              : new Date().toLocaleString()}
          </div>
          <div className="mt-1 text-sm" style={{ color: "#475569" }}>
            Role: {role === "ministry" ? "Ministry" : "Institute"}
          </div>
          <div className="mt-1 text-sm" style={{ color: "#475569" }}>
            Institute: {currentInstitute.name}
          </div>
        </div>
      </Modal>

      <Modal open={helpOpen} title="Help" onClose={() => setHelpOpen(false)}>
        <div className="space-y-3 text-sm" style={{ color: "#334155" }}>
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(25,117,190,0.05)",
              border: "1px solid rgba(59,130,246,0.1)",
            }}
          >
            <div
              className="text-sm font-extrabold"
              style={{ color: "#0f2a5e" }}
            >
              How to use
            </div>
            <ul className="mt-2 list-disc pl-5">
              <li>
                Use Home for a quick summary of the current dashboard context.
              </li>
              <li>
                Open a module from the sidebar and choose a subsection from the
                carousel.
              </li>
              <li>
                Use the plus button below the chart for download, share,
                compare, reports, and details.
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        open={sourceOpen}
        title="Evidence / source links"
        onClose={() => setSourceOpen(false)}
      >
        <div className="space-y-3">
          {EVIDENCE_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "rgba(248,250,252,0.9)",
                border: "1px solid rgba(59,130,246,0.12)",
                color: "#1252a0",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </Modal>

      <Modal
        open={instructionsOpen}
        title="Instructions"
        onClose={() => setInstructionsOpen(false)}
      >
        <div className="space-y-3 text-sm" style={{ color: "#334155" }}>
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(25,117,190,0.05)",
              border: "1px solid rgba(59,130,246,0.1)",
            }}
          >
            Reports and exports follow the current filter context. Use the
            reports hub to export wide tables and the detail drawer for
            chart-specific data.
          </div>
        </div>
      </Modal>
    </div>
  );
}
