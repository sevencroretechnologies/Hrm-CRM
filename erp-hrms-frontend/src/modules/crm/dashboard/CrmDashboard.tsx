import { useEffect, useState } from "react";
import {
  dashboardService,
  opportunityApi,
  customerApi,
  salesTaskDetailApi
} from "../../../services/api";
import type { DashboardStats, Opportunity, SalesTaskDetail, Customer } from "../../../types";
import {
  TrendingUp,
  TrendingDown,
  CheckSquare,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, ComposedChart, Line, Bar
} from "recharts";
import "./CrmDashboard.css";


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#fff',
        padding: '6px 10px',
        border: 'none',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '11px',
        fontWeight: 600,
        color: '#495057'
      }}>
        {label ? `${label}: ` : ''}{payload[0].name}: {payload[0].value}
      </div>
    );
  }
  return null;
};

export default function CrmDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesOverviewData, setSalesOverviewData] = useState<any[]>([]);
  const [latestOpportunities, setLatestOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<SalesTaskDetail[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getStats().then(r => r.data).catch(() => null),
      dashboardService.getSalesOverview().then(r => Array.isArray(r) ? r : r.data).catch(() => []),
      opportunityApi.list({ per_page: 5, sort_by: 'created_at', sort_order: 'desc' }).then(r => Array.isArray(r) ? r : r.data).catch(() => []),
      salesTaskDetailApi.list({ per_page: 100 }).then(r => Array.isArray(r) ? r : r.data).catch(() => []),
      customerApi.list({ per_page: 1 }).then(r => r.total || 0).catch(() => 0)
    ]).then(([s, salesOvw, opps, tsks, custTotal]) => {
      setStats(s);
      setSalesOverviewData(salesOvw as any[]);
      setLatestOpportunities(opps as Opportunity[]);
      setTasks(tsks as SalesTaskDetail[]);
      setTotalCustomers(custTotal as number);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="crm-dash-wrapper">
        <div className="dashboard-header mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
        </div>

        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kpi-card p-5 h-[104px] flex flex-col justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="flex justify-between items-end">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 dash-card lg:h-[340px]">
            <div className="p-4 border-b border-gray-100"><div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div></div>
            <div className="p-4 h-[260px]"><div className="h-full w-full bg-gray-50 rounded animate-pulse"></div></div>
          </div>
          <div className="lg:col-span-1 dash-card lg:h-[340px]">
            <div className="p-4 border-b border-gray-100"><div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div></div>
            <div className="p-4 flex justify-center items-center h-[260px]"><div className="h-40 w-40 bg-gray-100 rounded-full animate-pulse"></div></div>
          </div>
        </div>

        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 dash-card min-h-[300px]">
            <div className="p-4 border-b border-gray-100"><div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div></div>
            <div className="p-4 flex flex-col gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-full bg-gray-50 rounded animate-pulse"></div>)}
            </div>
          </div>
          <div className="lg:col-span-1 dash-card min-h-[300px]">
            <div className="p-4 border-b border-gray-100"><div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div></div>
            <div className="p-4 flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-14 w-full bg-gray-50 rounded animate-pulse"></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg m-4">Failed to load dashboard data</div>;
  }

  // Calculate task metrics
  const today = new Date().toISOString().split('T')[0];
  const dueToday = tasks.filter(t => t.date === today && t.status !== 'Closed').length;
  const overdue = tasks.filter(t => t.date < today && t.status !== 'Closed').length;
  const completedTasks = tasks.filter(t => t.status === 'Closed').length;

  // KPI data
  const kpis = [
    {
      label: "Total Leads",
      value: stats.leads?.total?.toString() || "0",
      changeLabel: `+${stats.leads?.new_last_30_days || 0} new`,
      positive: true,
    },
    {
      label: "Opportunities",
      value: stats.opportunities?.total?.toString() || "0",
      changeLabel: `${stats.opportunities?.open || 0} open`,
      positive: true,
    },
    {
      label: "Customers",
      value: totalCustomers.toString(),
      changeLabel: "Total",
      positive: true,
    },
    {
      label: "Total Revenue",
      value: `₹${(stats.opportunities?.total_value || 0).toLocaleString()}`,
      changeLabel: "Expected",
      positive: true,
    },
  ];

  // Opportunities by Status data
  const statusColors: Record<string, string> = {
    "Open": "#556ee6",
    "Converted": "#f1b44c",
    "Lost": "#34c38f",
    "Closed": "#74788d",
    "Qualified": "#50a5f1",
    "Proposal": "#f46a6a"
  };

  const opportunitiesStatusData = (stats.opportunities?.by_status || []).map(s => {
    const s_any = s as any;
    const statusName = s_any.status?.status_name || s_any.status || "Unknown";
    return {
      name: statusName,
      count: s.count,
      color: statusColors[statusName] || "#74788d"
    };
  });

  // Fallback if no status data
  if (opportunitiesStatusData.length === 0) {
    opportunitiesStatusData.push({ name: "No Data", count: 1, color: "#e9ecef" });
  }

  return (
    <div className="crm-dash-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome !</h2>
          <p className="text-gray-500 text-sm mt-1">Overview of your CRM activity</p>
        </div>
        <div className="dashboard-breadcrumb">
          <span>Dashboard</span> &rsaquo; Welcome !
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card flex flex-col justify-between p-5">
            <div className="kpi-label text-gray-500 text-sm mb-3 font-medium">{kpi.label}</div>
            <div className="flex items-baseline gap-4">
              <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${kpi.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {kpi.changeLabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Chart + Territory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-2">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Sales Overview</h5>
            </div>
            <div className="dash-card-body">
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={salesOverviewData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74788d', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74788d', fontSize: 12 }}
                      tickFormatter={(val) => `₹${val / 1000}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={false}
                    />
                    <Tooltip cursor={{ fill: '#f8f9fa' }} content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="rect" align="left" wrapperStyle={{ left: 0, top: -10 }} />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      name="Revenue"
                      fill="#556ee6"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="deals"
                      name="Deals"
                      stroke="#34c38f"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#fff', stroke: '#34c38f', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>


        {/* Opportunities by Status */}
        <div className="lg:col-span-1">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Opportunities by Status</h5>
            </div>
            <div className="dash-card-body" style={{ height: 280, position: 'relative' }}>
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={opportunitiesStatusData}
                      dataKey="count"
                      nameKey="name"
                      cx="40%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {opportunitiesStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ right: 20 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '40%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#495057' }}>{stats.opportunities?.total || 0}</div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Latest Opportunities + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Opportunities Table */}
        <div className="lg:col-span-2">
          <div className="dash-card">
            <div className="dash-card-header !pb-4">
              <h5>Latest Opportunities</h5>
              <div className="text-blue-500 hover:text-blue-600 font-medium cursor-pointer text-sm">
                View All &rsaquo;
              </div>
            </div>
            <div className="dash-card-body p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Party Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Close</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOpportunities.length > 0 ? latestOpportunities.map((row, i) => {
                      let color = "text-slate-600 bg-slate-100";
                      const status = row.status?.status_name || 'Open';
                      if (status === 'Open') color = "text-amber-600 bg-amber-50";
                      if (status === 'Converted' || status === 'Won') color = "text-emerald-700 bg-emerald-50";
                      if (status === 'Lost') color = "text-rose-600 bg-rose-50";

                      let partyName = row.party_name || row.company_name;
                      if (!partyName) {
                        partyName = row.customer ? (row.customer as any).company_name :
                          row.lead ? ((row.lead as any).company_name || `${(row.lead as any).first_name || ''} ${(row.lead as any).last_name || ''}`.trim()) :
                            'Unknown';
                      }

                      return (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{partyName}</td>
                          <td className="px-5 py-3.5 text-sm">
                            <span className={`px-2.5 py-1 rounded text-xs font-semibold tracking-wide ${color}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">₹{(row.opportunity_amount || 0).toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">{row.expected_closing || 'N/A'}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">No recent opportunities found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="dash-card">
            <div className="dash-card-header !pb-4">
              <h5>Tasks Overview</h5>
            </div>
            <div className="dash-card-body">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-500">
                      <CheckSquare size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Tasks Due Today</span>
                  </div>
                  <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded text-sm min-w-[28px] text-center">{dueToday}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-500">
                      <AlertCircle size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Overdue Tasks</span>
                  </div>
                  <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded text-sm min-w-[28px] text-center">{overdue}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <ClipboardList size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Completed Tasks</span>
                  </div>
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-sm min-w-[28px] text-center">{completedTasks}</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
