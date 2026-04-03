export const getAuthToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  if (!token) {
    window.location.href = '/login';
    throw new Error('No token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
    throw new Error('Token expired or unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'API Error');
  }
  return response.json();
};

const API_BASE = 'https://lms-backend-ivory-one.vercel.app/api';

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

// Lectures & S3
export const getCourseLectures = (courseId: string) => fetchWithAuth(`${API_BASE}/admin/courses/${courseId}/lectures`);
export const getLectureUploadUrl = (data: { courseId: string, fileName: string, contentType: string, title: string, description: string, order?: number }) =>
  fetchWithAuth(`${API_BASE}/admin/lectures/upload-url`, { method: 'POST', body: JSON.stringify(data) });
export const updateCourseLecture = (lectureId: string, data: { title?: string; description?: string; order?: number }) =>
  fetchWithAuth(`${API_BASE}/admin/lectures/${lectureId}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteCourseLecture = (lectureId: string) =>
  fetchWithAuth(`${API_BASE}/admin/lectures/${lectureId}`, { method: 'DELETE' });

export const uploadFileToS3 = async (url: string, file: File, onProgress?: (pct: number) => void) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        reject(new Error(`S3 Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Direct S3 upload was blocked by the browser or network'));
    xhr.send(file);
  });
};

export const uploadLectureViaApi = async (
  lectureId: string,
  file: File,
  onProgress?: (pct: number) => void
) => {
  const token = getAuthToken();

  if (!token) {
    window.location.href = '/login';
    throw new Error('No token found');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${API_BASE}/admin/lectures/${lectureId}/upload`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else if (xhr.status === 401) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
        reject(new Error('Token expired or unauthorized'));
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          reject(new Error(response.message || 'Backend upload failed'));
        } catch {
          reject(new Error(`Backend upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Backend upload failed to process'));
    xhr.send(file);
  });
};

// Users (Students & Tutors)
export const getAllStudents = () => fetchWithAuth(`${API_BASE}/admin/students`);
export const getAllTutors = () => fetchWithAuth(`${API_BASE}/admin/tutors`);

// Student Video Progress (for admin & tutor)
export const getBatchStudentVideoProgress = (batchId: string) =>
  fetchWithAuth(`${API_BASE}/admin/batches/${batchId}/student-video-progress`);

// Tutor Endpoints
export const getTutorBatches = () => fetchWithAuth(`${API_BASE}/tutor/batches`);
export const getTutorBatchById = (id: string) => fetchWithAuth(`${API_BASE}/tutor/batches/${id}`);
export const getTutorBatchAssignments = (batchId: string) => fetchWithAuth(`${API_BASE}/tutor/batches/${batchId}/assignments`);
export const createTutorAssignment = (batchId: string, data: { name: string, description: string, dueDate: string, maxMarks: number }) =>
  fetchWithAuth(`${API_BASE}/tutor/batches/${batchId}/assignments`, { method: 'POST', body: JSON.stringify({ ...data, batch: batchId }) });
export const updateTutorAssignment = (batchId: string, assignmentId: string, data: { name?: string; description?: string; dueDate?: string; maxMarks?: number }) =>
  fetchWithAuth(`${API_BASE}/tutor/batches/${batchId}/assignments/${assignmentId}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTutorAssignment = (batchId: string, assignmentId: string) =>
  fetchWithAuth(`${API_BASE}/tutor/batches/${batchId}/assignments/${assignmentId}`, { method: 'DELETE' });

// Tutor Student Video Progress
export const getTutorBatchStudentVideoProgress = (batchId: string) =>
  fetchWithAuth(`${API_BASE}/tutor/batches/${batchId}/student-video-progress`);

// Tutor Attendance
export const getTutorBatchSessions = (batchId: string, date?: string) => {
  const url = date
    ? `${API_BASE}/tutor/batches/${batchId}/sessions?date=${date}`
    : `${API_BASE}/tutor/batches/${batchId}/sessions`;
  return fetchWithAuth(url);
};
export const createTutorClassSession = (batchId: string) =>
  fetchWithAuth(`${API_BASE}/tutor/batches/${batchId}/sessions`, { method: 'POST' });
export const updateTutorAttendance = (batchId: string, sessionId: string, studentId: string, status: string) =>
  fetchWithAuth(`${API_BASE}/tutor/batches/${batchId}/sessions/${sessionId}`, { method: 'PATCH', body: JSON.stringify({ studentId, status }) });
export const getBatchStudentStats = (batchId: string) => fetchWithAuth(`${API_BASE}/tutor/batches/${batchId}/student-stats`);
