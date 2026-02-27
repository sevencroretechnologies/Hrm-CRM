import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { requestTypeApi } from "@/services/api";
import type { RequestType } from "@/types";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

export default function RequestTypeList() {
    const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequestTypes = () => {
        setLoading(true);
        requestTypeApi
            .list()
            .then((data) => setRequestTypes(Array.isArray(data) ? data : []))
            .catch(() => setRequestTypes([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRequestTypes();
    }, []);

    const handleAdd = async () => {
        const { value } = await Swal.fire({
            title: "Add Request Type",
            input: "text",
            inputLabel: "Name",
            inputPlaceholder: "Enter request type name",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return "Name is required!";
                }
            },
        });
        if (value) {
            try {
                await requestTypeApi.create({ name: value });
                Swal.fire("Added!", "Request type has been added.", "success");
                fetchRequestTypes();
            } catch {
                Swal.fire("Error", "Failed to add request type.", "error");
            }
        }
    };

    const handleEdit = async (requestType: RequestType) => {
        const { value } = await Swal.fire({
            title: "Edit Request Type",
            input: "text",
            inputLabel: "Name",
            inputValue: requestType.name,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return "Name is required!";
                }
            },
        });
        if (value && value !== requestType.name) {
            try {
                await requestTypeApi.update(requestType.id, { name: value });
                Swal.fire("Updated!", "Request type has been updated.", "success");
                fetchRequestTypes();
            } catch {
                Swal.fire("Error", "Failed to update request type.", "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Request Type?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await requestTypeApi.delete(id);
                Swal.fire("Deleted!", "Request type has been deleted.", "success");
                fetchRequestTypes();
            } catch {
                Swal.fire("Error", "Failed to delete request type.", "error");
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
                    <li className="breadcrumb-item active">Request Types</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Request Types</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} className="me-1" /> Add Request Type
                </button>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requestTypes.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center text-muted py-4">
                                        No request types found
                                    </td>
                                </tr>
                            )}
                            {requestTypes.map((requestType, index) => (
                                <tr key={requestType.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="badge bg-info">{requestType.name}</span>
                                    </td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(requestType)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(requestType.id)}
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
