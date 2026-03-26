const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  submitSpending: (data: object) =>
    request('/spending/', { method: 'POST', body: JSON.stringify(data) }),
  getSpendingHistory: () =>
    request<{ entries: any[]; message?: string }>('/spending/'),
  getInflationHistory: () =>
    request<{ history: any[] }>('/inflation/history/all'),
  getInflation: (month: string) =>
    request<any>(`/inflation/${month}`),
  getForecast: (category: string, periods = 6) =>
    request<any>(`/forecast/${category}?periods=${periods}`),
  getAnomalies: (method = 'zscore') =>
    request<any>(`/anomaly/?method=${method}`),
  getInsights: () =>
    request<{ insights: any[]; month: string }>('/insights/'),
  simulateWhatIf: (data: object) =>
    request<any>('/whatif/', { method: 'POST', body: JSON.stringify(data) }),
  getVulnerabilityScore: () =>
    request<any>('/vulnerability/'),
  getBusinessSectors: () =>
    request<any>('/business/sectors'),
  getBusinessInflation: (data: object) =>
    request<any>('/business/inflation', { method: 'POST', body: JSON.stringify(data) }),
}
