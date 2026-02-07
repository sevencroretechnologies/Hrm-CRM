import { useState, useEffect, useCallback } from 'react';
import { crmCampaignService } from '../../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Megaphone } from 'lucide-react';

interface Campaign {
  id: number;
  campaign_name: string;
  description: string | null;
  created_at: string;
}

export default function CampaignsList() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ campaign_name: '', description: '' });

  const fetchItems = useCallback(async (currentPage: number = 1) => {
    setIsLoading(true);
    try {
      const response = await crmCampaignService.getAll({ page: currentPage, per_page: perPage, search });
      const { data, meta } = response.data;
      setItems(Array.isArray(data) ? data : []);
      setTotalRows(meta?.total ?? 0);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      setItems([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [perPage, search]);

  useEffect(() => { fetchItems(page); }, [page, fetchItems]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };
  const resetForm = () => setFormData({ campaign_name: '', description: '' });
  const handleAddClick = () => { resetForm(); setIsAddOpen(true); };
  const handleView = (item: Campaign) => { setSelected(item); setIsViewOpen(true); };

  const handleEdit = (item: Campaign) => {
    setSelected(item);
    setFormData({ campaign_name: item.campaign_name || '', description: item.description || '' });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmDialog('Delete Campaign', 'Are you sure you want to delete this campaign?');
    if (!result.isConfirmed) return;
    try {
      await crmCampaignService.delete(id);
      showAlert('success', 'Deleted!', 'Campaign deleted successfully', 2000);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to delete campaign'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await crmCampaignService.create(formData);
      showAlert('success', 'Success', 'Campaign created successfully', 2000);
      setIsAddOpen(false);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to create campaign'));
    } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await crmCampaignService.update(selected.id, formData);
      showAlert('success', 'Success', 'Campaign updated successfully', 2000);
      setIsEditOpen(false);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to update campaign'));
    } finally { setIsSubmitting(false); }
  };

  const columns: TableColumn<Campaign>[] = [
    { name: 'Campaign Name', cell: (row) => <span className="font-medium">{row.campaign_name}</span>, minWidth: '200px' },
    { name: 'Description', cell: (row) => row.description ? (row.description.length > 60 ? row.description.substring(0, 60) + '...' : row.description) : '-', minWidth: '250px' },
    { name: 'Created', selector: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-' },
    {
      name: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(row)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '80px',
    },
  ];

  const customStyles = {
    headRow: { style: { backgroundColor: '#f9fafb', borderBottomWidth: '1px', borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid' as const, minHeight: '56px' } },
    headCells: { style: { fontSize: '14px', fontWeight: '600', color: '#374151', paddingLeft: '16px', paddingRight: '16px' } },
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Campaign Name *</Label><Input value={formData.campaign_name} onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })} required /></div>
      <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} /></div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting} className="bg-solarized-blue hover:bg-solarized-blue/90">
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Campaigns</h1><p className="text-muted-foreground">Manage your CRM campaigns</p></div>
        <Button onClick={handleAddClick} className="bg-solarized-blue hover:bg-solarized-blue/90"><Plus className="mr-2 h-4 w-4" /> Add Campaign</Button>
      </div>
      <Card>
        <CardHeader>
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <Input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="submit" variant="outline"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </form>
        </CardHeader>
        <CardContent>
          {!isLoading && items.length === 0 ? (
            <div className="text-center py-12"><Megaphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p>No campaigns found</p></div>
          ) : (
            <DataTable columns={columns} data={items} progressPending={isLoading} pagination paginationServer
              paginationTotalRows={totalRows} paginationPerPage={perPage} paginationDefaultPage={page}
              onChangePage={(p) => setPage(p)} onChangeRowsPerPage={(pp) => { setPerPage(pp); setPage(1); }}
              customStyles={customStyles} highlightOnHover responsive />
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Campaign Details</DialogTitle><DialogDescription>View campaign information</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{selected.campaign_name}</p></div>
              <div><p className="text-sm text-muted-foreground">Description</p><p className="font-medium">{selected.description || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Created</p><p className="font-medium">{selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '-'}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Add Campaign</DialogTitle><DialogDescription>Create a new campaign</DialogDescription></DialogHeader>{renderForm(handleCreate)}</DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent><DialogHeader><DialogTitle>Edit Campaign</DialogTitle><DialogDescription>Update campaign information</DialogDescription></DialogHeader>{renderForm(handleUpdate)}</DialogContent>
      </Dialog>
    </div>
  );
}
