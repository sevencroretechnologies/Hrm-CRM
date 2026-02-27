import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { salesTaskApi, taskSourceApi, taskTypeApi, userApi, User } from "../services/api";

export default function SalesTaskForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        task_source_id: "",
        task_type_id: "",
        sales_assign_id: "",
    });

    const [sources, setSources] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        loadOptions();
        if (isEditing) {
            loadSalesTask();
        }
    }, [id]);

    const loadOptions = async () => {
        try {
            const [sourcesData, typesData, usersData] = await Promise.all([
                taskSourceApi.list(),
                taskTypeApi.list(),
                userApi.list(),
            ]);
            setSources(sourcesData);
            setTypes(typesData);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to load options:", error);
        }
    };

    const loadSalesTask = async () => {
        try {
            const data = await salesTaskApi.get(Number(id));
            setFormData({
                task_source_id: data.task_source_id.toString(),
                task_type_id: data.task_type_id.toString(),
                sales_assign_id: data.sales_assign_id ? data.sales_assign_id.toString() : "",
            });
        } catch (error) {
            console.error("Failed to load sales task:", error);
            navigate("/sales-tasks");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const dataToSave = {
                task_source_id: Number(formData.task_source_id),
                task_type_id: Number(formData.task_type_id),
                sales_assign_id: formData.sales_assign_id ? Number(formData.sales_assign_id) : null,
            };

            if (isEditing) {
                await salesTaskApi.update(Number(id), dataToSave);
            } else {
                await salesTaskApi.create(dataToSave);
            }
            navigate("/sales-tasks");
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            console.error("Failed to save sales task:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <button onClick={() => navigate("/sales-tasks")} className="btn btn-outline-secondary">
                    <ArrowLeft size={20} />
                </button>
                <h2>{isEditing ? "Edit Sales Task" : "New Sales Task"}</h2>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Task Source</label>
                                <select
                                    className={`form-select ${errors.task_source_id ? "is-invalid" : ""}`}
                                    value={formData.task_source_id}
                                    onChange={(e) => setFormData({ ...formData, task_source_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Source</option>
                                    {sources.map((source) => (
                                        <option key={source.id} value={source.id}>
                                            {source.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.task_source_id && <div className="invalid-feedback">{errors.task_source_id[0]}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Task Type</label>
                                <select
                                    className={`form-select ${errors.task_type_id ? "is-invalid" : ""}`}
                                    value={formData.task_type_id}
                                    onChange={(e) => setFormData({ ...formData, task_type_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {types.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.task_type_id && <div className="invalid-feedback">{errors.task_type_id[0]}</div>}
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Assigned User</label>
                                <select
                                    className={`form-select ${errors.sales_assign_id ? "is-invalid" : ""}`}
                                    value={formData.sales_assign_id}
                                    onChange={(e) => setFormData({ ...formData, sales_assign_id: e.target.value })}
                                >
                                    <option value="">Select User (Optional)</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.sales_assign_id && <div className="invalid-feedback">{errors.sales_assign_id[0]}</div>}
                            </div>

                            <div className="col-12 mt-4">
                                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                                    <Save size={18} />
                                    {loading ? "Saving..." : "Save Sales Task"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
