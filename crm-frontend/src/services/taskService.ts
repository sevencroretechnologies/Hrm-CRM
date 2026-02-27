import axios from 'axios';
import { Task, TaskSource, TaskType } from '../types/Task';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const taskService = {
    getAll: async (): Promise<Task[]> => {
        const response = await axios.get(`${API_URL}/tasks`);
        return response.data;
    },

    getById: async (id: number): Promise<Task> => {
        const response = await axios.get(`${API_URL}/tasks/${id}`);
        return response.data;
    },

    create: async (task: Partial<Task>): Promise<Task> => {
        const response = await axios.post(`${API_URL}/tasks`, task);
        return response.data;
    },

    update: async (id: number, task: Partial<Task>): Promise<Task> => {
        const response = await axios.put(`${API_URL}/tasks/${id}`, task);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/tasks/${id}`);
    },

    getSources: async (): Promise<TaskSource[]> => {
        const response = await axios.get(`${API_URL}/task-sources`);
        return response.data;
    },

    getTypes: async (): Promise<TaskType[]> => {
        const response = await axios.get(`${API_URL}/task-types`);
        return response.data;
    }
};
