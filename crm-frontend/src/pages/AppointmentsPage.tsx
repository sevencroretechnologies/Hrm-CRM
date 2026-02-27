import { useEffect, useState, useCallback } from "react";
import { appointmentApi } from "@/services/api";
import type { Appointment, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, ArrowLeft } from "lucide-react";

const statusVariant = (s: string) => {
  if (s === "Closed") return "success" as const;
  if (s === "Open") return "warning" as const;
  return "secondary" as const;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: 15 };
    if (search) params.search = search;
    appointmentApi.list(params)
      .then((data: PaginatedResponse<Appointment>) => {
        setAppointments(data.data || []);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setTotal(data.total);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({ status: "Open" }); setDialogOpen(true); };
  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm({
      scheduled_time: a.scheduled_time ? a.scheduled_time.slice(0, 16) : "",
      status: a.status || "Open",
      customer_name: a.customer_name || "",
      customer_email: a.customer_email || "",
      customer_phone_number: a.customer_phone_number || "",
      customer_details: a.customer_details || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await appointmentApi.update(editing.id, form);
    } else {
      await appointmentApi.create(form);
    }
    setDialogOpen(false);
    fetchData(currentPage);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this appointment?")) {
      await appointmentApi.delete(id);
      fetchData(currentPage);
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Appointments
          <span className="text-sm font-normal text-gray-400 ml-2">({total})</span>
        </h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Appointment</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No appointments found.</p>
      ) : (
        <div className="bg-white rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a, index) => (
                <TableRow key={a.id}>
                  <TableCell>{(currentPage - 1) * 15 + index + 1}</TableCell>
                  <TableCell className="font-medium">{a.customer_name}</TableCell>
                  <TableCell>{a.customer_email}</TableCell>
                  <TableCell>{new Date(a.scheduled_time).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusVariant(a.status)}>{a.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Appointment" : "New Appointment"}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Customer Name *</label>
            <Input value={form.customer_name || ""} onChange={(e) => setField("customer_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Email *</label>
            <Input type="email" value={form.customer_email || ""} onChange={(e) => setField("customer_email", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Phone</label>
            <Input value={form.customer_phone_number || ""} onChange={(e) => setField("customer_phone_number", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Scheduled Time *</label>
            <Input type="datetime-local" value={form.scheduled_time || ""} onChange={(e) => setField("scheduled_time", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Status</label>
            <Select value={form.status || "Open"} onChange={(e) => setField("status", e.target.value)}>
              <option value="Open">Open</option>
              <option value="Unverified">Unverified</option>
              <option value="Closed">Closed</option>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600">Details</label>
            <Textarea value={form.customer_details || ""} onChange={(e) => setField("customer_details", e.target.value)} rows={2} />
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
