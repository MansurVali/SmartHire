import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/companies/register', data),
};

export const jobAPI = {
  getAll:  ()       => api.get('/jobs'),
  getById: (id)     => api.get(`/jobs/${id}`),
  create:  (data)   => api.post('/jobs', data),
  update:  (id, d)  => api.put(`/jobs/${id}`, d),
  delete:  (id)     => api.delete(`/jobs/${id}`),
};

export const candidateAPI = {
  getAll:        ()           => api.get('/candidates'),
  getByJob:      (jobId)      => api.get(`/candidates/job/${jobId}`),
  getById:       (id)         => api.get(`/candidates/${id}`),
  submit:        (data)       => api.post('/candidates', data),
  updateStatus:  (id, status, rejectionReason) =>
    api.put(`/candidates/${id}/status`, { status, rejectionReason }),
  dashboard:     ()           => api.get('/candidates/dashboard'),
};

export default api;
