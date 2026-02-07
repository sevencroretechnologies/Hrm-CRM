import { useEffect, useState, useCallback } from "react";
import { appointmentApi } from "@/services/crmService";
import type { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const STATUS_OPTIONS = ["Open", "Closed", "Cancelled"];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    appointmentApi.list(params).then((res) => {
      setAppointments(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const openCreate = () => { setEditing(null); setForm({ status: "Open" }); setDialogOpen(true); };
  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm({
      scheduled_time: a.scheduled_time, status: a.status,
      customer_name: a.customer_name, customer_email: a.customer_email,
      customer_phone_number: a.customer_phone_number || "",
      customer_details: a.customer_details || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) { await appointmentApi.update(editing.id, form); }
    else { await appointmentApi.create(form); }
    setDialogOpen(false);
    fetchAppointments();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this appointment?")) { await appointmentApi.delete(id); fetchAppointments(); }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Appointment</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      {loading ? <p className="text-gray-500 py-8 text-center">Loading...</p> : appointments.length === 0 ? <p className="text-gray-400 py-8 text-center">No appointments found.</p> : (
        <div className="bg-white rounded-xl border">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Customer</TableHead><TableHead>Email</TableHead>
              <TableHead>Scheduled</TableHead><TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.customer_name}</TableCell>
                  <TableCell>{a.customer_email}</TableCell>
                  <TableCell>{new Date(a.scheduled_time).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={a.status === "Open" ? "warning" : a.status === "Closed" ? "success" : "destructive"}>{a.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Appointment" : "New Appointment"}>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-gray-600">Customer Name</label><Input value={form.customer_name || ""} onChange={(e) => setField("customer_name", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Email</label><Input type="email" value={form.customer_email || ""} onChange={(e) => setField("customer_email", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Phone</label><Input value={form.customer_phone_number || ""} onChange={(e) => setField("customer_phone_number", e.target.value)} /></div>
          <div><label className="text-xs font-medium text-gray-600">Status</label>
            <Select value={form.status || "Open"} onChange={(e) => setField("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select></div>
          <div className="col-span-2"><label className="text-xs font-medium text-gray-600">Scheduled Time</label><Input type="datetime-local" value={form.scheduled_time || ""} onChange={(e) => setField("scheduled_time", e.target.value)} /></div>
          <div className="col-span-2"><label className="text-xs font-medium text-gray-600">Details</label><Input value={form.customer_details || ""} onChange={(e) => setField("customer_details", e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
