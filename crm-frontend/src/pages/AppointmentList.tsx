import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { appointmentApi } from "@/services/api";
import type { Appointment } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Open", "Closed", "Cancelled"];

const statusBadge = (s: string) => {
  if (s === "Open") return "bg-success";
  if (s === "Closed") return "bg-secondary";
  if (s === "Cancelled") return "bg-danger";
  return "bg-info";
};

export default function AppointmentList() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    appointmentApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Appointment?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await appointmentApi.delete(id);
      Swal.fire("Deleted!", "Appointment has been deleted.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Appointment</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Appointment</h2>
        <Link to="/appointments/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Appointment</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No appointments found.</p>
          <Link to="/appointments/new" className="btn btn-primary">Create a new Appointment</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Customer Name</th>
                <th>Status</th>
                <th>Scheduled Time</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">{item.customer_name}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{item.scheduled_time ? new Date(item.scheduled_time).toLocaleString() : "-"}</td>
                  <td>{item.customer_email || "-"}</td>
                  <td>{item.customer_phone_number || "-"}</td>
                  <td className="text-end">
                    <Link to={`/appointments/${item.id}/edit`} className="btn btn-sm btn-outline-secondary me-1"><Pencil size={14} /></Link>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
