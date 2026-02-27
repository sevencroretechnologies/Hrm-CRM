import { useEffect, useState, useCallback } from "react";
import { opportunityApi, leadApi, statusApi } from "@/services/api";
import type { Lead, Opportunity, Status, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, ArrowLeft, ArrowRight } from "lucide-react";

const statusVariant = (s: string) => {
  const name = s?.toLowerCase() || "";
  if (name.includes("open") || name.includes("new")) return "warning" as const;
  if (name.includes("won") || name.includes("convert")) return "success" as const;
  if (name.includes("lost") || name.includes("closed")) return "destructive" as const;
  if (name.includes("replied")) return "default" as const;
  return "default" as const;
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    Promise.all([
      statusApi.list(),
      leadApi.list(),
    ]).then(([statusRes, leadsRes]) => {
      setStatuses(Array.isArray(statusRes) ? statusRes : []);
      const leadsData = Array.isArray(leadsRes) ? leadsRes : (leadsRes as any)?.data || [];
      setLeads(leadsData);
    });
  }, []);

  const fetchData = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (search) params.search = search;
    if (statusFilter) params.status_id = statusFilter;
    opportunityApi.list(params).then((res) => {
      const paginatedRes = res as PaginatedResponse<Opportunity>;
      if (paginatedRes.data) {
        setOpportunities(paginatedRes.data);
        setCurrentPage(paginatedRes.current_page);
        setTotalPages(paginatedRes.last_page);
        setTotal(paginatedRes.total);
      } else {
        setOpportunities(Array.isArray(res) ? res : []);
      }
    }).finally(() => setLoading(false));
  }, [search, statusFilter, perPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ opportunity_from: "lead", status_id: "", party_name: "" });
    setDialogOpen(true);
  };

  const openEdit = (opp: Opportunity) => {
    setEditing(opp);
    setForm({
      opportunity_from: opp.opportunity_from || "lead",
      lead_id: String(opp.lead_id || ""),
      party_name: opp.party_name || "",
      company_name: opp.company_name || "",
      status_id: String(opp.status_id || ""),
      opportunity_amount: String(opp.opportunity_amount || ""),
      expected_closing: opp.expected_closing || "",
      probability: String(opp.probability || ""),
      contact_person: opp.contact_person || "",
      contact_email: opp.contact_email || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data: any = {
      ...form,
      status_id: form.status_id ? Number(form.status_id) : undefined,
      opportunity_amount: form.opportunity_amount ? Number(form.opportunity_amount) : undefined,
      probability: form.probability ? Number(form.probability) : undefined,
      lead_id: form.opportunity_from === "lead" && form.lead_id ? Number(form.lead_id) : null,
    };
    if (editing) {
      await opportunityApi.update(editing.id, data);
    } else {
      await opportunityApi.create(data);
    }
    setDialogOpen(false);
    fetchData(currentPage);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this opportunity?")) {
      await opportunityApi.delete(id);
      fetchData(currentPage);
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Opportunities
          {total > 0 && <small className="text-gray-400 ml-2 text-sm font-normal">({total})</small>}
        </h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Opportunity</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
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
                <TableHead>#</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opp, index) => (
                <TableRow key={opp.id}>
                  <TableCell>{(currentPage - 1) * perPage + index + 1}</TableCell>
                  <TableCell className="font-medium">{opp.party_name || opp.company_name || `#${opp.id}`}</TableCell>
                  <TableCell>{opp.opportunity_from ? opp.opportunity_from.charAt(0).toUpperCase() + opp.opportunity_from.slice(1) : "-"}</TableCell>
                  <TableCell>{opp.lead ? `${opp.lead.first_name} ${opp.lead.last_name || ""}`.trim() : "-"}</TableCell>
                  <TableCell><Badge variant={statusVariant(opp.status?.status_name || "")}>{opp.status?.status_name || "-"}</Badge></TableCell>
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

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 border-t">
              <div className="flex items-center mb-2 md:mb-0">
                <span className="text-sm text-gray-500 mr-2">Rows per page:</span>
                <select
                  className="p-1 border rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[10, 15, 20, 25, 50].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500 ml-4">
                  {(currentPage - 1) * perPage + 1}-
                  {Math.min(currentPage * perPage, total)} of {total}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={currentPage === 1} 
                    onClick={() => fetchData(currentPage - 1)}
                    title="Previous Page"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-bold mx-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={currentPage === totalPages} 
                    onClick={() => fetchData(currentPage + 1)}
                    title="Next Page"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Opportunity" : "New Opportunity"}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">From</label>
            <Select value={form.opportunity_from || "lead"} onChange={(e) => { setField("opportunity_from", e.target.value); if (e.target.value !== "lead") setField("lead_id", ""); }}>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="customer">Customer</option>
            </Select>
          </div>
          {form.opportunity_from === "lead" && (
            <div>
              <label className="text-xs font-medium text-gray-600">Lead</label>
              <Select value={form.lead_id || ""} onChange={(e) => setField("lead_id", e.target.value)}>
                <option value="">Select Lead</option>
                {leads.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name || ""} {l.company_name ? `(${l.company_name})` : ""}</option>)}
              </Select>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600">Party Name</label>
            <Input value={form.party_name || ""} onChange={(e) => setField("party_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Company Name</label>
            <Input value={form.company_name || ""} onChange={(e) => setField("company_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Status</label>
            <Select value={form.status_id || ""} onChange={(e) => setField("status_id", e.target.value)}>
              <option value="">Select Status</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
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
