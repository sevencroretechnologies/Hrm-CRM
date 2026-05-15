import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { staffService } from '../../services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '../../lib/sweetalert';

import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StatusBadge } from '../../components/ui/status-badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';

import DataTable, { TableColumn } from 'react-data-table-component';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  FileDown,
} from 'lucide-react';

interface StaffMember {
  id: number;
  full_name: string;
  personal_email: string;
  work_email: string;
  mobile_number: string;
  job_title: { title: string } | null;
  division: { title: string } | null;
  office_location: { title: string } | null;
  employment_status: string;
  employment_type: string;
  hire_date: string;
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  intern: 'Intern',
};

const formatEmploymentType = (value?: string | null): string => {
  if (!value) return '-';
  return (
    EMPLOYMENT_TYPE_LABELS[value] ??
    value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );
};

export default function StaffList() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');




  // ================= FETCH STAFF =================
  const fetchStaff = useCallback(
    async (currentPage: number = 1) => {
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = {
          page: currentPage,
          per_page: perPage,
          search: activeSearch,
        };

        if (sortField) {
          params.order_by = sortField;
          params.order = sortDirection;
        }

        const response = await staffService.getAll(params);

        const { data, meta } = response.data;

        if (Array.isArray(data)) {
          setStaff(data);
          setTotalRows(meta?.total ?? 0);
        } else {
          setStaff([]);
          setTotalRows(0);
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error);
        showAlert('error', 'Error', getErrorMessage(error, 'Failed to fetch staff'));
        setStaff([]);
        setTotalRows(0);
      } finally {
        setIsLoading(false);
      }
    },
    [perPage, activeSearch, sortField, sortDirection]
  );

  useEffect(() => {
    fetchStaff(page);
  }, [page, fetchStaff]);

  // ================= SEARCH =================
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
    setPage(1);
  };

  // ================= PAGINATION =================
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page when changing rows per page
  };

  // ================= SORTING =================
  const handleSort = (column: any, sortDirection: 'asc' | 'desc') => {
    // Map column names to API field names
    const fieldMap: Record<string, string> = {
      'Employee': 'full_name',
    };

    const field = fieldMap[column.name] || column.name;
    setSortField(field);
    setSortDirection(sortDirection);
    setPage(1); // Reset to first page when sorting
  };

  // ================= EXPORT EXCEL =================
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch ALL staff records regardless of current pagination
      const response = await staffService.getAll({ per_page: 9999, page: 1 });
      const allStaff: StaffMember[] = response.data.data || [];

      const rows = allStaff.map((member, index) => ({
        'S.No': index + 1,
        'Full Name': member.full_name,

        'Email': member.personal_email || '-',
        'Phone Number': member.mobile_number || '-',
        'Job Title': member.job_title?.title || '-',
        'Department': member.division?.title || '-',
        'Office Location': member.office_location?.title || '-',
        'Employment Type': formatEmploymentType(member.employment_type),
        'Employment Status': member.employment_status || '-',
        'Hire Date': member.hire_date || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Auto-fit column widths
      const colWidths = Object.keys(rows[0] || {}).map((key) => ({
        wch: Math.max(key.length + 2, 20),
      }));
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Members');

      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `Staff_Members_${today}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
      showAlert('error', 'Export Failed', 'Could not export staff data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const result = await showConfirmDialog(
      'Are you sure?',
      'You want to delete this staff member?'
    );

    if (!result.isConfirmed) return;

    try {
      await staffService.delete(id);
      showAlert('success', 'Deleted!', 'Staff member deleted successfully', 2000);
      fetchStaff(page);
    } catch (error) {
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to delete staff'));
    }
  };

  // ================= HELPERS ============


  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  // ================= TABLE COLUMNS ====
  const columns: TableColumn<StaffMember>[] = [
    {
      name: 'Employee',
      selector: (row) => row.full_name,
      cell: (row) => (
        <div className="flex items-center gap-3 py-2">
          <Avatar>
            <AvatarFallback className="bg-solarized-blue/10 text-solarized-blue">
              {getInitials(row.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {row.work_email || row.personal_email || '-'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      minWidth: '250px',
    },
    {
      name: 'Job Title',
      selector: (row) => row.job_title?.title || '-',
    },
    {
      name: 'Department',
      selector: (row) => row.division?.title || '-',
    },
    {
      name: 'Location',
      selector: (row) => row.office_location?.title || '-',
    },
    {
      name: 'Employment Type',
      selector: (row) => row.employment_type || '',
      cell: (row) => <span>{formatEmploymentType(row.employment_type)}</span>,
    },
    {
      name: 'Status',
      cell: (row) => (
        <StatusBadge status={row.employment_status} />
      ),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/staff/${row.id}`}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/staff/${row.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      width: '80px',
    },
  ];

  // ================= CUSTOM STYLES =================
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb', // gray-50 (very soft)
        borderBottomWidth: '1px',
        borderBottomColor: '#e5e7eb',
        borderBottomStyle: 'solid' as const,
        minHeight: '56px',
      },
    },

    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
  };

  // ================= UI =================
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff Members</h1>
          <p className="text-muted-foreground">Manage your organization employees</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExporting || totalRows === 0}
            className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export Excel
              </>
            )}
          </Button>
          <Link to="/staff/create">
            <Button className="bg-solarized-blue hover:bg-solarized-blue/90">
              <Plus className="mr-2 h-4 w-4" /> Add Staff
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="outline">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>


        </CardHeader>

        <CardContent>
          {!isLoading && staff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p>No staff members found</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={staff}
              progressPending={isLoading}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationPerPage={perPage}
              paginationDefaultPage={page}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSort={handleSort}
              customStyles={customStyles}
              sortServer
              highlightOnHover
              responsive
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
