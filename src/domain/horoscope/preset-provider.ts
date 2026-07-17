// 预设运势 Provider（离线、永远可用；v1.1.0 起为默认来源）
// 背景：原 aztro 第三方 API 依赖个人域名 + 生产无代理（review M1/M2），
// 上线后运势整体不可用。改为本地预设内容，纯离线、不再进入降级空态。
// 只负责取原始响应；超时/归一/降级判定仍由 HoroscopeService 承担（ADR-003：来源可替换）。
import type {
  HoroscopeProvider,
  RawHoroscope,
  RawHoroscopeRequest,
} from './provider'
import type { Sign } from '../../shared/enums'

// 每星座一份「性格底色」文案，按爱情/事业/健康三维度 + 星级，
// 每日 / 每周各一套（区分周期）。内容固定、正向、含免责由 UI 层承担。
interface DimSet {
  summary: string
  love: { text: string; score: number }
  career: { text: string; score: number }
  health: { text: string; score: number }
}

interface SignPreset {
  daily: DimSet
  weekly: DimSet
}

const PRESET: Record<Sign, SignPreset> = {
  白羊: {
    daily: {
      summary: '行动力充沛的一天，主动出击容易有收获。',
      love: { text: '感情上直率坦诚更受欢迎，别把热情藏起来。', score: 4 },
      career: { text: '适合开启新任务，果断决策能推动进展。', score: 4 },
      health: { text: '精力旺盛，注意别用力过猛，留出休息。', score: 3 },
    },
    weekly: {
      summary: '本周节奏偏快，先冲刺后收尾会比较顺。',
      love: { text: '关系中主动创造相处机会，热度自然回升。', score: 4 },
      career: { text: '周初定目标、周中全力推进，成果可期。', score: 4 },
      health: { text: '安排规律运动释放能量，避免情绪上头。', score: 3 },
    },
  },
  金牛: {
    daily: {
      summary: '踏实稳健的一天，按部就班反而顺利。',
      love: { text: '用实际行动表达在乎，比言语更打动人。', score: 4 },
      career: { text: '专注手头事务，稳扎稳打积累口碑。', score: 4 },
      health: { text: '注意饮食节制，别用美食缓解压力。', score: 3 },
    },
    weekly: {
      summary: '本周宜守成不宜冒进，稳中求进最合适。',
      love: { text: '感情需要耐心经营，日常陪伴胜过惊喜。', score: 4 },
      career: { text: '打磨细节、夯实基础，回报会在后半周显现。', score: 4 },
      health: { text: '保持作息稳定，适度散步舒缓身心。', score: 4 },
    },
  },
  双子: {
    daily: {
      summary: '思维灵活的一天，沟通与信息带来机会。',
      love: { text: '轻松幽默的交流能拉近距离。', score: 4 },
      career: { text: '多线并行的能力发挥出色，善用人脉。', score: 4 },
      health: { text: '大脑活跃易失眠，睡前减少刷屏。', score: 3 },
    },
    weekly: {
      summary: '本周信息与社交活跃，机会藏在对话里。',
      love: { text: '坦诚表达想法，避免因误会拉开距离。', score: 3 },
      career: { text: '适合谈合作、做提案，灵活应变占上风。', score: 4 },
      health: { text: '节奏太满记得给自己留空档放松。', score: 3 },
    },
  },
  巨蟹: {
    daily: {
      summary: '感受细腻的一天，照顾好情绪就顺了。',
      love: { text: '温柔体贴换来同样的呵护，家的温暖加分。', score: 4 },
      career: { text: '团队协作中你的细心被看见，值得信赖。', score: 3 },
      health: { text: '情绪影响状态，别把心事都往肚里咽。', score: 3 },
    },
    weekly: {
      summary: '本周重心在家庭与内心，安稳带来力量。',
      love: { text: '亲密关系升温，用心经营小日子。', score: 4 },
      career: { text: '稳步推进即可，不必勉强承担过多。', score: 3 },
      health: { text: '规律作息、亲近家人有助恢复元气。', score: 4 },
    },
  },
  狮子: {
    daily: {
      summary: '光彩夺目的一天，自信是你的最佳配饰。',
      love: { text: '大方展现魅力，容易成为焦点被青睐。', score: 4 },
      career: { text: '适合展示才华、争取表现，领导力凸显。', score: 4 },
      health: { text: '活力充沛，注意别透支，留意心脏与背部。', score: 3 },
    },
    weekly: {
      summary: '本周舞台感十足，主动争取更能被看见。',
      love: { text: '真诚而非炫耀更能赢得真心。', score: 4 },
      career: { text: '关键场合勇于发声，机会属于敢表现的人。', score: 4 },
      health: { text: '忙碌之余安排娱乐放松，别硬撑。', score: 3 },
    },
  },
  处女: {
    daily: {
      summary: '条理清晰的一天，整理与规划事半功倍。',
      love: { text: '别过度挑剔，包容一点关系更甜。', score: 3 },
      career: { text: '细致与专业让你脱颖而出，把控质量。', score: 4 },
      health: { text: '注意肠胃，规律饮食比进补更重要。', score: 4 },
    },
    weekly: {
      summary: '本周适合复盘与优化，把系统理顺。',
      love: { text: '放下完美要求，感情需要弹性空间。', score: 3 },
      career: { text: '梳理流程、查漏补缺，效率显著提升。', score: 4 },
      health: { text: '别过度焦虑细节，适度放松神经。', score: 3 },
    },
  },
  天秤: {
    daily: {
      summary: '和谐社交的一天，平衡各方带来好运。',
      love: { text: '优雅从容更迷人，浪漫氛围利于升温。', score: 4 },
      career: { text: '协调与谈判能力出色，合作顺遂。', score: 4 },
      health: { text: '注意腰肾保养，久坐记得起身活动。', score: 3 },
    },
    weekly: {
      summary: '本周关系与合作是主线，双赢思维吃香。',
      love: { text: '主动做决定，别让犹豫消磨感情热度。', score: 3 },
      career: { text: '借力伙伴、促成合作，成果加倍。', score: 4 },
      health: { text: '保持身心平衡，避免为讨好他人内耗。', score: 4 },
    },
  },
  天蝎: {
    daily: {
      summary: '洞察敏锐的一天，专注深入必有所得。',
      love: { text: '感情浓烈而专一，坦诚能加深羁绊。', score: 4 },
      career: { text: '钻研关键问题，深度思考带来突破。', score: 4 },
      health: { text: '情绪能量强，找出口释放避免郁结。', score: 3 },
    },
    weekly: {
      summary: '本周宜聚焦一件要事，全力以赴见成效。',
      love: { text: '放下猜疑多些信任，关系更稳固。', score: 4 },
      career: { text: '攻坚克难正当时，掌握核心资源。', score: 4 },
      health: { text: '注意休息，别让高强度投入拖垮状态。', score: 3 },
    },
  },
  射手: {
    daily: {
      summary: '乐观开阔的一天，探索与学习带来惊喜。',
      love: { text: '保持自由与坦率，共同话题拉近距离。', score: 4 },
      career: { text: '视野开阔利于拓展，敢想敢做有机会。', score: 4 },
      health: { text: '活动量大注意腿部，运动前热身。', score: 4 },
    },
    weekly: {
      summary: '本周适合走出去、学新东西，机会在远方。',
      love: { text: '给彼此空间，共同成长的感情更长久。', score: 3 },
      career: { text: '大胆规划、勇于尝试，格局决定收获。', score: 4 },
      health: { text: '安排户外与运动，身心都会更轻盈。', score: 4 },
    },
  },
  摩羯: {
    daily: {
      summary: '务实自律的一天，坚持就是最好的策略。',
      love: { text: '认真对待感情，稳重可靠让人安心。', score: 3 },
      career: { text: '目标明确、执行到位，离成果更近一步。', score: 4 },
      health: { text: '注意骨骼关节，别长时间保持同一姿势。', score: 3 },
    },
    weekly: {
      summary: '本周厚积薄发，长期努力开始见回报。',
      love: { text: '放下防备表达柔软，关系会更亲近。', score: 3 },
      career: { text: '稳步攀登，责任与机会同时到来。', score: 4 },
      health: { text: '别用工作填满全部时间，留白很重要。', score: 3 },
    },
  },
  水瓶: {
    daily: {
      summary: '灵感迸发的一天，创新想法值得记录。',
      love: { text: '做真实的自己，独特之处最吸引人。', score: 3 },
      career: { text: '打破常规的思路带来转机，善用科技。', score: 4 },
      health: { text: '注意小腿与循环，久坐后多走动。', score: 3 },
    },
    weekly: {
      summary: '本周宜革新与协作，人脉圈带来新契机。',
      love: { text: '在自由与亲密间找到平衡，感情更稳。', score: 3 },
      career: { text: '团队与创意结合，前瞻眼光受认可。', score: 4 },
      health: { text: '规律作息安抚活跃的大脑，助眠为先。', score: 3 },
    },
  },
  双鱼: {
    daily: {
      summary: '直觉柔软的一天，跟着感觉走常有惊喜。',
      love: { text: '浪漫与共情让感情升温，用心倾听。', score: 4 },
      career: { text: '创意与想象力是优势，别被杂事分心。', score: 3 },
      health: { text: '注意足部与免疫，情绪低落时多晒太阳。', score: 3 },
    },
    weekly: {
      summary: '本周灵感与情感丰沛，艺术与疗愈皆宜。',
      love: { text: '真诚流露情感，关系在温柔中加深。', score: 4 },
      career: { text: '发挥想象把点子落地，边界感帮你聚焦。', score: 3 },
      health: { text: '给情绪一个出口，冥想或独处都好。', score: 4 },
    },
  },
}

// 依 SIGN_TO_EN 之外无需网络。sign 无匹配时回退白羊（类型上不可达）。
export function createPresetProvider(): HoroscopeProvider {
  return {
    async fetchRaw(req: RawHoroscopeRequest): Promise<RawHoroscope> {
      const preset = PRESET[req.sign as Sign] ?? PRESET['白羊']
      const set = req.period === '每日' ? preset.daily : preset.weekly
      return {
        sign: req.sign,
        summary: set.summary,
        dimensions: [
          { name: '爱情', text: set.love.text, score: set.love.score },
          { name: '事业', text: set.career.text, score: set.career.score },
          { name: '健康', text: set.health.text, score: set.health.score },
        ],
      }
    },
  }
}
