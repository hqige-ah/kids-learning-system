/**
 * 积分系统核心模块
 * 管理用户积分的获取、计算和显示
 */

class PointsSystem {
    constructor() {
        this.basePoints = {
            math: { easy: 20, medium: 35, hard: 50 },
            chinese: { basic: 25, intermediate: 40, advanced: 55 },
            poem: { recite: 30, understand: 45, analyze: 60 }
        };

        this.timeBonusThresholds = {
            excellent: 60, // 1分钟内完成 +20%奖励
            good: 180,     // 3分钟内完成 +10%奖励
            normal: 300    // 5分钟内完成 +5%奖励
        };
    }

    /**
     * 计算任务完成后的积分
     * @param {string} taskType - 任务类型 (math/chinese/poem)
     * @param {Object} performance - 表现数据 (stars, accuracy, timeSpent)
     * @returns {number} 获得的积分
     */
    calculateTaskPoints(taskType, performance) {
        const difficulty = this.determineDifficulty(performance);
        const basePoints = this.basePoints[taskType][difficulty];
        const starMultiplier = Math.min(performance.stars, 5) * 0.2;
        const timeBonus = this.calculateTimeBonus(performance.timeSpent);
        const difficultyBonus = 1; // 基础难度

        return Math.round(basePoints * (1 + starMultiplier) * timeBonus * difficultyBonus);
    }

    /**
     * 确定任务难度
     */
    determineDifficulty(performance) {
        if (performance.accuracy >= 95 && performance.stars >= 4) {
            return 'hard';
        } else if (performance.accuracy >= 80 && performance.stars >= 3) {
            return 'intermediate';
        } else {
            return 'basic';
        }
    }

    /**
     * 计算时间效率奖励
     */
    calculateTimeBonus(timeSpent) {
        if (timeSpent <= this.timeBonusThresholds.excellent) {
            return 1.2; // +20%
        } else if (timeSpent <= this.timeBonusThresholds.good) {
            return 1.1; // +10%
        } else if (timeSpent <= this.timeBonusThresholds.normal) {
            return 1.05; // +5%
        } else {
            return 1.0; // 基础
        }
    }

    /**
     * 更新用户积分
     * @param {number} pointsToAdd - 要添加的积分
     * @param {string} source - 积分来源描述
     */
    addPoints(pointsToAdd, source = '完成任务') {
        const maxDailyPoints = 200;

        // 每日积分上限截断
        const remaining = maxDailyPoints - userData.points.today;
        const actualAdd = Math.max(0, Math.min(pointsToAdd, remaining));

        if (actualAdd <= 0) {
            showPointsReward(0, source);
            return 0;
        }

        const now = new Date();

        // 更新总积分
        userData.points.total += actualAdd;

        // 更新今日积分
        userData.points.today += actualAdd;

        // 更新本周积分（简化处理）
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        if (now >= weekStart) {
            userData.points.weekly += actualAdd;
        }

        // 更新本月积分（简化处理）
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (now >= monthStart) {
            userData.points.monthly += actualAdd;
        }

        // 更新宠物快乐度
        updatePetHappiness(actualAdd);

        // 保存数据
        saveUserData();

        // 显示积分获得提示
        showPointsReward(actualAdd, source);

        return actualAdd;
    }

    /**
     * 检查每日积分上限
     */
    checkDailyLimit() {
        const maxDailyPoints = 200; // 每日最大积分
        if (userData.points.today > maxDailyPoints) {
            userData.points.today = maxDailyPoints;
            return false;
        }
        return true;
    }

    /**
     * 获取用户当前积分状态
     */
    getUserPointsStatus() {
        return {
            total: userData.points.total,
            today: userData.points.today,
            weekly: userData.points.weekly,
            monthly: userData.points.monthly,
            remainingToday: Math.max(0, 200 - userData.points.today),
            level: this.calculateLevel(userData.points.total)
        };
    }

    /**
     * 根据总积分计算用户等级
     */
    calculateLevel(totalPoints) {
        return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
    }
}

// 全局积分系统实例
const pointsSystem = new PointsSystem();

// 积分显示函数
function showPointsReward(points, source) {
    const rewardEl = document.createElement('div');
    rewardEl.className = 'points-reward';
    rewardEl.innerHTML = `
        <div class="reward-content">
            <span class="reward-icon">⭐</span>
            <span class="reward-text">+${points} 积分</span>
            <span class="reward-source">${source}</span>
        </div>
    `;

    document.body.appendChild(rewardEl);

    // 动画效果
    setTimeout(() => {
        rewardEl.classList.add('show');
    }, 100);

    // 自动移除
    setTimeout(() => {
        rewardEl.classList.remove('show');
        setTimeout(() => {
            if (rewardEl.parentNode) {
                rewardEl.parentNode.removeChild(rewardEl);
            }
        }, 300);
    }, 2000);
}

// CSS样式（可以添加到styles.css中）
const pointsCSS = `
.points-reward {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.5);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.points-reward.show {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
}

.reward-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.reward-icon {
    font-size: 24px;
}

.reward-text {
    color: #FFD700;
    font-size: 20px;
}

.reward-source {
    font-size: 14px;
    opacity: 0.8;
}
`;

// 将样式添加到页面
if (!document.getElementById('points-system-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'points-system-style';
    styleEl.textContent = pointsCSS;
    document.head.appendChild(styleEl);
}

export default pointsSystem;