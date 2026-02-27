import axios from "axios";
import type {
  Lead,
  Opportunity,
  Prospect,
  Campaign,
  Source,
  Contract,
  Appointment,
  SalesStage,
  Status,
  RequestType,
  IndustryType,
  OpportunityLostReason,
  Competitor,
  OpportunityStage,
  OpportunityType,
  CrmNote,
  CrmSetting,
  DashboardStats,
  WrappedPaginatedResponse,
  Territory,
  Contact,
  Customer,
  CustomerGroup,
  PriceList,
  PaymentTerm,
  ProductCategory,
  Product,
  EnumOption,
  SalesTask,
  SalesTaskDetail,
  TaskSource,
  TaskType,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
}

export const authApi = {
  signIn: (data: any) => api.post("/auth/sign-in", data).then((r) => r.data),
  signUp: (data: any) => api.post("/auth/sign-up", data).then((r) => r.data),
  signOut: () => api.post("/auth/sign-out").then((r) => r.data),
  getProfile: () => api.get("/auth/profile").then((r) => r.data),
};

export const userApi = {
  list: () => api.get<User[]>("/users").then((r) => r.data),
};

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
  getLeadFunnel: () => api.get("/dashboard/lead-conversion-funnel").then((r) => r.data),
  getOpportunityPipeline: () => api.get("/dashboard/opportunity-pipeline").then((r) => r.data),
};

export const leadApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<Lead>>("/leads", { params }).then((r) => r.data.data),
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
    api.get<WrappedPaginatedResponse<Opportunity>>("/opportunities", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<Opportunity>(`/opportunities/${id}`).then((r) => r.data),
  create: (data: Partial<Opportunity>) =>
    api.post<Opportunity>("/opportunities", data).then((r) => r.data),
  update: (id: number, data: Partial<Opportunity>) =>
    api.put<Opportunity>(`/opportunities/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/opportunities/${id}`),
  getProducts: (id: number) => api.get(`/opportunities/${id}/products`).then((res) => res.data),
  declareLost: (id: number, data: any) => api.post(`/opportunities/${id}/declare-lost`, data).then((res) => res.data),
};

export const prospectApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<Prospect>>("/prospects", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<Prospect>(`/prospects/${id}`).then((r) => r.data),
  create: (data: Partial<Prospect>) =>
    api.post<Prospect>("/prospects", data).then((r) => r.data),
  update: (id: number, data: Partial<Prospect>) =>
    api.put<Prospect>(`/prospects/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/prospects/${id}`),
};

export const campaignApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<Campaign>>("/campaigns", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<Campaign>(`/campaigns/${id}`).then((r) => r.data),
  create: (data: Partial<Campaign>) =>
    api.post<Campaign>("/campaigns", data).then((r) => r.data),
  update: (id: number, data: Partial<Campaign>) =>
    api.put<Campaign>(`/campaigns/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/campaigns/${id}`),
};

export const sourceApi = {
  list: () => api.get<Source[]>("/sources").then((r) => r.data),
  get: (id: number) => api.get<Source>(`/sources/${id}`).then((r) => r.data),
  create: (data: Partial<Source>) =>
    api.post<Source>("/sources", data).then((r) => r.data),
  update: (id: number, data: Partial<Source>) =>
    api.put<Source>(`/sources/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/sources/${id}`),
};

export const contractApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<Contract>>("/contracts", { params }).then((r) => r.data.data),
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
    api.get<WrappedPaginatedResponse<Appointment>>("/appointments", { params }).then((r) => r.data.data),
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

export const statusApi = {
  list: () => api.get<Status[]>("/statuses").then((r) => r.data),
  get: (id: number) => api.get<Status>(`/statuses/${id}`).then((r) => r.data),
  create: (data: Partial<Status>) =>
    api.post<Status>("/statuses", data).then((r) => r.data),
  update: (id: number, data: Partial<Status>) =>
    api.put<Status>(`/statuses/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/statuses/${id}`),
};

export const requestTypeApi = {
  list: () => api.get<RequestType[]>("/request-types").then((r) => r.data),
  get: (id: number) => api.get<RequestType>(`/request-types/${id}`).then((r) => r.data),
  create: (data: Partial<RequestType>) =>
    api.post<RequestType>("/request-types", data).then((r) => r.data),
  update: (id: number, data: Partial<RequestType>) =>
    api.put<RequestType>(`/request-types/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/request-types/${id}`),
};

export const industryTypeApi = {
  list: () => api.get<IndustryType[]>("/industry-types").then((r) => r.data),
  get: (id: number) => api.get<IndustryType>(`/industry-types/${id}`).then((r) => r.data),
  create: (data: Partial<IndustryType>) =>
    api.post<IndustryType>("/industry-types", data).then((r) => r.data),
  update: (id: number, data: Partial<IndustryType>) =>
    api.put<IndustryType>(`/industry-types/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/industry-types/${id}`),
};

export const lostReasonApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<OpportunityLostReason>>("/lost-reasons", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<OpportunityLostReason>(`/lost-reasons/${id}`).then((r) => r.data),
  create: (data: { opportunity_id: number; opportunity_lost_reasons: string }) =>
    api.post<OpportunityLostReason>("/lost-reasons", data).then((r) => r.data),
  update: (id: number, data: { opportunity_id?: number; opportunity_lost_reasons?: string }) =>
    api.put<OpportunityLostReason>(`/lost-reasons/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/lost-reasons/${id}`),
};

export const competitorApi = {
  list: () => api.get<Competitor[]>("/competitors").then((r) => r.data),
  create: (data: Partial<Competitor>) =>
    api.post<Competitor>("/competitors", data).then((r) => r.data),
  delete: (id: number) => api.delete(`/competitors/${id}`),
};

export const opportunityStageApi = {
  list: () => api.get<OpportunityStage[]>("/opportunity-stages").then((r) => r.data),
  get: (id: number) => api.get<OpportunityStage>(`/opportunity-stages/${id}`).then((r) => r.data),
  create: (data: Partial<OpportunityStage>) =>
    api.post<OpportunityStage>("/opportunity-stages", data).then((r) => r.data),
  update: (id: number, data: Partial<OpportunityStage>) =>
    api.put<OpportunityStage>(`/opportunity-stages/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/opportunity-stages/${id}`),
};

export const opportunityTypeApi = {
  list: () => api.get<OpportunityType[]>("/opportunity-types").then((r) => r.data),
  get: (id: number) => api.get<OpportunityType>(`/opportunity-types/${id}`).then((r) => r.data),
  create: (data: Partial<OpportunityType>) =>
    api.post<OpportunityType>("/opportunity-types", data).then((r) => r.data),
  update: (id: number, data: Partial<OpportunityType>) =>
    api.put<OpportunityType>(`/opportunity-types/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/opportunity-types/${id}`),
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

export const enumApi = {
  qualificationStatuses: () => api.get<EnumOption[]>("/enums/qualification-statuses").then((r) => r.data),
  genders: () => api.get<EnumOption[]>("/enums/genders").then((r) => r.data),
};

export const contactApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<Contact>>("/contacts", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<Contact>(`/contacts/${id}`).then((r) => r.data),
  create: (data: Partial<Contact>) =>
    api.post<Contact>("/contacts", data).then((r) => r.data),
  update: (id: number, data: Partial<Contact>) =>
    api.put<Contact>(`/contacts/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/contacts/${id}`),
};

export const territoryApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<Territory[]>("/territories", { params }).then((r) => r.data),
  get: (id: number) => api.get<Territory>(`/territories/${id}`).then((r) => r.data),
  create: (data: Partial<Territory>) =>
    api.post<Territory>("/territories", data).then((r) => r.data),
  update: (id: number, data: Partial<Territory>) =>
    api.put<Territory>(`/territories/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/territories/${id}`),
};

export const customerApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<Customer>>("/customers", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),
  create: (data: Partial<Customer>) =>
    api.post<Customer>("/customers", data).then((r) => r.data),
  update: (id: number, data: Partial<Customer>) =>
    api.put<Customer>(`/customers/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const customerGroupApi = {
  list: () => api.get<CustomerGroup[]>("/customer-groups").then((r) => r.data),
  create: (data: Partial<CustomerGroup>) =>
    api.post<CustomerGroup>("/customer-groups", data).then((r) => r.data),
  update: (id: number, data: Partial<CustomerGroup>) =>
    api.put<CustomerGroup>(`/customer-groups/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/customer-groups/${id}`),
};

export const priceListApi = {
  list: () => api.get<PriceList[]>("/price-lists").then((r) => r.data),
  create: (data: Partial<PriceList>) =>
    api.post<PriceList>("/price-lists", data).then((r) => r.data),
  update: (id: number, data: Partial<PriceList>) =>
    api.put<PriceList>(`/price-lists/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/price-lists/${id}`),
};

export const paymentTermApi = {
  list: () => api.get<PaymentTerm[]>("/payment-terms").then((r) => r.data),
  create: (data: Partial<PaymentTerm>) =>
    api.post<PaymentTerm>("/payment-terms", data).then((r) => r.data),
  update: (id: number, data: Partial<PaymentTerm>) =>
    api.put<PaymentTerm>(`/payment-terms/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/payment-terms/${id}`),
};

export const productCategoryApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<ProductCategory>>("/product-categories", { params }).then((r) => r.data.data),
  listAll: () => api.get<WrappedPaginatedResponse<ProductCategory>>("/product-categories", { params: { per_page: 1000 } }).then((r) => r.data.data.data),
  get: (id: number) => api.get<ProductCategory>(`/product-categories/${id}`).then((r) => r.data),
  create: (data: Partial<ProductCategory>) =>
    api.post<ProductCategory>("/product-categories", data).then((r) => r.data),
  update: (id: number, data: Partial<ProductCategory>) =>
    api.put<ProductCategory>(`/product-categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/product-categories/${id}`),
};

export const productApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<Product>>("/products", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (data: Partial<Product>) =>
    api.post<Product>("/products", data).then((r) => r.data),
  update: (id: number, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export default api;

export const taskSourceApi = {
  list: () => api.get<TaskSource[]>("/task-sources").then((r) => r.data),
  get: (id: number) => api.get<TaskSource>(`/task-sources/${id}`).then((r) => r.data),
  create: (data: Partial<TaskSource>) =>
    api.post<TaskSource>("/task-sources", data).then((r) => r.data),
  update: (id: number, data: Partial<TaskSource>) =>
    api.put<TaskSource>(`/task-sources/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/task-sources/${id}`),
};

export const taskTypeApi = {
  list: () => api.get<TaskType[]>("/task-types").then((r) => r.data),
  get: (id: number) => api.get<TaskType>(`/task-types/${id}`).then((r) => r.data),
  create: (data: Partial<TaskType>) =>
    api.post<TaskType>("/task-types", data).then((r) => r.data),
  update: (id: number, data: Partial<TaskType>) =>
    api.put<TaskType>(`/task-types/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/task-types/${id}`),
};

export const salesTaskApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<SalesTask>>("/sales-tasks", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<SalesTask>(`/sales-tasks/${id}`).then((r) => r.data),
  create: (data: Partial<SalesTask>) =>
    api.post<SalesTask>("/sales-tasks", data).then((r) => r.data),
  update: (id: number, data: Partial<SalesTask>) =>
    api.put<SalesTask>(`/sales-tasks/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/sales-tasks/${id}`),
};


export const salesTaskDetailApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<WrappedPaginatedResponse<SalesTaskDetail>>("/sales-task-details", { params }).then((r) => r.data.data),
  get: (id: number) => api.get<SalesTaskDetail>(`/sales-task-details/${id}`).then((r) => r.data),
  create: (data: Partial<SalesTaskDetail>) =>
    api.post<SalesTaskDetail>("/sales-task-details", data).then((r) => r.data),
  update: (id: number, data: Partial<SalesTaskDetail>) =>
    api.put<SalesTaskDetail>(`/sales-task-details/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/sales-task-details/${id}`),
};

export const opportunityProductApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<any[]>("/opportunity-products", { params }).then((r) => r.data),
  create: (data: Record<string, any>) =>
    api.post("/opportunity-products", data).then((r) => r.data),
  update: (id: number, data: Record<string, any>) =>
    api.put(`/opportunity-products/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/opportunity-products/${id}`),
};

