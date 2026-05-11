import { useState, useEffect, useMemo, useRef } from 'react';
import { settingsService } from '../../services/api';
import { showAlert } from '../../lib/sweetalert';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Calendar, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';

interface WorkingDayConfig {
  id?: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  from_date?: string;
  to_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaginationMeta {
  current_page: number;
  total_pages: number;
  per_page: number;
  total: number;
}

export default function WorkingDays() {
  const [configs, setConfigs] = useState<WorkingDayConfig[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<WorkingDayConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<WorkingDayConfig | null>(null);

  // Form state
  const [formData, setFormData] = useState<WorkingDayConfig>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    from_date: '',
    to_date: '',
  });

  useEffect(() => {
    fetchConfigs();
  }, [page, perPage]);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await settingsService.getWorkingDays({ page, per_page: perPage });
      setConfigs(response.data.data || []);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch working days:', error);
      showAlert('error', 'Error', 'Failed to fetch working days configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setFormData({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      from_date: '',
      to_date: '',
    });
    setEditingConfig(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (config: WorkingDayConfig) => {
    setFormData({ ...config });
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate at least one working day is selected
    const hasWorkingDay = Object.keys(formData)
      .filter(key => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key))
      .some(key => formData[key as keyof WorkingDayConfig]);

    if (!hasWorkingDay) {
      showAlert('warning', 'Validation Error', 'Please select at least one working day');
      return;
    }

    // Validate date range if both dates are provided
    if (formData.from_date && formData.to_date && formData.from_date > formData.to_date) {
      showAlert('warning', 'Validation Error', 'From date must be before or equal to To date');
      return;
    }

    setIsSaving(true);
    try {
      if (editingConfig?.id) {
        await settingsService.updateWorkingDay(editingConfig.id, formData as any);
        showAlert('success', 'Success', 'Working days configuration updated successfully');
      } else {
        await settingsService.createWorkingDay(formData);
        showAlert('success', 'Success', 'Working days configuration created successfully');
      }
      setIsDialogOpen(false);
      fetchConfigs();
    } catch (error: any) {
      console.error('Failed to save working days:', error);
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to save working days configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingConfig?.id) return;

    try {
      await settingsService.deleteWorkingDay(deletingConfig.id);
      showAlert('success', 'Success', 'Working days configuration deleted successfully');
      setDeletingConfig(null);
      fetchConfigs();
    } catch (error: any) {
      console.error('Failed to delete working days:', error);
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to delete working days configuration');
    }
  };

  const getWorkingDaysCount = (config: WorkingDayConfig) => {
    return Object.keys(config)
      .filter(key => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key))
      .filter(key => config[key as keyof WorkingDayConfig])
      .length;
  };

  const getWorkingDaysList = (config: WorkingDayConfig) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days
      .filter(day => config[day as keyof WorkingDayConfig])
      .map(day => day.charAt(0).toUpperCase() + day.slice(1))
      .join(', ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const EXPIRY_WARNING_DAYS = 7;

  const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const daysUntil = (dateString?: string): number | null => {
    if (!dateString) return null;
    const target = new Date(dateString);
    if (isNaN(target.getTime())) return null;
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - startOfToday().getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  type ExpiryStatus = 'expired' | 'expiring' | 'active' | 'scheduled';
  const getExpiryStatus = (config: WorkingDayConfig): { status: ExpiryStatus; daysLeft: number | null } => {
    const daysFromStart = daysUntil(config.from_date);
    const daysLeft = daysUntil(config.to_date);

    // Future-dated config
    if (daysFromStart !== null && daysFromStart > 0) {
      return { status: 'scheduled', daysLeft };
    }
    // No end date or end date in the future
    if (daysLeft === null) return { status: 'active', daysLeft: null };
    if (daysLeft < 0) return { status: 'expired', daysLeft };
    if (daysLeft <= EXPIRY_WARNING_DAYS) return { status: 'expiring', daysLeft };
    return { status: 'active', daysLeft };
  };

  // A config is "covering today" if today is between from_date and to_date inclusive
  // (or either bound is missing). This is what determines whether payroll has a rule today.
  const coversToday = (config: WorkingDayConfig): boolean => {
    const today = startOfToday();
    if (config.from_date) {
      const from = new Date(config.from_date);
      if (isNaN(from.getTime())) return false;
      from.setHours(0, 0, 0, 0);
      if (from > today) return false;
    }
    if (config.to_date) {
      const to = new Date(config.to_date);
      if (isNaN(to.getTime())) return false;
      to.setHours(0, 0, 0, 0);
      if (to < today) return false;
    }
    return true;
  };

  const activeNowConfigs = useMemo(() => configs.filter(coversToday), [configs]);

  // Among configs covering today, pick the one with the latest end date (or open-ended).
  // That's the "current" rule; we only alert based on its expiry, not historical configs.
  const currentConfig = useMemo<WorkingDayConfig | null>(() => {
    if (activeNowConfigs.length === 0) return null;
    return activeNowConfigs.reduce((latest, c) => {
      if (!latest.to_date) return latest;
      if (!c.to_date) return c;
      return new Date(c.to_date) > new Date(latest.to_date) ? c : latest;
    });
  }, [activeNowConfigs]);

  const currentDaysLeft = currentConfig ? daysUntil(currentConfig.to_date) : null;
  const noActiveConfig = !isLoading && configs.length > 0 && currentConfig === null;
  const currentExpiringSoon =
    currentConfig !== null && currentDaysLeft !== null && currentDaysLeft >= 0 && currentDaysLeft <= EXPIRY_WARNING_DAYS;
  const showAttentionBanner = noActiveConfig || currentExpiringSoon;

  // Show a one-time SweetAlert per session when attention is actually required.
  const alertedRef = useRef(false);
  useEffect(() => {
    if (isLoading || alertedRef.current || !showAttentionBanner) return;

    alertedRef.current = true;
    const message = noActiveConfig
      ? 'No working days configuration covers today. Please add a new configuration to keep payroll accurate.'
      : `The current working days configuration ends in ${currentDaysLeft} day${currentDaysLeft === 1 ? '' : 's'}. Please reset or extend it to avoid payroll issues.`;
    showAlert('warning', 'Working Days Need Attention', message);
  }, [isLoading, showAttentionBanner, noActiveConfig, currentDaysLeft]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-solarized-base02">Working Days Configuration</h1>
          <p className="text-solarized-base01">Manage working days for payroll calculation</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-solarized-blue hover:bg-solarized-blue/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Configuration
        </Button>
      </div>

      {showAttentionBanner && !isLoading && (
        <Alert
          variant={noActiveConfig ? 'destructive' : 'default'}
          className={
            noActiveConfig
              ? ''
              : 'border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600'
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {noActiveConfig
              ? 'No active working days configuration'
              : 'Working days configuration is ending soon'}
          </AlertTitle>
          <AlertDescription>
            {noActiveConfig ? (
              <span>No configuration covers today. Please add a new configuration to keep payroll accurate.</span>
            ) : (
              <span>
                The current configuration ends in {currentDaysLeft} day{currentDaysLeft === 1 ? '' : 's'}. Please reset or extend it to avoid payroll issues.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-solarized-base01 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-solarized-base02">No working days configurations found</h3>
              <p className="text-solarized-base01 mt-1">Create your first working days configuration</p>
            </div>
          ) : (
            <div className="divide-y">
              {configs.map((config) => {
                const { status, daysLeft } = getExpiryStatus(config);
                return (
                <div key={config.id} className="p-6 hover:bg-solarized-base3/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-solarized-base02">
                          {getWorkingDaysCount(config)} Working Days
                        </h3>
                        {status === 'expired' && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-transparent">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired {daysLeft !== null ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago` : ''}
                          </Badge>
                        )}
                        {status === 'expiring' && (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Ends in {daysLeft} day{daysLeft === 1 ? '' : 's'}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-solarized-base01">Working Days: </span>
                          <span className="font-medium text-solarized-base02">{getWorkingDaysList(config)}</span>
                        </div>
                        <div>
                          <span className="text-solarized-base01">Valid From: </span>
                          <span className="font-medium text-solarized-base02">{formatDate(config.from_date || '')}</span>
                        </div>
                        <div>
                          <span className="text-solarized-base01">Valid To: </span>
                          <span className="font-medium text-solarized-base02">{formatDate(config.to_date || '')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                          <Badge
                            key={day}
                            variant={config[day] ? 'default' : 'outline'}
                            className={config[day] ? 'bg-solarized-green text-white' : 'text-solarized-base01'}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(config)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingConfig(config)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-solarized-base01">
            Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
            {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-solarized-base01 px-3 py-1 bg-solarized-base3 rounded">
              Page {meta.current_page} of {meta.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === meta.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit Working Days Configuration' : 'Create Working Days Configuration'}
            </DialogTitle>
            <DialogDescription>
              Configure which days of the week are considered working days for payroll calculation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Working Days Checkboxes */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Working Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <Checkbox
                      id={day}
                      checked={formData[day]}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, [day]: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor={day}
                      className="text-sm cursor-pointer text-center"
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_date">Valid From (Optional)</Label>
                <Input
                  id="from_date"
                  type="date"
                  value={formData.from_date}
                  onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_date">Valid To (Optional)</Label>
                <Input
                  id="to_date"
                  type="date"
                  value={formData.to_date}
                  onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                  min={formData.from_date}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="bg-solarized-base3/30 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">Preview</div>
              <div className="flex flex-wrap gap-2">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                  <Badge
                    key={day}
                    variant={formData[day] ? 'default' : 'outline'}
                    className={formData[day] ? 'bg-solarized-green text-white' : 'text-solarized-base01'}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 text-sm text-solarized-base01">
                Total: <span className="font-semibold text-solarized-base02">{getWorkingDaysCount(formData)} working days/week</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-solarized-blue hover:bg-solarized-blue/90"
            >
              {isSaving ? 'Saving...' : editingConfig ? 'Update Configuration' : 'Create Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingConfig} onOpenChange={() => setDeletingConfig(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Working Days Configuration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this working days configuration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deletingConfig && (
            <div className="py-4">
              <div className="text-sm text-solarized-base01 mb-2">Configuration to be deleted:</div>
              <div className="bg-solarized-base3/30 p-3 rounded">
                <div className="font-medium">{getWorkingDaysList(deletingConfig)}</div>
                <div className="text-sm text-solarized-base01 mt-1">
                  Valid: {formatDate(deletingConfig.from_date || '')} - {formatDate(deletingConfig.to_date || '')}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingConfig(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
            >
              Delete Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
