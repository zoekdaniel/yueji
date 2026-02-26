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
        if (task.nextDate) {
            return todayStr >= task.nextDate;
        }
        return true;
    },

    // 按时间排序（有具体时间的在前，随时的在后）
    sortByTime(tasks) {
        return [...tasks].sort((a, b) => {
            const aTime = a.scheduledTime || '';
            const bTime = b.scheduledTime || '';
            // 没有时间的排最后
            if (!aTime && !bTime) return 0;
            if (!aTime) return 1;
            if (!bTime) return -1;
            return aTime.localeCompare(bTime);
        });
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

    // 获取时间显示文字
    getTimeLabel(task) {
        if (task.scheduledTime) {
            return `⏰ ${task.scheduledTime}`;
        }
        // 兼容旧数据
        if (task.timeSlot) {
            const labels = {
                morning: '🌅 早间',
                evening: '🌙 晚间',
                anytime: '☀️ 随时',
            };
            return labels[task.timeSlot] || '☀️ 随时';
        }
        return '☀️ 随时';
    },

    // 判断任务是否已过时间点
    isPastTime(task) {
        if (!task.scheduledTime) return false;
        const now = new Date();
        const [h, m] = task.scheduledTime.split(':').map(Number);
        const taskMinutes = h * 60 + m;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        return nowMinutes > taskMinutes;
    },

    // 判断任务是否是「当前时间段」（前后30分钟内）
    isCurrentSlot(task) {
        if (!task.scheduledTime) return false;
        const now = new Date();
        const [h, m] = task.scheduledTime.split(':').map(Number);
        const taskMinutes = h * 60 + m;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        return Math.abs(nowMinutes - taskMinutes) <= 30;
    },

    // 今日进度
    getProgress(todayTasks) {
        const total = todayTasks.length;
        const done = todayTasks.filter(t => t.todayStatus === 'done').length;
        return { done, total };
    },
};
