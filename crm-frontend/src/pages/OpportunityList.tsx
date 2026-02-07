import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { opportunityApi } from "@/services/api";
import type { Opportunity } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Open", "Quotation", "Converted", "Lost", "Replied", "Closed"];

const statusBadge = (s: string) => {
  if (s === "Converted") return "bg-success";
  if (s === "Lost") return "bg-danger";
  if (s === "Open") return "bg-warning text-dark";
  if (s === "Closed") return "bg-secondary";
  return "bg-info";
};

export default function OpportunityList() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    opportunityApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Opportunity?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await opportunityApi.delete(id);
      Swal.fire("Deleted!", "Opportunity has been deleted.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Opportunity</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Opportunity</h2>
        <Link to="/opportunities/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Opportunity</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
          <p className="text-muted mb-3">No opportunities found.</p>
          <Link to="/opportunities/new" className="btn btn-primary">Create a new Opportunity</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Customer</th>
                <th>From</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Amount</th>
                <th>Expected Close</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">{item.customer_name || "-"}</td>
                  <td>{item.opportunity_from}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{item.sales_stage?.stage_name || "-"}</td>
                  <td>${item.opportunity_amount?.toLocaleString() || "0"}</td>
                  <td>{item.expected_closing || "-"}</td>
                  <td className="text-end">
                    <Link to={`/opportunities/${item.id}/edit`} className="btn btn-sm btn-outline-secondary me-1"><Pencil size={14} /></Link>
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
