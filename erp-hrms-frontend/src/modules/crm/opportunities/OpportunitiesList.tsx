import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  crmOpportunityService,
  crmStatusService,
  crmOpportunityLostReasonService
} from '../../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../../lib/sweetalert';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '../../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Target, XCircle } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface OppStatus { id: number; status_name: string; }
interface OppStage { id: number; name: string; }
interface Opportunity {
  id: number;
  naming_series?: string;
  party_name: string | null;
  opportunity_from: string | null;
  opportunity_amount: number | null;
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
}

// ── Helper functions for data extraction ──────────────────────────────────────
function extractList<T>(raw: any): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];

  // Axios response wrapper check
  const body = raw.data || raw;
  if (Array.isArray(body)) return body as T[];

  // Laravel Paginated structure
  if (body && typeof body === 'object') {
    if (Array.isArray(body.data)) return body.data as T[];
    // Deep Laravel pagination: { message: "...", data: { data: [...] } }
    if (body.data && typeof body.data === 'object' && Array.isArray(body.data.data)) {
      return body.data.data as T[];
    }
  }
  return [];
}

function extractTotal(raw: any): number {
  if (!raw) return 0;
  const body = raw.data || raw;

  if (body && typeof body === 'object') {
    if (typeof body.total === 'number') return body.total;
    if (body.data && typeof body.data === 'object' && typeof body.data.total === 'number') {
      return body.data.total;
    }
    // Also check for the "pagination" object if present
    if (body.pagination && typeof body.pagination.total_items === 'number') {
      return body.pagination.total_items;
    }
  }
  return 0;
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

  // Lost Dialog states
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [isSubmittingLost, setIsSubmittingLost] = useState(false);

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

      const extractedList = extractList<Opportunity>(r.data);
      const extractedTotal = extractTotal(r.data);

      setItems(extractedList);
      setTotal(extractedTotal);
    } catch (err) {
      console.error("fetchData error:", err);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [perPage, search, statusFilter]);

  // Debounce search + filter (400 ms) — same as crm-frontend useCallback / useEffect
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); fetchData(1); }, 400);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [search, statusFilter, fetchData]);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

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

  const handleMarkAsLostClick = (opp: Opportunity) => {
    setSelected(opp);
    setLostReason('');
    setLostDialogOpen(true);
  };

  const handleLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!lostReason.trim()) {
      showAlert('error', 'Validation Error', 'Please enter a reason.');
      return;
    }

    setIsSubmittingLost(true);
    try {
      // 1. Find the 'Lost' status ID
      const lostStatus = statuses.find(s => s.status_name.toLowerCase() === 'lost');
      if (!lostStatus) {
        throw new Error("Could not find 'Lost' status in the system.");
      }

      // 2. Update the opportunity status to 'Lost'
      await crmOpportunityService.setMultipleStatus({
        ids: [selected.id],
        status_id: lostStatus.id
      });

      // 3. Create the lost reason record
      await crmOpportunityLostReasonService.create({
        opportunity_id: selected.id,
        opportunity_lost_reasons: lostReason,
      });

      showAlert('success', 'Success', 'Opportunity marked as lost.');
      setLostDialogOpen(false);
      fetchData(page);
    } catch (e) {
      showAlert('error', 'Error', getErrorMessage(e, 'Failed to mark as lost.'));
    } finally {
      setIsSubmittingLost(false);
    }
  };

  // ── DataTable columns — mirrors crm-frontend Table columns ────────────────────
  const columns: TableColumn<Opportunity>[] = [
    {
      name: 'Customer',
      cell: (row) => <span className="font-medium text-solarized-blue">{row.party_name || `#${row.id}`}</span>,
      minWidth: '200px',
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
      cell: (row) => row.opportunity_amount
        ? `${row.currency ?? '₹'}${Number(row.opportunity_amount).toLocaleString()}`
        : '-',
      width: '120px',
    },
    {
      name: 'Expected Close',
      selector: (row) => row.expected_closing
        ? String(row.expected_closing).split('T')[0]
        : '-',
      width: '140px',
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
            {row.status?.status_name?.toLowerCase() !== 'lost' && (
              <DropdownMenuItem onClick={() => handleMarkAsLostClick(row)}>
                <XCircle className="mr-2 h-4 w-4 text-orange-600" /> Mark as Lost
              </DropdownMenuItem>
            )}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Opportunities</h2>
          <p className="text-muted-foreground">Manage and track your sales opportunities</p>
        </div>
        <Button onClick={() => navigate('/crm/opportunities/create')} className="bg-solarized-blue hover:bg-solarized-blue/90 font-medium">
          <Plus className="h-4 w-4 mr-1" /> New Opportunity
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="w-44">
          <Select
            value={statusFilter || 'all'}
            onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-10"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.status_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-4">
          {!loading && items.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 rounded-lg border border-dashed">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-20" />
              <p className="text-muted-foreground font-medium">No opportunities found.</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search.</p>
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
            <div className="space-y-4 text-sm mt-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Customer / Party', selected.party_name],
                  ['Company', selected.company_name],
                  ['From', selected.opportunity_from],
                  ['Status', selected.status?.status_name],
                  ['Stage', selected.opportunity_stage?.name],
                  ['Amount', selected.opportunity_amount != null ? `${selected.currency ?? '₹'} ${Number(selected.opportunity_amount).toLocaleString()}` : null],
                  ['Expected Close', selected.expected_closing ? String(selected.expected_closing).split('T')[0] : null],
                  ['Probability', selected.probability != null ? `${selected.probability}%` : null],
                ].map(([label, val]) => (
                  <div key={String(label)} className="p-2 bg-muted/20 rounded">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
                    <p className="font-medium capitalize text-sm">{val || '—'}</p>
                  </div>
                ))}
              </div>
              {selected.to_discuss && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">To Discuss</p>
                  <p className="border rounded p-3 bg-muted/10 text-sm italic">{selected.to_discuss}</p>
                </div>
              )}
              <div className="border-t pt-4 grid grid-cols-3 gap-3 mt-4">
                <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Contact Person</p><p className="font-medium">{selected.contact_person || '—'}</p></div>
                <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Email</p><p className="font-medium break-all">{selected.contact_email || '—'}</p></div>
                <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Mobile</p><p className="font-medium">{selected.contact_mobile || '—'}</p></div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                <Button className="bg-solarized-blue hover:bg-solarized-blue/90" onClick={() => { setViewOpen(false); navigate(`/crm/opportunities/${selected.id}/edit`); }}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark as Lost Dialog */}
      <Dialog open={lostDialogOpen} onOpenChange={setLostDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark as Lost</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this opportunity as lost? This will record the reason in the CRM.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLostSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Opportunity</Label>
              <div className="p-3 bg-muted/50 rounded-md text-sm border font-medium text-solarized-blue">
                {selected?.party_name || selected?.naming_series || `Opp #${selected?.id}`}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lost-reason" className="text-sm font-semibold">
                Lost Reason <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lost-reason"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="e.g. Price too high, Competitor won"
                className="h-10 border-solarized-blue/20"
                required
              />
            </div>
            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setLostDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-solarized-blue hover:bg-solarized-blue/90"
                disabled={isSubmittingLost}
              >
                {isSubmittingLost ? "Processing..." : "Confirm Lost"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
