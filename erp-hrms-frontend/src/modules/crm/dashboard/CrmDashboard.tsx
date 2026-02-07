import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { crmLeadService, crmOpportunityService, crmAppointmentService, crmContractService } from '../../../services/api';
import { Users, Target, CalendarClock, FileText } from 'lucide-react';

interface CrmStats {
  leads: number;
  opportunities: number;
  appointments: number;
  contracts: number;
}

export default function CrmDashboard() {
  const [stats, setStats] = useState<CrmStats>({ leads: 0, opportunities: 0, appointments: 0, contracts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [leadsRes, oppsRes, apptsRes, contractsRes] = await Promise.all([
          crmLeadService.getAll({ per_page: 1 }),
          crmOpportunityService.getAll({ per_page: 1 }),
          crmAppointmentService.getAll({ per_page: 1 }),
          crmContractService.getAll({ per_page: 1 }),
        ]);
        setStats({
          leads: leadsRes.data?.meta?.total ?? leadsRes.data?.data?.length ?? 0,
          opportunities: oppsRes.data?.meta?.total ?? oppsRes.data?.data?.length ?? 0,
          appointments: apptsRes.data?.meta?.total ?? apptsRes.data?.data?.length ?? 0,
          contracts: contractsRes.data?.meta?.total ?? contractsRes.data?.data?.length ?? 0,
        });
      } catch (error) {
        console.error('Failed to fetch CRM stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const kpis = [
    { label: 'Total Leads', value: stats.leads, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Opportunities', value: stats.opportunities, icon: Target, color: 'text-green-600 bg-green-50' },
    { label: 'Appointments', value: stats.appointments, icon: CalendarClock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Contracts', value: stats.contracts, icon: FileText, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CRM Dashboard</h1>
        <p className="text-muted-foreground">Overview of your CRM activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? '...' : kpi.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a href="/crm/leads" className="p-4 border rounded-lg hover:bg-muted transition-colors text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-solarized-blue" />
                <p className="text-sm font-medium">Manage Leads</p>
              </a>
              <a href="/crm/opportunities" className="p-4 border rounded-lg hover:bg-muted transition-colors text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-solarized-blue" />
                <p className="text-sm font-medium">Opportunities</p>
              </a>
              <a href="/crm/appointments" className="p-4 border rounded-lg hover:bg-muted transition-colors text-center">
                <CalendarClock className="h-8 w-8 mx-auto mb-2 text-solarized-blue" />
                <p className="text-sm font-medium">Appointments</p>
              </a>
              <a href="/crm/contracts" className="p-4 border rounded-lg hover:bg-muted transition-colors text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-solarized-blue" />
                <p className="text-sm font-medium">Contracts</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CRM Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage your customer relationships, track leads through the pipeline, and close deals faster.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Leads</span>
                <span className="font-semibold">{isLoading ? '...' : stats.leads}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Opportunities</span>
                <span className="font-semibold">{isLoading ? '...' : stats.opportunities}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Appointments</span>
                <span className="font-semibold">{isLoading ? '...' : stats.appointments}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Contracts</span>
                <span className="font-semibold">{isLoading ? '...' : stats.contracts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
