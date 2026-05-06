import React, { useState, useEffect } from "react";
import { Save, History, MessageSquarePlus } from "lucide-react";
import { salesTaskDetailApi } from "@/services/api";
import { SalesTaskDetail } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showAlert } from "@/lib/sweetalert";
import { format } from "date-fns";

interface FollowUpModalProps {
    show: boolean;
    onHide: () => void;
    onSave: () => void;
    taskId: number;
}

export default function FollowUpModal({ show, onHide, onSave, taskId }: FollowUpModalProps) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        description: "",
        status: "Open",
    });

    const [history, setHistory] = useState<SalesTaskDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (show && taskId) {
            loadHistory();
            setFormData({
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                description: "",
                status: "Open",
            });
            setErrors({});
        }
    }, [show, taskId]);

    const loadHistory = async () => {
        setFetchingHistory(true);
        try {
            const res = await salesTaskDetailApi.list({ sales_task_id: taskId, per_page: 50 });
            // Handle paginated response
            const data = (res as any).data || res;
            setHistory(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Failed to load history:", error);
            setHistory([]);
        } finally {
            setFetchingHistory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const dataToSave = {
                sales_task_id: taskId,
                date: formData.date,
                time: formData.time,
                description: formData.description,
                status: formData.status as any,
            };

            await salesTaskDetailApi.create(dataToSave);
            showAlert('success', 'Follow-up Added!', 'Follow-up details saved successfully', 2000);
            onSave();
            onHide();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            console.error("Failed to save follow-up:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={show} onOpenChange={onHide}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-solarized-blue">
                        <MessageSquarePlus className="h-5 w-5" />
                        Add Follow-up
                    </DialogTitle>
                    <DialogDescription>
                        Record a new follow-up for this sales task.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-8 pr-2">
                    {/* History Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <History className="h-4 w-4" />
                            History
                        </h4>
                        {fetchingHistory ? (
                            <div className="text-center py-4 text-sm text-muted-foreground italic">
                                Loading history...
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-4 text-sm text-muted-foreground border rounded-lg bg-muted/20">
                                No history found.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((item) => (
                                    <div key={item.id} className="p-3 border rounded-lg bg-muted/10 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-solarized-blue">
                                                {item.date ? format(new Date(item.date), 'MMM dd, yyyy') : 'No Date'} | {item.time || 'No Time'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                item.status === 'Closed' ? 'bg-green-100 text-green-700' :
                                                item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-sm">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <hr className="border-muted/50" />

                    {/* Form Section */}
                    <form id="follow-up-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                                {errors.date && <p className="text-xs text-red-500">{errors.date[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    required
                                />
                                {errors.time && <p className="text-xs text-red-500">{errors.time[0]}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                required
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                            </select>
                            {errors.status && <p className="text-xs text-red-500">{errors.status[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Follow-up Remarks</Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter what happened during the follow-up..."
                                required
                            />
                            {errors.description && <p className="text-xs text-red-500">{errors.description[0]}</p>}
                        </div>
                    </form>
                </div>

                <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button type="submit" form="follow-up-form" disabled={loading} className="bg-solarized-blue hover:bg-solarized-blue/90">
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Add Follow-up"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
