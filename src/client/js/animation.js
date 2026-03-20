/**
 * 掼蛋大师 - 动画效果模块
 * Guandan Master - Animation Effects
 * 
 * 提供卡牌动画、过渡效果等视觉增强
 * 
 * 作者：代码虾
 * 创建日期：2026-03-20
 */

// ========================================
// 动画工具类
// ========================================

class AnimationManager {
    constructor() {
        this.enabled = true;
        this.animations = new Map();
    }
    
    /**
     * 启用/禁用动画
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * 播放卡牌飞出动画
     */
    playCardFly(fromElement, toElement, cardData, onComplete) {
        if (!this.enabled) {
            if (onComplete) onComplete();
            return;
        }
        
        const card = fromElement.cloneNode(true);
        card.style.position = 'fixed';
        card.style.zIndex = '9999';
        card.style.transition = 'all 0.5s ease-in-out';
        card.style.width = fromElement.offsetWidth + 'px';
        card.style.height = fromElement.offsetHeight + 'px';
        
        // 初始位置
        const fromRect = fromElement.getBoundingClientRect();
        card.style.left = fromRect.left + 'px';
        card.style.top = fromRect.top + 'px';
        
        document.body.appendChild(card);
        
        // 目标位置
        const toRect = toElement.getBoundingClientRect();
        const targetLeft = toRect.left + (toRect.width - fromRect.width) / 2;
        const targetTop = toRect.top + (toRect.height - fromRect.height) / 2;
        
        // 强制重绘
        card.offsetHeight;
        
        // 动画到目标位置
        card.style.left = targetLeft + 'px';
        card.style.top = targetTop + 'px';
        card.style.transform = 'scale(0.8) rotate(10deg)';
        card.style.opacity = '0.7';
        
        // 动画结束
        setTimeout(() => {
            card.remove();
            if (onComplete) onComplete();
        }, 500);
    }
    
    /**
     * 发牌动画
     */
    dealCardAnimation(cardElement, delay = 0) {
        if (!this.enabled) return;
        
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateX(-100px) rotate(-10deg)';
        cardElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'translateX(0) rotate(0)';
        }, delay);
    }
    
    /**
     * 出牌动画
     */
    playCardAnimation(cardElement) {
        if (!this.enabled) return;
        
        cardElement.classList.add('card-play');
        
        setTimeout(() => {
            cardElement.classList.remove('card-play');
        }, 500);
    }
    
    /**
     * 卡牌高亮脉冲动画
     */
    pulseAnimation(element, duration = 1000) {
        if (!this.enabled) return;
        
        const originalBoxShadow = element.style.boxShadow;
        element.style.boxShadow = '0 0 20px var(--gold)';
        element.style.transition = 'box-shadow 0.3s ease';
        
        setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
        }, duration);
    }
    
    /**
     * 胜利庆祝动画
     */
    celebrateWin(containerElement) {
        if (!this.enabled) return;
        
        // 创建彩带粒子
        const colors = ['#D4AF37', '#C41E3A', '#FFD700', '#FFFFFF'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti(containerElement, colors);
            }, i * 50);
        }
    }
    
    /**
     * 创建彩带粒子
     */
    createConfetti(container, colors) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        
        container.appendChild(confetti);
        
        // 下落动画
        const duration = 2000 + Math.random() * 2000;
        const endX = (Math.random() - 0.5) * 200;
        
        confetti.animate([
            { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) translateX(${endX}px) rotate(720deg)`, opacity: 0 }
        ], {
            duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        setTimeout(() => {
            confetti.remove();
        }, duration);
    }
    
    /**
     * 卡牌洗牌动画
     */
    shuffleAnimation(cardElements) {
        if (!this.enabled) return;
        
        cardElements.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateX(' + (Math.random() * 20 - 10) + 'px)';
                setTimeout(() => {
                    card.style.transform = 'translateX(0)';
                }, 100);
            }, index * 20);
        });
    }
    
    /**
     * 提示动画（卡牌跳动）
     */
    hintAnimation(cardElement) {
        if (!this.enabled) return;
        
        const originalTransform = cardElement.style.transform;
        let count = 0;
        
        const interval = setInterval(() => {
            cardElement.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                cardElement.style.transform = originalTransform;
            }, 150);
            
            count++;
            if (count >= 3) {
                clearInterval(interval);
            }
        }, 300);
    }
    
    /**
     * 状态变化动画
     */
    statusChangeAnimation(element, fromColor, toColor) {
        if (!this.enabled) return;
        
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = toColor;
        
        setTimeout(() => {
            element.style.backgroundColor = fromColor;
        }, 300);
    }
    
    /**
     * 数字滚动动画
     */
    numberRollAnimation(element, fromNumber, toNumber, duration = 1000) {
        if (!this.enabled) {
            element.textContent = toNumber;
            return;
        }
        
        const startTime = Date.now();
        const range = toNumber - fromNumber;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 缓动函数
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const current = Math.round(fromNumber + range * easeOut);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * 淡入动画
     */
    fadeInAnimation(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease`;
        
        // 强制重绘
        element.offsetHeight;
        
        element.style.opacity = '1';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    /**
     * 淡出动画
     */
    fadeOutAnimation(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.display = 'none';
                resolve();
            }, duration);
        });
    }
    
    /**
     * 滑动进入动画
     */
    slideInAnimation(element, direction = 'up', duration = 300) {
        const transforms = {
            'up': 'translateY(50px)',
            'down': 'translateY(-50px)',
            'left': 'translateX(50px)',
            'right': 'translateX(-50px)'
        };
        
        element.style.opacity = '0';
        element.style.transform = transforms[direction];
        element.style.transition = `all ${duration}ms ease`;
        element.style.display = 'block';
        
        // 强制重绘
        element.offsetHeight;
        
        element.style.opacity = '1';
        element.style.transform = 'translate(0, 0)';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    /**
     * 缩放动画
     */
    scaleAnimation(element, fromScale = 0.8, toScale = 1, duration = 300) {
        element.style.transform = `scale(${fromScale})`;
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease`;
        
        // 强制重绘
        element.offsetHeight;
        
        element.style.transform = `scale(${toScale})`;
        element.style.opacity = '1';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    /**
     * 旋转动画
     */
    rotateAnimation(element, rotations = 1, duration = 500) {
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `rotate(${rotations * 360}deg)`;
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    /**
     * 连续动画序列
     */
    async playSequence(animations) {
        for (const anim of animations) {
            await anim();
        }
    }
}

// ========================================
// 粒子效果系统
// ========================================

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.animationId = null;
    }
    
    /**
     * 创建爆炸效果
     */
    explode(x, y, count = 30, colors = ['#D4AF37', '#C41E3A', '#FFFFFF']) {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, colors);
        }
        
        if (!this.animationId) {
            this.animate();
        }
    }
    
    /**
     * 创建单个粒子
     */
    createParticle(x, y, colors) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = (Math.random() * 8 + 4) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        this.container.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 5 + 3;
        
        this.particles.push({
            element: particle,
            x,
            y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            gravity: 0.2,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01
        });
    }
    
    /**
     * 动画循环
     */
    animate() {
        this.particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life -= p.decay;
            
            p.element.style.left = p.x + 'px';
            p.element.style.top = p.y + 'px';
            p.element.style.opacity = p.life;
            p.element.style.transform = `scale(${p.life})`;
            
            if (p.life <= 0) {
                p.element.remove();
                this.particles.splice(index, 1);
            }
        });
        
        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
        }
    }
}

// ========================================
// 卡牌特效
// ========================================

class CardEffects {
    /**
     * 创建卡牌发光效果
     */
    static glow(element, color = '#D4AF37', duration = 500) {
        const originalBoxShadow = element.style.boxShadow;
        element.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
        element.style.transition = 'box-shadow 0.3s ease';
        
        setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
        }, duration);
    }
    
    /**
     * 创建卡牌翻转效果
     */
    static flip(element, onComplete) {
        element.style.transform = 'perspective(1000px) rotateY(90deg)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            if (onComplete) onComplete();
            element.style.transform = 'perspective(1000px) rotateY(0deg)';
        }, 300);
    }
    
    /**
     * 创建卡牌抖动效果（表示无效出牌）
     */
    static shake(element) {
        const originalTransform = element.style.transform;
        let count = 0;
        
        const shake = () => {
            const offset = (count % 2 === 0 ? 1 : -1) * (5 - count);
            element.style.transform = `translateX(${offset}px)`;
            count++;
            
            if (count < 6) {
                setTimeout(shake, 50);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        shake();
    }
    
    /**
     * 创建卡牌消失效果
     */
    static vanish(element, duration = 300) {
        element.style.transition = `all ${duration}ms ease`;
        element.style.opacity = '0';
        element.style.transform = 'scale(0.5) translateY(-20px)';
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.display = 'none';
                resolve();
            }, duration);
        });
    }
    
    /**
     * 创建卡牌出现效果
     */
    static appear(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.5) translateY(20px)';
        element.style.display = 'block';
        
        // 强制重绘
        element.offsetHeight;
        
        element.style.transition = `all ${duration}ms ease`;
        element.style.opacity = '1';
        element.style.transform = 'scale(1) translateY(0)';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
}

// ========================================
// 全局动画管理器实例
// ========================================

const animationManager = new AnimationManager();
const particleSystem = new ParticleSystem(document.body);

// 导出到全局
window.animationManager = animationManager;
window.particleSystem = particleSystem;
window.CardEffects = CardEffects;
