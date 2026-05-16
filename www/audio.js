// ==================== 音频播放模块 ====================

// 拼音音频库 - 使用在线MP3资源
const PinyinAudio = {
    baseUrl: 'https://hanyupinyin.net/i/pinyinmp3/',
    
    // 单韵母音频映射（4个声调）
    vowels: {
        'a': ['a1', 'a2', 'a3', 'a4'],
        'o': ['o1', 'o2', 'o3', 'o4'],
        'e': ['e1', 'e2', 'e3', 'e4'],
        'i': ['i1', 'i2', 'i3', 'i4'],
        'u': ['u1', 'u2', 'u3', 'u4'],
        'ü': ['v1', 'v2', 'v3', 'v4']
    },
    
    // 声母音频映射 - 直接使用声母音频
    consonants: {
        'b': 'b', 'p': 'p', 'm': 'm', 'f': 'f',
        'd': 'd', 't': 't', 'n': 'n', 'l': 'l',
        'g': 'g', 'k': 'k', 'h': 'h',
        'j': 'j', 'q': 'q', 'x': 'x',
        'zh': 'zh', 'ch': 'ch', 'sh': 'sh', 'r': 'r',
        'z': 'z', 'c': 'c', 's': 's',
        'y': 'y', 'w': 'w'
    },
    
    // 声母默认搭配韵母（用于四声调展示）
    consonantVowelMap: {
        'b': 'a', 'p': 'o', 'm': 'a', 'f': 'a',
        'd': 'a', 't': 'a', 'n': 'a', 'l': 'a',
        'g': 'e', 'k': 'e', 'h': 'e',
        'j': 'i', 'q': 'i', 'x': 'i',
        'zh': 'i', 'ch': 'i', 'sh': 'i', 'r': 'i',
        'z': 'i', 'c': 'i', 's': 'i',
        'y': 'i', 'w': 'u'
    },
    
    // 声母+韵母组合的显示字符
    consonantDisplayMap: {
        'b': 'b', 'p': 'p', 'm': 'm', 'f': 'f',
        'd': 'd', 't': 't', 'n': 'n', 'l': 'l',
        'g': 'g', 'k': 'k', 'h': 'h',
        'j': 'j', 'q': 'q', 'x': 'x',
        'zh': 'zh', 'ch': 'ch', 'sh': 'sh', 'r': 'r',
        'z': 'z', 'c': 'c', 's': 's',
        'y': 'y', 'w': 'w'
    },
    
    // 整体认读音节 - 支持四声调
    wholeSyllables: {
        'zhi': ['zhi1', 'zhi2', 'zhi3', 'zhi4'],
        'chi': ['chi1', 'chi2', 'chi3', 'chi4'],
        'shi': ['shi1', 'shi2', 'shi3', 'shi4'],
        'ri': ['ri1', 'ri2', 'ri3', 'ri4'],
        'zi': ['zi1', 'zi2', 'zi3', 'zi4'],
        'ci': ['ci1', 'ci2', 'ci3', 'ci4'],
        'si': ['si1', 'si2', 'si3', 'si4'],
        'yi': ['yi1', 'yi2', 'yi3', 'yi4'],
        'wu': ['wu1', 'wu2', 'wu3', 'wu4'],
        'yu': ['yu1', 'yu2', 'yu3', 'yu4'],
        'ye': ['ye1', 'ye2', 'ye3', 'ye4'],
        'yue': ['yue1', 'yue2', 'yue3', 'yue4'],
        'yuan': ['yuan1', 'yuan2', 'yuan3', 'yuan4'],
        'yin': ['yin1', 'yin2', 'yin3', 'yin4'],
        'ying': ['ying1', 'ying2', 'ying3', 'ying4']
    },
    
    // 整体认读音节的带声调显示
    wholeSyllableTones: {
        'zhi': ['zhī', 'zhí', 'zhǐ', 'zhì'],
        'chi': ['chī', 'chí', 'chǐ', 'chì'],
        'shi': ['shī', 'shí', 'shǐ', 'shì'],
        'ri': ['rī', 'rí', 'rǐ', 'rì'],
        'zi': ['zī', 'zí', 'zǐ', 'zì'],
        'ci': ['cī', 'cí', 'cǐ', 'cì'],
        'si': ['sī', 'sí', 'sǐ', 'sì'],
        'yi': ['yī', 'yí', 'yǐ', 'yì'],
        'wu': ['wū', 'wú', 'wǔ', 'wù'],
        'yu': ['yū', 'yú', 'yǔ', 'yù'],
        'ye': ['yē', 'yé', 'yě', 'yè'],
        'yue': ['yuē', 'yué', 'yuě', 'yuè'],
        'yuan': ['yuān', 'yuán', 'yuǎn', 'yuàn'],
        'yin': ['yīn', 'yín', 'yǐn', 'yìn'],
        'ying': ['yīng', 'yíng', 'yǐng', 'yìng']
    },
    
    // 带声调的元音
    tonedVowels: {
        'a': ['ā', 'á', 'ǎ', 'à'],
        'o': ['ō', 'ó', 'ǒ', 'ò'],
        'e': ['ē', 'é', 'ě', 'è'],
        'i': ['ī', 'í', 'ǐ', 'ì'],
        'u': ['ū', 'ú', 'ǔ', 'ù'],
        'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ']
    },
    
    // 获取带声调的字母显示
    getTonedChar(vowel, tone) {
        return this.tonedVowels[vowel]?.[tone - 1] || vowel;
    },
    
    // 音频缓存
    audioCache: {},
    
    // 加载超时时间（毫秒）
    loadTimeout: 5000,
    
    // 带超时的音频加载
    loadAudioWithTimeout(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            // 超时处理
            const timeoutId = setTimeout(() => {
                audio.removeAttribute('src');
                audio.load();
                reject(new Error('音频加载超时'));
            }, this.loadTimeout);
            
            // 加载成功
            audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeoutId);
                resolve(audio);
            }, { once: true });
            
            // 加载失败
            audio.addEventListener('error', () => {
                clearTimeout(timeoutId);
                reject(new Error(`音频加载失败: ${url}`));
            }, { once: true });
            
            audio.src = url;
            audio.load();
        });
    },
    
    // 降级音频源
    fallbackUrls: [
        'https://hanyupinyin.net/i/pinyinmp3/',
        'https://cdn.jsdelivr.net/gh/hzqst/pinyin-audio@main/'
    ],
    
    // 当前使用的音频源索引
    currentBaseUrlIndex: 0,
    
    // 播放拼音音频（带完整容错）
    async play(pinyin) {
        // 尝试所有音频源
        for (let i = 0; i < this.fallbackUrls.length; i++) {
            const baseUrlIndex = (this.currentBaseUrlIndex + i) % this.fallbackUrls.length;
            const baseUrl = this.fallbackUrls[baseUrlIndex];
            const url = `${baseUrl}${pinyin}.mp3`;
            
            try {
                // 检查缓存
                let audio = this.audioCache[url];
                if (!audio) {
                    audio = await this.loadAudioWithTimeout(url);
                    this.audioCache[url] = audio;
                }
                
                audio.currentTime = 0;
                await audio.play();
                
                // 如果成功了但不是主源，说明主源已失效，切换默认源
                if (i > 0 && baseUrlIndex !== this.currentBaseUrlIndex) {
                    console.info('切换到可用音频源:', baseUrl);
                    this.currentBaseUrlIndex = baseUrlIndex;
                }
                
                return true;
            } catch (error) {
                console.warn(`音频源${baseUrlIndex}播放失败 [${pinyin}]:`, error.message);
                // 清除失败缓存
                delete this.audioCache[url];
                continue;
            }
        }
        
        // 所有源都失败了，使用 Web Speech API 作为最终降级
        console.warn('所有音频源失败，尝试语音合成:', pinyin);
        return this.fallbackToSpeech(pinyin);
    },
    
    // 语音合成降级方案
    fallbackToSpeech(text) {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) {
                console.warn('浏览器不支持语音合成');
                resolve(false);
                return;
            }
            
            // 取消之前可能存在的语音
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.onend = () => resolve(true);
            utterance.onerror = () => resolve(false);
            
            // 语音合成超时保护
            const speechTimeout = setTimeout(() => {
                window.speechSynthesis.cancel();
                resolve(false);
            }, 3000);
            
            utterance.onend = () => {
                clearTimeout(speechTimeout);
                resolve(true);
            };
            
            window.speechSynthesis.speak(utterance);
        });
    },
    
    // 播放单韵母（带声调）
    async playVowel(vowel, tone = 1) {
        const audioName = this.vowels[vowel]?.[tone - 1];
        if (audioName) {
            return this.play(audioName);
        }
        return false;
    },
    
    // 播放声母
    async playConsonant(consonant) {
        const audioName = this.consonants[consonant];
        if (audioName) {
            return this.play(audioName);
        }
        return false;
    },
    
    // 播放声母+韵母组合（带声调）
    async playConsonantWithTone(consonant, tone = 1) {
        // 获取该声母的默认韵母
        const vowel = this.consonantVowelMap[consonant] || 'a';
        // 构建拼音组合，如 ba1, ba2, ba3, ba4
        const pinyin = `${this.consonantDisplayMap[consonant] || consonant}${vowel}${tone}`;
        return this.play(pinyin);
    },
    
    // 获取声母+韵母组合的带声调显示
    getConsonantTonedDisplay(consonant, tone) {
        const vowel = this.consonantVowelMap[consonant] || 'a';
        const tonedVowel = this.tonedVowels[vowel]?.[tone - 1] || vowel;
        return `${this.consonantDisplayMap[consonant] || consonant}${tonedVowel}`;
    },
    
    // 获取声母的默认韵母
    getConsonantVowel(consonant) {
        return this.consonantVowelMap[consonant] || 'a';
    },
    
    // 播放整体认读音节（带声调）
    async playWholeSyllable(syllable, tone = 1) {
        const audioNames = this.wholeSyllables[syllable];
        if (audioNames && audioNames[tone - 1]) {
            return this.play(audioNames[tone - 1]);
        }
        return false;
    },
    
    // 获取整体认读音节带声调的显示
    getWholeSyllableTonedDisplay(syllable, tone) {
        const tones = this.wholeSyllableTones[syllable];
        if (tones && tones[tone - 1]) {
            return tones[tone - 1];
        }
        return syllable;
    }
};

// 汉字音频播放
const ChineseAudio = {
    // 带声调的元音映射
    toneMap: {
        'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
        'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
        'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
        'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
        'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
        'ǖ': ['v', 1], 'ǘ': ['v', 2], 'ǚ': ['v', 3], 'ǜ': ['v', 4],
        'ń': ['n', 2], 'ň': ['n', 3], 'ǹ': ['n', 4],
        'ḿ': ['m', 2], 'm̀': ['m', 4]
    },
    
    // 将带声调的拼音转换为音频文件名
    convertPinyin(pinyin) {
        // 取第一个拼音（处理多音字）
        pinyin = pinyin.split(' ')[0].toLowerCase();
        
        let result = '';
        let tone = '';
        
        // 遍历每个字符
        for (let char of pinyin) {
            if (this.toneMap[char]) {
                // 找到带声调的元音
                result += this.toneMap[char][0];
                tone = this.toneMap[char][1];
            } else if (/[1-4]/.test(char)) {
                // 数字声调
                tone = char;
            } else {
                result += char;
            }
        }
        
        // 返回带声调数字的拼音
        return tone ? `${result}${tone}` : result;
    },
    
    // 播放汉字发音（带完整降级链）
    async play(char, pinyin) {
        // 1. 尝试带声调播放
        const audioFile = this.convertPinyin(pinyin);
        const played = await PinyinAudio.play(audioFile);
        if (played) return true;
        
        // 2. 尝试不带声调
        const basePinyin = audioFile.replace(/[1-4]/g, '');
        const playedBase = await PinyinAudio.play(basePinyin);
        if (playedBase) return true;
        
        // 3. 最终降级：语音合成读汉字本身
        console.warn('汉字音频全部失败，使用语音合成:', char);
        return PinyinAudio.fallbackToSpeech(char);
    }
};

// 字母音频播放（中文读法）
const LetterAudio = {
    // 字母中文读法音频文件
    letterSounds: {
        'A': 'ei', 'B': 'bi', 'C': 'sei', 'D': 'di',
        'E': 'yi', 'F': 'efu', 'G': 'ji', 'H': 'aichi',
        'I': 'ai', 'J': 'jie', 'K': 'kei', 'L': 'ailou',
        'M': 'aimu', 'N': 'en', 'O': 'ou', 'P': 'pi',
        'Q': 'kou', 'R': 'aer', 'S': 'aisi', 'T': 'ti',
        'U': 'you', 'V': 'wei', 'W': 'dabuliu', 'X': 'aikesi',
        'Y': 'wai', 'Z': 'zei'
    },
    
    // 字母中文读音（用于显示）
    letterChinese: {
        'A': '诶', 'B': '比', 'C': '塞', 'D': '弟',
        'E': '伊', 'F': '艾夫', 'G': '吉', 'H': '艾奇',
        'I': '艾', 'J': '杰', 'K': '凯', 'L': '艾勒',
        'M': '艾姆', 'N': '恩', 'O': '欧', 'P': '皮',
        'Q': '库', 'R': '阿儿', 'S': '艾斯', 'T': '梯',
        'U': '优', 'V': '威', 'W': '达不溜', 'X': '艾克斯',
        'Y': '歪', 'Z': '贼德'
    },
    
    // 播放字母发音（带语音合成降级）
    async play(letter) {
        const sound = this.letterSounds[letter.toUpperCase()];
        if (sound) {
            const played = await PinyinAudio.play(sound);
            if (played) return true;
        }
        // 降级：语音合成读字母名
        return PinyinAudio.fallbackToSpeech(letter.toLowerCase());
    },
    
    // 获取字母中文读音
    getChinese(letter) {
        return this.letterChinese[letter.toUpperCase()] || letter;
    }
};

// 导出
if (typeof window !== 'undefined') {
    window.PinyinAudio = PinyinAudio;
    window.ChineseAudio = ChineseAudio;
    window.LetterAudio = LetterAudio;
}
