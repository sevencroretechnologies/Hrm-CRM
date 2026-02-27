import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { opportunityApi, statusApi, opportunityTypeApi, opportunityStageApi } from "@/services/api";
import type { Opportunity, Status, OpportunityType, OpportunityStage, PaginatedResponse } from "@/types";
import { Plus, Pencil, Trash2, Eye, ArrowLeft, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import OpportunityDetailsModal from "@/components/OpportunityDetailsModal";

export default function OpportunityList() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [types, setTypes] = useState<OpportunityType[]>([]);
  const [stages, setStages] = useState<OpportunityStage[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    Promise.all([
      statusApi.list(),
      opportunityTypeApi.list(),
      opportunityStageApi.list(),
    ]).then(([statusRes, typeRes, stageRes]) => {
      setStatuses(Array.isArray(statusRes) ? statusRes : []);
      setTypes(Array.isArray(typeRes) ? typeRes : []);
      setStages(Array.isArray(stageRes) ? stageRes : []);
    });
  }, []);

  const fetchItems = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (search) params.search = search;
    if (statusFilter) params.status_id = statusFilter;
    if (typeFilter) params.opportunity_type_id = typeFilter;
    if (stageFilter) params.opportunity_stage_id = stageFilter;
    opportunityApi.list(params)
      .then((data: PaginatedResponse<Opportunity>) => {
        setItems(data.data || []);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setTotal(data.total);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, typeFilter, stageFilter, perPage]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Opportunity?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await opportunityApi.delete(id);
      Swal.fire("Deleted!", "Opportunity has been deleted.", "success");
      fetchItems(currentPage);
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Opportunities</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          Opportunities
          <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>
        </h2>
        <Link to="/opportunities/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Opportunity</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input type="text" className="form-control" placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="">All Stages</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Opportunity From</th>
                  <th>Party</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Probability</th>
                  <th>Expected Close</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const partyName = (() => {
                    if (item.opportunity_from === 'lead' && item.lead) {
                      return `${item.lead.first_name} ${item.lead.last_name || ''}`.trim();
                    }
                    if (item.opportunity_from === 'customer') {
                      if (item.customer) return item.customer.name;
                      if (item.contact) return item.contact.full_name || `${item.contact.first_name} ${item.contact.last_name}`.trim();
                    }
                    return item.party_name || "—";
                  })();

                  const stageName = item.opportunity_type?.name || stages.find(s => s.id === item.opportunity_type_id)?.name || "—";

                  return (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * perPage + index + 1}</td>
                      <td><Link to={`/opportunities/${item.id}/edit`} className="text-decoration-none fw-bold">{item.naming_series || item.id}</Link></td>
                      <td>
                        <div className="fw-medium text-capitalize">{item.opportunity_from || "—"}</div>
                      </td>
                      <td>
                        <div className="fw-medium">{partyName}</div>
                        {item.company_name && <div className="text-muted small">{item.company_name}</div>}
                      </td>
                      <td>
                        {item.status ? (
                          <span className="badge bg-secondary">{item.status.status_name}</span>
                        ) : "—"}
                      </td>
                      <td>{stageName}</td>
                      <td>{item.probability !== null ? `${item.probability}%` : "—"}</td>
                      <td>{item.expected_closing || "—"}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-icon btn-outline-info me-1" title="View" onClick={() => setSelectedOpportunity(item)}><Eye size={14} /></button>
                        <Link to={`/opportunities/${item.id}/edit`} className="btn btn-sm btn-icon btn-outline-primary me-1" title="Edit"><Pencil size={14} /></Link>
                        <button className="btn btn-sm btn-icon btn-outline-danger" title="Delete" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
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
      {selectedOpportunity && (
        <OpportunityDetailsModal opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} />
      )}
    </div>
  );
}
