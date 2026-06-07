import { InkFortuneType, InkResult } from '../types';

export const INK_FORTUNES: Record<InkFortuneType, { name: InkFortuneType; description: string; personality: string; color: string }> = {
  '宿墨': {
    name: '宿墨',
    description: '浓稠郁结，经夜不消。笔触沉着带有颗粒，蓄势而发。',
    personality: '外冷内热，心事较重。',
    color: '#1e1e24'
  },
  '润墨': {
    name: '润墨',
    description: '水汽氤氲，向外生发。晕染得体，温润如玉。',
    personality: '容易共情，也容易心软。',
    color: '#2b3a42'
  },
  '枯墨': {
    name: '枯墨',
    description: '苍劲干裂，势若劈竹。飞白相间，极具风骨和行动力。',
    personality: '行动力强，但偶尔固执。',
    color: '#4a443f'
  },
  '淡墨': {
    name: '淡墨',
    description: '空灵疏阔，退而不争。墨色极浅，大美无言，静水流深。',
    personality: '喜欢留白，不爱解释。',
    color: '#707a8a'
  },
  '浓墨': {
    name: '浓墨',
    description: '墨黑如漆，厚重安稳。笔迹分明，神采奕奕，不飘不散。',
    personality: '情绪稳定，存在感很强。',
    color: '#0d0d11'
  }
};

export const INK_CHARACTERS = [
  '藏锋', '飞白', '圆融', '清逸', '迟涩', '沉静', '劲健', '疏朗'
];

export const PAPER_TYPES = [
  '熟宣', '生宣', '澄心堂纸', '竹纸', '云母笺'
];

export const TIBAS = [
  '墨气沉而不滞。',
  '纸白留有余心。',
  '浓处藏光，淡处见远。',
  '一纸未干，万事未定。',
  '风过无痕，墨过有意。',
  '心定则笔稳，纸润则墨随。',
  '草草点染，自有一段天真。',
  '落墨有声，见素抱朴。',
  '半窗竹影，一注寒泉。',
  '泼墨成雨，收笔为风。',
  '余墨尚温，且待来人。',
  '一盏残墨，大梦初温。',
  '水运墨行，莫问前程。',
  '行笔微迟，纸上起烟。',
  '笔墨寥寥，知己自明。'
];

export const IDEALS = [
  '发呆', '神游', '写废话', '摸鱼', '散步', '晒太阳', 
  '喝冰美式', '点奶茶', '晚睡（偶尔）', '偷偷开心', 
  '看云', '删朋友圈', '听老歌', '和小猫对视', '乱逛书店', 
  '什么都不做', '去便利店买热豆浆', '提前下班', '在公交车上发呆', 
  '把闹钟调晚五分钟', '发呆二十秒', '买束野花', '剪头发',
  '大吃一顿', '不理烦人消息', '发表情包', '洗个热水澡',
  '拉伸筋骨', '吃冰淇淋', '闭目养神'
];

export const AVOIDS = [
  '回复导师', '开组会', '熬夜改PPT', '冲动消费', '打开工作群', 
  '想太多', '和前任聊天', '内耗', '秒回消息', '临时加班', 
  '刷短视频到深夜', '立 flag', '打开待办清单', '回忆尴尬昨天', 
  '空腹喝冰咖啡', '给自己过大压力', '在购物车乱加东西', '和AI争论人生', 
  '相信“再睡五分钟”', '反省自己太久', '在朋友圈挑刺', '自证清白',
  '思考今后十年的事', '说“好的收到”', '勉强堆笑笑意', '试图叫醒装睡的人',
  '早起打卡'
];

// Linear congruential generator for seed-based deterministic randomness
export function getSeededRandom(seed: number) {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

export function generateDailyInkResult(dateObj: Date): InkResult {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  // Numerical seed representing the day
  const seedNum = year * 10000 + month * 100 + day;
  const rand = getSeededRandom(seedNum);
  
  // 1. Pick Ink Fortune
  const fortuneKeys = Object.keys(INK_FORTUNES) as InkFortuneType[];
  const fortuneKey = fortuneKeys[Math.floor(rand() * fortuneKeys.length)];
  const fortuneData = INK_FORTUNES[fortuneKey];
  
  // 2. Pick Character style "字气"
  const inkCharacter = INK_CHARACTERS[Math.floor(rand() * INK_CHARACTERS.length)];
  
  // 3. Pick Paper type "纸性"
  const paperType = PAPER_TYPES[Math.floor(rand() * PAPER_TYPES.length)];
  
  // 4. Pick Tiba "题跋"
  const tiba = TIBAS[Math.floor(rand() * TIBAS.length)];
  
  // 5. Pick Ideals (choose 2 unique ones)
  const idealList = [...IDEALS];
  const firstIdealIdx = Math.floor(rand() * idealList.length);
  const ideal1 = idealList.splice(firstIdealIdx, 1)[0];
  const secondIdealIdx = Math.floor(rand() * idealList.length);
  const ideal2 = idealList[secondIdealIdx];
  const ideals = [ideal1, ideal2];
  
  // 6. Pick Avoid
  const avoid = AVOIDS[Math.floor(rand() * AVOIDS.length)];
  
  return {
    dateStr,
    inkFortune: fortuneData.name,
    inkCharacter,
    paperType,
    tiba,
    ideals,
    avoid,
    personality: fortuneData.personality,
    colorHex: fortuneData.color
  };
}
export function getAlternateResultForTimestamp(timestamp: number): InkResult {
  const d = new Date(timestamp);
  return generateDailyInkResult(d);
}
