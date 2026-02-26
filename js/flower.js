/* ===== flower.js — 开花绽放动画引擎 ===== */

const FlowerAnimation = {
    canvas: null,
    ctx: null,
    particles: [],
    animating: false,

    init() {
        this.canvas = document.getElementById('flower-canvas');
        this.ctx = this.canvas.getContext('2d');
        this._resize();
        window.addEventListener('resize', () => this._resize());
    },

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    // 在指定位置播放开花动画
    bloom(x, y) {
        const palette = this._randomPalette();
        const petalCount = 12 + Math.floor(Math.random() * 8);

        // 花瓣粒子
        for (let i = 0; i < petalCount; i++) {
            const angle = (Math.PI * 2 * i) / petalCount + (Math.random() - 0.5) * 0.3;
            const speed = 2 + Math.random() * 4;
            const size = 6 + Math.random() * 10;

            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                maxSize: size,
                color: palette[Math.floor(Math.random() * palette.length)],
                alpha: 1,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1,
                life: 1,
                decay: 0.012 + Math.random() * 0.008,
                type: 'petal',
            });
        }

        // 光点
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;

            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: '#FFE4C4',
                alpha: 1,
                life: 1,
                decay: 0.02 + Math.random() * 0.01,
                type: 'sparkle',
            });
        }

        if (!this.animating) {
            this.animating = true;
            this._animate();
        }
    },

    _randomPalette() {
        const palettes = [
            ['#D4A5A5', '#E8C8C8', '#F5E6E6', '#FFD1DC'], // 茱萸粉系
            ['#9CAF88', '#B8CCAA', '#D4E4C8', '#E8F0E2'], // 鼠尾草绿系
            ['#B8A9C9', '#CAB8DB', '#DCC7ED', '#E8E0F0'], // 薰衣草紫系
            ['#F0C987', '#F5D8A8', '#FAE7C9', '#FFF0DC'], // 暖杏色系
            ['#A8D8EA', '#B8E4F0', '#C8F0F6', '#E0F8FC'], // 雾蓝系
        ];
        return palettes[Math.floor(Math.random() * palettes.length)];
    },

    _animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            p.life -= p.decay;
            if (p.life <= 0) return false;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // 重力
            p.vx *= 0.99;
            p.alpha = p.life;

            if (p.type === 'petal') {
                this._drawPetal(p);
            } else {
                this._drawSparkle(p);
            }

            return true;
        });

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this._animate());
        } else {
            this.animating = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    _drawPetal(p) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        p.rotation += p.rotSpeed;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        // 花瓣形状
        const s = p.size * (0.5 + p.life * 0.5);
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.8, -s * 0.8, s, s * 0.2, 0, s);
        ctx.bezierCurveTo(-s, s * 0.2, -s * 0.8, -s * 0.8, 0, -s);
        ctx.fill();

        ctx.restore();
    },

    _drawSparkle(p) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },
};
