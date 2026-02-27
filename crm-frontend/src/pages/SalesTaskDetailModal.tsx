import React, { useState, useEffect } from "react";
import { salesTaskApi, salesTaskDetailApi } from "../services/api";
import { SalesTask, SalesTaskDetail } from "../types";

interface SalesTaskDetailModalProps {
    show: boolean;
    onHide: () => void;
    onSave: () => void;
    detail?: SalesTaskDetail | null; // For editing
    salesTaskId?: number; // Pre-fill for new detail related to a task
    readOnly?: boolean; // For view only
}

export default function SalesTaskDetailModal({ show, onHide, onSave, detail, salesTaskId, readOnly = false }: SalesTaskDetailModalProps) {
    const [salesTasks, setSalesTasks] = useState<SalesTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        date: string;
        time: string;
        description: string;
        status: SalesTaskDetail['status'];
        sales_task_id?: number;
    }>({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        description: "",
        status: "Open",
        sales_task_id: undefined,
    });

    useEffect(() => {
        if (show) {
            loadSalesTasks();
            if (detail) {
                // Edit mode
                setFormData({
                    date: detail.date,
                    time: detail.time,
                    description: detail.description,
                    status: detail.status,
                    sales_task_id: detail.sales_task_id || undefined,
                });
            } else {
                // Create mode
                setFormData({
                    date: new Date().toISOString().split("T")[0],
                    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
                    description: "",
                    status: "Open",
                    sales_task_id: salesTaskId || undefined,
                });
            }
        }
    }, [show, detail, salesTaskId]);

    const loadSalesTasks = async () => {
        try {
            const res = await salesTaskApi.list({ per_page: 1000 });
            setSalesTasks(res.data || []);
        } catch (error) {
            console.error("Failed to load sales tasks:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (detail) {
                await salesTaskDetailApi.update(detail.id, formData);
            } else {
                await salesTaskDetailApi.create(formData);
            }
            onSave();
            onHide();
        } catch (error) {
            console.error("Failed to save detail:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {readOnly ? "View Sales Task Detail" : detail ? "Edit Sales Task Detail" : "New Sales Task Detail"}
                        </h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Sales Task</label>
                                <select
                                    className="form-select"
                                    value={formData.sales_task_id || ""}
                                    onChange={(e) => setFormData({ ...formData, sales_task_id: Number(e.target.value) })}
                                    required
                                    disabled={!!salesTaskId && !detail || readOnly} // Disable if adding to a specific task context or readOnly
                                >
                                    <option value="">Select Sales Task</option>
                                    {salesTasks.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.task_type?.name} ({t.task_source?.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        disabled={readOnly}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Time</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        required
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    disabled={readOnly}
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SalesTaskDetail['status'] })}
                                    disabled={readOnly}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>Close</button>
                            {!readOnly && (
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Saving..." : (detail ? "Update" : "Save")}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
