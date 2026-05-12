import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { halfDayRuleService } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface HalfDayRule {
  id: number;
  arriving_late_minutes: number;
  leaving_early_minutes: number;
  is_active: boolean;
  company_id: number | null;
  org_id: number | null;
  created_at: string;
}

const HalfDayRuleConfig: React.FC = () => {
  const [rules, setRules] = useState<HalfDayRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRule, setSelectedRule] = useState<HalfDayRule | null>(null);
  
  const [formData, setFormData] = useState<{
    arriving_late_minutes: number | string;
    leaving_early_minutes: number | string;
    is_active: boolean;
  }>({
    arriving_late_minutes: 0,
    leaving_early_minutes: 0,
    is_active: true
  });

  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await halfDayRuleService.getRules();
      setRules(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch rules',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setSelectedRule(null);
    setFormData(
      {
      arriving_late_minutes: 0,
      leaving_early_minutes: 0,
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (rule: HalfDayRule) => {
    setIsEditing(true);
    setSelectedRule(rule);
    setFormData({
      arriving_late_minutes:rule.arriving_late_minutes,
      leaving_early_minutes:rule.leaving_early_minutes,
      is_active: rule.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        arriving_late_minutes: Number(formData.arriving_late_minutes),
        leaving_early_minutes: Number(formData.leaving_early_minutes),
        company_id: user?.company_id,
        org_id: user?.org_id,
      };

      if (isEditing && selectedRule) {
        await halfDayRuleService.updateRule(selectedRule.id, payload);
        toast({ title: 'Success', description: 'Rule updated successfully' });
      } else {
        await halfDayRuleService.createRule(payload);
        toast({ title: 'Success', description: 'Rule created successfully' });
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      try {
        await halfDayRuleService.deleteRule(id);
        toast({ title: 'Success', description: 'Rule deleted' });
        fetchData();
      } catch (error) {
        toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
      }
    }
  };

  const toggleStatus = async (rule: HalfDayRule) => {
    try {
      await halfDayRuleService.updateRule(rule.id, { is_active: !rule.is_active });
      toast({ title: 'Success', description: `Rule ${!rule.is_active ? 'activated' : 'deactivated'}` });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' });
    }
  };

  // const getCompanyName = (rule: HalfDayRule) => {
  //   return user?.company_name || `Company #${rule.company_id}`;
  // };

  // const getOrgName = (rule: HalfDayRule) => {
  //   return user?.organization_name || `Org #${rule.org_id}`;
  // };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Half Day Rules</h1>
          <p className="text-muted-foreground">
            Configure thresholds for automatic half-day attendance calculation.
          </p>
        </div>
        <Button onClick={handleOpenAddDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-indigo-50/50 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Configuration List
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rules..." className="pl-8 bg-white/80" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {/* <TableHead className="pl-6">Organization / Company</TableHead> */}
                  <TableHead>Arriving Late (Min)</TableHead>
                  <TableHead>Leaving Early (Min)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No rules configured yet.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id} className="group transition-colors hover:bg-slate-50">
                    {/* <TableCell className="pl-6 py-4">
                      <div className="flex flex-col text-sm font-medium text-slate-700">
                        {getOrgName(rule)} / {getCompanyName(rule)}
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                        {rule.arriving_late_minutes} mins
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">
                        {rule.leaving_early_minutes} mins
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="cursor-pointer"
                        onClick={() => toggleStatus(rule)}
                      >
                        {rule.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 border-slate-200">
                            <XCircle className="mr-1 h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rule)}
                          className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                {isEditing ? 'Edit Rule' : 'Add New Half Day Rule'}
              </DialogTitle>
              <DialogDescription>
                Set thresholds for arriving late or leaving early.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="late-min">Arriving Late (Minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="late-min"
                      type="number"
                      className="pl-10"
                      value={formData.arriving_late_minutes}
                      onChange={(e) => setFormData({ ...formData, arriving_late_minutes: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Minutes after shift start</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="early-min">Leaving Early (Minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="early-min"
                      type="number"
                      className="pl-10"
                      value={formData.leaving_early_minutes}
                      onChange={(e) => setFormData({ ...formData, leaving_early_minutes: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Minutes before shift end</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <Label className="text-base">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable this rule globally.
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
                />
              </div>

              {/* <div className="flex gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs leading-relaxed">
                  Only one active rule can exist per organization/company combination. 
                  Activating this rule will deactivate others for the same target.
                </p>
              </div> */}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {isEditing ? 'Save Changes' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HalfDayRuleConfig;
