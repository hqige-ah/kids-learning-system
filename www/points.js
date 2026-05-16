/**
 * 积分系统核心模块 v2
 * 规则：12级上限，20积分升一级，任务给1-5分，每日上限24分
 */

class PointsSystem {
    constructor() {
        // 任务基础积分（1-5分制）
        this.basePoints = {
            // 每日学科任务
            pinyin_quiz:  { easy: 2, medium: 3, hard: 4 },
            chinese_quiz: { easy: 2, medium: 3, hard: 4 },
            english_quiz: { easy: 2, medium: 3, hard: 4 },
            math_quiz:    { easy: 2, medium: 3, hard: 4 },
            poetry_quiz:  { easy: 2, medium: 3, hard: 4 },
            // 闯关 / 挑战
            game_level:   { easy: 1, medium: 2, hard: 3 },
            // 全完成奖励
            daily_all:    { reward: 5 },
            // 互动奖励
            pet_feed:     { pts: 1 },
            pet_play:     { pts: 1 }
        };

        // 时间效率奖励倍率
        this.timeBonusThresholds = {
            excellent: 60,  // 1分钟内 1.5x
            good: 180,      // 3分钟内 1.2x
            normal: 300     // 5分钟内 1.1x
        };
    }

    /**
     * 计算任务完成后的积分（返回1-5分范围）
     * @param {string} taskType  - 任务类型
     * @param {Object} performance - { stars: 1-3, accuracy: 0-1, timeSpent: 秒 }
     * @returns {number} 获得的积分（1-5分）
     */
    calculateTaskPoints(taskType, performance) {
        const stars = performance.stars || 1;
        const accuracy = performance.accuracy || 0;
        const timeSpent = performance.timeSpent || 999;
        const difficulty = this.determineDifficulty({ stars, accuracy });

        const table = this.basePoints[taskType];
        if (!table) return 1;

        // 取基础分：优先用 star 直接映射（1星=1分起跳）
        let base = table[difficulty] || 2;
        // star 额外加分：3星+1，2星+0，1星-1
        const starBonus = stars >= 3 ? 1 : (stars <= 1 ? -1 : 0);
        base = Math.max(1, Math.min(5, base + starBonus));

        // 时间倍率
        const timeBonus = this.calculateTimeBonus(timeSpent);
        if (timeBonus > 1) {
            // 优秀时间奖励：最多加1分
            base = Math.min(5, base + 1);
        }

        return Math.max(1, Math.min(5, Math.round(base)));
    }

    /**
     * 确定任务难度
     */
    determineDifficulty(performance) {
        const accuracy = performance.accuracy || 0;
        const stars = performance.stars || 0;
        if (accuracy >= 90 && stars >= 3) return 'hard';
        if (accuracy >= 70 && stars >= 2) return 'medium';
        return 'easy';
    }

    /**
     * 计算时间效率奖励倍率
     */
    calculateTimeBonus(timeSpent) {
        if (timeSpent <= this.timeBonusThresholds.excellent) return 1.5;
        if (timeSpent <= this.timeBonusThresholds.good) return 1.2;
        if (timeSpent <= this.timeBonusThresholds.normal) return 1.1;
        return 1.0;
    }

    /**
     * 更新用户积分
     * @param {number} pointsToAdd - 要添加的积分
     * @param {string} source - 积分来源描述
     * @param {string} category - 分类：task/pet/interact/other
     */
    addPoints(pointsToAdd, source = '完成任务', category = 'task') {
        const maxDailyPoints = 24; // 每日上限24分

        if (typeof pointsToAdd !== 'number' || isNaN(pointsToAdd)) return 0;

        const remaining = maxDailyPoints - userData.points.today;
        const actualAdd = Math.max(0, Math.min(pointsToAdd, remaining));

        if (actualAdd <= 0) {
            showPointsReward(0, source);
            return 0;
        }

        const now = new Date();

        // 更新积分
        userData.points.total += actualAdd;
        userData.points.today += actualAdd;

        // 本周积分
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        if (now >= weekStart) {
            userData.points.weekly += actualAdd;
        }

        // 本月积分
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        if (now >= monthStart) {
            userData.points.monthly += actualAdd;
        }

        // 记录积分流水
        if (!userData.pointHistory) userData.pointHistory = [];
        userData.pointHistory.unshift({
            time: now.toISOString(),
            amount: actualAdd,
            source: source,
            category: category,
            balance: userData.points.total
        });
        // 最多保留200条
        if (userData.pointHistory.length > 200) userData.pointHistory.length = 200;

        // 宠物快乐度
        updatePetHappiness(actualAdd);

        saveUserData();
        showPointsReward(actualAdd, source);

        return actualAdd;
    }

    /**
     * 检查每日积分上限
     */
    checkDailyLimit() {
        if (userData.points.today > 24) {
            userData.points.today = 24;
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
            remainingToday: Math.max(0, 24 - userData.points.today),
            level: this.calculateLevel(userData.points.total)
        };
    }

    /**
     * 根据总积分计算等级：20分/级，最高12级
     */
    calculateLevel(totalPoints) {
        return Math.min(12, Math.floor(totalPoints / 20) + 1);
    }
}

// 全局积分系统实例
window.pointsSystem = new PointsSystem();

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

    setTimeout(() => rewardEl.classList.add('show'), 100);

    setTimeout(() => {
        rewardEl.classList.remove('show');
        setTimeout(() => {
            if (rewardEl.parentNode) rewardEl.parentNode.removeChild(rewardEl);
        }, 300);
    }, 2000);
}

// CSS样式
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

if (!document.getElementById('points-system-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'points-system-style';
    styleEl.textContent = pointsCSS;
    document.head.appendChild(styleEl);
}
