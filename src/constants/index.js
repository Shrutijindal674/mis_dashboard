// ----------------------------- Constants -----------------------------

export const DEFAULT_ROLE = "ministry"; // "ministry" or "iit"

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const YEARS = [2021, 2022, 2023, 2024, 2025];

export const MODULES = [
  "Institution & Governance",
  "People & Student Life",
  "Research & Innovation",
  "Collaborations & Outreach",
  "Infrastructure & Finance",
];

export const THEME_COLORS = {
  "Institution & Governance": { accent: "#1d4ed8", soft: "#dbeafe" },
  "People & Student Life":    { accent: "#ea580c", soft: "#ffedd5" },
  "Research & Innovation":    { accent: "#16a34a", soft: "#dcfce7" },
  "Collaborations & Outreach":{ accent: "#db2777", soft: "#fce7f3" },
  "Infrastructure & Finance": { accent: "#7c3aed", soft: "#ede9fe" },
  Compare:                     { accent: "#0f172a", soft: "#e2e8f0" },
  Reports:                     { accent: "#0ea5e9", soft: "#e0f2fe" },
  "Data & Admin":            { accent: "#ef4444", soft: "#fee2e2" },
};

export const IITs = [
  { id: "IITB",    name: "IIT Bombay",          state: "Maharashtra",    lat: 19.1334, lon: 72.9133 },
  { id: "IITD",    name: "IIT Delhi",           state: "Delhi",          lat: 28.5450, lon: 77.1926 },
  { id: "IITK",    name: "IIT Kanpur",          state: "Uttar Pradesh",  lat: 26.5123, lon: 80.2329 },
  { id: "IITKGP",  name: "IIT Kharagpur",       state: "West Bengal",    lat: 22.3149, lon: 87.3105 },
  { id: "IITM",    name: "IIT Madras",          state: "Tamil Nadu",     lat: 12.9915, lon: 80.2336 },
  { id: "IITG",    name: "IIT Guwahati",        state: "Assam",          lat: 26.1877, lon: 91.6917 },
  { id: "IITR",    name: "IIT Roorkee",         state: "Uttarakhand",    lat: 29.8665, lon: 77.8963 },
  { id: "IITRPR",  name: "IIT Ropar",           state: "Punjab",         lat: 30.9675, lon: 76.4733 },
  { id: "IITBBS",  name: "IIT Bhubaneswar",     state: "Odisha",         lat: 20.1483, lon: 85.6630 },
  { id: "IITGN",   name: "IIT Gandhinagar",     state: "Gujarat",        lat: 23.2156, lon: 72.6843 },
  { id: "IITH",    name: "IIT Hyderabad",       state: "Telangana",      lat: 17.5950, lon: 78.1230 },
  { id: "IITJ",    name: "IIT Jodhpur",         state: "Rajasthan",      lat: 26.4710, lon: 73.1137 },
  { id: "IITP",    name: "IIT Patna",           state: "Bihar",          lat: 25.5350, lon: 84.8510 },
  { id: "IITI",    name: "IIT Indore",          state: "Madhya Pradesh", lat: 22.5204, lon: 75.9200 },
  { id: "IITMD",   name: "IIT Mandi",           state: "Himachal Pradesh", lat: 31.7754, lon: 76.9861 },
  { id: "IITBHU",  name: "IIT (BHU) Varanasi",  state: "Uttar Pradesh",  lat: 25.2627, lon: 82.9898 },
  { id: "IITPKD",  name: "IIT Palakkad",        state: "Kerala",         lat: 10.9980, lon: 76.9356 },
  { id: "IITT",    name: "IIT Tirupati",        state: "Andhra Pradesh", lat: 13.6288, lon: 79.4230 },
  { id: "IITISM",  name: "IIT (ISM) Dhanbad",   state: "Jharkhand",      lat: 23.8143, lon: 86.4412 },
  { id: "IITBHI",  name: "IIT Bhilai",          state: "Chhattisgarh",   lat: 21.1938, lon: 81.3509 },
  { id: "IITGOA",  name: "IIT Goa",             state: "Goa",            lat: 15.4222, lon: 73.9789 },
  { id: "IITJMU",  name: "IIT Jammu",           state: "Jammu & Kashmir", lat: 32.8415, lon: 74.7654 },
  { id: "IITDH",   name: "IIT Dharwad",         state: "Karnataka",      lat: 15.4499, lon: 74.9893 },
];

export const EVIDENCE_LINKS = [
  { label: "Metric Dictionary (PDF)",         url: "https://example.com/metric-dictionary.pdf" },
  { label: "Data Submission Evidence (PDF)",  url: "https://example.com/data-evidence.pdf"     },
  { label: "Reference Portal (NIRF/other)",   url: "https://example.com/reference"             },
];

export const NORMALIZATION_MODES = [
  { id: "absolute",    label: "Absolute"           },
  { id: "per_student", label: "Per student"        },
  { id: "per_faculty", label: "Per faculty (UI)"   },
  { id: "per_capita",  label: "Per capita (UI)"    },
];

export const SORT_MODES = [
  { id: "latest", label: "Latest value" },
  { id: "yoy",    label: "YoY"          },
  { id: "avg3",   label: "3-year avg"   },
  { id: "cagr",   label: "CAGR"         },
];

// ----------------------------- Filter schemas (Compare / Reports) -----------------------------

export const COMPARE_FILTER_SCHEMA = [
  { panel: "Basic",    label: "Module",               key: "CompareModule",    control: "compare_module"      },
  { panel: "Basic",    label: "Measures / sub-modules", key: "CompareMetricIds", control: "compare_metric_multi" },
  { panel: "Basic",    label: "IIT selection (2–23)", key: "InstituteId",      control: "iit_multi"           },
  { panel: "Basic",    label: "Year range",           key: "YearRange",        control: "year_range"          },
  { panel: "Advanced", label: "Compare style",        key: "CompareView",      control: "compare_view"        },
  { panel: "Advanced", label: "Scale",                key: "CompareScale",     control: "compare_scale"       },
  { panel: "Advanced", label: "Sort",                 key: "Sort",             control: "sort_single"         },
  { panel: "Advanced", label: "Chart cap guidance",   key: "ChartCap",         control: "chart_cap"           },
];

export const REPORTS_FILTER_SCHEMA = [
  { panel: "Basic",    label: "KPIs (select 1+)",     key: "KpiIds",      control: "kpi_multi"   },
  { panel: "Basic",    label: "IIT selection (0–23)", key: "InstituteId", control: "iit_multi"   },
  { panel: "Basic",    label: "Year",                 key: "YearRange",   control: "year_range"  },
  { panel: "Advanced", label: "Max rows",             key: "MaxRows",     control: "max_rows"    },
];
