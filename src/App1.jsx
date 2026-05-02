import { useMemo, useRef, useState } from "react";
import workbookFacts from "./data/workbookFacts";
import peopleStudentLifeFacts from "./data/peopleStudentLifeFacts";
import { IITs } from "./constants";

import Landing from "./pages/Landing";
import MapPage from "./pages/MapPage";
import Dashboard from "./pages/Dashboard";

function inferInstituteFromEmail(email) {
  const value = String(email || "").toLowerCase();
  const byLength = [...IITs].sort((a, b) => b.id.length - a.id.length);
  const match = byLength.find((item) => value.includes(item.id.toLowerCase()));
  return match?.id || IITs[0].id;
}

function appSnapshotKey(snapshot) {
  if (!snapshot) return "";
  return [snapshot.page, snapshot.role ?? "", snapshot.selectedInstituteId ?? ""].join("::");
}

export default function App() {
  const facts = useMemo(() => ({
    ...workbookFacts,
    ...peopleStudentLifeFacts,
    meta: {
      ...(workbookFacts.meta ?? {}),
      peopleStudentLife: peopleStudentLifeFacts.meta,
    },
  }), []);

  const [page, setPage] = useState("landing"); // landing | map | dashboard
  const [role, setRole] = useState(null);
  const [selectedInstituteId, setSelectedInstituteId] = useState(IITs[0].id);
  const [loginMeta, setLoginMeta] = useState(null);
  const appHistoryRef = useRef([]);

  function buildAppSnapshot() {
    return {
      page,
      role,
      selectedInstituteId,
      loginMeta,
    };
  }

  function rememberCurrentPage() {
    const snapshot = buildAppSnapshot();
    const previous = appHistoryRef.current[appHistoryRef.current.length - 1];
    if (appSnapshotKey(previous) === appSnapshotKey(snapshot)) return;
    appHistoryRef.current.push(snapshot);
  }

  function restoreAppSnapshot(snapshot) {
    if (!snapshot) return;
    setPage(snapshot.page ?? "landing");
    setRole(snapshot.role ?? null);
    setSelectedInstituteId(snapshot.selectedInstituteId ?? IITs[0].id);
    setLoginMeta(snapshot.loginMeta ?? null);
  }

  function handleAppBack() {
    const previousSnapshot = appHistoryRef.current.pop();
    if (!previousSnapshot) return;
    restoreAppSnapshot(previousSnapshot);
  }

  function handleLogin(nextRole, instituteId, meta = null) {
    const resolvedRole = nextRole === "iit" ? "iit" : "ministry";
    const resolvedInstituteId = instituteId || inferInstituteFromEmail(meta?.email) || IITs[0].id;
    const nextLoginMeta = {
      email: meta?.email || (resolvedRole === "ministry" ? "admin@example.com" : `user@${resolvedInstituteId.toLowerCase()}.ac.in`),
      role: resolvedRole,
      instituteId: resolvedInstituteId,
      loggedInAt: new Date().toISOString(),
    };

    rememberCurrentPage();
    setRole(resolvedRole);
    setSelectedInstituteId(resolvedInstituteId);
    setLoginMeta(nextLoginMeta);

    if (resolvedRole === "iit") {
      setPage("dashboard");
      return;
    }

    setPage("map");
  }

  if (page === "landing") {
    return (
      <Landing
        defaultInstituteId={selectedInstituteId}
        onLogin={handleLogin}
      />
    );
  }

  if (page === "map") {
    return (
      <MapPage
        selectedInstituteId={selectedInstituteId}
        onBack={handleAppBack}
        onPick={(id) => {
          rememberCurrentPage();
          setSelectedInstituteId(id);
          setPage("dashboard");
        }}
      />
    );
  }

  return (
    <Dashboard
      role={role}
      instituteId={selectedInstituteId}
      facts={facts}
      loginMeta={loginMeta}
      onBack={handleAppBack}
      onSelectInstitute={(id) => {
        if (role === "ministry") setSelectedInstituteId(id);
      }}
      onChangeInstitute={() => {
        if (role === "ministry") {
          rememberCurrentPage();
          setPage("map");
        }
      }}
      onLogout={() => {
        appHistoryRef.current = [];
        setRole(null);
        setLoginMeta(null);
        setPage("landing");
      }}
    />
  );
}
