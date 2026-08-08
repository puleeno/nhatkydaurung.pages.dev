const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://daurung-api.puleeno.workers.dev';
const USER_ID = 'default-user'; // In production, this would come from auth

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-User-ID': USER_ID,
});

export const api = {
  // Logs
  async getLogs() {
    const response = await fetch(`${API_BASE_URL}/api/logs`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch logs');
    const data = await response.json();
    return data.logs || [];
  },

  async getLog(date: string) {
    const response = await fetch(`${API_BASE_URL}/api/logs/${date}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch log');
    const data = await response.json();
    return data.log;
  },

  async saveLog(log: any) {
    const response = await fetch(`${API_BASE_URL}/api/logs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(log),
    });
    if (!response.ok) throw new Error('Failed to save log');
    return response.json();
  },

  async deleteLog(date: string) {
    const response = await fetch(`${API_BASE_URL}/api/logs/${date}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete log');
    return response.json();
  },

  // Cycles
  async getCycles() {
    const response = await fetch(`${API_BASE_URL}/api/cycles`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cycles');
    const data = await response.json();
    return data.cycles || [];
  },

  async getCycle(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/cycles/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cycle');
    const data = await response.json();
    return data.cycle;
  },

  async createCycle(cycle: any) {
    const response = await fetch(`${API_BASE_URL}/api/cycles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(cycle),
    });
    if (!response.ok) throw new Error('Failed to create cycle');
    return response.json();
  },

  async updateCycle(id: string, cycle: any) {
    const response = await fetch(`${API_BASE_URL}/api/cycles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(cycle),
    });
    if (!response.ok) throw new Error('Failed to update cycle');
    return response.json();
  },

  async deleteCycle(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/cycles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete cycle');
    return response.json();
  },

  // Settings
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    const data = await response.json();
    return data.settings;
  },

  async saveSettings(settings: any) {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to save settings');
    return response.json();
  },

  async verifyPasscode(passcode: string) {
    const response = await fetch(`${API_BASE_URL}/api/settings/verify-passcode`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ passcode }),
    });
    if (!response.ok) throw new Error('Failed to verify passcode');
    return response.json();
  },
};
