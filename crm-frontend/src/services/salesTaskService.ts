import axios from 'axios';
import { SalesTask } from '../types/SalesTask';

const API_URL = import.meta.env.VITE_API_URL;

export const salesTaskService = {
    getAll: async (): Promise<SalesTask[]> => {
        const response = await axios.get(`${API_URL}/sales-tasks`);
        return response.data;
    },

    getById: async (id: number): Promise<SalesTask> => {
        const response = await axios.get(`${API_URL}/sales-tasks/${id}`);
        return response.data;
    },

    create: async (data: Partial<SalesTask>): Promise<SalesTask> => {
        const response = await axios.post(`${API_URL}/sales-tasks`, data);
        return response.data;
    },

    update: async (id: number, data: Partial<SalesTask>): Promise<SalesTask> => {
        const response = await axios.put(`${API_URL}/sales-tasks/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/sales-tasks/${id}`);
    },

    getSources: async () => {
        const response = await axios.get(`${API_URL}/task-sources`);
        return response.data;
    },

    getTypes: async () => {
        const response = await axios.get(`${API_URL}/task-types`);
        return response.data;
    }
};
