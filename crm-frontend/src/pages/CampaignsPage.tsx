import { useEffect, useState, useCallback } from "react";
import { campaignApi } from "@/services/api";
import type { Campaign } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchData = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    campaignApi.list(params).then((res) => {
      setCampaigns(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({}); setDialogOpen(true); };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({ campaign_name: c.campaign_name, description: c.description || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await campaignApi.update(editing.id, form);
    } else {
      await campaignApi.create(form);
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this campaign?")) {
      await campaignApi.delete(id);
      fetchData();
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Campaigns</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading...</p>
      ) : campaigns.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No campaigns found.</p>
      ) : (
        <div className="bg-white rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.campaign_name}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.description || "-"}</TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Campaign" : "New Campaign"}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Campaign Name *</label>
            <Input value={form.campaign_name || ""} onChange={(e) => setField("campaign_name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Description</label>
            <Textarea value={form.description || ""} onChange={(e) => setField("description", e.target.value)} rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
        </div>
      </Dialog>
    </div>
  );
}
