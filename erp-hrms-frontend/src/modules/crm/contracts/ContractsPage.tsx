import { useEffect, useState, useCallback } from "react";
import { contractApi } from "@/services/crmService";
import type { Contract } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, CheckCircle } from "lucide-react";

const STATUS_OPTIONS = ["Unsigned", "Active", "Inactive"];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchContracts = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    contractApi.list(params).then((res) => {
      setContracts(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const openCreate = () => { setEditing(null); setForm({ party_type: "Customer", status: "Unsigned" }); setDialogOpen(true); };
  const openEdit = (c: Contract) => {
    setEditing(c);
    setForm({
      party_type: c.party_type, party_name: c.party_name, status: c.status,
      start_date: c.start_date || "", end_date: c.end_date || "",
      contract_terms: c.contract_terms || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) { await contractApi.update(editing.id, form); }
    else { await contractApi.create(form); }
    setDialogOpen(false);
    fetchContracts();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this contract?")) { await contractApi.delete(id); fetchContracts(); }
  };

  const handleSign = async (id: number) => {
    if (confirm("Sign this contract?")) { await contractApi.sign(id, {}); fetchContracts(); }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contracts</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Contract</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      {loading ? <p className="text-gray-500 py-8 text-center">Loading...</p> : contracts.length === 0 ? <p className="text-gray-400 py-8 text-center">No contracts found.</p> : (
        <div className="bg-white rounded-xl border">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Party</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead>
              <TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Signed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.party_name}</TableCell>
                  <TableCell>{c.party_type}</TableCell>
                  <TableCell><Badge variant={c.status === "Active" ? "success" : c.status === "Inactive" ? "destructive" : "warning"}>{c.status}</Badge></TableCell>
                  <TableCell>{c.start_date || "-"}</TableCell>
                  <TableCell>{c.end_date || "-"}</TableCell>
                  <TableCell>{c.is_signed ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {!c.is_signed && <Button variant="ghost" size="icon" onClick={() => handleSign(c.id)} title="Sign"><CheckCircle className="h-4 w-4 text-green-500" /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Contract" : "New Contract"}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-600">Party Type</label>
            <Select value={form.party_type || "Customer"} onChange={(e) => setField("party_type", e.target.value)}>
              <option value="Customer">Customer</option><option value="Supplier">Supplier</option>
            </Select></div>
          <div><label className="text-xs font-medium text-gray-600">Party Name</label><Input value={form.party_name || ""} onChange={(e) => setField("party_name", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Status</label>
            <Select value={form.status || "Unsigned"} onChange={(e) => setField("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select></div>
          <div><label className="text-xs font-medium text-gray-600">Start Date</label><Input type="date" value={form.start_date || ""} onChange={(e) => setField("start_date", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">End Date</label><Input type="date" value={form.end_date || ""} onChange={(e) => setField("end_date", e.target.value)} /></div>
          <div className="col-span-2"><label className="text-xs font-medium text-gray-600">Contract Terms</label><Textarea rows={4} value={form.contract_terms || ""} onChange={(e) => setField("contract_terms", e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
