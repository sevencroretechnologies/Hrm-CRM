export interface TaskSource {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface TaskType {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    task_source_id: number;
    task_type_id: number;
    related_id: number;
    due_date: string;
    status: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    task_source?: TaskSource;
    task_type?: TaskType;
    user?: any;
}
