export const getAuthToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'API Error');
  }
  return response.json();
};

const API_BASE = 'http://localhost:3000/api';

// Courses
export const getCourses = () => fetchWithAuth(`${API_BASE}/admin/course`);
export const getCourseById = (id: string) => fetchWithAuth(`${API_BASE}/admin/course/${id}`);
export const createCourse = (data: { name: string, description: string }) => 
  fetchWithAuth(`${API_BASE}/admin/course`, { method: 'POST', body: JSON.stringify(data) });

// Batches
export const getBatchByCourse = (courseId: string) => fetchWithAuth(`${API_BASE}/admin/batches/course/${courseId}`);
export const getBatchById = (id: string) => fetchWithAuth(`${API_BASE}/admin/batches/${id}`);
export const createBatch = (data: { name: string, course: string }) => 
  fetchWithAuth(`${API_BASE}/admin/batches`, { method: 'POST', body: JSON.stringify(data) });
export const addStudentToBatch = (batchId: string, studentId: string) => 
  fetchWithAuth(`${API_BASE}/admin/batches/${batchId}/add-student`, { method: 'POST', body: JSON.stringify({ studentId }) });
export const addTutorToBatch = (batchId: string, tutorId: string) => 
  fetchWithAuth(`${API_BASE}/admin/batches/${batchId}/add-tutor`, { method: 'POST', body: JSON.stringify({ tutorId }) });

// Users (Students & Tutors)
export const getAllStudents = () => fetchWithAuth(`${API_BASE}/admin/students`);
export const getAllTutors = () => fetchWithAuth(`${API_BASE}/admin/tutors`);
