import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const ROOT = process.cwd();

const EXCEL_PATH = "C:\\Users\\lenovo\\OneDrive\\Desktop\\iitmis_dashboard\\MIS_Synthetic_5Y_Sample_Data.xlsx";
const WORKBOOK_FACTS_PATH = path.join(ROOT, "src", "data", "workbookFacts.js");

const INSTITUTE_META = {
  "IIT Bombay": { id: "IITB", state: "Maharashtra", short: "BOM" },
  "IIT Delhi": { id: "IITD", state: "Delhi", short: "DEL" },
  "IIT Kanpur": { id: "IITK", state: "Uttar Pradesh", short: "KAN" },
  "IIT Kharagpur": { id: "IITKGP", state: "West Bengal", short: "KGP" },
  "IIT Madras": { id: "IITM", state: "Tamil Nadu", short: "MAD" },
};

const FACT_KEYS = [
  "academicPrograms",
  "admissionMode",
  "alumniEngagement",
  "alumniNetwork",
  "auditObservations",
  "budget",
  "careerServices",
  "collaborations",
  "counsellingServices",
  "courtCases",
  "enrollment",
  "enrollmentDetails",
  "entranceExam",
  "entrepreneurshipSupport",
  "facultyAwards",
  "facultyResearchEngagement",
  "facultyStaffSummary",
  "governancePolicy",
  "institutionalProfile",
  "internationalFacultyRecords",
  "intlStudentRecords",
  "intlStudents",
  "medicalStaffDetails",
  "medicalStaffSummary",
  "missionRecruitment",
  "monthly",
  "patents",
  "phdAlumniCareerDistribution",
  "placements",
  "placementsAndAlumni",
  "placementStatistics",
  "publications",
  "rankingsAccreditations",
  "scholarshipsFellowships",
  "studentDeathCases",
  "studentProfileSummary",
  "topRecruiters",
];

function instituteId(name) {
  return INSTITUTE_META[name]?.id || String(name || "").replace(/\s+/g, "_").toUpperCase();
}

function instituteState(name) {
  return INSTITUTE_META[name]?.state || "Not specified";
}

function instituteShort(name) {
  return INSTITUTE_META[name]?.short || instituteId(name);
}

function base(row) {
  const institute = row.Institute || "Not specified";
  return {
    InstituteId: instituteId(institute),
    Institute: institute,
    State: instituteState(institute),
    Year: Number(row.Year || row["Snapshot Year"] || 2025),
  };
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const cleaned = String(value).replace(/[%₹,]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

function round(value, places = 2) {
  const n = toNumber(value, 0);
  return Number(n.toFixed(places));
}

function asPercentDecimal(value) {
  const n = toNumber(value, 0);
  return n > 1 ? n / 100 : n;
}

function cleanDate(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${month}-${day}`;
    }
  }
  return String(value);
}

function programFromDegree(degree) {
  const d = String(degree || "").toLowerCase();
  if (d.includes("phd")) return "PhD";
  if (d.includes("btech") || d.includes("bdes") || d.includes("bs")) return "UG";
  if (d.includes("mtech") || d.includes("msc") || d.includes("ms") || d.includes("mba") || d.includes("mdes")) return "PG";
  return degree || "Not specified";
}

function academicArea(department) {
  const d = String(department || "").toLowerCase();
  if (d.includes("computer") || d.includes("electrical") || d.includes("mechanical") || d.includes("civil")) return "Engineering";
  if (d.includes("physics") || d.includes("chem") || d.includes("math") || d.includes("biology")) return "Sciences";
  if (d.includes("management")) return "Management";
  if (d.includes("humanities") || d.includes("social")) return "HSS";
  return "Interdisciplinary";
}

function modeLabel(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("online")) return "Online";
  if (v.includes("hybrid")) return "Hybrid";
  return "On-campus";
}

function studentNationality(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("indian") || v.includes("domestic")) return "Domestic";
  return "International";
}

function workforceGroup(bucket) {
  const b = String(bucket || "").toLowerCase();
  if (b.includes("non teaching")) return "Non Teaching Staff";
  if (b.includes("international")) return "International Faculty";
  if (b.includes("adjunct") || b.includes("visiting")) return "Adjunct/Visiting Faculty";
  if (b.includes("staff")) return "Staff";
  return "Faculty";
}

function readSheet(workbook, sheetName) {
  const ws = workbook.Sheets[sheetName];
  if (!ws) return [];

  const rawRows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
    raw: true,
  });

  const headerIndex = rawRows.findIndex((row) => {
    const cells = row.map((cell) => String(cell || "").trim());
    return cells.includes("Institute") && (cells.includes("Year") || cells.includes("Snapshot Year"));
  });

  if (headerIndex < 0) return [];

  const headers = rawRows[headerIndex].map((cell) => String(cell || "").trim());

  return rawRows
    .slice(headerIndex + 1)
    .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ""))
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) obj[header] = row[index] ?? null;
      });
      return obj;
    });
}

function createFactsTemplate() {
  return Object.fromEntries(FACT_KEYS.map((key) => [key, []]));
}

function buildFacts(workbook) {
  const facts = createFactsTemplate();
  const facultyDirectory = new Map();
  const facultyRows = readSheet(workbook, "D10_Faculty");
  const startupSupportByKey = new Map();
  const phdCareerByKey = new Map();

  for (const row of facultyRows) {
    const b = base(row);
    const employeeId = row["Employee ID"] || "";
    if (!employeeId) continue;
    facultyDirectory.set(
      `${b.InstituteId}|${b.Year}|${employeeId}`,
      row["Faculty Name"] || employeeId,
    );
  }

  for (const row of readSheet(workbook, "D09_Enrollment Details")) {
    const b = base(row);
    const degree = row.Degree || "Not specified";

    facts.enrollment.push({
      ...b,
      Program: programFromDegree(degree),
      Discipline: row.Department || "Not specified",
      Gender: row.Gender || "Not specified",
      Category: row.Category || "Not specified",
      Students: toNumber(row["Students Enrolled"]),
    });

    facts.enrollmentDetails.push({
      ...b,
      Program: programFromDegree(degree),
      AcademicArea: academicArea(row.Department),
      Discipline: row.Department || "Not specified",
      Degree: degree,
      Gender: row.Gender || "Not specified",
      SocialCategory: row.Category || "Not specified",
      Enrollment: toNumber(row["Students Enrolled"]),
      DropoutCount: toNumber(row["Dropout Count"]),
      DropoutRate: asPercentDecimal(row["Dropout Rate"]),
    });
  }

  for (const row of readSheet(workbook, "D02_Academic Programs")) {
    const b = base(row);
    const degree = row.Degree || "Not specified";
    const department = row.Department || "Not specified";

    facts.academicPrograms.push({
      ...b,
      Degree: degree,
      Department: department,
      ModeOfDelivery: modeLabel(row["Mode of Delivery"]),
      ProgramName: `${degree} in ${department}`,
      DurationYears: toNumber(row["Duration (Years)"], null),
      LaunchYear: toNumber(row["Launch Year"], null),
      FacultyCurrentlyTeaching: row["No. Faculty Currently Teaching"] ?? null,
    });
  }

  for (const row of readSheet(workbook, "D27_Institutional Profile")) {
    const b = base(row);

    const degreeMetrics = [
      ["On-campus degrees", row["Total on campus degrees"]],
      ["Online degrees", row["Total online degrees"]],
      ["Engineering and Technology degrees", row["Total Engineering and Technology degrees"]],
      ["Science degrees", row["Total Science degrees"]],
      ["HSS degrees", row["Total HSS degrees"]],
      ["Management and Finance degrees", row["Total Management and Finance degrees"]],
      ["Interdisciplinary degrees", row["Total Interdisciplinary degrees"]],
    ];

    for (const [degreeCategory, degreeCount] of degreeMetrics) {
      facts.institutionalProfile.push({
        ...b,
        NIRFOverallRank: toNumber(row["NIRF Ranking (Overall)"], null),
        NIRFEngineeringRank: toNumber(row["NIRF Ranking (Engineering)"], null),
        AcademicUnits: toNumber(row["Number of Academic Units"], null),
        StatesUTsCovered: toNumber(row["States/UTs Covered"], null),
        DirectorOffice: row["Director Contact Details"] || "",
        RegistrarOffice: row["Registrar Contact Details"] || "",
        DegreeCategory: degreeCategory,
        DegreeCount: toNumber(degreeCount),
      });
    }

    const rankingDefs = [
      ["NIRF Overall", row["NIRF Ranking (Overall)"]],
      ["NIRF Engineering", row["NIRF Ranking (Engineering)"]],
    ];

    rankingDefs.forEach(([scheme, rankValue], index) => {
      if (!Number.isFinite(toNumber(rankValue, Number.NaN))) return;
      facts.rankingsAccreditations.push({
        ...b,
        RecordId: `${b.InstituteId}-${b.Year}-ranking-${index + 1}`,
        Category: "Rankings",
        Scheme: scheme,
        StatusOrGrade: `Rank ${toNumber(rankValue)}`,
        Score: toNumber(rankValue),
      });
    });
  }

  for (const row of readSheet(workbook, "D04_Audit Observations")) {
    facts.auditObservations.push({
      ...base(row),
      ObservationId: row["Observation ID"] || "",
      Status: row["Current Status"] || "Not specified",
      AuditType: row["Audit Type"] || "Not specified",
      YearOfAudit: toNumber(row["Year of Audit"], null),
      Department: row["Department / Unit"] || "Not specified",
      ObservationSummary: row["Observation Summary"] || "",
      RuleViolated: row["Rule / Regulation Violated"] || "",
      FinancialImpactCr: round(row["Financial Impact"]),
      CorrectiveAction: row["Corrective Action Taken"] || "",
      Remarks: row.Remarks || "",
    });
  }

  for (const row of readSheet(workbook, "D03_Admission Mode")) {
    const b = base(row);
    const degree = row.Degree || "Not specified";
    const studentCount = toNumber(row["Student Count"]);
    const admissionChannel = row["Admission Channel"] || "Not specified";

    facts.admissionMode.push({
      ...b,
      AdmissionChannel: admissionChannel,
      Program: programFromDegree(degree),
      Degree: degree,
      Discipline: row.Department || "Not specified",
      StudentCount: studentCount,
      Details: row.Details || "",
    });

    facts.entranceExam.push({
      ...b,
      ExamName: admissionChannel,
      ReservationCategory: "All Students",
      StudentCount: studentCount,
      RecordWeight: 1,
      RankScore: studentCount,
      Program: programFromDegree(degree),
      Degree: degree,
      Discipline: row.Department || "Not specified",
    });
  }

  for (const row of readSheet(workbook, "D29_International Students")) {
    const b = base(row);
    const degree = row.Degree || "Not specified";

    facts.intlStudentRecords.push({
      ...b,
      Region: row.Region || "Not specified",
      Country: row.Country || "Not specified",
      Department: row.Department || "Not specified",
      Program: programFromDegree(degree),
      Degree: degree,
      NumberOfStudents: toNumber(row["Number of Students"]),
    });
  }

  const intlAgg = new Map();
  for (const record of facts.intlStudentRecords) {
    const key = `${record.InstituteId}|${record.Year}|${record.Program}`;
    intlAgg.set(key, {
      InstituteId: record.InstituteId,
      Institute: record.Institute,
      State: record.State,
      Year: record.Year,
      Level: record.Program,
      Students: (intlAgg.get(key)?.Students || 0) + record.NumberOfStudents,
    });
  }
  facts.intlStudents = [...intlAgg.values()];

  for (const row of readSheet(workbook, "D50_Student Profile")) {
    const b = base(row);

    for (const [key, value] of Object.entries(row)) {
      if (["Institute", "Year"].includes(key)) continue;
      if (value === null || value === undefined || value === "") continue;

      facts.studentProfileSummary.push({
        ...b,
        StudentSegment: key,
        Students: toNumber(value),
      });
    }
  }

  for (const row of readSheet(workbook, "D49_Student Death Cases")) {
    const b = base(row);
    const rollNumber = row["Roll Number"] || `${instituteShort(b.Institute)}-${b.Year}-STU`;

    facts.studentDeathCases.push({
      ...b,
      CaseId: rollNumber,
      RollNumber: rollNumber,
      Program: row.Program || "Not specified",
      Discipline: row.Discipline || "Not specified",
      YearOfProgram: `Year ${toNumber(row["Year of Program"], 1)}`,
      NatureOfDeath: row["Nature of Death"] || "Not specified",
      DateOfDeath: cleanDate(row["Date of Death"]),
      FirCopyDetails: row["FIR Copy Details"] || "",
      FactFindingCommitteeReportDetails: row["Fact Finding Committee Report Details"] || "",
    });
  }

  for (const row of readSheet(workbook, "D15_Faculty and Staff")) {
    const b = base(row);

    for (const [key, value] of Object.entries(row)) {
      if (["Institute", "Year"].includes(key)) continue;
      if (value === null || value === undefined || value === "") continue;
      if (typeof value === "string" && Number.isNaN(Number(value))) continue;

      facts.facultyStaffSummary.push({
        ...b,
        Bucket: key,
        WorkforceGroup: workforceGroup(key),
        Count: round(value),
      });
    }
  }

  for (const row of readSheet(workbook, "D14_Faculty Research Engagement")) {
    facts.facultyResearchEngagement.push({
      ...base(row),
      Department: row.Department || "Not specified",
      Faculty: row["Faculty Employee ID"] || "",
      FacultyEmployeeId: row["Faculty Employee ID"] || "",
      PublicationsCount: toNumber(row["Publications Count"]),
      CitationsCount: toNumber(row["Citations Count"]),
      HIndex: toNumber(row["H-Index"]),
      DataSource: row["Source (Google Scholar / Scopus / WoS)"] || "Not specified",
      Notes: row.Notes || "",
    });
  }

  for (const row of readSheet(workbook, "D11_Faculty Awards and Recognit")) {
    const b = base(row);
    const faculty = row["Faculty Employee ID"] || "FAC";
    const award = row["Award Name"] || "Award";
    const facultyName =
      facultyDirectory.get(`${b.InstituteId}|${b.Year}|${faculty}`) || faculty;

    facts.facultyAwards.push({
      ...b,
      AwardId: `${faculty}-${award}-${facts.facultyAwards.length}`,
      Level: row["Award Type"] || "Not specified",
      IssuingBody: row["Issuing Body"] || "Not specified",
      FacultyName: facultyName,
      FacultyEmployeeId: faculty,
      AwardName: award,
      AwardDescription: row["Award Description"] || "",
    });
  }

  for (const row of readSheet(workbook, "D28_International Faculty")) {
    const b = base(row);
    const employeeId = row["Employee ID"] || "";
    facts.internationalFacultyRecords.push({
      ...b,
      Name: facultyDirectory.get(`${b.InstituteId}|${b.Year}|${employeeId}`) || employeeId,
      EmployeeId: employeeId,
      Country: row.Country || "International / not specified",
      AppointmentType: row["Appointment Funding Source"] || "Not specified",
      RoleType: row["Role Type"] || "Not specified",
      DegreeLevel: row.Degree || "Not specified",
      Specialisation: row.Specialisation || "",
      CourseTaught: row["Course Taught"] || "",
    });
  }

  for (const row of readSheet(workbook, "D39_Placements and Alumni")) {
    const b = base(row);

    const programDefs = [
      ["UG", row["Percentage Placed (UG)"], row["Median Salary (UG)"]],
      ["PG", row["Percentage Placed (PG)"], row["Median Salary (PG)"]],
      ["PhD", row["Percentage Placed (PhD)"], row["Median Salary (PhD)"]],
    ];

    for (const [program, percentPlaced, median] of programDefs) {
      const registered = Math.round(toNumber(row["Students Registered for Placement"]) / 3);
      const placed = Math.round(registered * (toNumber(percentPlaced) / 100));

      facts.placements.push({
        ...b,
        Program: program,
        Registered: registered,
        Placed: placed,
        AvgCTC_LPA: round(median || row["Median Salary (Total)"]),
        MedianCTC_LPA: round(median || row["Median Salary (Total)"]),
      });
    }

    const outcomes = [
      ["Registered for Placement", row["Students Registered for Placement"]],
      ["Appeared for Placement", row["Students Appeared"]],
      ["Placed On Campus", row["Students Placed (On campus)"]],
      ["Placed Off Campus", row["Students Placed (Off campus)"]],
      ["International Placements", row["International Placements"]],
      ["Higher Education", row["Students Opted for Higher Education"]],
      ["Competitive Exams", row["Students Preparing for Competitive Exams"]],
      ["Entrepreneurship", row["Students Opted for Entrepreneurship"]],
      ["Unplaced", row["No. of Students Unplaced"]],
      ["Companies Registered", row["Companies Registered"]],
    ];

    for (const [outcomeType, studentsCount] of outcomes) {
      facts.placementsAndAlumni.push({
        ...b,
        OutcomeType: outcomeType,
        StudentsCount: toNumber(studentsCount),
      });
    }

    const careerServiceDefs = [
      ["Placement Support", row["Students Registered for Placement"]],
      ["Higher Education Guidance", row["Students Opted for Higher Education"]],
      ["Competitive Exam Guidance", row["Students Preparing for Competitive Exams"]],
      ["Entrepreneurship Guidance", row["Students Opted for Entrepreneurship"]],
    ];

    for (const [serviceType, sessionCount] of careerServiceDefs) {
      facts.careerServices.push({
        ...b,
        ServiceType: serviceType,
        SessionCount: toNumber(sessionCount),
        SourceSheet: "D39_Placements and Alumni",
      });
    }
  }

  for (const row of readSheet(workbook, "D38_Placement Statistics")) {
    const b = base(row);
    const degree = row.Degree || "Not specified";

    facts.placementStatistics.push({
      ...b,
      Department: row.Department || "Not specified",
      Program: programFromDegree(degree),
      Degree: degree,
      Gender: row.Gender || "Not specified",
      SocialCategory: row["Social Category"] || "Not specified",
      StudentNationality: studentNationality(row["Student Nationality"]),
      TotalPlacedCount: toNumber(row["Total Placed Count"]),
      Sector: row["Sector-wise"] || "Not specified",
      JobRole: row["Job Role-wise"] || "Not specified",
      Industry: row["Industry-wise"] || "Not specified",
      EmploymentType: row["Employment Type-wise"] || "Not specified",
      HighestSalary: round(row["Highest Salary"]),
      LowestSalary: round(row["Lowest Salary"]),
      MedianCTC: round(row["Median CTC"]),
    });
  }

  for (const row of readSheet(workbook, "D53_Top Recruiters")) {
    facts.topRecruiters.push({
      ...base(row),
      Company: row.Company || "Not specified",
      StudentsRecruited: toNumber(row["Students Recruited"]),
    });
  }

  for (const row of readSheet(workbook, "D34_PMRF Program")) {
    const b = base(row);
    const scholarshipDefs = [
      ["PMRF Scholars", row["Total Scholars"]],
      ["PMRF Male Scholars", row["Total Male Scholars"]],
      ["PMRF Female Scholars", row["Total Female Scholars"]],
      ["PMRF SC Scholars", row["Total SC Scholars"]],
      ["PMRF ST Scholars", row["Total ST Scholars"]],
      ["PMRF OBC Scholars", row["Total OBC Scholars"]],
      ["PMRF EWS Scholars", row["Total EWS Scholars"]],
      ["PMRF PwD Scholars", row["Total PwD Scholars"]],
    ];

    for (const [typeOffered, numberBeneficiaries] of scholarshipDefs) {
      facts.scholarshipsFellowships.push({
        ...b,
        TypeOffered: typeOffered,
        NumberBeneficiaries: toNumber(numberBeneficiaries),
        SourceSheet: "D34_PMRF Program",
      });
    }
  }

  for (const row of readSheet(workbook, "D35_PMRF Scholar Details")) {
    const b = base(row);
    const careerPath = row["Post PhD Plans (Academia/ Industry/ Entrepreneurship)"] || "Not specified";
    const key = `${b.InstituteId}|${b.Year}|${careerPath}`;
    phdCareerByKey.set(key, {
      ...(phdCareerByKey.get(key) || {
        ...b,
        CareerPath: careerPath,
        Count: 0,
      }),
      Count: (phdCareerByKey.get(key)?.Count || 0) + 1,
    });
  }

  facts.phdAlumniCareerDistribution.push(...phdCareerByKey.values());

  for (const row of readSheet(workbook, "D51_Technology Business Incubat")) {
    const b = base(row);
    const supportType = row["Focus Areas"] || row.Name || "Incubation Support";
    const key = `${b.InstituteId}|${b.Year}|incubator|${supportType}`;
    startupSupportByKey.set(key, {
      ...(startupSupportByKey.get(key) || {
        ...b,
        SupportType: supportType,
        StudentStartups: 0,
      }),
      StudentStartups:
        (startupSupportByKey.get(key)?.StudentStartups || 0) +
        toNumber(row["Number of Startups Supported Annually"]),
    });
  }

  for (const row of readSheet(workbook, "D47_Startup Success Stories")) {
    const b = base(row);
    const supportType = row["Startup Success Stories - Stage"] || "Startup Success Stories";
    const key = `${b.InstituteId}|${b.Year}|startup-stage|${supportType}`;
    startupSupportByKey.set(key, {
      ...(startupSupportByKey.get(key) || {
        ...b,
        SupportType: supportType,
        StudentStartups: 0,
      }),
      StudentStartups: (startupSupportByKey.get(key)?.StudentStartups || 0) + 1,
    });
  }

  facts.entrepreneurshipSupport.push(...startupSupportByKey.values());

  for (const row of readSheet(workbook, "D44_Research and Innovation")) {
    const b = base(row);

    const publicationDefs = [
      ["Journal", row["Total Publications in Q1 Journals"]],
      ["Conference", row["Total Conference Papers"]],
      ["Book Chapter", row["Total Books/Book Chapters Authored"]],
      ["Total Publications", row["Total Publications"]],
    ];

    for (const [type, count] of publicationDefs) {
      facts.publications.push({
        ...b,
        Type: type,
        Discipline: row["Focus Areas (CoE)"] || "All research areas",
        Count: toNumber(count),
      });
    }

    const patentDefs = [
      ["Filed", row["Patents Filed (Total)"]],
      ["Granted", row["Patents Granted (Total)"]],
      ["Licensed", row["Patents Licensed to Industry"]],
      ["Under Review", row["Patents Under Review"]],
      ["Commercialised/Deployed", row["Patents Commercialised/Deployed"]],
    ];

    for (const [status, count] of patentDefs) {
      facts.patents.push({
        ...b,
        Status: status,
        Count: toNumber(count),
      });
    }
  }

  for (const row of readSheet(workbook, "D18_Funding and Financials")) {
    const b = base(row);
    const utilisationRate = toNumber(row["Total Utilisation Rate (%)"], 90) / 100;

    const budgetDefs = [
      ["Total", row["Total Budget Allocation"]],
      ["MoE", row["Budget Allocation (MoE)"]],
      ["State Govt", row["Budget Allocation (State Govt)"]],
      ["HEFA", row["Budget Allocation (HEFA)"]],
      ["Internal Revenue", row["Budget Allocation (Internal Revenue)"]],
      ["Capital", row["Total Budget Allocation (Capital)"]],
      ["Revenue", row["Total Budget Allocation (Revenue)"]],
      ["Carry Forward", row["Budget Carry Forward Amount"]],
      ["Industry/CSR Funds", row["Total Fund Received (Industry/CSR)"]],
      ["National Funds", row["Total Fund Received (National)"]],
      ["International Funds", row["Total Fund Received (International)"]],
      ["HEFA Sanctioned", row["Total Sanctioned Amount (HEFA)"]],
      ["HEFA Pending", row["Total Pending Amount (HEFA)"]],
      ["Endowment Corpus", row["Total Endowment Fund Corpus"]],
      ["Endowment Annual Yield", row["Total Endowment Fund Annual Yield (Interest Income)"]],
      ["Industry/CSR Donors", row["Total Donor Count (Industry/CSR)"]],
      ["National Granting Agencies", row["Granting Agency Count (National)"]],
    ];

    for (const [head, allocated] of budgetDefs) {
      const allocatedCr = round(allocated);
      facts.budget.push({
        ...b,
        Head: head,
        Allocated_Cr: allocatedCr,
        Utilised_Cr: round(allocatedCr * utilisationRate),
      });
    }
  }

  for (const row of readSheet(workbook, "D07_Collaborations Details")) {
    const b = base(row);

    facts.collaborations.push({
      ...b,
      Geography: "Domestic/International",
      Type: "Collaboration",
      Partner: row["Partner Institution"] || "Not specified",
      Sector: row["Department Concerned"] || "Not specified",
      Count: 1,
    });
  }

  const rowCounts = Object.fromEntries(
    FACT_KEYS.map((key) => [key, Array.isArray(facts[key]) ? facts[key].length : 0]),
  );

  facts.meta = {
    generatedAt: new Date().toISOString(),
    sourceWorkbook: path.basename(EXCEL_PATH),
    dataMode: "excel-only workbook facts",
    institutesIncluded: Object.keys(INSTITUTE_META),
    yearsIncluded: [2021, 2022, 2023, 2024, 2025],
    factRowCounts: rowCounts,
    emptyFacts: FACT_KEYS.filter((key) => rowCounts[key] === 0),
  };

  return facts;
}

function writeWorkbookFactsModule(facts) {
  const moduleSource = `// Generated from ${path.basename(EXCEL_PATH)} by update-mock-data-from-excel.mjs
// The dashboard now treats workbook-derived facts as the single source of truth.

export const WORKBOOK_FACTS = ${JSON.stringify(facts, null, 2)};

export function getWorkbookFacts() {
  return WORKBOOK_FACTS;
}

export default WORKBOOK_FACTS;
`;

  fs.writeFileSync(WORKBOOK_FACTS_PATH, moduleSource, "utf8");

  console.log("Generated workbook facts module:");
  console.log(WORKBOOK_FACTS_PATH);
  console.log("");
  console.log("Rows added:");
  console.table(
    Object.fromEntries(
      FACT_KEYS.map((key) => [key, Array.isArray(facts[key]) ? facts[key].length : 0]),
    ),
  );
}

if (!fs.existsSync(EXCEL_PATH)) {
  throw new Error(`Excel file not found: ${EXCEL_PATH}`);
}

const workbook = XLSX.readFile(EXCEL_PATH, { cellDates: true });
const facts = buildFacts(workbook);
writeWorkbookFactsModule(facts);
