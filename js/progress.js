/* ===== Progress Tracker ===== */
const ProgressTracker = (() => {
    const STORAGE_KEY = 'camp_progress';
    const USER_KEY = 'camp_user';

    function getUser() {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            const user = JSON.parse(raw);
            if (user.expiry && Date.now() > user.expiry) {
                localStorage.removeItem(USER_KEY);
                return null;
            }
            return user;
        } catch { return null; }
    }

    function isLoggedIn() { return getUser() !== null; }

    function login(username, password) {
        // Simple hash for local validation
        const hash = simpleHash(username + ':' + password);
        const existing = localStorage.getItem('camp_cred_' + username);
        if (existing) {
            if (existing !== hash) return { ok: false, error: '密码错误' };
        } else {
            localStorage.setItem('camp_cred_' + username, hash);
        }
        const user = {
            username,
            token: hash,
            expiry: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return { ok: true, user };
    }

    function register(username, password) {
        if (!username || username.length < 2) return { ok: false, error: '用户名至少2个字符' };
        if (!password || password.length < 3) return { ok: false, error: '密码至少3个字符' };
        const existing = localStorage.getItem('camp_cred_' + username);
        if (existing) return { ok: false, error: '用户名已存在' };
        return login(username, password);
    }

    function logout() {
        localStorage.removeItem(USER_KEY);
    }

    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash |= 0;
        }
        return 'h_' + Math.abs(hash).toString(36);
    }

    // Progress data keyed by user
    function getProgressKey() {
        const user = getUser();
        return user ? `${STORAGE_KEY}_${user.username}` : STORAGE_KEY;
    }

    function loadProgress() {
        const raw = localStorage.getItem(getProgressKey());
        if (!raw) return { progress: {}, lastVisit: null };
        try { return JSON.parse(raw); } catch { return { progress: {}, lastVisit: null }; }
    }

    function saveProgress(data) {
        data.lastVisit = new Date().toISOString().slice(0, 10);
        localStorage.setItem(getProgressKey(), JSON.stringify(data));
    }

    function markRead(noteId) {
        const data = loadProgress();
        if (!data.progress[noteId]) {
            data.progress[noteId] = { read: true, date: new Date().toISOString().slice(0, 10) };
        } else {
            data.progress[noteId].read = true;
            data.progress[noteId].date = new Date().toISOString().slice(0, 10);
        }
        saveProgress(data);
    }

    function markUnread(noteId) {
        const data = loadProgress();
        if (data.progress[noteId]) {
            data.progress[noteId].read = false;
        }
        saveProgress(data);
    }

    function isRead(noteId) {
        const data = loadProgress();
        return data.progress[noteId]?.read === true;
    }

    function getReadCount(totalIds) {
        const data = loadProgress();
        return totalIds.filter(id => data.progress[id]?.read).length;
    }

    function getProgressPercent(totalIds) {
        if (!totalIds.length) return 0;
        return Math.round((getReadCount(totalIds) / totalIds.length) * 100);
    }

    function getReadDate(noteId) {
        const data = loadProgress();
        return data.progress[noteId]?.date || null;
    }

    return {
        getUser, isLoggedIn, login, register, logout,
        loadProgress, saveProgress, markRead, markUnread,
        isRead, getReadCount, getProgressPercent, getReadDate
    };
})();

// Export for use in pages
if (typeof window !== 'undefined') window.ProgressTracker = ProgressTracker;
