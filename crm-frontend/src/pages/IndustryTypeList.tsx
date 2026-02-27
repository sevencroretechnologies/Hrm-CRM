import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { industryTypeApi } from "@/services/api";
import type { IndustryType } from "@/types";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

export default function IndustryTypeList() {
    const [industryTypes, setIndustryTypes] = useState<IndustryType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchIndustryTypes = () => {
        setLoading(true);
        industryTypeApi
            .list()
            .then((data) => setIndustryTypes(Array.isArray(data) ? data : []))
            .catch(() => setIndustryTypes([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchIndustryTypes();
    }, []);

    const handleAdd = async () => {
        const { value } = await Swal.fire({
            title: "Add Industry Type",
            input: "text",
            inputLabel: "Name",
            inputPlaceholder: "Enter industry type name",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return "Name is required!";
                }
            },
        });
        if (value) {
            try {
                await industryTypeApi.create({ name: value });
                Swal.fire("Added!", "Industry type has been added.", "success");
                fetchIndustryTypes();
            } catch {
                Swal.fire("Error", "Failed to add industry type.", "error");
            }
        }
    };

    const handleEdit = async (industryType: IndustryType) => {
        const { value } = await Swal.fire({
            title: "Edit Industry Type",
            input: "text",
            inputLabel: "Name",
            inputValue: industryType.name,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return "Name is required!";
                }
            },
        });
        if (value && value !== industryType.name) {
            try {
                await industryTypeApi.update(industryType.id, { name: value });
                Swal.fire("Updated!", "Industry type has been updated.", "success");
                fetchIndustryTypes();
            } catch {
                Swal.fire("Error", "Failed to update industry type.", "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Industry Type?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await industryTypeApi.delete(id);
                Swal.fire("Deleted!", "Industry type has been deleted.", "success");
                fetchIndustryTypes();
            } catch {
                Swal.fire("Error", "Failed to delete industry type.", "error");
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
                    <li className="breadcrumb-item active">Industry Types</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Industry Types</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} className="me-1" /> Add Industry Type
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
                            {industryTypes.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center text-muted py-4">
                                        No industry types found
                                    </td>
                                </tr>
                            )}
                            {industryTypes.map((industryType, index) => (
                                <tr key={industryType.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="badge bg-success">{industryType.name}</span>
                                    </td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(industryType)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(industryType.id)}
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
