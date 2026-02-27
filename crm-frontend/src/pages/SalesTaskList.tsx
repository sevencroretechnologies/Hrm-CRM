import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { salesTaskApi } from "@/services/api";
import type { SalesTask, PaginatedResponse } from "@/types";
import { Plus, Trash2, Edit2, Eye, Search, X, ArrowLeft, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import SalesTaskModal from "@/pages/SalesTaskModal";

const TASK_SOURCE_OPTIONS = [
    { id: 1, name: "Lead" },
    { id: 2, name: "Prospect" },
    { id: 3, name: "Opportunity" },
];

const getBadgeColor = (sourceName: string) => {
    switch (sourceName?.toLowerCase()) {
        case "lead":
            return "bg-primary";
        case "prospect":
            return "bg-warning text-dark";
        case "opportunity":
            return "bg-success";
        default:
            return "bg-secondary";
    }
};

const getSourceEntityInfo = (task: SalesTask & { source_detail?: any }) => {
    if (task.source_detail) {
        return task.source_detail.name || task.source_detail.company_name || task.source_detail.party_name || `#${task.source_detail.id}`;
    }
    return "-";
};

export default function SalesTaskList() {
    const [salesTasks, setSalesTasks] = useState<SalesTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalTaskId, setModalTaskId] = useState<number | undefined>(undefined);
    const [modalReadOnly, setModalReadOnly] = useState(false);

    const fetchSalesTasks = useCallback((page = 1) => {
        setLoading(true);
        const params: Record<string, string | number> = { page, per_page: perPage };
        if (sourceFilter) params.task_source_id = sourceFilter;
        salesTaskApi
            .list(params)
            .then((data: PaginatedResponse<SalesTask>) => {
                setSalesTasks(data.data || []);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotal(data.total);
            })
            .catch(() => setSalesTasks([]))
            .finally(() => setLoading(false));
    }, [sourceFilter, perPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSalesTasks(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchSalesTasks]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Sales Task?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await salesTaskApi.delete(id);
                Swal.fire("Deleted!", "Sales task has been deleted.", "success");
                fetchSalesTasks(currentPage);
            } catch {
                Swal.fire("Error", "Failed to delete sales task.", "error");
            }
        }
    };

    const openAddModal = () => {
        setModalTaskId(undefined);
        setModalReadOnly(false);
        setShowModal(true);
    };

    const openEditModal = (taskId: number) => {
        setModalTaskId(taskId);
        setModalReadOnly(false);
        setShowModal(true);
    };

    const openViewModal = (taskId: number) => {
        setModalTaskId(taskId);
        setModalReadOnly(true);
        setShowModal(true);
    };

    const handleModalSave = () => {
        setShowModal(false);
        fetchSalesTasks(currentPage);
    };

    // Filter tasks client-side by search (since backend doesn't support text search for sales tasks)
    const filteredTasks = search
        ? salesTasks.filter((task) => {
              const searchLower = search.toLowerCase();
              const sourceName = task.task_source?.name?.toLowerCase() || "";
              const typeName = task.task_type?.name?.toLowerCase() || "";
              const userName = task.assigned_user?.name?.toLowerCase() || "";
              const sourceEntity = getSourceEntityInfo(task).toLowerCase();
              return (
                  sourceName.includes(searchLower) ||
                  typeName.includes(searchLower) ||
                  userName.includes(searchLower) ||
                  sourceEntity.includes(searchLower)
              );
          })
        : salesTasks;

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">CRM</Link>
                    </li>
                    <li className="breadcrumb-item active">Sales Tasks</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    Sales Tasks
                    {total > 0 && <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>}
                </h2>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} className="me-1" /> Add Sales Task
                </button>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search sales tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
                                onClick={() => setSearch("")}
                                style={{ textDecoration: "none" }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                    >
                        <option value="">All Sources</option>
                        {TASK_SOURCE_OPTIONS.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading...</div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted mb-3">No sales tasks found.</p>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Task Source</th>
                                    <th>Source Entity</th>
                                    <th>Task Type</th>
                                    <th>Assigned To</th>
                                    <th>Date</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map((task, index) => (
                                    <tr key={task.id}>
                                        <td>{(currentPage - 1) * perPage + index + 1}</td>
                                        <td>
                                            <span className={`badge ${getBadgeColor(task.task_source?.name || "")}`}>
                                                {task.task_source?.name || "-"}
                                            </span>
                                        </td>
                                        <td>{getSourceEntityInfo(task)}</td>
                                        <td>{task.task_type?.name || "-"}</td>
                                        <td>{task.assigned_user?.name || "-"}</td>
                                        <td>{task.formatted_date || new Date(task.created_at).toLocaleDateString()}</td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-secondary me-1"
                                                onClick={() => openViewModal(task.id)}
                                                title="View"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-1"
                                                onClick={() => openEditModal(task.id)}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(task.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
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
                                            onClick={() => fetchSalesTasks(currentPage - 1)} 
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
                                            onClick={() => fetchSalesTasks(currentPage + 1)} 
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

            <SalesTaskModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleModalSave}
                taskId={modalTaskId}
                readOnly={modalReadOnly}
            />
        </div>
    );
}
