import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { opportunityTypeApi } from "@/services/api";
import type { OpportunityType } from "@/types";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

export default function OpportunityTypeList() {
    const [types, setTypes] = useState<OpportunityType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTypes = () => {
        setLoading(true);
        opportunityTypeApi
            .list()
            .then((data) => setTypes(Array.isArray(data) ? data : []))
            .catch(() => setTypes([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleAdd = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Add Opportunity Type",
            html:
                '<input id="swal-name" class="swal2-input" placeholder="Type Name">' +
                '<textarea id="swal-description" class="swal2-textarea" placeholder="Description (optional)"></textarea>',
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("swal-name") as HTMLInputElement).value;
                if (!name) {
                    Swal.showValidationMessage("Type name is required!");
                    return false;
                }
                return {
                    name,
                    description: (document.getElementById("swal-description") as HTMLTextAreaElement).value || null,
                };
            },
        });
        if (formValues) {
            try {
                await opportunityTypeApi.create(formValues);
                Swal.fire("Added!", "Opportunity type has been added.", "success");
                fetchTypes();
            } catch {
                Swal.fire("Error", "Failed to add type.", "error");
            }
        }
    };

    const handleEdit = async (type: OpportunityType) => {
        const { value: formValues } = await Swal.fire({
            title: "Edit Opportunity Type",
            html:
                `<input id="swal-name" class="swal2-input" placeholder="Type Name" value="${type.name}">` +
                `<textarea id="swal-description" class="swal2-textarea" placeholder="Description (optional)">${type.description || ""}</textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("swal-name") as HTMLInputElement).value;
                if (!name) {
                    Swal.showValidationMessage("Type name is required!");
                    return false;
                }
                return {
                    name,
                    description: (document.getElementById("swal-description") as HTMLTextAreaElement).value || null,
                };
            },
        });
        if (formValues && (formValues.name !== type.name || formValues.description !== type.description)) {
            try {
                await opportunityTypeApi.update(type.id, formValues);
                Swal.fire("Updated!", "Opportunity type has been updated.", "success");
                fetchTypes();
            } catch {
                Swal.fire("Error", "Failed to update type.", "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Type?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await opportunityTypeApi.delete(id);
                Swal.fire("Deleted!", "Opportunity type has been deleted.", "success");
                fetchTypes();
            } catch {
                Swal.fire("Error", "Failed to delete type.", "error");
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
                    <li className="breadcrumb-item active">Opportunity Types</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Opportunity Types</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} className="me-1" /> Add Type
                </button>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted py-4">
                                        No types found
                                    </td>
                                </tr>
                            )}
                            {types.map((type, index) => (
                                <tr key={type.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="badge bg-success">{type.name}</span>
                                    </td>
                                    <td>{type.description || "-"}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(type)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(type.id)}
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
