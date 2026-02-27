import { TaskSource, TaskType } from './Task';

export interface SourceDetail {
    id: number;
    // Lead fields
    first_name?: string;
    last_name?: string;
    email?: string;
    // Prospect fields
    company_name?: string;
    // Opportunity fields
    naming_series?: string;
    party_name?: string;
    opportunity_amount?: number;
}

export interface SalesTask {
    id: number;
    task_source_id: number;
    source_id: number | null;
    task_type_id: number;
    sales_assign_id: number | null;
    formatted_date?: string;
    task_source?: TaskSource;
    task_type?: TaskType;
    assigned_user?: {
        id: number;
        name: string;
        email: string;
    };
    source_detail?: SourceDetail | null;
    created_at: string;
    updated_at: string;
}
