import { Clock } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Attendance</h2>
      <div className="bg-white rounded-xl border p-8 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-600">Attendance Module</h3>
        <p className="text-gray-400 mt-1">Track employee attendance, check-ins, and work hours.</p>
      </div>
    </div>
  );
}
