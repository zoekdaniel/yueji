/* ===== calendar.js — 繁花日历 ===== */

const Calendar = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),

    render() {
        this._renderMonthLabel();
        this._renderGrid();
    },

    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    },

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    },

    _renderMonthLabel() {
        const label = `${this.currentYear}年${this.currentMonth + 1}月`;
        document.getElementById('cal-month-label').textContent = label;
    },

    _renderGrid() {
        const grid = document.getElementById('cal-grid');
        const year = this.currentYear;
        const month = this.currentMonth;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // 周一为一周的开始 (0=周一, 6=周日)
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        const todayStr = new Date().toISOString().slice(0, 10);
        let html = '';

        // 填充空白
        for (let i = 0; i < startDay; i++) {
            html += '<div class="cal-cell empty"></div>';
        }

        // 填充日期
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            const status = this._getDayStatus(dateStr);

            let icon = '';
            let statusClass = '';

            if (isFuture) {
                statusClass = 'future';
            } else if (status === 'all-done') {
                icon = '🌸';
                statusClass = 'bloom';
            } else if (status === 'partial') {
                icon = '🌱';
                statusClass = 'sprout';
            } else if (status === 'all-rested') {
                icon = '☁️';
                statusClass = 'cloud';
            } else if (status === 'mixed') {
                icon = '🌱';
                statusClass = 'sprout';
            }

            const todayClass = isToday ? ' today' : '';
            const clickable = !isFuture && status !== 'none' ? ` onclick="Calendar.showDetail('${dateStr}')"` : '';

            html += `
        <div class="cal-cell ${statusClass}${todayClass}"${clickable}>
          <span class="cal-day">${d}</span>
          <span class="cal-icon">${icon}</span>
        </div>
      `;
        }

        grid.innerHTML = html;
    },

    // 判断某天的状态
    _getDayStatus(dateStr) {
        const tasks = Store.getTasks();
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();

        // 筛选当天应该出现的任务
        const todayTasks = tasks.filter(task => {
            switch (task.freq) {
                case 'daily': return true;
                case 'weekend': return dayOfWeek === 0 || dayOfWeek === 6;
                case 'interval': return true; // 简化：间隔任务都计入
                default: return true;
            }
        });

        if (todayTasks.length === 0) return 'none';

        let doneCount = 0;
        let restCount = 0;

        todayTasks.forEach(task => {
            const record = Store.getRecordStatus(task.id, dateStr);
            if (record) {
                if (record.status === 'done') doneCount++;
                else if (record.status === 'rested') restCount++;
            }
        });

        const total = todayTasks.length;
        if (doneCount === 0 && restCount === 0) return 'none';
        if (doneCount === total) return 'all-done';
        if (restCount === total) return 'all-rested';
        if (doneCount > 0 || restCount > 0) return 'partial';
        return 'none';
    },

    // 显示某天的回顾卡片
    showDetail(dateStr) {
        const tasks = Store.getTasks();
        const date = new Date(dateStr);

        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        document.getElementById('day-detail-date').textContent =
            date.toLocaleDateString('zh-CN', options);

        const doneTasks = [];
        const restTasks = [];

        tasks.forEach(task => {
            const record = Store.getRecordStatus(task.id, dateStr);
            if (record) {
                if (record.status === 'done') doneTasks.push(task);
                else if (record.status === 'rested') restTasks.push(task);
            }
        });

        let bodyHtml = '';

        if (doneTasks.length > 0) {
            bodyHtml += '<p class="day-detail-intro">这一天，你做了这些温柔的事：</p>';
            bodyHtml += '<div class="day-detail-list">';
            doneTasks.forEach(t => {
                bodyHtml += `<div class="day-detail-item done">${t.emoji || '🌸'} ${t.name}</div>`;
            });
            bodyHtml += '</div>';
        }

        if (restTasks.length > 0) {
            bodyHtml += '<p class="day-detail-rest-intro">你也温柔地让自己休息了：</p>';
            bodyHtml += '<div class="day-detail-list">';
            restTasks.forEach(t => {
                bodyHtml += `<div class="day-detail-item rest">☁️ ${t.name}</div>`;
            });
            bodyHtml += '</div>';
        }

        if (doneTasks.length === 0 && restTasks.length === 0) {
            bodyHtml = '<p class="day-detail-intro">这一天没有记录，但每一天都值得被珍惜 🌿</p>';
        }

        // 鼓励语
        const encouragements = [
            '你一直在用心地爱自己，真的很棒 ✨',
            '每一次小小的关怀，都是对自己的告白 💌',
            '你值得世界上所有的温柔 🌸',
            '好好照顾自己的你，闪闪发光 ✨',
            '你比你想象的更加美好 🌙',
        ];
        const enc = encouragements[Math.floor(Math.random() * encouragements.length)];
        bodyHtml += `<p class="day-detail-encourage">${enc}</p>`;

        document.getElementById('day-detail-body').innerHTML = bodyHtml;
        document.getElementById('day-detail-overlay').classList.remove('hidden');
    },

    closeDetail() {
        document.getElementById('day-detail-overlay').classList.add('hidden');
    },
};
