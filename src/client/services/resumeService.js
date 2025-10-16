const API_BASE_URL = '';

class ResumeService {
  async getResumes() {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/resumes`, {
      credentials: 'include',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch resumes');
    }

    return data.resumes;
  }

  async getResume(resumeId) {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
      credentials: 'include',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !token) {
        throw new Error('Resume not found or access denied');
      }
      throw new Error(data.error || 'Failed to fetch resume');
    }

    return data.resume;
  }

  async saveResume(resumeData, title, template, theme) {
    try {
      console.log('=== Resume Save Debug ===');
      console.log('Attempting to save resume to:', `${API_BASE_URL}/api/resumes/save`);
      console.log('Resume data size:', JSON.stringify({ resumeData, title, template, theme }).length);
      console.log('Browser cookies:', document.cookie);
      
      try {
        const authDebugResponse = await fetch(`${API_BASE_URL}/api/auth/debug`, {
          credentials: 'include',
        });
        const authDebugData = await authDebugResponse.json();
        console.log('Auth debug info:', authDebugData);
      } catch (debugError) {
        console.log('Auth debug failed:', debugError);
      }
      
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/resumes/save`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          resumeData,
          title,
          template,
          theme
        }),
      });

      console.log('Save response status:', response.status);
      console.log('Save response headers:', Object.fromEntries(response.headers.entries()));
      const data = await response.json();
      console.log('Save response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in to save your resume.');
        } else if (response.status === 503) {
          throw new Error('Database connection error. Please try again later.');
        } else if (response.status === 400) {
          if (data.details && Array.isArray(data.details)) {
            const detailedErrors = data.details.map(err => `${err.field}: ${err.message}`).join('\n');
            throw new Error(`Validation failed:\n${detailedErrors}`);
          }
          throw new Error(data.error || 'Invalid data provided. Please check your resume information.');
        } else if (response.status === 409) {
          throw new Error('Duplicate resume detected. Please try saving with a different title.');
        }
        throw new Error(data.error || `Server error (${response.status}): Failed to save resume`);
      }

      return data;
    } catch (error) {
      console.error('Resume save error details:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  async updateResume(resumeId, resumeData, title, template, theme) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        resumeData,
        title,
        template,
        theme
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update resume');
    }

    return data;
  }

  async deleteResume(resumeId) {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete resume');
    }

    return data;
  }

  async duplicateResume(resumeId) {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/duplicate`, {
      method: 'POST',
      credentials: 'include',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to duplicate resume');
    }

    return data;
  }

  async autoSaveResume(resumeData, resumeId = null, title, template, theme) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/resumes/auto-save`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        resumeData,
        resumeId,
        title,
        template,
        theme
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to auto-save resume');
    }

    return data;
  }

  async checkOwnership(resumeId) {
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/ownership`, {
      credentials: 'include',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to check ownership');
    }

    return data.ownsResume;
  }
}

export const resumeService = new ResumeService();