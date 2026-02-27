import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { statusApi } from "@/services/api";
import type { Status } from "@/types";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

export default function StatusList() {
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStatuses = () => {
        setLoading(true);
        statusApi
            .list()
            .then((data) => setStatuses(Array.isArray(data) ? data : []))
            .catch(() => setStatuses([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    const handleAdd = async () => {
        const { value } = await Swal.fire({
            title: "Add Lead Status",
            input: "text",
            inputLabel: "Status Name",
            inputPlaceholder: "Enter status name",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return "Status name is required!";
                }
            },
        });
        if (value) {
            try {
                await statusApi.create({ status_name: value });
                Swal.fire("Added!", "Lead status has been added.", "success");
                fetchStatuses();
            } catch {
                Swal.fire("Error", "Failed to add status.", "error");
            }
        }
    };

    const handleEdit = async (status: Status) => {
        const { value } = await Swal.fire({
            title: "Edit Lead Status",
            input: "text",
            inputLabel: "Status Name",
            inputValue: status.status_name,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return "Status name is required!";
                }
            },
        });
        if (value && value !== status.status_name) {
            try {
                await statusApi.update(status.id, { status_name: value });
                Swal.fire("Updated!", "Lead status has been updated.", "success");
                fetchStatuses();
            } catch {
                Swal.fire("Error", "Failed to update status.", "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Status?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await statusApi.delete(id);
                Swal.fire("Deleted!", "Lead status has been deleted.", "success");
                fetchStatuses();
            } catch {
                Swal.fire("Error", "Failed to delete status.", "error");
            }
        }
    };

    if (loading) {
        return <div className="text-center py-5 text-muted">Loading...</div>;
    }

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">CRM</Link>
                    </li>
                    <li className="breadcrumb-item active">Lead Statuses</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Lead Statuses</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} className="me-1" /> Add Status
                </button>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Status Name</th>
                                {/* <th>Created At</th> */}
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statuses.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted py-4">
                                        No statuses found
                                    </td>
                                </tr>
                            )}
                            {statuses.map((status, index) => (
                                <tr key={status.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="badge bg-primary">{status.status_name}</span>
                                    </td>
                                    {/* <td>{new Date(status.created_at).toLocaleDateString()}</td> */}
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(status)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(status.id)}
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
            </div>
        </div>
    );
}
