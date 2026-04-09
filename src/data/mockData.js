import { clamp, sumBy } from "../utils/helpers";
import { IITs, MONTHS, YEARS } from "../constants";
import { mulberry32, hashSeed } from "../utils/helpers";

// ----------------------------- Mock data generator -----------------------------
export function makeMockFacts(seedStr = "IITMIS_DEMO") {
  const rand = mulberry32(hashSeed(seedStr));

  const programs     = ["BTech", "MTech", "PhD", "MSc", "MBA", "BDes"];
  const disciplines  = ["CSE", "EE", "ME", "CE", "Chem", "Physics", "Math", "Bio", "Mgmt"];
  const genders      = ["Male", "Female", "Other"];
  const categories   = ["GEN", "OBC", "SC", "ST", "EWS"];

  const pubTypes     = ["Journal", "Conference", "Book Chapter"];
  const patentStatus = ["Filed", "Published", "Granted"];
  const budgetHeads  = ["Total", "Research", "Scholarships", "Capex", "Opex"];
  const partnerTypes = ["MoU", "Research", "Exchange", "Industry"];
  const partnerGeo   = ["Domestic", "International"];

  const enrollment     = [];
  const placements     = [];
  const publications   = [];
  const patents        = [];
  const budget         = [];
  const collaborations = [];
  const intlStudents   = [];
  const monthly        = [];
  const institutionalProfile = [];
  const academicPrograms = [];
  const governancePolicy = [];
  const rankingsAccreditations = [];
  const auditObservations = [];
  const courtCases = [];

  const entranceExam = [];
  const studentProfileSummary = [];
  const intlStudentRecords = [];
  const enrollmentDetails = [];
  const admissionMode = [];
  const studentDeathCases = [];
  const facultyStaffSummary = [];
  const facultyResearchEngagement = [];
  const missionRecruitment = [];
  const facultyAwards = [];
  const internationalFacultyRecords = [];
  const medicalStaffDetails = [];
  const medicalStaffSummary = [];
  const entrepreneurshipSupport = [];
  const careerServices = [];
  const counsellingServices = [];
  const scholarshipsFellowships = [];
  const alumniEngagement = [];
  const alumniNetwork = [];
  const phdAlumniCareerDistribution = [];
  const placementsAndAlumni = [];
  const placementStatistics = [];
  const topRecruiters = [];

  for (const inst of IITs) {
    for (const year of YEARS) {

      // Enrollment
      for (const p of programs) {
        for (const d of disciplines) {
          const base =
            (p === "BTech"  ? 1400 :
             p === "MTech"  ? 650  :
             p === "PhD"    ? 420  :
             p === "MSc"    ? 380  :
             p === "MBA"    ? 180  : 120) *
            (0.8 + rand() * 0.6) *
            (0.85 + (year - 2021) * 0.03);

          for (const g of genders) {
            for (const c of categories) {
              const gMul = g === "Male" ? 0.62 : g === "Female" ? 0.36 : 0.02;
              const cMul = c === "GEN"  ? 0.36 : c === "OBC"    ? 0.36 : c === "SC" ? 0.16 : c === "ST" ? 0.07 : 0.05;
              const noise    = 0.85 + rand() * 0.3;
              const students = Math.max(0, Math.round(base * gMul * cMul * noise));
              enrollment.push({
                InstituteId: inst.id,
                Institute:   inst.name,
                State:       inst.state,
                Year:        year,
                Program:     p,
                Discipline:  d,
                Gender:      g,
                Category:    c,
                Students:    students,
              });
            }
          }
        }
      }

      // International students
      for (const lvl of ["UG", "PG", "PhD"]) {
        const v = Math.round(
          (lvl === "UG" ? 45 : lvl === "PG" ? 70 : 35) * (0.6 + rand() * 1.0)
        );
        intlStudents.push({ InstituteId: inst.id, Institute: inst.name, Year: year, Level: lvl, Students: v });
      }

      // Placements
      for (const p of ["BTech", "MTech", "MBA"]) {
        const registered = Math.round(
          (p === "MBA" ? 180 : p === "MTech" ? 520 : 1250) * (0.75 + rand() * 0.25)
        );
        const placed  = Math.round(registered * (0.72 + rand() * 0.2));
        const avgCtc  = (p === "MBA" ? 28 : p === "MTech" ? 22 : 18) * (0.85 + rand() * 0.35);
        const medCtc  = avgCtc * (0.8 + rand() * 0.18);
        placements.push({
          InstituteId:    inst.id,
          Institute:      inst.name,
          Year:           year,
          Program:        p,
          Registered:     registered,
          Placed:         placed,
          AvgCTC_LPA:     Number(avgCtc.toFixed(1)),
          MedianCTC_LPA:  Number(medCtc.toFixed(1)),
        });
      }

      // Publications
      for (const t of pubTypes) {
        for (const d of disciplines) {
          const base2 = t === "Journal" ? 220 : t === "Conference" ? 340 : 80;
          const pubs  = Math.round(base2 * (0.65 + rand() * 0.7) * (0.85 + (year - 2021) * 0.04));
          publications.push({ InstituteId: inst.id, Institute: inst.name, Year: year, Type: t, Discipline: d, Count: pubs });
        }
      }

      // Patents
      for (const s of patentStatus) {
        const base2 = s === "Filed" ? 55 : s === "Published" ? 40 : 18;
        const v     = Math.round(base2 * (0.65 + rand() * 0.9) * (0.85 + (year - 2021) * 0.06));
        patents.push({ InstituteId: inst.id, Institute: inst.name, Year: year, Status: s, Count: v });
      }

      // Budget
      for (const h of budgetHeads) {
        const base2   = h === "Total" ? 900 : h === "Capex" ? 260 : h === "Opex" ? 240 : h === "Research" ? 220 : 120;
        const valueCr = base2 * (0.7 + rand() * 0.8) * (0.85 + (year - 2021) * 0.05);
        const util    = clamp(0.78 + rand() * 0.18, 0.6, 0.98);
        budget.push({
          InstituteId: inst.id,
          Institute:   inst.name,
          Year:        year,
          Head:        h,
          Allocated_Cr: Number(valueCr.toFixed(1)),
          Utilised_Cr:  Number((valueCr * util).toFixed(1)),
        });
      }

      // Collaborations
      for (const g of partnerGeo) {
        for (const t of partnerTypes) {
          const base2 = g === "International" ? 18 : 35;
          const v     = Math.round(base2 * (0.6 + rand() * 1.2));
          collaborations.push({ InstituteId: inst.id, Institute: inst.name, Year: year, Geography: g, Type: t, Count: v });
        }
      }

      // Monthly KPI
      let lvl = 1.0 + rand() * 0.4;
      for (let mi = 0; mi < 12; mi++) {
        lvl = clamp(lvl + (rand() - 0.5) * 0.12, 0.6, 1.5);
        const instValue = 6_000_000 * lvl * (0.85 + (year - 2021) * 0.04) * (0.9 + rand() * 0.2);
        monthly.push({
          InstituteId: inst.id,
          Institute:   inst.name,
          Year:        year,
          Month:       MONTHS[mi],
          Value:       Math.round(instValue),
        });
      }


      // Institution & Governance — Institutional Profile
      for (const degree of ["Engineering", "Science", "HSS", "Management", "Interdisciplinary"]) {
        const degreeCount = Math.round((degree === "Engineering" ? 42 : degree === "Science" ? 18 : degree === "HSS" ? 8 : degree === "Management" ? 6 : 10) * (0.85 + rand() * 0.35));
        institutionalProfile.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          DegreeCategory: degree,
          DegreeCount: degreeCount,
          AcademicUnits: `${Math.round(8 + rand() * 10)} Departments, ${Math.round(2 + rand() * 4)} Schools, ${Math.round(2 + rand() * 6)} Centres`,
          StatesUTsCovered: Math.round(18 + rand() * 10),
          NIRFOverallRank: Math.max(1, Math.round((8 + rand() * 20) - (year - 2021) * 0.5)),
          NIRFEngineeringRank: Math.max(1, Math.round((6 + rand() * 18) - (year - 2021) * 0.4)),
          DirectorOffice: `director@${inst.id.toLowerCase()}.ac.in`,
          RegistrarOffice: `registrar@${inst.id.toLowerCase()}.ac.in`,
        });
      }

      // Institution & Governance — Academic Programs
      for (const degree of ["BTech", "MTech", "PhD", "MSc", "MBA"]) {
        for (const dept of ["Computer Science", "Electrical", "Mechanical", "Civil", "Physics", "Management"]) {
          for (const mode of ["On-campus", "Hybrid", "Online"]) {
            const programName = `${degree} in ${dept}`;
            academicPrograms.push({
              InstituteId: inst.id,
              Institute: inst.name,
              Year: year,
              Degree: degree,
              Department: dept,
              ModeOfDelivery: mode,
              ProgramName: programName,
              DurationYears: degree === "PhD" ? 5 : degree === "MTech" || degree === "MSc" || degree === "MBA" ? 2 : 4,
              LaunchYear: Math.max(2008, year - Math.round(rand() * 10) - (degree === "BTech" ? 10 : 4)),
              FacultyCurrentlyTeaching: Math.round((degree === "BTech" ? 24 : degree === "PhD" ? 16 : 10) * (0.7 + rand() * 0.5)),
            });
          }
        }
      }

      // Institution & Governance — Governance and Policy
      for (const theme of ["Anti-Ragging & Grievance", "Internal QA Mechanisms", "Institutional Governance Structure", "Diversity & Inclusion"]) {
        for (const status of ["Operational", "Strengthening", "Review due"]) {
          const casesReported = Math.max(1, Math.round((theme === "Anti-Ragging & Grievance" ? 18 : theme === "Internal QA Mechanisms" ? 10 : 6) * (0.7 + rand() * 0.6)));
          const casesResolved = Math.min(casesReported, Math.max(0, Math.round(casesReported * (0.72 + rand() * 0.22))));
          governancePolicy.push({
            InstituteId: inst.id,
            Institute: inst.name,
            Year: year,
            Theme: theme,
            Status: status,
            CasesReported: casesReported,
            CasesResolved: casesResolved,
            PortalMode: theme === "Anti-Ragging & Grievance" ? ["Portal integrated", "Manual upload", "Hybrid sync"][Math.floor(rand() * 3)] : "Structured review",
            CommitteeType: theme === "Internal QA Mechanisms" ? "IQAC" : theme === "Institutional Governance Structure" ? "BoG / Senate" : "Standing committee",
          });
        }
      }

      // Institution & Governance — Rankings & Accreditations
      for (const record of [
        ["Rankings", "NIRF", "Overall"],
        ["Rankings", "QS", "Global"],
        ["Rankings", "THE", "Global"],
        ["Accreditations", "NAAC", "Institutional"],
        ["Accreditations", "NBA", "Programme"],
        ["Quality Certifications", "ISO 9001", "Certification"],
      ]) {
        const [category, scheme, statusLabel] = record;
        rankingsAccreditations.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          RecordId: `${inst.id}-${year}-${scheme}-${statusLabel}`,
          Category: category,
          Scheme: scheme,
          StatusOrGrade: scheme === "NAAC" ? ["A++", "A+", "A"][Math.floor(rand() * 3)] : scheme === "NBA" ? ["Accredited", "Renewal due"][Math.floor(rand() * 2)] : scheme === "NIRF" ? `Rank ${Math.max(1, Math.round(5 + rand() * 20))}` : scheme === "QS" ? `Band ${Math.max(150, Math.round(150 + rand() * 250))}` : scheme === "THE" ? `Band ${Math.max(200, Math.round(200 + rand() * 300))}` : "Valid",
          Score: Number((60 + rand() * 35).toFixed(1)),
        });
      }

      // Institution & Governance — Audit Observations
      for (let idx = 1; idx <= 12; idx++) {
        auditObservations.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          ObservationId: `${inst.id}-${year}-AUD-${idx}`,
          Status: ["Under Review", "In Progress", "Mitigated", "Closed"][Math.floor(rand() * 4)],
          AuditType: ["Internal", "Statutory", "CAG", "Process"][Math.floor(rand() * 4)],
          Department: ["Finance", "Academic", "Hostel", "Research", "Procurement"][Math.floor(rand() * 5)],
          FinancialImpactCr: Number((rand() * 8).toFixed(2)),
          CorrectiveAction: "Corrective action plan logged and tracked.",
        });
      }

      // Institution & Governance — Court Cases
      for (let idx = 1; idx <= 10; idx++) {
        courtCases.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          CaseId: `${inst.id}-${year}-CASE-${idx}`,
          Status: ["Open", "Closed", "Judgement pending", "Compliance review"][Math.floor(rand() * 4)],
          CourtName: ["High Court", "District Court", "Tribunal", "Supreme Court"][Math.floor(rand() * 4)],
          NatureOfCase: ["Service matter", "Contract", "Procurement", "Property", "Student grievance"][Math.floor(rand() * 5)],
          AgeBucket: ["<90 days", "90–180 days", "180–365 days", ">365 days"][Math.floor(rand() * 4)],
          FinancialImplicationCr: Number((rand() * 15).toFixed(2)),
          NextHearingMonth: MONTHS[Math.floor(rand() * 12)],
        });
      }
      // People & Student Life — Entrance Exam
      for (const examName of ["JEE Advanced", "JAM", "GATE", "CAT"]) {
        for (const reservationCategory of ["General", "OBC", "SC", "ST", "EWS"]) {
          const baseRank = examName === "JEE Advanced" ? 1800 : examName === "JAM" ? 140 : examName === "GATE" ? 480 : 55;
          const rankScore = Math.max(1, Math.round(baseRank * (0.75 + rand() * 0.45)));
          entranceExam.push({
            InstituteId: inst.id,
            Institute: inst.name,
            Year: year,
            ExamRecordId: `${inst.id}-${year}-${examName}-${reservationCategory}`,
            ExamName: examName,
            RankScore: rankScore,
            CategoryRank: Math.max(1, Math.round(rankScore * (0.2 + rand() * 0.18))),
            CutoffRank: Math.max(1, Math.round(rankScore * (1.08 + rand() * 0.18))),
            QuotaCategory: ["AI", "HS", "Institute"][Math.floor(rand() * 3)],
            ReservationCategory: reservationCategory,
            RecordWeight: 1,
          });
        }
      }

      // People & Student Life — Student Profile summary
      for (const segment of [
        ["UG Enrolled", 5800],
        ["PG Enrolled", 1900],
        ["PhD Enrolled", 1050],
        ["Postdoctoral Enrolled", 120],
        ["Male Students", 5200],
        ["Female Students", 3400],
        ["Other Students", 35],
        ["International Students", 210],
      ]) {
        studentProfileSummary.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          StudentSegment: segment[0],
          Students: Math.max(1, Math.round(segment[1] * (0.82 + rand() * 0.32))),
        });
      }

      // People & Student Life — International Students
      for (const [region, countries] of Object.entries({
        Asia: ["Nepal", "Bangladesh", "Sri Lanka"],
        Africa: ["Kenya", "Nigeria"],
        Europe: ["Germany", "France"],
        Americas: ["USA", "Brazil"],
        Oceania: ["Australia"],
      })) {
        for (const country of countries) {
          for (const program of ["UG", "PG", "PhD"]) {
            intlStudentRecords.push({
              InstituteId: inst.id,
              Institute: inst.name,
              Year: year,
              Region: region,
              Country: country,
              Program: program,
              Degree: program,
              NumberOfStudents: Math.max(1, Math.round((program === "PhD" ? 8 : program === "PG" ? 14 : 6) * (0.7 + rand() * 1.2))),
            });
          }
        }
      }

      // People & Student Life — Enrollment Details
      for (const program of ["UG", "PG", "PhD"]) {
        for (const academicArea of ["Engineering", "Sciences", "Humanities", "Management"]) {
          for (const discipline of ["Computer Science", "Electrical", "Mechanical", "Physics", "Economics"]) {
            for (const gender of ["Male", "Female", "Other"]) {
              for (const socialCategory of ["General", "OBC", "SC", "ST", "EWS"]) {
                const enrollmentCount = Math.max(0, Math.round((program === "UG" ? 220 : program === "PG" ? 95 : 55) * (0.72 + rand() * 0.65)));
                const dropoutCount = Math.max(0, Math.round(enrollmentCount * (0.006 + rand() * 0.035)));
                enrollmentDetails.push({
                  InstituteId: inst.id,
                  Institute: inst.name,
                  Year: year,
                  Program: program,
                  AcademicArea: academicArea,
                  Discipline: discipline,
                  Degree: program,
                  Gender: gender,
                  SocialCategory: socialCategory,
                  Enrollment: enrollmentCount,
                  DropoutCount: dropoutCount,
                  DropoutRate: enrollmentCount ? dropoutCount / enrollmentCount : 0,
                });
              }
            }
          }
        }
      }

      // People & Student Life — Admission Mode
      for (const admissionChannel of ["JEE Advanced", "JAM", "GATE", "CAT", "Institute Process"]) {
        for (const program of ["BTech", "MTech", "PhD", "MBA"]) {
          for (const discipline of ["Computer Science", "Electrical", "Mechanical", "Physics", "Management"]) {
            admissionMode.push({
              InstituteId: inst.id,
              Institute: inst.name,
              Year: year,
              AdmissionChannel: admissionChannel,
              Program: program,
              Degree: program,
              Discipline: discipline,
              StudentCount: Math.max(1, Math.round((program === "BTech" ? 320 : program === "MTech" ? 120 : program === "PhD" ? 70 : 55) * (0.65 + rand() * 0.6))),
            });
          }
        }
      }

      // People & Student Life — Student Death Cases (restricted)
      for (let idx = 1; idx <= 3; idx++) {
        studentDeathCases.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          CaseId: `${inst.id}-${year}-SD-${idx}`,
          Program: ["BTech", "MTech", "PhD"][Math.floor(rand() * 3)],
          Discipline: ["Computer Science", "Electrical", "Mechanical", "Physics"][Math.floor(rand() * 4)],
          YearOfProgram: ["Year 1", "Year 2", "Year 3", "Year 4"][Math.floor(rand() * 4)],
          Gender: ["Male", "Female"][Math.floor(rand() * 2)],
          SocialCategory: ["General", "OBC", "SC", "ST", "EWS"][Math.floor(rand() * 5)],
          NatureOfDeath: ["Accident", "Natural causes", "Suicide"][Math.floor(rand() * 3)],
          DateOfDeath: `${year}-0${1 + Math.floor(rand() * 8)}-${String(10 + Math.floor(rand() * 18)).padStart(2, '0')}`,
        });
      }

      // People & Student Life — Faculty & Staff
      for (const [bucket, base] of [
        ["Total Faculty Strength", 760],
        ["Sanctioned Positions", 1100],
        ["In Position", 760],
        ["Vacant Positions", 340],
        ["Contract Positions", 48],
        ["Total Staff Strength", 1180],
      ]) {
        facultyStaffSummary.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          Bucket: bucket,
          Count: Math.max(0, Math.round(base * (0.84 + rand() * 0.24))),
        });
      }

      for (const department of ["Computer Science", "Electrical", "Mechanical", "Civil", "Physics"]) {
        for (let idx = 1; idx <= 4; idx++) {
          const facultyName = `${department.split(' ')[0]} Faculty ${idx}`;
          facultyResearchEngagement.push({
            InstituteId: inst.id,
            Institute: inst.name,
            Year: year,
            Department: department,
            Faculty: facultyName,
            PublicationsCount: Math.max(1, Math.round((8 + rand() * 18) * (0.8 + rand() * 0.5))),
            CitationsCount: Math.max(10, Math.round((120 + rand() * 380) * (0.75 + rand() * 0.5))),
            HIndex: Math.max(2, Math.round(6 + rand() * 18)),
            DataSource: ["Google Scholar", "Scopus", "Web of Science"][Math.floor(rand() * 3)],
          });
        }
      }

      for (const tranche of [1, 2, 3, 4]) {
        missionRecruitment.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          Tranche: `Tranche ${tranche}`,
          TotalCount: Math.max(1, Math.round((18 + tranche * 7) * (0.65 + rand() * 0.55))),
          FacultyCount: Math.max(1, Math.round((10 + tranche * 4) * (0.65 + rand() * 0.55))),
          NonTeachingCount: Math.max(1, Math.round((8 + tranche * 3) * (0.65 + rand() * 0.55))),
        });
      }

      for (const level of ["Institute", "National", "International"]) {
        for (const body of ["DST", "INSA", "IEEE", "Elsevier"]) {
          facultyAwards.push({
            InstituteId: inst.id,
            Institute: inst.name,
            Year: year,
            AwardId: `${inst.id}-${year}-${level}-${body}`,
            Level: level,
            IssuingBody: body,
            FacultyName: `${body} Awardee ${Math.floor(rand() * 9) + 1}`,
            AwardName: `${body} Distinguished Award`,
          });
        }
      }

      for (const country of ["USA", "Germany", "France", "Japan", "Australia"]) {
        for (const appointmentType of ["Visiting", "Adjunct", "Full-time"]) {
          internationalFacultyRecords.push({
            InstituteId: inst.id,
            Institute: inst.name,
            Year: year,
            Name: `${country} Scholar ${Math.floor(rand() * 15) + 1}`,
            Country: country,
            AppointmentType: appointmentType,
            RoleType: ["Teaching", "Research", "Joint Appointment"][Math.floor(rand() * 3)],
            DegreeLevel: ["UG", "PG", "PhD"][Math.floor(rand() * 3)],
            Specialisation: ["AI", "Energy", "Materials", "Policy"][Math.floor(rand() * 4)],
          });
        }
      }

      // People & Student Life — Student Support System
      for (const role of ["Doctor", "Nurse", "Paramedic", "Counsellor", "Emergency Response"]) {
        for (let idx = 1; idx <= 3; idx++) {
          medicalStaffDetails.push({
            InstituteId: inst.id,
            Institute: inst.name,
            Year: year,
            EmployeeId: `${inst.id}-${year}-${role}-${idx}`,
            EmployeeName: `${role} ${idx}`,
            EmployeeRole: role,
            DutyHours: 8 + Math.floor(rand() * 4),
          });
        }
      }
      for (const [staffType, base] of [["Doctors", 18], ["Nurses", 30], ["Paramedics / First Aid", 12], ["Mental Health Professionals", 6], ["Emergency Response", 9]]) {
        medicalStaffSummary.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          StaffType: staffType,
          Count: Math.max(1, Math.round(base * (0.82 + rand() * 0.28))),
        });
      }
      for (const supportType of ["Incubation Centres", "Seed Funding", "Mentorship Programmes", "Industry Linkages"]) {
        entrepreneurshipSupport.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          SupportType: supportType,
          StudentStartups: Math.max(1, Math.round((supportType === "Incubation Centres" ? 22 : 14) * (0.7 + rand() * 0.8))),
        });
      }
      for (const serviceType of ["Placement Statistics", "Internships", "Career Guidance", "Alumni Mentoring", "Industry Feedback"]) {
        careerServices.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          ServiceType: serviceType,
          SessionCount: Math.max(1, Math.round((serviceType === "Career Guidance" ? 42 : 24) * (0.7 + rand() * 0.7))),
        });
      }
      for (const serviceType of ["Personal Counselling", "Academic Counselling", "Wellbeing Workshops", "Crisis Support"]) {
        counsellingServices.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          ServiceType: serviceType,
          NumberCounsellors: Math.max(2, Math.round(4 + rand() * 5)),
          StudentsAvailed: Math.max(10, Math.round((serviceType === "Personal Counselling" ? 240 : 110) * (0.7 + rand() * 0.8))),
        });
      }
      for (const typeOffered of ["Merit Scholarship", "Need-based Fellowship", "Research Fellowship", "International Mobility Grant"]) {
        scholarshipsFellowships.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          TypeOffered: typeOffered,
          NumberBeneficiaries: Math.max(5, Math.round((typeOffered === "Research Fellowship" ? 180 : 95) * (0.7 + rand() * 0.8))),
        });
      }

      // People & Student Life — Placements & Alumni
      for (const programName of ["Distinguished Alumni Talks", "Alumni Mentoring", "Regional Meet", "Startup Connect"]) {
        alumniEngagement.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          ProgramName: programName,
          Mode: ["Online", "Hybrid", "Offline"][Math.floor(rand() * 3)],
          ParticipationMetric: Math.max(10, Math.round((programName === "Alumni Mentoring" ? 220 : 110) * (0.72 + rand() * 0.65))),
        });
      }
      for (const chapterRegion of ["India", "North America", "Europe", "Asia Pacific", "Middle East"]) {
        alumniNetwork.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          ChapterRegion: chapterRegion,
          ActiveMembers: Math.max(30, Math.round((chapterRegion === "India" ? 2400 : 520) * (0.72 + rand() * 0.55))),
        });
      }
      for (const careerPath of ["Academia", "Postdoctoral", "Industry R&D", "National Labs", "Technology Leadership", "Entrepreneurship"]) {
        phdAlumniCareerDistribution.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          CareerPath: careerPath,
          Count: Math.max(1, Math.round((careerPath === "Academia" ? 85 : careerPath === "Industry R&D" ? 70 : 34) * (0.75 + rand() * 0.55))),
        });
      }
      for (const [outcomeType, base] of [["Placed On Campus", 1120], ["Placed Off Campus", 160], ["Higher Education", 135], ["International Placements", 42], ["Entrepreneurship", 38], ["Unplaced", 145]]) {
        placementsAndAlumni.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          OutcomeType: outcomeType,
          StudentsCount: Math.max(1, Math.round(base * (0.7 + rand() * 0.5))),
        });
      }
      for (const program of ["UG", "PG", "PhD"]) {
        for (const gender of ["Male", "Female", "Other"]) {
          for (const socialCategory of ["General", "OBC", "SC", "ST", "EWS"]) {
            for (const nationality of ["Domestic", "International"]) {
              placementStatistics.push({
                InstituteId: inst.id,
                Institute: inst.name,
                Year: year,
                Program: program,
                Degree: program,
                Gender: gender,
                SocialCategory: socialCategory,
                StudentNationality: nationality,
                TotalPlacedCount: Math.max(1, Math.round((program === "UG" ? 95 : program === "PG" ? 48 : 18) * (0.72 + rand() * 0.6))),
                HighestSalary: Math.round((program === "UG" ? 2800000 : program === "PG" ? 3600000 : 2400000) * (0.9 + rand() * 1.6)),
                LowestSalary: Math.round((program === "UG" ? 600000 : program === "PG" ? 750000 : 720000) * (0.9 + rand() * 0.5)),
                MedianCTC: Math.round((program === "UG" ? 1450000 : program === "PG" ? 1800000 : 1550000) * (0.9 + rand() * 0.6)),
              });
            }
          }
        }
      }
      for (const company of ["Google", "Microsoft", "TCS Research", "NVIDIA", "Texas Instruments", "McKinsey", "Flipkart", "L&T"]) {
        topRecruiters.push({
          InstituteId: inst.id,
          Institute: inst.name,
          Year: year,
          Company: company,
          StudentsRecruited: Math.max(3, Math.round((company === "Google" || company === "Microsoft" ? 28 : 14) * (0.7 + rand() * 0.8))),
        });
      }
    }
  }

  return {
    enrollment,
    placements,
    publications,
    patents,
    budget,
    collaborations,
    intlStudents,
    monthly,
    institutionalProfile,
    academicPrograms,
    governancePolicy,
    rankingsAccreditations,
    auditObservations,
    courtCases,
    entranceExam,
    studentProfileSummary,
    intlStudentRecords,
    enrollmentDetails,
    admissionMode,
    studentDeathCases,
    facultyStaffSummary,
    facultyResearchEngagement,
    missionRecruitment,
    facultyAwards,
    internationalFacultyRecords,
    medicalStaffDetails,
    medicalStaffSummary,
    entrepreneurshipSupport,
    careerServices,
    counsellingServices,
    scholarshipsFellowships,
    alumniEngagement,
    alumniNetwork,
    phdAlumniCareerDistribution,
    placementsAndAlumni,
    placementStatistics,
    topRecruiters,
    meta: { generatedAt: new Date().toISOString() },
  };
}
