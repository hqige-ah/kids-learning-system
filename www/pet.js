/**
 * 宠物养成系统核心模块 v2
 * 规则：12级上限，每级需20经验，多形态进化，四大神兽
 * 经验来源：积分×1 + 互动额外经验
 */

class PetGrowthSystem {
    constructor() {
        // ===== 宠物类型（含四大神兽） =====
        // 每个宠物有多个进化形态，每3级变化一次（1/4/7/10级各进化一次）
        this.petTypes = {
            // --- 初始宠物 ---
            fox: {
                name: '小狐狸',
                emoji: '🦊',
                description: '聪明活泼的小狐狸',
                baseStats: { happiness: 100, health: 100, fullness: 100 },
                unlockRequirement: 0,
                // 进化形态：按 level 区间取对应形态
                forms: [
                    { min: 1,  max: 3,  emoji: '🦊',  name: '小狐狸',     desc: '萌萌的小奶狐' },
                    { min: 4,  max: 6,  emoji: '🦊',  name: '灵狐',       desc: '眼神灵动的小狐狸' },
                    { min: 7,  max: 9,  emoji: '🤩',  name: '九尾狐',     desc: '传说中的九尾狐幼体' },
                    { min: 10, max: 12, emoji: '🌟',  name: '天狐',       desc: '周身环绕灵光的天狐' }
                ],
                skillTree: ['好奇', '专注', '学习加速', '智慧光环']
            },
            rabbit: {
                name: '小兔子',
                emoji: '🐰',
                description: '温顺可爱的小兔子',
                baseStats: { happiness: 90, health: 85, fullness: 100 },
                unlockRequirement: 20,
                forms: [
                    { min: 1,  max: 3,  emoji: '🐰',  name: '兔兔',       desc: '蹦蹦跳跳的小兔' },
                    { min: 4,  max: 6,  emoji: '🐰',  name: '长耳兔',     desc: '耳朵灵敏的长耳兔' },
                    { min: 7,  max: 9,  emoji: '✨',  name: '月兔',       desc: '月光下起舞的月兔' },
                    { min: 10, max: 12, emoji: '🌙',  name: '玉兔',       desc: '仙气飘飘的玉兔' }
                ],
                skillTree: ['专注', '记忆增强', '情绪稳定', '超级学习']
            },
            bear: {
                name: '小熊',
                emoji: '🐻',
                description: '强壮可靠的小熊',
                baseStats: { happiness: 85, health: 95, fullness: 100 },
                unlockRequirement: 40,
                forms: [
                    { min: 1,  max: 3,  emoji: '🐻',  name: '小熊',       desc: '憨厚可爱的小熊' },
                    { min: 4,  max: 6,  emoji: '🐻',  name: '棕熊',       desc: '身强体壮的棕熊' },
                    { min: 7,  max: 9,  emoji: '💪',  name: '大力熊',     desc: '力大无穷的大力熊' },
                    { min: 10, max: 12, emoji: '⭐',  name: '北极熊',     desc: '冰雪中的王者' }
                ],
                skillTree: ['耐心', '体质强化', '超级学习', '万能护盾']
            },
            panda: {
                name: '熊猫',
                emoji: '🐼',
                description: '优雅神秘的熊猫',
                baseStats: { happiness: 80, health: 90, fullness: 100 },
                unlockRequirement: 60,
                forms: [
                    { min: 1,  max: 3,  emoji: '🐼',  name: '熊猫宝宝',   desc: '黑白分明的小熊猫' },
                    { min: 4,  max: 6,  emoji: '🐼',  name: '功夫熊猫',   desc: '会耍宝的功夫熊猫' },
                    { min: 7,  max: 9,  emoji: '🎋',  name: '竹仙',       desc: '竹林深处的竹仙' },
                    { min: 10, max: 12, emoji: '🎋',  name: '玄竹圣兽',   desc: '万年竹魂化形的神兽' }
                ],
                skillTree: ['沉稳', '记忆增强', '智慧光环', '太极守护']
            },
            // --- 四大神兽 ---
            qinglong: {
                name: '青龙',
                emoji: '🐉',
                description: '东方青龙，万物之始',
                baseStats: { happiness: 95, health: 100, fullness: 100 },
                unlockRequirement: 80,
                forms: [
                    { min: 1,  max: 3,  emoji: '🐍',  name: '青蛇',       desc: '刚刚苏醒的青龙幼体' },
                    { min: 4,  max: 6,  emoji: '🐲',  name: '青龙',       desc: '逐渐成长的青龙' },
                    { min: 7,  max: 9,  emoji: '🐉',  name: '苍龙',       desc: '翱翔九天的苍龙' },
                    { min: 10, max: 12, emoji: '✨',  name: '东方神龙',   desc: '镇守东方的至高神龙' }
                ],
                skillTree: ['龙威', '龙鳞防御', '春雷觉醒', '神龙摆尾'],
                divineBeast: true,
                element: 'wood',
                color: '#2ECC71'
            },
            baihu: {
                name: '白虎',
                emoji: '🐯',
                description: '西方白虎，百兽之王',
                baseStats: { happiness: 90, health: 95, fullness: 100 },
                unlockRequirement: 80,
                forms: [
                    { min: 1,  max: 3,  emoji: '🐱',  name: '虎崽',       desc: '萌萌的小虎崽' },
                    { min: 4,  max: 6,  emoji: '🐯',  name: '白虎',       desc: '威风凛凛的白虎' },
                    { min: 7,  max: 9,  emoji: '🐅',  name: '烈虎',       desc: '战意滔天的烈虎' },
                    { min: 10, max: 12, emoji: '⚔️',  name: '西方战神',     desc: '百战百胜的白虎战神' }
                ],
                skillTree: ['猛扑', '战神祝福', '百兽号令', '虎啸山林'],
                divineBeast: true,
                element: 'metal',
                color: '#ECF0F1'
            },
            zhuque: {
                name: '朱雀',
                emoji: '🔥',
                description: '南方朱雀，浴火而生',
                baseStats: { happiness: 92, health: 88, fullness: 100 },
                unlockRequirement: 80,
                forms: [
                    { min: 1,  max: 3,  emoji: '🐦',  name: '小火鸟',     desc: '叽叽喳喳的小火鸟' },
                    { min: 4,  max: 6,  emoji: '🐔',  name: '火鸟',       desc: '羽毛燃烧着火焰' },
                    { min: 7,  max: 9,  emoji: '🔥',  name: '朱雀',       desc: '烈焰环绕的朱雀' },
                    { min: 10, max: 12, emoji: '🦅',  name: '南方神凤',     desc: '浴火重生的不死神凤' }
                ],
                skillTree: ['火焰之翼', '浴火重生', '炽焰冲击', '凤鸣九天'],
                divineBeast: true,
                element: 'fire',
                color: '#E74C3C'
            },
            xuanwu: {
                name: '玄武',
                emoji: '🐢',
                description: '北方玄武，龟蛇合体',
                baseStats: { happiness: 88, health: 100, fullness: 100 },
                unlockRequirement: 80,
                forms: [
                    { min: 1,  max: 3,  emoji: '🐢',  name: '小乌龟',     desc: '慢悠悠的小乌龟' },
                    { min: 4,  max: 6,  emoji: '🐍',  name: '龟蛇',       desc: '龟蛇合体的雏形' },
                    { min: 7,  max: 9,  emoji: '🌊',  name: '玄武',       desc: '波浪环绕的玄武' },
                    { min: 10, max: 12, emoji: '⚡',  name: '北方水神',     desc: '掌控万水的玄武水神' }
                ],
                skillTree: ['龟甲守护', '蛇影缠绕', '寒冰之盾', '玄冥镇海'],
                divineBeast: true,
                element: 'water',
                color: '#3498DB'
            }
        };

        // ===== 道具（价格降低） =====
        this.items = {
            food: {
                name: '美味零食',
                description: '+15%饱腹度',
                price: 3,
                effect: { fullness: 15 }
            },
            toy: {
                name: '可爱玩具',
                description: '+20%快乐度，+10%健康度',
                price: 5,
                effect: { happiness: 20, health: 10 }
            },
            medicine: {
                name: '健康药剂',
                description: '+30%健康度',
                price: 4,
                effect: { health: 30 }
            },
            premium_food: {
                name: '高级营养餐',
                description: '+25%饱腹度，+20%健康度',
                price: 8,
                effect: { fullness: 25, health: 20 }
            }
        };
    }

    // ===== 等级经验 =====

    /**
     * 获取某级所需经验：每级固定20经验
     */
    getLevelExp(level) {
        return 20;
    }

    /**
     * 计算等级（总经验 / 20 + 1，最高12级）
     */
    calculateLevel(totalExp) {
        return Math.min(12, Math.floor(totalExp / 20) + 1);
    }

    /**
     * 获取当前经验条进度（0-100%）
     */
    getExpProgress(pet) {
        const currentLevelExp = pet.experience % 20;
        return Math.min(100, Math.round((currentLevelExp / 20) * 100));
    }

    /**
     * 获取当前等级段内的经验值
     */
    getCurrentLevelExp(pet) {
        return pet.experience % 20;
    }

    // ===== 宠物形态 =====

    /**
     * 根据宠物类型和等级获取当前形态
     */
    getPetForm(petType, level) {
        const petTypeData = this.petTypes[petType];
        if (!petTypeData || !petTypeData.forms) {
            return { emoji: '🦊', name: '小狐狸', desc: '' };
        }
        for (const form of petTypeData.forms) {
            if (level >= form.min && level <= form.max) return form;
        }
        return petTypeData.forms[petTypeData.forms.length - 1];
    }

    // ===== 成长系统 =====

    /**
     * 更新宠物成长
     */
    async updateGrowth(pointsEarned, activities = []) {
        if (!userData.pets || userData.pets.length === 0) return null;

        const pet = userData.pets[0];

        // 经验 = 积分×1 + 互动经验
        const learningExp = pointsEarned;
        const interactionExp = this.calculateInteractionExp(activities);
        const totalGain = learningExp + interactionExp;

        pet.experience += totalGain;

        // 检查等级提升
        const newLevel = this.calculateLevel(pet.experience);
        let leveledUp = false;
        let evolved = false;

        if (newLevel > pet.level) {
            evolved = await this.levelUp(pet, newLevel);
            leveledUp = true;
        }

        // 检查技能解锁
        const newSkills = await this.checkSkillUnlock(pet);

        // 情感状态
        this.updateEmotionalState(pet, activities);

        return {
            expGained: totalGain,
            newLevel,
            leveledUp,
            evolved,
            newSkills,
            totalExp: pet.experience
        };
    }

    /**
     * 互动经验
     */
    calculateInteractionExp(activities) {
        const expMap = { feed: 3, clean: 2, play: 4, train: 5, rest: 1 };
        return activities.reduce((total, a) => total + (expMap[a] || 0), 0);
    }

    /**
     * 宠物升级 + 进化检测
     */
    async levelUp(pet, newLevel) {
        const oldLevel = pet.level;
        const oldForm = this.getPetForm(pet.type, oldLevel);
        const newForm = this.getPetForm(pet.type, newLevel);

        pet.level = newLevel;
        pet.happiness = Math.min(100, pet.happiness + 10);
        pet.health = Math.min(100, pet.health + 5);

        // 形态是否变化
        const evolved = oldForm.emoji !== newForm.emoji || oldForm.name !== newForm.name;

        // 记录成长里程碑
        if (!userData.petGrowthLog) userData.petGrowthLog = [];
        userData.petGrowthLog.unshift({
            time: new Date().toISOString(),
            petType: pet.type,
            petName: pet.name,
            oldLevel: oldLevel,
            newLevel: newLevel,
            oldForm: oldForm.name,
            newForm: newForm.name,
            evolved: evolved,
            eventType: evolved ? 'evolution' : 'levelup'
        });
        // 最多保留100条
        if (userData.petGrowthLog.length > 100) userData.petGrowthLog.length = 100;

        // 升级动画
        this.showLevelUpAnimation(newLevel, evolved);

        if (evolved) {
            // 进化动画
            setTimeout(() => {
                this.showEvolutionAnimation(pet.type, newLevel, newForm);
            }, 1000);
        }

        // 检查技能解锁
        setTimeout(() => {
            this.checkSkillUnlock(pet);
        }, evolved ? 2500 : 800);

        saveUserData();

        return evolved;
    }

    /**
     * 显示升级动画
     */
    showLevelUpAnimation(newLevel, isEvolution) {
        const levelUpEl = document.createElement('div');
        levelUpEl.className = 'pet-level-up';
        levelUpEl.innerHTML = `
            <div class="level-up-content">
                <span class="level-up-icon">${isEvolution ? '🌟' : '⬆️'}</span>
                <span class="level-up-message">升级到 Lv.${newLevel}！</span>
                <span class="level-up-stars">${'⭐'.repeat(Math.min(5, Math.floor(newLevel / 3) + 1))}</span>
            </div>
        `;
        document.body.appendChild(levelUpEl);

        // 金光粒子
        this._spawnParticles(levelUpEl, '#FFD700', 20);

        setTimeout(() => levelUpEl.classList.add('show'), 50);

        setTimeout(() => {
            levelUpEl.classList.remove('show');
            setTimeout(() => {
                if (levelUpEl.parentNode) levelUpEl.parentNode.removeChild(levelUpEl);
            }, 500);
        }, isEvolution ? 800 : 2500);
    }

    /**
     * 显示进化动画（全屏特效）
     */
    showEvolutionAnimation(petType, level, form) {
        const petData = this.petTypes[petType] || {};
        const color = petData.color || '#FFD700';

        const evoEl = document.createElement('div');
        evoEl.className = 'pet-evolution';
        evoEl.innerHTML = `
            <div class="evolution-flash"></div>
            <div class="evolution-content">
                <div class="evolution-before">${this.getPetForm(petType, level - 1).emoji || '🦊'}</div>
                <div class="evolution-arrow">✨➡️✨</div>
                <div class="evolution-after">${form.emoji}</div>
                <div class="evolution-name">${form.name}</div>
                <div class="evolution-desc">${form.desc}</div>
                ${petData.divineBeast ? '<div class="evolution-badge">🐲 神兽觉醒 🐲</div>' : ''}
            </div>
        `;
        document.body.appendChild(evoEl);

        // 大量粒子
        this._spawnParticles(evoEl, color, 40);
        this._spawnParticles(evoEl, '#FFFFFF', 20);

        setTimeout(() => evoEl.classList.add('show'), 50);

        setTimeout(() => {
            evoEl.classList.remove('show');
            setTimeout(() => {
                if (evoEl.parentNode) evoEl.parentNode.removeChild(evoEl);
            }, 800);
        }, 4000);
    }

    /**
     * 粒子特效
     */
    _spawnParticles(parent, color, count) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            const size = 4 + Math.random() * 8;
            const dx = (Math.random() - 0.5) * 300;
            const dy = -80 - Math.random() * 200;
            const dur = 0.8 + Math.random() * 1.2;
            p.style.cssText = `
                position:absolute;
                width:${size}px;
                height:${size}px;
                background:${color};
                border-radius:50%;
                left:${50 + (Math.random() - 0.5) * 80}%;
                top:${40 + Math.random() * 20}%;
                pointer-events:none;
                z-index:10000;
                animation: petParticleFly ${dur}s ease-out forwards;
                opacity:0;
                --dx: ${dx}px;
                --dy: ${dy}px;
            `;
            parent.appendChild(p);
            setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 3000);
        }
    }

    /**
     * 检查技能解锁（每3级解锁一个技能）
     */
    async checkSkillUnlock(pet) {
        const petTypeData = this.petTypes[pet.type];
        const skillTree = petTypeData.skillTree || ['好奇', '专注', '学习加速', '智慧光环'];
        const newSkills = [];
        const oldSkills = pet.skills ? [...pet.skills] : [];

        // 每3级解锁一个技能
        for (let i = 0; i < skillTree.length; i++) {
            const requiredLevel = (i + 1) * 3; // 级 3/6/9/12 各解锁一个
            if (pet.level >= requiredLevel && !pet.skills.includes(skillTree[i])) {
                pet.skills.push(skillTree[i]);
                newSkills.push(skillTree[i]);
            }
        }

        if (newSkills.length > 0) {
            // 炫酷技能解锁动画
            this.showSkillUnlockAnimation(newSkills, petTypeData.color || '#FFD700');
            saveUserData();
        }

        return newSkills;
    }

    /**
     * 技能解锁动画
     */
    showSkillUnlockAnimation(skills, color) {
        const skillEl = document.createElement('div');
        skillEl.className = 'pet-skill-unlock';
        skillEl.innerHTML = `
            <div class="skill-unlock-ring"></div>
            <div class="skill-unlock-content">
                <div class="skill-unlock-icon">⚡</div>
                <div class="skill-unlock-title">新技能解锁！</div>
                <div class="skill-unlock-names">${skills.map(s => `<span class="skill-badge">${s}</span>`).join('')}</div>
            </div>
        `;

        // 彩虹光环粒子
        this._spawnParticles(skillEl, color, 15);
        this._spawnParticles(skillEl, '#FF6B6B', 10);
        this._spawnParticles(skillEl, '#FFD93D', 10);
        this._spawnParticles(skillEl, '#6BCB77', 10);

        document.body.appendChild(skillEl);

        setTimeout(() => skillEl.classList.add('show'), 50);

        setTimeout(() => {
            skillEl.classList.remove('show');
            setTimeout(() => {
                if (skillEl.parentNode) skillEl.parentNode.removeChild(skillEl);
            }, 500);
        }, 3500);
    }

    /**
     * 情感状态更新
     */
    updateEmotionalState(pet, activities) {
        const recentHours = this.getTimeSinceLastActivity(pet);

        if (recentHours > 6) {
            pet.happiness = Math.max(30, pet.happiness - 5);
            pet.health = Math.max(60, pet.health - 3);
            pet.fullness = Math.max(20, (pet.fullness || 100) - 10);
        } else if (activities.includes('feed') || activities.includes('play')) {
            pet.happiness = Math.min(100, pet.happiness + 10);
        }

        if (Math.abs(pet.health - pet.happiness) > 20) {
            pet.health = Math.max(70, pet.happiness);
        }
    }

    /**
     * 距离上次活动的小时数
     */
    getTimeSinceLastActivity(pet) {
        const now = new Date();
        const last = new Date(pet.lastInteraction);
        if (isNaN(last.getTime())) return 0;
        return (now - last) / (1000 * 60 * 60);
    }

    // ===== 道具操作 =====

    /**
     * 使用道具
     */
    useItem(itemType, targetPet = null) {
        const pet = targetPet || userData.pets[0];
        const item = this.items[itemType];

        if (!item || !pet) return false;

        Object.entries(item.effect).forEach(([stat, value]) => {
            const current = typeof pet[stat] === 'number' ? pet[stat] : 0;
            pet[stat] = Math.min(100, current + value);
        });

        pet.lastInteraction = new Date().toISOString();
        saveUserData();
        return true;
    }

    /**
     * 购买道具
     */
    buyItem(itemType) {
        const item = this.items[itemType];
        if (!item) return false;

        if (userData.points.total < item.price) return false;

        userData.points.total = Math.max(0, userData.points.total - item.price);

        if (userData.pets && userData.pets[0]) {
            userData.pets[0].items = userData.pets[0].items || [];
            userData.pets[0].items.push({ type: itemType, name: item.name, purchasedAt: new Date().toISOString() });
        }

        saveUserData();
        return true;
    }

    /**
     * 获取宠物状态
     */
    getPetStatus(petId = 0) {
        const pet = userData.pets[petId];
        if (!pet) return null;

        return {
            ...pet,
            expProgress: this.getExpProgress(pet),
            currentLevelExp: this.getCurrentLevelExp(pet),
            expToNext: 20 - this.getCurrentLevelExp(pet),
            form: this.getPetForm(pet.type, pet.level),
            skills: pet.skills || [],
            items: pet.items || []
        };
    }

    /**
     * 宠物切换
     */
    switchPet(targetPetId) {
        if (!userData.pets || targetPetId >= userData.pets.length) return false;
        userData.pets[targetPetId].lastInteraction = new Date().toISOString();
        saveUserData();
        return true;
    }

    /**
     * 获取宠物所有可解锁类型（按积分排序）
     */
    getAvailablePets() {
        return Object.entries(this.petTypes)
            .map(([key, val]) => ({ key, ...val }))
            .sort((a, b) => a.unlockRequirement - b.unlockRequirement);
    }
}

// 全局实例
window.petSystem = new PetGrowthSystem();

// ===== CSS =====
const petSystemCSS = `
/* ---- 升级动画 ---- */
.pet-level-up {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.3);
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%);
    color: white;
    padding: 30px 45px;
    border-radius: 30px;
    font-size: 22px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 0 60px rgba(255, 215, 0, 0.6), 0 15px 40px rgba(0,0,0,0.3);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-align: center;
    overflow: visible;
    pointer-events: none;
}

.pet-level-up.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    animation: levelUpPulse 0.6s ease-in-out 2;
}

@keyframes levelUpPulse {
    0%, 100% { box-shadow: 0 0 60px rgba(255,215,0,0.6), 0 15px 40px rgba(0,0,0,0.3); }
    50% { box-shadow: 0 0 120px rgba(255,215,0,0.9), 0 0 60px rgba(255,165,0,0.7), 0 15px 40px rgba(0,0,0,0.3); }
}

.level-up-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.level-up-icon {
    font-size: 48px;
    animation: levelUpBounce 0.4s ease-in-out infinite alternate;
}

@keyframes levelUpBounce {
    from { transform: translateY(0) scale(1); }
    to { transform: translateY(-10px) scale(1.2); }
}

.level-up-message {
    font-size: 24px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.level-up-stars {
    font-size: 28px;
    animation: starSpin 0.5s ease-in-out;
}

@keyframes starSpin {
    0% { transform: rotate(0deg) scale(0); }
    50% { transform: rotate(180deg) scale(1.5); }
    100% { transform: rotate(360deg) scale(1); }
}

/* ---- 进化动画（全屏） ---- */
.pet-evolution {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.4s ease;
    background: rgba(0,0,0,0.7);
    overflow: hidden;
}

.pet-evolution.show {
    opacity: 1;
}

.evolution-flash {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%);
    animation: evoFlash 4s ease-out forwards;
}

@keyframes evoFlash {
    0% { opacity: 0; transform: scale(0); }
    20% { opacity: 1; transform: scale(1.5); }
    80% { opacity: 0.8; transform: scale(2); }
    100% { opacity: 0; transform: scale(3); }
}

.evolution-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    animation: evoZoom 4s ease-out;
}

@keyframes evoZoom {
    0% { transform: scale(0); opacity: 0; }
    25% { transform: scale(1.2); opacity: 1; }
    75% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0.9); opacity: 0; }
}

.evolution-before, .evolution-after {
    font-size: 80px;
    text-shadow: 0 0 30px rgba(255,215,0,0.8);
}

.evolution-before {
    animation: evoBounceLeft 0.8s ease-out;
}

.evolution-after {
    animation: evoBounceRight 0.8s ease-out 0.5s both;
}

@keyframes evoBounceLeft {
    0% { transform: translateX(-100px) scale(0.5); opacity: 0; }
    100% { transform: translateX(0) scale(1); opacity: 1; }
}

@keyframes evoBounceRight {
    0% { transform: translateX(100px) scale(0.5); opacity: 0; }
    50% { transform: translateX(-10px) scale(1.3); opacity: 1; }
    100% { transform: translateX(0) scale(1); opacity: 1; }
}

.evolution-arrow {
    font-size: 36px;
    animation: arrowGlow 0.6s ease-in-out infinite alternate;
}

@keyframes arrowGlow {
    from { text-shadow: 0 0 10px rgba(255,215,0,0.5); }
    to { text-shadow: 0 0 30px rgba(255,215,0,1), 0 0 60px rgba(255,165,0,0.7); }
}

.evolution-name {
    font-size: 28px;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 0 0 20px rgba(255,215,0,0.8);
}

.evolution-desc {
    font-size: 16px;
    color: rgba(255,255,255,0.8);
}

.evolution-badge {
    margin-top: 8px;
    padding: 6px 20px;
    background: linear-gradient(135deg, #E74C3C, #F39C12, #2ECC71, #3498DB);
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    animation: badgeRainbow 2s linear infinite;
}

@keyframes badgeRainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
}

/* ---- 技能解锁动画 ---- */
.pet-skill-unlock {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    transform: scale(0);
    z-index: 10001;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    background: rgba(0,0,0,0.5);
    pointer-events: none;
}

.pet-skill-unlock.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

.skill-unlock-ring {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 4px solid transparent;
    background: conic-gradient(from 0deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9B59B6, #FF6B6B) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: ringRotate 2s linear infinite, ringPulse 0.8s ease-in-out infinite alternate;
}

@keyframes ringRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes ringPulse {
    from { transform: scale(1); }
    to { transform: scale(1.1); }
}

.skill-unlock-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.skill-unlock-icon {
    font-size: 48px;
    animation: skillIconBounce 0.5s ease-in-out infinite alternate;
}

@keyframes skillIconBounce {
    from { transform: translateY(0) rotate(-5deg); }
    to { transform: translateY(-15px) rotate(5deg); }
}

.skill-unlock-title {
    font-size: 22px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 2px 4px rgba(0,0,0,0.3);
}

.skill-unlock-names {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
}

.skill-badge {
    padding: 6px 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 20px;
    color: white;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(102,126,234,0.5);
    animation: skillBadgePop 0.4s ease-out;
}

@keyframes skillBadgePop {
    0% { transform: scale(0); }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

/* ---- 粒子动画 ---- */
@keyframes petParticleFly {
    0% { opacity: 1; transform: translate(0, 0) scale(1.2); }
    50% { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); }
}
`;

if (!document.getElementById('pet-system-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'pet-system-style';
    styleEl.textContent = petSystemCSS;
    document.head.appendChild(styleEl);
}
