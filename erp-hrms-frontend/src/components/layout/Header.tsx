import { useAuthStore } from "@/store/authStore";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 ml-56">
      <div className="text-sm text-gray-500">
        {user?.org_id ? `Organization #${user.org_id}` : "ERP Dashboard"}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="h-4 w-4" />
          <span>{user?.name || user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
