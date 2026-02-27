import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { opportunityStageApi } from "@/services/api";
import type { OpportunityStage } from "@/types";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

export default function OpportunityStageList() {
    const [stages, setStages] = useState<OpportunityStage[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStages = () => {
        setLoading(true);
        opportunityStageApi
            .list()
            .then((data) => setStages(Array.isArray(data) ? data : []))
            .catch(() => setStages([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStages();
    }, []);

    const handleAdd = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Add Opportunity Stage",
            html:
                '<input id="swal-name" class="swal2-input" placeholder="Stage Name">' +
                '<textarea id="swal-description" class="swal2-textarea" placeholder="Description (optional)"></textarea>',
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("swal-name") as HTMLInputElement).value;
                if (!name) {
                    Swal.showValidationMessage("Stage name is required!");
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
                await opportunityStageApi.create(formValues);
                Swal.fire("Added!", "Opportunity stage has been added.", "success");
                fetchStages();
            } catch {
                Swal.fire("Error", "Failed to add stage.", "error");
            }
        }
    };

    const handleEdit = async (stage: OpportunityStage) => {
        const { value: formValues } = await Swal.fire({
            title: "Edit Opportunity Stage",
            html:
                `<input id="swal-name" class="swal2-input" placeholder="Stage Name" value="${stage.name}">` +
                `<textarea id="swal-description" class="swal2-textarea" placeholder="Description (optional)">${stage.description || ""}</textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("swal-name") as HTMLInputElement).value;
                if (!name) {
                    Swal.showValidationMessage("Stage name is required!");
                    return false;
                }
                return {
                    name,
                    description: (document.getElementById("swal-description") as HTMLTextAreaElement).value || null,
                };
            },
        });
        if (formValues && (formValues.name !== stage.name || formValues.description !== stage.description)) {
            try {
                await opportunityStageApi.update(stage.id, formValues);
                Swal.fire("Updated!", "Opportunity stage has been updated.", "success");
                fetchStages();
            } catch {
                Swal.fire("Error", "Failed to update stage.", "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Stage?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await opportunityStageApi.delete(id);
                Swal.fire("Deleted!", "Opportunity stage has been deleted.", "success");
                fetchStages();
            } catch {
                Swal.fire("Error", "Failed to delete stage.", "error");
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
                    <li className="breadcrumb-item active">Opportunity Stages</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Opportunity Stages</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} className="me-1" /> Add Stage
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
                            {stages.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted py-4">
                                        No stages found
                                    </td>
                                </tr>
                            )}
                            {stages.map((stage, index) => (
                                <tr key={stage.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="badge bg-info">{stage.name}</span>
                                    </td>
                                    <td>{stage.description || "-"}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(stage)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(stage.id)}
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
