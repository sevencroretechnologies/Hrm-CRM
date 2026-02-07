import { useState, useEffect, useCallback } from 'react';
import { crmProspectService } from '../../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Building2 } from 'lucide-react';

interface Prospect {
  id: number;
  company_name: string;
  industry: string | null;
  territory: string | null;
  no_of_employees: string | null;
  annual_revenue: number | null;
  website: string | null;
  created_at: string;
}

export default function ProspectsList() {
  const [items, setItems] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '', industry: '', territory: '', no_of_employees: '',
    annual_revenue: '', website: '',
  });

  const fetchItems = useCallback(async (currentPage: number = 1) => {
    setIsLoading(true);
    try {
      const response = await crmProspectService.getAll({ page: currentPage, per_page: perPage, search });
      const { data, meta } = response.data;
      setItems(Array.isArray(data) ? data : []);
      setTotalRows(meta?.total ?? 0);
    } catch (error) {
      console.error('Failed to fetch prospects:', error);
      setItems([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [perPage, search]);

  useEffect(() => { fetchItems(page); }, [page, fetchItems]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };

  const resetForm = () => setFormData({
    company_name: '', industry: '', territory: '', no_of_employees: '',
    annual_revenue: '', website: '',
  });

  const handleAddClick = () => { resetForm(); setIsAddOpen(true); };
  const handleView = (item: Prospect) => { setSelected(item); setIsViewOpen(true); };

  const handleEdit = (item: Prospect) => {
    setSelected(item);
    setFormData({
      company_name: item.company_name || '', industry: item.industry || '',
      territory: item.territory || '', no_of_employees: item.no_of_employees || '',
      annual_revenue: item.annual_revenue?.toString() || '', website: item.website || '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmDialog('Delete Prospect', 'Are you sure you want to delete this prospect?');
    if (!result.isConfirmed) return;
    try {
      await crmProspectService.delete(id);
      showAlert('success', 'Deleted!', 'Prospect deleted successfully', 2000);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to delete prospect'));
    }
  };

  const buildPayload = () => ({
    ...formData,
    annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await crmProspectService.create(buildPayload());
      showAlert('success', 'Success', 'Prospect created successfully', 2000);
      setIsAddOpen(false);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to create prospect'));
    } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await crmProspectService.update(selected.id, buildPayload());
      showAlert('success', 'Success', 'Prospect updated successfully', 2000);
      setIsEditOpen(false);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to update prospect'));
    } finally { setIsSubmitting(false); }
  };

  const columns: TableColumn<Prospect>[] = [
    { name: 'Company', cell: (row) => <span className="font-medium">{row.company_name}</span>, minWidth: '200px' },
    { name: 'Industry', selector: (row) => row.industry || '-' },
    { name: 'Territory', selector: (row) => row.territory || '-' },
    { name: 'Employees', selector: (row) => row.no_of_employees || '-' },
    { name: 'Revenue', cell: (row) => row.annual_revenue ? `$${row.annual_revenue.toLocaleString()}` : '-' },
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
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Company Name *</Label><Input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required /></div>
        <div><Label>Industry</Label><Input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Territory</Label><Input value={formData.territory} onChange={(e) => setFormData({ ...formData, territory: e.target.value })} /></div>
        <div><Label>No. of Employees</Label><Input value={formData.no_of_employees} onChange={(e) => setFormData({ ...formData, no_of_employees: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Annual Revenue</Label><Input type="number" value={formData.annual_revenue} onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })} /></div>
        <div><Label>Website</Label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} /></div>
      </div>
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
        <div><h1 className="text-2xl font-bold">Prospects</h1><p className="text-muted-foreground">Manage your CRM prospects</p></div>
        <Button onClick={handleAddClick} className="bg-solarized-blue hover:bg-solarized-blue/90"><Plus className="mr-2 h-4 w-4" /> Add Prospect</Button>
      </div>
      <Card>
        <CardHeader>
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <Input placeholder="Search prospects..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="submit" variant="outline"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </form>
        </CardHeader>
        <CardContent>
          {!isLoading && items.length === 0 ? (
            <div className="text-center py-12"><Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p>No prospects found</p></div>
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
          <DialogHeader><DialogTitle>Prospect Details</DialogTitle><DialogDescription>View prospect information</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-sm text-muted-foreground">Company</p><p className="font-medium">{selected.company_name}</p></div>
                <div><p className="text-sm text-muted-foreground">Industry</p><p className="font-medium">{selected.industry || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Territory</p><p className="font-medium">{selected.territory || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Employees</p><p className="font-medium">{selected.no_of_employees || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Revenue</p><p className="font-medium">{selected.annual_revenue ? `$${selected.annual_revenue.toLocaleString()}` : '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Website</p><p className="font-medium">{selected.website || '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Add Prospect</DialogTitle><DialogDescription>Create a new prospect</DialogDescription></DialogHeader>{renderForm(handleCreate)}</DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Prospect</DialogTitle><DialogDescription>Update prospect information</DialogDescription></DialogHeader>{renderForm(handleUpdate)}</DialogContent>
      </Dialog>
    </div>
  );
}
