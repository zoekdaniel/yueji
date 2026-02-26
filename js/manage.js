/* ===== manage.js — 任务管理页 ===== */

const Manage = {
    currentEditId: null,

    render() {
        const tasks = Store.getTasks();
        const container = document.getElementById('manage-list');

        if (tasks.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="empty-emoji">🌱</div>
          <p>还没有任何任务</p>
          <p class="empty-sub">点击下方按钮，添加你的第一个关怀任务</p>
        </div>
      `;
            return;
        }

        let html = '';
        tasks.forEach((task, i) => {
            html += `
        <div class="manage-card" onclick="editTask('${task.id}')" style="animation-delay:${i * 0.06}s">
          <div class="manage-emoji">${task.emoji || '🌸'}</div>
          <div class="manage-info">
            <div class="manage-name">${task.name}</div>
            <div class="manage-freq">${Tasks.getFreqLabel(task)} · ${Tasks.getTimeSlotLabel(task.timeSlot)}</div>
          </div>
          <div class="manage-arrow">›</div>
        </div>
      `;
        });

        container.innerHTML = html;
    },
};

// ===== 表单函数 =====

function showTaskForm(taskId) {
    Manage.currentEditId = taskId || null;
    const isEdit = !!taskId;

    document.getElementById('form-title').textContent = isEdit ? '编辑任务' : '添加任务';
    document.getElementById('btn-delete').classList.toggle('hidden', !isEdit);

    // 重置表单
    const form = document.getElementById('task-form');
    form.reset();

    // Emoji 选择默认
    document.querySelectorAll('.emoji-opt').forEach(btn => btn.classList.remove('selected'));
    document.querySelector('.emoji-opt[data-emoji="🌸"]').classList.add('selected');

    // 频率选项默认
    document.querySelectorAll('.freq-opt').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('.freq-opt:first-child').classList.add('selected');
    document.getElementById('interval-setting').classList.add('hidden');

    // 时间段默认
    document.querySelectorAll('.time-opt').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('.time-opt:first-child').classList.add('selected');

    if (isEdit) {
        const task = Store.getTaskById(taskId);
        if (task) {
            document.getElementById('form-name').value = task.name || '';
            document.getElementById('form-note').value = task.note || '';

            // 选中对应 Emoji
            document.querySelectorAll('.emoji-opt').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.emoji === task.emoji);
            });

            // 选中对应频率
            const freqRadio = document.querySelector(`input[name="freq"][value="${task.freq}"]`);
            if (freqRadio) {
                freqRadio.checked = true;
                document.querySelectorAll('.freq-opt').forEach(opt => opt.classList.remove('selected'));
                freqRadio.closest('.freq-opt').classList.add('selected');
            }

            if (task.freq === 'interval') {
                document.getElementById('interval-setting').classList.remove('hidden');
                document.getElementById('form-interval').value = task.intervalDays || 2;
            }

            // 选中对应时间段
            const timeRadio = document.querySelector(`input[name="time-slot"][value="${task.timeSlot || 'anytime'}"]`);
            if (timeRadio) {
                timeRadio.checked = true;
                document.querySelectorAll('.time-opt').forEach(opt => opt.classList.remove('selected'));
                timeRadio.closest('.time-opt').classList.add('selected');
            }
        }
    }

    navigateTo('form');
}

function editTask(taskId) {
    showTaskForm(taskId);
}

function saveTask(event) {
    event.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    if (!name) return;

    const selectedEmoji = document.querySelector('.emoji-opt.selected');
    const emoji = selectedEmoji ? selectedEmoji.dataset.emoji : '🌸';

    const freq = document.querySelector('input[name="freq"]:checked').value;
    const timeSlot = document.querySelector('input[name="time-slot"]:checked').value;
    const note = document.getElementById('form-note').value.trim();
    const intervalDays = parseInt(document.getElementById('form-interval').value) || 2;

    const taskData = { name, emoji, freq, timeSlot, note };
    if (freq === 'interval') {
        taskData.intervalDays = intervalDays;
    }

    if (Manage.currentEditId) {
        Store.updateTask(Manage.currentEditId, taskData);
    } else {
        Store.addTask(taskData);
    }

    Manage.currentEditId = null;
    navigateTo('manage');
}

function deleteTask() {
    if (Manage.currentEditId) {
        // 简单确认
        if (confirm('确定要删除这个任务吗？')) {
            Store.deleteTask(Manage.currentEditId);
            Manage.currentEditId = null;
            navigateTo('manage');
        }
    }
}

// ===== 表单交互事件 =====
document.addEventListener('DOMContentLoaded', () => {
    // Emoji 选择
    document.getElementById('emoji-picker').addEventListener('click', (e) => {
        const btn = e.target.closest('.emoji-opt');
        if (!btn) return;
        document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });

    // 频率选项
    document.querySelectorAll('.freq-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.freq-opt').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            const val = opt.querySelector('input').value;
            document.getElementById('interval-setting').classList.toggle('hidden', val !== 'interval');
        });
    });

    // 时间段选项
    document.querySelectorAll('.time-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.time-opt').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });
});
