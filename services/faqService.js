import api from './api';

export const getFaqs = async () => {
    const response = await api.get('/api/faqs');
    return response.data;
};

export const getAdminFaqs = async () => {
    const response = await api.get('/api/faqs/admin');
    return response.data;
};

export const createFaq = async (faqData) => {
    const response = await api.post('/api/faqs/admin', faqData);
    return response.data;
};

export const updateFaq = async (id, faqData) => {
    const response = await api.put(`/api/faqs/admin/${id}`, faqData);
    return response.data;
};

export const deleteFaq = async (id) => {
    const response = await api.delete(`/api/faqs/admin/${id}`);
    return response.data;
};

export const seedFaqs = async () => {
    const response = await api.post('/api/faqs/admin/seed');
    return response.data;
}
