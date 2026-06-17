import type { CheckupDefinition } from '@/types';

export const CHECKUP_DEFINITIONS: CheckupDefinition[] = [
  {
    monthAge: 0,
    milestones: ['首次母乳喂养', '保暖护理', '预防感染'],
    notes: ['出生后24小时内进行首次体检', '重点关注新生儿黄疸、脐带护理', '进行新生儿疾病筛查和听力筛查'],
    items: [
      { name: '皮肤颜色', category: '全身检查', description: '评估是否存在黄疸、发绀等' },
      { name: '心率', category: '全身检查', description: '正常120-160次/分' },
      { name: '呼吸', category: '全身检查', description: '正常40-60次/分' },
      { name: '肌张力', category: '发育评估', description: '评估四肢活动情况' },
      { name: '反射', category: '发育评估', description: '吸吮反射、握持反射、拥抱反射' },
      { name: '体重', category: '体格测量', description: '出生体重，正常2500-4000g' },
      { name: '身长', category: '体格测量', description: '出生身长，正常46-52cm' },
      { name: '头围', category: '体格测量', description: '出生头围，正常33-35cm' },
      { name: '前囟', category: '全身检查', description: '大小1.5-2cm，平坦或稍凹' },
      { name: '脐部', category: '全身检查', description: '脐带残端是否干燥、有无渗血感染' },
      { name: '先天性疾病筛查', category: '辅助检查', description: '苯丙酮尿症、先天性甲状腺功能低下' },
      { name: '听力筛查', category: '辅助检查', description: '耳声发射检查' }
    ]
  },
  {
    monthAge: 1,
    milestones: ['眼睛能跟随物体移动', '俯卧时能抬头', '对声音有反应', '会发出细小喉音'],
    notes: ['满月体检，评估生长发育情况', '指导补充维生素D（400IU/日）', '注意喂养方式和睡眠习惯'],
    items: [
      { name: '体重', category: '体格测量', description: '约4.0-5.0kg，较出生增长600-1200g' },
      { name: '身长', category: '体格测量', description: '约53-58cm，较出生增长3-5cm' },
      { name: '头围', category: '体格测量', description: '约36-38cm，较出生增长2-3cm' },
      { name: '胸围', category: '体格测量', description: '约35-37cm' },
      { name: '前囟', category: '全身检查', description: '大小2-2.5cm，平坦' },
      { name: '后囟', category: '全身检查', description: '已接近闭合或指尖大小' },
      { name: '皮肤', category: '全身检查', description: '有无皮疹、湿疹、感染' },
      { name: '颈部包块', category: '全身检查', description: '排除先天性斜颈' },
      { name: '心肺听诊', category: '全身检查', description: '心率、心律、呼吸音' },
      { name: '腹部', category: '全身检查', description: '有无腹胀、包块、脐疝' },
      { name: '髋关节', category: '全身检查', description: '外展试验，排除先天性髋关节脱位' },
      { name: '追视能力', category: '发育评估', description: '能追随红球过中线' },
      { name: '听力反应', category: '发育评估', description: '对说话声、铃声有反应' },
      { name: '抬头能力', category: '发育评估', description: '俯卧时能抬头1-2秒' }
    ]
  },
  {
    monthAge: 2,
    milestones: ['抬头45°-90°', '能发出"a、o"等元音', '开始微笑', '眼睛能跟随180°'],
    notes: ['监测生长速度，评估喂养情况', '继续维生素D补充', '开始互动交流，促进感知发育'],
    items: [
      { name: '体重', category: '体格测量', description: '约5.0-6.5kg，月增长700-800g' },
      { name: '身长', category: '体格测量', description: '约57-62cm，月增长3-4cm' },
      { name: '头围', category: '体格测量', description: '约38-40cm，月增长1.5-2cm' },
      { name: '胸围', category: '体格测量', description: '约38-40cm' },
      { name: '前囟', category: '全身检查', description: '大小2-2.5cm' },
      { name: '枕秃', category: '全身检查', description: '评估是否存在维生素D缺乏征象' },
      { name: '心肺听诊', category: '全身检查', description: '排除先天性心脏病' },
      { name: '腹部', category: '全身检查', description: '有无腹股沟疝、肝脾肿大' },
      { name: '外生殖器', category: '全身检查', description: '评估发育情况' },
      { name: '抬头', category: '发育评估', description: '俯卧位抬头45°-90°' },
      { name: '追视', category: '发育评估', description: '水平及垂直追视180°' },
      { name: '社交微笑', category: '发育评估', description: '逗引时能微笑' },
      { name: '发音', category: '发育评估', description: '能发出元音' }
    ]
  },
  {
    monthAge: 3,
    milestones: ['稳定抬头90°', '能翻身（仰卧→侧卧）', '会咿呀发音', '认识母亲', '双手能握物'],
    notes: ['开始翻身训练，注意安全防护', '训练手眼协调，提供抓握玩具', '坚持户外活动，促进钙吸收'],
    items: [
      { name: '体重', category: '体格测量', description: '约6.0-7.5kg，月增长600-700g' },
      { name: '身长', category: '体格测量', description: '约60-65cm，月增长2-3cm' },
      { name: '头围', category: '体格测量', description: '约40-41cm，月增长1-1.5cm' },
      { name: '胸围', category: '体格测量', description: '约40-41cm' },
      { name: '前囟', category: '全身检查', description: '大小1.5-2cm' },
      { name: '颅骨', category: '全身检查', description: '排除颅骨软化' },
      { name: '心肺听诊', category: '全身检查', description: '正常心肺体征' },
      { name: '髋关节', category: '全身检查', description: '外展试验复查' },
      { name: '翻身', category: '发育评估', description: '能从仰卧翻至侧卧' },
      { name: '握持反射', category: '发育评估', description: '握持反射应消失' },
      { name: '手眼协调', category: '发育评估', description: '能主动抓握面前玩具' },
      { name: '社交', category: '发育评估', description: '能辨认母亲，眼神交流' }
    ]
  },
  {
    monthAge: 4,
    milestones: ['能从仰卧翻到俯卧', '抬头稳定', '能大笑出声', '伸手抓物', '能支撑坐片刻'],
    notes: ['翻身期注意防坠床', '准备添加辅食信号观察', '多交流促进语言发育'],
    items: [
      { name: '体重', category: '体格测量', description: '约6.5-8.5kg，月增长500-600g' },
      { name: '身长', category: '体格测量', description: '约63-68cm，月增长2-3cm' },
      { name: '头围', category: '体格测量', description: '约41-43cm，月增长1cm左右' },
      { name: '胸围', category: '体格测量', description: '约41-43cm' },
      { name: '前囟', category: '全身检查', description: '大小1.5-2cm' },
      { name: '出牙情况', category: '全身检查', description: '部分宝宝开始出牙' },
      { name: '心脏', category: '全身检查', description: '听诊有无杂音' },
      { name: '生殖器', category: '全身检查', description: '男婴睾丸是否下降' },
      { name: '翻身能力', category: '发育评估', description: '能完成仰卧→俯卧' },
      { name: '抓握能力', category: '发育评估', description: '主动伸手抓物，两手交换' },
      { name: '语言', category: '发育评估', description: '能大笑，咿呀对话' }
    ]
  },
  {
    monthAge: 6,
    milestones: ['会坐', '能翻滚', '会无意识叫"爸/妈"', '开始吃辅食', '能辨别人生'],
    notes: ['6月龄是关键发育节点', '正式添加辅食，从含铁米粉开始', '出牙期口腔护理'],
    items: [
      { name: '体重', category: '体格测量', description: '约7.5-9.5kg，为出生2倍' },
      { name: '身长', category: '体格测量', description: '约66-71cm' },
      { name: '头围', category: '体格测量', description: '约43-45cm' },
      { name: '胸围', category: '体格测量', description: '约43-45cm，接近头围' },
      { name: '上臂围', category: '体格测量', description: '评估营养状况' },
      { name: '前囟', category: '全身检查', description: '大小1-2cm' },
      { name: '乳牙萌出', category: '全身检查', description: '多为下中切牙2颗' },
      { name: '心脏', category: '全身检查', description: '排除病理性杂音' },
      { name: '腹部', category: '全身检查', description: '肝脾大小' },
      { name: '独坐能力', category: '发育评估', description: '能独坐片刻或靠坐' },
      { name: '认知', category: '发育评估', description: '会找藏起的玩具，怕生' },
      { name: '语言', category: '发育评估', description: '无意识发"爸、妈"音' },
      { name: '精细动作', category: '发育评估', description: '能抓小物品、两手传递' },
      { name: '血常规', category: '辅助检查', description: '筛查缺铁性贫血' },
      { name: '辅食指导', category: '其他', description: '添加辅食原则：从少到多、从稀到稠' }
    ]
  },
  {
    monthAge: 9,
    milestones: ['会爬', '能扶站', '会拍手/再见', '能叫"爸爸妈妈"有意识', '拇指食指对捏'],
    notes: ['爬行期安全防护', '扶站时注意腿部发育', '丰富辅食种类，锻炼咀嚼'],
    items: [
      { name: '体重', category: '体格测量', description: '约8.5-10.5kg' },
      { name: '身长', category: '体格测量', description: '约70-75cm' },
      { name: '头围', category: '体格测量', description: '约44-46cm' },
      { name: '胸围', category: '体格测量', description: '约44-46cm' },
      { name: '坐高', category: '体格测量', description: '评估躯干与下肢比例' },
      { name: '乳牙数', category: '全身检查', description: '约2-5颗' },
      { name: '前囟', category: '全身检查', description: '大小1-1.5cm' },
      { name: '骨骼', category: '全身检查', description: '有无肋骨串珠、方颅等佝偻病体征' },
      { name: '爬行', category: '发育评估', description: '能手膝爬行' },
      { name: '站立', category: '发育评估', description: '能扶物站立' },
      { name: '语言', category: '发育评估', description: '有意识叫爸妈，懂得"不"' },
      { name: '精细动作', category: '发育评估', description: '拇指食指捏取小丸' },
      { name: '社交', category: '发育评估', description: '会做欢迎、再见等动作' },
      { name: '血常规', category: '辅助检查', description: '复查贫血情况' }
    ]
  },
  {
    monthAge: 12,
    milestones: ['能独站/走几步', '能说3-5个字', '能表示大小便', '能指认物品', '会搭积木2-3块'],
    notes: ['1岁是重要里程碑', '开始学习走路，注意防护', '培养自主进食习惯'],
    items: [
      { name: '体重', category: '体格测量', description: '约9.5-11.5kg，为出生3倍' },
      { name: '身长', category: '体格测量', description: '约74-80cm' },
      { name: '头围', category: '体格测量', description: '约45-47cm' },
      { name: '胸围', category: '体格测量', description: '约45-47cm，超过头围' },
      { name: '出牙数', category: '全身检查', description: '约6-8颗' },
      { name: '前囟', category: '全身检查', description: '部分已闭合，正常1-1.5岁闭合' },
      { name: '心肺听诊', category: '全身检查', description: '正常' },
      { name: '腿部发育', category: '全身检查', description: '有无O型/X型腿' },
      { name: '独站/行走', category: '发育评估', description: '能独站，部分能独走' },
      { name: '语言', category: '发育评估', description: '会说2-3个字的词语' },
      { name: '精细动作', category: '发育评估', description: '会搭积木，能翻书' },
      { name: '社交', category: '发育评估', description: '会配合穿衣，能表达需求' },
      { name: '智力筛查', category: '辅助检查', description: 'DDST发育筛查' },
      { name: '血常规', category: '辅助检查', description: '贫血筛查' }
    ]
  },
  {
    monthAge: 18,
    milestones: ['独立行走稳', '能跑', '会说5-10个字词', '能说自己名字', '能自己吃饭'],
    notes: ['开始语言爆发期，多对话交流', '培养良好的生活习惯', '防意外伤害（烧烫伤、药物等）'],
    items: [
      { name: '体重', category: '体格测量', description: '约10-13kg' },
      { name: '身长', category: '体格测量', description: '约79-86cm' },
      { name: '头围', category: '体格测量', description: '约46-48cm' },
      { name: '胸围', category: '体格测量', description: '约46-49cm' },
      { name: '出牙数', category: '全身检查', description: '约10-16颗' },
      { name: '前囟', category: '全身检查', description: '应已闭合' },
      { name: '心肺', category: '全身检查', description: '听诊正常' },
      { name: '步态', category: '全身检查', description: '行走平稳' },
      { name: '语言', category: '发育评估', description: '会说简单句，能说10个以上词' },
      { name: '大运动', category: '发育评估', description: '能跑步、倒退走' },
      { name: '精细动作', category: '发育评估', description: '会叠3-4块积木，模仿画线条' },
      { name: '认知', category: '发育评估', description: '能指认身体部位，认识常见物品' },
      { name: '大便潜血', category: '辅助检查', description: '排除肠道疾病' }
    ]
  },
  {
    monthAge: 24,
    milestones: ['能双脚跳', '会说完整句子', '能说50个字以上', '会自己脱衣服', '认识5种颜色'],
    notes: ['2岁语言发育关键期', '培养社交能力，学习分享', '建立规律作息时间'],
    items: [
      { name: '体重', category: '体格测量', description: '约11-14kg' },
      { name: '身长', category: '体格测量', description: '约84-92cm' },
      { name: '头围', category: '体格测量', description: '约47-49cm，脑重达成人80%' },
      { name: '胸围', category: '体格测量', description: '约48-51cm' },
      { name: '乳牙', category: '全身检查', description: '应出齐20颗' },
      { name: '心肺', category: '全身检查', description: '正常' },
      { name: '视力', category: '全身检查', description: '粗略筛查' },
      { name: '语言', category: '发育评估', description: '会说2-3字句子，词汇量>50' },
      { name: '大运动', category: '发育评估', description: '能双脚跳，上下楼梯' },
      { name: '精细动作', category: '发育评估', description: '能一页页翻书，搭6-7块积木' },
      { name: '社交', category: '发育评估', description: '能和小朋友一起玩，表达情绪' },
      { name: '认知', category: '发育评估', description: '认识颜色，能数1-10' }
    ]
  },
  {
    monthAge: 30,
    milestones: ['能单脚站', '骑三轮车', '会说复杂句', '能自己穿简单衣服', '会洗手刷牙'],
    notes: ['2岁半，准备入园前评估', '继续培养生活自理能力', '加强安全教育'],
    items: [
      { name: '体重', category: '体格测量', description: '约12-15kg' },
      { name: '身长', category: '体格测量', description: '约88-97cm' },
      { name: '头围', category: '体格测量', description: '约48-50cm' },
      { name: '胸围', category: '体格测量', description: '约50-53cm' },
      { name: '牙齿', category: '全身检查', description: '20颗乳牙，开始口腔检查' },
      { name: '大运动', category: '发育评估', description: '能单脚站立5秒，骑三轮车' },
      { name: '语言', category: '发育评估', description: '词汇量>200，会说长句' },
      { name: '精细动作', category: '发育评估', description: '会画圆、画十字，叠8块积木' },
      { name: '认知', category: '发育评估', description: '能辨大小、长短、多少' },
      { name: '自理能力', category: '发育评估', description: '会穿鞋袜，自己吃饭' }
    ]
  },
  {
    monthAge: 36,
    milestones: ['能单脚跳', '会说儿歌故事', '能自己穿衣', '能数到20', '认识基本形状'],
    notes: ['3岁入园体检', '全面评估入园适应能力', '视力筛查、口腔涂氟'],
    items: [
      { name: '体重', category: '体格测量', description: '约13-16kg' },
      { name: '身高', category: '体格测量', description: '约93-102cm' },
      { name: '头围', category: '体格测量', description: '约48.5-50.5cm' },
      { name: '胸围', category: '体格测量', description: '约51-54cm' },
      { name: '视力筛查', category: '辅助检查', description: '约0.5-0.6' },
      { name: '听力筛查', category: '辅助检查', description: '纯音测听' },
      { name: '牙齿检查', category: '全身检查', description: '有无龋齿，涂氟保护' },
      { name: '血常规', category: '辅助检查', description: '血红蛋白、白细胞等' },
      { name: '肝功能', category: '辅助检查', description: 'ALT等' },
      { name: '大运动', category: '发育评估', description: '能单脚跳，两脚交替下楼' },
      { name: '语言', category: '发育评估', description: '会说完整故事，词汇量>500' },
      { name: '精细动作', category: '发育评估', description: '会画人3个部位，模仿折纸' },
      { name: '社交', category: '发育评估', description: '能与小朋友合作游戏' },
      { name: '入园评估', category: '其他', description: '评估生活自理、社交、情绪' }
    ]
  },
  {
    monthAge: 48,
    milestones: ['能跳绳', '会写简单数字', '能讲故事', '能独立穿脱衣服', '有时间概念'],
    notes: ['4岁幼儿园中班', '注意视力保护', '预防龋齿'],
    items: [
      { name: '体重', category: '体格测量', description: '约15-19kg' },
      { name: '身高', category: '体格测量', description: '约100-110cm' },
      { name: '视力', category: '辅助检查', description: '约0.7-0.8' },
      { name: '口腔', category: '全身检查', description: '乳牙开始替换准备' },
      { name: '大运动', category: '发育评估', description: '能并脚跳远，单脚站立10秒' },
      { name: '精细动作', category: '发育评估', description: '会写数字，画人5个部位' },
      { name: '语言', category: '发育评估', description: '会组词造句，语言流利' },
      { name: '认知', category: '发育评估', description: '能数到100，认识四季' },
      { name: '社交', category: '发育评估', description: '懂得分享和轮流' }
    ]
  },
  {
    monthAge: 60,
    milestones: ['能拍球接反弹球', '认识500个以上字', '能做10以内加减', '会系鞋带', '能帮忙做家务'],
    notes: ['5岁幼儿园大班', '开始为入学做准备', '换牙期口腔护理'],
    items: [
      { name: '体重', category: '体格测量', description: '约17-22kg' },
      { name: '身高', category: '体格测量', description: '约107-118cm' },
      { name: '视力', category: '辅助检查', description: '≥0.8-1.0' },
      { name: '口腔', category: '全身检查', description: '第一恒磨牙是否萌出' },
      { name: '大运动', category: '发育评估', description: '能跳绳，拍球连续10次以上' },
      { name: '精细动作', category: '发育评估', description: '能系鞋带，画完整的人' },
      { name: '语言', category: '发育评估', description: '能复述故事，表达清晰' },
      { name: '认知', category: '发育评估', description: '能做20以内加减，认识钱币' },
      { name: '生活能力', category: '发育评估', description: '能独立完成日常洗漱穿衣' }
    ]
  },
  {
    monthAge: 72,
    milestones: ['能骑自行车', '会看钟表', '阅读简单故事书', '独立整理书包', '入学准备完成'],
    notes: ['6岁入学前体检', '评估入学准备情况', '生长发育综合评价'],
    items: [
      { name: '体重', category: '体格测量', description: '约19-25kg' },
      { name: '身高', category: '体格测量', description: '约113-125cm' },
      { name: '视力', category: '辅助检查', description: '≥1.0' },
      { name: '血压', category: '体格测量', description: '开始测量血压' },
      { name: '口腔', category: '全身检查', description: '检查恒牙萌出及龋齿情况' },
      { name: '血常规', category: '辅助检查', description: '入学常规体检' },
      { name: '肝功能', category: '辅助检查', description: '入学常规体检' },
      { name: '入学评估', category: '其他', description: '学习能力、注意力、社交能力综合评估' },
      { name: '发育总评', category: '其他', description: '生长发育、智力、心理综合评价' }
    ]
  }
];
