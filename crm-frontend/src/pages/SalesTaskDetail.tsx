import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import Swal from 'sweetalert2';
import { salesTaskApi, salesTaskDetailApi } from "../services/api";
import { SalesTask, SalesTaskDetail as SalesTaskDetailType } from "../types";
import SalesTaskDetailModal from "./SalesTaskDetailModal";

export default function SalesTaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<SalesTask | null>(null);
    const [details, setDetails] = useState<SalesTaskDetailType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<SalesTaskDetailType | null>(null);

    useEffect(() => {
        if (id) {
            loadTask(Number(id));
            loadDetails(Number(id));
        } else {
            navigate("/sales-task-details");
        }
    }, [id]);

    const loadTask = async (taskId: number) => {
        try {
            const data = await salesTaskApi.get(taskId);
            setTask(data);
        } catch (error) {
            console.error("Failed to load task:", error);
            navigate("/sales-task-details");
        }
    };

    const loadDetails = async (taskId: number) => {
        try {
            const params: Record<string, string | number> = { sales_task_id: taskId };
            const res = await salesTaskDetailApi.list(params);
            setDetails(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error("Failed to load task details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDetail = async (detailId: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await salesTaskDetailApi.delete(detailId);
                Swal.fire(
                    'Deleted!',
                    'Your detail has been deleted.',
                    'success'
                );
                if (id) loadDetails(Number(id));
            } catch (error) {
                console.error("Failed to delete detail:", error);
                Swal.fire(
                    'Error!',
                    'Failed to delete detail.',
                    'error'
                );
            }
        }
    };

    const handleAdd = () => {
        setSelectedDetail(null);
        setShowModal(true);
    };

    const handleEdit = (detail: SalesTaskDetailType) => {
        setSelectedDetail(detail);
        setShowModal(true);
    };

    const handleSave = () => {
        if (id) loadDetails(Number(id));
        setShowModal(false);
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (!task) return <div className="p-4">Task not found</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Link to="/sales-task-details" className="btn btn-outline-secondary">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="mb-0">Sales Task Details</h2>
                </div>
                <Link to={`/sales-task-details/${task.id}/edit`} className="btn btn-primary d-flex align-items-center gap-2">
                    <Edit size={18} />
                    Edit Task
                </Link>
            </div>

            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Task Info</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="text-muted small d-block mb-1">Task Type</label>
                                <span className="badge bg-secondary fs-6">
                                    {task.task_type?.name || "Unknown"}
                                </span>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small d-block mb-1">Source</label>
                                <p className="fs-5 fw-medium mb-0">{task.task_source?.name || "Unknown"}</p>
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small d-block mb-1">Assigned User</label>
                                {task.assigned_user?.name ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px' }}>
                                            {task.assigned_user.name.charAt(0)}
                                        </div>
                                        <span className="fs-5">{task.assigned_user.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted fst-italic fs-5">Unassigned</span>
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="text-muted small d-block mb-1">Created Date</label>
                                <p className="fs-5 mb-0">{new Date(task.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Progress & Details</h5>
                            <button
                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                onClick={handleAdd}
                            >
                                <Plus size={16} /> Add Detail
                            </button>
                        </div>
                        <div className="card-body">
                            {details.length === 0 ? (
                                <div className="text-center text-muted py-4">No details found. Add one to start tracking progress.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Date / Time</th>
                                                <th>Description</th>
                                                <th>Status</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.map((detail) => (
                                                <tr key={detail.id}>
                                                    <td style={{ minWidth: '140px' }}>
                                                        <div className="fw-medium">{configDate(detail.date)}</div>
                                                        <div className="small text-muted">{detail.time}</div>
                                                    </td>
                                                    <td>{detail.description}</td>
                                                    <td>
                                                        <span className={`badge bg-${getStatusColor(detail.status)}`}>
                                                            {detail.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                            onClick={() => handleEdit(detail)}
                                                            title="Edit"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteDetail(detail.id)}
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
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <SalesTaskDetailModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleSave}
                detail={selectedDetail}
                salesTaskId={task ? task.id : undefined}
            />
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'Open': return 'primary';
        case 'In Progress': return 'warning';
        case 'Closed': return 'success';
        default: return 'secondary';
    }
}

function configDate(dateStr: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString();
}
