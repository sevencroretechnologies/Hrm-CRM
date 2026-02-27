import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { salesTaskDetailApi } from "@/services/api";
import type { SalesTaskDetail, PaginatedResponse } from "@/types";
import { Plus, Trash2, Edit2, Eye, Search, X, ArrowLeft, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import SalesTaskDetailModal from "@/pages/SalesTaskDetailModal";

const STATUS_OPTIONS = ["Open", "In Progress", "Closed"];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Open":
            return "bg-primary";
        case "In Progress":
            return "bg-warning text-dark";
        case "Closed":
            return "bg-success";
        default:
            return "bg-secondary";
    }
};

export default function SalesTaskDetailList() {
    const [details, setDetails] = useState<SalesTaskDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<SalesTaskDetail | null>(null);
    const [modalReadOnly, setModalReadOnly] = useState(false);

    const fetchDetails = useCallback((page = 1) => {
        setLoading(true);
        const params: Record<string, string | number> = { page, per_page: perPage };
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        salesTaskDetailApi
            .list(params)
            .then((data: PaginatedResponse<SalesTaskDetail>) => {
                setDetails(data.data || []);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotal(data.total);
            })
            .catch(() => setDetails([]))
            .finally(() => setLoading(false));
    }, [search, statusFilter, perPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDetails(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchDetails]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Task Detail?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await salesTaskDetailApi.delete(id);
                Swal.fire("Deleted!", "Task detail has been deleted.", "success");
                fetchDetails(currentPage);
            } catch {
                Swal.fire("Error", "Failed to delete task detail.", "error");
            }
        }
    };

    const openAddModal = () => {
        setSelectedDetail(null);
        setModalReadOnly(false);
        setShowModal(true);
    };

    const openEditModal = (detail: SalesTaskDetail) => {
        setSelectedDetail(detail);
        setModalReadOnly(false);
        setShowModal(true);
    };

    const openViewModal = (detail: SalesTaskDetail) => {
        setSelectedDetail(detail);
        setModalReadOnly(true);
        setShowModal(true);
    };

    const handleModalSave = () => {
        setShowModal(false);
        fetchDetails(currentPage);
    };

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">CRM</Link>
                    </li>
                    <li className="breadcrumb-item active">All Sales Task Details</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    All Sales Task Details
                    {total > 0 && <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>}
                </h2>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} className="me-1" /> Add Task Detail
                </button>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search by description..."
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
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading...</div>
            ) : details.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted mb-3">No task details found.</p>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Sales Task</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.map((detail, index) => (
                                    <tr key={detail.id}>
                                        <td>{(currentPage - 1) * perPage + index + 1}</td>
                                        <td>
                                            {detail.sales_task ? (
                                                <span>
                                                    <span className="badge bg-info me-1">
                                                        {detail.sales_task.task_source?.name || "Task"}
                                                    </span>
                                                    {detail.sales_task.task_type?.name || `#${detail.sales_task_id}`}
                                                </span>
                                            ) : (
                                                detail.sales_task_id ? `Task #${detail.sales_task_id}` : "-"
                                            )}
                                        </td>
                                        <td>{detail.date}</td>
                                        <td>{detail.time}</td>
                                        <td>
                                            <span
                                                style={{
                                                    maxWidth: 250,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    display: "inline-block",
                                                }}
                                            >
                                                {detail.description}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(detail.status)}`}>
                                                {detail.status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-secondary me-1"
                                                onClick={() => openViewModal(detail)}
                                                title="View"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-1"
                                                onClick={() => openEditModal(detail)}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(detail.id)}
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
                                            onClick={() => fetchDetails(currentPage - 1)} 
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
                                            onClick={() => fetchDetails(currentPage + 1)} 
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

            <SalesTaskDetailModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleModalSave}
                detail={selectedDetail}
                readOnly={modalReadOnly}
            />
        </div>
    );
}
