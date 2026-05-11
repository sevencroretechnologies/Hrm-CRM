import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { CalendarRange, Users } from 'lucide-react';
import { attendanceService } from '../../services/api';
import { showAlert, getErrorMessage } from '../../lib/sweetalert';

interface AssignShiftToStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface StaffMember {
  id: number;
  full_name: string;
}

interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_night_shift: boolean;
}

export function AssignShiftToStaffDialog({
  open,
  onOpenChange,
  onSuccess,
}: AssignShiftToStaffDialogProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [effectiveTo, setEffectiveTo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStaffMembers();
      // Reset form on open
      setSelectedStaff('');
      setSelectedShift('');
      setEffectiveTo('');
      
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setEffectiveFrom(today);
    }
  }, [open]);

  useEffect(() => {
    if (selectedStaff) {
      fetchShiftsForStaff(parseInt(selectedStaff));
    } else {
      setShifts([]);
      setSelectedShift('');
    }
  }, [selectedStaff]);

  const fetchStaffMembers = async () => {
    try {
      const response = await attendanceService.getStaffMembersForDropdown();
      setStaffMembers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch staff members:', error);
      showAlert('error', 'Error', 'Failed to fetch staff members');
    }
  };

  const fetchShiftsForStaff = async (staffId: number) => {
    setIsLoadingShifts(true);
    try {
      const response = await attendanceService.getShifts({ staff_member_id: staffId });
      setShifts(response.data.data || []);
      setSelectedShift(''); // Reset selected shift when staff changes
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
      showAlert('error', 'Error', 'Failed to fetch available shifts for this employee');
    } finally {
      setIsLoadingShifts(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff || !selectedShift || !effectiveFrom) {
      showAlert('warning', 'Validation Error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        staff_member_id: parseInt(selectedStaff),
        effective_from: effectiveFrom,
        effective_to: effectiveTo || undefined,
      };

      await attendanceService.assignShift(parseInt(selectedShift), payload);
      
      showAlert('success', 'Success!', 'Shift assigned successfully');
      
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setSelectedStaff('');
      setSelectedShift('');
      setEffectiveTo('');
    } catch (error) {
      console.error('Failed to assign shift:', error);
      showAlert('error', 'Error', getErrorMessage(error, 'Failed to assign shift'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    const [h, m] = time.split(':');
    const hour = Number(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Assign Shift to Staff
          </DialogTitle>
          <DialogDescription>
            Select an employee and choose an available shift.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Staff Selection */}
          <div className="space-y-2">
            <Label htmlFor="staff">Select Employee *</Label>
            <Select onValueChange={setSelectedStaff} value={selectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shift Selection */}
          <div className="space-y-2">
            <Label htmlFor="shift">Select Shift *</Label>
            <Select 
              onValueChange={setSelectedShift} 
              value={selectedShift}
              disabled={!selectedStaff || isLoadingShifts}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoadingShifts 
                    ? "Loading shifts..." 
                    : !selectedStaff 
                      ? "Select employee first" 
                      : shifts.length === 0 
                        ? "No available shifts" 
                        : "Choose a shift"
                } />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id.toString()}>
                    {shift.name} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStaff && shifts.length === 0 && !isLoadingShifts && (
              <p className="text-xs text-amber-600">
                This employee is already assigned to all active shifts.
              </p>
            )}
          </div>

          {/* Effective Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Effective From *</Label>
              <Input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Effective To (Optional)</Label>
              <Input
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                min={effectiveFrom}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || !selectedStaff || !selectedShift || !effectiveFrom}
            className="bg-solarized-blue hover:bg-solarized-blue/90"
          >
            {isLoading ? 'Assigning...' : 'Assign Shift'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
