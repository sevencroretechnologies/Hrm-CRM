import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { territoryApi, userApi } from "@/services/api";
import type { Territory } from "@/types";
import type { User } from "@/services/api";
import { Plus, Trash2, Edit2, MapPin, Search } from "lucide-react";
import Swal from "sweetalert2";

export default function TerritoryList() {
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchTerritories = (searchTerm?: string) => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        territoryApi
            .list(params)
            .then((data) => setTerritories(Array.isArray(data) ? data : []))
            .catch(() => setTerritories([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTerritories();
        userApi.list().then((data) => setUsers(Array.isArray(data) ? data : [])).catch(() => setUsers([]));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTerritories(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const openForm = async (territory?: Territory) => {
        const isEdit = !!territory;
        const userOptions: Record<string, string> = {};
        users.forEach((u) => {
            userOptions[String(u.id)] = u.name;
        });

        const { value: formValues } = await Swal.fire({
            title: isEdit ? "Edit Territory" : "Add Territory",
            html: `
                <div style="text-align: left;">
                    <label class="form-label fw-semibold" style="font-size:0.85rem;">Territory Name <span class="text-danger">*</span></label>
                    <input id="swal-territory-name" class="swal2-input" placeholder="Enter territory name" value="${territory?.territory_name || ""}" style="width:100%;margin:0 0 12px 0;">
                    <label class="form-label fw-semibold" style="font-size:0.85rem;">Territory Manager</label>
                    <select id="swal-territory-manager" class="swal2-select" style="width:100%;margin:0;">
                        <option value="">-- Select Manager --</option>
                        ${users.map((u) => `<option value="${u.id}" ${territory?.territory_manager === u.id ? "selected" : ""}>${u.name}</option>`).join("")}
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: isEdit ? "Update" : "Create",
            confirmButtonColor: "#0d6efd",
            preConfirm: () => {
                const name = (document.getElementById("swal-territory-name") as HTMLInputElement)?.value;
                const manager = (document.getElementById("swal-territory-manager") as HTMLSelectElement)?.value;
                if (!name) {
                    Swal.showValidationMessage("Territory name is required!");
                    return false;
                }
                return {
                    territory_name: name,
                    territory_manager: manager ? Number(manager) : null,
                };
            },
        });

        if (formValues) {
            try {
                if (isEdit && territory) {
                    await territoryApi.update(territory.id, formValues);
                    Swal.fire("Updated!", "Territory has been updated.", "success");
                } else {
                    await territoryApi.create(formValues);
                    Swal.fire("Created!", "Territory has been added.", "success");
                }
                fetchTerritories(search);
            } catch (err: any) {
                const message = err?.response?.data?.message || "Something went wrong.";
                Swal.fire("Error", message, "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Territory?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await territoryApi.delete(id);
                Swal.fire("Deleted!", "Territory has been deleted.", "success");
                fetchTerritories(search);
            } catch {
                Swal.fire("Error", "Failed to delete territory.", "error");
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
                    <li className="breadcrumb-item active">Territories</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <MapPin size={24} className="me-2 text-primary" />
                    Territories
                </h2>
                <button className="btn btn-primary" onClick={() => openForm()}>
                    <Plus size={18} className="me-1" /> Add Territory
                </button>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search territories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Territory Name</th>
                                <th>Territory Manager</th>
                                <th>Created At</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {territories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-4">
                                        No territories found. Click "Add Territory" to create one.
                                    </td>
                                </tr>
                            )}
                            {territories.map((territory, index) => (
                                <tr key={territory.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="fw-medium">{territory.territory_name}</span>
                                    </td>
                                    <td>
                                        {territory.manager ? (
                                            <span className="badge bg-info text-dark">
                                                {territory.manager.name}
                                            </span>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>{new Date(territory.created_at).toLocaleDateString()}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => openForm(territory)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(territory.id)}
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
