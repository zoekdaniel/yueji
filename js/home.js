/* ===== home.js — 首页「爱自己清单」===== */

const Home = {
    // 安慰语库
    comfortMessages: [
        '休息也是爱自己的一种方式 🌙',
        '今天辛苦了，给自己一个拥抱吧 🤗',
        '允许自己偶尔偷懒，这很正常 💫',
        '不用完美，你已经很棒了 ✨',
        '累了就歇歇，明天又是新的一天 🌸',
        '好好休息，是为了更好地出发 🍃',
        '你值得被温柔对待，包括被自己 💗',
        '偷懒的今天也是值得被珍惜的一天 🌿',
        '不强迫自己，是一种成熟的温柔 🌺',
        '听从身体的声音，它比计划更重要 🎐',
        '给自己按下暂停键，世界不会塌掉 ☁️',
        '疲惫的时候，最勇敢的事就是承认疲惫 🦋',
        '休息不是放弃，而是更好地重新开始 🌈',
        '今天放过自己，明天的你会感谢今天 💐',
        '你不需要每天都冲在前面 🧸',
        '即使什么都不做，你也依然值得被爱 🪷',
        '慢下来没关系，这不是退步 🐌',
        '好好睡一觉，比任何护肤品都有效 💤',
        '给心灵放个假，你值得拥有 🎠',
        '今天的月亮也在温柔地看着你 🌙',
    ],

    // 每日语录
    quotes: [
        '最好的时光，是用心感受当下的每一刻。',
        '慢慢来，比较快。',
        '你不必完美，只需真实。',
        '照顾好自己，才能照顾好你爱的一切。',
        '今天也是值得被珍惜的一天。',
        '最好的投资，是投资自己。',
        '温柔地对待自己，世界才会温柔地对待你。',
        '每一小步都算数。',
        '你值得一切美好的事物。',
        '允许自己按照自己的节奏前行。',
        '深呼吸，一切都会好起来的。',
        '做让自己开心的事，就是最大的意义。',
        '不和别人比较，只和昨天的自己比。',
        '你比你以为的更坚强，更美好。',
        '人生不必太用力，有花自然会开。',
        '爱自己是终身浪漫的开始。',
        '放慢脚步，才能看到沿途的风景。',
        '善待自己是一种能力，也是一种智慧。',
        '今天也请好好爱自己呀。',
        '你的存在本身就是一种美好。',
    ],

    render() {
        this._renderGreeting();
        this._renderQuote();
        this._renderReminders();
        this._renderTaskList();
    },

    _renderReminders() {
        const container = document.getElementById('gentle-reminders');
        if (typeof Treasure === 'undefined') {
            container.classList.add('hidden');
            return;
        }
        const reminders = Treasure.getGentleReminders();
        if (reminders.length === 0) {
            container.classList.add('hidden');
            return;
        }
        container.classList.remove('hidden');
        container.innerHTML = reminders.map(msg =>
            `<div class="reminder-card">🛍️ ${msg}</div>`
        ).join('');
    },

    _renderGreeting() {
        const now = new Date();
        const hour = now.getHours();
        let greeting;

        if (hour < 6) greeting = '夜深了，好好休息 🌙';
        else if (hour < 9) greeting = '早安，新的一天 🌅';
        else if (hour < 12) greeting = '上午好 ☀️';
        else if (hour < 14) greeting = '中午好 🌤️';
        else if (hour < 18) greeting = '下午好 🍃';
        else if (hour < 21) greeting = '晚上好 🌸';
        else greeting = '今天辛苦了 🌙';

        document.querySelector('.greeting-text').textContent = greeting;

        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        document.querySelector('.greeting-date').textContent =
            now.toLocaleDateString('zh-CN', options);
    },

    _renderQuote() {
        // 根据日期确定语录（每天固定一条）
        const dayIndex = Math.floor(Date.now() / 86400000) % this.quotes.length;
        document.querySelector('.quote-text').textContent = this.quotes[dayIndex];
    },

    _renderTaskList() {
        const todayTasks = Tasks.getTodayTasks();
        const container = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');

        if (todayTasks.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        const groups = Tasks.groupByTimeSlot(todayTasks);
        let html = '';

        groups.forEach((group, gi) => {
            // 把「已休息」的任务排到该分组最后
            group.tasks.sort((a, b) => {
                const aRested = a.todayStatus === 'rested' ? 1 : 0;
                const bRested = b.todayStatus === 'rested' ? 1 : 0;
                return aRested - bRested;
            });
            html += `<div class="task-section-title">${group.label}</div>`;
            group.tasks.forEach((task, ti) => {
                const delay = (gi * 3 + ti) * 0.08;
                html += this._renderTaskCard(task, delay);
            });
        });

        container.innerHTML = html;
    },

    _renderTaskCard(task, delay) {
        let statusClass = '';
        let actionsHtml = '';

        if (task.todayStatus === 'done') {
            statusClass = 'completed';
            actionsHtml = `<span class="task-status-badge badge-done">已完成 🌸</span>`;
        } else if (task.todayStatus === 'rested') {
            statusClass = 'rested';
            actionsHtml = `
        <button class="btn-done" onclick="completeTask('${task.id}', this)" title="完成">
          🌸
        </button>
        <button class="btn-undo-rest" onclick="undoRest('${task.id}')">
          撤回休息
        </button>
      `;
        } else {
            actionsHtml = `
        <button class="btn-done" onclick="completeTask('${task.id}', this)" title="完成">
          🌸
        </button>
        <button class="btn-rest" onclick="restTask('${task.id}')">
          今天太累了
        </button>
      `;
        }

        const noteHtml = task.note
            ? `<div class="task-note">${task.note}</div>`
            : '';

        const restedBadge = task.todayStatus === 'rested'
            ? `<span class="task-status-badge badge-rest">下次再做 🌙</span>`
            : '';

        return `
      <div class="task-card ${statusClass}" id="card-${task.id}" style="animation-delay:${delay}s">
        <div class="task-emoji">${task.emoji || '🌸'}</div>
        <div class="task-info">
          <div class="task-name">${restedBadge}${task.name}</div>
          <div class="task-time">${Tasks.getFreqLabel(task)} · ${Tasks.getTimeSlotLabel(task.timeSlot)}</div>
          ${noteHtml}
        </div>
        <div class="task-actions">
          ${actionsHtml}
        </div>
      </div>
    `;
    },
};

// ===== 全局交互函数 =====

function completeTask(taskId, btnEl) {
    const todayStr = new Date().toISOString().slice(0, 10);
    Store.setRecord(taskId, todayStr, 'done');

    // 获取按钮位置，播放开花动画
    if (btnEl) {
        const rect = btnEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        FlowerAnimation.bloom(x, y);
    }

    // 延迟更新UI，让动画先播放
    setTimeout(() => {
        Home.render();
    }, 500);
}

function restTask(taskId) {
    const todayStr = new Date().toISOString().slice(0, 10);
    Store.setRecord(taskId, todayStr, 'rested');

    // 显示安慰语
    showComfort();

    setTimeout(() => {
        Home.render();
    }, 300);
}

function undoRest(taskId) {
    const todayStr = new Date().toISOString().slice(0, 10);
    Store.removeRecord(taskId, todayStr);
    Home.render();
}

function showComfort() {
    const overlay = document.getElementById('comfort-overlay');
    const textEl = overlay.querySelector('.comfort-text');
    const msgs = Home.comfortMessages;
    textEl.textContent = msgs[Math.floor(Math.random() * msgs.length)];
    overlay.classList.remove('hidden');
}

function closeComfort() {
    document.getElementById('comfort-overlay').classList.add('hidden');
}
