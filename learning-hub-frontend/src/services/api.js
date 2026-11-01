const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Central API helper.
 * UI pages should call functions in this file rather than hardcoding URLs.
 * Level 1 uses mock data; real requests will be enabled during Level 2.
 */
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    }
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.message
      ? payload.message
      : 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return payload
}

export const authApi = {
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) })
}

export const courseApi = {
  getAll: () => apiRequest('/courses'),
  getById: (id) => apiRequest(`/courses/${id}`),
  enroll: (id) => apiRequest(`/courses/${id}/enroll`, { method: 'POST' })
}
