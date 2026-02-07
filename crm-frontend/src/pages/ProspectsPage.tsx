import { useEffect, useState, useCallback } from "react";
import { prospectApi } from "@/services/api";
import type { Prospect } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchData = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    prospectApi.list(params).then((res) => {
      setProspects(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({}); setDialogOpen(true); };
  const openEdit = (p: Prospect) => {
    setEditing(p);
    setForm({
      company_name: p.company_name || "",
      industry: p.industry || "",
      market_segment: p.market_segment || "",
      territory: p.territory || "",
      no_of_employees: p.no_of_employees || "",
      annual_revenue: String(p.annual_revenue || ""),
      website: p.website || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await prospectApi.update(editing.id, form);
    } else {
      await prospectApi.create(form);
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this prospect?")) {
      await prospectApi.delete(id);
      fetchData();
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Prospects</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Prospect</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="Search prospects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading...</p>
      ) : prospects.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No prospects found.</p>
      ) : (
        <div className="bg-white rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.company_name}</TableCell>
                  <TableCell>{p.industry || "-"}</TableCell>
                  <TableCell>{p.territory || "-"}</TableCell>
                  <TableCell>{p.no_of_employees || "-"}</TableCell>
                  <TableCell>{p.annual_revenue ? `$${Number(p.annual_revenue).toLocaleString()}` : "-"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Prospect" : "New Prospect"}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600">Company Name *</label>
            <Input value={form.company_name || ""} onChange={(e) => setField("company_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Industry</label>
            <Input value={form.industry || ""} onChange={(e) => setField("industry", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Market Segment</label>
            <Input value={form.market_segment || ""} onChange={(e) => setField("market_segment", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Territory</label>
            <Input value={form.territory || ""} onChange={(e) => setField("territory", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">No. of Employees</label>
            <Input value={form.no_of_employees || ""} onChange={(e) => setField("no_of_employees", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Annual Revenue</label>
            <Input type="number" value={form.annual_revenue || ""} onChange={(e) => setField("annual_revenue", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Website</label>
            <Input value={form.website || ""} onChange={(e) => setField("website", e.target.value)} />
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
