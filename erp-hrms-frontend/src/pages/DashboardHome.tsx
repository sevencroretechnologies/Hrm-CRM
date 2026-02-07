import { useAuthStore } from "@/store/authStore";
import { NavLink } from "react-router-dom";
import { Users, Target, UserCheck, Clock, Wallet, Briefcase, Megaphone, Building2 } from "lucide-react";

const modules = [
  { title: "HRMS", items: [
    { to: "/dashboard/hrms/staff", label: "Staff", icon: UserCheck, desc: "Manage staff members" },
    { to: "/dashboard/hrms/attendance", label: "Attendance", icon: Clock, desc: "Track attendance" },
    { to: "/dashboard/hrms/payroll", label: "Payroll", icon: Wallet, desc: "Process payroll" },
    { to: "/dashboard/hrms/recruitment", label: "Recruitment", icon: Briefcase, desc: "Manage hiring" },
  ]},
  { title: "CRM", items: [
    { to: "/dashboard/crm/leads", label: "Leads", icon: Users, desc: "Manage leads" },
    { to: "/dashboard/crm/opportunities", label: "Opportunities", icon: Target, desc: "Track deals" },
    { to: "/dashboard/crm/prospects", label: "Prospects", icon: Building2, desc: "Manage prospects" },
    { to: "/dashboard/crm/campaigns", label: "Campaigns", icon: Megaphone, desc: "Run campaigns" },
  ]},
];

export default function DashboardHome() {
  const { user } = useAuthStore();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Welcome, {user?.name || "User"}</h2>
      <p className="text-gray-500 mb-6">Select a module to get started</p>
      {modules.map((mod) => (
        <div key={mod.title} className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">{mod.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mod.items.map((item) => (
              <NavLink key={item.to} to={item.to} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow no-underline text-inherit">
                <item.icon className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold">{item.label}</h4>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
