// Excel source: MIS Drill-Down Tables_hierarchy-drill-map.xlsx
// Sheet: Hierarchy Drill Map, headers from row 4.
// Scope implemented here: Faculty & Staff → Faculty and Staff only.

export const HIERARCHY_DRILL_MAP = [
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 1,
    mergedBroadHierarchy: "People / Workforce",
    hierarchyKey: "vacancy-staffing",
    pathwaySpecificHierarchyLabel: "Vacancy / staffing",
    drillFlow: "total_sanctioned_positions(Int) -> total_in_position(Int), total_vacant_positions(Int), total_vacancy_(Percent)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_sanctioned_positions",
    children: ["total_in_position", "total_vacant_positions", "total_vacancy_percent"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 2,
    mergedBroadHierarchy: "People / Workforce | Student & Diversity",
    hierarchyKey: "diversity",
    pathwaySpecificHierarchyLabel: "Workforce composition + Diversity (social category)",
    drillFlow: "total_faculty_strength(Int) -> faculty_category_general(Int), faculty_category_sc(Int), faculty_category_st(Int), faculty_category_obc(Int), faculty_category_ews(Int), faculty_category_pwd(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_faculty_strength",
    children: ["faculty_category_general", "faculty_category_sc", "faculty_category_st", "faculty_category_obc", "faculty_category_ews", "faculty_category_pwd"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 3,
    mergedBroadHierarchy: "People / Workforce | Student & Diversity",
    hierarchyKey: "diversity",
    pathwaySpecificHierarchyLabel: "Workforce composition + Diversity (gender)",
    drillFlow: "total_faculty_strength(Int) -> faculty_gender_male(Int), faculty_gender_female(Int), faculty_gender_other(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_faculty_strength",
    children: ["faculty_gender_male", "faculty_gender_female", "faculty_gender_other"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 4,
    mergedBroadHierarchy: "People / Workforce",
    hierarchyKey: "workforce-composition",
    pathwaySpecificHierarchyLabel: "Workforce composition (age profile)",
    drillFlow: "total_faculty_strength(Int) -> faculty_age_35(Int), faculty_age_35_to_50(Int), faculty_age_50(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_faculty_strength",
    children: ["faculty_age_35", "faculty_age_35_to_50", "faculty_age_50"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 5,
    mergedBroadHierarchy: "People / Workforce",
    hierarchyKey: "workforce-composition",
    pathwaySpecificHierarchyLabel: "Workforce composition (qualification / experience)",
    drillFlow: "total_faculty_strength(Int) -> faculty_with_phd_(Percent), faculty_with_postdoc_(Percent), average_teaching_experience_years(Float)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_faculty_strength",
    children: ["faculty_with_phd_percent", "faculty_with_postdoc_percent", "average_teaching_experience_years"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 6,
    mergedBroadHierarchy: "People / Workforce | Student & Diversity | Geographic",
    hierarchyKey: "diversity",
    pathwaySpecificHierarchyLabel: "International faculty + Diversity (gender)",
    drillFlow: "total_international_faculty(Int) -> international_faculty_male(Int), international_faculty_female(Int), international_faculty_other_gender(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_international_faculty",
    children: ["international_faculty_male", "international_faculty_female", "international_faculty_other_gender"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 7,
    mergedBroadHierarchy: "People / Workforce",
    hierarchyKey: "workforce-composition",
    pathwaySpecificHierarchyLabel: "Workforce composition (visiting / adjunct type)",
    drillFlow: "total_visitingadjunct_faculty(Int) -> adjunct_faculty_national(Int), adjunct_faculty_international(Int), adjunct_faculty_industry(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_visitingadjunct_faculty",
    children: ["adjunct_faculty_national", "adjunct_faculty_international", "adjunct_faculty_industry"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 8,
    mergedBroadHierarchy: "People / Workforce | Student & Diversity",
    hierarchyKey: "diversity",
    pathwaySpecificHierarchyLabel: "Adjunct faculty + Diversity (social category)",
    drillFlow: "total_visitingadjunct_faculty(Int) -> adjunct_faculty_category_general(Int), adjunct_faculty_category_sc(Int), adjunct_faculty_category_st(Int), adjunct_faculty_category_obc(Int), adjunct_faculty_category_ews(Int), adjunct_faculty_category_pwd(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_visitingadjunct_faculty",
    children: ["adjunct_faculty_category_general", "adjunct_faculty_category_sc", "adjunct_faculty_category_st", "adjunct_faculty_category_obc", "adjunct_faculty_category_ews", "adjunct_faculty_category_pwd"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 9,
    mergedBroadHierarchy: "People / Workforce | Student & Diversity",
    hierarchyKey: "diversity",
    pathwaySpecificHierarchyLabel: "Adjunct faculty + Diversity (gender)",
    drillFlow: "total_visitingadjunct_faculty(Int) -> adjunct_faculty_male(Int), adjunct_faculty_female(Int), adjunct_faculty_other_gender(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_visitingadjunct_faculty",
    children: ["adjunct_faculty_male", "adjunct_faculty_female", "adjunct_faculty_other_gender"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 10,
    mergedBroadHierarchy: "People / Workforce",
    hierarchyKey: "workforce-composition",
    pathwaySpecificHierarchyLabel: "Staff category",
    drillFlow: "non_teaching_staff_number(Int) -> non_teaching_staff_group_a(Int), non_teaching_staff_group_b(Int), non_teaching_staff_group_c(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "non_teaching_staff_number",
    children: ["non_teaching_staff_group_a", "non_teaching_staff_group_b", "non_teaching_staff_group_c"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 11,
    mergedBroadHierarchy: "People / Workforce",
    hierarchyKey: "vacancy-staffing",
    pathwaySpecificHierarchyLabel: "Vacancy / staffing",
    drillFlow: "non_teaching_staff_sanctioned(Int) -> non_teaching_staff_in_position(Int), non_teaching_staff_vacant(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "non_teaching_staff_sanctioned",
    children: ["non_teaching_staff_in_position", "non_teaching_staff_vacant"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 12,
    mergedBroadHierarchy: "People / Workforce | Student & Diversity",
    hierarchyKey: "diversity",
    pathwaySpecificHierarchyLabel: "Staff category + Diversity (social category)",
    drillFlow: "non_teaching_staff_number(Int) -> non_teaching_staff_general(Int), non_teaching_staff_obc(Int), non_teaching_staff_sc(Int), non_teaching_staff_st(Int), non_teaching_staff_ews(Int), non_teaching_staff_pwd(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "non_teaching_staff_number",
    children: ["non_teaching_staff_general", "non_teaching_staff_obc", "non_teaching_staff_sc", "non_teaching_staff_st", "non_teaching_staff_ews", "non_teaching_staff_pwd"],
  },
  {
    mainSheetRow: 30,
    module: "Faculty & Staff",
    table: "Faculty and Staff",
    pathwayNo: 13,
    mergedBroadHierarchy: "People / Workforce | Awards & Recognition",
    hierarchyKey: "workforce-composition",
    pathwaySpecificHierarchyLabel: "Faculty awards split",
    drillFlow: "Total Faculty Awards (calc) -> total_faculty_awards_national(Int) -> total_faculty_awards_international(Int)",
    originalRowLevelHierarchyLabels: "Workforce-composition hierarchy | Diversity hierarchy | Vacancy / staffing hierarchy",
    rootField: "total_faculty_awards",
    children: ["total_faculty_awards_national", "total_faculty_awards_international"],
  },
];

export const FACULTY_STAFF_PATHWAY_METRICS = Object.fromEntries(
  HIERARCHY_DRILL_MAP.map((row) => [
    row.pathwayNo,
    {
      metricKey: `faculty_staff_pathway_${row.pathwayNo}`,
      valueLabel: row.pathwaySpecificHierarchyLabel,
    },
  ]),
);

export const FACULTY_STAFF_PATHWAY_SHORT_LABELS = {
  1: "Faculty Vacancy / Staffing",
  2: "Social Category",
  3: "Gender",
  4: "Age",
  5: "Qualification / Experience",
  6: "International Faculty Gender",
  7: "Visiting / Adjunct Type",
  8: "Adjunct Social Category",
  9: "Adjunct Gender",
  10: "Staff Category",
  11: "Staff Vacancy / Staffing",
  12: "Staff Social Category",
  13: "Faculty Awards",
};

export function getFacultyStaffPathwayShortLabel(pathway) {
  return FACULTY_STAFF_PATHWAY_SHORT_LABELS[Number(pathway?.pathwayNo)] ?? pathway?.pathwaySpecificHierarchyLabel ?? "Pathway";
}

export const FACULTY_STAFF_HIERARCHY_GROUPS = [
  {
    key: "workforce-composition",
    label: "Workforce-composition hierarchy",
    shortLabel: "Workforce",
    color: "#2563eb",
    bg: "#dbeafe",
    thumbnail: "grid",
  },
  {
    key: "diversity",
    label: "Diversity hierarchy",
    shortLabel: "Diversity",
    color: "#16a34a",
    bg: "#dcfce7",
    thumbnail: "dots",
  },
  {
    key: "vacancy-staffing",
    label: "Vacancy / staffing hierarchy",
    shortLabel: "Vacancy",
    color: "#ea580c",
    bg: "#ffedd5",
    thumbnail: "bars",
  },
].map((group) => {
  const pathways = HIERARCHY_DRILL_MAP
    .filter((row) => row.module === "Faculty & Staff" && row.table === "Faculty and Staff" && row.hierarchyKey === group.key)
    .map((row) => ({
      ...row,
      hierarchyLabel: group.label,
      shortPathwayLabel: getFacultyStaffPathwayShortLabel(row),
      metricKey: FACULTY_STAFF_PATHWAY_METRICS[row.pathwayNo]?.metricKey ?? `faculty_staff_pathway_${row.pathwayNo}`,
      valueLabel: FACULTY_STAFF_PATHWAY_METRICS[row.pathwayNo]?.valueLabel ?? row.pathwaySpecificHierarchyLabel,
    }));

  return {
    ...group,
    pathways,
    pathwayNos: pathways.map((row) => row.pathwayNo),
  };
});

export function getFacultyStaffPathway(pathwayNo) {
  return FACULTY_STAFF_HIERARCHY_GROUPS
    .flatMap((group) => group.pathways.map((pathway) => ({ ...pathway, hierarchyKey: group.key, hierarchyLabel: group.label })))
    .find((pathway) => pathway.pathwayNo === Number(pathwayNo)) ?? null;
}
