// Client-side API fetch client for ShareVerse

const API_BASE = '/api';

// Core request wrapper
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Set headers
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine if body is FormData (for uploads)
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Auto logout if unauthorized (401) on non-auth routes
      if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
          window.location.href = '/login.html';
        }
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// API Services
const api = {
  // Authentication
  auth: {
    async register(formData) {
      return request('/auth/register', {
        method: 'POST',
        body: formData // FormData containing name, username, email, password, profilePicture
      });
    },
    async login(emailOrUsername, password) {
      return request('/auth/login', {
        method: 'POST',
        body: { emailOrUsername, password }
      });
    },
    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch (err) {
        // Continue clearing even if server request fails
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    },
    async getMe() {
      return request('/auth/me', { method: 'GET' });
    }
  },

  // Users
  users: {
    async getProfile(username) {
      return request(`/users/profile/${username}`, { method: 'GET' });
    },
    async updateProfile(formData) {
      return request('/users/profile', {
        method: 'PUT',
        body: formData // FormData containing name, username, bio, profilePicture
      });
    },
    async search(query) {
      return request(`/users/search?q=${encodeURIComponent(query)}`, { method: 'GET' });
    }
  },

  // Posts
  posts: {
    async create(formData) {
      return request('/posts', {
        method: 'POST',
        body: formData // FormData containing caption, media file
      });
    },
    async getAll() {
      return request('/posts', { method: 'GET' });
    },
    async getUserPosts(username) {
      return request(`/posts/user/${username}`, { method: 'GET' });
    },
    async getSingle(id) {
      return request(`/posts/${id}`, { method: 'GET' });
    },
    async edit(id, caption) {
      return request(`/posts/${id}`, {
        method: 'PUT',
        body: { caption }
      });
    },
    async delete(id) {
      return request(`/posts/${id}`, { method: 'DELETE' });
    },
    async toggleLike(id) {
      return request(`/posts/${id}/like`, { method: 'POST' });
    }
  },

  // Comments
  comments: {
    async add(postId, text) {
      return request(`/comments/${postId}`, {
        method: 'POST',
        body: { text }
      });
    },
    async get(postId) {
      return request(`/comments/${postId}`, { method: 'GET' });
    },
    async delete(id) {
      return request(`/comments/${id}`, { method: 'DELETE' });
    }
  },

  // Follow
  follow: {
    async toggleFollow(userId) {
      return request(`/follow/${userId}`, { method: 'POST' });
    },
    async getFollowers(userId) {
      return request(`/follow/${userId}/followers`, { method: 'GET' });
    },
    async getFollowing(userId) {
      return request(`/follow/${userId}/following`, { method: 'GET' });
    }
  }
};
