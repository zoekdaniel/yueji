/* ===== tasks.js — 弹性任务调度逻辑 ===== */

const Tasks = {
    // 获取今天应该显示的任务
    getTodayTasks() {
        const tasks = Store.getTasks();
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const dayOfWeek = today.getDay(); // 0=周日, 6=周六

        return tasks.filter(task => {
            switch (task.freq) {
                case 'daily':
                    return true;

                case 'interval':
                    return this._isIntervalDue(task, todayStr);

                case 'weekend':
                    return dayOfWeek === 0 || dayOfWeek === 6;

                default:
                    return true;
            }
        }).map(task => {
            const record = Store.getRecordStatus(task.id, todayStr);
            return {
                ...task,
                todayStatus: record ? record.status : null,
                dateStr: todayStr,
            };
        });
    },

    // 判断灵活间隔任务是否到期
    _isIntervalDue(task, todayStr) {
        // 如果有设定 nextDate
        if (task.nextDate) {
            return todayStr >= task.nextDate;
        }
        // 没有 nextDate，说明从未完成过，默认今天开始
        return true;
    },

    // 按时间段分组排序
    groupByTimeSlot(tasks) {
        const groups = {
            morning: { label: '🌅 早间', tasks: [] },
            anytime: { label: '☀️ 随时', tasks: [] },
            evening: { label: '🌙 晚间', tasks: [] },
        };

        tasks.forEach(t => {
            const slot = t.timeSlot || 'anytime';
            if (groups[slot]) {
                groups[slot].tasks.push(t);
            } else {
                groups.anytime.tasks.push(t);
            }
        });

        return Object.entries(groups)
            .filter(([_, g]) => g.tasks.length > 0)
            .map(([key, g]) => ({ key, ...g }));
    },

    // 获取频率描述文字
    getFreqLabel(task) {
        switch (task.freq) {
            case 'daily':
                return '每日必修';
            case 'interval':
                return `每 ${task.intervalDays || 2} 天`;
            case 'weekend':
                return '周末充能';
            default:
                return '';
        }
    },

    getTimeSlotLabel(slot) {
        const labels = {
            morning: '🌅 早间',
            evening: '🌙 晚间',
            anytime: '☀️ 随时',
        };
        return labels[slot] || '☀️ 随时';
    },
};
