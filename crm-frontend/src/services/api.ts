import axios from "axios";
import type {
  Lead,
  Opportunity,
  Prospect,
  Campaign,
  Contract,
  Appointment,
  SalesStage,
  OpportunityLostReason,
  Competitor,
  CrmNote,
  CrmSetting,
  DashboardStats,
  PaginatedResponse,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
  getLeadFunnel: () => api.get("/dashboard/lead-conversion-funnel").then((r) => r.data),
  getOpportunityPipeline: () => api.get("/dashboard/opportunity-pipeline").then((r) => r.data),
};

export const leadApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Lead>>("/leads", { params }).then((r) => r.data),
  get: (id: number) => api.get<Lead>(`/leads/${id}`).then((r) => r.data),
  create: (data: Partial<Lead>) => api.post<Lead>("/leads", data).then((r) => r.data),
  update: (id: number, data: Partial<Lead>) =>
    api.put<Lead>(`/leads/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/leads/${id}`),
  convertToOpportunity: (id: number, data: Record<string, unknown>) =>
    api.post<Opportunity>(`/leads/${id}/convert-to-opportunity`, data).then((r) => r.data),
  addToProspect: (id: number, prospectId: number) =>
    api.post(`/leads/${id}/add-to-prospect`, { prospect_id: prospectId }),
  createProspect: (id: number, name?: string) =>
    api.post<Prospect>(`/leads/${id}/create-prospect`, { prospect_name: name }).then((r) => r.data),
};

export const opportunityApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Opportunity>>("/opportunities", { params }).then((r) => r.data),
  get: (id: number) => api.get<Opportunity>(`/opportunities/${id}`).then((r) => r.data),
  create: (data: Partial<Opportunity>) =>
    api.post<Opportunity>("/opportunities", data).then((r) => r.data),
  update: (id: number, data: Partial<Opportunity>) =>
    api.put<Opportunity>(`/opportunities/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/opportunities/${id}`),
  declareLost: (id: number, data: { lost_reason_ids: number[]; competitor_ids?: number[]; detailed_reason?: string }) =>
    api.post<Opportunity>(`/opportunities/${id}/declare-lost`, data).then((r) => r.data),
};

export const prospectApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Prospect>>("/prospects", { params }).then((r) => r.data),
  get: (id: number) => api.get<Prospect>(`/prospects/${id}`).then((r) => r.data),
  create: (data: Partial<Prospect>) =>
    api.post<Prospect>("/prospects", data).then((r) => r.data),
  update: (id: number, data: Partial<Prospect>) =>
    api.put<Prospect>(`/prospects/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/prospects/${id}`),
};

export const campaignApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Campaign>>("/campaigns", { params }).then((r) => r.data),
  get: (id: number) => api.get<Campaign>(`/campaigns/${id}`).then((r) => r.data),
  create: (data: Partial<Campaign>) =>
    api.post<Campaign>("/campaigns", data).then((r) => r.data),
  update: (id: number, data: Partial<Campaign>) =>
    api.put<Campaign>(`/campaigns/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/campaigns/${id}`),
};

export const contractApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Contract>>("/contracts", { params }).then((r) => r.data),
  get: (id: number) => api.get<Contract>(`/contracts/${id}`).then((r) => r.data),
  create: (data: Partial<Contract>) =>
    api.post<Contract>("/contracts", data).then((r) => r.data),
  update: (id: number, data: Partial<Contract>) =>
    api.put<Contract>(`/contracts/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/contracts/${id}`),
  sign: (id: number, data: { signee?: string }) =>
    api.post<Contract>(`/contracts/${id}/sign`, data).then((r) => r.data),
};

export const appointmentApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<PaginatedResponse<Appointment>>("/appointments", { params }).then((r) => r.data),
  get: (id: number) => api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),
  create: (data: Partial<Appointment>) =>
    api.post<Appointment>("/appointments", data).then((r) => r.data),
  update: (id: number, data: Partial<Appointment>) =>
    api.put<Appointment>(`/appointments/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/appointments/${id}`),
};

export const salesStageApi = {
  list: () => api.get<SalesStage[]>("/sales-stages").then((r) => r.data),
  create: (data: Partial<SalesStage>) =>
    api.post<SalesStage>("/sales-stages", data).then((r) => r.data),
  update: (id: number, data: Partial<SalesStage>) =>
    api.put<SalesStage>(`/sales-stages/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/sales-stages/${id}`),
};

export const lostReasonApi = {
  list: () => api.get<OpportunityLostReason[]>("/lost-reasons").then((r) => r.data),
  create: (data: { reason: string }) =>
    api.post<OpportunityLostReason>("/lost-reasons", data).then((r) => r.data),
  delete: (id: number) => api.delete(`/lost-reasons/${id}`),
};

export const competitorApi = {
  list: () => api.get<Competitor[]>("/competitors").then((r) => r.data),
  create: (data: Partial<Competitor>) =>
    api.post<Competitor>("/competitors", data).then((r) => r.data),
  delete: (id: number) => api.delete(`/competitors/${id}`),
};

export const noteApi = {
  list: (notableType: string, notableId: number) =>
    api.get<CrmNote[]>("/notes", { params: { notable_type: notableType, notable_id: notableId } }).then((r) => r.data),
  create: (data: { notable_type: string; notable_id: number; note: string }) =>
    api.post<CrmNote>("/notes", data).then((r) => r.data),
  delete: (id: number) => api.delete(`/notes/${id}`),
};

export const settingsApi = {
  get: () => api.get<CrmSetting>("/settings").then((r) => r.data),
  update: (data: Partial<CrmSetting>) =>
    api.put<CrmSetting>("/settings", data).then((r) => r.data),
};

export default api;
