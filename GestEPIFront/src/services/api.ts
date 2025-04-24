import axios from 'axios';

const API_URL = 'http://localhost:5500/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const epiTypeService = {
    getAll: async () => {
        const response = await api.get('/type-epi');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/type-epi/${id}`);
        return response.data;
    },
    create: async (typeEpi: any) => {
        const response = await api.post('/type-epi', typeEpi);
        return response.data;
    },
    update: async (id: number, typeEpi: any) => {
        const response = await api.put(`/type-epi/${id}`, typeEpi);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/type-epi/${id}`);
        return response.data;
    },
};

export const epiService = {
    getAll: async () => {
        const response = await api.get('/epi');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/epi/${id}`);
        return response.data;
    },
    create: async (epi: any) => {
        const response = await api.post('/epi', epi);
        return response.data;
    },
    update: async (id: number, epi: any) => {
        const response = await api.put(`/epi/${id}`, epi);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/epi/${id}`);
        return response.data;
    },
    getAlerts: async (daysThreshold?: number) => {
        const params = daysThreshold ? { daysThreshold } : {};
        const response = await api.get('/epi/alerts', { params });
        return response.data;
    },
};

export const controlService = {
    getAll: async () => {
        const response = await api.get('/controles');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/controles/${id}`);
        return response.data;
    },
    getByEpiId: async (epiId: number) => {
        const response = await api.get(`/controles/epi/${epiId}`);
        return response.data;
    },
    create: async (controle: any) => {
        const response = await api.post('/controles', controle);
        return response.data;
    },
    update: async (id: number, controle: any) => {
        const response = await api.put(`/controles/${id}`, controle);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/controles/${id}`);
        return response.data;
    },
};

export const controlStatusService = {
    getAll: async () => {
        const response = await api.get('/statut-controles');
        return response.data;
    },
};

export const managerService = {
    getAll: async () => {
        const response = await api.get('/gestionnaires');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/gestionnaires/${id}`);
        return response.data;
    },
    create: async (gestionnaire: any) => {
        const response = await api.post('/gestionnaires', gestionnaire);
        return response.data;
    },
    update: async (id: number, gestionnaire: any) => {
        const response = await api.put(`/gestionnaires/${id}`, gestionnaire);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/gestionnaires/${id}`);
        return response.data;
    },
};

export default { epiTypeService, epiService, controlService, controlStatusService, managerService };