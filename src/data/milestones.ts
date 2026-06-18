import type { MilestoneChecklistDefinition, DevelopmentDimension, MilestoneAssessment } from '@/types';

export const DEVELOPMENT_DIMENSIONS: DevelopmentDimension[] = ['大运动', '精细动作', '语言', '社交'];

export const MILESTONE_CHECKLISTS: MilestoneChecklistDefinition[] = [
  {
    monthAge: 0,
    title: '新生儿期发育自查',
    dimensions: {
      '大运动': ['四肢屈曲呈屈曲姿势', '俯卧时头能偏向一侧', '仰卧时四肢有自发活动'],
      '精细动作': ['双手紧握拳', '触碰手心时出现握持反射'],
      '语言': ['能发出响亮的哭声', '对突然声响有惊吓反应'],
      '社交': ['眼睛能短暂注视人脸或光源', '被抱起时能安静下来'],
    },
  },
  {
    monthAge: 1,
    title: '满月发育自查',
    dimensions: {
      '大运动': ['俯卧时能抬头片刻', '竖抱时头能短暂竖直'],
      '精细动作': ['触碰手心能主动握住物品', '双手偶尔能张开'],
      '语言': ['能发出细小喉音（啊、哦）', '哭声有不同含义'],
      '社交': ['眼睛能跟随移动的人脸', '对逗引有面部表情反应'],
    },
  },
  {
    monthAge: 2,
    title: '2月龄发育自查',
    dimensions: {
      '大运动': ['俯卧抬头约45°', '竖抱时头能竖直片刻'],
      '精细动作': ['双手能主动张开', '能握住玩具片刻'],
      '语言': ['能发出"a、o"等元音', '会咿呀发音'],
      '社交': ['出现社交性微笑', '眼睛能跟随物体移动180°'],
    },
  },
  {
    monthAge: 3,
    title: '3月龄发育自查',
    dimensions: {
      '大运动': ['俯卧稳定抬头90°', '能从仰卧翻身至侧卧'],
      '精细动作': ['双手能握住玩具', '双手能碰在一起'],
      '语言': ['会咿呀连串发音', '能笑出声'],
      '社交': ['能辨认母亲', '喜欢与人交流逗笑'],
    },
  },
  {
    monthAge: 4,
    title: '4月龄发育自查',
    dimensions: {
      '大运动': ['能从仰卧翻到俯卧', '扶坐时头能稳定竖直'],
      '精细动作': ['能主动伸手抓物', '双手能相互传递物品'],
      '语言': ['能大笑出声', '对呼唤名字有反应'],
      '社交': ['能辨认生人与熟人', '喜欢照镜子'],
    },
  },
  {
    monthAge: 6,
    title: '6月龄发育自查',
    dimensions: {
      '大运动': ['能独坐片刻', '能翻身滚转'],
      '精细动作': ['能抓取小物品', '两手能传递物品'],
      '语言': ['会无意识叫"爸/妈"', '能发出连续辅音'],
      '社交': ['能辨别人生（认生）', '会主动伸手要抱'],
    },
  },
  {
    monthAge: 9,
    title: '9月龄发育自查',
    dimensions: {
      '大运动': ['能手膝爬行', '能扶物站立'],
      '精细动作': ['能用拇指食指对捏小物品', '能双手对敲玩具'],
      '语言': ['能有意识叫"爸爸妈妈"', '懂得"不"的含义'],
      '社交': ['会做拍手、再见等动作', '会模仿成人动作'],
    },
  },
  {
    monthAge: 12,
    title: '12月龄发育自查',
    dimensions: {
      '大运动': ['能独自站立', '能扶走或独走几步'],
      '精细动作': ['会搭积木2-3块', '能用拇指食指捏取小丸'],
      '语言': ['能说3-5个有意义的字', '能听懂简单指令'],
      '社交': ['会指认想要的物品', '能配合穿衣'],
    },
  },
  {
    monthAge: 18,
    title: '18月龄发育自查',
    dimensions: {
      '大运动': ['独立行走平稳', '能跑步'],
      '精细动作': ['会叠3-4块积木', '能模仿画线条'],
      '语言': ['会说5-10个字词', '能说出自己的名字'],
      '社交': ['能自己用勺吃饭', '会主动表达需求'],
    },
  },
  {
    monthAge: 24,
    title: '2岁发育自查',
    dimensions: {
      '大运动': ['能双脚同时跳起', '能上下楼梯'],
      '精细动作': ['能一页页翻书', '能搭6-7块积木'],
      '语言': ['会说2-3字短句', '词汇量超过50个'],
      '社交': ['会自己脱外衣', '能与同伴一起玩耍'],
    },
  },
  {
    monthAge: 30,
    title: '2岁半发育自查',
    dimensions: {
      '大运动': ['能单脚站立片刻', '能骑三轮车'],
      '精细动作': ['会画圆形和十字', '能叠8块积木'],
      '语言': ['会说较复杂的句子', '词汇量超过200个'],
      '社交': ['会自己穿简单衣物', '会洗手、刷牙'],
    },
  },
  {
    monthAge: 36,
    title: '3岁发育自查',
    dimensions: {
      '大运动': ['能单脚跳', '能两脚交替上下楼梯'],
      '精细动作': ['会画人有3个部位', '能模仿折纸'],
      '语言': ['能讲述简单故事', '词汇量超过500个'],
      '社交': ['能自己穿衣', '能与小朋友合作游戏'],
    },
  },
  {
    monthAge: 48,
    title: '4岁发育自查',
    dimensions: {
      '大运动': ['能并脚跳远', '能单脚站立10秒'],
      '精细动作': ['会写简单数字', '能画人有5个部位'],
      '语言': ['能组词造句', '语言表达流利'],
      '社交': ['懂得分享与轮流', '能独立穿脱衣服'],
    },
  },
  {
    monthAge: 60,
    title: '5岁发育自查',
    dimensions: {
      '大运动': ['能跳绳', '能连续拍球10次以上'],
      '精细动作': ['会系鞋带', '能画一个完整的人'],
      '语言': ['能复述完整故事', '表达清晰有条理'],
      '社交': ['能独立完成日常洗漱', '会帮忙做简单家务'],
    },
  },
  {
    monthAge: 72,
    title: '6岁发育自查',
    dimensions: {
      '大运动': ['能骑两轮自行车', '运动协调性好'],
      '精细动作': ['会看钟表认时间', '能书写工整'],
      '语言': ['能阅读简单故事书', '表达完整连贯'],
      '社交': ['能独立整理书包', '具备基本入学准备能力'],
    },
  },
];

export function getMilestoneChecklist(monthAge: number): MilestoneChecklistDefinition | undefined {
  return MILESTONE_CHECKLISTS.find((c) => c.monthAge === monthAge);
}

export function getNearestMilestoneChecklist(monthAge: number): MilestoneChecklistDefinition {
  let nearest = MILESTONE_CHECKLISTS[0];
  let minDiff = Math.abs(monthAge - nearest.monthAge);

  for (let i = 1; i < MILESTONE_CHECKLISTS.length; i++) {
    const current = MILESTONE_CHECKLISTS[i];
    const diff = Math.abs(monthAge - current.monthAge);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = current;
    } else if (diff === minDiff && current.monthAge < nearest.monthAge) {
      nearest = current;
    }
  }

  return nearest;
}

export function getDimensionItemCount(checklist: MilestoneChecklistDefinition, dimension: DevelopmentDimension): number {
  return checklist.dimensions[dimension].length;
}

export function computeDimensionScores(
  checklist: MilestoneChecklistDefinition,
  checkedItems: Record<DevelopmentDimension, string[]>
): Record<DevelopmentDimension, number> {
  const scores = {} as Record<DevelopmentDimension, number>;
  for (const dim of DEVELOPMENT_DIMENSIONS) {
    const total = checklist.dimensions[dim].length;
    const checked = checkedItems[dim]?.length ?? 0;
    scores[dim] = total > 0 ? Math.round((checked / total) * 100) : 0;
  }
  return scores;
}

export function computeTotalScore(
  checklist: MilestoneChecklistDefinition,
  checkedItems: Record<DevelopmentDimension, string[]>
): number {
  let totalItems = 0;
  let totalChecked = 0;
  for (const dim of DEVELOPMENT_DIMENSIONS) {
    totalItems += checklist.dimensions[dim].length;
    totalChecked += checkedItems[dim]?.length ?? 0;
  }
  return totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;
}

export function getAssessmentLevel(totalScore: number): MilestoneAssessment['level'] {
  if (totalScore >= 90) return '优秀';
  if (totalScore >= 75) return '良好';
  if (totalScore >= 60) return '需关注';
  return '建议复查';
}

export function buildAssessmentSummary(
  scores: Record<DevelopmentDimension, number>,
  totalScore: number
): string {
  const weakDims = DEVELOPMENT_DIMENSIONS.filter((d) => scores[d] < 60);
  const strongDims = DEVELOPMENT_DIMENSIONS.filter((d) => scores[d] >= 80);

  if (totalScore >= 90) {
    return `宝宝各维度发育均衡且表现优秀${strongDims.length === 4 ? '，四大维度均达到同龄优秀水平' : ''}，继续保持良好的互动与锻炼。`;
  }
  if (totalScore >= 75) {
    if (weakDims.length > 0) {
      return `宝宝整体发育良好，综合得分${totalScore}分，其中${weakDims.join('、')}维度可加强日常训练。`;
    }
    return `宝宝整体发育良好，综合得分${totalScore}分，各维度均衡发展。`;
  }
  if (totalScore >= 60) {
    return `宝宝部分能力仍需关注，综合得分${totalScore}分，建议加强${weakDims.join('、') || '相关'}维度的训练与观察。`;
  }
  return `宝宝当前发育自查综合得分${totalScore}分，多项能力未达标，建议到儿保科进行专业发育评估与指导。`;
}

export function createEmptyCheckedItems(): Record<DevelopmentDimension, string[]> {
  return {
    '大运动': [],
    '精细动作': [],
    '语言': [],
    '社交': [],
  };
}

