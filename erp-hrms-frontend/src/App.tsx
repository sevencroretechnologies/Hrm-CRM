import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import AuthGuard from "@/components/common/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardHome from "@/pages/DashboardHome";
import StaffPage from "@/modules/hrms/staff/StaffPage";
import AttendancePage from "@/modules/hrms/attendance/AttendancePage";
import PayrollPage from "@/modules/hrms/payroll/PayrollPage";
import RecruitmentPage from "@/modules/hrms/recruitment/RecruitmentPage";
import CrmDashboard from "@/modules/crm/dashboard/CrmDashboard";
import LeadsPage from "@/modules/crm/leads/LeadsPage";
import OpportunitiesPage from "@/modules/crm/opportunities/OpportunitiesPage";
import ProspectsPage from "@/modules/crm/prospects/ProspectsPage";
import CampaignsPage from "@/modules/crm/campaigns/CampaignsPage";
import ContractsPage from "@/modules/crm/contracts/ContractsPage";
import AppointmentsPage from "@/modules/crm/appointments/AppointmentsPage";
import SettingsPage from "@/modules/crm/settings/SettingsPage";

export default function App() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/hrms/staff" element={<StaffPage />} />
          <Route path="/dashboard/hrms/attendance" element={<AttendancePage />} />
          <Route path="/dashboard/hrms/payroll" element={<PayrollPage />} />
          <Route path="/dashboard/hrms/recruitment" element={<RecruitmentPage />} />
          <Route path="/dashboard/crm/dashboard" element={<CrmDashboard />} />
          <Route path="/dashboard/crm/leads" element={<LeadsPage />} />
          <Route path="/dashboard/crm/opportunities" element={<OpportunitiesPage />} />
          <Route path="/dashboard/crm/prospects" element={<ProspectsPage />} />
          <Route path="/dashboard/crm/campaigns" element={<CampaignsPage />} />
          <Route path="/dashboard/crm/contracts" element={<ContractsPage />} />
          <Route path="/dashboard/crm/appointments" element={<AppointmentsPage />} />
          <Route path="/dashboard/crm/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
