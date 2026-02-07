import { useEffect, useState, useCallback } from "react";
import { leadApi } from "@/services/crmService";
import type { Lead } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, ArrowRightLeft } from "lucide-react";

const STATUS_OPTIONS = ["Lead", "Open", "Replied", "Opportunity", "Quotation", "Lost Quotation", "Interested", "Converted", "Do Not Contact"];
const statusVariant = (s: string) => {
  if (s === "Converted" || s === "Opportunity") return "success" as const;
  if (s === "Lost Quotation" || s === "Do Not Contact") return "destructive" as const;
  if (s === "Open" || s === "Interested") return "warning" as const;
  return "default" as const;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    leadApi.list(params).then((res) => {
      setLeads(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const openCreate = () => { setEditing(null); setForm({ status: "Lead" }); setDialogOpen(true); };
  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setForm({
      first_name: lead.first_name || "", last_name: lead.last_name || "",
      email_id: lead.email_id || "", mobile_no: lead.mobile_no || "",
      company_name: lead.company_name || "", status: lead.status || "Lead",
      job_title: lead.job_title || "", industry: lead.industry || "",
      city: lead.city || "", country: lead.country || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) { await leadApi.update(editing.id, form); }
    else { await leadApi.create(form); }
    setDialogOpen(false);
    fetchLeads();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this lead?")) { await leadApi.delete(id); fetchLeads(); }
  };

  const handleConvert = async (id: number) => {
    if (confirm("Convert this lead to an opportunity?")) {
      await leadApi.convertToOpportunity(id, {});
      fetchLeads();
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leads</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Lead</Button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading...</p>
      ) : leads.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No leads found. Create your first lead!</p>
      ) : (
        <div className="bg-white rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.first_name} {lead.last_name}</TableCell>
                  <TableCell>{lead.email_id}</TableCell>
                  <TableCell>{lead.company_name}</TableCell>
                  <TableCell><Badge variant={statusVariant(lead.status)}>{lead.status}</Badge></TableCell>
                  <TableCell>{lead.city}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleConvert(lead.id)} title="Convert"><ArrowRightLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(lead)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Lead" : "New Lead"}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-600">First Name</label><Input value={form.first_name || ""} onChange={(e) => setField("first_name", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Last Name</label><Input value={form.last_name || ""} onChange={(e) => setField("last_name", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Email</label><Input type="email" value={form.email_id || ""} onChange={(e) => setField("email_id", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Mobile</label><Input value={form.mobile_no || ""} onChange={(e) => setField("mobile_no", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Company</label><Input value={form.company_name || ""} onChange={(e) => setField("company_name", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Job Title</label><Input value={form.job_title || ""} onChange={(e) => setField("job_title", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Industry</label><Input value={form.industry || ""} onChange={(e) => setField("industry", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Status</label>
            <Select value={form.status || "Lead"} onChange={(e) => setField("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div><label className="text-xs font-medium text-gray-600">City</label><Input value={form.city || ""} onChange={(e) => setField("city", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Country</label><Input value={form.country || ""} onChange={(e) => setField("country", e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
