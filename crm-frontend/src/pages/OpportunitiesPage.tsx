import { useEffect, useState, useCallback } from "react";
import { opportunityApi, salesStageApi } from "@/services/api";
import type { Opportunity, SalesStage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const STATUS_OPTIONS = ["Open", "Quotation", "Converted", "Lost", "Replied", "Closed"];
const statusVariant = (s: string) => {
  if (s === "Converted") return "success" as const;
  if (s === "Lost") return "destructive" as const;
  if (s === "Open") return "warning" as const;
  return "default" as const;
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchData = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    Promise.all([
      opportunityApi.list(params),
      stages.length === 0 ? salesStageApi.list() : Promise.resolve(stages),
    ]).then(([oppRes, stagesRes]) => {
      setOpportunities(Array.isArray(oppRes) ? oppRes : oppRes.data || []);
      if (Array.isArray(stagesRes)) setStages(stagesRes);
    }).finally(() => setLoading(false));
  }, [search, statusFilter, stages.length]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ opportunity_from: "Lead", status: "Open", party_id: "0" });
    setDialogOpen(true);
  };
  const openEdit = (opp: Opportunity) => {
    setEditing(opp);
    setForm({
      opportunity_from: opp.opportunity_from || "Lead",
      party_id: String(opp.party_id),
      customer_name: opp.customer_name || "",
      status: opp.status || "Open",
      sales_stage_id: String(opp.sales_stage_id || ""),
      opportunity_amount: String(opp.opportunity_amount || ""),
      expected_closing: opp.expected_closing || "",
      probability: String(opp.probability || ""),
      contact_person: opp.contact_person || "",
      contact_email: opp.contact_email || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = { ...form, party_id: Number(form.party_id), sales_stage_id: form.sales_stage_id ? Number(form.sales_stage_id) : undefined, opportunity_amount: form.opportunity_amount ? Number(form.opportunity_amount) : undefined, probability: form.probability ? Number(form.probability) : undefined };
    if (editing) {
      await opportunityApi.update(editing.id, data);
    } else {
      await opportunityApi.create(data);
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this opportunity?")) {
      await opportunityApi.delete(id);
      fetchData();
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Opportunities</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Opportunity</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading...</p>
      ) : opportunities.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No opportunities found.</p>
      ) : (
        <div className="bg-white rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium">{opp.customer_name || `#${opp.party_id}`}</TableCell>
                  <TableCell>{opp.opportunity_from}</TableCell>
                  <TableCell><Badge variant={statusVariant(opp.status)}>{opp.status}</Badge></TableCell>
                  <TableCell>{opp.sales_stage?.stage_name || "-"}</TableCell>
                  <TableCell>{opp.opportunity_amount ? `$${Number(opp.opportunity_amount).toLocaleString()}` : "-"}</TableCell>
                  <TableCell>{opp.expected_closing || "-"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(opp)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(opp.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Opportunity" : "New Opportunity"}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">From</label>
            <Select value={form.opportunity_from || "Lead"} onChange={(e) => setField("opportunity_from", e.target.value)}>
              <option value="Lead">Lead</option>
              <option value="Prospect">Prospect</option>
              <option value="Customer">Customer</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Party ID</label>
            <Input type="number" value={form.party_id || ""} onChange={(e) => setField("party_id", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Customer Name</label>
            <Input value={form.customer_name || ""} onChange={(e) => setField("customer_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Status</label>
            <Select value={form.status || "Open"} onChange={(e) => setField("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Sales Stage</label>
            <Select value={form.sales_stage_id || ""} onChange={(e) => setField("sales_stage_id", e.target.value)}>
              <option value="">Select stage</option>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.stage_name}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Amount</label>
            <Input type="number" value={form.opportunity_amount || ""} onChange={(e) => setField("opportunity_amount", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Expected Closing</label>
            <Input type="date" value={form.expected_closing || ""} onChange={(e) => setField("expected_closing", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Probability (%)</label>
            <Input type="number" value={form.probability || ""} onChange={(e) => setField("probability", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Contact Person</label>
            <Input value={form.contact_person || ""} onChange={(e) => setField("contact_person", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Contact Email</label>
            <Input type="email" value={form.contact_email || ""} onChange={(e) => setField("contact_email", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
