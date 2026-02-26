import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadApi } from '../../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { StatusBadge } from '../../../components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Plus, Search, Users, Eye, Edit, Trash2 } from 'lucide-react';

interface Lead {
  id: number;
  series: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  mobile_no: string | null;
  company_name: string | null;
  status: { id: number; status_name: string } | null;
  source: { id: number; name: string } | null;
  request_type: { id: number; name: string } | null;
  industry: { id: number; name: string } | null;
  territory: string | null;
  created_at: string;
}

export default function LeadsList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async (currentPage: number = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page: currentPage, per_page: perPage, search };
      const response = await leadApi.list(params);
      const { data, pagination } = response;
      if (Array.isArray(data)) {
        setLeads(data);
        setTotalRows(pagination?.total_items ?? 0);
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

  const handleAddClick = () => { navigate('/crm/leads/create'); };

  const handleView = (lead: Lead) => { setSelectedLead(lead); setIsViewOpen(true); };

  const handleEdit = (lead: Lead) => {
    navigate(`/crm/leads/${lead.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmDialog('Delete Lead', 'Are you sure you want to delete this lead?');
    if (!result.isConfirmed) return;
    try {
      await leadApi.delete(id);
      showAlert('success', 'Deleted!', 'Lead deleted successfully', 2000);
      fetchLeads(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to delete lead'));
    }
  };

  const columns: TableColumn<Lead>[] = [
    { name: 'series', selector: (row) => row.series, sortable: true },
    {
      name: 'Name',
      cell: (row) => <span className="font-medium">{[row.first_name, row.last_name].filter(Boolean).join(' ') || '-'}</span>,
      sortable: true,
      minWidth: '180px',
    },
    { name: 'Email', selector: (row) => row.email || '-' },
    { name: 'Company', selector: (row) => row.company_name || '-' },
    { name: 'Status', cell: (row) => <StatusBadge status={row.status?.status_name} /> },
    { name: 'Source', selector: (row) => row.source?.name || '-' },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} title="Edit">
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
      width: '140px',
    },
  ];

  const customStyles = {
    headRow: { style: { backgroundColor: '#f9fafb', borderBottomWidth: '1px', borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid' as const, minHeight: '56px' } },
    headCells: { style: { fontSize: '14px', fontWeight: '600', color: '#374151', paddingLeft: '16px', paddingRight: '16px' } },
  };

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
                <div><p className="text-sm text-muted-foreground">Series</p><p className="font-medium">{selectedLead.series || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{[selectedLead.first_name, selectedLead.last_name].filter(Boolean).join(' ')}</p></div>
                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{selectedLead.email || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Mobile</p><p className="font-medium">{selectedLead.mobile_no || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Company</p><p className="font-medium">{selectedLead.company_name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Status</p><StatusBadge status={selectedLead.status?.status_name} /></div>
                <div><p className="text-sm text-muted-foreground">Source</p><p className="font-medium">{selectedLead.source?.name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Request Type</p><p className="font-medium">{selectedLead.request_type?.name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Industry</p><p className="font-medium">{selectedLead.industry?.name || '-'}</p></div>
                <div><p className="text-sm text-muted-foreground">Territory</p><p className="font-medium">{selectedLead.territory || '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
