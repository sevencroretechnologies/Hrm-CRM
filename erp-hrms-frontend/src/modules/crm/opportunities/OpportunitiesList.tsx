import { useState, useEffect, useCallback } from 'react';
import { crmOpportunityService, crmSalesStageService } from '../../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { StatusBadge } from '../../../components/ui/status-badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Target } from 'lucide-react';

const STATUS_OPTIONS = ['Open', 'Quotation', 'Converted', 'Lost', 'Replied', 'Closed'];

interface SalesStage { id: number; stage_name: string; }

interface Opportunity {
  id: number;
  customer_name: string | null;
  opportunity_from: string;
  status: string;
  sales_stage_id: number | null;
  sales_stage: SalesStage | null;
  opportunity_amount: number | null;
  expected_closing: string | null;
  created_at: string;
}

export default function OpportunitiesList() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '', opportunity_from: 'Lead', status: 'Open',
    sales_stage_id: '', opportunity_amount: '', expected_closing: '',
    currency: 'USD', probability: '',
  });

  const fetchItems = useCallback(async (currentPage: number = 1) => {
    setIsLoading(true);
    try {
      const response = await crmOpportunityService.getAll({ page: currentPage, per_page: perPage, search });
      const { data, meta } = response.data;
      setItems(Array.isArray(data) ? data : []);
      setTotalRows(meta?.total ?? 0);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
      setItems([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [perPage, search]);

  const fetchStages = async () => {
    try {
      const response = await crmSalesStageService.getAll({ per_page: 100 });
      const data = response.data?.data;
      setStages(Array.isArray(data) ? data : []);
    } catch { setStages([]); }
  };

  useEffect(() => { fetchItems(page); }, [page, fetchItems]);
  useEffect(() => { fetchStages(); }, []);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };

  const resetForm = () => setFormData({
    customer_name: '', opportunity_from: 'Lead', status: 'Open',
    sales_stage_id: '', opportunity_amount: '', expected_closing: '',
    currency: 'USD', probability: '',
  });

  const handleAddClick = () => { resetForm(); setIsAddOpen(true); };

  const handleView = (item: Opportunity) => { setSelected(item); setIsViewOpen(true); };

  const handleEdit = (item: Opportunity) => {
    setSelected(item);
    setFormData({
      customer_name: item.customer_name || '', opportunity_from: item.opportunity_from || 'Lead',
      status: item.status || 'Open', sales_stage_id: item.sales_stage_id?.toString() || '',
      opportunity_amount: item.opportunity_amount?.toString() || '',
      expected_closing: item.expected_closing ? item.expected_closing.split('T')[0] : '',
      currency: 'USD', probability: '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmDialog('Delete Opportunity', 'Are you sure you want to delete this opportunity?');
    if (!result.isConfirmed) return;
    try {
      await crmOpportunityService.delete(id);
      showAlert('success', 'Deleted!', 'Opportunity deleted successfully', 2000);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to delete opportunity'));
    }
  };

  const buildPayload = () => ({
    ...formData,
    sales_stage_id: formData.sales_stage_id ? parseInt(formData.sales_stage_id) : null,
    opportunity_amount: formData.opportunity_amount ? parseFloat(formData.opportunity_amount) : null,
    probability: formData.probability ? parseInt(formData.probability) : null,
    expected_closing: formData.expected_closing || null,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await crmOpportunityService.create(buildPayload());
      showAlert('success', 'Success', 'Opportunity created successfully', 2000);
      setIsAddOpen(false);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to create opportunity'));
    } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await crmOpportunityService.update(selected.id, buildPayload());
      showAlert('success', 'Success', 'Opportunity updated successfully', 2000);
      setIsEditOpen(false);
      fetchItems(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to update opportunity'));
    } finally { setIsSubmitting(false); }
  };

  const columns: TableColumn<Opportunity>[] = [
    { name: 'Customer', cell: (row) => <span className="font-medium">{row.customer_name || '-'}</span>, minWidth: '180px' },
    { name: 'From', selector: (row) => row.opportunity_from },
    { name: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { name: 'Stage', selector: (row) => row.sales_stage?.stage_name || '-' },
    { name: 'Amount', cell: (row) => row.opportunity_amount ? `$${row.opportunity_amount.toLocaleString()}` : '-' },
    { name: 'Expected Close', selector: (row) => row.expected_closing || '-' },
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
        <div><Label>Customer Name *</Label><Input value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} required /></div>
        <div>
          <Label>From</Label>
          <Select value={formData.opportunity_from} onValueChange={(v) => setFormData({ ...formData, opportunity_from: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Prospect">Prospect</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status *</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sales Stage</Label>
          <Select value={formData.sales_stage_id} onValueChange={(v) => setFormData({ ...formData, sales_stage_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
            <SelectContent>{stages.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.stage_name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Amount</Label><Input type="number" value={formData.opportunity_amount} onChange={(e) => setFormData({ ...formData, opportunity_amount: e.target.value })} /></div>
        <div><Label>Expected Closing</Label><Input type="date" value={formData.expected_closing} onChange={(e) => setFormData({ ...formData, expected_closing: e.target.value })} /></div>
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
        <div><h1 className="text-2xl font-bold">Opportunities</h1><p className="text-muted-foreground">Manage your sales opportunities</p></div>
        <Button onClick={handleAddClick} className="bg-solarized-blue hover:bg-solarized-blue/90"><Plus className="mr-2 h-4 w-4" /> Add Opportunity</Button>
      </div>
      <Card>
        <CardHeader>
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <Input placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="submit" variant="outline"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </form>
        </CardHeader>
        <CardContent>
          {!isLoading && items.length === 0 ? (
            <div className="text-center py-12"><Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p>No opportunities found</p></div>
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
          <DialogHeader><DialogTitle>Opportunity Details</DialogTitle><DialogDescription>View opportunity information</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-sm text-muted-foreground">Customer</p><p className="font-medium">{selected.customer_name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">From</p><p className="font-medium">{selected.opportunity_from}</p></div>
                <div><p className="text-sm text-muted-foreground">Status</p><StatusBadge status={selected.status} /></div>
                <div><p className="text-sm text-muted-foreground">Stage</p><p className="font-medium">{selected.sales_stage?.stage_name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Amount</p><p className="font-medium">{selected.opportunity_amount ? `$${selected.opportunity_amount.toLocaleString()}` : '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Expected Close</p><p className="font-medium">{selected.expected_closing || '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add Opportunity</DialogTitle><DialogDescription>Create a new opportunity</DialogDescription></DialogHeader>
          {renderForm(handleCreate)}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Opportunity</DialogTitle><DialogDescription>Update opportunity information</DialogDescription></DialogHeader>
          {renderForm(handleUpdate)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
