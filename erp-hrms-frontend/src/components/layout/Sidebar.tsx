import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Target, Building2, Megaphone, FileText, CalendarClock, Settings,
  UserCheck, Clock, Wallet, Briefcase, ChevronDown, ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavGroup {
  label: string;
  items: { to: string; label: string; icon: React.ElementType }[];
}

const navGroups: NavGroup[] = [
  {
    label: "HRMS",
    items: [
      { to: "/dashboard/hrms/staff", label: "Staff", icon: UserCheck },
      { to: "/dashboard/hrms/attendance", label: "Attendance", icon: Clock },
      { to: "/dashboard/hrms/payroll", label: "Payroll", icon: Wallet },
      { to: "/dashboard/hrms/recruitment", label: "Recruitment", icon: Briefcase },
    ],
  },
  {
    label: "CRM",
    items: [
      { to: "/dashboard/crm/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/dashboard/crm/leads", label: "Leads", icon: Users },
      { to: "/dashboard/crm/opportunities", label: "Opportunities", icon: Target },
      { to: "/dashboard/crm/prospects", label: "Prospects", icon: Building2 },
      { to: "/dashboard/crm/campaigns", label: "Campaigns", icon: Megaphone },
      { to: "/dashboard/crm/contracts", label: "Contracts", icon: FileText },
      { to: "/dashboard/crm/appointments", label: "Appointments", icon: CalendarClock },
      { to: "/dashboard/crm/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ HRMS: true, CRM: true });

  const toggle = (label: string) => setExpanded((p) => ({ ...p, [label]: !p[label] }));

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-slate-900 text-white flex flex-col">
      <div className="px-4 py-5 border-b border-slate-700">
        <NavLink to="/dashboard" className="text-xl font-bold text-white no-underline">ERP System</NavLink>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            <button
              onClick={() => toggle(group.label)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white"
            >
              {group.label}
              {expanded[group.label] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {expanded[group.label] && (
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm no-underline transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
