import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  MoreHorizontal,
  Settings,
  Info,
  Save,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { attendanceSettingService } from '@/services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '@/lib/sweetalert';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AttendanceSetting {
  id: number;
  default_clock_in_time: string;
  default_clock_out_time: string;
  grace_minutes: number;
  company_id?: number | null;
  org_id?: number | null;
  created_at: string;
}

const AttendanceSettings: React.FC = () => {
  const [settings, setSettings] = useState<AttendanceSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AttendanceSetting | null>(null);
  
  const [formData, setFormData] = useState({
    default_clock_in_time: '09:00:00',
    default_clock_out_time: '18:00:00',
    grace_minutes: 15
  });

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchSettings();
  }, []);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await attendanceSettingService.getSettings();
      setSettings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showAlert('error', 'Error', 'Failed to fetch attendance settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleEdit = (setting: AttendanceSetting) => {
    setEditingSetting(setting);
    setFormData({
      default_clock_in_time: setting.default_clock_in_time,
      default_clock_out_time: setting.default_clock_out_time,
      grace_minutes: setting.grace_minutes
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmDialog(
      'Are you sure?',
      'You want to delete these attendance settings?'
    );

    if (!result.isConfirmed) return;

    try {
      await attendanceSettingService.deleteSettings(id);
      showAlert('success', 'Deleted!', 'Settings deleted successfully', 2000);
      fetchSettings();
    } catch (error: unknown) {
      console.error('Failed to delete settings:', error);
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to delete settings'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        company_id: user?.company_id,
        org_id: user?.org_id,
      };

      if (editingSetting) {
        await attendanceSettingService.updateSettings(editingSetting.id, payload);
      } else {
        await attendanceSettingService.saveSettings(payload);
      }

      showAlert('success', 'Success!', editingSetting ? 'Settings updated' : 'Settings created', 2000);
      setIsDialogOpen(false);
      fetchSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to save settings'));
    } finally {
      setIsSaving(false);
    }
  };

  const columns: TableColumn<AttendanceSetting>[] = [
    {
      name: "Clock-In Time",
      selector: (row) => row.default_clock_in_time,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-solarized-blue" />
          <span className="font-medium text-solarized-base02">{row.default_clock_in_time}</span>
        </div>
      )
    },
    {
      name: "Clock-Out Time",
      selector: (row) => row.default_clock_out_time,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-solarized-orange" />
          <span className="font-medium text-solarized-base02">{row.default_clock_out_time}</span>
        </div>
      )
    },
    {
      name: "Grace (Min)",
      selector: (row) => row.grace_minutes,
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-1 rounded-full bg-solarized-blue/10 text-solarized-blue text-xs font-bold">
          {row.grace_minutes} mins
        </span>
      )
    },
    {
      name: "Actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.id)}
              className="text-solarized-red"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      width: "80px",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-solarized-base02">Attendance Settings</h1>
          <p className="text-solarized-base01">Manage default working hours and grace periods</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-solarized-blue hover:bg-solarized-blue/90"
              onClick={() => {
                setEditingSetting(null);
                setFormData({
                  default_clock_in_time: '09:00:00',
                  default_clock_out_time: '18:00:00',
                  grace_minutes: 15
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-solarized-blue" />
                  {editingSetting ? 'Edit Settings' : 'New Attendance Setting'}
                </DialogTitle>
                <DialogDescription>
                  Configure standard timings for employees without shifts.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clock-in" className="text-solarized-base01 font-semibold uppercase tracking-wider text-[11px]">
                      Clock-In Time *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-solarized-base01" />
                      <Input
                        id="clock-in"
                        type="time"
                        step="1"
                        className="pl-10 border-solarized-base2 focus:border-solarized-blue transition-all"
                        value={formData.default_clock_in_time}
                        onChange={(e) => setFormData({ ...formData, default_clock_in_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clock-out" className="text-solarized-base01 font-semibold uppercase tracking-wider text-[11px]">
                      Clock-Out Time *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-solarized-base01" />
                      <Input
                        id="clock-out"
                        type="time"
                        step="1"
                        className="pl-10 border-solarized-base2 focus:border-solarized-blue transition-all"
                        value={formData.default_clock_out_time}
                        onChange={(e) => setFormData({ ...formData, default_clock_out_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grace" className="text-solarized-base01 font-semibold uppercase tracking-wider text-[11px]">
                    Grace Period (Minutes)
                  </Label>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-solarized-base01" />
                    <Input
                      id="grace"
                      type="number"
                      className="pl-10 border-solarized-base2 focus:border-solarized-blue transition-all"
                      value={formData.grace_minutes}
                      onChange={(e) => setFormData({ ...formData, grace_minutes: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-solarized-blue hover:bg-solarized-blue/90"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingSetting ? 'Update' : 'Create'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Alert className="bg-solarized-blue/5 border-solarized-blue/20">
        <Info className="h-4 w-4 text-solarized-blue" />
        <AlertTitle className="text-solarized-base02 font-bold">Priority Notice</AlertTitle>
        <AlertDescription className="text-solarized-base01 text-xs">
          These timings apply to employees without assigned shifts. If a shift is found, it will take precedence.
        </AlertDescription>
      </Alert>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          {/* <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-solarized-base01" />
              <Input
                placeholder="Search settings..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 border-solarized-base2"
              />
            </div>
            <Button type="submit" variant="outline" className="border-solarized-base2 text-solarized-base01">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form> */}

          <DataTable
            columns={columns}
            data={settings.filter(s => 
              s.default_clock_in_time.includes(search) || 
              s.default_clock_out_time.includes(search)
            )}
            progressPending={isLoading}
            pagination
            highlightOnHover
            responsive
            noDataComponent={
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-solarized-base01 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-solarized-base02">No settings found</h3>
                <p className="text-solarized-base01 mt-1">Configure default timings for your organization.</p>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSettings;
