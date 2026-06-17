import type { VaccineDefinition } from '@/types';

export const VACCINE_DEFINITIONS: VaccineDefinition[] = [
  {
    code: 'BCG',
    name: '卡介苗',
    shortName: 'BCG',
    preventDisease: '结核病',
    route: '皮内注射',
    category: '一类',
    contraindications: ['早产儿体重<2500g', '先天性胸腺发育不全', '湿疹或皮肤病'],
    commonReactions: ['接种后2-3周出现小硬结', '局部红肿、化脓', '同侧腋下淋巴结轻度肿大'],
    doses: [
      { doseNumber: 1, monthAgeMin: 0, monthAgeMax: 3, recommendedMonthAge: 0, site: '左上臂三角肌外下缘' }
    ]
  },
  {
    code: 'HepB',
    name: '乙型肝炎疫苗',
    shortName: '乙肝疫苗',
    preventDisease: '乙型病毒性肝炎',
    route: '肌内注射',
    category: '一类',
    contraindications: ['对酵母或疫苗成分过敏', '急性发热性疾病', '严重慢性病急性发作'],
    commonReactions: ['接种部位疼痛、红肿', '一过性发热（<38℃）', '头痛、乏力'],
    doses: [
      { doseNumber: 1, monthAgeMin: 0, monthAgeMax: 1, recommendedMonthAge: 0, site: '右上臂三角肌' },
      { doseNumber: 2, monthAgeMin: 1, monthAgeMax: 2, recommendedMonthAge: 1, site: '右上臂三角肌', intervalAfterPrevious: 28 },
      { doseNumber: 3, monthAgeMin: 6, monthAgeMax: 8, recommendedMonthAge: 6, site: '右上臂三角肌', intervalAfterPrevious: 60 }
    ]
  },
  {
    code: 'OPV',
    name: '脊髓灰质炎减毒活疫苗',
    shortName: '脊灰疫苗',
    preventDisease: '脊髓灰质炎（小儿麻痹症）',
    route: '口服',
    category: '一类',
    contraindications: ['免疫缺陷者', '正在使用免疫抑制剂', '对牛奶及乳制品过敏', '急性胃肠道疾病'],
    commonReactions: ['偶有发热', '轻微腹泻', '皮疹'],
    doses: [
      { doseNumber: 1, monthAgeMin: 2, monthAgeMax: 3, recommendedMonthAge: 2, site: '口服' },
      { doseNumber: 2, monthAgeMin: 3, monthAgeMax: 4, recommendedMonthAge: 3, site: '口服', intervalAfterPrevious: 28 },
      { doseNumber: 3, monthAgeMin: 4, monthAgeMax: 5, recommendedMonthAge: 4, site: '口服', intervalAfterPrevious: 28 }
    ]
  },
  {
    code: 'IPV',
    name: '脊髓灰质炎灭活疫苗',
    shortName: '脊灰灭活',
    preventDisease: '脊髓灰质炎（小儿麻痹症）',
    route: '肌内注射',
    category: '一类',
    contraindications: ['对新霉素、链霉素过敏', '急性发热性疾病'],
    commonReactions: ['接种部位疼痛、红肿', '一过性发热', '烦躁不安'],
    doses: [
      { doseNumber: 4, monthAgeMin: 48, monthAgeMax: 54, recommendedMonthAge: 48, site: '左上臂三角肌' }
    ]
  },
  {
    code: 'DTaP',
    name: '吸附无细胞百白破联合疫苗',
    shortName: '百白破',
    preventDisease: '百日咳、白喉、破伤风',
    route: '肌内注射',
    category: '一类',
    contraindications: ['有神经系统疾病史', '对疫苗成分过敏', '急性发热性疾病'],
    commonReactions: ['接种部位红肿、硬结、疼痛', '一过性发热', '烦躁、食欲减退'],
    doses: [
      { doseNumber: 1, monthAgeMin: 3, monthAgeMax: 4, recommendedMonthAge: 3, site: '左上臂三角肌' },
      { doseNumber: 2, monthAgeMin: 4, monthAgeMax: 5, recommendedMonthAge: 4, site: '左上臂三角肌', intervalAfterPrevious: 28 },
      { doseNumber: 3, monthAgeMin: 5, monthAgeMax: 6, recommendedMonthAge: 5, site: '左上臂三角肌', intervalAfterPrevious: 28 },
      { doseNumber: 4, monthAgeMin: 18, monthAgeMax: 20, recommendedMonthAge: 18, site: '左上臂三角肌', intervalAfterPrevious: 180 }
    ]
  },
  {
    code: 'DTaP-IPV-Hib',
    name: '五联疫苗（百白破+脊灰+Hib）',
    shortName: '五联疫苗',
    preventDisease: '百日咳、白喉、破伤风、脊髓灰质炎、流感嗜血杆菌感染',
    route: '肌内注射',
    category: '二类',
    contraindications: ['对疫苗成分过敏', '有进行性神经系统疾病', '急性发热性疾病'],
    commonReactions: ['接种部位红肿、疼痛', '一过性发热（<39℃）', '哭闹、食欲下降'],
    doses: [
      { doseNumber: 1, monthAgeMin: 2, monthAgeMax: 3, recommendedMonthAge: 2, site: '大腿前外侧' },
      { doseNumber: 2, monthAgeMin: 3, monthAgeMax: 4, recommendedMonthAge: 3, site: '大腿前外侧', intervalAfterPrevious: 28 },
      { doseNumber: 3, monthAgeMin: 4, monthAgeMax: 5, recommendedMonthAge: 4, site: '大腿前外侧', intervalAfterPrevious: 28 },
      { doseNumber: 4, monthAgeMin: 18, monthAgeMax: 20, recommendedMonthAge: 18, site: '上臂三角肌', intervalAfterPrevious: 180 }
    ]
  },
  {
    code: 'Hib',
    name: 'B型流感嗜血杆菌结合疫苗',
    shortName: 'Hib疫苗',
    preventDisease: 'B型流感嗜血杆菌引起的肺炎、脑膜炎、败血症等',
    route: '肌内注射',
    category: '二类',
    contraindications: ['对疫苗成分过敏', '急性严重发热性疾病'],
    commonReactions: ['接种部位红肿、触痛', '低热', '食欲不振'],
    doses: [
      { doseNumber: 1, monthAgeMin: 2, monthAgeMax: 3, recommendedMonthAge: 2, site: '大腿前外侧' },
      { doseNumber: 2, monthAgeMin: 3, monthAgeMax: 4, recommendedMonthAge: 3, site: '大腿前外侧', intervalAfterPrevious: 28 },
      { doseNumber: 3, monthAgeMin: 4, monthAgeMax: 5, recommendedMonthAge: 4, site: '大腿前外侧', intervalAfterPrevious: 28 },
      { doseNumber: 4, monthAgeMin: 18, monthAgeMax: 20, recommendedMonthAge: 18, site: '上臂三角肌', intervalAfterPrevious: 180 }
    ]
  },
  {
    code: 'PCV13',
    name: '13价肺炎球菌多糖结合疫苗',
    shortName: '13价肺炎',
    preventDisease: '13种血清型肺炎球菌引起的肺炎、脑膜炎、败血症等',
    route: '肌内注射',
    category: '二类',
    contraindications: ['对疫苗成分过敏', '急性严重发热性疾病', '免疫功能受损'],
    commonReactions: ['接种部位红肿、硬结、疼痛', '发热（38-39℃）', '食欲下降、易激惹'],
    doses: [
      { doseNumber: 1, monthAgeMin: 2, monthAgeMax: 3, recommendedMonthAge: 2, site: '大腿前外侧' },
      { doseNumber: 2, monthAgeMin: 4, monthAgeMax: 5, recommendedMonthAge: 4, site: '大腿前外侧', intervalAfterPrevious: 56 },
      { doseNumber: 3, monthAgeMin: 6, monthAgeMax: 7, recommendedMonthAge: 6, site: '大腿前外侧', intervalAfterPrevious: 56 },
      { doseNumber: 4, monthAgeMin: 12, monthAgeMax: 15, recommendedMonthAge: 12, site: '上臂三角肌' }
    ]
  },
  {
    code: 'Rotavirus',
    name: '口服轮状病毒活疫苗',
    shortName: '轮状病毒',
    preventDisease: '轮状病毒引起的婴幼儿腹泻',
    route: '口服',
    category: '二类',
    contraindications: ['有肠套叠病史', '先天性腹部异常', '免疫缺陷', '急性胃肠炎'],
    commonReactions: ['轻微腹泻', '偶有呕吐', '一过性低热'],
    doses: [
      { doseNumber: 1, monthAgeMin: 2, monthAgeMax: 3, recommendedMonthAge: 2, site: '口服' },
      { doseNumber: 2, monthAgeMin: 3, monthAgeMax: 4, recommendedMonthAge: 3, site: '口服', intervalAfterPrevious: 28 },
      { doseNumber: 3, monthAgeMin: 4, monthAgeMax: 5, recommendedMonthAge: 4, site: '口服', intervalAfterPrevious: 28 }
    ]
  },
  {
    code: 'MR',
    name: '麻腮风联合减毒活疫苗',
    shortName: '麻腮风',
    preventDisease: '麻疹、流行性腮腺炎、风疹',
    route: '皮下注射',
    category: '一类',
    contraindications: ['对鸡蛋或疫苗成分过敏', '免疫缺陷者', '孕妇', '急性发热性疾病'],
    commonReactions: ['接种后6-12天出现一过性发热', '皮疹', '颈部淋巴结轻微肿大'],
    doses: [
      { doseNumber: 1, monthAgeMin: 8, monthAgeMax: 9, recommendedMonthAge: 8, site: '上臂外侧三角肌下缘' },
      { doseNumber: 2, monthAgeMin: 18, monthAgeMax: 20, recommendedMonthAge: 18, site: '上臂外侧三角肌下缘' }
    ]
  },
  {
    code: 'Varicella',
    name: '水痘减毒活疫苗',
    shortName: '水痘疫苗',
    preventDisease: '水痘-带状疱疹病毒感染',
    route: '皮下注射',
    category: '二类',
    contraindications: ['对新霉素过敏', '免疫缺陷者', '孕妇', '急性发热性疾病'],
    commonReactions: ['接种部位红肿、疼痛', '轻微发热', '偶有局部皮疹'],
    doses: [
      { doseNumber: 1, monthAgeMin: 12, monthAgeMax: 15, recommendedMonthAge: 12, site: '上臂外侧三角肌下缘' },
      { doseNumber: 2, monthAgeMin: 48, monthAgeMax: 72, recommendedMonthAge: 48, site: '上臂外侧三角肌下缘' }
    ]
  },
  {
    code: 'JE',
    name: '流行性乙型脑炎减毒活疫苗',
    shortName: '乙脑减毒',
    preventDisease: '流行性乙型脑炎',
    route: '皮下注射',
    category: '一类',
    contraindications: ['对疫苗成分过敏', '免疫缺陷者', '急性发热性疾病', '严重慢性病'],
    commonReactions: ['接种部位红肿、疼痛', '一过性发热', '偶有皮疹'],
    doses: [
      { doseNumber: 1, monthAgeMin: 8, monthAgeMax: 9, recommendedMonthAge: 8, site: '上臂外侧三角肌下缘' },
      { doseNumber: 2, monthAgeMin: 24, monthAgeMax: 26, recommendedMonthAge: 24, site: '上臂外侧三角肌下缘' }
    ]
  },
  {
    code: 'MenA',
    name: 'A群脑膜炎球菌多糖疫苗',
    shortName: 'A群流脑',
    preventDisease: 'A群脑膜炎球菌引起的流行性脑脊髓膜炎',
    route: '皮下注射',
    category: '一类',
    contraindications: ['对疫苗成分过敏', '急性发热性疾病', '严重慢性病', '脑病或精神病'],
    commonReactions: ['接种部位红肿、疼痛', '低热', '偶有过敏反应'],
    doses: [
      { doseNumber: 1, monthAgeMin: 6, monthAgeMax: 7, recommendedMonthAge: 6, site: '上臂外侧三角肌下缘' },
      { doseNumber: 2, monthAgeMin: 9, monthAgeMax: 10, recommendedMonthAge: 9, site: '上臂外侧三角肌下缘', intervalAfterPrevious: 90 }
    ]
  },
  {
    code: 'MenAC',
    name: 'A群C群脑膜炎球菌多糖疫苗',
    shortName: 'A+C流脑',
    preventDisease: 'A群和C群脑膜炎球菌引起的流行性脑脊髓膜炎',
    route: '皮下注射',
    category: '一类',
    contraindications: ['对疫苗成分过敏', '急性发热性疾病', '严重慢性病'],
    commonReactions: ['接种部位红晕、压痛', '短暂发热', '偶有头痛、恶心'],
    doses: [
      { doseNumber: 1, monthAgeMin: 36, monthAgeMax: 38, recommendedMonthAge: 36, site: '上臂外侧三角肌下缘' },
      { doseNumber: 2, monthAgeMin: 72, monthAgeMax: 74, recommendedMonthAge: 72, site: '上臂外侧三角肌下缘', intervalAfterPrevious: 1095 }
    ]
  },
  {
    code: 'HepA',
    name: '甲型肝炎减毒活疫苗',
    shortName: '甲肝减毒',
    preventDisease: '甲型病毒性肝炎',
    route: '皮下注射',
    category: '一类',
    contraindications: ['免疫缺陷者', '孕妇', '急性发热性疾病', '严重慢性病'],
    commonReactions: ['接种部位疼痛、红肿', '低热', '轻微胃肠道反应'],
    doses: [
      { doseNumber: 1, monthAgeMin: 18, monthAgeMax: 20, recommendedMonthAge: 18, site: '上臂外侧三角肌下缘' }
    ]
  },
  {
    code: 'Influenza',
    name: '季节性流感疫苗',
    shortName: '流感疫苗',
    preventDisease: '流行性感冒',
    route: '肌内注射',
    category: '二类',
    contraindications: ['对鸡蛋或疫苗成分严重过敏', '急性发热性疾病', '慢性病急性发作', '吉兰-巴雷综合征病史'],
    commonReactions: ['接种部位疼痛、红肿', '低热', '肌肉酸痛', '头痛乏力'],
    doses: [
      { doseNumber: 1, monthAgeMin: 6, monthAgeMax: 7, recommendedMonthAge: 6, site: '大腿前外侧' },
      { doseNumber: 2, monthAgeMin: 7, monthAgeMax: 8, recommendedMonthAge: 7, site: '大腿前外侧', intervalAfterPrevious: 28 }
    ]
  },
  {
    code: 'HandFootMouth',
    name: '肠道病毒71型灭活疫苗',
    shortName: '手足口(EV71)',
    preventDisease: 'EV71病毒引起的手足口病',
    route: '肌内注射',
    category: '二类',
    contraindications: ['对疫苗成分过敏', '急性发热性疾病', '严重慢性疾病'],
    commonReactions: ['接种部位红肿、疼痛', '一过性发热', '食欲不振、烦躁'],
    doses: [
      { doseNumber: 1, monthAgeMin: 6, monthAgeMax: 7, recommendedMonthAge: 6, site: '上臂三角肌' },
      { doseNumber: 2, monthAgeMin: 7, monthAgeMax: 8, recommendedMonthAge: 7, site: '上臂三角肌', intervalAfterPrevious: 28 }
    ]
  },
  {
    code: 'DT',
    name: '吸附白喉破伤风联合疫苗',
    shortName: '白破疫苗',
    preventDisease: '白喉、破伤风',
    route: '肌内注射',
    category: '一类',
    contraindications: ['对疫苗成分过敏', '急性发热性疾病', '神经系统疾病史'],
    commonReactions: ['接种部位红肿、硬结', '低热', '头痛、全身不适'],
    doses: [
      { doseNumber: 1, monthAgeMin: 72, monthAgeMax: 74, recommendedMonthAge: 72, site: '上臂三角肌' }
    ]
  }
];
