// ==================== 原生APP功能初始化 ====================

// 检测是否在原生APP环境中
const isNativeApp = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();

// 原生插件引用
let SplashScreen, StatusBar, Haptics, App, LocalNotifications;

// 初始化原生功能
async function initNativeFeatures() {
    if (!isNativeApp) {
        console.log('运行在Web浏览器环境');
        return;
    }

    console.log('运行在原生APP环境');

    try {
        // 动态导入Capacitor插件
        SplashScreen = Capacitor.Plugins.SplashScreen;
        StatusBar = Capacitor.Plugins.StatusBar;
        Haptics = Capacitor.Plugins.Haptics;
        App = Capacitor.Plugins.App;
        LocalNotifications = Capacitor.Plugins.LocalNotifications;

        // 设置状态栏
        if (StatusBar) {
            await StatusBar.setStyle({ style: 'LIGHT' });
            await StatusBar.setBackgroundColor({ color: '#5B9BD5' });
        }

        // 隐藏启动画面
        if (SplashScreen) {
            await SplashScreen.hide();
        }

        // 监听应用状态
        if (App) {
            App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    checkDailyTasks();
                }
            });

            // 监听返回按钮
            App.addListener('backButton', ({ canGoBack }) => {
                if (canGoBack) {
                    window.history.back();
                } else {
                    App.exitApp();
                }
            });
        }

        // 添加body类标识原生APP
        document.body.classList.add('native-app');

    } catch (error) {
        console.error('原生功能初始化失败:', error);
    }
}

// 原生震动反馈
async function hapticFeedback(style = 'medium') {
    if (!isNativeApp || !Haptics) return;

    try {
        switch (style) {
            case 'light':
                await Haptics.impact({ style: 'light' });
                break;
            case 'medium':
                await Haptics.impact({ style: 'medium' });
                break;
            case 'heavy':
                await Haptics.impact({ style: 'heavy' });
                break;
            case 'success':
                await Haptics.notification({ notificationType: 'SUCCESS' });
                break;
            case 'error':
                await Haptics.notification({ notificationType: 'ERROR' });
                break;
        }
    } catch (e) {
        console.log('震动反馈失败:', e);
    }
}

// 发送本地通知（学习提醒）
async function sendStudyReminder() {
    if (!isNativeApp || !LocalNotifications) return;

    try {
        await LocalNotifications.schedule({
            notifications: [{
                title: '学习时间到啦！🌟',
                body: '快来和小伙伴一起学习吧！',
                id: 1,
                schedule: { at: new Date(Date.now() + 1000 * 60 * 60 * 24) }, // 明天同一时间
                sound: null,
                attachments: null,
                actionTypeId: ''
            }]
        });
    } catch (e) {
        console.log('通知发送失败:', e);
    }
}

// ==================== 数据模型 ====================

// 默认用户数据
const defaultUserData = {
    profile: {
        avatar: '🦊',
        nickname: '小朋友',
        level: 1
    },
    stats: {
        totalStars: 0,
        studyDays: 0,
        streak: 0,
        lastStudyDate: null,
        mathCorrect: 0,
        mathWrong: 0
    },
    points: {
        total: 0,
        today: 0,
        weekly: 0,
        monthly: 0
    },
    pets: [{
        id: 'default_pet_1',
        type: 'fox',
        name: '小狐狸',
        level: 1,
        experience: 0,
        happiness: 100,
        health: 100,
        skills: [],
        items: [],
        unlockedAt: new Date().toISOString(),
        lastInteraction: new Date().toISOString()
    }],
    progress: {
        pinyin: {
            vowels: [],
            consonants: [],
            wholeSyllables: [],
            total: 44  // 6单韵母 + 23声母 + 15整体认读
        },
        chinese: {
            learned: [],
            total: 500
        },
        math: {
            numbers: [],
            addition: { correct: 0, total: 0 },
            subtraction: { correct: 0, total: 0 },
            multiplication: { correct: 0, total: 0 },
            division: { correct: 0, total: 0 },
            total: 200
        },
        english: {
            letters: [],
            learnedWords: [],
            total: 50
        }
    },
    dailyTasks: {
        date: null,
        completed: [],
        total: 4,
        streak: 0,
        extendedTasks: {
            math: { completed: false, stars: 0, points: 0 },
            chinese: { completed: false, stars: 0, points: 0 },
            poem: { completed: false, stars: 0, points: 0 }
        }
    },
    badges: [],
    settings: {
        soundEnabled: true
    },
    studyCalendar: []
};

// 拼音数据
const pinyinData = {
    vowels: [
        { char: 'a', name: '阿阿阿', tip: '嘴巴张大，声音响亮', audio: 'a' },
        { char: 'o', name: '喔喔喔', tip: '嘴巴圆圆，像吹泡泡', audio: 'o' },
        { char: 'e', name: '鹅鹅鹅', tip: '嘴巴扁扁，嘴角咧开', audio: 'e' },
        { char: 'i', name: '衣服衣', tip: '嘴巴咧开，露出牙齿', audio: 'yi' },
        { char: 'u', name: '乌鸦乌', tip: '嘴巴突出，圆圆小小', audio: 'u' },
        { char: 'ü', name: '小鱼ü', tip: '嘴巴像吹口哨', audio: 'v' }
    ],
    consonants: [
        { char: 'b', name: '播播播', tip: '双唇紧闭，突然放开', audio: 'b' },
        { char: 'p', name: '泼泼泼', tip: '双唇紧闭，送气放开', audio: 'p' },
        { char: 'm', name: '摸摸摸', tip: '双唇紧闭，气流从鼻出', audio: 'm' },
        { char: 'f', name: '佛佛佛', tip: '上齿咬下唇，气流摩擦', audio: 'f' },
        { char: 'd', name: '得得得', tip: '舌尖抵上牙龈，突然放开', audio: 'd' },
        { char: 't', name: '特特特', tip: '舌尖抵上牙龈，送气放开', audio: 't' },
        { char: 'n', name: '呢呢呢', tip: '舌尖抵上牙龈，气流从鼻出', audio: 'n' },
        { char: 'l', name: '乐乐乐', tip: '舌尖抵上牙龈，气流从两边出', audio: 'l' },
        { char: 'g', name: '哥哥哥', tip: '舌根抵软腭，突然放开', audio: 'g' },
        { char: 'k', name: '科科科', tip: '舌根抵软腭，送气放开', audio: 'k' },
        { char: 'h', name: '喝喝喝', tip: '舌根接近软腭，气流摩擦', audio: 'h' },
        { char: 'j', name: '鸡鸡鸡', tip: '舌面贴硬腭，摩擦出声', audio: 'j' },
        { char: 'q', name: '气气气', tip: '舌面贴硬腭，送气摩擦', audio: 'q' },
        { char: 'x', name: '西西西', tip: '舌面接近硬腭，摩擦出声', audio: 'x' },
        { char: 'zh', name: '知知知', tip: '舌尖翘起，抵住硬腭', audio: 'zh' },
        { char: 'ch', name: '吃吃吃', tip: '舌尖翘起，送气摩擦', audio: 'ch' },
        { char: 'sh', name: '诗诗诗', tip: '舌尖翘起，气流摩擦', audio: 'sh' },
        { char: 'r', name: '日日日', tip: '舌尖翘起，声带振动', audio: 'r' },
        { char: 'z', name: '字字字', tip: '舌尖平伸，抵住上齿背', audio: 'z' },
        { char: 'c', name: '次次次', tip: '舌尖平伸，送气摩擦', audio: 'c' },
        { char: 's', name: '思思思', tip: '舌尖平伸，气流摩擦', audio: 's' },
        { char: 'y', name: '衣衣衣', tip: '舌面抬高，接近硬腭', audio: 'y' },
        { char: 'w', name: '呜呜呜', tip: '双唇收圆，舌面抬高', audio: 'w' }
    ],
    // 整体认读音节
    wholeSyllables: [
        { char: 'zhi', name: '知', tip: '整体认读，一口呼出' },
        { char: 'chi', name: '吃', tip: '整体认读，一口呼出' },
        { char: 'shi', name: '诗', tip: '整体认读，一口呼出' },
        { char: 'ri', name: '日', tip: '整体认读，一口呼出' },
        { char: 'zi', name: '字', tip: '整体认读，一口呼出' },
        { char: 'ci', name: '次', tip: '整体认读，一口呼出' },
        { char: 'si', name: '丝', tip: '整体认读，一口呼出' },
        { char: 'yi', name: '衣', tip: '整体认读，一口呼出' },
        { char: 'wu', name: '屋', tip: '整体认读，一口呼出' },
        { char: 'yu', name: '鱼', tip: '整体认读，一口呼出' },
        { char: 'ye', name: '耶', tip: '整体认读，一口呼出' },
        { char: 'yue', name: '月', tip: '整体认读，一口呼出' },
        { char: 'yuan', name: '圆', tip: '整体认读，一口呼出' },
        { char: 'yin', name: '音', tip: '整体认读，一口呼出' },
        { char: 'ying', name: '鹰', tip: '整体认读，一口呼出' }
    ]
};

// 成就徽章数据
const badgesData = [
    { id: 'first_login', icon: '🌟', name: '初来乍到', desc: '第一次登录' },
    { id: 'pinyin_master', icon: '📖', name: '拼音小达人', desc: '学完所有单韵母' },
    { id: 'math_star', icon: '🔢', name: '数学小明星', desc: '完成50道计算题' },
    { id: 'streak_7', icon: '🔥', name: '坚持一周', desc: '连续学习7天' },
    { id: 'stars_100', icon: '⭐', name: '百星少年', desc: '累计获得100颗星' },
    { id: 'first_game', icon: '🎮', name: '游戏达人', desc: '完成第一个游戏' },
    { id: 'chinese_100', icon: '🏰', name: '汉字学徒', desc: '学会100个汉字' },
    { id: 'chinese_500', icon: '🏆', name: '汉字大师', desc: '学会500个汉字' },
    { id: 'english_all', icon: '🔤', name: '字母大师', desc: '学完26个字母' },
    { id: 'math_200', icon: '🎯', name: '数学天才', desc: '完成200道计算题' }
];

// ==================== 全局变量 ====================

let userData = null;
let currentPinyin = null;
let currentPinyinType = 'vowels';
let gameInterval = null;

// 拼读练习相关
let pinyinPractice = {
    questions: [],
    currentIndex: 0,
    score: 0,
    totalQuestions: 10,
    isAnswered: false
};

// 声母韵母组合数据（常见音节）
const pinyinCombos = [
    // b系列
    { consonant: 'b', vowel: 'a', syllable: 'ba' },
    { consonant: 'b', vowel: 'o', syllable: 'bo' },
    { consonant: 'b', vowel: 'i', syllable: 'bi' },
    { consonant: 'b', vowel: 'u', syllable: 'bu' },
    { consonant: 'b', vowel: 'ü', syllable: 'bü' },
    // p系列
    { consonant: 'p', vowel: 'a', syllable: 'pa' },
    { consonant: 'p', vowel: 'o', syllable: 'po' },
    { consonant: 'p', vowel: 'i', syllable: 'pi' },
    { consonant: 'p', vowel: 'u', syllable: 'pu' },
    // m系列
    { consonant: 'm', vowel: 'a', syllable: 'ma' },
    { consonant: 'm', vowel: 'o', syllable: 'mo' },
    { consonant: 'm', vowel: 'i', syllable: 'mi' },
    { consonant: 'm', vowel: 'u', syllable: 'mu' },
    { consonant: 'm', vowel: 'ü', syllable: 'mü' },
    // f系列
    { consonant: 'f', vowel: 'a', syllable: 'fa' },
    { consonant: 'f', vowel: 'o', syllable: 'fo' },
    { consonant: 'f', vowel: 'u', syllable: 'fu' },
    // d系列
    { consonant: 'd', vowel: 'a', syllable: 'da' },
    { consonant: 'd', vowel: 'e', syllable: 'de' },
    { consonant: 'd', vowel: 'i', syllable: 'di' },
    { consonant: 'd', vowel: 'u', syllable: 'du' },
    { consonant: 'd', vowel: 'ü', syllable: 'dü' },
    // t系列
    { consonant: 't', vowel: 'a', syllable: 'ta' },
    { consonant: 't', vowel: 'e', syllable: 'te' },
    { consonant: 't', vowel: 'i', syllable: 'ti' },
    { consonant: 't', vowel: 'u', syllable: 'tu' },
    { consonant: 't', vowel: 'ü', syllable: 'tü' },
    // n系列
    { consonant: 'n', vowel: 'a', syllable: 'na' },
    { consonant: 'n', vowel: 'e', syllable: 'ne' },
    { consonant: 'n', vowel: 'i', syllable: 'ni' },
    { consonant: 'n', vowel: 'u', syllable: 'nu' },
    { consonant: 'n', vowel: 'ü', syllable: 'nü' },
    // l系列
    { consonant: 'l', vowel: 'a', syllable: 'la' },
    { consonant: 'l', vowel: 'e', syllable: 'le' },
    { consonant: 'l', vowel: 'i', syllable: 'li' },
    { consonant: 'l', vowel: 'u', syllable: 'lu' },
    { consonant: 'l', vowel: 'ü', syllable: 'lü' },
    // g系列
    { consonant: 'g', vowel: 'a', syllable: 'ga' },
    { consonant: 'g', vowel: 'e', syllable: 'ge' },
    { consonant: 'g', vowel: 'u', syllable: 'gu' },
    // k系列
    { consonant: 'k', vowel: 'a', syllable: 'ka' },
    { consonant: 'k', vowel: 'e', syllable: 'ke' },
    { consonant: 'k', vowel: 'u', syllable: 'ku' },
    // h系列
    { consonant: 'h', vowel: 'a', syllable: 'ha' },
    { consonant: 'h', vowel: 'e', syllable: 'he' },
    { consonant: 'h', vowel: 'u', syllable: 'hu' },
    // j系列
    { consonant: 'j', vowel: 'i', syllable: 'ji' },
    { consonant: 'j', vowel: 'u', syllable: 'ju' },
    { consonant: 'j', vowel: 'ü', syllable: 'jü' },
    // q系列
    { consonant: 'q', vowel: 'i', syllable: 'qi' },
    { consonant: 'q', vowel: 'u', syllable: 'qu' },
    { consonant: 'q', vowel: 'ü', syllable: 'qü' },
    // x系列
    { consonant: 'x', vowel: 'i', syllable: 'xi' },
    { consonant: 'x', vowel: 'u', syllable: 'xu' },
    { consonant: 'x', vowel: 'ü', syllable: 'xü' },
    // z系列
    { consonant: 'z', vowel: 'a', syllable: 'za' },
    { consonant: 'z', vowel: 'e', syllable: 'ze' },
    { consonant: 'z', vowel: 'i', syllable: 'zi' },
    { consonant: 'z', vowel: 'u', syllable: 'zu' },
    // c系列
    { consonant: 'c', vowel: 'a', syllable: 'ca' },
    { consonant: 'c', vowel: 'e', syllable: 'ce' },
    { consonant: 'c', vowel: 'i', syllable: 'ci' },
    { consonant: 'c', vowel: 'u', syllable: 'cu' },
    // s系列
    { consonant: 's', vowel: 'a', syllable: 'sa' },
    { consonant: 's', vowel: 'e', syllable: 'se' },
    { consonant: 's', vowel: 'i', syllable: 'si' },
    { consonant: 's', vowel: 'u', syllable: 'su' },
    // zh系列
    { consonant: 'zh', vowel: 'a', syllable: 'zha' },
    { consonant: 'zh', vowel: 'e', syllable: 'zhe' },
    { consonant: 'zh', vowel: 'i', syllable: 'zhi' },
    { consonant: 'zh', vowel: 'u', syllable: 'zhu' },
    // ch系列
    { consonant: 'ch', vowel: 'a', syllable: 'cha' },
    { consonant: 'ch', vowel: 'e', syllable: 'che' },
    { consonant: 'ch', vowel: 'i', syllable: 'chi' },
    { consonant: 'ch', vowel: 'u', syllable: 'chu' },
    // sh系列
    { consonant: 'sh', vowel: 'a', syllable: 'sha' },
    { consonant: 'sh', vowel: 'e', syllable: 'she' },
    { consonant: 'sh', vowel: 'i', syllable: 'shi' },
    { consonant: 'sh', vowel: 'u', syllable: 'shu' },
    // r系列
    { consonant: 'r', vowel: 'a', syllable: 'ra' },
    { consonant: 'r', vowel: 'e', syllable: 're' },
    { consonant: 'r', vowel: 'i', syllable: 'ri' },
    { consonant: 'r', vowel: 'u', syllable: 'ru' },
    // y系列
    { consonant: 'y', vowel: 'a', syllable: 'ya' },
    { consonant: 'y', vowel: 'e', syllable: 'ye' },
    { consonant: 'y', vowel: 'i', syllable: 'yi' },
    { consonant: 'y', vowel: 'u', syllable: 'yu' },
    // w系列
    { consonant: 'w', vowel: 'a', syllable: 'wa' },
    { consonant: 'w', vowel: 'e', syllable: 'we' },
    { consonant: 'w', vowel: 'i', syllable: 'wi' },
    { consonant: 'w', vowel: 'u', syllable: 'wu' }
];
let writingCtx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// 数学相关
let mathSettings = {
    operation: '+',
    level: 1,
    range: { start: 1, end: 50 }
};
let mathStats = { correct: 0, wrong: 0 };

// 汉字相关
let chineseFilter = {
    category: 'all',
    search: '',
    page: 1,
    pageSize: 50
};
let currentChineseItem = null;

// 气球游戏
let balloonGame = {
    score: 0,
    timer: 60,
    target: null,
    balloons: []
};

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
    initNativeFeatures().then(() => {
        initApp();
    });
});

// 记录当前所在页面，用于返回
let currentLearningScreen = 'home-screen';

function initApp() {
    // 确保数据初始化
    loadUserData();
    
    // 初始化各模块
    initPinyinModule();
    initMathModule();
    initChineseModule();
    initEnglishModule();
    initWritingCanvas();

    // 原生APP环境下缩短启动等待时间
    const splashDelay = isNativeApp ? 500 : 2000;

    setTimeout(() => {
        // 检查是否已登录过（有自定义昵称）
        const hasLoggedIn = localStorage.getItem('kidsAppLoggedIn') === 'true';
        
        if (!hasLoggedIn || !userData.profile.nickname || userData.profile.nickname === '小朋友') {
            // 首次登录，显示角色创建页
            showScreen('character-creation');
        } else {
            // 已登录过，直接进入首页，隐藏启动页
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('character-creation').style.display = 'none';
            showScreen('home-screen');
            updateHomeUI();
        }
    }, splashDelay);
}

// 数据加载保存
function loadUserData() {
    const saved = localStorage.getItem('kidsLearningApp');
    if (saved) {
        userData = JSON.parse(saved);
        userData = deepMerge(defaultUserData, userData);
    } else {
        userData = JSON.parse(JSON.stringify(defaultUserData));
    }
    saveUserData();
}

function saveUserData() {
    localStorage.setItem('kidsLearningApp', JSON.stringify(userData));
}

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

// ==================== 页面切换 ====================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.screen === screenId) {
            item.classList.add('active');
        }
    });

    if (screenId === 'home-screen') {
        updateHomeUI();
        checkDailyTasks();
    } else if (screenId === 'profile-screen') {
        updateProfileUI();
    } else if (screenId === 'math-screen') {
        initMathScreen();
    } else if (screenId === 'chinese-screen') {
        renderChineseGrid();
    }
}

// ==================== 角色创建 ====================

let selectedAvatar = '🦊';

function selectAvatar(element) {
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedAvatar = element.dataset.avatar;
}

function createCharacter() {
    // 确保userData已初始化
    if (!userData) {
        loadUserData();
    }
    
    const nickname = document.getElementById('nickname-input').value.trim();
    if (!nickname) {
        alert('请输入你的名字哦！');
        return;
    }

    try {
        userData.profile.avatar = selectedAvatar;
        userData.profile.nickname = nickname;
        userData.stats.studyDays = 1;
        userData.stats.lastStudyDate = new Date().toDateString();
        userData.points.today = 0; // 新用户初始积分
        userData.studyCalendar.push(new Date().toDateString());
        unlockBadge('first_login');
        saveUserData();
        
        // 标记已登录，并解锁默认宠物
        localStorage.setItem('kidsAppLoggedIn', 'true');
        userData.pets[0].unlockedAt = new Date().toISOString();
        
        // 永久隐藏角色创建页和启动页
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('character-creation').style.display = 'none';
        
        showScreen('home-screen');
    } catch (error) {
        console.error('创建角色失败:', error);
        alert('出现错误，请刷新页面重试！');
    }
}

// ==================== 主页更新 ====================

function updateHomeUI() {
    document.getElementById('home-avatar').textContent = userData.profile.avatar;
    document.getElementById('home-nickname').textContent = userData.profile.nickname;
    document.getElementById('home-stars').textContent = userData.stats.totalStars;
    document.getElementById('home-streak').textContent = userData.stats.streak;

    const dailyComplete = userData.dailyTasks.completed.length;
    document.getElementById('daily-progress').textContent = `${dailyComplete}/${userData.dailyTasks.total}`;
    document.getElementById('daily-progress-bar').style.width = `${(dailyComplete / userData.dailyTasks.total) * 100}%`;

updateModuleProgress('pinyin', userData.progress.pinyin);
    updateModuleProgress('chinese', userData.progress.chinese);
    updateModuleProgress('math', userData.progress.math);
    updateModuleProgress('english', userData.progress.english);

    // 更新积分、宠物和任务显示
    updatePointsDisplay();
    updatePetStatus();
    updateDailyTaskDisplay();
}

function updateModuleProgress(moduleName, progressData) {
    let percent = 0;

    if (moduleName === 'pinyin') {
        const learned = progressData.vowels.length + progressData.consonants.length;
        percent = Math.round((learned / progressData.total) * 100);
    } else if (moduleName === 'chinese') {
        percent = Math.round((progressData.learned.length / progressData.total) * 100);
    } else if (moduleName === 'math') {
        percent = Math.round((progressData.numbers.length / progressData.total) * 100);
    } else if (moduleName === 'english') {
        percent = Math.round((progressData.letters.length / progressData.total) * 100);
    }

    const progressEl = document.getElementById(`${moduleName}-progress`);
    const percentEl = document.getElementById(`${moduleName}-percent`);
    if (progressEl) progressEl.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;
}

function checkDailyTasks() {
    const today = new Date().toDateString();
    if (userData.dailyTasks.date !== today) {
        userData.dailyTasks.date = today;
        userData.dailyTasks.completed = [];
        // 重置今日积分
        userData.points.today = 0;
        // 更新宠物状态
        updatePetHappiness();
        saveUserData();
    }
    checkStreak();
}

function checkStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (userData.stats.lastStudyDate === today) {
        return;
    } else if (userData.stats.lastStudyDate === yesterday) {
        userData.stats.streak++;
        userData.stats.lastStudyDate = today;
        userData.stats.studyDays++;
        if (!userData.studyCalendar.includes(today)) {
            userData.studyCalendar.push(today);
        }
        if (userData.stats.streak >= 7) unlockBadge('streak_7');
        saveUserData();
    } else if (userData.stats.lastStudyDate !== today) {
        userData.stats.streak = 1;
        userData.stats.lastStudyDate = today;
        userData.stats.studyDays++;
        if (!userData.studyCalendar.includes(today)) {
            userData.studyCalendar.push(today);
        }
        saveUserData();
    }
}

// ==================== 拼音模块 ====================

function initPinyinModule() {
    renderPinyinGrid('vowels');
    renderPinyinGrid('consonants');
    renderPinyinGrid('wholeSyllables');
}

function renderPinyinGrid(type) {
    const container = document.getElementById(`pinyin-${type}`);
    if (!container) return;

    const data = pinyinData[type];
    container.innerHTML = '';

    data.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'pinyin-item';

        const learned = userData.progress.pinyin[type];
        if (learned.includes(item.char)) {
            div.classList.add('completed');
        }

        // 声母需要先学完单韵母
        if (type === 'vowels' && index > 0 && !learned.includes(data[index - 1].char)) {
            div.classList.add('locked');
        } else if (type === 'consonants') {
            // 检查是否学完所有单韵母（长度达到6）
            const vowelsLearned = userData.progress.pinyin.vowels.length;
            if (vowelsLearned < 6) {
                div.classList.add('locked');
            } else if (index > 0 && !learned.includes(data[index - 1].char)) {
                div.classList.add('locked');
            }
        } else if (type === 'wholeSyllables') {
            // 整体认读音节需要先学完声母
            const consonantsLearned = userData.progress.pinyin.consonants.length;
            if (consonantsLearned < 23) {
                div.classList.add('locked');
            }
        }

        div.innerHTML = `<span class="pinyin-char">${item.char}</span>`;

        if (!div.classList.contains('locked')) {
            div.onclick = () => openPinyinDetail(type, index);
        }

        container.appendChild(div);
    });
}

function switchPinyinTab(tab) {
    currentPinyinType = tab;
    document.querySelectorAll('#pinyin-screen .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }

    document.getElementById('pinyin-vowels').style.display = tab === 'vowels' ? 'grid' : 'none';
    document.getElementById('pinyin-consonants').style.display = tab === 'consonants' ? 'grid' : 'none';
    document.getElementById('pinyin-wholeSyllables').style.display = tab === 'wholeSyllables' ? 'grid' : 'none';

    // 拼读练习区域
    const practiceArea = document.getElementById('pinyin-practice');
    if (practiceArea) {
        if (tab === 'practice') {
            practiceArea.style.display = 'block';
            // 显示模式选择
            showPracticeModes();
        } else {
            practiceArea.style.display = 'none';
            // 隐藏所有拼读子页面
            document.getElementById('practice-modes').style.display = 'none';
            document.getElementById('practice-free').style.display = 'none';
            document.getElementById('practice-guided').style.display = 'none';
            document.getElementById('practice-quiz').style.display = 'none';
            // 更新标题为拼音王国
            updatePinyinHeader('📖 拼音王国', 'home');
        }
    }

    // 切换标签时刷新显示
    if (tab !== 'practice') {
        renderPinyinGrid(tab);
    }
}

function openPinyinDetail(type, index) {
    currentPinyin = { type, index, data: pinyinData[type][index] };

    document.getElementById('current-pinyin').textContent = currentPinyin.data.char;
    document.getElementById('pinyin-name').textContent = currentPinyin.data.name;
    document.getElementById('pinyin-tip').textContent = currentPinyin.data.tip;
    document.getElementById('pinyin-detail-title').textContent = `学习 ${currentPinyin.data.char}`;
    document.getElementById('pinyin-detail-stars').textContent = userData.stats.totalStars;

    // 显示/隐藏声调选择器
    const toneSelector = document.getElementById('tone-selector');
    if (type === 'vowels') {
        // 单韵母 - 显示四声调
        toneSelector.style.display = 'flex';
        const char = currentPinyin.data.char;
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`tone-btn-${i}`);
            if (btn) {
                const tonedChar = PinyinAudio.getTonedChar(char, i);
                btn.textContent = `${tonedChar} ${i}声`;
            }
        }
    } else if (type === 'wholeSyllables') {
        // 整体认读音节 - 显示四声调
        toneSelector.style.display = 'flex';
        const char = currentPinyin.data.char;
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`tone-btn-${i}`);
            if (btn) {
                const tonedChar = PinyinAudio.getWholeSyllableTonedDisplay(char, i);
                btn.textContent = `${tonedChar} ${i}声`;
            }
        }
    } else {
        // 声母 - 不显示声调选择器
        toneSelector.style.display = 'none';
    }

    clearCanvas();
    showScreen('pinyin-detail');
    
    // 自动播放一次发音
    setTimeout(() => {
        if (type === 'vowels' || type === 'wholeSyllables') {
            playPinyinSound(1);
        } else if (type === 'consonants') {
            PinyinAudio.playConsonant(currentPinyin.data.char);
        }
    }, 300);
}

function playPinyinSound(tone = 1) {
    if (!currentPinyin) return;
    
    const char = currentPinyin.data.char;
    
    // 使用音频模块播放
    if (currentPinyin.type === 'vowels') {
        // 单韵母 - 支持4声调
        PinyinAudio.playVowel(char, tone);
    } else if (currentPinyin.type === 'consonants') {
        // 声母 - 只播放声母本身读音
        PinyinAudio.playConsonant(char);
    } else if (currentPinyin.type === 'wholeSyllables') {
        // 整体认读音节 - 支持4声调
        PinyinAudio.playWholeSyllable(char, tone);
    }
}

function completePinyin() {
    const learned = userData.progress.pinyin[currentPinyin.type];
    if (!learned.includes(currentPinyin.data.char)) {
        learned.push(currentPinyin.data.char);
        addStars(5);
        completeDailyTask('pinyin');

        // 检查徽章
        if (userData.progress.pinyin.vowels.length >= 6) {
            unlockBadge('pinyin_master');
        }
        
        saveUserData();
    }
    
    // 立即刷新所有拼音网格显示，解锁下一个
    renderPinyinGrid('vowels');
    renderPinyinGrid('consonants');
    renderPinyinGrid('wholeSyllables');
    
    // 显示奖励但不跳转首页，返回拼音页面
    showRewardNoRedirect('学会了！', `学会了"${currentPinyin.data.char}"，获得 5 颗星星！`, 5);
    showScreen('pinyin-screen');
}

// ==================== 书写画布 ====================

function initWritingCanvas() {
    const canvas = document.getElementById('writing-canvas');
    if (!canvas) return;

    writingCtx = canvas.getContext('2d');
    writingCtx.strokeStyle = '#5B9BD5';
    writingCtx.lineWidth = 4;
    writingCtx.lineCap = 'round';
    writingCtx.lineJoin = 'round';

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = e.target.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    writingCtx.beginPath();
    writingCtx.moveTo(lastX, lastY);
    writingCtx.lineTo(x, y);
    writingCtx.stroke();

    lastX = x;
    lastY = y;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    isDrawing = true;
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    writingCtx.beginPath();
    writingCtx.moveTo(lastX, lastY);
    writingCtx.lineTo(x, y);
    writingCtx.stroke();

    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

function clearCanvas() {
    const canvas = document.getElementById('writing-canvas');
    if (canvas && writingCtx) {
        writingCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function submitWriting() {
    alert('写得真棒！继续练习吧！');
    clearCanvas();
}

// ==================== 数学模块（升级版）====================

function initMathModule() {
    renderNumberGrid(1, 50);
}

function initMathScreen() {
    document.getElementById('correct-count').textContent = mathStats.correct;
    document.getElementById('wrong-count').textContent = mathStats.wrong;
    document.getElementById('math-stars').textContent = userData.stats.totalStars;
}

function setNumberRange(start, end, btn) {
    mathSettings.range = { start, end };
    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderNumberGrid(start, end);
}

function renderNumberGrid(start, end) {
    const container = document.getElementById('number-grid');
    if (!container) return;

    container.innerHTML = '';

    for (let i = start; i <= end; i++) {
        const div = document.createElement('div');
        div.className = 'number-item';

        if (userData.progress.math.numbers.includes(i)) {
            div.classList.add('completed');
        }

        div.textContent = i;
        div.onclick = () => learnNumber(i);
        container.appendChild(div);
    }
}

function learnNumber(num) {
    if (!userData.progress.math.numbers.includes(num)) {
        userData.progress.math.numbers.push(num);
        addStars(1);
        saveUserData();
        
        const items = document.querySelectorAll('.number-item');
        const index = num - mathSettings.range.start;
        if (items[index]) {
            items[index].classList.add('completed');
        }
    }
}

function switchMathTab(tab, btn) {
    document.querySelectorAll('#math-screen .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.getElementById('math-numbers').style.display = tab === 'numbers' ? 'block' : 'none';
    document.getElementById('math-calculate').style.display = tab === 'calculate' ? 'block' : 'none';
    document.getElementById('math-wordProblems').style.display = tab === 'wordProblems' ? 'block' : 'none';

    if (tab === 'calculate') {
        generateMathQuestion();
    } else if (tab === 'wordProblems') {
        generateWordProblem();
    }
}

function setOperation(op, btn) {
    mathSettings.operation = op;
    document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    generateMathQuestion();
}

function setLevel(level, btn) {
    mathSettings.level = level;
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    generateMathQuestion();
}

function generateMathQuestion() {
    const { operation, level } = mathSettings;
    let num1, num2, answer;

    // 根据难度设置数字范围
    const maxNum = level === 1 ? 20 : (level === 2 ? 50 : 100);
    const maxResult = level === 1 ? 20 : (level === 2 ? 50 : 200);

    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * (maxResult - num1)) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * maxNum) + Math.floor(maxNum / 2);
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * (level === 1 ? 5 : (level === 2 ? 9 : 12))) + 1;
            num2 = Math.floor(Math.random() * (level === 1 ? 5 : (level === 2 ? 9 : 12))) + 1;
            answer = num1 * num2;
            break;
        case '÷':
            num2 = Math.floor(Math.random() * (level === 1 ? 5 : (level === 2 ? 9 : 12))) + 1;
            answer = Math.floor(Math.random() * (level === 1 ? 5 : (level === 2 ? 9 : 12))) + 1;
            num1 = num2 * answer;
            break;
    }

    const displayOp = operation === '×' ? '×' : (operation === '÷' ? '÷' : operation);
    document.getElementById('math-question').textContent = `${num1} ${displayOp} ${num2} = ?`;

    // 生成选项
    const options = [answer];
    while (options.length < 4) {
        let wrong;
        if (operation === '×' || operation === '÷') {
            wrong = answer + Math.floor(Math.random() * 10) - 5;
        } else {
            wrong = answer + Math.floor(Math.random() * 7) - 3;
        }
        if (wrong > 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }

    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('math-options');
    container.innerHTML = '';

    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'math-option';
        btn.textContent = opt;
        btn.onclick = () => checkMathAnswer(opt, answer, btn);
        container.appendChild(btn);
    });
}

function checkMathAnswer(selected, answer, element) {
    if (selected === answer) {
        element.classList.add('correct');
        mathStats.correct++;
        
        // 原生震动反馈 - 成功
        hapticFeedback('success');
        
        const stars = mathSettings.level * 2;
        addStars(stars);
        
        // 记录对应运算类型
        const opKey = mathSettings.operation === '+' ? 'addition' : 
                      (mathSettings.operation === '-' ? 'subtraction' :
                      (mathSettings.operation === '×' ? 'multiplication' : 'division'));
        userData.progress.math[opKey].correct++;
        userData.progress.math[opKey].total++;
        userData.stats.mathCorrect++;
        
        completeDailyTask('math');
        saveUserData();

        // 检查徽章
        const totalMath = userData.stats.mathCorrect;
        if (totalMath >= 50) unlockBadge('math_star');
        if (totalMath >= 200) unlockBadge('math_200');

        setTimeout(() => generateMathQuestion(), 800);
    } else {
        element.classList.add('wrong');
        mathStats.wrong++;
        userData.stats.mathWrong++;
        
        // 原生震动反馈 - 错误
        hapticFeedback('error');
        
        const opKey = mathSettings.operation === '+' ? 'addition' : 
                      (mathSettings.operation === '-' ? 'subtraction' :
                      (mathSettings.operation === '×' ? 'multiplication' : 'division'));
        userData.progress.math[opKey].total++;
        saveUserData();

        setTimeout(() => element.classList.remove('wrong'), 500);
    }

    document.getElementById('correct-count').textContent = mathStats.correct;
    document.getElementById('wrong-count').textContent = mathStats.wrong;
}

// ==================== 应用题模块 ====================

let wordProblemSettings = {
    type: 'add'  // add, sub, mix
};

let wordProblemStats = {
    correct: 0,
    wrong: 0
};

// 应用题模板库
const wordProblemTemplates = {
    add: [
        { template: '{name}有{a}个{item}，妈妈又给了{b}个，现在一共有多少个{item}？', icon: '🎁' },
        { template: '篮子里有{a}个{item}，又放进了{b}个，篮子里现在有多少个{item}？', icon: '🧺' },
        { template: '停车场有{a}辆{vehicle}，又开来了{b}辆，现在有多少辆{vehicle}？', icon: '🚗' },
        { template: '花园里有{a}朵{flower}，又开了{b}朵，现在有多少朵{flower}？', icon: '🌸' },
        { template: '{name}上午写了{a}个字，下午写了{b}个字，一共写了多少个字？', icon: '✍️' },
        { template: '书架上有{a}本{book}，又放上去了{b}本，现在有多少本{book}？', icon: '📚' },
        { template: '池塘里有{a}只{animal}，又游来了{b}只，现在有多少只{animal}？', icon: '🦆' },
        { template: '{name}吃了{a}块饼干，又吃了{b}块，一共吃了多少块饼干？', icon: '🍪' },
        { template: '树上原来有{a}只{bird}，又飞来了{b}只，现在有多少只{bird}？', icon: '🐦' },
        { template: '{name}有{a}颗糖果，朋友又给了{b}颗，现在有多少颗糖果？', icon: '🍬' }
    ],
    sub: [
        { template: '{name}有{a}个{item}，吃掉了{b}个，还剩多少个{item}？', icon: '🍎' },
        { template: '篮子里有{a}个{item}，拿走了{b}个，篮子里还有多少个{item}？', icon: '🧺' },
        { template: '停车场有{a}辆{vehicle}，开走了{b}辆，还剩多少辆{vehicle}？', icon: '🚗' },
        { template: '花园里有{a}朵{flower}，摘了{b}朵送给人，还剩多少朵{flower}？', icon: '🌸' },
        { template: '{name}有{a}张贴画，送给朋友{b}张，还剩多少张贴画？', icon: '🖼️' },
        { template: '书架上有{a}本{book}，借出去了{b}本，还剩多少本{book}？', icon: '📚' },
        { template: '池塘里有{a}只{animal}，游走了{b}只，还剩多少只{animal}？', icon: '🦆' },
        { template: '{name}有{a}块饼干，吃掉了{b}块，还剩多少块饼干？', icon: '🍪' },
        { template: '树上有{a}只{bird}，飞走了{b}只，还剩多少只{bird}？', icon: '🐦' },
        { template: '{name}有{a}颗糖果，分给朋友{b}颗，还剩多少颗糖果？', icon: '🍬' }
    ]
};

// 填充词库
const fillWords = {
    names: ['小明', '小红', '小华', '小丽', '小刚', '小芳', '乐乐', '欢欢'],
    items: ['苹果', '香蕉', '橘子', '桃子', '梨', '西瓜', '草莓', '葡萄'],
    flowers: ['红花', '黄花', '蓝花', '花'],
    vehicles: ['汽车', '公交车', '自行车', '摩托车', '卡车'],
    animals: ['鸭子', '天鹅', '青蛙', '小鱼'],
    birds: ['小鸟', '麻雀', '燕子', '鸽子'],
    books: ['故事书', '漫画书', '课本', '书']
};

function setWordProblemType(type, btn) {
    wordProblemSettings.type = type;
    document.querySelectorAll('.wp-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    generateWordProblem();
}

function generateWordProblem() {
    const type = wordProblemSettings.type;
    let actualType = type;
    
    // 如果是混合模式，随机选择加减法
    if (type === 'mix') {
        actualType = Math.random() > 0.5 ? 'add' : 'sub';
    }
    
    const templates = wordProblemTemplates[actualType];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // 生成数字
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * Math.min(a, 10)) + 1;
    
    // 计算答案
    let answer;
    if (actualType === 'add') {
        answer = a + b;
    } else {
        answer = a - b;
    }
    
    // 填充模板
    let question = template.template;
    const name = fillWords.names[Math.floor(Math.random() * fillWords.names.length)];
    const item = fillWords.items[Math.floor(Math.random() * fillWords.items.length)];
    const flower = fillWords.flowers[Math.floor(Math.random() * fillWords.flowers.length)];
    const vehicle = fillWords.vehicles[Math.floor(Math.random() * fillWords.vehicles.length)];
    const animal = fillWords.animals[Math.floor(Math.random() * fillWords.animals.length)];
    const bird = fillWords.birds[Math.floor(Math.random() * fillWords.birds.length)];
    const book = fillWords.books[Math.floor(Math.random() * fillWords.books.length)];
    
    question = question.replace(/{name}/g, name);
    question = question.replace(/{a}/g, a);
    question = question.replace(/{b}/g, b);
    question = question.replace(/{item}/g, item);
    question = question.replace(/{flower}/g, flower);
    question = question.replace(/{vehicle}/g, vehicle);
    question = question.replace(/{animal}/g, animal);
    question = question.replace(/{bird}/g, bird);
    question = question.replace(/{book}/g, book);
    
    // 显示题目
    document.getElementById('wp-scenario').textContent = template.icon + ' ' + (actualType === 'add' ? '加法应用题' : '减法应用题');
    document.getElementById('wp-question').textContent = question;
    
    // 显示图示
    let illustration = '';
    const iconEmoji = template.icon.replace(/[📝🎁🧺🚗🌸✍️📚🦆🍪🐦🍬]/g, '').trim() || '🍎';
    for (let i = 0; i < Math.min(a, 10); i++) illustration += iconEmoji;
    if (actualType === 'add') {
        illustration += ' ➕ ';
        for (let i = 0; i < Math.min(b, 10); i++) illustration += iconEmoji;
    } else {
        illustration += ' ➖ ';
        for (let i = 0; i < Math.min(b, 10); i++) illustration += '❌';
    }
    document.getElementById('wp-illustration').textContent = illustration;
    
    // 生成选项
    const options = [answer];
    while (options.length < 4) {
        const wrong = answer + Math.floor(Math.random() * 7) - 3;
        if (wrong > 0 && wrong !== answer && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    options.sort(() => Math.random() - 0.5);
    
    const container = document.getElementById('wp-options');
    container.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'wp-option';
        btn.textContent = opt;
        btn.onclick = () => checkWordProblemAnswer(opt, answer, btn);
        container.appendChild(btn);
    });
}

function checkWordProblemAnswer(selected, answer, element) {
    if (selected === answer) {
        element.classList.add('correct');
        wordProblemStats.correct++;
        addStars(3);
        completeDailyTask('math');
        saveUserData();
        hapticFeedback('success');
        setTimeout(() => generateWordProblem(), 1000);
    } else {
        element.classList.add('wrong');
        wordProblemStats.wrong++;
        hapticFeedback('error');
        setTimeout(() => element.classList.remove('wrong'), 500);
    }
    
    document.getElementById('wp-correct-count').textContent = wordProblemStats.correct;
    document.getElementById('wp-wrong-count').textContent = wordProblemStats.wrong;
}

// ==================== 拼音拼读练习 ====================

// 自由拼读状态
let freePractice = {
    consonant: null,
    vowel: null,
    tone: 1
};

// 跟读练习状态
let guidedPractice = {
    currentIndex: 0,
    selectedTone: 1,
    // 按声母分类的双音节和多音节词
    examples: [
        // b 声母
        { consonant: 'b', vowel: 'a', tone: 1, word: 'ba', meaning: '八', type: 'syllable' },
        { consonant: 'b', vowel: 'a', tone: 3, word: 'bà', meaning: '爸', type: 'syllable' },
        { consonant: 'b', vowel: 'a', tone: 4, word: '爸', meaning: '爸爸', type: 'word' },
        { consonant: 'b', vowel: 'ei', tone: 1, word: 'bei', meaning: '杯', type: 'syllable' },
        // m 声母
        { consonant: 'm', vowel: 'a', tone: 1, word: 'ma', meaning: '妈', type: 'syllable' },
        { consonant: 'm', vowel: 'a', tone: 3, word: '马', meaning: '马', type: 'word' },
        { consonant: 'm', vowel: 'i', tone: 1, word: 'mi', meaning: '米', type: 'syllable' },
        { consonant: 'm', vowel: 'i', tone: 2, word: '迷', meaning: '迷路', type: 'word' },
        // d 声母
        { consonant: 'd', vowel: 'a', tone: 1, word: 'da', meaning: '大', type: 'syllable' },
        { consonant: 'd', vowel: 'a', tone: 4, word: '大', meaning: '大小', type: 'word' },
        { consonant: 'd', vowel: 'i', tone: 1, word: 'di', meaning: '低', type: 'syllable' },
        { consonant: 'd', vowel: 'i', tone: 4, word: '弟', meaning: '弟弟', type: 'word' },
        // p 声母
        { consonant: 'p', vowel: 'a', tone: 1, word: 'pa', meaning: '趴', type: 'syllable' },
        { consonant: 'p', vowel: 'o', tone: 1, word: 'po', meaning: '坡', type: 'syllable' },
        // l 声母
        { consonant: 'l', vowel: 'a', tone: 1, word: 'la', meaning: '拉', type: 'syllable' },
        { consonant: 'l', vowel: 'i', tone: 3, word: 'li', meaning: '李', type: 'syllable' },
        { consonant: 'l', vowel: 'i', tone: 4, word: '力', meaning: '力气', type: 'word' },
        // t 声母
        { consonant: 't', vowel: 'a', tone: 1, word: 'ta', meaning: '他', type: 'syllable' },
        { consonant: 't', vowel: 'i', tone: 1, word: 'ti', meaning: '提', type: 'syllable' },
        // g 声母
        { consonant: 'g', vowel: 'e', tone: 1, word: 'ge', meaning: '歌', type: 'syllable' },
        { consonant: 'g', vowel: 'e', tone: 4, word: '个', meaning: '一个', type: 'word' },
        // k 声母
        { consonant: 'k', vowel: 'e', tone: 1, word: 'ke', meaning: '科', type: 'syllable' },
        { consonant: 'k', vowel: 'ou', tone: 1, word: 'kou', meaning: '口', type: 'syllable' },
        // f 声母
        { consonant: 'f', vowel: 'a', tone: 1, word: 'fa', meaning: '发', type: 'syllable' },
        { consonant: 'f', vowel: 'u', tone: 1, word: 'fu', meaning: '福', type: 'syllable' },
        // n 声母
        { consonant: 'n', vowel: 'a', tone: 1, word: 'na', meaning: '拿', type: 'syllable' },
        { consonant: 'n', vowel: 'ei', tone: 3, word: 'nei', meaning: '哪', type: 'syllable' },
        // h 声母
        { consonant: 'h', vowel: 'a', tone: 1, word: 'ha', meaning: '哈', type: 'syllable' },
        // j 声母
        { consonant: 'j', vowel: 'i', tone: 1, word: 'ji', meaning: '鸡', type: 'syllable' },
        { consonant: 'j', vowel: 'ia', tone: 1, word: 'jia', meaning: '家', type: 'syllable' },
        // q 声母
        { consonant: 'q', vowel: 'i', tone: 1, word: 'qi', meaning: '七', type: 'syllable' },
        { consonant: 'q', vowel: 'iu', tone: 1, word: 'qiu', meaning: '球', type: 'syllable' },
        // x 声母
        { consonant: 'x', vowel: 'i', tone: 1, word: 'xi', meaning: '西', type: 'syllable' },
        { consonant: 'x', vowel: 'ia', tone: 1, word: 'xia', meaning: '下', type: 'syllable' },
        // z 声母
        { consonant: 'z', vowel: 'i', tone: 1, word: 'zi', meaning: '字', type: 'syllable' },
        { consonant: 'z', vowel: 'uo', tone: 4, word: 'zuo', meaning: '坐', type: 'syllable' },
        // c 声母
        { consonant: 'c', vowel: 'i', tone: 1, word: 'ci', meaning: '词', type: 'syllable' },
        // s 声母
        { consonant: 's', vowel: 'i', tone: 1, word: 'si', meaning: '四', type: 'syllable' },
        // zh 声母
        { consonant: 'zh', vowel: 'i', tone: 1, word: 'zhi', meaning: '知', type: 'syllable' },
        { consonant: 'zh', vowel: 'ang', tone: 1, word: 'zhang', meaning: '张', type: 'syllable' },
        // ch 声母
        { consonant: 'ch', vowel: 'i', tone: 1, word: 'chi', meaning: '吃', type: 'syllable' },
        { consonant: 'ch', vowel: 'ang', tone: 1, word: 'chang', meaning: '长', type: 'syllable' },
        // sh 声母
        { consonant: 'sh', vowel: 'i', tone: 1, word: 'shi', meaning: '师', type: 'syllable' },
        { consonant: 'sh', vowel: 'a', tone: 1, word: 'sha', meaning: '沙', type: 'syllable' },
        // r 声母
        { consonant: 'r', vowel: 'i', tone: 4, word: 'ri', meaning: '日', type: 'syllable' },
        { consonant: 'r', vowel: 'a', tone: 1, word: 'ra', meaning: '然', type: 'syllable' },
        // y 声母
        { consonant: 'y', vowel: 'i', tone: 1, word: 'yi', meaning: '一', type: 'syllable' },
        { consonant: 'y', vowel: 'a', tone: 1, word: 'ya', meaning: '鸭', type: 'syllable' },
        // w 声母
        { consonant: 'w', vowel: 'o', tone: 1, word: 'wo', meaning: '我', type: 'syllable' },
        { consonant: 'w', vowel: 'a', tone: 1, word: 'wa', meaning: '娃', type: 'syllable' },
    ]
};

// 闯关模式状态
let quizPractice = {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    isAnswered: false
};

// ==================== 拼读练习模式切换 ====================
function showPracticeModes() {
    // 隐藏三个练习页面，显示模式选择页
    document.getElementById('practice-free').style.display = 'none';
    document.getElementById('practice-guided').style.display = 'none';
    document.getElementById('practice-quiz').style.display = 'none';
    document.getElementById('practice-modes').style.display = 'block';
    // 更新顶部标题
    updatePinyinHeader('📖 拼音王国', 'home');
}

function startFreePractice() {
    document.getElementById('practice-modes').style.display = 'none';
    document.getElementById('practice-free').style.display = 'block';
    initFreePractice();
    // 更新顶部标题
    updatePinyinHeader('🎯 自由拼读', 'practice');
}

function startGuidedPractice() {
    document.getElementById('practice-modes').style.display = 'none';
    document.getElementById('practice-guided').style.display = 'flex';
    // 设置返回状态为 practice，这样点返回按钮可以回到练习模式选择
    pinyinBackState = 'practice';
    // 开始跟读动画
    guidedPractice.currentIndex = 0;
    startGuidedAnimation();
}

function startQuizPractice() {
    document.getElementById('practice-modes').style.display = 'none';
    document.getElementById('practice-quiz').style.display = 'block';
    startQuiz();
    pinyinBackState = 'practice';
}

// 当前拼音页面状态: 'home', 'practice', 'free', 'guided', 'quiz'
let pinyinBackState = 'home';

// 更新拼音页面顶部标题和返回状态
function updatePinyinHeader(title, backState) {
    const titleEl = document.getElementById('pinyin-header-title');
    if (titleEl) titleEl.textContent = title;
    pinyinBackState = backState;
}

// 处理拼音页面返回按钮
function handlePinyinBack() {
    switch (pinyinBackState) {
        case 'practice':
            // 从练习子页面返回到练习模式选择
            showPracticeModes();
            break;
        case 'home':
        default:
            // 返回主页
            showScreen('home-screen');
            break;
    }
}

// ==================== 自由拼读 ====================

function initFreePractice() {
    // 渲染声母选择器
    const consonantContainer = document.getElementById('free-consonants');
    consonantContainer.innerHTML = pinyinData.consonants.map(c =>
        `<button class="consonant-btn" onclick="selectFreeConsonant('${c.char}')">${c.char}</button>`
    ).join('');

    // 渲染韵母选择器
    const vowelContainer = document.getElementById('free-vowels');
    vowelContainer.innerHTML = pinyinData.vowels.map(v =>
        `<button class="vowel-btn" onclick="selectFreeVowel('${v.char}')">${v.char}</button>`
    ).join('');

    // 默认选择
    freePractice.consonant = null;
    freePractice.vowel = null;
    freePractice.tone = 1;
    updateFreeDisplay();
}

function selectFreeConsonant(c) {
    document.querySelectorAll('.consonant-btn').forEach(btn => btn.classList.remove('selected'));
    var _t = event ? event.target : null;
    if (_t) _t.classList.add('selected');
    freePractice.consonant = c;
    updateFreeDisplay();
}

function selectFreeVowel(v) {
    document.querySelectorAll('.vowel-btn').forEach(btn => btn.classList.remove('selected'));
    var _t = event ? event.target : null;
    if (_t) _t.classList.add('selected');
    freePractice.vowel = v;
    updateFreeDisplay();
}

function selectFreeTone(tone) {
    freePractice.tone = tone;
    // 更新声调按钮样式
    document.querySelectorAll('#free-tones .tone-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i + 1 === tone);
    });
    updateFreeDisplay();
}

function updateFreeDisplay() {
    const consonantEl = document.getElementById('free-consonant-display');
    const vowelEl = document.getElementById('free-vowel-display');
    const syllableEl = document.getElementById('free-syllable-display');

    if (freePractice.consonant && freePractice.vowel) {
        const syllable = freePractice.consonant + freePractice.vowel;
        const toneIndex = freePractice.tone - 1;
        
        consonantEl.textContent = freePractice.consonant;
        // 韵母显示带声调
        vowelEl.textContent = getToneDisplay(freePractice.vowel, freePractice.tone);
        syllableEl.textContent = getToneDisplay(syllable, freePractice.tone);
    } else {
        consonantEl.textContent = '?';
        vowelEl.textContent = '?';
        syllableEl.textContent = '?';
    }
}

function playFreeSyllable() {
    if (freePractice.consonant && freePractice.vowel) {
        const syllable = freePractice.consonant + freePractice.vowel;
        // 获取韵母的发音（声母用 audio 字段）
        const vowelData = pinyinData.vowels.find(v => v.char === freePractice.vowel);
        const vowelAudio = vowelData ? vowelData.audio : freePractice.vowel;
        
        // 依次播放：声母 → 韵母 → 完整音节
        const audioUrl1 = `https://hanyupinyin.net/i/pinyinmp3/${freePractice.consonant}.mp3`;
        const audioUrl2 = `https://fanyiapp.cdn.bcebos.com/zhdict/mp3/${vowelAudio}1.mp3`;
        const audioUrl3 = `https://fanyiapp.cdn.bcebos.com/zhdict/mp3/${syllable}${freePractice.tone}.mp3`;
        
        playAudio(audioUrl1, () => {
            playAudio(audioUrl2, () => {
                playAudio(audioUrl3);
            });
        });
    }
}

// 带回调链的音频播放
function playAudio(url, onEnded, onError) {
    const audio = new Audio(url);
    audio.onended = onEnded;
    audio.onerror = onError;
    audio.play().catch(() => {
        if (onError) onError();
    });
}

// 获取带声调的字符
function getToneChar(base, toneIndex) {
    const baseChar = base.charAt(0);
    const vowelPart = base.substring(1);
    
    const vowelTones = {
        'a': ['ā', 'á', 'ǎ', 'à'],
        'o': ['ō', 'ó', 'ǒ', 'ò'],
        'e': ['ē', 'é', 'ě', 'è'],
        'i': ['ī', 'í', 'ǐ', 'ì'],
        'u': ['ū', 'ú', 'ǔ', 'ù'],
        'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
        'iu': ['iū', 'iú', 'iǔ', 'iù'],
        'ui': ['uī', 'uí', 'uǐ', 'uì'],
        'ai': ['āi', 'ái', 'ǎi', 'ài'],
        'ei': ['ēi', 'éi', 'ěi', 'èi'],
        'ao': ['āo', 'áo', 'ǎo', 'ào'],
        'ou': ['ōu', 'óu', 'ǒu', 'òu'],
        'ie': ['iē', 'ié', 'iě', 'iè'],
        'üe': ['üē', 'üé', 'üě', 'üè'],
        'er': ['ēr', 'ér', 'ěr', 'èr'],
        'an': ['ān', 'án', 'ǎn', 'àn'],
        'en': ['ēn', 'én', 'ěn', 'èn'],
        'in': ['īn', 'ín', 'ǐn', 'ìn'],
        'un': ['ūn', 'ún', 'ǔn', 'ùn'],
        'ün': ['ǖn', 'ǘn', 'ǚn', 'ǜn'],
    };
    
    // 简化处理：直接用基础拼音声母+韵母
    return base;
}

// 播放音节音频
function playSyllableAudio(syllable, tone) {
    // 使用百度翻译音频 API
    const audioUrl = `https://fanyiapp.cdn.bcebos.com/zhdict/mp3/${syllable}${tone}.mp3`;
    playAudio(audioUrl);
}

// 开始自由拼读
function startFreePractice() {
    document.getElementById('practice-modes').style.display = 'none';
    document.getElementById('practice-free').style.display = 'block';
    initFreePractice();
}

// ==================== 跟读练习 ====================

// 开始跟读动画
async function startGuidedAnimation() {
    document.getElementById('guided-animation').style.display = 'block';
    
    // 重置动画状态
    resetGuidedAnimation();
    
    const example = guidedPractice.examples[guidedPractice.currentIndex];
    const tone = guidedPractice.selectedTone;
    
    // 渲染示例按钮（按声母分组显示，去重）
    const examplesContainer = document.getElementById('guided-examples');
    // 去重并过滤掉整体认读音节
    const seen = new Set();
    const filteredExamples = [];
    guidedPractice.examples.forEach((ex, i) => {
        const key = ex.consonant + ex.vowel;
        if (!seen.has(key) && ex.type !== 'whole') {
            seen.add(key);
            filteredExamples.push({ ex, i });
        }
    });
    
    // 按声母顺序排列
    const consonantOrder = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
    
    // 按声母分组
    const groupedExamples = {};
    filteredExamples.forEach(({ ex, i }) => {
        if (!groupedExamples[ex.consonant]) {
            groupedExamples[ex.consonant] = [];
        }
        groupedExamples[ex.consonant].push({ ex, i });
    });
    
    let html = '';
    const sortedConsonants = consonantOrder.filter(c => groupedExamples[c]);
    
    for (const consonant of sortedConsonants) {
        const items = groupedExamples[consonant];
        html += `<div class="example-group"><span class="group-label">${consonant}:</span>`;
        items.forEach(({ ex, i }) => {
            const syllable = ex.consonant + ex.vowel;
            // 每个声调单独显示，点击播放对应声调 - 使用全局索引 i
            html += `<button class="guided-example-btn" onclick="playExampleWithTone(${i}, 1)">${getToneDisplay(syllable, 1)}</button>`;
            html += `<button class="guided-example-btn" onclick="playExampleWithTone(${i}, 2)">${getToneDisplay(syllable, 2)}</button>`;
            html += `<button class="guided-example-btn" onclick="playExampleWithTone(${i}, 3)">${getToneDisplay(syllable, 3)}</button>`;
            html += `<button class="guided-example-btn" onclick="playExampleWithTone(${i}, 4)">${getToneDisplay(syllable, 4)}</button>`;
        });
        html += '</div>';
    }
    examplesContainer.innerHTML = html;
    
    // 执行三步动画（使用选定的声调）- 只在首次加载时自动播放
    if (guidedPractice.currentIndex === 0) {
        await animateGuidedStep(1, example.consonant, example.vowel, 'consonant');
        await sleep(600);
        playGuidedAudio(1);
        await sleep(800);
        
        await animateGuidedStep(2, example.consonant, example.vowel, 'vowel');
        await sleep(600);
        playGuidedAudio(2);
        await sleep(800);
        
        await animateGuidedStep(3, example.consonant, example.vowel, 'result');
    }
}

// 选择声调
function selectGuidedTone(tone) {
    guidedPractice.selectedTone = tone;
    document.querySelectorAll('#practice-guided .tone-btn').forEach(btn => btn.classList.remove('active'));
    var _t = event ? event.target : null;
    if (_t) _t.classList.add('active');
    startGuidedAnimation();
}

function resetGuidedAnimation() {
    ['step-1', 'step-2', 'step-3'].forEach(id => {
        document.getElementById(id).classList.remove('show');
    });
    ['arrow-1', 'arrow-2'].forEach(id => {
        document.getElementById(id).classList.remove('show');
    });
    document.getElementById('step-1').querySelector('.step-char').textContent = '';
    document.getElementById('step-2').querySelector('.step-char').textContent = '';
    document.getElementById('step-3').querySelector('.step-char').textContent = '';
}

// 简化带声调字符获取（用于显示）
function getToneDisplay(syllable, tone) {
    const toneChars = {
        'a': ['a', 'á', 'ǎ', 'à'],
        'o': ['o', 'ó', 'ǒ', 'ò'],
        'e': ['e', 'é', 'ě', 'è'],
        'i': ['i', 'í', 'ǐ', 'ì'],
        'u': ['u', 'ú', 'ǔ', 'ù'],
        'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']
    };
    
    // 找出韵母位置并替换
    for (const [vowel, tones] of Object.entries(toneChars)) {
        if (syllable.includes(vowel)) {
            const idx = tones[tone - 1] || tones[0];
            return syllable.replace(vowel, idx);
        }
    }
    return syllable;
}

function getAllToneDisplays(syllable) {
    const toneChars = {
        'a': ['a', 'á', 'ǎ', 'à'],
        'o': ['o', 'ó', 'ǒ', 'ò'],
        'e': ['e', 'é', 'ě', 'è'],
        'i': ['i', 'í', 'ǐ', 'ì'],
        'u': ['u', 'ú', 'ǔ', 'ù'],
        'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']
    };
    
    let result = [];
    for (let t = 1; t <= 4; t++) {
        for (const [vowel, tones] of Object.entries(toneChars)) {
            if (syllable.includes(vowel)) {
                result.push(tones[t - 1] || tones[0]);
                break;
            }
        }
    }
    return result.join(' ');
}

async function animateGuidedStep(step, consonant, vowel, type) {
    const tone = guidedPractice.selectedTone;
    const stepEl = document.getElementById(`step-${step}`);
    const charEl = stepEl.querySelector('.step-char');
    
    if (type === 'consonant') {
        charEl.textContent = consonant;
    } else if (type === 'vowel') {
        charEl.textContent = vowel;
    } else {
        charEl.textContent = getToneDisplay(consonant + vowel, tone);
    }
    
    stepEl.classList.add('show');
    
    if (step < 3) {
        document.getElementById(`arrow-${step}`).classList.add('show');
    }
    
    // 不在这里播放音频，由调用者控制
}

function playGuidedAudio(type) {
    const example = guidedPractice.examples[guidedPractice.currentIndex];
    const tone = guidedPractice.selectedTone;
    if (type === 1) {
        // 声母（不用声调）
        playConsonantAudio(example.consonant);
    } else if (type === 2) {
        // 韵母（带声调）
        playVowelAudio(example.vowel, tone);
    } else {
        // 完整音节（带声调）
        playSyllableAudio(example.consonant + example.vowel, tone);
    }
}

function playConsonantAudio(c) {
    // 使用 hanyupinyin.net 音频 API
    const audioUrl = `https://hanyupinyin.net/i/pinyinmp3/${c}.mp3`;
    playAudio(audioUrl);
}

function playVowelAudio(v, tone) {
    // 获取韵母对应的发音
    const vowelData = pinyinData.vowels.find(item => item.char === v);
    const audioChar = vowelData ? vowelData.audio : v;
    const audioUrl = `https://fanyiapp.cdn.bcebos.com/zhdict/mp3/${audioChar}${tone}.mp3`;
    playAudio(audioUrl);
}

function goToGuidedExample(index) {
    guidedPractice.currentIndex = index;
    resetGuidedAnimation();
    playGuidedAnimationOnce();
}

// 播放指定声调的动画（点击按钮时调用）
async function playExampleWithTone(index, tone) {
    guidedPractice.currentIndex = index;
    guidedPractice.selectedTone = tone;
    
    // 重置并播放动画
    resetGuidedAnimation();
    await playGuidedAnimationOnce();
}

// 只播放动画和音频，不重新渲染按钮
async function playGuidedAnimationOnce() {
    const example = guidedPractice.examples[guidedPractice.currentIndex];
    const tone = guidedPractice.selectedTone;
    const consonant = example.consonant;
    const vowel = example.vowel;
    const syllable = consonant + vowel;
    
    // 第一步：显示声母
    await animateGuidedStep(1, consonant, vowel, 'consonant');
    await sleep(600);
    playConsonantAudio(consonant);
    await sleep(800);
    
    // 第二步：显示韵母
    await animateGuidedStep(2, consonant, vowel, 'vowel');
    await sleep(600);
    playVowelAudio(vowel, tone);
    await sleep(800);
    
    // 第三步：显示结果
    await animateGuidedStep(3, consonant, vowel, 'result');
    playSyllableAudio(syllable, tone);
}

// 修复跟读音频重复播放问题
function playGuidedAudioFixed(type) {
    const example = guidedPractice.examples[guidedPractice.currentIndex];
    const tone = guidedPractice.selectedTone;
    const consonant = example.consonant;
    const vowel = example.vowel;
    const syllable = consonant + vowel;
    
    if (type === 1) {
        playConsonantAudio(consonant);
    } else if (type === 2) {
        playVowelAudio(vowel, tone);
    } else if (type === 3) {
        playSyllableAudio(syllable, tone);
    }
}

function nextGuidedExample() {
    guidedPractice.currentIndex = (guidedPractice.currentIndex + 1) % guidedPractice.examples.length;
    resetGuidedAnimation();
    playGuidedAnimationOnce();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 闯关模式 ====================
function startQuiz() {
    // 生成题目
    quizPractice.questions = generateQuizQuestions();
    quizPractice.currentIndex = 0;
    quizPractice.score = 0;
    quizPractice.streak = 0;
    quizPractice.maxStreak = 0;
    quizPractice.isAnswered = false;

    document.getElementById('quiz-complete').style.display = 'none';
    document.getElementById('quiz-game').style.display = 'block';

    renderQuizQuestion();
}

function generateQuizQuestions() {
    const questions = [];
    const shuffledCombos = [...pinyinCombos].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(10, shuffledCombos.length); i++) {
        const combo = shuffledCombos[i];
        const isConsonant = Math.random() > 0.5;
        
        let correctAnswer, options, questionType;
        if (isConsonant) {
            correctAnswer = combo.consonant;
            questionType = '请选择声母：';
            // 生成声母干扰项 - 从对象数组中提取字符
            const otherConsonants = pinyinData.consonants.filter(c => c.char !== combo.consonant).map(c => c.char);
            const wrongOptions = otherConsonants.sort(() => Math.random() - 0.5).slice(0, 3);
            options = shuffleArray([correctAnswer, ...wrongOptions]);
        } else {
            correctAnswer = combo.vowel;
            questionType = '请选择韵母：';
            // 生成韵母干扰项 - 从对象数组中提取字符
            const otherVowels = pinyinData.vowels.filter(v => v.char !== combo.vowel).map(v => v.char);
            const wrongOptions = otherVowels.sort(() => Math.random() - 0.5).slice(0, 3);
            options = shuffleArray([correctAnswer, ...wrongOptions]);
        }
        
        questions.push({
            combo: combo,
            isConsonant: isConsonant,
            correctAnswer: correctAnswer,
            questionType: questionType,
            options: options
        });
    }
    
    return questions;
}

function renderQuizQuestion() {
    const question = quizPractice.questions[quizPractice.currentIndex];
    if (!question) {
        showQuizComplete();
        return;
    }

    document.getElementById('quiz-progress').textContent = `第 ${quizPractice.currentIndex + 1}/10 题`;
    document.getElementById('quiz-score').textContent = quizPractice.score;
    document.getElementById('quiz-streak').textContent = quizPractice.streak;
    
    // 显示完整音节和题目类型
    const combo = question.combo;
    const comboText = `<span style="font-size:1.5em;color:#ff6b35;">${combo.consonant}${combo.vowel}</span>`;
    document.getElementById('quiz-question-type').innerHTML = 
        question.isConsonant ? 
        `${comboText} - 请选择声母：` : 
        `${comboText} - 请选择韵母：`;

    // 渲染选项
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = question.options.map(opt =>
        `<button class="quiz-option" onclick="selectQuizOption(this, '${opt}')">${opt}</button>`
    ).join('');

    // 隐藏反馈
    document.getElementById('quiz-feedback').style.display = 'none';

    // 播放音频 - 播放完整音节
    setTimeout(() => {
        playSyllableAudio(combo.consonant + combo.vowel, 1);
    }, 300);
}

async function selectQuizOption(element, selected) {
    if (quizPractice.isAnswered) return;
    quizPractice.isAnswered = true;

    const question = quizPractice.questions[quizPractice.currentIndex];
    const isCorrect = selected === question.correctAnswer;

    // 禁用所有选项
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === question.correctAnswer) {
            btn.classList.add('correct');
        } else if (btn === element && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    const feedback = document.getElementById('quiz-feedback');

    if (isCorrect) {
        quizPractice.score++;
        quizPractice.streak++;
        quizPractice.maxStreak = Math.max(quizPractice.maxStreak, quizPractice.streak);
        
        document.getElementById('quiz-score').textContent = quizPractice.score;
        document.getElementById('quiz-streak').textContent = quizPractice.streak;
        
        feedback.textContent = quizPractice.streak >= 3 ? `🎉 ${quizPractice.streak}连击！太棒了！` : '🎉 答对了！';
        feedback.className = 'quiz-feedback correct';
        feedback.style.display = 'block';
        
        showConfetti();
    } else {
        quizPractice.streak = 0;
        document.getElementById('quiz-streak').textContent = 0;
        
        feedback.textContent = `正确答案是：${question.correctAnswer}`;
        feedback.className = 'quiz-feedback wrong';
        feedback.style.display = 'block';
    }

    // 播放正确音节 - 连续播放声母+韵母+音节
    const combo = question.combo;
    playSyllableAudio(combo.consonant, 1);

    // 下一题
    quizPractice.currentIndex++;
    quizPractice.isAnswered = false;

    setTimeout(() => {
        if (quizPractice.currentIndex < 10) {
            renderQuizQuestion();
        } else {
            showQuizComplete();
        }
    }, 1500);
}

function replayQuizAudio() {
    const question = quizPractice.questions[quizPractice.currentIndex];
    if (question && question.combo) {
        const combo = question.combo;
        const tone = 1;
        playSyllableAudio(combo.consonant, tone);
    }
}

function showQuizComplete() {
    document.getElementById('quiz-game').style.display = 'none';
    document.getElementById('quiz-complete').style.display = 'block';

    document.getElementById('quiz-final-score').textContent = quizPractice.score;
    document.getElementById('quiz-max-streak').textContent = quizPractice.maxStreak;

    let title, msg;
    if (quizPractice.score >= 9) {
        title = '🌟 完美通关！';
        msg = '拼读小达人是也！';
        showConfetti();
        showConfetti();
    } else if (quizPractice.score >= 7) {
        title = '👍 很棒！';
        msg = '继续加油，拼读越来越熟练！';
        showConfetti();
    } else if (quizPractice.score >= 5) {
        title = '💪 还不错！';
        msg = '再来一次，你一定能做得更好！';
    } else {
        title = '📚 加油！';
        msg = '多练习声母和韵母，再来挑战！';
    }

    document.getElementById('quiz-complete-title').textContent = title;
    document.getElementById('quiz-complete-msg').textContent = msg;

    // 计算并保存积分奖励
    const pointsEarned = pointsSystem.calculateTaskPoints('pinyin', {
        stars: Math.min(quizPractice.score, 5),
        accuracy: (quizPractice.score / quizPractice.questions.length) * 100,
        timeSpent: 60 // 简化处理
    });

    if (pointsEarned > 0) {
        userData.points.total += pointsEarned;
        userData.points.today += pointsEarned;
        userData.stats.totalStars += quizPractice.score; // 保留原有星星统计

        // 更新宠物快乐度
        updatePetHappiness(pointsEarned);

        saveUserData();
        updateStarsDisplay();
        showPointsReward(pointsEarned, '拼音练习');
    }
}

// 随机打乱数组
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 彩花动画
function showConfetti() {
    const colors = ['#FF6B6B', '#FFD93D', '#7AC74F', '#5B9BD5', '#FF9E4F', '#FF7BAC'];
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = Math.random() * 100 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (1 + Math.random()) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 2000);
        }, i * 50);
    }
}

// ==================== 汉字模块（升级版）====================

function initChineseModule() {
    // 初始化时渲染
}

function filterChinese(category) {
    chineseFilter.category = category;
    chineseFilter.page = 1;
    
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    var _t = event ? event.target : null;
    if (_t) _t.classList.add('active');
    
    document.getElementById('current-category').textContent = category === 'all' ? '全部' : category;
    
    renderChineseGrid();
}

function searchChinese(keyword) {
    chineseFilter.search = keyword.trim();
    chineseFilter.page = 1;
    renderChineseGrid();
}

// 当前展开的汉字索引
let expandedChineseIndex = -1;

// 每行列数（与CSS grid-template-columns保持一致）
const CHINESE_COLS = 5;

function renderChineseGrid() {
    const container = document.getElementById('chinese-grid');
    if (!container) return;

    // 去重处理：只保留每个汉字的第一次出现
    const seenChars = new Set();
    let data = chineseData.filter(item => {
        if (seenChars.has(item.char)) {
            return false;
        }
        seenChars.add(item.char);
        return true;
    });

    // 分类过滤
    if (chineseFilter.category !== 'all') {
        data = data.filter(item => item.category === chineseFilter.category);
    }

    // 搜索过滤
    if (chineseFilter.search) {
        data = data.filter(item => 
            item.char.includes(chineseFilter.search) || 
            item.pinyin.includes(chineseFilter.search.toLowerCase())
        );
    }

    // 分页
    const end = chineseFilter.page * chineseFilter.pageSize;
    const displayData = data.slice(0, end);

    container.innerHTML = '';
    expandedChineseIndex = -1;

    // 按行分组渲染，每行CHINESE_COLS个字
    for (let rowStart = 0; rowStart < displayData.length; rowStart += CHINESE_COLS) {
        const rowItems = displayData.slice(rowStart, rowStart + CHINESE_COLS);

        // 行容器
        const rowDiv = document.createElement('div');
        rowDiv.className = 'chinese-row';
        rowDiv.dataset.row = Math.floor(rowStart / CHINESE_COLS);

        rowItems.forEach((item, colIndex) => {
            const globalIndex = rowStart + colIndex;
            const div = document.createElement('div');
            div.className = 'chinese-item';
            div.id = `chinese-item-${globalIndex}`;
            div.dataset.index = globalIndex;

            if (userData.progress.chinese.learned.includes(item.char)) {
                div.classList.add('learned');
            }

            const displayChar = item.char.charAt(0);
            div.innerHTML = `
                <span class="chinese-char">${displayChar}</span>
                <span class="chinese-pinyin">${item.pinyin.split(' ')[0]}</span>
                ${userData.progress.chinese.learned.includes(item.char) ? '<span class="learned-mark">✓</span>' : ''}
            `;
            div.onclick = () => toggleChineseExpand(item, globalIndex, rowDiv);
            rowDiv.appendChild(div);
        });

        // 填充空位（保持行列对齐）
        for (let fill = rowItems.length; fill < CHINESE_COLS; fill++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'chinese-item chinese-placeholder';
            rowDiv.appendChild(placeholder);
        }

        container.appendChild(rowDiv);

        // 展开区域（紧跟在行后面，初始隐藏）
        const expandDiv = document.createElement('div');
        expandDiv.className = 'chinese-row-expand';
        expandDiv.id = `chinese-row-expand-${Math.floor(rowStart / CHINESE_COLS)}`;
        expandDiv.style.display = 'none';
        container.appendChild(expandDiv);
    }

    // 更新统计
    const learnedEl = document.getElementById('learned-count');
    if (learnedEl) learnedEl.textContent = userData.progress.chinese.learned.length;

    // 显示/隐藏加载更多
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = end >= data.length ? 'none' : 'inline-block';
    }
    
    // 更新不认识汉字数量
    updateUnknownCount();
}

// 展开/收起汉字详情（行内展开，不影响其他行布局）
function toggleChineseExpand(item, index, rowDiv) {
    const rowIndex = Math.floor(index / CHINESE_COLS);
    const expandDiv = document.getElementById(`chinese-row-expand-${rowIndex}`);
    const itemDiv = document.getElementById(`chinese-item-${index}`);

    // 先关闭上一个展开的
    if (expandedChineseIndex >= 0 && expandedChineseIndex !== index) {
        const prevRow = Math.floor(expandedChineseIndex / CHINESE_COLS);
        const prevExpand = document.getElementById(`chinese-row-expand-${prevRow}`);
        const prevItem = document.getElementById(`chinese-item-${expandedChineseIndex}`);
        if (prevExpand) {
            prevExpand.style.display = 'none';
            prevExpand.innerHTML = '';
        }
        if (prevItem) prevItem.classList.remove('expanded');
    }

    // 如果点击的就是已展开的同一个字，则收起
    if (expandedChineseIndex === index) {
        expandDiv.style.display = 'none';
        expandDiv.innerHTML = '';
        itemDiv.classList.remove('expanded');
        expandedChineseIndex = -1;
        return;
    }

    // 展开新的
    itemDiv.classList.add('expanded');
    expandedChineseIndex = index;
    
    // 记录查看过的汉字
    if (!userData.progress.chinese.viewedChars) {
        userData.progress.chinese.viewedChars = [];
    }
    if (!userData.progress.chinese.viewedChars.includes(item.char)) {
        userData.progress.chinese.viewedChars.push(item.char);
        saveUserData();
        updateUnknownCount();
    }

    expandDiv.innerHTML = `
        <div class="expand-content">
            <div class="expand-char-header">
                <span class="expand-big-char">${item.char}</span>
                <span class="expand-pinyin-big">${item.pinyin}</span>
                <span class="expand-category">${item.category}</span>
            </div>
            <div class="expand-row"><span class="label">📝 组词：</span>${item.words ? item.words.map(w=>`<span class="word-tag">${w}</span>`).join('') : '暂无'}</div>
            <div class="expand-row"><span class="label">⭐ 成语：</span>${item.idioms ? item.idioms.map(id=>`<span class="idiom-tag">${id}</span>`).join('') : '暂无'}</div>
            <div class="expand-row poem-row"><span class="label">📚 诗词：</span><span class="poem-text">${item.poem || '暂无'}</span></div>
            <button class="btn-unlearn" onclick="event.stopPropagation(); markChineseUnlearnedInline('${item.char}', ${index})">✗ 标记为不会</button>
        </div>
    `;
    expandDiv.style.display = 'block';

    // 自动标记为学会
    if (!userData.progress.chinese.learned.includes(item.char)) {
        userData.progress.chinese.learned.push(item.char);
        addStars(2);
        completeDailyTask('chinese');
        saveUserData();

        itemDiv.classList.add('learned');
        itemDiv.innerHTML = `
            <span class="chinese-char">${item.char.charAt(0)}</span>
            <span class="chinese-pinyin">${item.pinyin.split(' ')[0]}</span>
            <span class="learned-mark">✓</span>
        `;
        itemDiv.onclick = () => toggleChineseExpand(item, index, rowDiv);

        const learnedEl = document.getElementById('learned-count');
        if (learnedEl) learnedEl.textContent = userData.progress.chinese.learned.length;

        if (userData.progress.chinese.learned.length >= 100) unlockBadge('chinese_100');
        if (userData.progress.chinese.learned.length >= 500) unlockBadge('chinese_500');
    }
}

// 标记为不会（内联版）
function markChineseUnlearnedInline(char, index) {
    // 从学会列表移除
    userData.progress.chinese.learned = userData.progress.chinese.learned.filter(c => c !== char);
    saveUserData();

    const rowIndex = Math.floor(index / CHINESE_COLS);
    const itemDiv = document.getElementById(`chinese-item-${index}`);
    const expandDiv = document.getElementById(`chinese-row-expand-${rowIndex}`);
    const item = chineseData.find(d => d.char === char);

    if (itemDiv) {
        itemDiv.classList.remove('learned');
        if (item) {
            itemDiv.innerHTML = `
                <span class="chinese-char">${item.char.charAt(0)}</span>
                <span class="chinese-pinyin">${item.pinyin.split(' ')[0]}</span>
            `;
            itemDiv.onclick = () => toggleChineseExpand(item, index, itemDiv.closest('.chinese-row'));
        }
    }

    // 收起展开区域
    if (expandDiv) {
        expandDiv.style.display = 'none';
        expandDiv.innerHTML = '';
    }
    expandedChineseIndex = -1;

    // 更新统计
    const learnedEl = document.getElementById('learned-count');
    if (learnedEl) learnedEl.textContent = userData.progress.chinese.learned.length;

    showToast('已标记为不会');
}

function loadMoreChinese() {
    chineseFilter.page++;
    renderChineseGrid();
}

// 显示不认识汉字
function showUnknownChinese() {
    // 获取所有未学习的汉字（查看过的但标记为不会的）
    const viewedChars = userData.progress.chinese.viewedChars || [];
    const unknownChars = viewedChars.filter(c => !userData.progress.chinese.learned.includes(c));
    
    // 去重处理后的数据中找到这些字
    const seenChars = new Set();
    const uniqueData = chineseData.filter(item => {
        if (seenChars.has(item.char)) return false;
        seenChars.add(item.char);
        return true;
    });
    
    const unknownData = uniqueData.filter(item => unknownChars.includes(item.char));
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'unknown-modal';
    modal.id = 'unknown-modal';
    modal.onclick = (e) => {
        if (e.target === modal) closeUnknownModal();
    };
    
    modal.innerHTML = `
        <div class="unknown-modal-content">
            <div class="unknown-modal-header">
                <h3>📋 不认识的汉字</h3>
                <div class="count">共 ${unknownChars.length} 个汉字不认识</div>
            </div>
            <div class="unknown-modal-body">
                ${unknownChars.length === 0 ? 
                    '<p style="text-align:center;color:#666;padding:20px;">太棒了！目前没有不认识的汉字</p>' :
                    unknownData.map(item => `
                        <div class="unknown-chinese-item">
                            <span class="char">${item.char}</span>
                            <span class="pinyin">${item.pinyin.split(' ')[0]}</span>
                        </div>
                    `).join('')
                }
            </div>
            <div class="unknown-modal-footer">
                <button class="btn" onclick="closeUnknownModal()">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 关闭不认识汉字弹窗
function closeUnknownModal() {
    const modal = document.getElementById('unknown-modal');
    if (modal) modal.remove();
}

// 更新不认识汉字统计
function updateUnknownCount() {
    const viewedChars = userData.progress.chinese.viewedChars || [];
    const unknownChars = viewedChars.filter(c => !userData.progress.chinese.learned.includes(c));
    
    const countEl = document.getElementById('unknown-count');
    const btnCountEl = document.getElementById('unknown-btn-count');
    if (countEl) countEl.textContent = unknownChars.length;
    if (btnCountEl) btnCountEl.textContent = unknownChars.length;
}

// 简单提示
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:white;padding:15px 25px;border-radius:10px;z-index:10000;font-size:16px;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
}

// ==================== 英语模块 ====================

// ==================== 英文单词学习模块 ====================

// 英文单词数据
const englishWordsData = {
    animals: [
        { word: 'cat', chinese: '猫', phonetic: '/kæt/', icon: '🐱', sentence: 'I have a cat.' },
        { word: 'dog', chinese: '狗', phonetic: '/dɒɡ/', icon: '🐕', sentence: 'The dog is running.' },
        { word: 'bird', chinese: '鸟', phonetic: '/bɜːd/', icon: '🐦', sentence: 'A bird can fly.' },
        { word: 'fish', chinese: '鱼', phonetic: '/fɪʃ/', icon: '🐟', sentence: 'Fish swim in water.' },
        { word: 'pig', chinese: '猪', phonetic: '/pɪɡ/', icon: '🐷', sentence: 'The pig is pink.' },
        { word: 'cow', chinese: '牛', phonetic: '/kaʊ/', icon: '🐄', sentence: 'The cow gives milk.' },
        { word: 'duck', chinese: '鸭子', phonetic: '/dʌk/', icon: '🦆', sentence: 'The duck quacks.' },
        { word: 'rabbit', chinese: '兔子', phonetic: '/ˈræbɪt/', icon: '🐰', sentence: 'The rabbit jumps.' },
        { word: 'horse', chinese: '马', phonetic: '/hɔːs/', icon: '🐴', sentence: 'I like horses.' },
        { word: 'sheep', chinese: '羊', phonetic: '/ʃiːp/', icon: '🐑', sentence: 'The sheep is white.' }
    ],
    fruits: [
        { word: 'apple', chinese: '苹果', phonetic: '/ˈæpl/', icon: '🍎', sentence: 'I eat an apple.' },
        { word: 'banana', chinese: '香蕉', phonetic: '/bəˈnɑːnə/', icon: '🍌', sentence: 'Bananas are yellow.' },
        { word: 'orange', chinese: '橙子', phonetic: '/ˈɒrɪndʒ/', icon: '🍊', sentence: 'I like orange juice.' },
        { word: 'grape', chinese: '葡萄', phonetic: '/ɡreɪp/', icon: '🍇', sentence: 'Grapes are sweet.' },
        { word: 'pear', chinese: '梨', phonetic: '/peə/', icon: '🍐', sentence: 'The pear is green.' },
        { word: 'peach', chinese: '桃子', phonetic: '/piːtʃ/', icon: '🍑', sentence: 'Peaches are pink.' },
        { word: 'mango', chinese: '芒果', phonetic: '/ˈmæŋɡəʊ/', icon: '🥭', sentence: 'Mango is tasty.' },
        { word: 'watermelon', chinese: '西瓜', phonetic: '/ˈwɔːtəˌmelən/', icon: '🍉', sentence: 'Watermelon is big.' }
    ],
    colors: [
        { word: 'red', chinese: '红色', phonetic: '/red/', icon: '🔴', sentence: 'The apple is red.' },
        { word: 'blue', chinese: '蓝色', phonetic: '/bluː/', icon: '🔵', sentence: 'The sky is blue.' },
        { word: 'green', chinese: '绿色', phonetic: '/ɡriːn/', icon: '🟢', sentence: 'Grass is green.' },
        { word: 'yellow', chinese: '黄色', phonetic: '/ˈjeləʊ/', icon: '🟡', sentence: 'The sun is yellow.' },
        { word: 'pink', chinese: '粉色', phonetic: '/pɪŋk/', icon: '🩷', sentence: 'Her dress is pink.' },
        { word: 'white', chinese: '白色', phonetic: '/waɪt/', icon: '⚪', sentence: 'Snow is white.' },
        { word: 'black', chinese: '黑色', phonetic: '/blæk/', icon: '⚫', sentence: 'My hair is black.' },
        { word: 'orange', chinese: '橙色', phonetic: '/ˈɒrɪndʒ/', icon: '🟠', sentence: 'Orange is my favorite color.' }
    ],
    family: [
        { word: 'mom', chinese: '妈妈', phonetic: '/mɒm/', icon: '👩', sentence: 'I love my mom.' },
        { word: 'dad', chinese: '爸爸', phonetic: '/dæd/', icon: '👨', sentence: 'Dad is tall.' },
        { word: 'sister', chinese: '姐妹', phonetic: '/ˈsɪstə/', icon: '👧', sentence: 'My sister is nice.' },
        { word: 'brother', chinese: '兄弟', phonetic: '/ˈbrʌðə/', icon: '👦', sentence: 'My brother is young.' },
        { word: 'grandma', chinese: '奶奶', phonetic: '/ˈɡrænmɑː/', icon: '👵', sentence: 'Grandma is kind.' },
        { word: 'grandpa', chinese: '爷爷', phonetic: '/ˈɡrænpɑː/', icon: '👴', sentence: 'Grandpa tells stories.' },
        { word: 'baby', chinese: '宝宝', phonetic: '/ˈbeɪbi/', icon: '👶', sentence: 'The baby is cute.' },
        { word: 'family', chinese: '家庭', phonetic: '/ˈfæmɪli/', icon: '👨‍👩‍👧‍👦', sentence: 'I love my family.' }
    ],
    body: [
        { word: 'head', chinese: '头', phonetic: '/hed/', icon: '🧠', sentence: 'I have one head.' },
        { word: 'eye', chinese: '眼睛', phonetic: '/aɪ/', icon: '👁️', sentence: 'I have two eyes.' },
        { word: 'ear', chinese: '耳朵', phonetic: '/ɪə/', icon: '👂', sentence: 'I hear with my ears.' },
        { word: 'nose', chinese: '鼻子', phonetic: '/nəʊz/', icon: '👃', sentence: 'My nose is small.' },
        { word: 'mouth', chinese: '嘴巴', phonetic: '/maʊθ/', icon: '👄', sentence: 'I eat with my mouth.' },
        { word: 'hand', chinese: '手', phonetic: '/hænd/', icon: '✋', sentence: 'I have two hands.' },
        { word: 'foot', chinese: '脚', phonetic: '/fʊt/', icon: '🦶', sentence: 'I have two feet.' },
        { word: 'leg', chinese: '腿', phonetic: '/leɡ/', icon: '🦵', sentence: 'My legs are strong.' }
    ],
    numbers: [
        { word: 'one', chinese: '一', phonetic: '/wʌn/', icon: '1️⃣', sentence: 'I have one book.' },
        { word: 'two', chinese: '二', phonetic: '/tuː/', icon: '2️⃣', sentence: 'I have two hands.' },
        { word: 'three', chinese: '三', phonetic: '/θriː/', icon: '3️⃣', sentence: 'I see three birds.' },
        { word: 'four', chinese: '四', phonetic: '/fɔː/', icon: '4️⃣', sentence: 'A dog has four legs.' },
        { word: 'five', chinese: '五', phonetic: '/faɪv/', icon: '5️⃣', sentence: 'I have five fingers.' },
        { word: 'six', chinese: '六', phonetic: '/sɪks/', icon: '6️⃣', sentence: 'There are six apples.' },
        { word: 'seven', chinese: '七', phonetic: '/ˈsevn/', icon: '7️⃣', sentence: 'Seven days in a week.' },
        { word: 'eight', chinese: '八', phonetic: '/eɪt/', icon: '8️⃣', sentence: 'An octopus has eight legs.' },
        { word: 'nine', chinese: '九', phonetic: '/naɪn/', icon: '9️⃣', sentence: 'I am nine years old.' },
        { word: 'ten', chinese: '十', phonetic: '/ten/', icon: '🔟', sentence: 'I have ten toes.' }
    ],
    school: [
        { word: 'book', chinese: '书', phonetic: '/bʊk/', icon: '📚', sentence: 'I read a book.' },
        { word: 'pen', chinese: '钢笔', phonetic: '/pen/', icon: '🖊️', sentence: 'This is my pen.' },
        { word: 'pencil', chinese: '铅笔', phonetic: '/ˈpensl/', icon: '✏️', sentence: 'I write with a pencil.' },
        { word: 'ruler', chinese: '尺子', phonetic: '/ˈruːlə/', icon: '📏', sentence: 'The ruler is long.' },
        { word: 'eraser', chinese: '橡皮', phonetic: '/ɪˈreɪzə/', icon: '🧽', sentence: 'I have an eraser.' },
        { word: 'bag', chinese: '书包', phonetic: '/bæɡ/', icon: '🎒', sentence: 'My bag is blue.' },
        { word: 'desk', chinese: '书桌', phonetic: '/desk/', icon: '🪑', sentence: 'I sit at my desk.' },
        { word: 'chair', chinese: '椅子', phonetic: '/tʃeə/', icon: '🪑', sentence: 'The chair is comfortable.' },
        { word: 'teacher', chinese: '老师', phonetic: '/ˈtiːtʃə/', icon: '👨‍🏫', sentence: 'The teacher is nice.' },
        { word: 'student', chinese: '学生', phonetic: '/ˈstjuːdnt/', icon: '👨‍🎓', sentence: 'I am a student.' },
        { word: 'school', chinese: '学校', phonetic: '/skuːl/', icon: '🏫', sentence: 'I go to school.' },
        { word: 'classroom', chinese: '教室', phonetic: '/ˈklɑːsruːm/', icon: '🏫', sentence: 'We are in the classroom.' }
    ],
    food: [
        { word: 'rice', chinese: '米饭', phonetic: '/raɪs/', icon: '🍚', sentence: 'I eat rice every day.' },
        { word: 'bread', chinese: '面包', phonetic: '/bred/', icon: '🍞', sentence: 'I like bread.' },
        { word: 'egg', chinese: '鸡蛋', phonetic: '/eɡ/', icon: '🥚', sentence: 'I have an egg for breakfast.' },
        { word: 'milk', chinese: '牛奶', phonetic: '/mɪlk/', icon: '🥛', sentence: 'Milk is white.' },
        { word: 'water', chinese: '水', phonetic: '/ˈwɔːtə/', icon: '💧', sentence: 'I drink water.' },
        { word: 'juice', chinese: '果汁', phonetic: '/dʒuːs/', icon: '🧃', sentence: 'Orange juice is sweet.' },
        { word: 'cake', chinese: '蛋糕', phonetic: '/keɪk/', icon: '🎂', sentence: 'I like birthday cake.' },
        { word: 'ice cream', chinese: '冰淇淋', phonetic: '/aɪs kriːm/', icon: '🍦', sentence: 'Ice cream is cold.' },
        { word: 'noodles', chinese: '面条', phonetic: '/ˈnuːdlz/', icon: '🍜', sentence: 'I love noodles.' },
        { word: 'chicken', chinese: '鸡肉', phonetic: '/ˈtʃɪkɪn/', icon: '🍗', sentence: 'Chicken is yummy.' },
        { word: 'vegetable', chinese: '蔬菜', phonetic: '/ˈvedʒtəbl/', icon: '🥬', sentence: 'Vegetables are healthy.' },
        { word: 'candy', chinese: '糖果', phonetic: '/ˈkændi/', icon: '🍬', sentence: 'Candy is sweet.' }
    ],
    clothes: [
        { word: 'shirt', chinese: '衬衫', phonetic: '/ʃɜːt/', icon: '👕', sentence: 'My shirt is blue.' },
        { word: 'dress', chinese: '连衣裙', phonetic: '/dres/', icon: '👗', sentence: 'She wears a dress.' },
        { word: 'coat', chinese: '外套', phonetic: '/kəʊt/', icon: '🧥', sentence: 'It is cold, wear a coat.' },
        { word: 'hat', chinese: '帽子', phonetic: '/hæt/', icon: '🎩', sentence: 'I wear a hat.' },
        { word: 'shoe', chinese: '鞋子', phonetic: '/ʃuː/', icon: '👟', sentence: 'My shoes are new.' },
        { word: 'sock', chinese: '袜子', phonetic: '/sɒk/', icon: '🧦', sentence: 'I have white socks.' },
        { word: 'pants', chinese: '裤子', phonetic: '/pænts/', icon: '👖', sentence: 'I wear pants.' },
        { word: 'skirt', chinese: '裙子', phonetic: '/skɜːt/', icon: '👗', sentence: 'Her skirt is pink.' },
        { word: 'jacket', chinese: '夹克', phonetic: '/ˈdʒækɪt/', icon: '🧥', sentence: 'My jacket is warm.' },
        { word: 'gloves', chinese: '手套', phonetic: '/ɡlʌvz/', icon: '🧤', sentence: 'I wear gloves in winter.' },
        { word: 'scarf', chinese: '围巾', phonetic: '/skɑːf/', icon: '🧣', sentence: 'The scarf is long.' },
        { word: 'T-shirt', chinese: 'T恤', phonetic: '/ˈtiːʃɜːt/', icon: '👕', sentence: 'I like my T-shirt.' }
    ],
    transport: [
        { word: 'car', chinese: '汽车', phonetic: '/kɑː/', icon: '🚗', sentence: 'My dad has a car.' },
        { word: 'bus', chinese: '公交车', phonetic: '/bʌs/', icon: '🚌', sentence: 'I take the bus to school.' },
        { word: 'bike', chinese: '自行车', phonetic: '/baɪk/', icon: '🚲', sentence: 'I ride a bike.' },
        { word: 'train', chinese: '火车', phonetic: '/treɪn/', icon: '🚂', sentence: 'The train is fast.' },
        { word: 'plane', chinese: '飞机', phonetic: '/pleɪn/', icon: '✈️', sentence: 'Planes fly high.' },
        { word: 'boat', chinese: '船', phonetic: '/bəʊt/', icon: '🚢', sentence: 'The boat is on the water.' },
        { word: 'ship', chinese: '轮船', phonetic: '/ʃɪp/', icon: '🛳️', sentence: 'The ship is big.' },
        { word: 'subway', chinese: '地铁', phonetic: '/ˈsʌbweɪ/', icon: '🚇', sentence: 'The subway is underground.' },
        { word: 'taxi', chinese: '出租车', phonetic: '/ˈtæksi/', icon: '🚕', sentence: 'We take a taxi.' },
        { word: 'helicopter', chinese: '直升机', phonetic: '/ˈhelɪkɒptə/', icon: '🚁', sentence: 'A helicopter can fly.' },
        { word: 'truck', chinese: '卡车', phonetic: '/trʌk/', icon: '🚚', sentence: 'The truck carries goods.' },
        { word: 'motorcycle', chinese: '摩托车', phonetic: '/ˈməʊtəsaɪkl/', icon: '🏍️', sentence: 'He rides a motorcycle.' }
    ],
    weather: [
        { word: 'sunny', chinese: '晴朗', phonetic: '/ˈsʌni/', icon: '☀️', sentence: 'It is sunny today.' },
        { word: 'rainy', chinese: '下雨', phonetic: '/ˈreɪni/', icon: '🌧️', sentence: 'It is rainy outside.' },
        { word: 'cloudy', chinese: '多云', phonetic: '/ˈklaʊdi/', icon: '☁️', sentence: 'The sky is cloudy.' },
        { word: 'windy', chinese: '刮风', phonetic: '/ˈwɪndi/', icon: '💨', sentence: 'It is windy today.' },
        { word: 'snowy', chinese: '下雪', phonetic: '/ˈsnəʊi/', icon: '❄️', sentence: 'It is snowy in winter.' },
        { word: 'hot', chinese: '热', phonetic: '/hɒt/', icon: '🥵', sentence: 'Summer is hot.' },
        { word: 'cold', chinese: '冷', phonetic: '/kəʊld/', icon: '🥶', sentence: 'Winter is cold.' },
        { word: 'warm', chinese: '温暖', phonetic: '/wɔːm/', icon: '🌤️', sentence: 'Spring is warm.' },
        { word: 'cool', chinese: '凉爽', phonetic: '/kuːl/', icon: '🍂', sentence: 'Autumn is cool.' },
        { word: 'rainbow', chinese: '彩虹', phonetic: '/ˈreɪnbəʊ/', icon: '🌈', sentence: 'I see a rainbow.' },
        { word: 'thunder', chinese: '雷', phonetic: '/ˈθʌndə/', icon: '⚡', sentence: 'Thunder is loud.' },
        { word: 'storm', chinese: '暴风雨', phonetic: '/stɔːm/', icon: '⛈️', sentence: 'A storm is coming.' }
    ],
    jobs: [
        { word: 'doctor', chinese: '医生', phonetic: '/ˈdɒktə/', icon: '👨‍⚕️', sentence: 'A doctor helps sick people.' },
        { word: 'nurse', chinese: '护士', phonetic: '/nɜːs/', icon: '👩‍⚕️', sentence: 'The nurse is kind.' },
        { word: 'teacher', chinese: '老师', phonetic: '/ˈtiːtʃə/', icon: '👨‍🏫', sentence: 'My teacher is nice.' },
        { word: 'police', chinese: '警察', phonetic: '/pəˈliːs/', icon: '👮', sentence: 'A police officer helps us.' },
        { word: 'firefighter', chinese: '消防员', phonetic: '/ˈfaɪəfaɪtə/', icon: '👨‍🚒', sentence: 'A firefighter is brave.' },
        { word: 'farmer', chinese: '农民', phonetic: '/ˈfɑːmə/', icon: '👨‍🌾', sentence: 'The farmer grows food.' },
        { word: 'driver', chinese: '司机', phonetic: '/ˈdraɪvə/', icon: '🚗', sentence: 'My dad is a driver.' },
        { word: 'cook', chinese: '厨师', phonetic: '/kʊk/', icon: '👨‍🍳', sentence: 'A cook makes food.' },
        { word: 'pilot', chinese: '飞行员', phonetic: '/ˈpaɪlət/', icon: '✈️', sentence: 'A pilot flies planes.' },
        { word: 'singer', chinese: '歌手', phonetic: '/ˈsɪŋə/', icon: '🎤', sentence: 'She is a singer.' },
        { word: 'dancer', chinese: '舞者', phonetic: '/ˈdɑːnsə/', icon: '💃', sentence: 'He is a dancer.' },
        { word: 'artist', chinese: '艺术家', phonetic: '/ˈɑːtɪst/', icon: '🎨', sentence: 'An artist draws pictures.' }
    ]
};

let currentEnglishCategory = 'animals';

function initEnglishModule() {
    renderEnglishWords();
}

function switchEnglishCategory(category) {
    currentEnglishCategory = category;
    
    // 更新标签样式
    document.querySelectorAll('.english-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    try { var target = event.target; } catch(e) { var target = null; }
    if (target) target.classList.add('active');
    
    renderEnglishWords();
}

function renderEnglishWords() {
    const container = document.getElementById('english-words-grid');
    if (!container) return;
    
    const words = englishWordsData[currentEnglishCategory] || [];
    
    container.innerHTML = words.map((item, index) => {
        const learned = userData.progress.english.learnedWords?.includes(item.word);
        return `
            <div class="english-word-card ${learned ? 'learned' : ''}" onclick="learnEnglishWord('${item.word}', ${index})">
                <div class="word-icon">${item.icon}</div>
                <div class="word-english">${item.word}</div>
                <div class="word-info-row">
                    <span class="word-chinese">${item.chinese}</span>
                    <span class="word-phonetic">${item.phonetic}</span>
                </div>
                <div class="word-sentence">${item.sentence}</div>
                <button class="btn-unknown-word" onclick="event.stopPropagation(); markEnglishUnknown('${item.word}', ${index})">✗ 不认识</button>
            </div>
        `;
    }).join('');
    
    // 更新统计
    updateEnglishStats();
}

// 更新英语单词统计
function updateEnglishStats() {
    // 计算总单词数
    let totalWords = 0;
    for (const category in englishWordsData) {
        totalWords += englishWordsData[category].length;
    }
    
    // 已学习单词数
    const learnedWords = userData.progress.english.learnedWords || [];
    const learnedCount = learnedWords.length;
    
    // 不认识单词数
    const unknownWords = userData.progress.english.unknownWords || [];
    const unknownCount = unknownWords.length;
    
    // 未学习数 = 总数 - 已学习数 - 不认识数（去重后）
    const unlearnedCount = totalWords - learnedCount;
    
    // 更新显示
    const totalEl = document.getElementById('english-total');
    const learnedEl = document.getElementById('english-learned');
    const unlearnedEl = document.getElementById('english-unlearned');
    const unknownEl = document.getElementById('english-unknown');
    
    if (totalEl) totalEl.textContent = totalWords;
    if (learnedEl) learnedEl.textContent = learnedCount;
    if (unlearnedEl) unlearnedEl.textContent = Math.max(0, unlearnedCount);
    if (unknownEl) unknownEl.textContent = unknownCount;
}

// 标记单词为不认识
function markEnglishUnknown(word, index) {
    // 初始化unknownWords数组
    if (!userData.progress.english.unknownWords) {
        userData.progress.english.unknownWords = [];
    }
    
    // 从已学习列表移除
    if (userData.progress.english.learnedWords) {
        userData.progress.english.learnedWords = userData.progress.english.learnedWords.filter(w => w !== word);
    }
    
    // 添加到不认识列表
    if (!userData.progress.english.unknownWords.includes(word)) {
        userData.progress.english.unknownWords.push(word);
        saveUserData();
    }
    
    // 更新卡片样式
    const cards = document.querySelectorAll('.english-word-card');
    if (cards[index]) {
        cards[index].classList.remove('learned');
        cards[index].classList.add('unknown');
    }
    
    // 更新统计
    updateEnglishStats();
    showToast('已标记为不认识');
}

function learnEnglishWord(word, index) {
    const words = englishWordsData[currentEnglishCategory];
    const wordData = words[index];
    
    // 初始化learnedWords数组
    if (!userData.progress.english.learnedWords) {
        userData.progress.english.learnedWords = [];
    }
    
    // 标记为已学习
    if (!userData.progress.english.learnedWords.includes(word)) {
        userData.progress.english.learnedWords.push(word);
        addStars(3);
        completeDailyTask('english');
        saveUserData();
        
        // 更新卡片样式
        const cards = document.querySelectorAll('.english-word-card');
        if (cards[index]) cards[index].classList.add('learned');
    }
    
    // 播放单词和句子发音
    speakWordAndSentence(wordData);
}

// 使用有道词典API播放英文发音
function speakEnglishWord(word) {
    const audio = new Audio(`https://dict.youdao.com/dictvoice?type=1&audio=${encodeURIComponent(word)}`);
    audio.play().catch(e => console.log('音频播放失败:', e));
}

// 播放单词和句子
function speakWordAndSentence(wordData) {
    // 先播放单词
    const wordAudio = new Audio(`https://dict.youdao.com/dictvoice?type=1&audio=${encodeURIComponent(wordData.word)}`);
    
    wordAudio.onended = () => {
        // 单词播放完后，等待500ms再播放句子
        setTimeout(() => {
            speakSentence(wordData.sentence);
        }, 500);
    };
    
    wordAudio.play().catch(e => {
        console.log('单词音频播放失败，尝试使用语音合成');
        // 降级方案：使用浏览器语音合成
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(wordData.word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.onend = () => {
                setTimeout(() => {
                    const sentenceUtterance = new SpeechSynthesisUtterance(wordData.sentence);
                    sentenceUtterance.lang = 'en-US';
                    sentenceUtterance.rate = 0.8;
                    speechSynthesis.speak(sentenceUtterance);
                }, 500);
            };
            speechSynthesis.speak(utterance);
        }
    });
}

// 播放句子
function speakSentence(sentence) {
    const audio = new Audio(`https://dict.youdao.com/dictvoice?type=1&audio=${encodeURIComponent(sentence)}`);
    audio.play().catch(e => {
        console.log('句子音频播放失败，尝试使用语音合成');
        // 降级方案
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    });
}

function showEnglishWordModal(wordData) {
    const modal = document.getElementById('english-word-modal');
    if (!modal) {
        // 创建弹窗
        const modalHTML = `
            <div id="english-word-modal" class="modal show">
                <div class="modal-content english-word-modal">
                    <div class="modal-icon" id="modal-icon">${wordData.icon}</div>
                    <div class="modal-english" id="modal-english">${wordData.word}</div>
                    <div class="modal-phonetic" id="modal-phonetic">${wordData.phonetic}</div>
                    <div class="modal-chinese" id="modal-chinese">${wordData.chinese}</div>
                    <div class="modal-sentence">
                        <div class="en" id="modal-sentence-en">${wordData.sentence}</div>
                        <div class="cn" id="modal-sentence-cn">${translateSentence(wordData.sentence, wordData.chinese)}</div>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn" onclick="speakEnglishWord('${wordData.word}')">🔊 发音</button>
                        <button class="btn btn-primary" onclick="closeEnglishModal()">学会了</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        // 更新弹窗内容
        document.getElementById('modal-icon').textContent = wordData.icon;
        document.getElementById('modal-english').textContent = wordData.word;
        document.getElementById('modal-phonetic').textContent = wordData.phonetic;
        document.getElementById('modal-chinese').textContent = wordData.chinese;
        document.getElementById('modal-sentence-en').textContent = wordData.sentence;
        document.getElementById('modal-sentence-cn').textContent = translateSentence(wordData.sentence, wordData.chinese);
        modal.classList.add('show');
    }
}

function closeEnglishModal() {
    const modal = document.getElementById('english-word-modal');
    if (modal) modal.classList.remove('show');
}

function translateSentence(sentence, word) {
    // 简单的句子翻译映射
    const translations = {
        'I have a cat.': '我有一只猫。',
        'The dog is running.': '狗在跑。',
        'A bird can fly.': '鸟会飞。',
        'Fish swim in water.': '鱼在水里游。',
        'The pig is pink.': '猪是粉色的。',
        'The cow gives milk.': '牛产奶。',
        'The duck quacks.': '鸭子嘎嘎叫。',
        'The rabbit jumps.': '兔子跳跃。',
        'I like horses.': '我喜欢马。',
        'The sheep is white.': '羊是白色的。',
        'I eat an apple.': '我吃苹果。',
        'Bananas are yellow.': '香蕉是黄色的。',
        'I like orange juice.': '我喜欢橙汁。',
        'Grapes are sweet.': '葡萄很甜。',
        'The pear is green.': '梨是绿色的。',
        'Peaches are pink.': '桃子是粉色的。',
        'Mango is tasty.': '芒果很好吃。',
        'Watermelon is big.': '西瓜很大。',
        'The apple is red.': '苹果是红色的。',
        'The sky is blue.': '天空是蓝色的。',
        'Grass is green.': '草是绿色的。',
        'The sun is yellow.': '太阳是黄色的。',
        'Her dress is pink.': '她的裙子是粉色的。',
        'Snow is white.': '雪是白色的。',
        'My hair is black.': '我的头发是黑色的。',
        'Orange is my favorite color.': '橙色是我最喜欢的颜色。',
        'I love my mom.': '我爱我的妈妈。',
        'Dad is tall.': '爸爸很高。',
        'My sister is nice.': '我的姐姐很好。',
        'My brother is young.': '我的弟弟还小。',
        'Grandma is kind.': '奶奶很慈祥。',
        'Grandpa tells stories.': '爷爷讲故事。',
        'The baby is cute.': '宝宝很可爱。',
        'I love my family.': '我爱我的家。',
        'I have one head.': '我有一个头。',
        'I have two eyes.': '我有两只眼睛。',
        'I hear with my ears.': '我用耳朵听。',
        'My nose is small.': '我的鼻子很小。',
        'I eat with my mouth.': '我用嘴巴吃东西。',
        'I have two hands.': '我有两只手。',
        'I have two feet.': '我有两只脚。',
        'My legs are strong.': '我的腿很强壮。',
        'I have one book.': '我有一本书。',
        'I see three birds.': '我看到三只鸟。',
        'A dog has four legs.': '狗有四条腿。',
        'I have five fingers.': '我有五根手指。',
        'There are six apples.': '有六个苹果。',
        'Seven days in a week.': '一周有七天。',
        'An octopus has eight legs.': '章鱼有八条腿。',
        'I am nine years old.': '我九岁了。',
        'I have ten toes.': '我有十个脚趾。'
    };
    return translations[sentence] || sentence;
}

// ==================== 游戏模块 ====================

function startGame(gameType) {
    if (gameType === 'balloon') {
        startBalloonGame();
    } else if (gameType === 'mathRace') {
        startMathRaceGame();
    } else if (gameType === 'chineseMatch') {
        startChineseMatchGame();
    } else {
        alert('这个游戏还在开发中，敬请期待！');
    }
}

function startBalloonGame() {
    balloonGame.score = 0;
    balloonGame.timer = 60;
    balloonGame.balloons = [];

    showScreen('balloon-game');

    document.getElementById('game-score').textContent = '0';
    document.getElementById('game-timer').textContent = '60';

    generateBalloonTarget();

    gameInterval = setInterval(() => createBalloon(), 1000);

    const timerInterval = setInterval(() => {
        balloonGame.timer--;
        document.getElementById('game-timer').textContent = balloonGame.timer;

        if (balloonGame.timer <= 0) {
            clearInterval(timerInterval);
            endBalloonGame();
        }
    }, 1000);
}

function generateBalloonTarget() {
    const vowels = ['a', 'o', 'e', 'i', 'u', 'ü'];
    balloonGame.target = vowels[Math.floor(Math.random() * vowels.length)];
    document.getElementById('balloon-target').textContent = `点击 "${balloonGame.target}" 的气球！`;
}

function createBalloon() {
    const area = document.getElementById('balloon-area');
    if (!area) return;

    const balloon = document.createElement('div');
    balloon.className = 'balloon';

    const vowels = ['a', 'o', 'e', 'i', 'u', 'ü'];
    const pinyin = vowels[Math.floor(Math.random() * vowels.length)];
    balloon.textContent = pinyin;

    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
    balloon.style.background = colors[Math.floor(Math.random() * colors.length)];

    const maxX = area.offsetWidth - 60;
    balloon.style.left = Math.random() * maxX + 'px';
    balloon.style.bottom = '-80px';

    balloon.onclick = () => popBalloon(balloon, pinyin);
    area.appendChild(balloon);

    let bottom = -80;
    const riseInterval = setInterval(() => {
        bottom += 2;
        balloon.style.bottom = bottom + 'px';
        if (bottom > area.offsetHeight) {
            clearInterval(riseInterval);
            balloon.remove();
        }
    }, 50);

    balloonGame.balloons.push(balloon);
}

function popBalloon(balloon, pinyin) {
    if (pinyin === balloonGame.target) {
        balloon.classList.add('pop');
        balloonGame.score += 10;
        document.getElementById('game-score').textContent = balloonGame.score;

        setTimeout(() => balloon.remove(), 300);
        generateBalloonTarget();
    } else {
        balloon.style.transform = 'scale(0.8)';
        setTimeout(() => balloon.style.transform = '', 200);
    }
}

function endBalloonGame() {
    clearInterval(gameInterval);
    balloonGame.balloons.forEach(b => b.remove());

    const score = balloonGame.score || 0;
    const pointsEarned = Math.floor(score / 5);
    const stars = Math.floor(score / 10);

    // 积分奖励
    if (pointsEarned > 0) {
        pointsSystem.addPoints(pointsEarned, '气球游戏');
    }
    addStars(stars);
    unlockBadge('first_game');
    completeDailyTask('game', { accuracy: Math.min(1, score / 100), time: 60 });

    // 记录最佳成绩
    if (!userData.stats.gameScores) userData.stats.gameScores = {};
    if (!userData.stats.gameScores.balloon || score > userData.stats.gameScores.balloon) {
        userData.stats.gameScores.balloon = score;
    }

    saveUserData();
    updateHomeUI();

    showReward('游戏结束！', `得分：${score}，获得 ${stars} 颗星星！`, stars);
}

function exitGame() {
    clearInterval(gameInterval);
    if (balloonGame.balloons) balloonGame.balloons.forEach(b => b.remove());
    // 停止数学赛车
    if (mathRaceState.timerInterval) clearInterval(mathRaceState.timerInterval);
    // 停止汉字消消乐
    if (chineseMatchState.timerInterval) clearInterval(chineseMatchState.timerInterval);
    showScreen('game-screen');
}

// ==================== 数学赛车游戏 ====================

const mathRaceState = {
    score: 0,
    totalQ: 10,
    currentQ: 0,
    timeLeft: 30,
    timerInterval: null,
    correctAnswer: 0,
    carPos: 0  // 0~100 进度
};

function startMathRaceGame() {
    mathRaceState.score = 0;
    mathRaceState.currentQ = 0;
    mathRaceState.timeLeft = 30;
    mathRaceState.carPos = 0;

    showScreen('math-race-game');
    updateMathRaceUI();
    generateMathRaceQuestion();

    if (mathRaceState.timerInterval) clearInterval(mathRaceState.timerInterval);
    mathRaceState.timerInterval = setInterval(() => {
        mathRaceState.timeLeft--;
        const timerEl = document.getElementById('race-timer');
        if (timerEl) timerEl.textContent = mathRaceState.timeLeft;

        if (mathRaceState.timeLeft <= 0) {
            clearInterval(mathRaceState.timerInterval);
            endMathRaceGame('timeout');
        }
    }, 1000);
}

function generateMathRaceQuestion() {
    if (mathRaceState.currentQ >= mathRaceState.totalQ) {
        clearInterval(mathRaceState.timerInterval);
        endMathRaceGame('complete');
        return;
    }

    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let num1, num2, answer;

    if (op === '+') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
    } else if (op === '-') {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
    } else {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = num1 * num2;
    }

    mathRaceState.correctAnswer = answer;

    const qEl = document.getElementById('race-question');
    if (qEl) qEl.textContent = `${num1} ${op} ${num2} = ?`;

    // 生成4个选项
    const options = [answer];
    while (options.length < 4) {
        let w = answer + Math.floor(Math.random() * 10) - 5;
        if (w > 0 && !options.includes(w)) options.push(w);
    }
    options.sort(() => Math.random() - 0.5);

    const container = document.getElementById('race-options');
    if (!container) return;
    container.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'race-option';
        btn.textContent = opt;
        btn.onclick = () => checkRaceAnswer(opt, btn);
        container.appendChild(btn);
    });

    // 进度提示
    const progEl = document.getElementById('race-progress');
    if (progEl) progEl.textContent = `第 ${mathRaceState.currentQ + 1} / ${mathRaceState.totalQ} 题`;
}

function checkRaceAnswer(selected, btn) {
    // 禁用所有选项防止重复点击
    document.querySelectorAll('.race-option').forEach(b => b.disabled = true);

    if (selected === mathRaceState.correctAnswer) {
        btn.classList.add('race-correct');
        mathRaceState.score += 10;
        mathRaceState.currentQ++;
        mathRaceState.carPos = Math.round((mathRaceState.currentQ / mathRaceState.totalQ) * 100);
        updateMathRaceUI();
        hapticFeedback('success');

        // 答对加时
        mathRaceState.timeLeft = Math.min(mathRaceState.timeLeft + 3, 60);

        setTimeout(() => generateMathRaceQuestion(), 600);
    } else {
        btn.classList.add('race-wrong');
        hapticFeedback('error');
        // 答错减时
        mathRaceState.timeLeft = Math.max(mathRaceState.timeLeft - 3, 0);
        setTimeout(() => {
            document.querySelectorAll('.race-option').forEach(b => {
                b.disabled = false;
                b.classList.remove('race-wrong');
            });
        }, 600);
    }
}

function updateMathRaceUI() {
    const scoreEl = document.getElementById('race-score');
    const carEl = document.getElementById('race-car');
    if (scoreEl) scoreEl.textContent = mathRaceState.score;
    if (carEl) carEl.style.left = mathRaceState.carPos + '%';
}

function endMathRaceGame(reason) {
    const score = mathRaceState.score || 0;
    const pointsEarned = Math.floor(score / 5);
    const stars = Math.floor(score / 10);
    // 计算正确率
    const totalAnswered = (mathRaceState.correctCount || 0) + (mathRaceState.wrongCount || 0);
    const accuracy = totalAnswered > 0 ? (mathRaceState.correctCount || 0) / totalAnswered : 0;

    // 积分奖励
    if (pointsEarned > 0) {
        pointsSystem.addPoints(pointsEarned, '数学赛车');
    }
    addStars(stars);
    unlockBadge('first_game');
    completeDailyTask('math', { accuracy, time: 60 });

    // 记录最佳成绩
    if (!userData.stats.gameScores) userData.stats.gameScores = {};
    if (!userData.stats.gameScores.mathRace || score > userData.stats.gameScores.mathRace) {
        userData.stats.gameScores.mathRace = score;
    }

    saveUserData();
    updateHomeUI();

    const msg = reason === 'complete'
        ? `全部答完！得分：${score}，获得 ${stars} 颗星！`
        : `时间到！得分：${score}，获得 ${stars} 颗星！`;

    showReward('🏎️ 赛车结束！', msg, stars);
    setTimeout(() => showScreen('game-screen'), 2000);
}

// ==================== 汉字消消乐游戏 ====================

const chineseMatchState = {
    cards: [],
    flipped: [],
    matched: 0,
    totalPairs: 8,
    moves: 0,
    timeLeft: 90,
    timerInterval: null,
    locked: false
};

function startChineseMatchGame() {
    chineseMatchState.flipped = [];
    chineseMatchState.matched = 0;
    chineseMatchState.moves = 0;
    chineseMatchState.timeLeft = 90;
    chineseMatchState.locked = false;

    showScreen('chinese-match-game');
    buildMatchBoard();

    if (chineseMatchState.timerInterval) clearInterval(chineseMatchState.timerInterval);
    chineseMatchState.timerInterval = setInterval(() => {
        chineseMatchState.timeLeft--;
        const timerEl = document.getElementById('match-timer');
        if (timerEl) timerEl.textContent = chineseMatchState.timeLeft;
        if (chineseMatchState.timeLeft <= 0) {
            clearInterval(chineseMatchState.timerInterval);
            endChineseMatchGame(false);
        }
    }, 1000);
}

function buildMatchBoard() {
    // 随机选8个汉字，每个出现2次，共16张
    const pool = chineseData.filter(d => d.char.length === 1);
    const selected = [];
    const usedIdx = new Set();
    while (selected.length < chineseMatchState.totalPairs) {
        const idx = Math.floor(Math.random() * pool.length);
        if (!usedIdx.has(idx)) {
            usedIdx.add(idx);
            selected.push(pool[idx]);
        }
    }

    // 每张卡出现两次
    const pairs = [...selected, ...selected].map((item, i) => ({
        id: i,
        char: item.char,
        pinyin: item.pinyin,
        flipped: false,
        matched: false
    }));

    // 洗牌
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    chineseMatchState.cards = pairs;

    const board = document.getElementById('match-board');
    if (!board) return;
    board.innerHTML = '';

    pairs.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'match-card';
        div.dataset.index = index;
        div.innerHTML = `
            <div class="match-card-inner">
                <div class="match-card-front">?</div>
                <div class="match-card-back">
                    <span class="match-char">${card.char}</span>
                    <span class="match-pinyin">${card.pinyin}</span>
                </div>
            </div>`;
        div.onclick = () => flipMatchCard(index);
        board.appendChild(div);
    });

    // 更新统计
    const movesEl = document.getElementById('match-moves');
    const matchedEl = document.getElementById('match-matched');
    if (movesEl) movesEl.textContent = 0;
    if (matchedEl) matchedEl.textContent = `0/${chineseMatchState.totalPairs}`;
}

function flipMatchCard(index) {
    if (chineseMatchState.locked) return;
    const card = chineseMatchState.cards[index];
    if (card.flipped || card.matched) return;
    if (chineseMatchState.flipped.length >= 2) return;

    card.flipped = true;
    const cardEl = document.querySelector(`.match-card[data-index="${index}"]`);
    if (cardEl) cardEl.classList.add('flipped');

    chineseMatchState.flipped.push(index);

    if (chineseMatchState.flipped.length === 2) {
        chineseMatchState.locked = true;
        chineseMatchState.moves++;
        const movesEl = document.getElementById('match-moves');
        if (movesEl) movesEl.textContent = chineseMatchState.moves;

        const [i1, i2] = chineseMatchState.flipped;
        const c1 = chineseMatchState.cards[i1];
        const c2 = chineseMatchState.cards[i2];

        if (c1.char === c2.char) {
            // 匹配成功
            c1.matched = true;
            c2.matched = true;
            chineseMatchState.matched++;
            const matchedEl = document.getElementById('match-matched');
            if (matchedEl) matchedEl.textContent = `${chineseMatchState.matched}/${chineseMatchState.totalPairs}`;

            const el1 = document.querySelector(`.match-card[data-index="${i1}"]`);
            const el2 = document.querySelector(`.match-card[data-index="${i2}"]`);
            setTimeout(() => {
                if (el1) el1.classList.add('matched');
                if (el2) el2.classList.add('matched');
                chineseMatchState.flipped = [];
                chineseMatchState.locked = false;
                hapticFeedback('success');

                if (chineseMatchState.matched >= chineseMatchState.totalPairs) {
                    clearInterval(chineseMatchState.timerInterval);
                    endChineseMatchGame(true);
                }
            }, 500);
        } else {
            // 不匹配，翻回去
            setTimeout(() => {
                c1.flipped = false;
                c2.flipped = false;
                const el1 = document.querySelector(`.match-card[data-index="${i1}"]`);
                const el2 = document.querySelector(`.match-card[data-index="${i2}"]`);
                if (el1) el1.classList.remove('flipped');
                if (el2) el2.classList.remove('flipped');
                chineseMatchState.flipped = [];
                chineseMatchState.locked = false;
                hapticFeedback('error');
            }, 800);
        }
    }
}

function endChineseMatchGame(win) {
    const moves = chineseMatchState.moves || 0;
    const matched = chineseMatchState.matched || 0;
    const stars = win
        ? Math.max(5, 15 - Math.floor(moves / 3))
        : 2;
    const pointsEarned = win ? Math.max(10, 50 - moves) : 5;

    // 积分奖励
    if (pointsEarned > 0) {
        pointsSystem.addPoints(pointsEarned, '汉字消消乐');
    }
    addStars(stars);
    unlockBadge('first_game');
    completeDailyTask('chinese', { accuracy: matched / 8, time: 90 });

    // 记录最佳成绩（步数越少越好）
    if (!userData.stats.gameScores) userData.stats.gameScores = {};
    if (win && (!userData.stats.gameScores.chineseMatch || moves < userData.stats.gameScores.chineseMatch)) {
        userData.stats.gameScores.chineseMatch = moves;
    }

    saveUserData();
    updateHomeUI();

    const msg = win
        ? `全部配对成功！用了 ${moves} 步，获得 ${stars} 颗星！`
        : `时间到！配对了 ${matched} 对，获得 ${stars} 颗星！`;

    showReward('🀄 消消乐结束！', msg, stars);
    setTimeout(() => showScreen('game-screen'), 2000);
}

// ==================== 个人中心 ====================

function updateProfileUI() {
    document.getElementById('profile-avatar').textContent = userData.profile.avatar;
    document.getElementById('profile-nickname').textContent = userData.profile.nickname;
    document.getElementById('profile-level').textContent = userData.profile.level;

    document.getElementById('profile-stars').textContent = userData.stats.totalStars;
    document.getElementById('profile-days').textContent = userData.stats.studyDays;
    document.getElementById('profile-streak').textContent = userData.stats.streak;

    updateProfileProgress('pinyin', userData.progress.pinyin);
    updateProfileProgress('chinese', userData.progress.chinese);
    updateProfileProgress('math', userData.progress.math);
    updateProfileProgress('english', userData.progress.english);

    updateBadges();
    updateCalendar();
}

function updateProfileProgress(moduleName, progressData) {
    let percent = 0;

    if (moduleName === 'pinyin') {
        const learned = progressData.vowels.length + progressData.consonants.length;
        percent = Math.round((learned / progressData.total) * 100);
    } else if (moduleName === 'chinese') {
        percent = Math.round((progressData.learned.length / progressData.total) * 100);
    } else if (moduleName === 'math') {
        percent = Math.round((progressData.numbers.length / progressData.total) * 100);
    } else if (moduleName === 'english') {
        percent = Math.round((progressData.letters.length / progressData.total) * 100);
    }

    const progressEl = document.getElementById(`profile-${moduleName}`);
    const textEl = document.getElementById(`profile-${moduleName}-text`);
    if (progressEl) progressEl.style.width = `${percent}%`;
    if (textEl) textEl.textContent = `${percent}%`;
}

function updateBadges() {
    const container = document.getElementById('badge-grid');
    if (!container) return;

    container.innerHTML = '';

    badgesData.forEach(badge => {
        const div = document.createElement('div');
        div.className = 'badge-item';

        if (userData.badges.includes(badge.id)) {
            div.classList.add('unlocked');
        } else {
            div.classList.add('locked');
        }

        div.innerHTML = `
            <span class="badge-icon">${badge.icon}</span>
            <span class="badge-name">${badge.name}</span>
        `;
        div.title = badge.desc;
        container.appendChild(div);
    });
}

function updateCalendar() {
    const container = document.getElementById('calendar-grid');
    if (!container) return;

    container.innerHTML = '';

    const today = new Date();

    for (let i = 27; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();

        const div = document.createElement('div');
        div.className = 'calendar-day';

        if (userData.studyCalendar.includes(dateStr)) {
            div.classList.add('checked');
        }

        if (i === 0) div.classList.add('today');
        div.textContent = date.getDate();
        container.appendChild(div);
    }
}

// ==================== 学习报告功能 ====================

function showLearningReport() {
    const modal = document.getElementById('report-modal');
    const reportBody = document.getElementById('report-body');
    
    // 计算各项统计数据
    const pinyinProgress = calculatePinyinProgress();
    const chineseProgress = calculateChineseProgress();
    const mathProgress = calculateMathProgress();
    const englishProgress = calculateEnglishProgress();
    const totalProgress = Math.round((pinyinProgress + chineseProgress + mathProgress + englishProgress) / 4);
    
    // 获取今日学习时间
    const today = new Date().toDateString();
    const studyMinutes = userData.stats.todayStudyTime || 0;
    
    // 获取本周学习天数
    const weekDays = getWeekStudyDays();
    
    // 获取薄弱环节
    const weakPoints = analyzeWeakPoints();
    
    // 生成复习建议
    const reviewItems = generateReviewSuggestions();
    // 生成动态目标
    const dynamicGoals = generateDynamicGoals(pinyinProgress, chineseProgress, mathProgress, englishProgress);
    // 生成进步趋势
    const trendHtml = generateTrendHtml();
    
    reportBody.innerHTML = `
        <div class="report-section">
            <h4>📈 总体进度</h4>
            <div class="report-circle">
                <div class="circle-progress" style="--progress: ${totalProgress}%">
                    <span>${totalProgress}%</span>
                </div>
                <p>学习完成度</p>
            </div>
        </div>
        
        <div class="report-section">
            <h4>📚 各模块详情</h4>
            <div class="report-modules">
                <div class="module-stat">
                    <span class="module-name">📖 拼音王国</span>
                    <div class="mini-bar"><div style="width: ${pinyinProgress}%"></div></div>
                    <span>${pinyinProgress}%</span>
                </div>
                <div class="module-stat">
                    <span class="module-name">🏰 汉字城堡</span>
                    <div class="mini-bar"><div style="width: ${chineseProgress}%"></div></div>
                    <span>${chineseProgress}%</span>
                </div>
                <div class="module-stat">
                    <span class="module-name">🔢 数字乐园</span>
                    <div class="mini-bar"><div style="width: ${mathProgress}%"></div></div>
                    <span>${mathProgress}%</span>
                </div>
                <div class="module-stat">
                    <span class="module-name">🔤 英文单词</span>
                    <div class="mini-bar"><div style="width: ${englishProgress}%"></div></div>
                    <span>${englishProgress}%</span>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <h4>⏱️ 学习统计</h4>
            <div class="report-stats">
                <div class="stat-box">
                    <span class="stat-num">${userData.stats.totalStars}</span>
                    <span class="stat-text">总星星数</span>
                </div>
                <div class="stat-box">
                    <span class="stat-num">${userData.stats.studyDays || 0}</span>
                    <span class="stat-text">学习天数</span>
                </div>
                <div class="stat-box">
                    <span class="stat-num">${userData.stats.streak || 0}</span>
                    <span class="stat-text">连续打卡</span>
                </div>
                <div class="stat-box">
                    <span class="stat-num">${weekDays}</span>
                    <span class="stat-text">本周学习</span>
                </div>
            </div>
        </div>
        
        ${trendHtml}
        
        <div class="report-section">
            <h4>🔄 今日复习推荐</h4>
            <div class="report-review">
                ${reviewItems.length > 0 ? 
                    `<p class="review-tip">根据遗忘曲线，今天建议复习：</p>
                    <ul class="review-list">${reviewItems.map(r => `<li><span class="review-module">${r.module}</span> ${r.item} <span class="review-reason">${r.reason}</span></li>`).join('')}</ul>` :
                    '<p class="good-tip">🎉 暂无需要复习的内容，继续学习新知识吧！</p>'
                }
            </div>
        </div>
        
        <div class="report-section">
            <h4>💡 学习建议</h4>
            <div class="report-suggestions">
                ${weakPoints.length > 0 ? 
                    `<p class="weak-tip">建议加强练习：</p>
                    <ul>${weakPoints.map(w => `<li>${w}</li>`).join('')}</ul>` :
                    '<p class="good-tip">🎉 各模块表现均衡，继续保持！</p>'
                }
            </div>
        </div>
        
        <div class="report-section">
            <h4>🎯 近期目标</h4>
            <div class="report-goals">
                ${dynamicGoals}
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function calculatePinyinProgress() {
    const vowels = userData.progress.pinyin.vowels?.length || 0;
    const consonants = userData.progress.pinyin.consonants?.length || 0;
    const wholeSyllables = userData.progress.pinyin.wholeSyllables?.length || 0;
    const total = userData.progress.pinyin.total || 44;
    return Math.round(((vowels + consonants + wholeSyllables) / total) * 100);
}

function calculateChineseProgress() {
    const learned = userData.progress.chinese.learned?.length || 0;
    const total = userData.progress.chinese.total || 500;
    return Math.min(100, Math.round((learned / total) * 100));
}

function calculateMathProgress() {
    const correct = userData.stats.mathCorrect || 0;
    // 累计答对100题达到100%进度
    return Math.min(100, Math.round((correct / 100) * 100));
}

function calculateEnglishProgress() {
    const learned = userData.progress.english.learnedWords?.length || 0;
    const total = userData.progress.english.total || 50;
    return Math.min(100, Math.round((learned / total) * 100));
}

function getWeekStudyDays() {
    // 简化：返回连续打卡天数
    return userData.stats.streak || 0;
}

// ==================== 基于遗忘曲线的复习推荐 ====================

// 艾宾浩斯遗忘曲线复习间隔（天）
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

// 检查学过的内容是否需要复习
function generateReviewSuggestions() {
    const suggestions = [];
    const now = new Date();
    const today = now.toDateString();
    
    // 如果有学习历史记录，检查哪些需要复习
    if (!userData.stats.reviewHistory) {
        userData.stats.reviewHistory = { chinese: [], pinyin: [], english: [], math: [] };
    }
    
    // 检查汉字复习
    const chineseReview = getReviewItems('chinese', 'chineseProgress');
    suggestions.push(...chineseReview);
    
    // 检查拼音复习
    const pinyinReview = getReviewItems('pinyin', 'pinyinProgress');
    suggestions.push(...pinyinReview);
    
    // 检查英语单词复习
    const englishReview = getReviewItems('english', 'englishProgress');
    suggestions.push(...englishReview);
    
    // 如果没有历史数据但有学习进度，生成初始复习推荐
    if (suggestions.length === 0) {
        suggestions.push(...generateInitialReviews());
    }
    
    // 最多返回5条
    return suggestions.slice(0, 5);
}

// 根据学习进度获取需要复习的项目
function getReviewItems(moduleType, progressModule) {
    const results = [];
    const history = (userData.stats.reviewHistory || {})[moduleType] || [];
    const progress = userData.progress[progressModule === 'pinyinProgress' ? 'pinyin' : 
                                      progressModule === 'englishProgress' ? 'english' : 'chinese'];
    
    if (!progress || !progress.learned || progress.learned.length === 0) return results;
    
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    
    // 检查已学内容的复习时间
    for (const item of progress.learned) {
        const historyEntry = history.find(h => h.item === item);
        
        if (!historyEntry) {
            // 新学的内容，1天后首次复习
            results.push({
                module: moduleType === 'chinese' ? '🏰 汉字' : 
                        moduleType === 'pinyin' ? '📖 拼音' : '🔤 英语',
                item: item,
                reason: '新学内容，建议今天复习'
            });
        } else {
            const daysSinceLastReview = (now - historyEntry.lastReview) / ONE_DAY;
            const reviewCount = historyEntry.count || 0;
            const nextInterval = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
            
            if (daysSinceLastReview >= nextInterval) {
                results.push({
                    module: moduleType === 'chinese' ? '🏰 汉字' : 
                            moduleType === 'pinyin' ? '📖 拼音' : '🔤 英语',
                    item: item,
                    reason: `已${Math.floor(daysSinceLastReview)}天未复习`
                });
            }
        }
        
        if (results.length >= 3) break;
    }
    
    return results;
}

// 生成初始复习推荐（用户刚开始学习时）
function generateInitialReviews() {
    const suggestions = [];
    
    // 如果有任何学习记录但没有复习历史
    const chineseLearned = userData.progress.chinese?.learned || [];
    if (chineseLearned.length > 0) {
        // 推荐最近学的3个汉字复习
        const recent = chineseLearned.slice(-3);
        for (const char of recent) {
            suggestions.push({ module: '🏰 汉字', item: char, reason: '最近学过，巩固一下' });
        }
    }
    
    return suggestions;
}

// 记录复习行为
function recordReview(moduleType, item) {
    if (!userData.stats.reviewHistory) {
        userData.stats.reviewHistory = { chinese: [], pinyin: [], english: [], math: [] };
    }
    
    if (!userData.stats.reviewHistory[moduleType]) {
        userData.stats.reviewHistory[moduleType] = [];
    }
    
    const history = userData.stats.reviewHistory[moduleType];
    const entry = history.find(h => h.item === item);
    
    if (entry) {
        entry.lastReview = Date.now();
        entry.count = (entry.count || 0) + 1;
    } else {
        history.push({ item: item, lastReview: Date.now(), count: 1 });
    }
    
    saveUserData();
}

function analyzeWeakPoints() {
    const weak = [];
    const pinyin = calculatePinyinProgress();
    const chinese = calculateChineseProgress();
    const math = calculateMathProgress();
    const english = calculateEnglishProgress();
    
    if (pinyin < 50) weak.push('拼音拼读练习');
    if (chinese < 30) weak.push('汉字书写与认读');
    if (math < 40) weak.push('数学运算速度');
    if (english < 30) weak.push('英语单词记忆');
    
    return weak;
}

// 生成动态目标
function generateDynamicGoals(pinyinProgress, chineseProgress, mathProgress, englishProgress) {
    const goals = [];
    const chineseTotal = userData.progress.chinese?.learned?.length || 0;
    const englishTotal = userData.progress.english?.learnedWords?.length || 0;
    
    // 汉字目标
    if (chineseProgress < 100) {
        const nextTarget = Math.ceil((chineseTotal + 10) / 50) * 50;
        goals.push(`• 认识 ${Math.min(nextTarget, 500)} 个汉字（已学${chineseTotal}个）`);
    } else {
        goals.push(`• 🎉 已掌握全部500个汉字，继续练习书写！`);
    }
    
    // 拼音目标
    if (pinyinProgress < 100) {
        goals.push(`• 完成所有拼音学习（当前${pinyinProgress}%）`);
    } else {
        goals.push(`• 🎉 拼音全部学完，练习拼读课文吧！`);
    }
    
    // 英语目标
    if (englishProgress < 100) {
        goals.push(`• 掌握${Math.min(englishTotal + 20, 100)}个英语单词（已学${englishTotal}个）`);
    }
    
    // 打卡目标
    const streak = userData.stats.streak || 0;
    if (streak < 7) {
        goals.push(`• 连续打卡7天（当前${streak}天）`);
    } else if (streak < 30) {
        goals.push(`• 连续打卡30天（当前${streak}天）`);
    } else {
        goals.push(`• 已坚持${streak}天，太棒了！`);
    }
    
    // 根据最低进度添加专项目标
    const minProgress = Math.min(pinyinProgress, chineseProgress, mathProgress, englishProgress);
    if (minProgress === pinyinProgress && pinyinProgress < 80) {
        goals.push(`• 重点突破：每天练习10个拼音音节`);
    } else if (minProgress === chineseProgress && chineseProgress < 80) {
        goals.push(`• 重点突破：每天认读5个新汉字`);
    }
    
    // 最多显示4个目标
    return goals.slice(0, 4).map(g => `<p>${g}</p>`).join('');
}

// 生成进步趋势图（用CSS简易柱状图）
function generateTrendHtml() {
    const history = userData.stats.weeklyHistory || [];
    
    // 如果没有历史数据，生成模拟的提示
    if (history.length === 0) {
        return `
        <div class="report-section">
            <h4>📊 本周趋势</h4>
            <div class="report-trend">
                <p class="trend-tip">坚持学习7天就能看到你的进步曲线哦！</p>
                <div class="trend-placeholder">
                    <span>📚 学习数据收集中...</span>
                </div>
            </div>
        </div>`;
    }
    
    const maxStars = Math.max(...history.map(h => h.stars), 1);
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    
    let bars = '';
    for (let i = 0; i < 7; i++) {
        const dayData = history[i] || { stars: 0, minutes: 0 };
        const height = Math.max(4, Math.round((dayData.stars / maxStars) * 60));
        bars += `
            <div class="trend-bar-wrapper">
                <div class="trend-bar" style="height: ${height}px">
                    <span class="trend-val">${dayData.stars > 0 ? dayData.stars + '⭐' : ''}</span>
                </div>
                <span class="trend-day">周${days[i]}</span>
            </div>`;
    }
    
    return `
    <div class="report-section">
        <h4>📊 本周趋势</h4>
        <div class="report-trend">
            <div class="trend-chart">${bars}</div>
        </div>
    </div>`;
}

// ==================== 设置功能 ====================

function showEditProfile() {
    const modal = document.getElementById('edit-profile-modal');
    modal.classList.add('show');
    document.getElementById('edit-nickname').value = userData.profile.nickname;

    document.querySelectorAll('#edit-profile-modal .avatar-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.avatar === userData.profile.avatar) {
            opt.classList.add('selected');
            selectedAvatar = userData.profile.avatar;
        }
    });
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
}

function saveProfile() {
    const newNickname = document.getElementById('edit-nickname').value.trim();
    if (!newNickname) {
        alert('请输入名字哦！');
        return;
    }

    userData.profile.avatar = selectedAvatar;
    userData.profile.nickname = newNickname;
    saveUserData();

    closeModal();
    updateProfileUI();
}

function toggleSound() {
    userData.settings.soundEnabled = !userData.settings.soundEnabled;
    document.getElementById('sound-status').textContent = userData.settings.soundEnabled ? '开启' : '关闭';
    saveUserData();
}

function resetProgress() {
    if (confirm('确定要重置所有学习进度吗？这个操作不可恢复哦！')) {
        localStorage.removeItem('kidsLearningApp');
        location.reload();
    }
}

// ==================== 辅助函数 ====================

// 更新所有页面的星星显示
function updateStarsDisplay() {
    const stars = userData.stats.totalStars;
    const starElements = ['home-stars', 'pinyin-stars', 'pinyin-detail-stars', 'math-stars', 'profile-stars'];
    starElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = stars;
    });
}

// 更新宠物状态显示
function updatePetStatus() {
    if (!userData.pets || userData.pets.length === 0) return;

    const currentPet = userData.pets[0]; // 使用第一个宠物

    // 更新主页宠物显示
    const petIconEl = document.getElementById('current-pet-icon');
    const petNameEl = document.getElementById('current-pet-name');
    const petHappinessEl = document.getElementById('pet-happiness-display');

    if (petIconEl && currentPet) {
        petIconEl.textContent = getPetEmoji(currentPet.type);
    }
    if (petNameEl && currentPet) {
        petNameEl.textContent = `${currentPet.name} Lv.${currentPet.level}`;
    }
    if (petHappinessEl && currentPet) {
        petHappinessEl.textContent = `😊 ${currentPet.happiness}%`;
    }
}

// 更新每日任务显示
function updateDailyTaskDisplay() {
    const today = new Date().toDateString();
    const completedToday = userData.dailyTasks.completed || [];

    // 更新任务进度显示
    const taskElements = {
        pinyin: 'pinyin-task',
        math: 'math-task', 
        chinese: 'chinese-task',
        poem: 'poem-task'
    };

    Object.entries(taskElements).forEach(([taskType, elementId]) => {
        const el = document.getElementById(elementId);
        if (el && userData.dailyTasks.date === today) {
            const isCompleted = completedToday.includes(taskType);
            el.classList.toggle('completed', isCompleted);
            
            // 设置进度条
            const progress = isCompleted ? 100 : 0;
            const progressBar = el.querySelector('.task-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
    });
}

// 根据宠物类型获取表情符号
function getPetEmoji(petType) {
    const emojiMap = {
        'fox': '🦊',
        'rabbit': '🐰',
        'bear': '🐻',
        'panda': '🐼'
    };
    return emojiMap[petType] || '🦊';
}

// 更新积分显示
function updatePointsDisplay() {
    const pointsStatus = {
        total: userData.points.total,
        today: userData.points.today,
        remainingToday: Math.max(0, 200 - userData.points.today),
        level: pointsSystem.calculateLevel(userData.points.total)
    };

    const todayPointsEl = document.getElementById('today-points');
    const totalPointsEl = document.getElementById('total-points');

    if (todayPointsEl) todayPointsEl.textContent = pointsStatus.today;
    if (totalPointsEl) totalPointsEl.textContent = pointsStatus.total;
}

function addStars(count) {
    userData.stats.totalStars += count;
    saveUserData();
    if (userData.stats.totalStars >= 100) unlockBadge('stars_100');
}

/**
 * 根据表现计算星级
 * @param {object} performance - { accuracy: 0-1, time: 秒 }
 * @returns {number} 1-3星
 */
function calculateStars(performance = {}) {
    const accuracy = performance.accuracy || 0;
    const time = performance.time || 999;
    if (accuracy >= 0.9 && time <= 60) return 3;
    if (accuracy >= 0.7 && time <= 180) return 2;
    return 1;
}

function completeDailyTask(taskType, performance = {}) {
    const today = new Date().toDateString();

    if (userData.dailyTasks.date !== today) {
        userData.dailyTasks.date = today;
        userData.dailyTasks.completed = [];
        userData.points.today = 0; // 重置今日积分
    }

    if (!userData.dailyTasks.completed.includes(taskType)) {
        userData.dailyTasks.completed.push(taskType);

        // 计算积分奖励和星级
        const pointsEarned = pointsSystem.calculateTaskPoints(taskType, performance);
        const stars = calculateStars(performance);

        if (pointsEarned > 0) {
            // 通过 addPoints 统一管理积分，确保每日上限检查生效
            const actualAdded = pointsSystem.addPoints(pointsEarned, getTaskName(taskType));
            addStars(Math.max(1, Math.floor(actualAdded / 10))); // 每10积分对应1颗星，至少1颗
        } else {
            saveUserData();
        }

        // 检查是否完成所有任务
        if (userData.dailyTasks.completed.length >= userData.dailyTasks.total) {
            const completionBonus = Math.min(50, 200 - userData.points.today); // 受每日上限200约束
            if (completionBonus > 0) {
                userData.points.total += completionBonus;
                userData.points.today += completionBonus;
                addStars(Math.floor(completionBonus / 10));
                saveUserData();
                showReward('太棒了！', `今日任务全部完成！奖励 ${completionBonus} 积分！`, stars);
            } else {
                showReward('太棒了！', '今日任务全部完成！', stars);
            }
        } else if (pointsEarned <= 0) {
            // addPoints 内部已调用 showPointsReward，0积分时不重复显示
        }
    }
}

// 点击任务卡片跳转到对应学习页面
function startTask(taskType) {
    // 如果已经完成，提示并返回
    if (userData.dailyTasks.completed && userData.dailyTasks.completed.includes(taskType)) {
        showReward('已完成！', '这个任务今天已经完成啦，明天再来吧～', 0);
        return;
    }
    const screenMap = {
        pinyin: 'pinyin-screen',
        math: 'math-screen',
        chinese: 'chinese-screen',
        english: 'english-screen',
        game: 'game-screen'
    };
    const screen = screenMap[taskType];
    if (screen) {
        showScreen(screen);
    }
}

// 更新宠物快乐度（根据获得的积分）
function updatePetHappiness(pointsEarned = 0) {
    if (!userData.pets || userData.pets.length === 0) return;

    const currentPet = userData.pets[0];

    // 积分增加快乐度（每10分+5%快乐度，最高100%）
    if (pointsEarned > 0) {
        currentPet.happiness = Math.min(100, currentPet.happiness + Math.floor(pointsEarned / 10) * 2);
    }

    // 随时间减少快乐度（游戏机制）
    const now = new Date();
    const lastInteraction = new Date(currentPet.lastInteraction);
    const hoursSinceLastInteraction = (now - lastInteraction) / (1000 * 60 * 60);

    // 每小时减少2%快乐度
    if (hoursSinceLastInteraction >= 1) {
        currentPet.happiness = Math.max(20, currentPet.happiness - Math.floor(hoursSinceLastInteraction));
        currentPet.lastInteraction = now.toISOString();
    }

    // 保持健康度与快乐度同步（简化处理）
    if (Math.abs(currentPet.health - currentPet.happiness) > 10) {
        currentPet.health = Math.max(80, currentPet.happiness);
    }
}

// 获取任务显示名称
function getTaskName(taskType) {
    const names = {
        pinyin: '拼音',
        math: '数学',
        chinese: '汉字',
        english: '英语',
        game: '游戏'
    };
    return names[taskType] || taskType;
}

function unlockBadge(badgeId) {
    if (!userData.badges.includes(badgeId)) {
        userData.badges.push(badgeId);
        saveUserData();
    }
}

function showReward(title, message, stars) {
    document.getElementById('reward-title').textContent = title;
    document.getElementById('reward-message').textContent = message;
    // 星级评价：1-3颗星，显示为 ⭐ 并带文字评价
    const starIcons = '⭐'.repeat(Math.max(1, Math.min(stars, 3)));
    const starText = stars >= 3 ? '🌟 完美！' : (stars >= 2 ? '👍 不错！' : '💪 继续加油！');
    document.getElementById('reward-stars').innerHTML = starIcons + (stars ? `<div class="reward-star-text">${starText}</div>` : '');
    document.getElementById('reward-modal').classList.add('show');
}

function closeRewardModal() {
    document.getElementById('reward-modal').classList.remove('show');
    // 不再自动跳转首页，保持当前页面
}

// 显示奖励弹窗但不跳转
function showRewardNoRedirect(title, message, stars) {
    document.getElementById('reward-title').textContent = title;
    document.getElementById('reward-message').textContent = message;
    document.getElementById('reward-stars').textContent = '⭐'.repeat(Math.min(stars, 10));
    document.getElementById('reward-modal').classList.add('show');
    
    // 3秒后自动关闭
    setTimeout(() => {
        document.getElementById('reward-modal').classList.remove('show');
    }, 1500);
}

// ==================== 宠物商店 & 宠物小屋 ====================

function showPetShop() {
    renderPetShop();
    showScreen('pet-shop-screen');
}

function renderPetShop() {
    // 更新积分显示
    const ptsEl = document.getElementById('shop-points-total');
    if (ptsEl) ptsEl.textContent = userData.points.total;

    // 渲染可购买宠物列表
    const petListEl = document.getElementById('shop-pet-list');
    if (petListEl) {
        const ownedPets = (userData.pets || []).map(p => p.type);
        petListEl.innerHTML = '';
        Object.entries(petSystem.petTypes).forEach(([key, pet]) => {
            const owned = ownedPets.includes(key);
            const canAfford = userData.points.total >= pet.unlockRequirement;
            const card = document.createElement('div');
            card.className = 'shop-pet-card' + (owned ? ' owned' : '') + (!owned && !canAfford ? ' locked' : '');
            card.innerHTML = `
                <span class="shop-pet-emoji">${pet.emoji}</span>
                <div class="shop-pet-name">${pet.name}</div>
                <div class="shop-pet-desc">${pet.description}</div>
                <div class="shop-pet-price">${owned ? '已拥有' : (pet.unlockRequirement === 0 ? '免费' : `💎 ${pet.unlockRequirement}`)}</div>
            `;
            if (!owned) {
                card.onclick = () => buyPet(key);
            }
            petListEl.appendChild(card);
        });
    }

    // 渲染道具列表
    const itemListEl = document.getElementById('shop-item-list');
    if (itemListEl) {
        itemListEl.innerHTML = '';
        Object.entries(petSystem.items).forEach(([key, item]) => {
            const canAfford = userData.points.total >= item.price;
            const card = document.createElement('div');
            card.className = 'shop-item-card' + (canAfford ? '' : ' locked');
            const icons = { food: '🍖', toy: '🧸', medicine: '💊', premium_food: '🍱' };
            card.innerHTML = `
                <span class="shop-item-icon">${icons[key] || '🎁'}</span>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.description}</div>
                </div>
                <div class="shop-item-price">💎 ${item.price}</div>
            `;
            if (canAfford) {
                card.onclick = () => buyShopItem(key);
            }
            itemListEl.appendChild(card);
        });
    }
}

function buyPet(petType) {
    const pet = petSystem.petTypes[petType];
    if (!pet) return;

    const ownedPets = (userData.pets || []).map(p => p.type);
    if (ownedPets.includes(petType)) {
        showPetMessage('😊', `你已经拥有 ${pet.name} 啦！`);
        return;
    }

    if (userData.points.total < pet.unlockRequirement) {
        showPetMessage('😢', `积分不足！还需要 ${pet.unlockRequirement - userData.points.total} 积分哦`);
        return;
    }

    // 扣除积分
    userData.points.total -= pet.unlockRequirement;

    // 添加宠物
    if (!userData.pets) userData.pets = [];
    userData.pets.push({
        type: petType,
        name: pet.name,
        emoji: pet.emoji,
        level: 1,
        experience: 0,
        happiness: pet.baseStats.happiness,
        health: pet.baseStats.health,
        skills: [],
        items: [],
        unlockedAt: new Date().toISOString(),
        lastInteraction: new Date().toISOString()
    });

    saveUserData();
    updateHomeUI();
    renderPetShop();
    showPetMessage('🎉', `成功领养 ${pet.name}！去宠物小屋看看吧～`);
}

function buyShopItem(itemType) {
    const item = petSystem.items[itemType];
    if (!item) return;

    if (userData.points.total < item.price) {
        showPetMessage('😢', `积分不足！还需要 ${item.price - userData.points.total} 积分哦`);
        return;
    }

    // 通过 petSystem.buyItem 购买
    const ok = petSystem.buyItem(itemType);
    if (ok) {
        updateHomeUI();
        renderPetShop();
        const icons = { food: '🍖', toy: '🧸', medicine: '💊', premium_food: '🍱' };
        showPetMessage(icons[itemType] || '🎁', `购买了 ${item.name}！`);
    }
}

function showPetHouse() {
    renderPetHouse();
    showScreen('pet-house-screen');
}

function renderPetHouse() {
    if (!userData.pets || userData.pets.length === 0) return;
    const pet = userData.pets[0];

    // 宠物头像和名称
    const avatarEl = document.getElementById('house-pet-avatar');
    const nameEl = document.getElementById('house-pet-name');
    const levelEl = document.getElementById('house-pet-level');
    if (avatarEl) avatarEl.textContent = pet.emoji || '🦊';
    if (nameEl) nameEl.textContent = pet.name || '小狐狸';
    if (levelEl) levelEl.textContent = 'Lv.' + (pet.level || 1);

    // 经验条
    const expBar = document.getElementById('house-pet-exp-bar');
    const expText = document.getElementById('house-pet-exp-text');
    const expNeeded = petSystem.getLevelExp(pet.level);
    const prevLevelExp = pet.level > 1 ? petSystem.getLevelExp(pet.level - 1) : 0;
    const currentLevelExp = pet.experience - prevLevelExp;
    const expPercent = expNeeded > 0 ? Math.min(100, Math.round((currentLevelExp / expNeeded) * 100)) : 0;
    if (expBar) expBar.style.width = expPercent + '%';
    if (expText) expText.textContent = `${currentLevelExp} / ${expNeeded} EXP`;

    // 快乐度 / 健康度
    const happyBar = document.getElementById('house-pet-happiness');
    const healthBar = document.getElementById('house-pet-health');
    const happyVal = document.getElementById('house-pet-happiness-val');
    const healthVal = document.getElementById('house-pet-health-val');
    if (happyBar) happyBar.style.width = (pet.happiness || 0) + '%';
    if (healthBar) healthBar.style.width = (pet.health || 0) + '%';
    if (happyVal) happyVal.textContent = (pet.happiness || 0) + '%';
    if (healthVal) healthVal.textContent = (pet.health || 0) + '%';

    // 技能
    const skillsEl = document.getElementById('house-pet-skills');
    if (skillsEl) {
        if (pet.skills && pet.skills.length > 0) {
            skillsEl.innerHTML = pet.skills.map(s => `<span class="pet-skill-tag">${s}</span>`).join('');
        } else {
            skillsEl.innerHTML = '<span class="no-skills">暂无技能，多多升级解锁！</span>';
        }
    }

    // 物品栏
    const invEl = document.getElementById('house-pet-inventory');
    if (invEl) {
        if (pet.items && pet.items.length > 0) {
            const itemCounts = {};
            pet.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + 1; });
            invEl.innerHTML = Object.entries(itemCounts).map(([name, count]) =>
                `<span class="pet-inventory-item">${name} x${count}</span>`
            ).join('');
        } else {
            invEl.innerHTML = '<span class="no-items">空空如也，去商店买点吧！</span>';
        }
    }

    // 宠物切换
    const switchEl = document.getElementById('house-pet-switch');
    if (switchEl && userData.pets.length > 1) {
        switchEl.innerHTML = userData.pets.map((p, i) => `
            <div class="pet-switch-card ${i === 0 ? 'active' : ''}" onclick="switchToPet(${i})">
                <span class="pet-switch-emoji">${p.emoji}</span>
                <span class="pet-switch-name">${p.name}</span>
            </div>
        `).join('');
    } else if (switchEl) {
        switchEl.innerHTML = '<div class="pet-switch-card active"><span class="pet-switch-emoji">' + (pet.emoji || '🦊') + '</span><div class="pet-switch-name">' + (pet.name || '小狐狸') + '</div></div>';
    }
}

function switchToPet(index) {
    if (!userData.pets || index >= userData.pets.length) return;
    // 将选中的宠物移到第一位
    const pet = userData.pets.splice(index, 1)[0];
    userData.pets.unshift(pet);
    pet.lastInteraction = new Date().toISOString();
    petSystem.switchPet(0);
    renderPetHouse();
    updateHomeUI();
}

function feedPet() {
    if (!userData.pets || userData.pets.length === 0) return;
    const pet = userData.pets[0];

    // 检查是否有食物
    const foodIdx = pet.items.findIndex(i => i.type === 'food' || i.type === 'premium_food');
    if (foodIdx >= 0) {
        // 消耗食物
        const foodItem = pet.items.splice(foodIdx, 1)[0];
        if (foodItem.type === 'premium_food') {
            pet.happiness = Math.min(100, pet.happiness + 25);
            pet.health = Math.min(100, pet.health + 20);
        } else {
            pet.happiness = Math.min(100, pet.happiness + 15);
        }
    } else {
        // 没有食物也可以少量互动
        pet.happiness = Math.min(100, pet.happiness + 5);
    }

    pet.experience = (pet.experience || 0) + 20;
    pet.lastInteraction = new Date().toISOString();

    // 检查升级
    const newLevel = petSystem.calculateLevel(pet.experience);
    if (newLevel > pet.level) {
        petSystem.levelUp(pet, newLevel);
    }

    saveUserData();
    renderPetHouse();
    updateHomeUI();
    showPetMessage('🍖', '喂食成功！快乐度提升～');
}

function playWithPet() {
    if (!userData.pets || userData.pets.length === 0) return;
    const pet = userData.pets[0];

    pet.happiness = Math.min(100, pet.happiness + 15);
    pet.experience = (pet.experience || 0) + 10;
    pet.lastInteraction = new Date().toISOString();

    // 健康度也略微增加
    pet.health = Math.min(100, pet.health + 3);

    // 检查升级
    const newLevel = petSystem.calculateLevel(pet.experience);
    if (newLevel > pet.level) {
        petSystem.levelUp(pet, newLevel);
    }

    saveUserData();
    renderPetHouse();
    updateHomeUI();
    showPetMessage('🧸', '玩耍成功！快乐度提升～');
}

function healPet() {
    if (!userData.pets || userData.pets.length === 0) return;
    const pet = userData.pets[0];

    // 检查是否有药品
    const medIdx = pet.items.findIndex(i => i.type === 'medicine');
    if (medIdx >= 0) {
        pet.items.splice(medIdx, 1);
        pet.health = Math.min(100, pet.health + 30);
        pet.experience = (pet.experience || 0) + 15;
    } else {
        // 休息恢复少量健康
        pet.health = Math.min(100, pet.health + 10);
    }

    pet.lastInteraction = new Date().toISOString();

    // 检查升级
    const newLevel = petSystem.calculateLevel(pet.experience);
    if (newLevel > pet.level) {
        petSystem.levelUp(pet, newLevel);
    }

    saveUserData();
    renderPetHouse();
    updateHomeUI();
    showPetMessage('💊', '治疗完成！健康度恢复～');
}

function showPetMessage(icon, text) {
    // 移除已有弹层
    const existing = document.querySelector('.pet-house-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'pet-house-overlay';
    overlay.innerHTML = `
        <div class="pet-message">
            <span class="pet-message-icon">${icon}</span>
            <span class="pet-message-text">${text}</span>
        </div>
    `;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);

    setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
    }, 2000);
}

// ==================== 偏旁部首模块 ====================

const radicalData = [
    // 人部
    { radical: '亻', name: '单人旁', group: '人', strokes: 2, meaning: '与人有关', examples: ['你','他','们','住','做','休','仙','仁','信','便'] },
    { radical: '人', name: '人字旁', group: '人', strokes: 2, meaning: '与人有关', examples: ['从','众','以','仄','企'] },
    // 水部
    { radical: '氵', name: '三点水', group: '水', strokes: 3, meaning: '与水有关', examples: ['海','湖','河','泡','流','洗','游','深','沙','池'] },
    { radical: '水', name: '水字旁', group: '水', strokes: 4, meaning: '与水有关', examples: ['泉','浆','淡','泳'] },
    // 木部
    { radical: '木', name: '木字旁', group: '木', strokes: 4, meaning: '与树木有关', examples: ['树','林','根','桌','椅','柱','森','桥','桑','枝'] },
    { radical: '木', name: '木字底', group: '木', strokes: 4, meaning: '与树木有关', examples: ['朵','条','杰'] },
    // 口部
    { radical: '口', name: '口字旁', group: '口', strokes: 3, meaning: '与嘴巴说话有关', examples: ['叫','吃','喝','唱','喊','咬','吐','哭','笑','呢'] },
    // 心部
    { radical: '忄', name: '竖心旁', group: '心', strokes: 3, meaning: '与心情感情有关', examples: ['忙','快','怕','情','悄','性','怀','悲','惊','恐'] },
    { radical: '心', name: '心字底', group: '心', strokes: 4, meaning: '与心情感情有关', examples: ['想','思','念','忘','恩','意','必'] },
    // 手部
    { radical: '扌', name: '提手旁', group: '手', strokes: 3, meaning: '与手的动作有关', examples: ['打','拿','拉','推','抱','握','捧','摸','抓','扔'] },
    // 目部
    { radical: '目', name: '目字旁', group: '目', strokes: 5, meaning: '与眼睛视觉有关', examples: ['看','眼','眉','睛','瞅','瞧','睡','盼','瞒','眺'] },
    // 日部
    { radical: '日', name: '日字旁', group: '日', strokes: 4, meaning: '与太阳时间有关', examples: ['早','明','晨','晚','晴','昨','时','映','晒','旭'] },
    // 土部
    { radical: '土', name: '土字旁', group: '土', strokes: 3, meaning: '与土地有关', examples: ['地','场','坐','坏','塔','堆','城','坡','墙','坑'] },
    // 火部
    { radical: '火', name: '火字旁', group: '火', strokes: 4, meaning: '与火热有关', examples: ['炎','烧','灯','烟','热','煮','炉','炸','灿','煎'] },
    { radical: '灬', name: '四点底', group: '火', strokes: 4, meaning: '与火热有关', examples: ['黑','点','热','然','熟','煮','煤','烹','燕'] },
    // 草部
    { radical: '艹', name: '草字头', group: '木', strokes: 3, meaning: '与植物草有关', examples: ['花','草','茶','菜','荷','莲','芽','葡','蒜','芬'] },
    // 竹部
    { radical: '⺮', name: '竹字头', group: '木', strokes: 6, meaning: '与竹子有关', examples: ['笔','笑','算','等','答','简','箱','筷','管','籍'] },
    // 言部
    { radical: '讠', name: '言字旁', group: '口', strokes: 2, meaning: '与说话言语有关', examples: ['说','话','语','请','谢','读','记','认','讲','让'] },
    // 女部
    { radical: '女', name: '女字旁', group: '人', strokes: 3, meaning: '与女性有关', examples: ['妈','姐','妹','她','好','姓','婆','姑','奶','婚'] },
    // 足部
    { radical: '足', name: '足字旁', group: '手', strokes: 7, meaning: '与脚步行走有关', examples: ['跑','跳','踢','踩','路','跟','蹦','踏','跛','跌'] },
    // 门部
    { radical: '门', name: '门字框', group: '土', strokes: 3, meaning: '与门有关', examples: ['间','闭','开','闯','阔','闷','闸','闺','阁','闻'] },
    // 金部
    { radical: '钅', name: '金字旁', group: '器物', strokes: 5, meaning: '与金属有关', examples: ['铁','铜','银','锅','针','钱','钟','铃','锁','锅'] },
    // 丝部
    { radical: '纟', name: '绞丝旁', group: '用品', strokes: 3, meaning: '与丝线织物有关', examples: ['红','线','织','练','细','结','给','绿','绳','绑'] },
    // 走部
    { radical: '走', name: '走字旁', group: '动作', strokes: 7, meaning: '与行走有关', examples: ['起','赶','超','越','趋','趟','赵','趣','赴','赶'] },
    // 车部
    { radical: '车', name: '车字旁', group: '器物', strokes: 4, meaning: '与车有关', examples: ['轮','转','轻','辆','软','输','载','轿','辅','较'] },
    // 食部
    { radical: '饣', name: '食字旁', group: '食物', strokes: 3, meaning: '与食物有关', examples: ['饭','饮','饺','饼','饿','饱','饲','饰','饨','餐'] },
    // 石部
    { radical: '石', name: '石字旁', group: '地理', strokes: 5, meaning: '与石头有关', examples: ['砖','矿','硬','破','砸','碎','磨','确','碗','砚'] },
    // 雨部
    { radical: '雨', name: '雨字头', group: '天气', strokes: 8, meaning: '与天气雨水有关', examples: ['雪','雷','雾','露','霜','霞','零','需','震','霍'] },
    // 月部
    { radical: '月', name: '月字旁', group: '身体', strokes: 4, meaning: '与身体肌肉有关', examples: ['肚','腿','脸','脑','胖','背','脚','脏','胶','胆'] },
    // 页部
    { radical: '页', name: '页字旁', group: '人', strokes: 6, meaning: '与头面有关', examples: ['顶','顺','须','颂','预','领','头','颈','颜','顾'] },
    // 王部
    { radical: '王', name: '王字旁', group: '器物', strokes: 4, meaning: '与玉石有关', examples: ['珠','玩','球','理','班','琴','瑞','环','璃','珍'] },
    // 衣部
    { radical: '衤', name: '衣字旁', group: '用品', strokes: 5, meaning: '与衣服有关', examples: ['被','裤','袜','袖','衬','裙','袍','补','初','被'] },
    // 示部
    { radical: '礻', name: '示字旁', group: '节日', strokes: 4, meaning: '与祭祀神灵有关', examples: ['祝','福','礼','神','祖','禅','祥','社','祠','祸'] },
    // 广部
    { radical: '广', name: '广字头', group: '建筑', strokes: 3, meaning: '与房屋建筑有关', examples: ['床','店','庙','府','座','库','康','庄','厅','廊'] },
    // 宀部
    { radical: '宀', name: '宝盖头', group: '建筑', strokes: 3, meaning: '与房屋有关', examples: ['家','字','安','完','宝','定','实','室','容','宫'] },
    // 穴部
    { radical: '穴', name: '穴字头', group: '地理', strokes: 5, meaning: '与洞穴有关', examples: ['空','穿','穷','突','究','窗','容','窥','窟','窿'] },
    // 力部
    { radical: '力', name: '力字旁', group: '动作', strokes: 2, meaning: '与力量有关', examples: ['动','功','加','助','努','劲','勇','勉','勒','势'] },
    // 刀部
    { radical: '刂', name: '立刀旁', group: '器物', strokes: 2, meaning: '与刀切割有关', examples: ['到','列','别','刻','判','利','创','刷','剑','剧'] },
    // 弓部
    { radical: '弓', name: '弓字旁', group: '器物', strokes: 3, meaning: '与弓箭有关', examples: ['张','强','弹','引','弯','弘','弦','弧','弥','弛'] },
    // 戈部
    { radical: '戈', name: '戈字旁', group: '器物', strokes: 4, meaning: '与兵器有关', examples: ['战','戏','或','截','戴','我','成','威','戳','戊'] },
    // 反犬旁
    { radical: '犭', name: '反犬旁', group: '动物', strokes: 3, meaning: '与兽类动物有关', examples: ['狗','猫','猪','狼','狮','猴','狐','狸','猎','猛'] },
    // 鸟部
    { radical: '鸟', name: '鸟字旁', group: '动物', strokes: 5, meaning: '与鸟类有关', examples: ['鸡','鸭','鹅','鸣','鸦','鸽','鹊','鹤','鹰','鹦'] },
    // 虫部
    { radical: '虫', name: '虫字旁', group: '动物', strokes: 6, meaning: '与昆虫有关', examples: ['蝶','蜂','蚁','蛙','蛇','蛛','蚂','虾','蚊','蝇'] },
    // 鱼部
    { radical: '鱼', name: '鱼字旁', group: '动物', strokes: 8, meaning: '与鱼类有关', examples: ['鲜','鲤','鲸','鲨','鳞','渔','鲍','鳄','鳗','鲈'] },
    // 马部
    { radical: '马', name: '马字旁', group: '动物', strokes: 3, meaning: '与马有关', examples: ['骑','驾','驶','驰','骏','腾','骤','驯','驴','驹'] },
];

let currentRadicalFilter = 'all';

function switchChineseMainTab(tab, btn) {
    // 切换按钮激活状态
    document.querySelectorAll('.chinese-main-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const charsPanel = document.getElementById('chinese-chars-panel');
    const radicalsPanel = document.getElementById('chinese-radicals-panel');

    if (tab === 'chars') {
        charsPanel.style.display = 'block';
        radicalsPanel.style.display = 'none';
    } else {
        charsPanel.style.display = 'none';
        radicalsPanel.style.display = 'block';
        renderRadicalGrid('all');
    }
}

function filterRadical(group, btn) {
    currentRadicalFilter = group;
    document.querySelectorAll('.radical-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderRadicalGrid(group);
}

function renderRadicalGrid(group) {
    const container = document.getElementById('radical-grid');
    if (!container) return;

    const data = group === 'all' ? radicalData : radicalData.filter(r => r.group === group);
    container.innerHTML = '';

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'radical-card';
        div.onclick = () => toggleRadicalDetail(item, div);
        div.innerHTML = `
            <div class="radical-char">${item.radical}</div>
            <div class="radical-name">${item.name}</div>
            <div class="radical-stroke">${item.strokes}画</div>
        `;
        container.appendChild(div);
    });
}

function toggleRadicalDetail(item, cardEl) {
    // 关闭已有展开的
    const existing = document.querySelector('.radical-detail-expanded');
    if (existing) existing.remove();

    if (cardEl.dataset.expanded === 'true') {
        cardEl.dataset.expanded = 'false';
        cardEl.classList.remove('expanded');
        return;
    }

    // 关闭其他
    document.querySelectorAll('.radical-card.expanded').forEach(c => {
        c.classList.remove('expanded');
        c.dataset.expanded = 'false';
    });

    cardEl.dataset.expanded = 'true';
    cardEl.classList.add('expanded');

    const detail = document.createElement('div');
    detail.className = 'radical-detail-expanded';
    detail.innerHTML = `
        <div class="radical-detail-content">
            <div class="radical-detail-top">
                <span class="radical-big">${item.radical}</span>
                <div class="radical-detail-info">
                    <span class="radical-detail-name">${item.name}</span>
                    <span class="radical-detail-meaning">💡 ${item.meaning}</span>
                </div>
            </div>
            <div class="radical-examples-label">包含此偏旁的汉字：</div>
            <div class="radical-examples">
                ${item.examples.map(e => `<span class="radical-example-char">${e}</span>`).join('')}
            </div>
        </div>
    `;

    // 插入到 cardEl 后面
    cardEl.parentNode.insertBefore(detail, cardEl.nextSibling);
}

// ==================== 事件监听 ====================

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        checkDailyTasks();
    }
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});
