import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { leadApi, statusApi, sourceApi } from "@/services/api";
import type { Lead, Status, Source, PaginatedResponse } from "@/types";
import { Plus, Pencil, Trash2, Eye, ArrowLeft, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import { useRef } from "react";
import LeadDetailsModal from "@/components/LeadDetailsModal";
import { MoreVertical } from "lucide-react";

interface LeadActionsMenuProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onDelete: (id: number) => void;
}

function LeadActionsMenu({ lead, onView, onDelete }: LeadActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link btn-sm p-0 text-muted"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        type="button"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          className="dropdown-menu show"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            zIndex: 1000,
            display: 'block',
            minWidth: '160px'
          }}
        >
          <button
            className="dropdown-item d-flex align-items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onView(lead);
              setIsOpen(false);
            }}
          >
            <Eye size={14} className="me-2" /> View
          </button>
          <Link
            className="dropdown-item d-flex align-items-center"
            to={`/leads/${lead.id}/edit`}
            onClick={() => setIsOpen(false)}
          >
            <Pencil size={14} className="me-2" /> Edit
          </Link>
          <button
            className="dropdown-item d-flex align-items-center text-danger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(lead.id);
              setIsOpen(false);
            }}
          >
            <Trash2 size={14} className="me-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    Promise.all([statusApi.list(), sourceApi.list()])
      .then(([statusRes, sourceRes]) => {
        setStatuses(Array.isArray(statusRes) ? statusRes : []);
        setSources(Array.isArray(sourceRes) ? sourceRes : []);
      });
  }, []);

  const fetchLeads = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (search) params.search = search;
    if (statusFilter) params.status_id = statusFilter;
    if (sourceFilter) params.source_id = sourceFilter;
    leadApi.list(params).then((data: PaginatedResponse<Lead>) => {
      setLeads(data.data || []);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
      setTotal(data.total);
    }).catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, sourceFilter, perPage]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Lead?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await leadApi.delete(id);
      Swal.fire("Deleted!", "Lead has been deleted.", "success");
      fetchLeads(currentPage);
    }
  };

  const getStatusColor = (statusName: string = '') => {
    const name = statusName.toLowerCase();
    if (name.includes('new')) return 'primary';
    if (name.includes('contact')) return 'warning';
    if (name.includes('qualif')) return 'success';
    if (name.includes('propos')) return 'info';
    if (name.includes('won') || name.includes('convert')) return 'success';
    if (name.includes('lost')) return 'danger';
    return 'secondary';
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
        <h2>
          Leads
          <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>
        </h2>
        <div className="d-flex gap-2">
          <Link to="/leads/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Lead</Link>
        </div>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="">All Sources</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
      ) : viewMode === 'list' ? (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Series</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={lead.id}>
                    <td>{(currentPage - 1) * perPage + index + 1}</td>
                    <td>
                      <Link to={`/leads/${lead.id}/edit`} className="text-decoration-none fw-bold text-primary">
                        {lead.series || lead.id}
                      </Link>
                    </td>
                    <td className="fw-medium">
                      {lead.salutation} {lead.first_name} {lead.middle_name} {lead.last_name}
                    </td>
                    <td>
                      {lead.status ? (
                        <span className={`badge bg-${getStatusColor(lead.status.status_name)}`}>{lead.status.status_name}</span>
                      ) : "-"}
                    </td>
                    <td>{lead.source?.name || "-"}</td>
                    <td>{lead.company_name || "-"}</td>
                    <td>{lead.email || "-"}</td>
                    <td>{lead.mobile_no || "-"}</td>
                    <td className="text-end">
                      <LeadActionsMenu lead={lead} onView={setSelectedLead} onDelete={handleDelete} />
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
                                onClick={() => fetchLeads(currentPage - 1)} 
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
                                onClick={() => fetchLeads(currentPage + 1)} 
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
      ) : (
        <>
          <div className="d-flex overflow-auto pb-4" style={{ gap: '1.5rem', minHeight: '600px' }}>
            {statuses.map((status) => {
              const statusLeads = leads.filter(l => l.status_id === status.id);
              const color = getStatusColor(status.status_name);
              return (
                <div key={status.id} style={{ minWidth: '320px', maxWidth: '320px' }} className="d-flex flex-column h-100">
                  <div className="d-flex align-items-center mb-3 px-1">
                    <span className={`badge bg-${color} rounded-circle p-1 me-2`} style={{ width: '10px', height: '10px' }}> </span>
                    <h6 className="mb-0 fw-bold fs-6 flex-grow-1">{status.status_name}</h6>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2">{statusLeads.length}</span>
                  </div>

                  <div className="bg-light rounded-3 p-2 d-flex flex-column gap-2 flex-grow-1">
                    <Link to={`/leads/new?status=${status.id}`} className="btn btn-outline-secondary border-dashed w-100 d-flex align-items-center justify-content-center py-2 mb-2" style={{ borderStyle: 'dashed' }}>
                      <Plus size={16} className="me-1" /> Add Lead
                    </Link>

                    <div className="flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)', scrollbarWidth: 'thin' }}>
                      {statusLeads.map(lead => (
                        <div key={lead.id} className={`card mb-3 border-0 border-start border-4 shadow-sm`} style={{ borderLeftColor: `var(--bs-${color}) !important` }}>
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <div className="text-muted small mb-1">{lead.series || lead.id}</div>
                                <h6 className="card-title mb-0 fw-bold">
                                  <Link to={`/leads/${lead.id}/edit`} className="text-decoration-none text-dark">
                                    {lead.salutation} {lead.first_name} {lead.last_name}
                                  </Link>
                                </h6>
                              </div>
                              <LeadActionsMenu lead={lead} onView={setSelectedLead} onDelete={handleDelete} />
                            </div>
                            {lead.company_name && <p className="small text-muted mb-1">{lead.company_name}</p>}
                            {lead.email && <p className="small text-muted mb-2 text-truncate">{lead.email}</p>}

                            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                              <span className="fw-bold text-dark">
                                {lead.annual_revenue ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.annual_revenue) : ''}
                              </span>
                              <span className={`badge bg-${color} bg-opacity-10 text-${color} px-2 py-1`}>
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {statusLeads.length === 0 && (
                        <div className="text-center text-muted py-4 small">No leads in this stage</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Unassigned Column */}
            {leads.filter(l => !l.status_id).length > 0 && (
              <div style={{ minWidth: '320px', maxWidth: '320px' }} className="d-flex flex-column h-100">
                <div className="d-flex align-items-center mb-3 px-1">
                  <span className="badge bg-secondary rounded-circle p-1 me-2" style={{ width: '10px', height: '10px' }}> </span>
                  <h6 className="mb-0 fw-bold fs-6 flex-grow-1">Unassigned</h6>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2">{leads.filter(l => !l.status_id).length}</span>
                </div>
                <div className="bg-light rounded-3 p-2 d-flex flex-column gap-2 flex-grow-1">
                  <div className="flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {leads.filter(l => !l.status_id).map(lead => (
                      <div key={lead.id} className="card mb-3 border-0 border-start border-4 border-secondary shadow-sm">
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0 fw-bold">
                              <Link to={`/leads/${lead.id}/edit`} className="text-decoration-none text-dark">
                                {lead.salutation} {lead.first_name} {lead.last_name}
                              </Link>
                            </h6>
                            <LeadActionsMenu lead={lead} onView={setSelectedLead} onDelete={handleDelete} />
                          </div>
                          {lead.company_name && <p className="small text-muted mb-1">{lead.company_name}</p>}
                          <div className="mt-2">
                            <Link to={`/leads/${lead.id}/edit`} className="btn btn-xs btn-outline-primary w-100">Assign Status</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
          {/* Pagination for Board View */}
          {total > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 border-top pt-3">
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
                                onClick={() => fetchLeads(currentPage - 1)} 
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
                                onClick={() => fetchLeads(currentPage + 1)} 
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
        </>
      )}
      {selectedLead && (
        <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}
