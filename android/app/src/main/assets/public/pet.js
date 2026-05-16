/**
 * 宠物养成系统核心模块
 * 管理宠物的成长、互动和技能系统
 */

class PetGrowthSystem {
    constructor() {
        this.petTypes = {
            fox: {
                name: '小狐狸',
                emoji: '🦊',
                description: '聪明活泼的小狐狸',
                baseStats: { happiness: 100, health: 100 },
                unlockRequirement: 0 // 默认解锁
            },
            rabbit: {
                name: '小兔子', 
                emoji: '🐰',
                description: '温顺可爱的小兔子',
                baseStats: { happiness: 90, health: 85 },
                unlockRequirement: 200
            },
            bear: {
                name: '小熊',
                emoji: '🐻', 
                description: '强壮可靠的小熊',
                baseStats: { happiness: 85, health: 95 },
                unlockRequirement: 500
            },
            panda: {
                name: '小熊猫',
                emoji: '🐼',
                description: '优雅神秘的小熊猫',
                baseStats: { happiness: 80, health: 90 },
                unlockRequirement: 1000
            }
        };

        this.skillTrees = {
            basic: ['好奇', '专注', '耐心'],
            intermediate: ['学习加速', '记忆增强', '情绪稳定'],
            advanced: ['超级学习', '智慧光环', '幸运加成']
        };

        this.items = {
            food: {
                name: '美味零食',
                description: '+15%快乐度',
                price: 50,
                effect: { happiness: 15 }
            },
            toy: {
                name: '可爱玩具',
                description: '+20%快乐度，+10%健康度',
                price: 80,
                effect: { happiness: 20, health: 10 }
            },
            medicine: {
                name: '健康药剂',
                description: '+30%健康度',
                price: 100,
                effect: { health: 30 }
            },
            premium_food: {
                name: '高级营养餐',
                description: '+25%快乐度，+20%健康度',
                price: 150,
                effect: { happiness: 25, health: 20 }
            }
        };
    }

    /**
     * 获取宠物等级经验需求
     */
    getLevelExp(level) {
        return level * level * 100; // 简单线性增长
    }

    /**
     * 计算宠物等级
     */
    calculateLevel(totalExp) {
        let level = 1;
        let requiredExp = 0;

        while (level < 100) {
            const nextLevelExp = this.getLevelExp(level + 1);
            if (totalExp >= requiredExp + nextLevelExp) {
                requiredExp += nextLevelExp;
                level++;
            } else {
                break;
            }
        }

        return level;
    }

    /**
     * 更新宠物成长（基于获得的积分）
     */
    async updateGrowth(pointsEarned, activities = []) {
        if (!userData.pets || userData.pets.length === 0) return null;

        const pet = userData.pets[0]; // 使用第一个宠物

        // 基础经验值：积分 × 1.5
        const learningExp = Math.floor(pointsEarned * 1.5);

        // 互动经验值
        const interactionExp = this.calculateInteractionExp(activities);

        // 社交经验值（简化处理）
        const socialExp = activities.includes('share') ? 10 : 0;

        pet.experience += learningExp + interactionExp + socialExp;

        // 检查等级提升
        const newLevel = this.calculateLevel(pet.experience);
        let leveledUp = false;

        if (newLevel > pet.level) {
            await this.levelUp(pet, newLevel);
            leveledUp = true;
        }

        // 检查技能解锁
        const newSkills = await this.checkSkillUnlock(pet);

        // 更新情感状态
        this.updateEmotionalState(pet, activities);

        return {
            expGained: learningExp + interactionExp + socialExp,
            newLevel,
            leveledUp,
            newSkills,
            totalExp: pet.experience
        };
    }

    /**
     * 计算互动经验值
     */
    calculateInteractionExp(activities) {
        const expMap = {
            feed: 5,
            clean: 3,
            play: 8,
            train: 12,
            rest: 2
        };

        return activities.reduce((total, activity) => {
            return total + (expMap[activity] || 0);
        }, 0);
    }

    /**
     * 宠物升级
     */
    async levelUp(pet, newLevel) {
        const oldLevel = pet.level;
        pet.level = newLevel;

        // 升级奖励
        pet.happiness = Math.min(100, pet.happiness + 10);
        pet.health = Math.min(100, pet.health + 5);

        // 显示升级动画（如果页面存在）
        this.showLevelUpAnimation(newLevel);

        // 保存数据
        saveUserData();

        return { oldLevel, newLevel };
    }

    /**
     * 显示升级动画
     */
    showLevelUpAnimation(newLevel) {
        // 创建升级提示元素
        const levelUpEl = document.createElement('div');
        levelUpEl.className = 'pet-level-up';
        levelUpEl.innerHTML = `
            <div class="level-up-content">
                <span class="level-up-text">🎉</span>
                <span class="level-up-message">宠物升级到 Lv.${newLevel}！</span>
                <span class="level-up-stars">⭐⭐⭐</span>
            </div>
        `;

        document.body.appendChild(levelUpEl);

        // 动画效果
        setTimeout(() => {
            levelUpEl.classList.add('show');
        }, 100);

        // 自动移除
        setTimeout(() => {
            levelUpEl.classList.remove('show');
            setTimeout(() => {
                if (levelUpEl.parentNode) {
                    levelUpEl.parentNode.removeChild(levelUpEl);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 检查技能解锁
     */
    async checkSkillUnlock(pet) {
        const newSkills = [];

        // 根据宠物等级检查技能解锁
        if (pet.level >= 5 && !pet.skills.includes('好奇')) {
            pet.skills.push('好奇');
            newSkills.push('好奇');
        }
        if (pet.level >= 10 && !pet.skills.includes('专注')) {
            pet.skills.push('专注');
            newSkills.push('专注');
        }
        if (pet.level >= 15 && !pet.skills.includes('学习加速')) {
            pet.skills.push('学习加速');
            newSkills.push('学习加速');
        }

        if (newSkills.length > 0) {
            saveUserData();
        }

        return newSkills;
    }

    /**
     * 更新宠物情感状态
     */
    updateEmotionalState(pet, activities) {
        // 根据最近的活动调整状态
        const recentHours = this.getTimeSinceLastActivity(pet);

        if (recentHours > 6) {
            pet.happiness = Math.max(30, pet.happiness - 5);
            pet.health = Math.max(60, pet.health - 3);
        } else if (activities.includes('feed') || activities.includes('play')) {
            pet.happiness = Math.min(100, pet.happiness + 10);
        }

        // 保持健康度与快乐度平衡
        if (Math.abs(pet.health - pet.happiness) > 20) {
            pet.health = Math.max(70, pet.happiness);
        }
    }

    /**
     * 获取距离上次活动的时间（小时）
     */
    getTimeSinceLastActivity(pet) {
        const now = new Date();
        const lastInteraction = new Date(pet.lastInteraction);
        return (now - lastInteraction) / (1000 * 60 * 60);
    }

    /**
     * 使用道具
     */
    useItem(itemType, targetPet = null) {
        const pet = targetPet || userData.pets[0];
        const item = this.items[itemType];

        if (!item || !pet) {
            console.error('无效的道具或宠物');
            return false;
        }

        // 应用道具效果
        Object.entries(item.effect).forEach(([stat, value]) => {
            pet[stat] = Math.min(100, pet[stat] + value);
        });

        // 记录使用时间
        pet.lastInteraction = new Date().toISOString();

        saveUserData();
        return true;
    }

    /**
     * 购买道具
     */
    buyItem(itemType, pointsCost = null) {
        const item = this.items[itemType];

        if (!item) {
            console.error('无效的道具类型');
            return false;
        }

        const cost = pointsCost || item.price;

        // 检查用户积分
        if (userData.points.total < cost) {
            console.error('积分不足');
            return false;
        }

        // 扣除积分
        userData.points.total -= cost;
        userData.points.today -= cost;

        // 添加到宠物物品栏
        if (userData.pets && userData.pets[0]) {
            userData.pets[0].items = userData.pets[0].items || [];
            userData.pets[0].items.push({
                type: itemType,
                name: item.name,
                purchasedAt: new Date().toISOString()
            });
        }

        saveUserData();
        return true;
    }

    /**
     * 获取宠物状态摘要
     */
    getPetStatus(petId = 0) {
        const pet = userData.pets[petId];
        if (!pet) return null;

        const levelInfo = this.calculateLevel(pet.experience);
        const expToNext = this.getLevelExp(pet.level) - pet.experience;
        const expProgress = ((pet.experience % this.getLevelExp(pet.level)) / this.getLevelExp(pet.level)) * 100;

        return {
            ...pet,
            expProgress,
            expToNext,
            skills: pet.skills || [],
            items: pet.items || []
        };
    }

    /**
     * 切换宠物
     */
    switchPet(targetPetId) {
        if (!userData.pets || targetPetId >= userData.pets.length) {
            return false;
        }

        // 更新当前时间作为最后互动时间
        userData.pets[targetPetId].lastInteraction = new Date().toISOString();
        saveUserData();
        return true;
    }
}

// 全局宠物系统实例
const petSystem = new PetGrowthSystem();

// CSS样式
const petSystemCSS = `
.pet-level-up {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.5);
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: white;
    padding: 25px 40px;
    border-radius: 25px;
    font-size: 18px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-align: center;
}

.pet-level-up.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

.level-up-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.level-up-text {
    font-size: 32px;
}

.level-up-stars {
    color: #FFD700;
    font-size: 24px;
}
`;

// 添加样式到页面
if (!document.getElementById('pet-system-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'pet-system-style';
    styleEl.textContent = petSystemCSS;
    document.head.appendChild(styleEl);
}

export default petSystem;