/* ===== store.js — localStorage 数据持久化层 ===== */

const Store = {
  KEYS: {
    TASKS: 'yueji_tasks',
    RECORDS: 'yueji_records', // 每日完成记录
  },

  // ===== 任务 CRUD =====
  getTasks() {
    const data = localStorage.getItem(this.KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },

  saveTasks(tasks) {
    localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
  },

  addTask(task) {
    const tasks = this.getTasks();
    task.id = this._genId();
    task.createdAt = new Date().toISOString();
    tasks.push(task);
    this.saveTasks(tasks);
    return task;
  },

  updateTask(id, updates) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates };
      this.saveTasks(tasks);
      return tasks[idx];
    }
    return null;
  },

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    this.saveTasks(tasks);
    // 同时清理该任务的记录
    this._cleanRecords(id);
  },

  getTaskById(id) {
    return this.getTasks().find(t => t.id === id) || null;
  },

  // ===== 每日记录 =====
  _getRecords() {
    const data = localStorage.getItem(this.KEYS.RECORDS);
    return data ? JSON.parse(data) : {};
  },

  _saveRecords(records) {
    localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(records));
  },

  // 获取某天某任务的状态
  getRecordStatus(taskId, dateStr) {
    const records = this._getRecords();
    const key = `${dateStr}_${taskId}`;
    return records[key] || null; // { status: 'done'|'rested', time: ISO }
  },

  // 标记完成或休息
  setRecord(taskId, dateStr, status) {
    const records = this._getRecords();
    const key = `${dateStr}_${taskId}`;
    records[key] = { status, time: new Date().toISOString() };
    this._saveRecords(records);

    // 如果是灵活间隔任务，更新下次日期
    if (status === 'done') {
      const task = this.getTaskById(taskId);
      if (task && task.freq === 'interval') {
        const nextDate = new Date(dateStr);
        nextDate.setDate(nextDate.getDate() + (task.intervalDays || 2));
        this.updateTask(taskId, {
          nextDate: nextDate.toISOString().slice(0, 10)
        });
      }
    }
  },

  // 取消打卡
  removeRecord(taskId, dateStr) {
    const records = this._getRecords();
    const key = `${dateStr}_${taskId}`;
    delete records[key];
    this._saveRecords(records);
  },

  // 获取某个任务的连续完成天数
  getStreak(taskId) {
    const records = this._getRecords();
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const key = `${ds}_${taskId}`;
      if (records[key] && (records[key].status === 'done' || records[key].status === 'rested')) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },

  // ===== 内部辅助 =====
  _genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  _cleanRecords(taskId) {
    const records = this._getRecords();
    const cleaned = {};
    for (const [key, val] of Object.entries(records)) {
      if (!key.endsWith(`_${taskId}`)) {
        cleaned[key] = val;
      }
    }
    this._saveRecords(cleaned);
  },

  // 初始化默认任务（首次使用）
  initDefaults() {
    if (this.getTasks().length > 0) return;
    const defaults = [
      {
        name: '皮肤清洁保养',
        emoji: '🧴',
        freq: 'daily',
        timeSlot: 'morning',
        note: '用温水洁面，动作轻柔~',
      },
      {
        name: '晚间护肤',
        emoji: '✨',
        freq: 'daily',
        timeSlot: 'evening',
        note: '记得涂面霜，好好爱自己的肌肤',
      },
      {
        name: '按摩梳梳头',
        emoji: '💆',
        freq: 'interval',
        intervalDays: 2,
        timeSlot: 'anytime',
        note: '从前额梳到后脑，放松头皮',
      },
      {
        name: '艾灸放松',
        emoji: '🔥',
        freq: 'weekend',
        timeSlot: 'anytime',
        note: '记录今天灸了哪个穴位',
      },
    ];
    defaults.forEach(t => this.addTask(t));
  }
};
