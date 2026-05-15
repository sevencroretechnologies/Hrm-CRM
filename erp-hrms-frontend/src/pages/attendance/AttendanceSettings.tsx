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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attendanceSettingService } from '@/services/api';
import { showAlert, showConfirmDialog, getErrorMessage } from '@/lib/sweetalert';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AttendanceSetting {
  id: number;
  default_clock_in_time: string; // Now stores "HH:MM AM/PM"
  default_clock_out_time: string; // Now stores "HH:MM AM/PM"
  grace_minutes: number;
  arriving_late_minutes?: number;
  leaving_early_minutes?: number;
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
  
  // Manual AM/PM States for UI
  const [inTime, setInTime] = useState("09:00");
  const [inPeriod, setInPeriod] = useState("AM");
  const [outTime, setOutTime] = useState("06:00");
  const [outPeriod, setOutPeriod] = useState("PM");
  const [grace, setGrace] = useState(15);
  const [lateThreshold, setLateThreshold] = useState(240);
  const [earlyThreshold, setEarlyThreshold] = useState(120);

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

  // Parse "HH:MM AM/PM" into { time, period }
  const parseTimeString = (timeStr: string) => {
    if (!timeStr) return { time: "09:00", period: "AM" };
    // Handle old format if any (HH:MM:SS)
    if (timeStr.includes(':') && timeStr.split(':').length === 3 && !timeStr.includes(' ')) {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        const formattedH = h12 < 10 ? `0${h12}` : `${h12}`;
        return { time: `${formattedH}:${minutes}`, period };
    }
    // New format: "HH:MM AM"
    const [time, period] = timeStr.split(' ');
    return { time: time || "09:00", period: period || "AM" };
  };

  const handleEdit = (setting: AttendanceSetting) => {
    setEditingSetting(setting);
    const clockIn = parseTimeString(setting.default_clock_in_time);
    const clockOut = parseTimeString(setting.default_clock_out_time);
    
    setInTime(clockIn.time);
    setInPeriod(clockIn.period);
    setOutTime(clockOut.time);
    setOutPeriod(clockOut.period);
    setGrace(setting.grace_minutes);
    setLateThreshold(setting.arriving_late_minutes || 240);
    setEarlyThreshold(setting.leaving_early_minutes || 120);
    
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
      // Merge time and period into a single string "09:00 AM"
      const payload = {
        default_clock_in_time: `${inTime} ${inPeriod}`,
        default_clock_out_time: `${outTime} ${outPeriod}`,
        grace_minutes: grace,
        arriving_late_minutes: lateThreshold,
        leaving_early_minutes: earlyThreshold,
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
      cell: (row) => {
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-solarized-blue" />
            <span className="font-medium text-solarized-base02">{row.default_clock_in_time}</span>
          </div>
        );
      }
    },
    {
      name: "Clock-Out Time",
      selector: (row) => row.default_clock_out_time,
      sortable: true,
      cell: (row) => {
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-solarized-orange" />
            <span className="font-medium text-solarized-base02">{row.default_clock_out_time}</span>
          </div>
        );
      }
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
      name: "Half-Day Late",
      selector: (row) => row.arriving_late_minutes || 0,
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
          {row.arriving_late_minutes || 0} mins
        </span>
      )
    },
    {
      name: "Half-Day Early",
      selector: (row) => row.leaving_early_minutes || 0,
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
          {row.leaving_early_minutes || 0} mins
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
                setInTime("09:00");
                setInPeriod("AM");
                setOutTime("06:00");
                setOutPeriod("PM");
                setGrace(15);
                setLateThreshold(240);
                setEarlyThreshold(120);
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
                {/* Clock In Row */}
                <div className="space-y-2">
                  <Label className="text-solarized-base01 font-semibold uppercase tracking-wider text-[11px]">
                    Clock-In Time *
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-solarized-base01" />
                      <Input
                        type="text"
                        placeholder="HH:MM"
                        className="pl-10 border-solarized-base2 focus:border-solarized-blue transition-all"
                        value={inTime}
                        onChange={(e) => setInTime(e.target.value)}
                        required
                      />
                    </div>
                    <Select value={inPeriod} onValueChange={setInPeriod}>
                      <SelectTrigger className="w-[100px] border-solarized-base2">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clock Out Row */}
                <div className="space-y-2">
                  <Label className="text-solarized-base01 font-semibold uppercase tracking-wider text-[11px]">
                    Clock-Out Time *
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-solarized-base01" />
                      <Input
                        type="text"
                        placeholder="HH:MM"
                        className="pl-10 border-solarized-base2 focus:border-solarized-blue transition-all"
                        value={outTime}
                        onChange={(e) => setOutTime(e.target.value)}
                        required
                      />
                    </div>
                    <Select value={outPeriod} onValueChange={setOutPeriod}>
                      <SelectTrigger className="w-[100px] border-solarized-base2">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
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
                      value={grace}
                      onChange={(e) => setGrace(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="late_threshold" className="text-solarized-base01 font-semibold uppercase tracking-wider text-[11px]">
                      Half-Day Late (Min)
                    </Label>
                    <Input
                      id="late_threshold"
                      type="number"
                      className="border-solarized-base2 focus:border-solarized-blue transition-all"
                      value={lateThreshold}
                      onChange={(e) => setLateThreshold(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="early_threshold" className="text-solarized-base01 font-semibold uppercase tracking-wider text-[11px]">
                      Half-Day Early (Min)
                    </Label>
                    <Input
                      id="early_threshold"
                      type="number"
                      className="border-solarized-base2 focus:border-solarized-blue transition-all"
                      value={earlyThreshold}
                      onChange={(e) => setEarlyThreshold(parseInt(e.target.value) || 0)}
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
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-solarized-base01" />
              <Input
                placeholder="Search settings..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 border-solarized-base2"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={settings.filter(s => 
              s.default_clock_in_time.toLowerCase().includes(searchInput.toLowerCase()) || 
              s.default_clock_out_time.toLowerCase().includes(searchInput.toLowerCase())
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
