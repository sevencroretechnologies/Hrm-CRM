import { useEffect, useState } from "react";
import { dashboardApi } from "@/services/crmService";
import type { DashboardStats } from "@/types";
import { Users, Target, CalendarClock, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CrmDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading dashboard...</div>;
  if (!stats) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">Failed to load dashboard</div>;

  const kpis = [
    { label: "Total Leads", value: stats.leads.total, sub: `${stats.leads.new_last_30_days} new (30d)`, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Open Opportunities", value: stats.opportunities.open, sub: `$${(stats.opportunities.total_value / 1000).toFixed(0)}k value`, icon: Target, color: "bg-green-50 text-green-600" },
    { label: "Upcoming Appointments", value: stats.appointments.upcoming, sub: `${stats.appointments.total} total`, icon: CalendarClock, color: "bg-amber-50 text-amber-600" },
    { label: "Active Contracts", value: stats.contracts.active, sub: `${stats.contracts.unsigned} unsigned`, icon: FileText, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">CRM Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-xs text-gray-400">{kpi.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold mb-4">Leads by Status</h3>
          {stats.leads.by_status.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.leads.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }: { status: string; count: number }) => `${status} (${count})`}>
                  {stats.leads.by_status.map((_: { status: string; count: number }, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No lead data yet</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold mb-4">Opportunity Pipeline</h3>
          {stats.opportunities.by_stage.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.opportunities.by_stage}>
                <XAxis dataKey="stage_name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No pipeline data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
