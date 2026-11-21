import axiosInstance from './axiosInstance';
import { apiRoot } from '../pages/Home/AgentAnalysis/agentResults';

export const GAA_ENABLED = import.meta.env.VITE_GAA_ENABLED === 'true';
const options = signal => ({ baseURL: apiRoot(axiosInstance.defaults.baseURL), signal, timeout: 185000 });
export async function getGaaContext({ signal } = {}) {
  return (await axiosInstance.get('/api/webdoc/context', options(signal))).data;
}
export async function askAgent(question, { signal } = {}) {
  return (await axiosInstance.post('/api/webdoc/ask', { question }, options(signal))).data;
}
export async function exportResult(resultId, format, { signal, chartIndex = 0 } = {}) {
  return axiosInstance.post(`/api/webdoc/results/${encodeURIComponent(resultId)}/export`, null,
    { ...options(signal), params: { format, chartIndex }, responseType: 'blob' });
}
