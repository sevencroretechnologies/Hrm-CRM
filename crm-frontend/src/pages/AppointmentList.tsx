import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { appointmentApi } from "@/services/api";
import type { Appointment, PaginatedResponse } from "@/types";
import { Plus, Pencil, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    appointmentApi.list(params)
      .then((data: PaginatedResponse<Appointment>) => {
        setItems(data.data || []);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setTotal(data.total);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, perPage]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Appointment?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await appointmentApi.delete(id);
      Swal.fire("Deleted!", "Appointment has been deleted.", "success");
      fetchItems(currentPage);
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
        <h2>
          Appointment
          <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>
        </h2>
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
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Customer Name</th>
                  <th>Status</th>
                  <th>Scheduled Time</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{(currentPage - 1) * perPage + index + 1}</td>
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

          {/* Pagination */}
          {total > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 px-3 pb-3 border-top pt-3">
                <div className="d-flex align-items-center mb-2 mb-md-0">
                    <span className="small text-muted me-2">Rows per page:</span>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: "auto" }}
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
                    <div className="small text-muted ms-3">
                        {(currentPage - 1) * perPage + 1}-
                        {Math.min(currentPage * perPage, total)} of {total}
                    </div>
                </div>
                <nav>
                    <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button 
                                className="page-link border-0" 
                                onClick={() => fetchItems(currentPage - 1)} 
                                disabled={currentPage === 1}
                                title="Previous Page"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        </li>
                        <li className="page-item disabled">
                            <span className="page-link border-0 text-dark bg-transparent font-weight-bold">
                                Page {currentPage} of {totalPages}
                            </span>
                        </li>
                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button 
                                className="page-link border-0" 
                                onClick={() => fetchItems(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                title="Next Page"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
