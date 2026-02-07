import { useState, useEffect, useCallback } from 'react';
import { crmLeadService } from '../../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { StatusBadge } from '../../../components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Users } from 'lucide-react';

const STATUS_OPTIONS = ['Lead', 'Open', 'Replied', 'Opportunity', 'Quotation', 'Lost Quotation', 'Interested', 'Converted', 'Do Not Contact'];

interface Lead {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email_id: string | null;
  mobile_no: string | null;
  company_name: string | null;
  status: string;
  territory: string | null;
  industry: string | null;
  created_at: string;
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email_id: '', mobile_no: '', phone: '',
    company_name: '', job_title: '', status: 'Lead', territory: '',
    industry: '', city: '', state: '', country: '',
  });

  const fetchLeads = useCallback(async (currentPage: number = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page: currentPage, per_page: perPage, search };
      const response = await crmLeadService.getAll(params);
      const { data, meta } = response.data;
      if (Array.isArray(data)) {
        setLeads(data);
        setTotalRows(meta?.total ?? 0);
      } else {
        setLeads([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setLeads([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [perPage, search]);

  useEffect(() => { fetchLeads(page); }, [page, fetchLeads]);

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePerRowsChange = (newPerPage: number) => { setPerPage(newPerPage); setPage(1); };

  const resetForm = () => setFormData({
    first_name: '', last_name: '', email_id: '', mobile_no: '', phone: '',
    company_name: '', job_title: '', status: 'Lead', territory: '',
    industry: '', city: '', state: '', country: '',
  });

  const handleAddClick = () => { resetForm(); setIsAddOpen(true); };

  const handleView = (lead: Lead) => { setSelectedLead(lead); setIsViewOpen(true); };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      first_name: lead.first_name || '', last_name: lead.last_name || '',
      email_id: lead.email_id || '', mobile_no: lead.mobile_no || '',
      phone: '', company_name: lead.company_name || '', job_title: '',
      status: lead.status || 'Lead', territory: lead.territory || '',
      industry: lead.industry || '', city: '', state: '', country: '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmDialog('Delete Lead', 'Are you sure you want to delete this lead?');
    if (!result.isConfirmed) return;
    try {
      await crmLeadService.delete(id);
      showAlert('success', 'Deleted!', 'Lead deleted successfully', 2000);
      fetchLeads(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to delete lead'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await crmLeadService.create(formData);
      showAlert('success', 'Success', 'Lead created successfully', 2000);
      setIsAddOpen(false);
      fetchLeads(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to create lead'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);
    try {
      await crmLeadService.update(selectedLead.id, formData);
      showAlert('success', 'Success', 'Lead updated successfully', 2000);
      setIsEditOpen(false);
      fetchLeads(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to update lead'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: TableColumn<Lead>[] = [
    {
      name: 'Name',
      cell: (row) => <span className="font-medium">{[row.first_name, row.last_name].filter(Boolean).join(' ') || '-'}</span>,
      sortable: true,
      minWidth: '180px',
    },
    { name: 'Email', selector: (row) => row.email_id || '-' },
    { name: 'Company', selector: (row) => row.company_name || '-' },
    { name: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { name: 'Territory', selector: (row) => row.territory || '-' },
    {
      name: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
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
        <div><Label>First Name *</Label><Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required /></div>
        <div><Label>Last Name</Label><Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Email</Label><Input type="email" value={formData.email_id} onChange={(e) => setFormData({ ...formData, email_id: e.target.value })} /></div>
        <div><Label>Mobile</Label><Input value={formData.mobile_no} onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Company</Label><Input value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} /></div>
        <div>
          <Label>Status *</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Territory</Label><Input value={formData.territory} onChange={(e) => setFormData({ ...formData, territory: e.target.value })} /></div>
        <div><Label>Industry</Label><Input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} /></div>
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
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage your CRM leads</p>
        </div>
        <Button onClick={handleAddClick} className="bg-solarized-blue hover:bg-solarized-blue/90">
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="submit" variant="outline"><Search className="mr-2 h-4 w-4" /> Search</Button>
          </form>
        </CardHeader>
        <CardContent>
          {!isLoading && leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p>No leads found</p>
            </div>
          ) : (
            <DataTable columns={columns} data={leads} progressPending={isLoading} pagination paginationServer
              paginationTotalRows={totalRows} paginationPerPage={perPage} paginationDefaultPage={page}
              onChangePage={handlePageChange} onChangeRowsPerPage={handlePerRowsChange}
              customStyles={customStyles} highlightOnHover responsive />
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lead Details</DialogTitle><DialogDescription>View lead information</DialogDescription></DialogHeader>
          {selectedLead && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{[selectedLead.first_name, selectedLead.last_name].filter(Boolean).join(' ')}</p></div>
                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{selectedLead.email_id || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Mobile</p><p className="font-medium">{selectedLead.mobile_no || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Company</p><p className="font-medium">{selectedLead.company_name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Status</p><StatusBadge status={selectedLead.status} /></div>
                <div><p className="text-sm text-muted-foreground">Territory</p><p className="font-medium">{selectedLead.territory || '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add Lead</DialogTitle><DialogDescription>Create a new CRM lead</DialogDescription></DialogHeader>
          {renderForm(handleCreate)}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Lead</DialogTitle><DialogDescription>Update lead information</DialogDescription></DialogHeader>
          {renderForm(handleUpdate)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
