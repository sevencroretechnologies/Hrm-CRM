import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { salesTaskApi, taskSourceApi, taskTypeApi, userApi, leadApi, opportunityApi, prospectApi, User } from "../services/api";
import SearchableSelect from "../components/SearchableSelect";

interface SalesTaskModalProps {
    show: boolean;
    onHide: () => void;
    onSave: () => void;
    taskId?: number;
    readOnly?: boolean;
}

// Task source IDs matching the backend enum
const TASK_SOURCE_LEAD = 1;
const TASK_SOURCE_PROSPECT = 2;
const TASK_SOURCE_OPPORTUNITY = 3;

export default function SalesTaskModal({ show, onHide, onSave, taskId, readOnly = false }: SalesTaskModalProps) {
    const [formData, setFormData] = useState({
        task_source_id: "",
        source_id: "",
        task_type_id: "",
        sales_assign_id: "",
    });

    const [sources, setSources] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [sourceEntities, setSourceEntities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (show) {
            loadOptions();
            if (taskId) {
                loadSalesTask(taskId);
            } else {
                setFormData({
                    task_source_id: "",
                    source_id: "",
                    task_type_id: "",
                    sales_assign_id: "",
                });
                setSourceEntities([]);
                setErrors({});
            }
        }
    }, [show, taskId]);

    // Load source entities when task_source_id changes
    useEffect(() => {
        if (formData.task_source_id) {
            loadSourceEntities(Number(formData.task_source_id));
        } else {
            setSourceEntities([]);
        }
    }, [formData.task_source_id]);

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

    const loadSourceEntities = async (taskSourceId: number) => {
        try {
            let entities: any[] = [];
            switch (taskSourceId) {
                case TASK_SOURCE_LEAD: {
                    const result = await leadApi.list();
                    const leadsData = result.data || result;
                    entities = (Array.isArray(leadsData) ? leadsData : []).map((l: any) => ({
                        id: l.id,
                        label: `${l.first_name || ''}`.trim(),
                    }));
                    break;
                }
                case TASK_SOURCE_PROSPECT: {
                    const result = await prospectApi.list();
                    const prospectsData = result.data || result;
                    entities = (Array.isArray(prospectsData) ? prospectsData : []).map((p: any) => {
                        const leadNames = (p.leads || []).map((l: any) => `${l.first_name || ''} ${l.last_name || ''}`.trim()).filter(Boolean).join(', ');
                        const prospectName = (p.company_name && p.company_name !== 'undefined') ? p.company_name :
                            (p.name && p.name !== 'undefined') ? p.name :
                                `Prospect #${p.id}`;
                        return {
                            id: p.id,
                            label: leadNames ? `${prospectName} (${leadNames})` : prospectName,
                        };
                    });
                    break;
                }
                case TASK_SOURCE_OPPORTUNITY: {
                    const result = await opportunityApi.list();
                    const oppsData = result.data || result;
                    entities = (Array.isArray(oppsData) ? oppsData : []).map((o: any) => {
                        let name = o.party_name || o.company_name;

                        if (!name && o.opportunity_from === 'lead' && o.lead) {
                            name = `${o.lead.first_name || ''} `.trim();
                        }

                        if (!name && o.opportunity_from === 'customer') {
                            if (o.customer) name = o.customer.name;
                            else if (o.contact) name = `${o.contact.first_name || ''}`.trim();
                        }

                        if (!name && o.opportunity_from === 'prospect' && o.prospect) {
                            name = o.prospect.name || o.prospect.company_name;
                        }

                        return {
                            id: o.id,
                            label: name ? `${name}` : (o.naming_series || `Opp #${o.id}`),
                        };
                    });
                    break;
                }
            }
            setSourceEntities(entities);
        } catch (error) {
            console.error("Failed to load source entities:", error);
            setSourceEntities([]);
        }
    };

    const loadSalesTask = async (id: number) => {
        try {
            const data = await salesTaskApi.get(id);
            setFormData({
                task_source_id: data.task_source_id.toString(),
                source_id: data.source_id ? data.source_id.toString() : "",
                task_type_id: data.task_type_id.toString(),
                sales_assign_id: data.sales_assign_id ? data.sales_assign_id.toString() : "",
            });
        } catch (error) {
            console.error("Failed to load sales task:", error);
            onHide();
        }
    };

    const handleTaskSourceChange = (value: string) => {
        setFormData({ ...formData, task_source_id: value, source_id: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const dataToSave = {
                task_source_id: Number(formData.task_source_id),
                source_id: formData.source_id ? Number(formData.source_id) : null,
                task_type_id: Number(formData.task_type_id),
                sales_assign_id: formData.sales_assign_id ? Number(formData.sales_assign_id) : null,
            };

            if (taskId) {
                await salesTaskApi.update(taskId, dataToSave);
            } else {
                await salesTaskApi.create(dataToSave);
            }
            onSave();
            onHide();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            console.error("Failed to save sales task:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSourceLabel = (): string => {
        const taskSourceId = Number(formData.task_source_id);
        switch (taskSourceId) {
            case TASK_SOURCE_LEAD: return "Select Lead";
            case TASK_SOURCE_PROSPECT: return "Select Prospect";
            case TASK_SOURCE_OPPORTUNITY: return "Select Opportunity";
            default: return "Select Entity";
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {readOnly ? "View Sales Task" : taskId ? "Edit Sales Task" : "New Sales Task"}
                        </h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Task Source</label>
                                    <select
                                        className={`form-select ${errors.task_source_id ? "is-invalid" : ""}`}
                                        value={formData.task_source_id}
                                        onChange={(e) => handleTaskSourceChange(e.target.value)}
                                        required
                                        disabled={readOnly}
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

                                {/* Conditional: Show entity picker when a source is selected */}
                                {formData.task_source_id && (
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            {Number(formData.task_source_id) === TASK_SOURCE_LEAD && "Lead"}
                                            {Number(formData.task_source_id) === TASK_SOURCE_PROSPECT && "Prospect"}
                                            {Number(formData.task_source_id) === TASK_SOURCE_OPPORTUNITY && "Opportunity"}
                                        </label>
                                        <SearchableSelect
                                            options={sourceEntities}
                                            value={formData.source_id}
                                            onChange={(val) => setFormData({ ...formData, source_id: val })}
                                            placeholder={getSourceLabel()}
                                            disabled={readOnly}
                                            isInvalid={!!errors.source_id}
                                            errorMessage={errors.source_id?.[0]}
                                        />
                                    </div>
                                )}

                                <div className="col-md-6">
                                    <label className="form-label">Task Type</label>
                                    <select
                                        className={`form-select ${errors.task_type_id ? "is-invalid" : ""}`}
                                        value={formData.task_type_id}
                                        onChange={(e) => setFormData({ ...formData, task_type_id: e.target.value })}
                                        required
                                        disabled={readOnly}
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
                                        disabled={readOnly}
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
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>Close</button>
                            {!readOnly && (
                                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                                    <Save size={18} />
                                    {loading ? "Saving..." : (taskId ? "Update" : "Save")}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
