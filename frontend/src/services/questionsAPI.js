import api from './api';

// Separate endpoint for incrementing question views
export const incrementView = (id) => api.post(`/questions/${id}/view`);
