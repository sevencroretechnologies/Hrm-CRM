import apiClient from "./apiClient";
import type {
  Lead, Opportunity, Prospect, Campaign, Contract, Appointment,
  SalesStage, OpportunityLostReason, Competitor, CrmNote, CrmSetting,
  DashboardStats, PaginatedResponse,
} from "@/types";

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>("/crm/dashboard/stats").then((r) => r.data),
  getLeadFunnel: () => apiClient.get("/crm/dashboard/lead-conversion-funnel").then((r) => r.data),
  getOpportunityPipeline: () => apiClient.get("/crm/dashboard/opportunity-pipeline").then((r) => r.data),
};

export const leadApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Lead>>("/crm/leads", { params }).then((r) => r.data),
  get: (id: number) => apiClient.get<Lead>(`/crm/leads/${id}`).then((r) => r.data),
  create: (data: Partial<Lead>) => apiClient.post<Lead>("/crm/leads", data).then((r) => r.data),
  update: (id: number, data: Partial<Lead>) => apiClient.put<Lead>(`/crm/leads/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/leads/${id}`),
  convertToOpportunity: (id: number, data: Record<string, unknown>) =>
    apiClient.post<Opportunity>(`/crm/leads/${id}/convert-to-opportunity`, data).then((r) => r.data),
  addToProspect: (id: number, prospectId: number) =>
    apiClient.post(`/crm/leads/${id}/add-to-prospect`, { prospect_id: prospectId }),
  createProspect: (id: number, name?: string) =>
    apiClient.post<Prospect>(`/crm/leads/${id}/create-prospect`, { prospect_name: name }).then((r) => r.data),
};

export const opportunityApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Opportunity>>("/crm/opportunities", { params }).then((r) => r.data),
  get: (id: number) => apiClient.get<Opportunity>(`/crm/opportunities/${id}`).then((r) => r.data),
  create: (data: Partial<Opportunity>) => apiClient.post<Opportunity>("/crm/opportunities", data).then((r) => r.data),
  update: (id: number, data: Partial<Opportunity>) =>
    apiClient.put<Opportunity>(`/crm/opportunities/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/opportunities/${id}`),
  declareLost: (id: number, data: { lost_reason_ids: number[]; competitor_ids?: number[]; detailed_reason?: string }) =>
    apiClient.post<Opportunity>(`/crm/opportunities/${id}/declare-lost`, data).then((r) => r.data),
};

export const prospectApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Prospect>>("/crm/prospects", { params }).then((r) => r.data),
  get: (id: number) => apiClient.get<Prospect>(`/crm/prospects/${id}`).then((r) => r.data),
  create: (data: Partial<Prospect>) => apiClient.post<Prospect>("/crm/prospects", data).then((r) => r.data),
  update: (id: number, data: Partial<Prospect>) =>
    apiClient.put<Prospect>(`/crm/prospects/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/prospects/${id}`),
};

export const campaignApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Campaign>>("/crm/campaigns", { params }).then((r) => r.data),
  get: (id: number) => apiClient.get<Campaign>(`/crm/campaigns/${id}`).then((r) => r.data),
  create: (data: Partial<Campaign>) => apiClient.post<Campaign>("/crm/campaigns", data).then((r) => r.data),
  update: (id: number, data: Partial<Campaign>) =>
    apiClient.put<Campaign>(`/crm/campaigns/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/campaigns/${id}`),
};

export const contractApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Contract>>("/crm/contracts", { params }).then((r) => r.data),
  get: (id: number) => apiClient.get<Contract>(`/crm/contracts/${id}`).then((r) => r.data),
  create: (data: Partial<Contract>) => apiClient.post<Contract>("/crm/contracts", data).then((r) => r.data),
  update: (id: number, data: Partial<Contract>) =>
    apiClient.put<Contract>(`/crm/contracts/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/contracts/${id}`),
  sign: (id: number, data: { signee?: string }) =>
    apiClient.post<Contract>(`/crm/contracts/${id}/sign`, data).then((r) => r.data),
};

export const appointmentApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<Appointment>>("/crm/appointments", { params }).then((r) => r.data),
  get: (id: number) => apiClient.get<Appointment>(`/crm/appointments/${id}`).then((r) => r.data),
  create: (data: Partial<Appointment>) => apiClient.post<Appointment>("/crm/appointments", data).then((r) => r.data),
  update: (id: number, data: Partial<Appointment>) =>
    apiClient.put<Appointment>(`/crm/appointments/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/appointments/${id}`),
};

export const salesStageApi = {
  list: () => apiClient.get<SalesStage[]>("/crm/sales-stages").then((r) => r.data),
  create: (data: Partial<SalesStage>) => apiClient.post<SalesStage>("/crm/sales-stages", data).then((r) => r.data),
  update: (id: number, data: Partial<SalesStage>) =>
    apiClient.put<SalesStage>(`/crm/sales-stages/${id}`, data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/sales-stages/${id}`),
};

export const lostReasonApi = {
  list: () => apiClient.get<OpportunityLostReason[]>("/crm/lost-reasons").then((r) => r.data),
  create: (data: { reason: string }) =>
    apiClient.post<OpportunityLostReason>("/crm/lost-reasons", data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/lost-reasons/${id}`),
};

export const competitorApi = {
  list: () => apiClient.get<Competitor[]>("/crm/competitors").then((r) => r.data),
  create: (data: Partial<Competitor>) => apiClient.post<Competitor>("/crm/competitors", data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/competitors/${id}`),
};

export const noteApi = {
  list: (notableType: string, notableId: number) =>
    apiClient.get<CrmNote[]>("/crm/notes", { params: { notable_type: notableType, notable_id: notableId } }).then((r) => r.data),
  create: (data: { notable_type: string; notable_id: number; note: string }) =>
    apiClient.post<CrmNote>("/crm/notes", data).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/crm/notes/${id}`),
};

export const settingsApi = {
  get: () => apiClient.get<CrmSetting>("/crm/settings").then((r) => r.data),
  update: (data: Partial<CrmSetting>) => apiClient.put<CrmSetting>("/crm/settings", data).then((r) => r.data),
};
