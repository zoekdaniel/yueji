/* ===== store.js — localStorage 数据持久化层 ===== */

const Store = {
  KEYS: {
    TASKS: 'yueji_tasks',
    RECORDS: 'yueji_records',
    CATEGORIES: 'yueji_categories',
    TREASURE: 'yueji_treasure',
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
        scheduledTime: '07:30',
        note: '用温水洁面，动作轻柔~',
      },
      {
        name: '晚间护肤',
        emoji: '✨',
        freq: 'daily',
        timeSlot: 'evening',
        scheduledTime: '22:00',
        note: '记得涂面霜，好好爱自己的肌肤',
      },
      {
        name: '按摩梳梳头',
        emoji: '💆',
        freq: 'interval',
        intervalDays: 2,
        timeSlot: 'anytime',
        scheduledTime: '',
        note: '从前额梳到后脑，放松头皮',
      },
      {
        name: '艾灸放松',
        emoji: '🔥',
        freq: 'weekend',
        timeSlot: 'anytime',
        scheduledTime: '15:00',
        note: '记录今天灸了哪个穴位',
      },
    ];
    defaults.forEach(t => this.addTask(t));
  },

  // ===== 百宝箱：分区管理 =====
  getCategories() {
    const data = localStorage.getItem(this.KEYS.CATEGORIES);
    if (data) return JSON.parse(data);
    // 初始化默认分区
    const defaults = [
      { id: 'cat_skincare', name: '洗漱护肤区', emoji: '🫧', isDefault: true },
      { id: 'cat_makeup', name: '彩妆魔法区', emoji: '💄', isDefault: true },
      { id: 'cat_personal', name: '私护安心区', emoji: '🌸', isDefault: true },
      { id: 'cat_wardrobe', name: '胶囊衣橱区', emoji: '👗', isDefault: true },
    ];
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(defaults));
    return defaults;
  },

  getCategoryById(id) {
    return this.getCategories().find(c => c.id === id) || null;
  },

  addCategory(cat) {
    const categories = this.getCategories();
    cat.id = 'cat_' + this._genId();
    cat.isDefault = false;
    categories.push(cat);
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
    return cat;
  },

  removeCategory(catId) {
    let categories = this.getCategories();
    categories = categories.filter(c => c.id !== catId);
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // ===== 百宝箱：物品管理 =====
  getTreasureItems() {
    const data = localStorage.getItem(this.KEYS.TREASURE);
    return data ? JSON.parse(data) : [];
  },

  _saveTreasureItems(items) {
    localStorage.setItem(this.KEYS.TREASURE, JSON.stringify(items));
  },

  getTreasureItemById(id) {
    return this.getTreasureItems().find(i => i.id === id) || null;
  },

  addTreasureItem(item) {
    const items = this.getTreasureItems();
    item.id = 'item_' + this._genId();
    item.createdAt = new Date().toISOString();
    items.push(item);
    this._saveTreasureItems(items);
    return item;
  },

  updateTreasureItem(id, updates) {
    const items = this.getTreasureItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this._saveTreasureItems(items);
      return items[idx];
    }
    return null;
  },

  deleteTreasureItem(id) {
    let items = this.getTreasureItems();
    items = items.filter(i => i.id !== id);
    this._saveTreasureItems(items);
  },
};
