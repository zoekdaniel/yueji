/* ===== app.js — 应用主入口 + 路由 ===== */

let currentPage = 'home';

function navigateTo(pageName) {
    // 隐藏表单页时不更新底部导航
    const isFormPage = pageName === 'form';

    // 当前页面淡出
    const currentEl = document.querySelector('.page.active');
    if (currentEl) {
        currentEl.classList.remove('visible');
        setTimeout(() => {
            currentEl.classList.remove('active');

            // 显示新页面
            const newEl = document.getElementById(`page-${pageName}`);
            if (newEl) {
                newEl.classList.add('active');
                // 触发回流后添加动画
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        newEl.classList.add('visible');
                    });
                });
            }

            // 渲染页面内容
            if (pageName === 'home') Home.render();
            if (pageName === 'manage') Manage.render();

            // 更新底部导航
            if (!isFormPage) {
                currentPage = pageName;
                document.querySelectorAll('.nav-item').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.page === pageName);
                });
            }

            // 控制导航栏在表单页的显示
            document.getElementById('bottom-nav').style.display =
                isFormPage ? 'none' : 'flex';
        }, 200);
    }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    // 初始化默认任务（首次使用）
    Store.initDefaults();

    // 初始化开花动画
    FlowerAnimation.init();

    // 渲染首页
    const homePage = document.getElementById('page-home');
    homePage.classList.add('active');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            homePage.classList.add('visible');
        });
    });
    Home.render();

    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => { });
    }
});
