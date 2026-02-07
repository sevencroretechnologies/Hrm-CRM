import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { leadApi } from "@/services/api";
import type { Lead } from "@/types";
import { Plus, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Lead", "Open", "Replied", "Opportunity", "Quotation", "Lost Quotation", "Interested", "Converted", "Do Not Contact"];

const statusBadge = (s: string) => {
  if (s === "Converted" || s === "Opportunity") return "bg-success";
  if (s === "Lost Quotation" || s === "Do Not Contact") return "bg-danger";
  if (s === "Open" || s === "Interested") return "bg-warning text-dark";
  return "bg-secondary";
};

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

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

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Lead?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await leadApi.delete(id);
      Swal.fire("Deleted!", "Lead has been deleted.", "success");
      fetchLeads();
    }
  };

  const handleConvert = async (id: number) => {
    const result = await Swal.fire({ title: "Convert to Opportunity?", text: "This will create a new opportunity from this lead.", icon: "question", showCancelButton: true, confirmButtonText: "Yes, convert!" });
    if (result.isConfirmed) {
      try {
        await leadApi.convertToOpportunity(id, {});
        Swal.fire("Converted!", "Lead has been converted to an opportunity.", "success");
        navigate("/opportunities");
      } catch {
        Swal.fire("Error", "Failed to convert lead.", "error");
      }
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Leads</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Lead</h2>
        <Link to="/leads/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Lead</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
      ) : leads.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No leads found.</p>
          <Link to="/leads/new" className="btn btn-primary">Create a new Lead</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Organization Name</th>
                <th>Email</th>
                <th>Territory</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="fw-medium">{lead.first_name} {lead.last_name}</td>
                  <td><span className={`badge ${statusBadge(lead.status)}`}>{lead.status}</span></td>
                  <td>{lead.company_name || "-"}</td>
                  <td>{lead.email_id || "-"}</td>
                  <td>{lead.territory || "-"}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-info me-1" title="Convert to Opportunity" onClick={() => handleConvert(lead.id)}><ArrowRightLeft size={14} /></button>
                    <Link to={`/leads/${lead.id}/edit`} className="btn btn-sm btn-outline-secondary me-1" title="Edit"><Pencil size={14} /></Link>
                    <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(lead.id)}><Trash2 size={14} /></button>
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
