import { UserCheck } from "lucide-react";

export default function StaffPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Staff Management</h2>
      <div className="bg-white rounded-xl border p-8 text-center">
        <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-600">Staff Module</h3>
        <p className="text-gray-400 mt-1">Manage your organization's staff members, departments, and roles.</p>
      </div>
    </div>
  );
}
