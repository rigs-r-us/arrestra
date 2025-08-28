import { LeadDTO } from "@/lib/types";

function formatMoney(n?: number | null) {
  if (n === null || n === undefined) return "N/A";
  return `$${n.toLocaleString()}`;
}

export default function LeadCard({ lead }: { lead: LeadDTO }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{lead.fullName || "Unknown"}</h3>
        <span className="tag">Score: {lead.score}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div><strong>County:</strong> {lead.county}</div>
        <div><strong>Charge:</strong> {lead.charge}</div>
        <div><strong>Bail:</strong> {formatMoney(lead.bailAmount ?? null)}</div>
        <div><strong>Arrested:</strong> {new Date(lead.arrestTime).toLocaleString()}</div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn">Claim</button>
        <button className="btn" style={{ background: "#2563eb" }}>Mark Contacted</button>
      </div>
    </div>
  );
}
