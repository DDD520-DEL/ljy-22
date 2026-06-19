import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  Tag,
  Stethoscope,
  Syringe,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PARENTING_ARTICLES, AGE_GROUP_LABELS } from '@/data/parentingArticles';
import { useAppStore } from '@/store';
import { VACCINE_DEFINITIONS } from '@/data/vaccines';
import { CHECKUP_DEFINITIONS } from '@/data/checkups';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleFavoriteArticle, favoriteArticles, markArticleAsRead, isArticleRead } = useAppStore();

  const article = PARENTING_ARTICLES.find((a) => a.id === id);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    if (article && !isArticleRead(article.id)) {
      markArticleAsRead(article.id);
    }
    window.scrollTo(0, 0);
  }, [article, markArticleAsRead, isArticleRead]);

  if (!article) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/parenting')}
          className="flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回育儿百科
        </button>
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-medium text-gray-600 mb-2">文章未找到</h2>
          <p className="text-gray-400 mb-4">这篇文章可能已经被移除或不存在</p>
          <button
            onClick={() => navigate('/parenting')}
            className="px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
          >
            返回文章列表
          </button>
        </div>
      </div>
    );
  }

  const isFav = favoriteArticles.includes(article.id);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast('链接已复制到剪贴板');
        setTimeout(() => setShowToast(null), 2000);
      }
    } catch {
      // 用户取消分享
    }
  };

  const handleToggleFav = () => {
    toggleFavoriteArticle(article.id);
    setShowToast(isFav ? '已取消收藏' : '已添加到收藏夹');
    setTimeout(() => setShowToast(null), 2000);
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={key++}
            className="text-xl font-bold text-gray-800 mt-8 mb-4 pb-2 border-b-2 border-violet-100 flex items-center gap-2"
          >
            <span className="w-1 h-6 bg-violet-500 rounded-full flex-shrink-0" />
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-lg font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2">
            <span className="text-violet-500">▸</span>
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <p key={key++} className="text-base font-medium text-gray-700 my-3 bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
            {line.slice(2, -2)}
          </p>
        );
      } else if (line.startsWith('⚠️')) {
        elements.push(
          <div key={key++} className="my-4 p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700">{line.slice(2).replace(/\*\*/g, '')}</p>
          </div>
        );
      } else if (line.startsWith('✅')) {
        elements.push(
          <div key={key++} className="my-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700">{line.slice(2).replace(/\*\*/g, '')}</p>
          </div>
        );
      } else if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
        const isChecked = line.startsWith('- [x]');
        elements.push(
          <div key={key++} className="flex items-center gap-2 py-1.5 ml-4 text-gray-600">
            <div
              className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                isChecked ? 'bg-violet-500 border-violet-500' : 'border-gray-300'
              }`}
            >
              {isChecked && <span className="text-white text-xs">✓</span>}
            </div>
            <span>{line.slice(6)}</span>
          </div>
        );
      } else if (line.startsWith('- ')) {
        const text = line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-800 font-medium">$1</strong>');
        elements.push(
          <div key={key++} className="flex items-start gap-2 py-1.5 ml-4 text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: text }} />
          </div>
        );
      } else if (/^\d+\./.test(line)) {
        const match = line.match(/^(\d+)\.\s*(.*)/);
        if (match) {
          const text = match[2].replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-800 font-medium">$1</strong>');
          elements.push(
            <div key={key++} className="flex items-start gap-3 py-1.5 ml-4 text-gray-600">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {match[1]}
              </span>
              <span className="pt-0.5" dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          );
        }
      } else if (line.startsWith('---')) {
        elements.push(<hr key={key++} className="my-6 border-gray-100" />);
      } else if (line.trim() !== '') {
        elements.push(
          <p key={key++} className="my-3 text-gray-600 leading-relaxed text-base">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-xl animate-fade-in">
          {showToast}
        </div>
      )}

      <button
        onClick={() => navigate('/parenting')}
        className="flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回育儿百科
      </button>

      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 text-[200px] opacity-10">{article.coverEmoji}</div>
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.ageGroups.map((age) => (
              <span
                key={age}
                className="text-xs px-3 py-1 bg-white/20 backdrop-blur rounded-full font-medium"
              >
                {AGE_GROUP_LABELS[age]}
              </span>
            ))}
            {article.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs px-3 py-1 bg-white/20 backdrop-blur rounded-full font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{article.title}</h1>
          <p className="text-white/80 mb-5 text-sm md:text-base">{article.summary}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              阅读约 {article.readTime} 分钟
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              {article.tags.join(' · ')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl">
            {article.coverEmoji}
          </div>
          <div>
            <div className="text-sm text-gray-500">正在阅读</div>
            <div className="font-medium text-gray-800 text-sm">{article.title.split('：')[0]}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFav}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${
              isFav
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
            }`}
          >
            <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
            {isFav ? '已收藏' : '收藏文章'}
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            分享
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
        <article className="prose max-w-none">{renderContent(article.content)}</article>
      </div>

      {article.relatedCheckups.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Stethoscope className="w-5 h-5 text-sky-600" />
            </div>
            相关体检项目
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {article.relatedCheckups.map((checkup) => {
              const fullCheckup = CHECKUP_DEFINITIONS.find((c) => c.monthAge === checkup.monthAge);
              return (
                <div
                  key={checkup.monthAge}
                  className="p-4 bg-sky-50 rounded-xl border border-sky-100 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate('/checkup-schedule')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                        {checkup.monthAge}月
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{checkup.title}</div>
                        <div className="text-xs text-gray-500">建议按时完成</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-sky-500" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {checkup.keyItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-white text-sky-600 rounded-full border border-sky-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  {fullCheckup && (
                    <div className="mt-3 pt-3 border-t border-sky-100">
                      <div className="text-xs text-gray-500">
                        共 {fullCheckup.items.length} 项检查 ·{' '}
                        {fullCheckup.milestones.length} 项发育里程碑
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {article.relatedVaccines.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Syringe className="w-5 h-5 text-emerald-600" />
            </div>
            关联疫苗信息
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {article.relatedVaccines.map((vaccine) => {
              const fullVaccine = VACCINE_DEFINITIONS.find((v) => v.code === vaccine.vaccineCode);
              return (
                <div
                  key={`${vaccine.vaccineCode}-${vaccine.monthAge}`}
                  className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate('/vaccine-query')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                        💉
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{vaccine.shortName}</div>
                        <div className="text-xs text-gray-500">{vaccine.vaccineName}</div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        vaccine.category === '一类'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {vaccine.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>建议接种月龄：{vaccine.monthAge} 月龄</span>
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                  </div>
                  {fullVaccine && (
                    <div className="mt-3 pt-3 border-t border-emerald-100">
                      <div className="text-xs text-gray-500">预防：{fullVaccine.preventDisease}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/parenting')}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          浏览更多文章
        </button>
        <div className="flex items-center gap-2">
          {!isFav ? (
            <button
              onClick={handleToggleFav}
              className="px-5 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              收藏这篇文章
            </button>
          ) : (
            <button
              onClick={() => navigate('/favorites')}
              className="px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              查看我的收藏
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
