export default function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-xl" style={{ color: "#0f172a", fontWeight: 400 }}>{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm" style={{ color: "#64748b" }}>{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}
