/* ===== treasure.js — 生活百宝箱 ===== */

const Treasure = {
    currentCategory: 'all',
    currentEditId: null,
    photoData: null,

    render() {
        this._renderCategories();
        this._renderItems();
    },

    // ===== 分区 Tab =====
    _renderCategories() {
        const categories = Store.getCategories();
        const container = document.getElementById('treasure-categories');

        let html = `<button class="cat-tab ${this.currentCategory === 'all' ? 'active' : ''}" onclick="Treasure.switchCategory('all')">全部</button>`;

        categories.forEach(cat => {
            const active = this.currentCategory === cat.id ? 'active' : '';
            html += `<button class="cat-tab ${active}" onclick="Treasure.switchCategory('${cat.id}')">${cat.emoji} ${cat.name}</button>`;
        });

        container.innerHTML = html;
    },

    switchCategory(catId) {
        this.currentCategory = catId;
        this.render();
    },

    // ===== 物品列表 =====
    _renderItems() {
        const items = Store.getTreasureItems();
        const container = document.getElementById('treasure-items');

        let filtered = this.currentCategory === 'all'
            ? items
            : items.filter(i => i.categoryId === this.currentCategory);

        // 收藏优先排序
        filtered.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

        if (filtered.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="empty-emoji">🎁</div>
          <p>还没有物品</p>
          <p class="empty-sub">点击下方按钮添加你的第一件宝贝吧</p>
        </div>
      `;
            return;
        }

        let html = '';
        filtered.forEach(item => {
            const cat = Store.getCategoryById(item.categoryId);
            const statusLabel = this._getStatusLabel(item.status);
            const favStar = item.favorite ? '<span class="item-fav">⭐</span>' : '';
            const qtyDisplay = item.qty > 1 ? `<span class="item-qty">×${item.qty}</span>` : '';
            const noteHtml = item.note ? `<div class="item-note">${item.note}</div>` : '';
            const lowClass = item.status === 'low' ? ' item-low' : '';

            const iconHtml = item.photo
                ? `<img src="${item.photo}" class="item-photo" alt="">`
                : `<span class="item-emoji">${item.emoji || '🎁'}</span>`;

            html += `
        <div class="item-card${lowClass}" onclick="Treasure.showItemForm('${item.id}')">
          <div class="item-icon">${iconHtml}</div>
          <div class="item-info">
            <div class="item-name">${favStar}${item.name}${qtyDisplay}</div>
            <div class="item-meta">${cat ? cat.emoji + ' ' + cat.name : ''} · ${statusLabel}</div>
            ${noteHtml}
          </div>
          <span class="manage-arrow">›</span>
        </div>
      `;
        });

        container.innerHTML = html;
    },

    _getStatusLabel(status) {
        switch (status) {
            case 'new': return '全新 ✨';
            case 'using': return '使用中 🧴';
            case 'low': return '快空瓶啦 💨';
            default: return status;
        }
    },

    // ===== 物品表单 =====
    showItemForm(itemId) {
        this.currentEditId = itemId || null;
        this.photoData = null;

        const title = document.getElementById('item-form-title');
        const deleteBtn = document.getElementById('btn-delete-item');

        // 渲染分区选项
        this._renderCategorySelect();

        // 设置 emoji picker 事件
        this._initEmojiPicker();

        if (itemId) {
            title.textContent = '编辑物品';
            deleteBtn.classList.remove('hidden');
            const item = Store.getTreasureItemById(itemId);
            if (item) {
                document.getElementById('item-form-id').value = item.id;
                document.getElementById('item-name').value = item.name;
                document.getElementById('item-qty').value = item.qty || 1;
                document.getElementById('item-note').value = item.note || '';
                document.getElementById('item-favorite').checked = !!item.favorite;

                // 选中 emoji
                document.querySelectorAll('#item-emoji-picker .emoji-opt').forEach(el => {
                    el.classList.toggle('selected', el.dataset.emoji === item.emoji);
                });

                // 选中状态
                document.querySelectorAll('[name="item-status"]').forEach(r => {
                    if (r.value === item.status) {
                        r.checked = true;
                        r.closest('.freq-opt').classList.add('selected');
                    } else {
                        r.closest('.freq-opt').classList.remove('selected');
                    }
                });

                // 选中分区
                document.querySelectorAll('#item-category-select .freq-opt').forEach(el => {
                    const radio = el.querySelector('input');
                    if (radio.value === item.categoryId) {
                        radio.checked = true;
                        el.classList.add('selected');
                    } else {
                        el.classList.remove('selected');
                    }
                });

                // 照片
                if (item.photo) {
                    this.photoData = item.photo;
                    document.getElementById('item-photo-img').src = item.photo;
                    document.getElementById('item-photo-preview').classList.remove('hidden');
                } else {
                    document.getElementById('item-photo-preview').classList.add('hidden');
                }
            }
        } else {
            title.textContent = '添加物品';
            deleteBtn.classList.add('hidden');
            document.getElementById('item-form').reset();
            document.getElementById('item-form-id').value = '';
            document.getElementById('item-photo-preview').classList.add('hidden');

            // 重置 emoji
            document.querySelectorAll('#item-emoji-picker .emoji-opt').forEach((el, i) => {
                el.classList.toggle('selected', i === 0);
            });

            // 重置 status radio
            document.querySelectorAll('[name="item-status"]').forEach((r, i) => {
                r.closest('.freq-opt').classList.toggle('selected', i === 0);
            });
        }

        navigateTo('item-form');
    },

    _renderCategorySelect() {
        const categories = Store.getCategories();
        const container = document.getElementById('item-category-select');
        let html = '';
        categories.forEach((cat, i) => {
            html += `
        <label class="freq-opt ${i === 0 ? 'selected' : ''}">
          <input type="radio" name="item-category" value="${cat.id}" ${i === 0 ? 'checked' : ''}>
          <span class="freq-label">${cat.emoji} ${cat.name}</span>
        </label>
      `;
        });
        container.innerHTML = html;

        // 绑定选中效果
        container.querySelectorAll('.freq-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                container.querySelectorAll('.freq-opt').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });
    },

    _initEmojiPicker() {
        document.querySelectorAll('#item-emoji-picker .emoji-opt').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('#item-emoji-picker .emoji-opt').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            };
        });
    },

    // 拍照处理
    handlePhoto(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            // 压缩图片
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 200; // 最大 200px
                let w = img.width, h = img.height;
                if (w > h) { h = h * maxSize / w; w = maxSize; }
                else { w = w * maxSize / h; h = maxSize; }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.6);
                Treasure.photoData = compressed;
                document.getElementById('item-photo-img').src = compressed;
                document.getElementById('item-photo-preview').classList.remove('hidden');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    removePhoto() {
        this.photoData = null;
        document.getElementById('item-photo-preview').classList.add('hidden');
        document.getElementById('item-photo').value = '';
    },

    adjustQty(delta) {
        const input = document.getElementById('item-qty');
        let val = parseInt(input.value) || 1;
        val = Math.max(0, Math.min(999, val + delta));
        input.value = val;
    },

    saveItem(event) {
        event.preventDefault();

        const selectedEmoji = document.querySelector('#item-emoji-picker .emoji-opt.selected');
        const selectedCategory = document.querySelector('[name="item-category"]:checked');
        const selectedStatus = document.querySelector('[name="item-status"]:checked');

        const itemData = {
            name: document.getElementById('item-name').value.trim(),
            emoji: selectedEmoji ? selectedEmoji.dataset.emoji : '🎁',
            categoryId: selectedCategory ? selectedCategory.value : '',
            status: selectedStatus ? selectedStatus.value : 'new',
            qty: parseInt(document.getElementById('item-qty').value) || 1,
            favorite: document.getElementById('item-favorite').checked,
            note: document.getElementById('item-note').value.trim(),
            photo: this.photoData || null,
        };

        if (this.currentEditId) {
            Store.updateTreasureItem(this.currentEditId, itemData);
        } else {
            Store.addTreasureItem(itemData);
        }

        navigateTo('treasure');
    },

    deleteItem() {
        if (this.currentEditId && confirm('确定要删除这个物品吗？')) {
            Store.deleteTreasureItem(this.currentEditId);
            navigateTo('treasure');
        }
    },

    // ===== 分区管理 =====
    showCategoryManager() {
        this._renderCategoryList();
        navigateTo('category-manager');
    },

    _renderCategoryList() {
        const categories = Store.getCategories();
        const container = document.getElementById('category-list');
        const items = Store.getTreasureItems();

        let html = '';
        categories.forEach(cat => {
            const count = items.filter(i => i.categoryId === cat.id).length;
            const isDefault = cat.isDefault;
            html += `
        <div class="manage-item">
          <div class="manage-emoji">${cat.emoji}</div>
          <div class="manage-info">
            <div class="manage-name">${cat.name}</div>
            <div class="manage-meta">${count} 件物品</div>
          </div>
          ${isDefault ? '<span class="manage-meta">默认</span>' : `<button class="btn-rest" style="font-size:0.7rem" onclick="Treasure.removeCategory('${cat.id}')">删除</button>`}
        </div>
      `;
        });

        container.innerHTML = html;
    },

    addCategory() {
        const name = document.getElementById('new-cat-name').value.trim();
        const emoji = document.getElementById('new-cat-emoji').value.trim();
        if (!name) return;

        Store.addCategory({ name, emoji: emoji || '📦' });
        document.getElementById('new-cat-name').value = '';
        document.getElementById('new-cat-emoji').value = '';
        this._renderCategoryList();
    },

    removeCategory(catId) {
        const items = Store.getTreasureItems().filter(i => i.categoryId === catId);
        if (items.length > 0) {
            alert(`该分区下还有 ${items.length} 件物品，请先移走或删除它们`);
            return;
        }
        Store.removeCategory(catId);
        this._renderCategoryList();
    },

    // ===== 获取温柔提醒 =====
    getGentleReminders() {
        const items = Store.getTreasureItems().filter(i => i.status === 'low');
        return items.map(item => {
            const messages = [
                `你的${item.name}快要空瓶啦，下班路上记得带一支新的回家犒劳自己哦~ 🛍️`,
                `${item.name}快见底了，是时候补货啦，对自己好一点 💕`,
                `温馨提醒：${item.name}余量不多了，记得及时补充哦 🌸`,
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        });
    },
};
