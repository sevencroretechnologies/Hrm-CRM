import { useEffect, useState, useCallback } from "react";
import { campaignApi } from "@/services/api";
import type { Campaign, PaginatedResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, ArrowLeft } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback((page = 1) => {
    setLoading(true);
    const params: Record<string, string | number> = { page, per_page: 15 };
    if (search) params.search = search;
    campaignApi.list(params)
      .then((data: PaginatedResponse<Campaign>) => {
        setCampaigns(data.data || []);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
        setTotal(data.total);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({}); setDialogOpen(true); };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({ name: c.name, campaign_code: c.campaign_code || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await campaignApi.update(editing.id, form);
    } else {
      await campaignApi.create(form);
    }
    setDialogOpen(false);
    fetchData(currentPage);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this campaign?")) {
      await campaignApi.delete(id);
      fetchData(currentPage);
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Campaigns
          <span className="text-sm font-normal text-gray-400 ml-2">({total})</span>
        </h2>
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
                <TableHead>#</TableHead>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Campaign Code</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c, index) => (
                <TableRow key={c.id}>
                  <TableCell>{(currentPage - 1) * 15 + index + 1}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.campaign_code || "-"}</TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages >= 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-gray-500 mb-2 md:mb-0">
                Showing page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong> · {total} records
              </span>
              <div className="flex gap-1 items-center">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => fetchData(currentPage - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] < page - 1 && (
                        <span className="px-1 text-gray-400">…</span>
                      )}
                      <Button variant={page === currentPage ? "default" : "outline"} size="sm" onClick={() => fetchData(page)}>
                        {page}
                      </Button>
                    </span>
                  ))}
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => fetchData(currentPage + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editing ? "Edit Campaign" : "New Campaign"}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Campaign Name *</label>
            <Input value={form.name || ""} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Campaign Code</label>
            <Input value={form.campaign_code || ""} onChange={(e) => setField("campaign_code", e.target.value)} />
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
