import { useMemo, useState } from "react";
import { makeMockFacts } from "./data/mockData";
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

export default function App() {
  const facts = useMemo(() => makeMockFacts("IITMIS_DEMO_SEED"), []);

  const [page, setPage] = useState("landing"); // landing | map | dashboard
  const [role, setRole] = useState(null);
  const [selectedInstituteId, setSelectedInstituteId] = useState(IITs[0].id);
  const [loginMeta, setLoginMeta] = useState(null);

  function handleLogin(nextRole, instituteId, meta = null) {
    const resolvedRole = nextRole === "iit" ? "iit" : "ministry";
    const resolvedInstituteId = instituteId || inferInstituteFromEmail(meta?.email) || IITs[0].id;

    setRole(resolvedRole);
    setSelectedInstituteId(resolvedInstituteId);
    setLoginMeta({
      email: meta?.email || (resolvedRole === "ministry" ? "admin@example.com" : `user@${resolvedInstituteId.toLowerCase()}.ac.in`),
      role: resolvedRole,
      instituteId: resolvedInstituteId,
      loggedInAt: new Date().toISOString(),
    });

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
        onBack={() => setPage("landing")}
        onPick={(id) => {
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
      onSelectInstitute={(id) => {
        if (role === "ministry") setSelectedInstituteId(id);
      }}
      onChangeInstitute={() => {
        if (role === "ministry") setPage("map");
      }}
      onLogout={() => {
        setRole(null);
        setLoginMeta(null);
        setPage("landing");
      }}
    />
  );
}
