import { useEffect, useState, useCallback } from "react";
import { contractApi } from "@/services/api";
import type { Contract, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, PenLine, ArrowLeft } from "lucide-react";

const statusVariant = (s: string) => {
  if (s === "Signed") return "success" as const;
  if (s === "Active") return "default" as const;
  if (s === "Expired" || s === "Cancelled") return "destructive" as const;
  return "secondary" as const;
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: 15 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    contractApi.list(params)
      .then((data: PaginatedResponse<Contract>) => {
        setContracts(data.data || []);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setTotal(data.total);
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ party_type: "Customer" });
    setDialogOpen(true);
  };
  const openEdit = (c: Contract) => {
    setEditing(c);
    setForm({
      party_type: c.party_type,
      party_name: c.party_name,
      start_date: c.start_date || "",
      end_date: c.end_date || "",
      contract_terms: c.contract_terms || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await contractApi.update(editing.id, form);
    } else {
      await contractApi.create(form);
    }
    setDialogOpen(false);
    fetchData(currentPage);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this contract?")) {
      await contractApi.delete(id);
      fetchData(currentPage);
    }
  };

  const handleSign = async (id: number) => {
    if (confirm("Sign this contract?")) {
      await contractApi.sign(id, { signee: "Current User" });
      fetchData(currentPage);
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Contracts
          <span className="text-sm font-normal text-gray-400 ml-2">({total})</span>
        </h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Contract</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All Statuses</option>
          <option value="Unsigned">Unsigned</option>
          <option value="Active">Active</option>
          <option value="Signed">Signed</option>
          <option value="Expired">Expired</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading...</p>
      ) : contracts.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No contracts found.</p>
      ) : (
        <div className="bg-white rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c, index) => (
                <TableRow key={c.id}>
                  <TableCell>{(currentPage - 1) * 15 + index + 1}</TableCell>
                  <TableCell className="font-medium">{c.party_name}</TableCell>
                  <TableCell>{c.party_type}</TableCell>
                  <TableCell><Badge variant={statusVariant(c.status)}>{c.status}</Badge></TableCell>
                  <TableCell>{c.start_date || "-"}</TableCell>
                  <TableCell>{c.end_date || "-"}</TableCell>
                  <TableCell>{c.is_signed ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {!c.is_signed && (
                      <Button variant="ghost" size="icon" onClick={() => handleSign(c.id)} title="Sign">
                        <PenLine className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages >= 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-gray-500 mb-2 md:mb-0">
                Showing page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong> · {total} records
              </span>
              <div className="flex gap-1 items-center">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => fetchData(currentPage - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] < page - 1 && (
                        <span className="px-1 text-gray-400">…</span>
                      )}
                      <Button variant={page === currentPage ? "default" : "outline"} size="sm" onClick={() => fetchData(page)}>
                        {page}
                      </Button>
                    </span>
                  ))}
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => fetchData(currentPage + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Contract" : "New Contract"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Party Type *</label>
              <Select value={form.party_type || "Customer"} onChange={(e) => setField("party_type", e.target.value)}>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
                <option value="Employee">Employee</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Party Name *</label>
              <Input value={form.party_name || ""} onChange={(e) => setField("party_name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Start Date</label>
              <Input type="date" value={form.start_date || ""} onChange={(e) => setField("start_date", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">End Date</label>
              <Input type="date" value={form.end_date || ""} onChange={(e) => setField("end_date", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Contract Terms *</label>
            <Textarea value={form.contract_terms || ""} onChange={(e) => setField("contract_terms", e.target.value)} rows={4} />
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
