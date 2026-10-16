/**
 * CricketBuddy — Frontend Application Core (Vanilla JS SPA)
 * Complete CRUD, Role-Based Access Control (RBAC), Dark/Light Theming,
 * Animated Dashboard, and Express REST API Integration.
 */

// ==========================================================================
// 1. Global Application State
// ==========================================================================
const state = {
    currentView: 'dashboard',
    currentUser: {
        username: 'Administrator',
        role: 'admin', // 'admin' | 'viewer'
        token: 'cb_mock_jwt_token_admin_2026'
    },
    theme: 'dark',
    dbConnected: false,
    loading: false,
    searchQuery: '',
    roleFilter: '',
    teamFilter: '',
    teams: [],
    players: [],
    stadiums: [],
    matches: [],
    sponsors: [],
    umpires: [],
    scorecards: [],
    statistics: null
};

// ==========================================================================
// 2. REST API Client
// ==========================================================================
const api = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.currentUser.token}`,
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
                try {
                    const errData = await response.json();
                    if (errData.error || errData.message) {
                        errorMsg = errData.error || errData.message;
                    }
                } catch (e) {
                    // Not a json error response
                }
                throw new Error(errorMsg);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error(`[API Error ${endpoint}]:`, error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error("Cannot connect to backend server. Make sure 'node server.js' is running!");
            }
            throw error;
        }
    },

    // Health
    getHealth() { return this.request('/api/health'); },

    // Teams CRUD
    getTeams() { return this.request('/api/teams'); },
    createTeam(data) {
        return this.request('/api/teams', { method: 'POST', body: JSON.stringify(data) });
    },
    updateTeam(id, data) {
        return this.request(`/api/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteTeam(id) {
        return this.request(`/api/teams/${id}`, { method: 'DELETE' });
    },

    // Players CRUD
    getPlayers() { return this.request('/api/players'); },
    createPlayer(data) {
        return this.request('/api/players', { method: 'POST', body: JSON.stringify(data) });
    },
    updatePlayer(id, data) {
        return this.request(`/api/players/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deletePlayer(id) {
        return this.request(`/api/players/${id}`, { method: 'DELETE' });
    },

    // Stadiums CRUD
    getStadiums() { return this.request('/api/stadiums'); },
    createStadium(data) {
        return this.request('/api/stadiums', { method: 'POST', body: JSON.stringify(data) });
    },
    updateStadium(id, data) {
        return this.request(`/api/stadiums/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteStadium(id) {
        return this.request(`/api/stadiums/${id}`, { method: 'DELETE' });
    },

    // Sponsors CRUD
    getSponsors() { return this.request('/api/sponsors'); },
    createSponsor(data) {
        return this.request('/api/sponsors', { method: 'POST', body: JSON.stringify(data) });
    },
    updateSponsor(id, data) {
        return this.request(`/api/sponsors/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteSponsor(id) {
        return this.request(`/api/sponsors/${id}`, { method: 'DELETE' });
    },

    // Matches CRUD
    getMatches() { return this.request('/api/matches'); },
    createMatch(data) {
        return this.request('/api/matches', { method: 'POST', body: JSON.stringify(data) });
    },
    updateMatch(id, data) {
        return this.request(`/api/matches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteMatch(id) {
        return this.request(`/api/matches/${id}`, { method: 'DELETE' });
    },

    // Umpires CRUD
    getUmpires() { return this.request('/api/umpires'); },
    createUmpire(data) {
        return this.request('/api/umpires', { method: 'POST', body: JSON.stringify(data) });
    },
    updateUmpire(id, data) {
        return this.request(`/api/umpires/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteUmpire(id) {
        return this.request(`/api/umpires/${id}`, { method: 'DELETE' });
    },

    // Scorecards CRUD
    getScorecards() { return this.request('/api/scorecards'); },
    createScorecard(data) {
        return this.request('/api/scorecards', { method: 'POST', body: JSON.stringify(data) });
    },
    updateScorecard(id, data) {
        return this.request(`/api/scorecards/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteScorecard(id) {
        return this.request(`/api/scorecards/${id}`, { method: 'DELETE' });
    },

    // Statistics
    getStatistics() { return this.request('/api/statistics'); }
};

// ==========================================================================
// 3. Theme Switcher (Dark / Light)
// ==========================================================================
const themeManager = {
    init() {
        const savedTheme = localStorage.getItem('cb_theme') || 'dark';
        this.setTheme(savedTheme);

        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    setTheme(themeName) {
        state.theme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('cb_theme', themeName);
    },

    toggle() {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
        showToast(`Theme switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
        refreshIcons();
    }
};

// ==========================================================================
// 4. Authentication & Role-Based Access Control (RBAC)
// ==========================================================================
const authManager = {
    init() {
        try {
            const saved = localStorage.getItem('cb_auth');
            if (saved) {
                state.currentUser = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to parse stored auth session:', e);
        }

        this.updateUI();
        this.bindEvents();
    },

    save() {
        localStorage.setItem('cb_auth', JSON.stringify(state.currentUser));
        this.updateUI();
        renderCurrentView();
    },

    isAdmin() {
        return state.currentUser && state.currentUser.role === 'admin';
    },

    requireAdmin(actionCallback) {
        if (this.isAdmin()) {
            if (typeof actionCallback === 'function') actionCallback();
            return true;
        } else {
            showToast('Admin privilege required! Please log in as Admin.', 'warning');
            this.openAuthModal();
            return false;
        }
    },

    login(username, role) {
        state.currentUser = {
            username: username || (role === 'admin' ? 'Administrator' : 'Guest Viewer'),
            role: role || 'viewer',
            token: `cb_mock_jwt_${role}_${Date.now()}`
        };
        this.save();
        this.closeAuthModal();
        showToast(`Signed in successfully as ${role.toUpperCase()}`, 'success');
    },

    logout() {
        state.currentUser = {
            username: 'Guest Viewer',
            role: 'viewer',
            token: null
        };
        this.save();
        showToast('Logged out. Switched to Viewer mode.', 'info');
    },

    updateUI() {
        const roleLabel = document.getElementById('sidebarRoleLabel');
        const roleDot = document.querySelector('.role-status-dot');
        const headerName = document.getElementById('headerUserName');
        const headerBadge = document.getElementById('headerRoleBadge');
        const headerAvatar = document.getElementById('headerAvatar');
        const dropdownName = document.getElementById('dropdownName');
        const dropdownRoleDesc = document.getElementById('dropdownRoleDesc');
        const authActionLabel = document.getElementById('authActionLabel');

        const isAdmin = this.isAdmin();

        if (roleLabel) roleLabel.textContent = isAdmin ? 'Admin' : 'Viewer';
        if (roleDot) {
            roleDot.className = `role-status-dot ${isAdmin ? 'admin-dot' : 'viewer-dot'}`;
        }

        if (headerName) headerName.textContent = state.currentUser.username;
        if (headerBadge) {
            headerBadge.textContent = isAdmin ? 'ADMIN' : 'VIEWER';
            headerBadge.className = `user-badge ${isAdmin ? 'admin-badge' : 'viewer-badge'}`;
        }
        if (headerAvatar) {
            headerAvatar.textContent = isAdmin ? 'AD' : 'VW';
        }
        if (dropdownName) dropdownName.textContent = state.currentUser.username;
        if (dropdownRoleDesc) {
            dropdownRoleDesc.textContent = isAdmin ? 'Full CRUD Administrative Access' : 'Read-Only Viewer Access';
        }
        if (authActionLabel) {
            authActionLabel.textContent = isAdmin ? 'Log Out to Viewer' : 'Sign in as Admin';
        }
    },

    bindEvents() {
        // Toggle user dropdown
        const userBtn = document.getElementById('userProfileBtn');
        const dropdown = document.getElementById('userDropdownPanel');
        if (userBtn && dropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            document.addEventListener('click', () => {
                dropdown.classList.remove('show');
            });
        }

        // Quick Role Switchers in dropdown
        document.getElementById('switchAdminBtn')?.addEventListener('click', () => {
            this.login('Administrator', 'admin');
        });
        document.getElementById('switchViewerBtn')?.addEventListener('click', () => {
            this.login('Guest Viewer', 'viewer');
        });

        // Logout/Login action button
        document.getElementById('authActionBtn')?.addEventListener('click', () => {
            if (this.isAdmin()) {
                this.logout();
            } else {
                this.openAuthModal();
            }
        });

        // Auth Modal Handlers
        document.getElementById('closeAuthModalBtn')?.addEventListener('click', () => this.closeAuthModal());
        document.getElementById('quickAdminLogin')?.addEventListener('click', () => this.login('Administrator', 'admin'));
        document.getElementById('quickViewerLogin')?.addEventListener('click', () => this.login('Guest Viewer', 'viewer'));

        document.getElementById('customAuthForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const uname = document.getElementById('authUsername').value.trim();
            const pwd = document.getElementById('authPassword').value;

            if (uname.toLowerCase().includes('admin') || pwd === 'admin123') {
                this.login(uname || 'Administrator', 'admin');
            } else {
                this.login(uname || 'Viewer User', 'viewer');
            }
        });
    },

    openAuthModal() {
        const backdrop = document.getElementById('authModalBackdrop');
        if (backdrop) backdrop.classList.add('active');
        refreshIcons();
    },

    closeAuthModal() {
        const backdrop = document.getElementById('authModalBackdrop');
        if (backdrop) backdrop.classList.remove('active');
    }
};

// ==========================================================================
// 5. Toast Notification System
// ==========================================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = 'check-circle-2';
    if (type === 'error') iconName = 'alert-octagon';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    refreshIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px) scale(0.96)';
        setTimeout(() => toast.remove(), 260);
    }, 3600);
}

// Utility: String escape to prevent XSS
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

// ==========================================================================
// 6. Application Initialization & Navigation
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
    authManager.init();
    initNavigation();
    initGlobalSearch();
    checkDatabaseHealth();
    fetchAllData();

    // Quick refresh button
    document.getElementById('quickRefreshBtn')?.addEventListener('click', () => {
        showToast('Refreshing tournament data...', 'info');
        fetchAllData();
    });

    // Mobile sidebar toggle
    const sidebar = document.getElementById('appSidebar');
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        sidebar?.classList.add('open');
    });
    document.getElementById('sidebarCloseBtn')?.addEventListener('click', () => {
        sidebar?.classList.remove('open');
    });

    // Hash routing
    window.addEventListener('hashchange', handleRoute);
    if (window.location.hash) {
        handleRoute();
    } else {
        window.location.hash = '#dashboard';
    }
});

function initNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            if (window.innerWidth <= 768) {
                document.getElementById('appSidebar')?.classList.remove('open');
            }
        });
    });
}

function handleRoute() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    state.currentView = hash;

    // Update active sidebar nav
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(m => {
        if (m.getAttribute('data-route') === hash) {
            m.classList.add('active');
        } else {
            m.classList.remove('active');
        }
    });

    // Update Header Crumb
    const crumb = document.getElementById('headerCrumb');
    if (crumb) {
        crumb.textContent = hash.charAt(0).toUpperCase() + hash.slice(1);
    }

    renderCurrentView();

    // Sync in-page filter input with active search query
    const topInput = document.getElementById('globalSearchInput');
    const tableInput = document.querySelector('.filter-input');
    if (topInput && tableInput && topInput.value) {
        tableInput.value = topInput.value;
    }
}

// ==========================================================================
// 6.1 Global Search Manager (Live Dropdown Across All Entities)
// ==========================================================================
const globalSearchManager = {
    init() {
        const input = document.getElementById('globalSearchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        const resultsBox = document.getElementById('globalSearchResults');
        if (!input || !resultsBox) return;

        input.addEventListener('input', (e) => {
            const rawVal = e.target.value;
            const query = rawVal.trim();
            if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

            state.searchQuery = query.toLowerCase();

            // Synchronize in-page table filter input if visible
            const tableInput = document.querySelector('.filter-input');
            if (tableInput && tableInput !== document.activeElement) {
                tableInput.value = rawVal;
            }

            // Live filter current view table if on an entity page
            if (state.currentView !== 'dashboard') {
                renderCurrentView();
            }

            if (query.length > 0) {
                this.renderResults(query, resultsBox);
            } else {
                resultsBox.style.display = 'none';
            }
        });

        input.addEventListener('focus', () => {
            const query = input.value.trim();
            if (query.length > 0) {
                this.renderResults(query, resultsBox);
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                clearBtn.style.display = 'none';
                resultsBox.style.display = 'none';
                state.searchQuery = '';
                const tableInput = document.querySelector('.filter-input');
                if (tableInput) tableInput.value = '';
                renderCurrentView();
                input.focus();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-center')) {
                resultsBox.style.display = 'none';
            }
        });

        // Keyboard navigation & shortcuts: '/' to focus, 'Escape' to close
        window.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== input && !document.activeElement.matches('input, select, textarea')) {
                e.preventDefault();
                input.focus();
                input.select();
            }
            if (e.key === 'Escape') {
                resultsBox.style.display = 'none';
                if (document.activeElement === input) {
                    input.blur();
                }
            }
        });
    },

    searchAll(query) {
        const q = query.toLowerCase();

        // 1. Teams
        const teams = state.teams.filter(t =>
            (t.TeamName && t.TeamName.toLowerCase().includes(q)) ||
            (t.Coach && t.Coach.toLowerCase().includes(q)) ||
            (t.HomeGround && t.HomeGround.toLowerCase().includes(q)) ||
            (t.Owner && t.Owner.toLowerCase().includes(q))
        );

        // 2. Players
        const players = state.players.filter(p =>
            (p.PlayerName && p.PlayerName.toLowerCase().includes(q)) ||
            (p.Role && p.Role.toLowerCase().includes(q)) ||
            (p.Nationality && p.Nationality.toLowerCase().includes(q)) ||
            (p.TeamName && p.TeamName.toLowerCase().includes(q))
        );

        // 3. Stadiums
        const stadiums = state.stadiums.filter(s =>
            (s.StadiumName && s.StadiumName.toLowerCase().includes(q)) ||
            (s.City && s.City.toLowerCase().includes(q))
        );

        // 4. Sponsors
        const sponsors = state.sponsors.filter(s =>
            (s.SponsorName && s.SponsorName.toLowerCase().includes(q)) ||
            (s.Industry && s.Industry.toLowerCase().includes(q)) ||
            (s.TeamName && s.TeamName.toLowerCase().includes(q))
        );

        // 5. Matches
        const matches = state.matches.filter(m =>
            (m.MatchType && m.MatchType.toLowerCase().includes(q)) ||
            (m.StadiumName && m.StadiumName.toLowerCase().includes(q)) ||
            (m.Result && m.Result.toLowerCase().includes(q)) ||
            String(m.MatchID).includes(q)
        );

        // 6. Umpires
        const umpires = state.umpires.filter(u =>
            (u.UmpireName && u.UmpireName.toLowerCase().includes(q)) ||
            (u.Country && u.Country.toLowerCase().includes(q))
        );

        return { teams, players, stadiums, sponsors, matches, umpires };
    },

    renderResults(query, container) {
        const { teams, players, stadiums, sponsors, matches, umpires } = this.searchAll(query);
        const total = teams.length + players.length + stadiums.length + sponsors.length + matches.length + umpires.length;

        if (total === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <p>No tournament records found for "<strong>${escapeHtml(query)}</strong>"</p>
                </div>
            `;
            container.style.display = 'block';
            return;
        }

        let html = '';

        if (teams.length > 0) {
            html += `<div class="search-result-group-title">Teams (${teams.length})</div>`;
            teams.slice(0, 3).forEach(t => {
                html += `
                    <div class="search-result-item" onclick="globalSearchManager.selectResult('teams', '${escapeHtml(t.TeamName)}')">
                        <div class="search-result-icon"><i data-lucide="shield"></i></div>
                        <div class="search-result-info">
                            <div class="search-result-title">${escapeHtml(t.TeamName)} <span class="search-result-badge badge-primary">Team</span></div>
                            <div class="search-result-sub">Coach: ${escapeHtml(t.Coach || 'N/A')} • Venue: ${escapeHtml(t.HomeGround || 'N/A')}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (players.length > 0) {
            html += `<div class="search-result-group-title">Players (${players.length})</div>`;
            players.slice(0, 3).forEach(p => {
                html += `
                    <div class="search-result-item" onclick="globalSearchManager.selectResult('players', '${escapeHtml(p.PlayerName)}')">
                        <div class="search-result-icon"><i data-lucide="users"></i></div>
                        <div class="search-result-info">
                            <div class="search-result-title">${escapeHtml(p.PlayerName)} <span class="search-result-badge badge-success">${escapeHtml(p.Role || 'Player')}</span></div>
                            <div class="search-result-sub">${escapeHtml(p.TeamName || 'Unassigned')} • ${escapeHtml(p.Nationality || 'International')}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (stadiums.length > 0) {
            html += `<div class="search-result-group-title">Stadiums (${stadiums.length})</div>`;
            stadiums.slice(0, 3).forEach(s => {
                html += `
                    <div class="search-result-item" onclick="globalSearchManager.selectResult('stadiums', '${escapeHtml(s.StadiumName)}')">
                        <div class="search-result-icon"><i data-lucide="map-pin"></i></div>
                        <div class="search-result-info">
                            <div class="search-result-title">${escapeHtml(s.StadiumName)} <span class="search-result-badge badge-info">${escapeHtml(s.City || '')}</span></div>
                            <div class="search-result-sub">Capacity: ${Number(s.Capacity || 0).toLocaleString()} seats</div>
                        </div>
                    </div>
                `;
            });
        }

        if (sponsors.length > 0) {
            html += `<div class="search-result-group-title">Sponsors (${sponsors.length})</div>`;
            sponsors.slice(0, 3).forEach(s => {
                html += `
                    <div class="search-result-item" onclick="globalSearchManager.selectResult('sponsors', '${escapeHtml(s.SponsorName)}')">
                        <div class="search-result-icon"><i data-lucide="briefcase"></i></div>
                        <div class="search-result-info">
                            <div class="search-result-title">${escapeHtml(s.SponsorName)} <span class="search-result-badge badge-purple">${escapeHtml(s.Industry || 'Commercial')}</span></div>
                            <div class="search-result-sub">Team: ${escapeHtml(s.TeamName || 'N/A')} • Amount: $${Number(s.ContractAmount || 0).toLocaleString()}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (matches.length > 0) {
            html += `<div class="search-result-group-title">Matches (${matches.length})</div>`;
            matches.slice(0, 3).forEach(m => {
                html += `
                    <div class="search-result-item" onclick="globalSearchManager.selectResult('matches', 'Match #${m.MatchID}')">
                        <div class="search-result-icon"><i data-lucide="calendar"></i></div>
                        <div class="search-result-info">
                            <div class="search-result-title">Match #${m.MatchID} (${escapeHtml(m.MatchType || 'T20')})</div>
                            <div class="search-result-sub">${escapeHtml(m.StadiumName || 'Venue')} • ${escapeHtml(m.Result || 'Scheduled')}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (umpires.length > 0) {
            html += `<div class="search-result-group-title">Umpires (${umpires.length})</div>`;
            umpires.slice(0, 3).forEach(u => {
                html += `
                    <div class="search-result-item" onclick="globalSearchManager.selectResult('umpires', '${escapeHtml(u.UmpireName)}')">
                        <div class="search-result-icon"><i data-lucide="flag"></i></div>
                        <div class="search-result-info">
                            <div class="search-result-title">${escapeHtml(u.UmpireName)} <span class="search-result-badge badge-warning">${escapeHtml(u.Country || '')}</span></div>
                            <div class="search-result-sub">Experience: ${u.Experience || 0} years</div>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
        container.style.display = 'block';
        refreshIcons();
    },

    selectResult(viewName, filterTerm) {
        const input = document.getElementById('globalSearchInput');
        const clearBtn = document.getElementById('searchClearBtn');
        const resultsBox = document.getElementById('globalSearchResults');
        if (resultsBox) resultsBox.style.display = 'none';

        state.searchQuery = filterTerm ? filterTerm.toLowerCase() : '';
        if (input) input.value = filterTerm || '';
        if (clearBtn) clearBtn.style.display = filterTerm ? 'flex' : 'none';

        window.location.hash = '#' + viewName;
    }
};

function initGlobalSearch() {
    globalSearchManager.init();
}

// ==========================================================================
// 7. Database Health & Data Fetching
// ==========================================================================
async function checkDatabaseHealth() {
    const label = document.getElementById('dbStatusLabel');
    const pill = document.getElementById('systemStatusPill');
    const dot = pill?.querySelector('.status-indicator-dot');

    try {
        const res = await api.getHealth();
        state.dbConnected = true;
        if (label) label.textContent = 'MySQL Online';
        if (dot) dot.classList.remove('offline');
    } catch (e) {
        state.dbConnected = false;
        if (label) label.textContent = 'DB Offline';
        if (dot) dot.classList.add('offline');
    }
}

async function fetchAllData() {
    state.loading = true;
    try {
        const [
            teamsRes,
            playersRes,
            stadiumsRes,
            matchesRes,
            sponsorsRes,
            umpiresRes,
            scorecardsRes,
            statsRes
        ] = await Promise.allSettled([
            api.getTeams(),
            api.getPlayers(),
            api.getStadiums(),
            api.getMatches(),
            api.getSponsors(),
            api.getUmpires(),
            api.getScorecards(),
            api.getStatistics()
        ]);

        if (teamsRes.status === 'fulfilled') state.teams = teamsRes.value || [];
        if (playersRes.status === 'fulfilled') state.players = playersRes.value || [];
        if (stadiumsRes.status === 'fulfilled') state.stadiums = stadiumsRes.value || [];
        if (matchesRes.status === 'fulfilled') state.matches = matchesRes.value || [];
        if (sponsorsRes.status === 'fulfilled') state.sponsors = sponsorsRes.value || [];
        if (umpiresRes.status === 'fulfilled') state.umpires = umpiresRes.value || [];
        if (scorecardsRes.status === 'fulfilled') state.scorecards = scorecardsRes.value || [];
        if (statsRes.status === 'fulfilled') state.statistics = statsRes.value || null;

        state.dbConnected = true;
        document.getElementById('dbStatusLabel').textContent = 'MySQL Online';
        document.querySelector('.status-indicator-dot')?.classList.remove('offline');

        renderCurrentView();
    } catch (err) {
        console.error('Data fetch error:', err);
        showToast('Error syncing with Express backend.', 'error');
    } finally {
        state.loading = false;
    }
}

// ==========================================================================
// 8. View Router & View Renderers
// ==========================================================================
function renderCurrentView() {
    const container = document.getElementById('viewContainer');
    if (!container) return;
    container.innerHTML = '';

    switch (state.currentView) {
        case 'dashboard':
            renderDashboard(container);
            break;
        case 'teams':
            renderTeams(container);
            break;
        case 'players':
            renderPlayers(container);
            break;
        case 'matches':
            renderMatches(container);
            break;
        case 'stadiums':
            renderStadiums(container);
            break;
        case 'sponsors':
            renderSponsors(container);
            break;
        case 'umpires':
            renderUmpires(container);
            break;
        case 'scorecards':
            renderScorecards(container);
            break;
        case 'statistics':
            renderStatistics(container);
            break;
        default:
            renderDashboard(container);
    }
    refreshIcons();
}

// --------------------------------------------------------------------------
// View: Dashboard
// --------------------------------------------------------------------------
function renderDashboard(container) {
    const isAdmin = authManager.isAdmin();
    const totalTeams = state.teams.length;
    const totalPlayers = state.players.length;
    const totalMatches = state.matches.length;
    const totalStadiums = state.stadiums.length;
    const totalSponsors = state.sponsors.length;
    const totalUmpires = state.umpires.length;

    container.innerHTML = `
        <!-- Hero Welcome Banner -->
        <div class="dashboard-hero-banner">
            <div class="hero-left">
                <h2>Welcome to CricketBuddy Tournament Control 🏆</h2>
                <p>Real-time tournament stats, team franchise rosters, match scheduling, and venue administration.</p>
            </div>
            <div class="hero-right-pills">
                <div class="hero-pill">
                    <i data-lucide="shield-check" style="color: var(--accent-turf); width: 16px; height: 16px;"></i>
                    <span>Tournament Season 2026</span>
                </div>
                <div class="hero-pill">
                    <i data-lucide="database" style="color: var(--primary); width: 16px; height: 16px;"></i>
                    <span>MySQL 9.7 Active</span>
                </div>
            </div>
        </div>

        <!-- Quick Actions Bar -->
        <div class="quick-actions-card">
            <div class="quick-actions-header">
                <h3><i data-lucide="zap"></i> Quick Actions</h3>
                ${!isAdmin ? `<span class="viewer-restricted-notice"><i data-lucide="lock"></i> Viewer Mode: Admin controls disabled</span>` : ''}
            </div>
            <div class="quick-actions-buttons">
                ${isAdmin ? `
                    <button class="action-pill-btn" onclick="openTeamModal()"><i data-lucide="plus"></i> Add Team</button>
                    <button class="action-pill-btn" onclick="openPlayerModal()"><i data-lucide="user-plus"></i> Add Player</button>
                    <button class="action-pill-btn" onclick="openMatchModal()"><i data-lucide="calendar-plus"></i> Schedule Match</button>
                    <button class="action-pill-btn" onclick="openStadiumModal()"><i data-lucide="map-pin"></i> Add Stadium</button>
                    <button class="action-pill-btn" onclick="openSponsorModal()"><i data-lucide="award"></i> Add Sponsor</button>
                    <button class="action-pill-btn" onclick="openUmpireModal()"><i data-lucide="flag"></i> Add Umpire</button>
                ` : `
                    <button class="action-pill-btn" onclick="authManager.openAuthModal()"><i data-lucide="unlock"></i> Sign in as Admin to Create Records</button>
                    <a href="#teams" class="action-pill-btn"><i data-lucide="shield"></i> Browse Teams</a>
                    <a href="#matches" class="action-pill-btn"><i data-lucide="calendar"></i> View Fixtures</a>
                    <a href="#statistics" class="action-pill-btn"><i data-lucide="bar-chart-2"></i> Tournament Analytics</a>
                `}
            </div>
        </div>

        <!-- Animated Stat Counters -->
        <div class="stat-cards-grid">
            <div class="stat-card teams">
                <div class="stat-info">
                    <span class="stat-title">Participating Teams</span>
                    <div class="stat-counter">${totalTeams}</div>
                    <span class="stat-subtext"><i data-lucide="check"></i> Official franchises</span>
                </div>
                <div class="stat-icon-wrapper"><i data-lucide="shield"></i></div>
            </div>

            <div class="stat-card players">
                <div class="stat-info">
                    <span class="stat-title">Registered Players</span>
                    <div class="stat-counter">${totalPlayers}</div>
                    <span class="stat-subtext"><i data-lucide="trending-up"></i> Squad rosters</span>
                </div>
                <div class="stat-icon-wrapper"><i data-lucide="users"></i></div>
            </div>

            <div class="stat-card matches">
                <div class="stat-info">
                    <span class="stat-title">Tournament Matches</span>
                    <div class="stat-counter">${totalMatches}</div>
                    <span class="stat-subtext"><i data-lucide="clock"></i> Fixtures & Results</span>
                </div>
                <div class="stat-icon-wrapper"><i data-lucide="calendar"></i></div>
            </div>

            <div class="stat-card stadiums">
                <div class="stat-info">
                    <span class="stat-title">Venues & Stadiums</span>
                    <div class="stat-counter">${totalStadiums}</div>
                    <span class="stat-subtext"><i data-lucide="map-pin"></i> Certified grounds</span>
                </div>
                <div class="stat-icon-wrapper"><i data-lucide="map-pin"></i></div>
            </div>

            <div class="stat-card sponsors">
                <div class="stat-info">
                    <span class="stat-title">Active Sponsors</span>
                    <div class="stat-counter">${totalSponsors}</div>
                    <span class="stat-subtext"><i data-lucide="award"></i> Corporate deals</span>
                </div>
                <div class="stat-icon-wrapper"><i data-lucide="briefcase"></i></div>
            </div>

            <div class="stat-card umpires">
                <div class="stat-info">
                    <span class="stat-title">Certified Umpires</span>
                    <div class="stat-counter">${totalUmpires}</div>
                    <span class="stat-subtext"><i data-lucide="flag"></i> Match referees</span>
                </div>
                <div class="stat-icon-wrapper"><i data-lucide="flag"></i></div>
            </div>
        </div>

        <!-- Dashboard Dual Split: Recent Matches + Team Highlights -->
        <div class="dashboard-grid-dual">
            <!-- Recent Matches -->
            <div class="dash-panel">
                <div class="dash-panel-header">
                    <h3><i data-lucide="flame" style="color: var(--warning);"></i> Recent Match Results & Fixtures</h3>
                    <a href="#matches" class="dash-panel-link">View All Matches &rarr;</a>
                </div>
                <div class="dash-panel-body">
                    ${renderRecentMatchesTicker()}
                </div>
            </div>

            <!-- Top Franchises -->
            <div class="dash-panel">
                <div class="dash-panel-header">
                    <h3><i data-lucide="award" style="color: var(--primary);"></i> Top Team Franchises</h3>
                    <a href="#teams" class="dash-panel-link">Manage Teams &rarr;</a>
                </div>
                <div class="dash-panel-body">
                    ${renderTopTeamsHighlight()}
                </div>
            </div>
        </div>
    `;
}

function renderRecentMatchesTicker() {
    const list = state.matches.slice(0, 5);
    if (!list.length) {
        return `
            <div class="table-empty-state">
                <div class="empty-icon"><i data-lucide="calendar-x"></i></div>
                <h4>No Matches Scheduled</h4>
                <p>Matches scheduled in the database will appear here in real time.</p>
                ${authManager.isAdmin() ? `<button class="btn btn-primary btn-sm" onclick="openMatchModal()">Schedule Match</button>` : ''}
            </div>
        `;
    }

    return `
        <div class="match-cards-list">
            ${list.map(m => {
                const matchId = m.MatchID || m.id;
                const date = m.MatchDate ? new Date(m.MatchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
                const stadiumName = m.StadiumName || 'Main Arena';
                const result = m.Result || 'Fixture Scheduled';
                const matchType = m.MatchType || 'T20';

                return `
                    <div class="match-item-card">
                        <div class="match-meta-info">
                            <span class="match-venue-date">
                                <i data-lucide="calendar" style="width: 13px; height: 13px;"></i> ${escapeHtml(date)} &bull; 
                                <i data-lucide="map-pin" style="width: 13px; height: 13px;"></i> ${escapeHtml(stadiumName)}
                            </span>
                            <h4 class="match-title">Match #${matchId} &mdash; ${escapeHtml(matchType)}</h4>
                        </div>
                        <div class="match-badge-wrap">
                            <span class="badge ${result.includes('won') ? 'badge-success' : 'badge-primary'}">${escapeHtml(result)}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderTopTeamsHighlight() {
    const list = state.teams.slice(0, 5);
    if (!list.length) {
        return `
            <div class="table-empty-state">
                <div class="empty-icon"><i data-lucide="shield-alert"></i></div>
                <h4>No Teams Registered</h4>
                <p>Register franchises in your MySQL tournament database to view details.</p>
                ${authManager.isAdmin() ? `<button class="btn btn-primary btn-sm" onclick="openTeamModal()">Add First Team</button>` : ''}
            </div>
        `;
    }

    return `
        <div>
            ${list.map(t => {
                const teamName = t.TeamName || 'Unnamed Team';
                const coach = t.Coach || 'No Coach';
                const ground = t.HomeGround || 'Ground Unassigned';
                const initial = teamName.charAt(0).toUpperCase();

                return `
                    <div class="team-item-card">
                        <div class="team-profile-snippet">
                            <div class="team-avatar-initial">${escapeHtml(initial)}</div>
                            <div class="team-snippet-info">
                                <h4>${escapeHtml(teamName)}</h4>
                                <span>Coach: ${escapeHtml(coach)} &bull; ${escapeHtml(ground)}</span>
                            </div>
                        </div>
                        <span class="badge badge-success">Active</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// --------------------------------------------------------------------------
// View: Teams Module (/api/teams)
// --------------------------------------------------------------------------
function renderTeams(container) {
    const isAdmin = authManager.isAdmin();
    const query = state.searchQuery;
    const filtered = state.teams.filter(t => 
        (t.TeamName && t.TeamName.toLowerCase().includes(query)) ||
        (t.Coach && t.Coach.toLowerCase().includes(query)) ||
        (t.HomeGround && t.HomeGround.toLowerCase().includes(query)) ||
        (t.Owner && t.Owner.toLowerCase().includes(query))
    );

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title-group">
                <h1>Franchise Teams</h1>
                <p>Manage tournament participating franchises, coaches, home venues, and team ownership.</p>
            </div>
            ${isAdmin ? `
                <button class="btn btn-primary" onclick="openTeamModal()">
                    <i data-lucide="plus"></i> Add Team
                </button>
            ` : `
                <span class="badge badge-warning"><i data-lucide="eye"></i> Viewer Mode (Read-Only)</span>
            `}
        </div>

        <div class="table-card-container">
            <div class="table-filter-bar">
                <div class="filter-input-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" class="filter-input" placeholder="Search teams, coaches, venues..." value="${escapeHtml(state.searchQuery)}" oninput="handleFilterSearch(this.value)">
                </div>
                <div class="filter-tools">
                    <button class="btn btn-secondary btn-sm" onclick="fetchAllData()"><i data-lucide="refresh-cw"></i> Refresh</button>
                </div>
            </div>

            ${filtered.length === 0 ? `
                <div class="table-empty-state">
                    <div class="empty-icon"><i data-lucide="shield-alert"></i></div>
                    <h4>No Teams Found</h4>
                    <p>No franchise teams match your search or the database has no records yet.</p>
                    ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openTeamModal()">Add Team</button>` : ''}
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Team ID</th>
                                <th>Team Name</th>
                                <th>Head Coach</th>
                                <th>Home Ground</th>
                                <th>Franchise Owner</th>
                                ${isAdmin ? `<th>Actions</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(t => {
                                const id = t.TeamID || t.id;
                                return `
                                    <tr>
                                        <td><strong>#${id}</strong></td>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:8px;">
                                                <div class="team-avatar-initial" style="width:28px; height:28px; font-size:0.75rem;">${escapeHtml((t.TeamName || 'T').charAt(0))}</div>
                                                <strong>${escapeHtml(t.TeamName)}</strong>
                                            </div>
                                        </td>
                                        <td>${escapeHtml(t.Coach || '—')}</td>
                                        <td>${escapeHtml(t.HomeGround || '—')}</td>
                                        <td>${escapeHtml(t.Owner || '—')}</td>
                                        ${isAdmin ? `
                                            <td>
                                                <div class="table-actions-cell">
                                                    <button class="btn-table-action edit-action" title="Edit Team" onclick="openTeamModal(${id})">
                                                        <i data-lucide="edit-3"></i>
                                                    </button>
                                                    <button class="btn-table-action delete-action" title="Delete Team" onclick="confirmDelete('team', ${id}, '${escapeHtml(t.TeamName)}')">
                                                        <i data-lucide="trash-2"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// --------------------------------------------------------------------------
// View: Players Module (/api/players)
// --------------------------------------------------------------------------
function renderPlayers(container) {
    const isAdmin = authManager.isAdmin();
    const query = state.searchQuery;
    const filtered = state.players.filter(p => {
        const matchesQuery = 
            (p.PlayerName && p.PlayerName.toLowerCase().includes(query)) ||
            (p.Role && p.Role.toLowerCase().includes(query)) ||
            (p.Nationality && p.Nationality.toLowerCase().includes(query)) ||
            (p.TeamName && p.TeamName.toLowerCase().includes(query));

        const matchesRole = !state.roleFilter || p.Role === state.roleFilter;
        const matchesTeam = !state.teamFilter || String(p.TeamID) === state.teamFilter;

        return matchesQuery && matchesRole && matchesTeam;
    });

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title-group">
                <h1>Tournament Players</h1>
                <p>Rosters, batting/bowling roles, jersey numbers, and franchise assignments.</p>
            </div>
            ${isAdmin ? `
                <button class="btn btn-primary" onclick="openPlayerModal()">
                    <i data-lucide="user-plus"></i> Add Player
                </button>
            ` : `
                <span class="badge badge-warning"><i data-lucide="eye"></i> Viewer Mode</span>
            `}
        </div>

        <div class="table-card-container">
            <div class="table-filter-bar">
                <div class="filter-input-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" class="filter-input" placeholder="Search players, nationality, roles..." value="${escapeHtml(state.searchQuery)}" oninput="handleFilterSearch(this.value)">
                </div>
                <div class="filter-tools">
                    <select class="filter-select" onchange="handleRoleFilter(this.value)">
                        <option value="">All Roles</option>
                        <option value="Batsman" ${state.roleFilter === 'Batsman' ? 'selected' : ''}>Batsman</option>
                        <option value="Bowler" ${state.roleFilter === 'Bowler' ? 'selected' : ''}>Bowler</option>
                        <option value="All Rounder" ${state.roleFilter === 'All Rounder' ? 'selected' : ''}>All Rounder</option>
                        <option value="Wicket Keeper" ${state.roleFilter === 'Wicket Keeper' ? 'selected' : ''}>Wicket Keeper</option>
                    </select>
                    <select class="filter-select" onchange="handleTeamFilter(this.value)">
                        <option value="">All Teams</option>
                        ${state.teams.map(t => `<option value="${t.TeamID}" ${state.teamFilter === String(t.TeamID) ? 'selected' : ''}>${escapeHtml(t.TeamName)}</option>`).join('')}
                    </select>
                    <button class="btn btn-secondary btn-sm" onclick="fetchAllData()"><i data-lucide="refresh-cw"></i></button>
                </div>
            </div>

            ${filtered.length === 0 ? `
                <div class="table-empty-state">
                    <div class="empty-icon"><i data-lucide="users"></i></div>
                    <h4>No Players Found</h4>
                    <p>No player records match your active search and filter options.</p>
                    ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openPlayerModal()">Add Player</button>` : ''}
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Player ID</th>
                                <th>Player Name</th>
                                <th>Team</th>
                                <th>Role</th>
                                <th>Age</th>
                                <th>Nationality</th>
                                <th>Jersey #</th>
                                ${isAdmin ? `<th>Actions</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(p => {
                                const id = p.PlayerID || p.id;
                                const teamObj = state.teams.find(t => t.TeamID === p.TeamID);
                                const teamName = p.TeamName || (teamObj ? teamObj.TeamName : 'Unassigned');
                                const role = p.Role || 'Player';
                                const roleBadgeClass = role.includes('Bat') ? 'badge-primary' : (role.includes('Bowl') ? 'badge-success' : 'badge-purple');

                                return `
                                    <tr>
                                        <td><strong>#${id}</strong></td>
                                        <td><strong>${escapeHtml(p.PlayerName)}</strong></td>
                                        <td><span class="badge badge-info">${escapeHtml(teamName)}</span></td>
                                        <td><span class="badge ${roleBadgeClass}">${escapeHtml(role)}</span></td>
                                        <td>${p.Age != null ? p.Age : '—'}</td>
                                        <td>${escapeHtml(p.Nationality || '—')}</td>
                                        <td><strong>${p.JerseyNo != null ? `#${p.JerseyNo}` : '—'}</strong></td>
                                        ${isAdmin ? `
                                            <td>
                                                <div class="table-actions-cell">
                                                    <button class="btn-table-action edit-action" title="Edit Player" onclick="openPlayerModal(${id})">
                                                        <i data-lucide="edit-3"></i>
                                                    </button>
                                                    <button class="btn-table-action delete-action" title="Delete Player" onclick="confirmDelete('player', ${id}, '${escapeHtml(p.PlayerName)}')">
                                                        <i data-lucide="trash-2"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// --------------------------------------------------------------------------
// View: Matches Module (/api/matches)
// --------------------------------------------------------------------------
function renderMatches(container) {
    const isAdmin = authManager.isAdmin();
    const query = state.searchQuery;
    const filtered = state.matches.filter(m => 
        (m.MatchType && m.MatchType.toLowerCase().includes(query)) ||
        (m.Result && m.Result.toLowerCase().includes(query)) ||
        (m.StadiumName && m.StadiumName.toLowerCase().includes(query)) ||
        (String(m.MatchID || m.id).includes(query))
    );

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title-group">
                <h1>Tournament Matches</h1>
                <p>Scheduled fixtures, venues, formats (T20/ODI/Test), and match outcomes.</p>
            </div>
            ${isAdmin ? `
                <button class="btn btn-primary" onclick="openMatchModal()">
                    <i data-lucide="calendar-plus"></i> Schedule Match
                </button>
            ` : `
                <span class="badge badge-warning"><i data-lucide="eye"></i> Viewer Mode</span>
            `}
        </div>

        <div class="table-card-container">
            <div class="table-filter-bar">
                <div class="filter-input-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" class="filter-input" placeholder="Search matches, venues, outcomes..." value="${escapeHtml(state.searchQuery)}" oninput="handleFilterSearch(this.value)">
                </div>
                <div class="filter-tools">
                    <button class="btn btn-secondary btn-sm" onclick="fetchAllData()"><i data-lucide="refresh-cw"></i> Refresh</button>
                </div>
            </div>

            ${filtered.length === 0 ? `
                <div class="table-empty-state">
                    <div class="empty-icon"><i data-lucide="calendar-x"></i></div>
                    <h4>No Matches Found</h4>
                    <p>No fixtures match your criteria in the database.</p>
                    ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openMatchModal()">Schedule Match</button>` : ''}
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Match ID</th>
                                <th>Date</th>
                                <th>Format</th>
                                <th>Venue</th>
                                <th>Result / Status</th>
                                ${isAdmin ? `<th>Actions</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(m => {
                                const id = m.MatchID || m.id;
                                const stadiumObj = state.stadiums.find(s => s.StadiumID === m.StadiumID);
                                const stadiumName = m.StadiumName || (stadiumObj ? stadiumObj.StadiumName : 'Main Stadium');
                                const date = m.MatchDate ? new Date(m.MatchDate).toISOString().split('T')[0] : 'TBD';
                                const result = m.Result || 'Fixture Scheduled';

                                return `
                                    <tr>
                                        <td><strong>#${id}</strong></td>
                                        <td>${escapeHtml(date)}</td>
                                        <td><span class="badge badge-primary">${escapeHtml(m.MatchType || 'T20')}</span></td>
                                        <td><i data-lucide="map-pin" style="width:13px; height:13px; vertical-align:middle; color:var(--text-faint);"></i> ${escapeHtml(stadiumName)}</td>
                                        <td><span class="badge ${result.includes('won') ? 'badge-success' : 'badge-warning'}">${escapeHtml(result)}</span></td>
                                        ${isAdmin ? `
                                            <td>
                                                <div class="table-actions-cell">
                                                    <button class="btn-table-action edit-action" title="Edit Match" onclick="openMatchModal(${id})">
                                                        <i data-lucide="edit-3"></i>
                                                    </button>
                                                    <button class="btn-table-action delete-action" title="Delete Match" onclick="confirmDelete('match', ${id}, 'Match #${id}')">
                                                        <i data-lucide="trash-2"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// --------------------------------------------------------------------------
// View: Stadiums Module (/api/stadiums)
// --------------------------------------------------------------------------
function renderStadiums(container) {
    const isAdmin = authManager.isAdmin();
    const query = state.searchQuery;
    const filtered = state.stadiums.filter(s => 
        (s.StadiumName && s.StadiumName.toLowerCase().includes(query)) ||
        (s.City && s.City.toLowerCase().includes(query))
    );

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title-group">
                <h1>Tournament Stadiums</h1>
                <p>Venues hosting tournament fixtures, spectator capacities, and host cities.</p>
            </div>
            ${isAdmin ? `
                <button class="btn btn-primary" onclick="openStadiumModal()">
                    <i data-lucide="map-pin"></i> Add Stadium
                </button>
            ` : `
                <span class="badge badge-warning"><i data-lucide="eye"></i> Viewer Mode</span>
            `}
        </div>

        <div class="table-card-container">
            <div class="table-filter-bar">
                <div class="filter-input-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" class="filter-input" placeholder="Search stadiums or cities..." value="${escapeHtml(state.searchQuery)}" oninput="handleFilterSearch(this.value)">
                </div>
                <div class="filter-tools">
                    <button class="btn btn-secondary btn-sm" onclick="fetchAllData()"><i data-lucide="refresh-cw"></i> Refresh</button>
                </div>
            </div>

            ${filtered.length === 0 ? `
                <div class="table-empty-state">
                    <div class="empty-icon"><i data-lucide="map-pin"></i></div>
                    <h4>No Stadiums Found</h4>
                    <p>No stadium records found in the database.</p>
                    ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openStadiumModal()">Add Stadium</button>` : ''}
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Stadium ID</th>
                                <th>Stadium Name</th>
                                <th>City</th>
                                <th>Spectator Capacity</th>
                                ${isAdmin ? `<th>Actions</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(s => {
                                const id = s.StadiumID || s.id;
                                const cap = Number(s.Capacity || 0).toLocaleString();

                                return `
                                    <tr>
                                        <td><strong>#${id}</strong></td>
                                        <td><strong>${escapeHtml(s.StadiumName)}</strong></td>
                                        <td>${escapeHtml(s.City || '—')}</td>
                                        <td><span class="badge badge-info">${cap} seats</span></td>
                                        ${isAdmin ? `
                                            <td>
                                                <div class="table-actions-cell">
                                                    <button class="btn-table-action edit-action" title="Edit Stadium" onclick="openStadiumModal(${id})">
                                                        <i data-lucide="edit-3"></i>
                                                    </button>
                                                    <button class="btn-table-action delete-action" title="Delete Stadium" onclick="confirmDelete('stadium', ${id}, '${escapeHtml(s.StadiumName)}')">
                                                        <i data-lucide="trash-2"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// --------------------------------------------------------------------------
// View: Sponsors Module (/api/sponsors)
// --------------------------------------------------------------------------
function renderSponsors(container) {
    const isAdmin = authManager.isAdmin();
    const query = state.searchQuery;
    const filtered = state.sponsors.filter(s => 
        (s.SponsorName && s.SponsorName.toLowerCase().includes(query)) ||
        (s.Industry && s.Industry.toLowerCase().includes(query)) ||
        (s.TeamName && s.TeamName.toLowerCase().includes(query))
    );

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title-group">
                <h1>Tournament Sponsors</h1>
                <p>Commercial partnerships, brand deals, industries, and contract valuations.</p>
            </div>
            ${isAdmin ? `
                <button class="btn btn-primary" onclick="openSponsorModal()">
                    <i data-lucide="briefcase"></i> Add Sponsor
                </button>
            ` : `
                <span class="badge badge-warning"><i data-lucide="eye"></i> Viewer Mode</span>
            `}
        </div>

        <div class="table-card-container">
            <div class="table-filter-bar">
                <div class="filter-input-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" class="filter-input" placeholder="Search sponsors, industries..." value="${escapeHtml(state.searchQuery)}" oninput="handleFilterSearch(this.value)">
                </div>
                <div class="filter-tools">
                    <button class="btn btn-secondary btn-sm" onclick="fetchAllData()"><i data-lucide="refresh-cw"></i> Refresh</button>
                </div>
            </div>

            ${filtered.length === 0 ? `
                <div class="table-empty-state">
                    <div class="empty-icon"><i data-lucide="award"></i></div>
                    <h4>No Sponsors Found</h4>
                    <p>No sponsors recorded in the database.</p>
                    ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openSponsorModal()">Add Sponsor</button>` : ''}
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Sponsor ID</th>
                                <th>Sponsor Name</th>
                                <th>Industry</th>
                                <th>Contract Amount</th>
                                <th>Sponsored Team</th>
                                ${isAdmin ? `<th>Actions</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(s => {
                                const id = s.SponsorID || s.id;
                                const teamObj = state.teams.find(t => t.TeamID === s.TeamID);
                                const teamName = s.TeamName || (teamObj ? teamObj.TeamName : 'Franchise Unassigned');
                                const amt = s.ContractAmount ? '$' + Number(s.ContractAmount).toLocaleString() : 'Undisclosed';

                                return `
                                    <tr>
                                        <td><strong>#${id}</strong></td>
                                        <td><strong>${escapeHtml(s.SponsorName)}</strong></td>
                                        <td><span class="badge badge-purple">${escapeHtml(s.Industry || 'Commercial')}</span></td>
                                        <td><strong style="color:var(--accent-turf);">${amt}</strong></td>
                                        <td><span class="badge badge-info">${escapeHtml(teamName)}</span></td>
                                        ${isAdmin ? `
                                            <td>
                                                <div class="table-actions-cell">
                                                    <button class="btn-table-action edit-action" title="Edit Sponsor" onclick="openSponsorModal(${id})">
                                                        <i data-lucide="edit-3"></i>
                                                    </button>
                                                    <button class="btn-table-action delete-action" title="Delete Sponsor" onclick="confirmDelete('sponsor', ${id}, '${escapeHtml(s.SponsorName)}')">
                                                        <i data-lucide="trash-2"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// --------------------------------------------------------------------------
// View: Umpires Module (/api/umpires)
// --------------------------------------------------------------------------
function renderUmpires(container) {
    const isAdmin = authManager.isAdmin();
    const query = state.searchQuery;
    const filtered = state.umpires.filter(u => 
        (u.UmpireName && u.UmpireName.toLowerCase().includes(query)) ||
        (u.Country && u.Country.toLowerCase().includes(query))
    );

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title-group">
                <h1>Official Umpires</h1>
                <p>Officiating referees, certifications, nationalities, and tournament experience.</p>
            </div>
            ${isAdmin ? `
                <button class="btn btn-primary" onclick="openUmpireModal()">
                    <i data-lucide="flag"></i> Add Umpire
                </button>
            ` : `
                <span class="badge badge-warning"><i data-lucide="eye"></i> Viewer Mode</span>
            `}
        </div>

        <div class="table-card-container">
            <div class="table-filter-bar">
                <div class="filter-input-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" class="filter-input" placeholder="Search umpires, countries..." value="${escapeHtml(state.searchQuery)}" oninput="handleFilterSearch(this.value)">
                </div>
                <div class="filter-tools">
                    <button class="btn btn-secondary btn-sm" onclick="fetchAllData()"><i data-lucide="refresh-cw"></i> Refresh</button>
                </div>
            </div>

            ${filtered.length === 0 ? `
                <div class="table-empty-state">
                    <div class="empty-icon"><i data-lucide="flag"></i></div>
                    <h4>No Umpires Found</h4>
                    <p>No umpire records found in the database.</p>
                    ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openUmpireModal()">Add Umpire</button>` : ''}
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Umpire ID</th>
                                <th>Umpire Name</th>
                                <th>Country</th>
                                <th>Experience (Years)</th>
                                ${isAdmin ? `<th>Actions</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(u => {
                                const id = u.UmpireID || u.id;
                                return `
                                    <tr>
                                        <td><strong>#${id}</strong></td>
                                        <td><strong>${escapeHtml(u.UmpireName)}</strong></td>
                                        <td>${escapeHtml(u.Country || '—')}</td>
                                        <td><span class="badge badge-success">${u.Experience || 0} Years</span></td>
                                        ${isAdmin ? `
                                            <td>
                                                <div class="table-actions-cell">
                                                    <button class="btn-table-action edit-action" title="Edit Umpire" onclick="openUmpireModal(${id})">
                                                        <i data-lucide="edit-3"></i>
                                                    </button>
                                                    <button class="btn-table-action delete-action" title="Delete Umpire" onclick="confirmDelete('umpire', ${id}, '${escapeHtml(u.UmpireName)}')">
                                                        <i data-lucide="trash-2"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// --------------------------------------------------------------------------
// View: Scorecards Module (/api/scorecards)
// --------------------------------------------------------------------------
function renderScorecards(container) {
    const isAdmin = authManager.isAdmin();
    const query = state.searchQuery;
    const filtered = state.scorecards.filter(sc => 
        (sc.PlayerName && sc.PlayerName.toLowerCase().includes(query)) ||
        (String(sc.MatchID).includes(query))
    );

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title-group">
                <h1>Match Scorecards</h1>
                <p>Batting runs, balls faced, strike rate calculations, wickets taken, and overs bowled.</p>
            </div>
            ${isAdmin ? `
                <button class="btn btn-primary" onclick="openScorecardModal()">
                    <i data-lucide="plus"></i> Add Scorecard Entry
                </button>
            ` : `
                <span class="badge badge-warning"><i data-lucide="eye"></i> Viewer Mode</span>
            `}
        </div>

        <div class="table-card-container">
            <div class="table-filter-bar">
                <div class="filter-input-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" class="filter-input" placeholder="Search by player or match ID..." value="${escapeHtml(state.searchQuery)}" oninput="handleFilterSearch(this.value)">
                </div>
                <div class="filter-tools">
                    <button class="btn btn-secondary btn-sm" onclick="fetchAllData()"><i data-lucide="refresh-cw"></i> Refresh</button>
                </div>
            </div>

            ${filtered.length === 0 ? `
                <div class="table-empty-state">
                    <div class="empty-icon"><i data-lucide="file-spreadsheet"></i></div>
                    <h4>No Scorecard Entries Found</h4>
                    <p>No individual player performance records recorded yet.</p>
                    ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openScorecardModal()">Add Entry</button>` : ''}
                </div>
            ` : `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Scorecard ID</th>
                                <th>Match ID</th>
                                <th>Player Name</th>
                                <th>Runs</th>
                                <th>Balls Faced</th>
                                <th>Strike Rate</th>
                                <th>Wickets</th>
                                <th>Overs</th>
                                ${isAdmin ? `<th>Actions</th>` : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(sc => {
                                const id = sc.ScorecardID || sc.id;
                                const runs = sc.Runs || 0;
                                const balls = sc.BallsFaced || 0;
                                const sr = balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';

                                return `
                                    <tr>
                                        <td><strong>#${id}</strong></td>
                                        <td><span class="badge badge-primary">Match #${sc.MatchID}</span></td>
                                        <td><strong>${escapeHtml(sc.PlayerName || `Player #${sc.PlayerID}`)}</strong></td>
                                        <td><strong style="color:var(--accent-turf); font-size:1rem;">${runs}</strong></td>
                                        <td>${balls}</td>
                                        <td><span class="badge badge-info">${sr}</span></td>
                                        <td>${sc.Wickets || 0}</td>
                                        <td>${sc.Overs || '0.0'}</td>
                                        ${isAdmin ? `
                                            <td>
                                                <div class="table-actions-cell">
                                                    <button class="btn-table-action edit-action" title="Edit Scorecard" onclick="openScorecardModal(${id})">
                                                        <i data-lucide="edit-3"></i>
                                                    </button>
                                                    <button class="btn-table-action delete-action" title="Delete Scorecard" onclick="confirmDelete('scorecard', ${id}, 'Scorecard #${id}')">
                                                        <i data-lucide="trash-2"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        ` : ''}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

// --------------------------------------------------------------------------
// View: Statistics & Analytics Module
// --------------------------------------------------------------------------
function renderStatistics(container) {
    const stats = state.statistics || {};
    const topScorers = stats.topScorers || [];
    const teamPlayerCounts = stats.teamPlayerCounts || [];
    const teamSponsorships = stats.teamSponsorships || [];

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title-group">
                <h1>Tournament Analytics & Queries</h1>
                <p>Aggregated DBMS statistics, highest run getters, squad counts, and sponsorship revenues.</p>
            </div>
            <button class="btn btn-secondary" onclick="fetchAllData()"><i data-lucide="refresh-cw"></i> Refresh Stats</button>
        </div>

        <div class="dashboard-grid-dual">
            <!-- Top Run Scorers -->
            <div class="dash-panel">
                <div class="dash-panel-header">
                    <h3><i data-lucide="award" style="color: var(--accent-turf);"></i> Top Run Scorers</h3>
                </div>
                <div class="dash-panel-body">
                    ${topScorers.length === 0 ? `<p style="color:var(--text-muted);">No batting records logged yet.</p>` : `
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Player Name</th>
                                        <th>Highest Inning Runs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${topScorers.map((s, idx) => `
                                        <tr>
                                            <td><strong>#${idx + 1}</strong></td>
                                            <td>${escapeHtml(s.PlayerName)}</td>
                                            <td><span class="badge badge-success" style="font-size:0.9rem;">${s.HighestRuns} Runs</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>

            <!-- Team Squad Counts -->
            <div class="dash-panel">
                <div class="dash-panel-header">
                    <h3><i data-lucide="users" style="color: var(--primary);"></i> Squad Sizes per Team</h3>
                </div>
                <div class="dash-panel-body">
                    ${teamPlayerCounts.length === 0 ? `<p style="color:var(--text-muted);">No player squads formed.</p>` : `
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Team Name</th>
                                        <th>Total Players</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${teamPlayerCounts.map(tc => `
                                        <tr>
                                            <td><strong>${escapeHtml(tc.TeamName)}</strong></td>
                                            <td><span class="badge badge-info">${tc.TotalPlayers} Players</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        </div>

        <!-- Team Sponsorship Values -->
        <div class="dash-panel" style="margin-top:20px;">
            <div class="dash-panel-header">
                <h3><i data-lucide="dollar-sign" style="color: var(--accent-turf);"></i> Franchise Sponsorship Portfolio</h3>
            </div>
            <div class="dash-panel-body">
                ${teamSponsorships.length === 0 ? `<p style="color:var(--text-muted);">No team sponsorship data recorded.</p>` : `
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Franchise Team</th>
                                    <th>Total Sponsorship Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teamSponsorships.map(ts => `
                                    <tr>
                                        <td><strong>${escapeHtml(ts.TeamName)}</strong></td>
                                        <td><strong style="color:var(--accent-turf); font-size:1.05rem;">$${Number(ts.TotalSponsorship || 0).toLocaleString()}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

// ==========================================================================
// 9. Filtering & Search Helpers
// ==========================================================================
function handleFilterSearch(val) {
    state.searchQuery = val.toLowerCase().trim();

    // Synchronize top search bar
    const topInput = document.getElementById('globalSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    if (topInput && document.activeElement !== topInput) {
        topInput.value = val;
        if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
    }

    const activeEl = document.activeElement;
    const isTableInput = activeEl && activeEl.classList.contains('filter-input');
    const cursorPos = isTableInput ? activeEl.selectionStart : null;

    renderCurrentView();

    if (isTableInput) {
        const newTableInput = document.querySelector('.filter-input');
        if (newTableInput) {
            newTableInput.focus();
            if (cursorPos !== null) {
                newTableInput.setSelectionRange(cursorPos, cursorPos);
            }
        }
    }
}
function handleRoleFilter(val) {
    state.roleFilter = val;
    renderCurrentView();
}
function handleTeamFilter(val) {
    state.teamFilter = val;
    renderCurrentView();
}

// ==========================================================================
// 10. CRUD Modal Logic & Backend Integration
// ==========================================================================
const modalManager = {
    open(contentHtml) {
        const card = document.getElementById('modalCard');
        const backdrop = document.getElementById('modalBackdrop');
        if (card && backdrop) {
            card.innerHTML = contentHtml;
            backdrop.classList.add('active');
            refreshIcons();
        }
    },
    close() {
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) backdrop.classList.remove('active');
    }
};

// --------------------------------------------------------------------------
// 10.1 Teams CRUD Modals
// --------------------------------------------------------------------------
function openTeamModal(teamId = null) {
    if (!authManager.requireAdmin()) return;

    const isEdit = Boolean(teamId);
    const team = isEdit ? state.teams.find(t => t.TeamID === teamId) || {} : {};

    const html = `
        <div class="modal-header">
            <h3>${isEdit ? 'Edit Team Franchise' : 'Register New Team'}</h3>
            <button class="modal-close-btn" onclick="modalManager.close()"><i data-lucide="x"></i></button>
        </div>
        <form id="teamCrudForm" onsubmit="handleTeamSubmit(event, ${teamId})">
            <div class="modal-body">
                <div class="form-group">
                    <label>Team Name <span class="req">*</span></label>
                    <input type="text" class="form-control" name="TeamName" required value="${escapeHtml(team.TeamName || '')}" placeholder="e.g. Mumbai Indians">
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Head Coach</label>
                        <input type="text" class="form-control" name="Coach" value="${escapeHtml(team.Coach || '')}" placeholder="e.g. Mark Boucher">
                    </div>
                    <div class="form-group">
                        <label>Owner / Group</label>
                        <input type="text" class="form-control" name="Owner" value="${escapeHtml(team.Owner || '')}" placeholder="e.g. Reliance Industries">
                    </div>
                </div>
                <div class="form-group">
                    <label>Home Ground / Stadium</label>
                    <input type="text" class="form-control" name="HomeGround" value="${escapeHtml(team.HomeGround || '')}" placeholder="e.g. Wankhede Stadium">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="teamSubmitBtn">
                    ${isEdit ? 'Update Team' : 'Create Team'}
                </button>
            </div>
        </form>
    `;
    modalManager.open(html);
}

async function handleTeamSubmit(e, teamId) {
    e.preventDefault();
    const btn = document.getElementById('teamSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const formData = new FormData(e.target);
    const payload = {
        TeamName: formData.get('TeamName').trim(),
        Coach: formData.get('Coach').trim(),
        HomeGround: formData.get('HomeGround').trim(),
        Owner: formData.get('Owner').trim()
    };

    try {
        if (teamId) {
            await api.updateTeam(teamId, payload);
            showToast(`Team "${payload.TeamName}" updated successfully!`, 'success');
        } else {
            await api.createTeam(payload);
            showToast(`Team "${payload.TeamName}" created successfully!`, 'success');
        }
        modalManager.close();
        await fetchAllData();
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = teamId ? 'Update Team' : 'Create Team';
    }
}

// --------------------------------------------------------------------------
// 10.2 Players CRUD Modals
// --------------------------------------------------------------------------
function openPlayerModal(playerId = null) {
    if (!authManager.requireAdmin()) return;

    const isEdit = Boolean(playerId);
    const p = isEdit ? state.players.find(pl => pl.PlayerID === playerId) || {} : {};

    const html = `
        <div class="modal-header">
            <h3>${isEdit ? 'Edit Player Profile' : 'Add New Player'}</h3>
            <button class="modal-close-btn" onclick="modalManager.close()"><i data-lucide="x"></i></button>
        </div>
        <form id="playerCrudForm" onsubmit="handlePlayerSubmit(event, ${playerId})">
            <div class="modal-body">
                <div class="form-group">
                    <label>Player Full Name <span class="req">*</span></label>
                    <input type="text" class="form-control" name="PlayerName" required value="${escapeHtml(p.PlayerName || '')}" placeholder="e.g. Rohit Sharma">
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Age</label>
                        <input type="number" class="form-control" name="Age" min="15" max="60" value="${p.Age != null ? p.Age : ''}" placeholder="e.g. 36">
                    </div>
                    <div class="form-group">
                        <label>Jersey Number</label>
                        <input type="number" class="form-control" name="JerseyNo" min="0" max="999" value="${p.JerseyNo != null ? p.JerseyNo : ''}" placeholder="e.g. 45">
                    </div>
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Player Role</label>
                        <select class="form-control" name="Role">
                            <option value="Batsman" ${p.Role === 'Batsman' ? 'selected' : ''}>Batsman</option>
                            <option value="Bowler" ${p.Role === 'Bowler' ? 'selected' : ''}>Bowler</option>
                            <option value="All Rounder" ${p.Role === 'All Rounder' ? 'selected' : ''}>All Rounder</option>
                            <option value="Wicket Keeper" ${p.Role === 'Wicket Keeper' ? 'selected' : ''}>Wicket Keeper</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nationality</label>
                        <input type="text" class="form-control" name="Nationality" value="${escapeHtml(p.Nationality || 'Indian')}" placeholder="e.g. Indian">
                    </div>
                </div>
                <div class="form-group">
                    <label>Team Franchise</label>
                    <select class="form-control" name="TeamID">
                        <option value="">Unassigned</option>
                        ${state.teams.map(t => `<option value="${t.TeamID}" ${p.TeamID === t.TeamID ? 'selected' : ''}>${escapeHtml(t.TeamName)}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="playerSubmitBtn">
                    ${isEdit ? 'Update Player' : 'Save Player'}
                </button>
            </div>
        </form>
    `;
    modalManager.open(html);
}

async function handlePlayerSubmit(e, playerId) {
    e.preventDefault();
    const btn = document.getElementById('playerSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const formData = new FormData(e.target);
    const payload = {
        PlayerName: formData.get('PlayerName').trim(),
        Age: formData.get('Age') ? Number(formData.get('Age')) : null,
        Role: formData.get('Role'),
        Nationality: formData.get('Nationality').trim(),
        JerseyNo: formData.get('JerseyNo') ? Number(formData.get('JerseyNo')) : null,
        TeamID: formData.get('TeamID') ? Number(formData.get('TeamID')) : null
    };

    try {
        if (playerId) {
            await api.updatePlayer(playerId, payload);
            showToast(`Player "${payload.PlayerName}" updated!`, 'success');
        } else {
            await api.createPlayer(payload);
            showToast(`Player "${payload.PlayerName}" created!`, 'success');
        }
        modalManager.close();
        await fetchAllData();
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = playerId ? 'Update Player' : 'Save Player';
    }
}

// --------------------------------------------------------------------------
// 10.3 Stadiums CRUD Modals
// --------------------------------------------------------------------------
function openStadiumModal(stadiumId = null) {
    if (!authManager.requireAdmin()) return;

    const isEdit = Boolean(stadiumId);
    const s = isEdit ? state.stadiums.find(st => st.StadiumID === stadiumId) || {} : {};

    const html = `
        <div class="modal-header">
            <h3>${isEdit ? 'Edit Stadium Venue' : 'Add Tournament Stadium'}</h3>
            <button class="modal-close-btn" onclick="modalManager.close()"><i data-lucide="x"></i></button>
        </div>
        <form id="stadiumCrudForm" onsubmit="handleStadiumSubmit(event, ${stadiumId})">
            <div class="modal-body">
                <div class="form-group">
                    <label>Stadium Name <span class="req">*</span></label>
                    <input type="text" class="form-control" name="StadiumName" required value="${escapeHtml(s.StadiumName || '')}" placeholder="e.g. Wankhede Stadium">
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label>City <span class="req">*</span></label>
                        <input type="text" class="form-control" name="City" required value="${escapeHtml(s.City || '')}" placeholder="e.g. Mumbai">
                    </div>
                    <div class="form-group">
                        <label>Capacity</label>
                        <input type="number" class="form-control" name="Capacity" min="1000" value="${s.Capacity != null ? s.Capacity : ''}" placeholder="e.g. 33000">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="stadiumSubmitBtn">
                    ${isEdit ? 'Update Stadium' : 'Save Stadium'}
                </button>
            </div>
        </form>
    `;
    modalManager.open(html);
}

async function handleStadiumSubmit(e, stadiumId) {
    e.preventDefault();
    const btn = document.getElementById('stadiumSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const formData = new FormData(e.target);
    const payload = {
        StadiumName: formData.get('StadiumName').trim(),
        City: formData.get('City').trim(),
        Capacity: formData.get('Capacity') ? Number(formData.get('Capacity')) : null
    };

    try {
        if (stadiumId) {
            await api.updateStadium(stadiumId, payload);
            showToast(`Stadium "${payload.StadiumName}" updated!`, 'success');
        } else {
            await api.createStadium(payload);
            showToast(`Stadium "${payload.StadiumName}" registered!`, 'success');
        }
        modalManager.close();
        await fetchAllData();
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = stadiumId ? 'Update Stadium' : 'Save Stadium';
    }
}

// --------------------------------------------------------------------------
// 10.4 Sponsors CRUD Modals
// --------------------------------------------------------------------------
function openSponsorModal(sponsorId = null) {
    if (!authManager.requireAdmin()) return;

    const isEdit = Boolean(sponsorId);
    const sp = isEdit ? state.sponsors.find(s => s.SponsorID === sponsorId) || {} : {};

    const html = `
        <div class="modal-header">
            <h3>${isEdit ? 'Edit Sponsor Deal' : 'Add Corporate Sponsor'}</h3>
            <button class="modal-close-btn" onclick="modalManager.close()"><i data-lucide="x"></i></button>
        </div>
        <form id="sponsorCrudForm" onsubmit="handleSponsorSubmit(event, ${sponsorId})">
            <div class="modal-body">
                <div class="form-group">
                    <label>Sponsor Name <span class="req">*</span></label>
                    <input type="text" class="form-control" name="SponsorName" required value="${escapeHtml(sp.SponsorName || '')}" placeholder="e.g. Samsung">
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Industry</label>
                        <input type="text" class="form-control" name="Industry" value="${escapeHtml(sp.Industry || '')}" placeholder="e.g. Electronics">
                    </div>
                    <div class="form-group">
                        <label>Contract Amount ($)</label>
                        <input type="number" class="form-control" name="ContractAmount" min="0" value="${sp.ContractAmount != null ? sp.ContractAmount : ''}" placeholder="e.g. 25000000">
                    </div>
                </div>
                <div class="form-group">
                    <label>Sponsored Team Franchise</label>
                    <select class="form-control" name="TeamID">
                        <option value="">Unassigned</option>
                        ${state.teams.map(t => `<option value="${t.TeamID}" ${sp.TeamID === t.TeamID ? 'selected' : ''}>${escapeHtml(t.TeamName)}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="sponsorSubmitBtn">
                    ${isEdit ? 'Update Sponsor' : 'Save Sponsor'}
                </button>
            </div>
        </form>
    `;
    modalManager.open(html);
}

async function handleSponsorSubmit(e, sponsorId) {
    e.preventDefault();
    const btn = document.getElementById('sponsorSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const formData = new FormData(e.target);
    const payload = {
        SponsorName: formData.get('SponsorName').trim(),
        Industry: formData.get('Industry').trim(),
        ContractAmount: formData.get('ContractAmount') ? Number(formData.get('ContractAmount')) : null,
        TeamID: formData.get('TeamID') ? Number(formData.get('TeamID')) : null
    };

    try {
        if (sponsorId) {
            await api.updateSponsor(sponsorId, payload);
            showToast(`Sponsor "${payload.SponsorName}" updated!`, 'success');
        } else {
            await api.createSponsor(payload);
            showToast(`Sponsor "${payload.SponsorName}" created!`, 'success');
        }
        modalManager.close();
        await fetchAllData();
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = sponsorId ? 'Update Sponsor' : 'Save Sponsor';
    }
}

// --------------------------------------------------------------------------
// 10.5 Matches CRUD Modals
// --------------------------------------------------------------------------
function openMatchModal(matchId = null) {
    if (!authManager.requireAdmin()) return;

    const isEdit = Boolean(matchId);
    const m = isEdit ? state.matches.find(ma => ma.MatchID === matchId) || {} : {};
    const formattedDate = m.MatchDate ? new Date(m.MatchDate).toISOString().split('T')[0] : '';

    const html = `
        <div class="modal-header">
            <h3>${isEdit ? 'Update Match Fixture' : 'Schedule New Match'}</h3>
            <button class="modal-close-btn" onclick="modalManager.close()"><i data-lucide="x"></i></button>
        </div>
        <form id="matchCrudForm" onsubmit="handleMatchSubmit(event, ${matchId})">
            <div class="modal-body">
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Match Date <span class="req">*</span></label>
                        <input type="date" class="form-control" name="MatchDate" required value="${formattedDate}">
                    </div>
                    <div class="form-group">
                        <label>Format / Type <span class="req">*</span></label>
                        <select class="form-control" name="MatchType">
                            <option value="T20" ${m.MatchType === 'T20' ? 'selected' : ''}>T20</option>
                            <option value="ODI" ${m.MatchType === 'ODI' ? 'selected' : ''}>ODI</option>
                            <option value="Test" ${m.MatchType === 'Test' ? 'selected' : ''}>Test</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Venue Stadium <span class="req">*</span></label>
                    <select class="form-control" name="StadiumID" required>
                        <option value="">Select Stadium</option>
                        ${state.stadiums.map(s => `<option value="${s.StadiumID}" ${m.StadiumID === s.StadiumID ? 'selected' : ''}>${escapeHtml(s.StadiumName)} (${escapeHtml(s.City || '')})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Match Result / Outcome</label>
                    <input type="text" class="form-control" name="Result" value="${escapeHtml(m.Result || '')}" placeholder="e.g. Mumbai Indians won by 6 wickets">
                    <p class="form-hint">Leave blank or enter 'Scheduled' for future matches.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="matchSubmitBtn">
                    ${isEdit ? 'Update Match' : 'Save Match'}
                </button>
            </div>
        </form>
    `;
    modalManager.open(html);
}

async function handleMatchSubmit(e, matchId) {
    e.preventDefault();
    const btn = document.getElementById('matchSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const formData = new FormData(e.target);
    const payload = {
        MatchDate: formData.get('MatchDate'),
        MatchType: formData.get('MatchType'),
        StadiumID: formData.get('StadiumID') ? Number(formData.get('StadiumID')) : null,
        Result: formData.get('Result').trim() || null
    };

    try {
        if (matchId) {
            await api.updateMatch(matchId, payload);
            showToast(`Match #${matchId} updated successfully!`, 'success');
        } else {
            await api.createMatch(payload);
            showToast(`New match fixture scheduled!`, 'success');
        }
        modalManager.close();
        await fetchAllData();
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = matchId ? 'Update Match' : 'Save Match';
    }
}

// --------------------------------------------------------------------------
// 10.6 Umpires CRUD Modals
// --------------------------------------------------------------------------
function openUmpireModal(umpireId = null) {
    if (!authManager.requireAdmin()) return;

    const isEdit = Boolean(umpireId);
    const u = isEdit ? state.umpires.find(um => um.UmpireID === umpireId) || {} : {};

    const html = `
        <div class="modal-header">
            <h3>${isEdit ? 'Edit Umpire Record' : 'Register New Umpire'}</h3>
            <button class="modal-close-btn" onclick="modalManager.close()"><i data-lucide="x"></i></button>
        </div>
        <form id="umpireCrudForm" onsubmit="handleUmpireSubmit(event, ${umpireId})">
            <div class="modal-body">
                <div class="form-group">
                    <label>Umpire Full Name <span class="req">*</span></label>
                    <input type="text" class="form-control" name="UmpireName" required value="${escapeHtml(u.UmpireName || '')}" placeholder="e.g. Richard Kettleborough">
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Country <span class="req">*</span></label>
                        <input type="text" class="form-control" name="Country" required value="${escapeHtml(u.Country || '')}" placeholder="e.g. England">
                    </div>
                    <div class="form-group">
                        <label>Experience (Years)</label>
                        <input type="number" class="form-control" name="Experience" min="0" max="60" value="${u.Experience != null ? u.Experience : ''}" placeholder="e.g. 15">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="umpireSubmitBtn">
                    ${isEdit ? 'Update Umpire' : 'Save Umpire'}
                </button>
            </div>
        </form>
    `;
    modalManager.open(html);
}

async function handleUmpireSubmit(e, umpireId) {
    e.preventDefault();
    const btn = document.getElementById('umpireSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const formData = new FormData(e.target);
    const payload = {
        UmpireName: formData.get('UmpireName').trim(),
        Country: formData.get('Country').trim(),
        Experience: formData.get('Experience') ? Number(formData.get('Experience')) : 0
    };

    try {
        if (umpireId) {
            await api.updateUmpire(umpireId, payload);
            showToast(`Umpire "${payload.UmpireName}" updated!`, 'success');
        } else {
            await api.createUmpire(payload);
            showToast(`Umpire "${payload.UmpireName}" registered!`, 'success');
        }
        modalManager.close();
        await fetchAllData();
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = umpireId ? 'Update Umpire' : 'Save Umpire';
    }
}

// --------------------------------------------------------------------------
// 10.7 Scorecards CRUD Modals
// --------------------------------------------------------------------------
function openScorecardModal(scorecardId = null) {
    if (!authManager.requireAdmin()) return;

    const isEdit = Boolean(scorecardId);
    const sc = isEdit ? state.scorecards.find(s => s.ScorecardID === scorecardId) || {} : {};

    const html = `
        <div class="modal-header">
            <h3>${isEdit ? 'Edit Scorecard Record' : 'Add Player Scorecard Entry'}</h3>
            <button class="modal-close-btn" onclick="modalManager.close()"><i data-lucide="x"></i></button>
        </div>
        <form id="scorecardCrudForm" onsubmit="handleScorecardSubmit(event, ${scorecardId})">
            <div class="modal-body">
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Tournament Match <span class="req">*</span></label>
                        <select class="form-control" name="MatchID" required>
                            <option value="">Select Match</option>
                            ${state.matches.map(m => `<option value="${m.MatchID}" ${sc.MatchID === m.MatchID ? 'selected' : ''}>Match #${m.MatchID} (${m.MatchType || 'T20'})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Player <span class="req">*</span></label>
                        <select class="form-control" name="PlayerID" required>
                            <option value="">Select Player</option>
                            ${state.players.map(p => `<option value="${p.PlayerID}" ${sc.PlayerID === p.PlayerID ? 'selected' : ''}>${escapeHtml(p.PlayerName)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Runs Scored</label>
                        <input type="number" class="form-control" name="Runs" min="0" value="${sc.Runs != null ? sc.Runs : 0}">
                    </div>
                    <div class="form-group">
                        <label>Balls Faced</label>
                        <input type="number" class="form-control" name="BallsFaced" min="0" value="${sc.BallsFaced != null ? sc.BallsFaced : 0}">
                    </div>
                </div>
                <div class="form-row-2">
                    <div class="form-group">
                        <label>Wickets Taken</label>
                        <input type="number" class="form-control" name="Wickets" min="0" value="${sc.Wickets != null ? sc.Wickets : 0}">
                    </div>
                    <div class="form-group">
                        <label>Overs Bowled</label>
                        <input type="number" step="0.1" class="form-control" name="Overs" min="0" value="${sc.Overs != null ? sc.Overs : 0}">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                <button type="submit" class="btn btn-primary" id="scSubmitBtn">
                    ${isEdit ? 'Update Entry' : 'Save Scorecard'}
                </button>
            </div>
        </form>
    `;
    modalManager.open(html);
}

async function handleScorecardSubmit(e, scorecardId) {
    e.preventDefault();
    const btn = document.getElementById('scSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const formData = new FormData(e.target);
    const payload = {
        MatchID: Number(formData.get('MatchID')),
        PlayerID: Number(formData.get('PlayerID')),
        Runs: Number(formData.get('Runs') || 0),
        BallsFaced: Number(formData.get('BallsFaced') || 0),
        Wickets: Number(formData.get('Wickets') || 0),
        Overs: Number(formData.get('Overs') || 0)
    };

    try {
        if (scorecardId) {
            await api.updateScorecard(scorecardId, payload);
            showToast('Scorecard entry updated!', 'success');
        } else {
            await api.createScorecard(payload);
            showToast('Scorecard entry saved!', 'success');
        }
        modalManager.close();
        await fetchAllData();
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = scorecardId ? 'Update Entry' : 'Save Scorecard';
    }
}

// --------------------------------------------------------------------------
// 10.8 Delete Confirmation Modal
// --------------------------------------------------------------------------
function confirmDelete(entityType, id, displayName) {
    if (!authManager.requireAdmin()) return;

    const html = `
        <div class="modal-header">
            <h3>Delete Confirmation</h3>
            <button class="modal-close-btn" onclick="modalManager.close()"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
            <div class="delete-confirm-box">
                <div class="delete-warn-icon"><i data-lucide="alert-triangle"></i></div>
                <h4>Are you sure you want to delete this record?</h4>
                <p>You are about to delete <strong>${escapeHtml(displayName)}</strong> (ID #${id}) from the database. This action cannot be undone.</p>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
            <button type="button" class="btn btn-danger" id="deleteConfirmBtn" onclick="executeDelete('${entityType}', ${id})">
                Yes, Delete Record
            </button>
        </div>
    `;
    modalManager.open(html);
}

async function executeDelete(entityType, id) {
    const btn = document.getElementById('deleteConfirmBtn');
    btn.disabled = true;
    btn.textContent = 'Deleting...';

    try {
        switch (entityType) {
            case 'team':
                await api.deleteTeam(id);
                break;
            case 'player':
                await api.deletePlayer(id);
                break;
            case 'stadium':
                await api.deleteStadium(id);
                break;
            case 'sponsor':
                await api.deleteSponsor(id);
                break;
            case 'match':
                await api.deleteMatch(id);
                break;
            case 'umpire':
                await api.deleteUmpire(id);
                break;
            case 'scorecard':
                await api.deleteScorecard(id);
                break;
            default:
                throw new Error('Unknown entity deletion type.');
        }

        showToast(`Record #${id} successfully deleted!`, 'success');
        modalManager.close();
        await fetchAllData();
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Yes, Delete Record';
    }
}
