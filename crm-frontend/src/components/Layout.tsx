import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, Users, Target, Building2, Megaphone, Globe, CalendarClock, Settings, MapPin, UserCircle, Briefcase, Package, ShoppingBag, ThumbsDown, LogOut } from "lucide-react";

// ... (links remains same)
const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Briefcase },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/opportunities", label: "Opportunities", icon: Target },
  { to: "/prospects", label: "Prospects", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: UserCircle },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/sources", label: "Sources", icon: Globe },
  { to: "/territories", label: "Territories", icon: MapPin },
  { to: "/product-categories", label: "Product Categories", icon: Package },
  { to: "/products", label: "Products", icon: ShoppingBag },
  { to: "/opportunity-lost-reasons", label: "Lost Reasons", icon: ThumbsDown },
  { to: "/sales-tasks", label: "Sales Tasks", icon: Briefcase },
  { to: "/sales-task-details", label: "Sales Task Details", icon: Briefcase },
  { to: "/appointments", label: "Appointments", icon: CalendarClock },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="d-flex">
      <nav className="sidebar d-flex flex-column">
        <NavLink to="/" className="brand">CRM</NavLink>
        <ul className="nav flex-column flex-grow-1">
          {links.map((l) => (
            <li className="nav-item" key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <l.icon size={18} />
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {user && (
          <div className="mt-auto p-3 border-top border-secondary text-white-50">
            {/* <div className="d-flex align-items-center gap-2 mb-3 px-2">
              <UserCircle size={20} />
              <div className="text-truncate" style={{ fontSize: "0.85rem" }}>
                <div>{user.name}</div>
              </div>
            </div> */}
            <button
              onClick={handleLogout}
              className="btn btn-link nav-link w-100 text-start d-flex align-items-center gap-2 m-0 p-2"
              style={{ textDecoration: 'none' }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </nav>
      <main className="content-area flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}
