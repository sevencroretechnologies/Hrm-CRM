import apiClient from "./apiClient";

export const hrmsService = {
  getStaff: (params?: Record<string, string | number>) =>
    apiClient.get("/hrms/staff", { params }).then((r) => r.data),
  getAttendance: (params?: Record<string, string | number>) =>
    apiClient.get("/hrms/attendance", { params }).then((r) => r.data),
  getPayroll: (params?: Record<string, string | number>) =>
    apiClient.get("/hrms/payroll", { params }).then((r) => r.data),
  getRecruitment: (params?: Record<string, string | number>) =>
    apiClient.get("/hrms/recruitment", { params }).then((r) => r.data),
};
