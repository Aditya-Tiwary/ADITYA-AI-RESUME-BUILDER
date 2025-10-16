const API_BASE_URL = '';

class AuthService {
  async login(username, password) {
    console.log('Attempting login for user:', username);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    console.log('Login response status:', response.status);
    console.log('Login response headers:', Object.fromEntries(response.headers.entries()));
    const data = await response.json();
    console.log('Login response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.token) {
      try {
        localStorage.setItem('authToken', data.token);
        console.log('Token stored in localStorage for development:', data.token.substring(0, 20) + '...');
        const storedToken = localStorage.getItem('authToken');
        console.log('Verification - token retrieved from localStorage:', storedToken ? 'present' : 'missing');
        if (storedToken) {
          console.log('✅ localStorage token storage successful');
        } else {
          console.error('❌ localStorage token storage failed');
        }
      } catch (error) {
        console.error('localStorage error during token storage:', error);
      }
    }

    return data;
  }

  async signup(userData) {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    if (data.token) {
      localStorage.setItem('authToken', data.token);
      console.log('Signup token stored in localStorage for development:', data.token.substring(0, 20) + '...');
      const storedToken = localStorage.getItem('authToken');
      console.log('Signup verification - token retrieved from localStorage:', storedToken ? 'present' : 'missing');
    }

    return data;
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    localStorage.removeItem('authToken');

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return await response.json();
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Checking auth status - localStorage token:', token ? 'present' : 'missing');
      console.log('Checking current user authentication...');
      
      if (!token) {
        console.log('No localStorage token found, will try cookies');
      } else {
        console.log('Using stored token for authentication check');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using Authorization header with token');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Auth check response status:', response.status);
      const data = await response.json();
      console.log('Auth check response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated - no valid session');
        }
        throw new Error(data.error || 'Failed to get user data');
      }

      console.log('User authenticated successfully:', data.user?.username);
      return data.user;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Authentication check error:', error);
      }
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Unable to connect to server');
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw error;
    }
  }

  async updateProfile(profileData) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Profile update failed');
    }

    return data;
  }

  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Password change failed');
    }

    return data;
  }
}

export const authService = new AuthService();