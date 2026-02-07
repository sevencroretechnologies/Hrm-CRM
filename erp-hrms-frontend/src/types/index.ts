export interface User {
  id: number;
  name: string;
  email: string;
  org_id: number | null;
  company_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  salutation: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  lead_name: string | null;
  job_title: string | null;
  gender: string | null;
  lead_owner_id: number | null;
  status: string;
  type: string | null;
  request_type: string | null;
  email_id: string | null;
  website: string | null;
  mobile_no: string | null;
  whatsapp_no: string | null;
  phone: string | null;
  phone_ext: string | null;
  company_name: string | null;
  no_of_employees: string | null;
  annual_revenue: number | null;
  industry: string | null;
  market_segment: string | null;
  territory: string | null;
  fax: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  qualification_status: string | null;
  qualified_by: number | null;
  qualified_on: string | null;
  disabled: boolean;
  unsubscribed: boolean;
  blog_subscriber: boolean;
  company: string | null;
  title: string | null;
  notes: CrmNote[];
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: number;
  opportunity_from: string;
  party_id: number;
  customer_name: string | null;
  status: string;
  opportunity_type: string | null;
  opportunity_owner_id: number | null;
  sales_stage_id: number | null;
  sales_stage: SalesStage | null;
  expected_closing: string | null;
  probability: number | null;
  opportunity_amount: number | null;
  base_opportunity_amount: number | null;
  currency: string | null;
  conversion_rate: number | null;
  company: string | null;
  transaction_date: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_mobile: string | null;
  territory: string | null;
  total: number | null;
  base_total: number | null;
  items: OpportunityItem[];
  notes: CrmNote[];
  created_at: string;
  updated_at: string;
}

export interface OpportunityItem {
  id: number;
  opportunity_id: number;
  item_code: string | null;
  item_name: string | null;
  qty: number;
  rate: number;
  amount: number;
  uom: string | null;
}

export interface Prospect {
  id: number;
  company_name: string;
  industry: string | null;
  market_segment: string | null;
  customer_group: string | null;
  territory: string | null;
  no_of_employees: string | null;
  annual_revenue: number | null;
  fax: string | null;
  website: string | null;
  prospect_owner_id: number | null;
  company: string | null;
  leads: Lead[];
  opportunities: Opportunity[];
  notes: CrmNote[];
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: number;
  campaign_name: string;
  description: string | null;
  email_schedules: CampaignEmailSchedule[];
  email_campaigns: EmailCampaign[];
  created_at: string;
  updated_at: string;
}

export interface CampaignEmailSchedule {
  id: number;
  campaign_id: number;
  email_template: string | null;
  send_after_days: number;
}

export interface EmailCampaign {
  id: number;
  campaign_id: number;
  email_campaign_for: string;
  recipient: string;
  sender_id: number | null;
  start_date: string;
  end_date: string | null;
  status: string;
}

export interface Contract {
  id: number;
  party_type: string;
  party_name: string;
  party_user_id: number | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  contract_template: string | null;
  contract_terms: string;
  is_signed: boolean;
  signed_on: string | null;
  signee: string | null;
  signee_company: string | null;
  requires_fulfilment: boolean;
  fulfilment_deadline: string | null;
  fulfilment_status: string | null;
  fulfilment_checklists: ContractFulfilmentChecklist[];
  created_at: string;
  updated_at: string;
}

export interface ContractFulfilmentChecklist {
  id: number;
  contract_id: number;
  requirement: string;
  fulfilled: boolean;
  notes: string | null;
}

export interface Appointment {
  id: number;
  scheduled_time: string;
  status: string;
  customer_name: string;
  customer_phone_number: string | null;
  customer_skype: string | null;
  customer_email: string;
  customer_details: string | null;
  appointment_with: string | null;
  party: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesStage {
  id: number;
  stage_name: string;
  description: string | null;
}

export interface OpportunityLostReason {
  id: number;
  reason: string;
}

export interface Competitor {
  id: number;
  competitor_name: string;
  website: string | null;
}

export interface CrmNote {
  id: number;
  notable_type: string;
  notable_id: number;
  note: string;
  added_by: number | null;
  added_on: string;
}

export interface CrmSetting {
  id: number;
  campaign_naming_by: string | null;
  allow_lead_duplication_based_on_emails: boolean;
  auto_creation_of_contact: boolean;
  close_opportunity_after_days: number | null;
  default_valid_till: number | null;
  carry_forward_communication_and_comments: boolean;
}

export interface DashboardStats {
  leads: {
    total: number;
    new_last_30_days: number;
    by_status: Array<{ status: string; count: number }>;
    by_qualification: Array<{ qualification_status: string; count: number }>;
  };
  opportunities: {
    total: number;
    open: number;
    won_last_30_days: number;
    total_value: number;
    by_status: Array<{ status: string; count: number }>;
    by_stage: Array<{ stage_name: string; count: number; total_value: number }>;
  };
  appointments: {
    total: number;
    upcoming: number;
  };
  contracts: {
    active: number;
    unsigned: number;
  };
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}
