/* ===== Auth Module ===== */
const Auth = (() => {
    function showAuthModal(mode = 'login') {
        // Remove existing modal if any
        const existing = document.getElementById('authOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'authOverlay';
        overlay.className = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-modal">
                <h2>${mode === 'login' ? '登录' : '注册'}</h2>
                <p class="auth-subtitle">${mode === 'login' ? '登录以同步学习进度' : '创建账户开始学习之旅'}</p>
                <div class="auth-error" id="authError"></div>
                <label for="authUser">用户名</label>
                <input type="text" id="authUser" placeholder="输入用户名" autocomplete="username" />
                <label for="authPass">密码</label>
                <input type="password" id="authPass" placeholder="输入密码" autocomplete="current-password" />
                <button class="btn btn-primary" id="authSubmit">${mode === 'login' ? '登录' : '注册'}</button>
                <div class="auth-switch">
                    ${mode === 'login'
                        ? '还没有账户？<a id="authSwitch">注册一个</a>'
                        : '已有账户？<a id="authSwitch">去登录</a>'}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => overlay.classList.add('visible'));

        const userInput = document.getElementById('authUser');
        const passInput = document.getElementById('authPass');
        const errorDiv = document.getElementById('authError');
        const submitBtn = document.getElementById('authSubmit');
        const switchLink = document.getElementById('authSwitch');

        userInput.focus();

        function handleSubmit() {
            const username = userInput.value.trim();
            const password = passInput.value;
            const currentMode = submitBtn.textContent === '登录' ? 'login' : 'register';
            const result = currentMode === 'login'
                ? ProgressTracker.login(username, password)
                : ProgressTracker.register(username, password);

            if (result.ok) {
                closeAuthModal();
                onAuthSuccess();
            } else {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
            }
        }

        submitBtn.addEventListener('click', handleSubmit);
        passInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
        userInput.addEventListener('keydown', e => { if (e.key === 'Enter') passInput.focus(); });

        switchLink.addEventListener('click', () => {
            const newMode = mode === 'login' ? 'register' : 'login';
            closeAuthModal();
            showAuthModal(newMode);
        });

        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeAuthModal();
        });
    }

    function closeAuthModal() {
        const overlay = document.getElementById('authOverlay');
        if (!overlay) return;
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 250);
    }

    function onAuthSuccess() {
        // Update nav user display
        const userEl = document.querySelector('.top-nav-user');
        if (userEl) {
            const user = ProgressTracker.getUser();
            if (user) {
                userEl.innerHTML = `
                    <span class="progress-mini" id="navProgress"></span>
                    <div class="user-avatar" id="userAvatar" title="${user.username}">${user.username[0].toUpperCase()}</div>
                `;
                updateNavProgress();
                // Add logout on avatar click
                document.getElementById('userAvatar').addEventListener('click', () => {
                    if (confirm('退出登录？')) {
                        ProgressTracker.logout();
                        location.reload();
                    }
                });
            }
        }
        // Refresh page progress indicators
        if (typeof refreshProgress === 'function') refreshProgress();
    }

    function updateNavProgress() {
        const navProg = document.getElementById('navProgress');
        if (!navProg) return;
        // allNoteIds should be defined on the page
        if (typeof allNoteIds === 'undefined') return;
        const pct = ProgressTracker.getProgressPercent(allNoteIds);
        navProg.innerHTML = `
            <span class="progress-mini-bar"><span class="progress-mini-fill" style="width:${pct}%"></span></span>
            ${pct}%
        `;
    }

    function init() {
        const user = ProgressTracker.getUser();
        const userEl = document.querySelector('.top-nav-user');
        if (!userEl) return;

        if (user) {
            userEl.innerHTML = `
                <span class="progress-mini" id="navProgress"></span>
                <div class="user-avatar" id="userAvatar" title="${user.username}">${user.username[0].toUpperCase()}</div>
            `;
            updateNavProgress();
            document.getElementById('userAvatar').addEventListener('click', () => {
                if (confirm('退出登录？')) {
                    ProgressTracker.logout();
                    location.reload();
                }
            });
        } else {
            userEl.innerHTML = `
                <a href="javascript:void(0)" class="btn btn-secondary" style="padding:8px 18px;font-size:0.85rem" id="loginBtn">登录</a>
            `;
            document.getElementById('loginBtn').addEventListener('click', () => showAuthModal('login'));
        }
    }

    return { showAuthModal, closeAuthModal, init, updateNavProgress };
})();

if (typeof window !== 'undefined') window.Auth = Auth;
