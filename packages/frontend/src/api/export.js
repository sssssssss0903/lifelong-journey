import api from './request';

export const startExport = (params) => api.get('/api/exports/start', { params });
export const getExportStatus = (jobId) => api.get(`/api/exports/status/${jobId}`);
export const downloadExport = (jobId) =>
  api.get(`/api/exports/download/${jobId}`, { responseType: 'blob' });
