import { Wallet } from "lucide-react";

export default function PayrollPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payroll</h2>
      <div className="bg-white rounded-xl border p-8 text-center">
        <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-600">Payroll Module</h3>
        <p className="text-gray-400 mt-1">Process payroll, manage salaries, deductions, and payslips.</p>
      </div>
    </div>
  );
}
