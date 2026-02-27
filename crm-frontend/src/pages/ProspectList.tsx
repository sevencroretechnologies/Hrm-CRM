import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { leadApi, statusApi } from "@/services/api";
import type { Lead, PaginatedResponse } from "@/types";
import { Pencil, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

export default function ProspectList() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [interestStatusId, setInterestStatusId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    statusApi.list().then((statuses) => {
      const status = statuses.find(s => s.status_name === "Interest");
      if (status) {
        setInterestStatusId(status.id);
      }
    });
  }, []);

  const fetchItems = useCallback((page = 1) => {
    if (interestStatusId === null) return;

    setLoading(true);
    const params: Record<string, string | number> = { status_id: interestStatusId, page, per_page: perPage };
    if (search) params.search = search;

    leadApi.list(params)
      .then((data: PaginatedResponse<Lead>) => {
        setItems(data.data || []);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setTotal(data.total);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [search, interestStatusId, perPage]);

  useEffect(() => {
    if (interestStatusId !== null) {
      fetchItems();
    }
  }, [fetchItems, interestStatusId]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Lead?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await leadApi.delete(id);
      Swal.fire("Deleted!", "Lead has been deleted.", "success");
      fetchItems(currentPage);
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
          <li className="breadcrumb-item active">Prospects (Interest Leads)</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          Prospects
          <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>
        </h2>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search prospects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No prospects found (Interest Leads).</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
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
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{(currentPage - 1) * perPage + index + 1}</td>
                    <td className="fw-medium">
                      <Link to={`/leads/${item.id}/edit`} className="text-decoration-none text-dark">
                        {item.salutation} {item.first_name} {item.last_name}
                      </Link>
                    </td>
                    <td>
                      {item.status ? (
                        <span className={`badge bg-${getStatusColor(item.status.status_name)}`}>{item.status.status_name}</span>
                      ) : "-"}
                    </td>
                    <td>{item.source?.name || "-"}</td>
                    <td>{item.company_name || "-"}</td>
                    <td>{item.email || "-"}</td>
                    <td>{item.mobile_no || "-"}</td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Link to={`/leads/${item.id}/edit`} className="btn btn-sm btn-outline-secondary" title="Edit">
                          <Pencil size={14} />
                        </Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
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
