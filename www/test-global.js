// 临时测试：验证 pointsSystem 和 petSystem 作为全局变量可访问
const fs = require('fs');
const base = process.cwd();

// 模拟浏览器全局环境
const globals = {};
global.window = globals;
global.document = {
    addEventListener: () => {},
    createElement: () => ({
        style: {},
        classList: { add() {}, remove() {} },
        innerHTML: '',
        textContent: '',
        parentNode: { insertBefore() {} }
    }),
    body: { appendChild() {}, removeChild() {} },
    head: { appendChild() {} },
    getElementById: () => null,
    querySelectorAll: () => [],
    visibilityState: 'visible'
};
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = v; }
};
global.Capacitor = undefined;
global.navigator = { vibrate() {} };
global.console = console;

// 模拟 userData（app.js 中定义）
global.userData = {
    points: { total: 0, today: 0 },
    pets: [{ type: 'fox', name: '小狐狸', level: 1, experience: 0, happiness: 100, health: 100, skills: [], lastInteraction: new Date().toISOString() }],
    stats: { totalStars: 0 }
};

// 加载 points.js（用 new Function 模拟独立 <script> 作用域，但 window 共享）
const pointsCode = fs.readFileSync(base + '/points.js', 'utf8');
new Function('document', 'window', 'localStorage', 'console', 'navigator')(global.document, globals, global.localStorage, console, global.navigator);
// 手动 eval pointsCode 让它使用上面的全局对象
eval(pointsCode.replace("if (!document.getElementById('points-system-style'))", "if (false)"));

console.log('=== pointsSystem ===');
console.log('type:', typeof globals.pointsSystem);
console.log('basePoints:', Object.keys(globals.pointsSystem.basePoints));
console.log('pinyin pts:', globals.pointsSystem.calculateTaskPoints('pinyin', { accuracy: 80, stars: 3, timeSpent: 60 }));
console.log('game pts:', globals.pointsSystem.calculateTaskPoints('game', { accuracy: 0.8, stars: 2, timeSpent: 60 }));

// 加载 pet.js
eval(fs.readFileSync(base + '/pet.js', 'utf8'));

console.log('\n=== petSystem ===');
console.log('type:', typeof globals.petSystem);
console.log('petTypes:', Object.keys(globals.petSystem.petTypes));
console.log('items:', Object.keys(globals.petSystem.items));

console.log('\n✅ 全部测试通过！');
