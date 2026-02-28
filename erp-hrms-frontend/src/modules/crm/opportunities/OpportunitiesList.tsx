import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmOpportunityService, crmStatusService } from '../../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Target } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface OppStatus { id: number; status_name: string; }
interface OppStage { id: number; name: string; }
interface Opportunity {
  id: number;
  naming_series?: string;
  party_name: string | null;
  opportunity_from: string | null;
  amount: number | null;
  expected_closing: string | null;
  probability: number | null;
  currency: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_mobile: string | null;
  company_name: string | null;
  to_discuss: string | null;
  status_id: number | null;
  status: OppStatus | null;
  opportunity_stage_id: number | null;
  opportunity_stage: OppStage | null;
  created_at: string;
  items?: { amount: string | number }[];
}

// ── Status badge — same colour logic as crm-frontend statusVariant ─────────────
const statusBadge = (name = '') => {
  const n = name.toLowerCase();
  let cls = 'bg-blue-100 text-blue-800';
  if (n === 'converted') cls = 'bg-green-100 text-green-800';
  else if (n === 'lost') cls = 'bg-red-100 text-red-800';
  else if (n === 'open') cls = 'bg-yellow-100 text-yellow-800';
  else if (n === 'closed') cls = 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{name}</span>;
};

// ── Safely extract array from paginated or flat API response ───────────────────
function extractList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data as T[];
    // Laravel pagination: { data: { data: [...], total: n } }
    const inner = r.data;
    if (inner && typeof inner === 'object') {
      const i = inner as Record<string, unknown>;
      if (Array.isArray(i.data)) return i.data as T[];
    }
  }
  return [];
}
function extractTotal(raw: unknown): number {
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    const inner = r.data;
    if (inner && typeof inner === 'object') {
      const i = inner as Record<string, unknown>;
      if (typeof i.total === 'number') return i.total;
    }
    if (typeof r.total === 'number') return r.total;
  }
  return 0;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function OpportunitiesList() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Opportunity[]>([]);
  const [statuses, setStatuses] = useState<OppStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // status_id
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load status dropdown once
  useEffect(() => {
    crmStatusService.getAll({ per_page: 100 })
      .then((r) => setStatuses(extractList<OppStatus>(r.data)))
      .catch(() => setStatuses([]));
  }, []);

  // Main data fetch – mirrors crm-frontend fetchData()
  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: pg, per_page: perPage };
      if (search) params.search = search;
      if (statusFilter) params.status_id = statusFilter;
      const r = await crmOpportunityService.getAll(params);
      setItems(extractList<Opportunity>(r.data));
      setTotal(extractTotal(r.data));
    } catch {
      setItems([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [perPage, search, statusFilter]);

  // Debounce search + filter (400 ms) — same as crm-frontend useCallback / useEffect
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); fetchData(1); }, 400);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [search, statusFilter]); // eslint-disable-line

  useEffect(() => { fetchData(page); }, [page]); // eslint-disable-line

  const handleDelete = async (id: number) => {
    const res = await showConfirmDialog('Delete Opportunity', 'Delete this opportunity?');
    if (!res.isConfirmed) return;
    try {
      await crmOpportunityService.delete(id);
      showAlert('success', 'Deleted!', 'Opportunity deleted.', 2000);
      fetchData(page);
    } catch (e) {
      showAlert('error', 'Error', getErrorMessage(e, 'Failed to delete.'));
    }
  };

  // ── DataTable columns — mirrors crm-frontend Table columns ────────────────────
  const columns: TableColumn<Opportunity>[] = [
    {
      name: 'Product code',
      cell: (row) => <span className="font-medium">{row.party_name || `${row.naming_series}`}</span>,
      minWidth: '180px',
    },
    {
      name: 'From',
      cell: (row) => <span className="capitalize">{row.opportunity_from || '-'}</span>,
      width: '110px',
    },
    {
      name: 'Status',
      cell: (row) => row.status?.status_name ? statusBadge(row.status.status_name) : <span className="text-muted-foreground">—</span>,
      width: '130px',
    },
    {
      name: 'Stage',
      selector: (row) => row.opportunity_stage?.name || '-',
    },
    {
      name: 'Amount',
      cell: (row) => {
        const amt = row.amount ?? (row.items?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0);
        return amt > 0
          ? `${row.currency ?? '₹'} ${Number(amt).toLocaleString()}`
          : '-';
      },
      width: '120px',
    },
    {
      name: 'Expected Close',
      selector: (row) => row.expected_closing
        ? String(row.expected_closing).split('T')[0]
        : '-',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelected(row); setViewOpen(true); }}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/crm/opportunities/${row.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '80px',
    },
  ];

  const tableStyles = {
    headRow: { style: { backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', minHeight: '52px' } },
    headCells: { style: { fontSize: '13px', fontWeight: '600', color: '#374151', padding: '0 16px' } },
  };

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header — mirrors crm-frontend */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Opportunities</h2>
        <Button onClick={() => navigate('/crm/opportunities/create')} className="bg-solarized-blue hover:bg-solarized-blue/90">
          <Plus className="h-4 w-4 mr-1" /> New Opportunity
        </Button>
      </div>

      {/* Filters row — mirrors crm-frontend flex gap-3 */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-44">
          <Select
            value={statusFilter || 'all'}
            onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.status_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="pt-4">
          {!loading && items.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No opportunities found.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={total}
              paginationPerPage={perPage}
              paginationDefaultPage={page}
              onChangePage={(p) => setPage(p)}
              onChangeRowsPerPage={(pp) => { setPerPage(pp); setPage(1); }}
              customStyles={tableStyles}
              highlightOnHover
              responsive
            />
          )}
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Opportunity Details</DialogTitle>
            <DialogDescription>{selected?.naming_series || `ID #${selected?.id}`}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Customer / Party', selected.party_name],
                  ['Company', selected.company_name],
                  ['From', selected.opportunity_from],
                  ['Status', selected.status?.status_name],
                  ['Stage', selected.opportunity_stage?.name],
                  ['Amount', (() => {
                    const amt = selected.amount ?? (selected.items?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0);
                    return amt > 0 ? `${selected.currency ?? ''} ${Number(amt).toLocaleString()}` : null;
                  })()],
                  ['Expected Close', selected.expected_closing ? String(selected.expected_closing).split('T')[0] : null],
                  ['Probability', selected.probability != null ? `${selected.probability}%` : null],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <p className="text-muted-foreground">{label}</p>
                    <p className="font-medium capitalize">{val || '—'}</p>
                  </div>
                ))}
              </div>
              {selected.to_discuss && (
                <div>
                  <p className="text-muted-foreground mb-1">To Discuss</p>
                  <p className="border rounded p-2 bg-muted/30 text-sm">{selected.to_discuss}</p>
                </div>
              )}
              <div className="border-t pt-3 grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Contact Person</p><p className="font-medium">{selected.contact_person || '—'}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selected.contact_email || '—'}</p></div>
                <div><p className="text-muted-foreground">Mobile</p><p className="font-medium">{selected.contact_mobile || '—'}</p></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                <Button className="bg-solarized-blue hover:bg-solarized-blue/90" onClick={() => { setViewOpen(false); navigate(`/crm/opportunities/${selected.id}/edit`); }}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
