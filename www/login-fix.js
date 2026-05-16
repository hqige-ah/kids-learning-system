/**
 * 小小学习家 - 登录问题修复脚本
 * 解决角色创建和登录不进去的问题
 */

// 全局变量定义
let userData = null;
let selectedAvatar = '🦊';

// 初始化应用数据
function initApp() {
    console.log('初始化应用...');

    // 确保userData已加载
    if (!userData) {
        loadUserData();
    }

    // 检查localStorage是否正常工作
    checkStorageHealth();

    // 设置事件监听器
    setupEventListeners();

    // 延迟后检查登录状态
    setTimeout(checkLoginStatus, 500);
}

// 检查localStorage健康状况
function checkStorageHealth() {
    try {
        const testKey = 'health_check_' + Date.now();
        localStorage.setItem(testKey, 'test');
        const result = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        if (result === 'test') {
            console.log('✅ localStorage功能正常');
            return true;
        } else {
            console.error('❌ localStorage读写失败');
            return false;
        }
    } catch (error) {
        console.error('❌ localStorage访问异常:', error);
        return false;
    }
}

// 安全的数据加载函数
function loadUserData() {
    try {
        const saved = localStorage.getItem('kidsLearningApp');
        if (saved) {
            userData = JSON.parse(saved);

            // 确保数据结构完整（向后兼容）
            userData = deepMerge(defaultUserData, userData);
        } else {
            console.log('未找到保存数据，使用默认数据');
            userData = JSON.parse(JSON.stringify(defaultUserData));
        }
        saveUserData(); // 确保数据保存一次
    } catch (error) {
        console.error('加载用户数据失败:', error);
        userData = JSON.parse(JSON.stringify(defaultUserData));
        saveUserData();
    }
}

// 深合并函数
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// 安全的保存用户数据
function saveUserData() {
    try {
        // 添加最后修改时间戳
        userData.lastModified = new Date().toISOString();

        localStorage.setItem('kidsLearningApp', JSON.stringify(userData));
        console.log('✅ 用户数据已保存');
        return true;
    } catch (error) {
        console.error('❌ 保存用户数据失败:', error);
        return false;
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 为所有头像选择按钮添加监听器
    document.querySelectorAll('.avatar-option').forEach(button => {
        button.addEventListener('click', function() {
            selectAvatar(this);
        });
    });

    // 为角色创建按钮添加监听器
    const createBtn = document.querySelector('button[onclick="createCharacter()"]');
    if (createBtn) {
        createBtn.addEventListener('click', createCharacter);
    }
}

// 检查登录状态
function checkLoginStatus() {
    try {
        const hasLoggedIn = localStorage.getItem('kidsAppLoggedIn') === 'true';
        const savedData = localStorage.getItem('kidsLearningApp');

        if (!hasLoggedIn || !savedData) {
            showScreen('character-creation');
            console.log('显示角色创建页面');
            return;
        }

        // 验证数据格式
        const userData = JSON.parse(savedData);
        if (!userData.profile.nickname || userData.profile.nickname === '小朋友') {
            showScreen('character-creation');
            console.log('昵称无效，显示角色创建页面');
            return;
        }

        // 进入主页
        hideSplashAndShowHome();
        console.log('直接进入主页');
    } catch (error) {
        console.error('检查登录状态时出错:', error);
        showScreen('character-creation');
    }
}

// 隐藏启动页并显示主页
function hideSplashAndShowHome() {
    const splash = document.getElementById('splash-screen');
    const creation = document.getElementById('character-creation');

    if (splash) splash.style.display = 'none';
    if (creation) creation.style.display = 'none';

    showScreen('home-screen');
    updateHomeUI();
}

// 选择头像
function selectAvatar(element) {
    // 移除其他选中状态
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // 设置当前选中的头像
    element.classList.add('selected');
    selectedAvatar = element.dataset.avatar;

    console.log('选择的头像:', selectedAvatar);
}

// 创建角色
function createCharacter() {
    console.log('开始创建角色...');

    try {
        // 获取输入值
        const nicknameInput = document.getElementById('nickname-input');
        const nickname = nicknameInput ? nicknameInput.value.trim() : '';

        // 验证输入
        if (!nickname) {
            alert('请输入你的名字哦！');
            return;
        }

        if (nickname.length > 12) {
            alert('名字太长了哦，请输入8个字符以内！');
            return;
        }

        // 更新用户数据
        userData.profile.avatar = selectedAvatar;
        userData.profile.nickname = nickname;
        userData.stats.studyDays = 1;
        userData.stats.lastStudyDate = new Date().toDateString();
        userData.points.today = 0; // 新用户初始积分

        // 解锁默认宠物
        if (!userData.pets || userData.pets.length === 0) {
            userData.pets = [{
                id: 'default_pet_' + Date.now(),
                type: 'fox',
                name: selectedAvatar === '🐰' ? '小兔子' :
                      selectedAvatar === '🐻' ? '小熊' :
                      selectedAvatar === '🐼' ? '小熊猫' : '小狐狸',
                level: 1,
                experience: 0,
                happiness: 100,
                health: 100,
                skills: [],
                items: [],
                unlockedAt: new Date().toISOString(),
                lastInteraction: new Date().toISOString()
            }];
        }

        // 标记已登录
        localStorage.setItem('kidsAppLoggedIn', 'true');

        // 保存用户数据
        const saveResult = saveUserData();
        if (!saveResult) {
            throw new Error('保存数据失败');
        }

        // 显示成功消息
        alert('🎉 你好呀！' + nickname + '！\n\n你的' + userData.pets[0].name + '已经准备好陪伴你学习了！');

        // 进入主页
        hideSplashAndShowHome();

    } catch (error) {
        console.error('创建角色失败:', error);
        alert('出现错误，请刷新页面重试！\n\n错误信息: ' + error.message);
    }
}

// 显示屏幕
function showScreen(screenId) {
    // 隐藏所有screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });

    // 显示目标屏幕
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        targetScreen.style.display = 'block';
        console.log('显示屏幕:', screenId);
    }
}

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('📱 登录修复脚本已加载');