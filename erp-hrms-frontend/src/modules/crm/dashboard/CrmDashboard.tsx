import { useEffect, useState } from "react";
import { 
  crmLeadService, 
  crmCustomerService, 
  crmProductService, 
  dashboardService 
} from "../../../services/api";
import type { DashboardStats, Customer, Product, Lead } from "../../../types";
import { 
  Users, 
  Target, 
  CalendarClock, 
  FileText, 
  MoreVertical, 
  Send, 
  Package, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";
import "./CrmDashboard.css";

// Donut chart colors
const DONUT_COLORS = {
  primary: ["#556ee6", "#e8ecf6"],
  success: ["#34c38f", "#e6f7f1"],
  warning: ["#f1b44c", "#fef4e4"],
  info: ["#50a5f1", "#e6f2fd"],
};

const BAR_COLORS = ["#556ee6", "#34c38f", "#f1b44c", "#f46a6a", "#50a5f1", "#6f42c1", "#d63384"];

const TERRITORY_BAR_COLORS = ["blue", "green", "orange", "cyan", "red", "purple"];
const AVATAR_BG = ["bg-1", "bg-2", "bg-3", "bg-4", "bg-5", "bg-6"];
const PRODUCT_ICON_BG = ["bg-soft-blue", "bg-soft-green", "bg-soft-orange", "bg-soft-cyan", "bg-soft-red"];

// Mini donut for KPI card
function KpiDonut({ value, total, colorKey }: { value: number; total: number; colorKey: keyof typeof DONUT_COLORS }) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const data = [
    { name: "filled", value: pct },
    { name: "empty", value: 1 - pct },
  ];
  const [c1, c2] = DONUT_COLORS[colorKey];

  return (
    <div className="kpi-donut">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="95%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            stroke="none"
          >
            <Cell fill={c1} />
            <Cell fill={c2} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Activity messages (static demo data)
const activityMessages = [
  { id: 1, type: "received", text: "New lead created successfully!" },
  { id: 2, type: "sent", text: "Follow up scheduled for tomorrow" },
  { id: 3, type: "received", text: "Opportunity moved to Proposal stage" },
  { id: 4, type: "sent", text: "Contract sent for review. Waiting for client signature on the agreement." },
];

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);


  useEffect(() => {
    Promise.all([
      dashboardService.getStats().then(r => r.data).catch(() => null),
      crmCustomerService.getAll({ per_page: 6 }).then(r => r.data.data.data).catch(() => []),
      crmProductService.getAll({ per_page: 6 }).then(r => r.data.data.data).catch(() => []),
      crmLeadService.getAll({ per_page: 50 }).then(r => r.data.data.data).catch(() => []),
    ]).then(([s, c, p, l]) => {
      setStats(s);
      setCustomers(c as Customer[]);
      setProducts(p as Product[]);
      setLeads(l as Lead[]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg m-4">Failed to load dashboard data</div>;
  }

  // KPI data
  const kpis = [
    {
      label: "Total Leads",
      value: stats.leads.total,
      change: stats.leads.new_last_30_days,
      changeLabel: `+${stats.leads.new_last_30_days} new`,
      positive: true,
      sub: "Since last month",
      icon: Users,
      colorKey: "primary" as const,
      donutTotal: Math.max(stats.leads.total, 1),
      donutValue: stats.leads.new_last_30_days,
    },
    {
      label: "Open Opportunities",
      value: stats.opportunities.open,
      change: stats.opportunities.won_last_30_days,
      changeLabel: `${stats.opportunities.won_last_30_days} won`,
      positive: true,
      sub: "Since last month",
      icon: Target,
      colorKey: "success" as const,
      donutTotal: Math.max(stats.opportunities.total, 1),
      donutValue: stats.opportunities.open,
    },
    {
      label: "Appointments",
      value: stats.appointments.upcoming,
      change: stats.appointments.total,
      changeLabel: `${stats.appointments.total} total`,
      positive: true,
      sub: "Upcoming",
      icon: CalendarClock,
      colorKey: "warning" as const,
      donutTotal: Math.max(stats.appointments.total, 1),
      donutValue: stats.appointments.upcoming,
    },
    {
      label: "Active Contracts",
      value: stats.contracts.active,
      change: stats.contracts.unsigned,
      changeLabel: `${stats.contracts.unsigned} unsigned`,
      positive: stats.contracts.unsigned === 0,
      sub: "Current period",
      icon: FileText,
      colorKey: "info" as const,
      donutTotal: Math.max(stats.contracts.active + stats.contracts.unsigned, 1),
      donutValue: stats.contracts.active,
    },
  ];

  // Bar chart data (leads by status)
 const barData = Object.values(
    leads.reduce((acc: Record<string, { name: string; count: number }>, lead) => {
      const statusName = lead.status?.status_name || "Unknown";
      if (!acc[statusName]) acc[statusName] = { name: statusName, count: 0 };
      acc[statusName].count += 1;
      return acc;
    }, {})
  );


  // Territory / pipeline data
  const territorySummary = stats.opportunities.by_stage.slice(0, 5).map((s, i) => {
    const maxVal = Math.max(...stats.opportunities.by_stage.map(x => x.count), 1);
    return {
      name: s.stage_name,
      count: s.count,
      pct: Math.round((s.count / maxVal) * 100),
      color: TERRITORY_BAR_COLORS[i % TERRITORY_BAR_COLORS.length],
    };
  });

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
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-info">
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">{kpi.value.toLocaleString()}</div>
              <div>
                <span className={`kpi-change ${kpi.positive ? "positive" : "negative"}`}>
                  {kpi.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.changeLabel}
                </span>
                <span className="kpi-sub ml-2 text-xs text-gray-500">{kpi.sub}</span>
              </div>
            </div>
            <KpiDonut value={kpi.donutValue} total={kpi.donutTotal} colorKey={kpi.colorKey} />
          </div>
        ))}
      </div>

      {/* Row 2: Chart + Territory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Lead Pipeline Chart */}
        <div className="lg:col-span-2">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Lead Pipeline</h5>
              <div className="sort-by">
                Current Month
                <select defaultValue="all" className="ml-1 font-semibold outline-none cursor-pointer">
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div className="dash-card-body">
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74788d', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#74788d', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8f9fa' }}
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    >
                      {barData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>


        {/* Opportunity Stages */}
        <div className="lg:col-span-1">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Opportunity Stages</h5>
            </div>
            <div className="dash-card-body" style={{ height: 280, position: 'relative' }}>
              {territorySummary.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={territorySummary}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {territorySummary.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#495057' }}>{stats.opportunities.total}</div>
                    <div style={{ fontSize: '0.75rem', color: '#74788d' }}>Total</div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-center py-12">No stage data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Customer List + Products + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Customer List</h5>
              <div className="sort-by">
                All Members
                <select defaultValue="all">
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div className="dash-card-body" style={{ overflowY: "auto", maxHeight: 380 }}>
              {customers.length > 0 ? customers.map((c, i) => {
                const initials = c.name
                  ? c.name.split(" ").map(w => w[0]).join("").substring(0, 2)
                  : "?";
                return (
                  <div className="customer-list-item" key={c.id}>
                    <div className={`customer-avatar ${AVATAR_BG[i % AVATAR_BG.length]}`}>
                      {initials}
                    </div>
                    <div className="customer-details">
                      <div className="customer-name">{c.name}</div>
                      <div className="customer-email">{c.email || "No email"}</div>
                    </div>
                    <div className="customer-more">
                      <MoreVertical size={16} />
                    </div>
                  </div>
                );
              }) : (
                <div className="text-gray-400 text-center py-12">No customers yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Product Catalog */}
        <div className="lg:col-span-1">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Products</h5>
              <div className="customer-more">
                <MoreVertical size={16} />
              </div>
            </div>
            <div className="dash-card-body" style={{ overflowY: "auto", maxHeight: 380, padding: "0 20px 16px" }}>
              {products.length > 0 ? (
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p.id}>
                        <td>
                          <div className="product-name-cell">
                            <div className={`product-icon ${PRODUCT_ICON_BG[i % PRODUCT_ICON_BG.length]}`}>
                              <Package size={18} />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{p.name}</div>
                              <div className="text-xs text-gray-500">
                                {p.code || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="font-semibold">
                          ₹{p.rate?.toLocaleString() || "0"}
                        </td>
                        <td>
                          <span className={`stock-badge ${p.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                            {p.stock > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-400 text-center py-12">No products yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed / Chat */}
        <div className="lg:col-span-1">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Recent Activity</h5>
              <div className="sort-by">
                Today
                <select defaultValue="today">
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>
            <div className="dash-card-body" style={{ display: "flex", flexDirection: "column", maxHeight: 380 }}>
              <div className="activity-feed">
                <div className="activity-date">
                  <span>Today</span>
                </div>
                <div className="activity-messages">
                  {activityMessages.map((msg) => (
                    <div className={`activity-item ${msg.type}`} key={msg.id}>
                      <div className="activity-bubble shadow-sm">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="activity-input">
                  <input type="text" placeholder="Enter Message..." readOnly />
                  <button className="bg-primary text-white transition-all">
                    <Send size={14} className="mr-1" /> Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
