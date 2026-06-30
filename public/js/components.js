// Shared UI Components & Shell Manager for ShareVerse

// 1. Toast Notification System
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  // Automatically remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s reverse';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// 2. Authentication Route Protection Guard
function checkAuthGuard() {
  const token = localStorage.getItem('token');
  const path = window.location.pathname;
  const isAuthPage = path.endsWith('login.html') || path.endsWith('register.html');

  if (!token && !isAuthPage) {
    window.location.href = '/login.html';
  } else if (token && isAuthPage) {
    window.location.href = '/index.html';
  }
}

// Run auth check immediately
checkAuthGuard();

// 3. Inject Layout Elements (Navbar & Sidebar)
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return; // Skip layout injection for public auth pages

  let currentUser = {};
  try {
    currentUser = JSON.parse(localStorage.getItem('user')) || {};
  } catch (err) {
    currentUser = {};
  }

  const userAvatar = currentUser.profilePicture || '/uploads/profiles/default.png';
  const userUsername = currentUser.username || 'profile';

  // A. Inject Navbar
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    navbarPlaceholder.innerHTML = `
      <nav class="navbar">
        <a href="/index.html" class="logo">Share<span>Verse</span></a>
        <div class="nav-links">
          <a href="/profile.html?username=${userUsername}" class="nav-user">
            <img src="${userAvatar}" alt="${userUsername}" class="nav-avatar" onerror="this.src='/uploads/profiles/default.png'">
            <span>${currentUser.name || 'User'}</span>
          </a>
        </div>
      </nav>
    `;
  }

  // B. Inject Sidebar
  const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
  if (sidebarPlaceholder) {
    const currentPath = window.location.pathname;
    const isFeedActive = currentPath.endsWith('index.html') || currentPath.endsWith('/') ? 'active' : '';
    const isSearchActive = currentPath.endsWith('search.html') ? 'active' : '';
    const isProfileActive = currentPath.endsWith('profile.html') && window.location.search.includes(userUsername) ? 'active' : '';
    const isEditProfileActive = currentPath.endsWith('edit-profile.html') ? 'active' : '';

    sidebarPlaceholder.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-menu">
          <a href="/index.html" class="sidebar-item ${isFeedActive}">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            Feed
          </a>
          <a href="/search.html" class="sidebar-item ${isSearchActive}">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            Search Users
          </a>
          <a href="/profile.html?username=${userUsername}" class="sidebar-item ${isProfileActive}">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Profile
          </a>
          <a href="/edit-profile.html" class="sidebar-item ${isEditProfileActive}">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            Edit Profile
          </a>
          <a href="#" id="sidebar-logout-btn" class="sidebar-item">
            <svg viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.3 2.7l-1.4 1.4c1.5 1.5 2.5 3.6 2.5 5.9 0 4.4-3.6 8-8 8s-8-3.6-8-8c0-2.3 1-4.4 2.5-5.9L5 5.7C3.1 7.5 2 10.1 2 13c0 5.5 4.5 10 10 10s10-4.5 10-10c0-2.9-1.1-5.5-3-7.3z"/></svg>
            Logout
          </a>
        </div>
        <div class="sidebar-user">
          <img src="${userAvatar}" alt="${userUsername}" class="sidebar-avatar" onerror="this.src='/uploads/profiles/default.png'">
          <div class="sidebar-user-info">
            <span class="sidebar-name">${currentUser.name || 'User'}</span>
            <span class="sidebar-username">@${userUsername}</span>
          </div>
        </div>
      </aside>
    `;

    // Hook Logout trigger
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        api.auth.logout();
      });
    }
  }
});
