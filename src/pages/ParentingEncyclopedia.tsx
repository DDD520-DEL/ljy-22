import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Heart,
  Clock,
  Tag,
  Sparkles,
  Filter,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { PARENTING_ARTICLES, AGE_GROUP_LABELS, TOPIC_LABELS } from '@/data/parentingArticles';
import { useAppStore } from '@/store';
import type { AgeGroup, ArticleTopic, ParentingArticle } from '@/types';

const AGE_GROUP_OPTIONS: { value: AgeGroup | 'all'; label: string }[] = [
  { value: 'all', label: '全部年龄' },
  { value: 'newborn', label: AGE_GROUP_LABELS.newborn },
  { value: '0-3months', label: AGE_GROUP_LABELS['0-3months'] },
  { value: '4-6months', label: AGE_GROUP_LABELS['4-6months'] },
  { value: '7-12months', label: AGE_GROUP_LABELS['7-12months'] },
  { value: '1-2years', label: AGE_GROUP_LABELS['1-2years'] },
  { value: '2-3years', label: AGE_GROUP_LABELS['2-3years'] },
  { value: '3-6years', label: AGE_GROUP_LABELS['3-6years'] },
];

const TOPIC_OPTIONS: { value: ArticleTopic | 'all'; label: string }[] = [
  { value: 'all', label: '全部主题' },
  ...TOPIC_LABELS.map((t) => ({ value: t, label: t })),
];

export default function ParentingEncyclopedia() {
  const navigate = useNavigate();
  const { favoriteArticles, readArticles, toggleFavoriteArticle, getRandomUnreadArticle } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<ArticleTopic | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showReadFilter, setShowReadFilter] = useState(false);
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [recommendedArticle, setRecommendedArticle] = useState<ParentingArticle | null>(null);

  useEffect(() => {
    const rec = getRandomUnreadArticle(PARENTING_ARTICLES);
    setRecommendedArticle(rec);
  }, [getRandomUnreadArticle]);

  const filteredArticles = useMemo(() => {
    return PARENTING_ARTICLES.filter((article) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !article.title.toLowerCase().includes(q) &&
          !article.summary.toLowerCase().includes(q) &&
          !article.tags.some((t) => t.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      if (selectedAge !== 'all' && !article.ageGroups.includes(selectedAge)) {
        return false;
      }
      if (selectedTopic !== 'all' && !article.topics.includes(selectedTopic)) {
        return false;
      }
      if (showFavoritesOnly && !favoriteArticles.includes(article.id)) {
        return false;
      }
      if (readFilter === 'unread' && readArticles.includes(article.id)) {
        return false;
      }
      if (readFilter === 'read' && !readArticles.includes(article.id)) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedAge, selectedTopic, showFavoritesOnly, readFilter, favoriteArticles, readArticles]);

  const refreshRecommendation = () => {
    const rec = getRandomUnreadArticle(PARENTING_ARTICLES);
    setRecommendedArticle(rec);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">育儿百科</h1>
            <p className="text-gray-500 text-sm">精选育儿知识，科学陪伴成长</p>
          </div>
        </div>
      </div>

      {recommendedArticle && (
        <div className="mb-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">今日推荐 · 未读精选</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{recommendedArticle.title}</h2>
              <p className="text-sm opacity-90 mb-4 line-clamp-2">{recommendedArticle.summary}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/parenting/article/${recommendedArticle.id}`)}
                  className="px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-colors flex items-center gap-2"
                >
                  立即阅读
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={refreshRecommendation}
                  className="px-4 py-2 bg-white/20 rounded-lg font-medium hover:bg-white/30 transition-colors text-sm"
                >
                  换一篇
                </button>
              </div>
            </div>
            <div className="text-6xl opacity-30 ml-4 hidden sm:block">{recommendedArticle.coverEmoji}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文章标题、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value as AgeGroup | 'all')}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white text-sm"
            >
              {AGE_GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as ArticleTopic | 'all')}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white text-sm"
            >
              {TOPIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-2.5 rounded-xl border transition-all text-sm flex items-center gap-2 ${
                  showFavoritesOnly
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-rose-50'
                }`}
              >
                <Heart className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                已收藏
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowReadFilter(!showReadFilter)}
                  className="px-4 py-2.5 rounded-xl border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 transition-all text-sm flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  阅读状态
                </button>
                {showReadFilter && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10 min-w-[140px]">
                    {(['all', 'unread', 'read'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setReadFilter(opt);
                          setShowReadFilter(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          readFilter === opt ? 'text-violet-600 font-medium bg-violet-50' : 'text-gray-600'
                        }`}
                      >
                        {opt === 'all' ? '全部文章' : opt === 'unread' ? '仅看未读' : '仅看已读'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            共找到 <span className="text-violet-600 font-medium">{filteredArticles.length}</span> 篇文章
          </span>
          {readFilter !== 'all' && (
            <button
              onClick={() => setReadFilter('all')}
              className="text-violet-600 hover:underline"
            >
              清除阅读筛选
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => {
          const isFav = favoriteArticles.includes(article.id);
          const isRead = readArticles.includes(article.id);
          return (
            <div
              key={article.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => navigate(`/parenting/article/${article.id}`)}
            >
              <div className="h-32 bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center relative overflow-hidden">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {article.coverEmoji}
                </span>
                {isRead && (
                  <div className="absolute top-3 left-3 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    已读
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteArticle(article.id);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                    isFav
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/80 text-gray-500 hover:bg-rose-50 hover:text-rose-500'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {article.ageGroups.slice(0, 2).map((age) => (
                    <span
                      key={age}
                      className="text-xs px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full font-medium"
                    >
                      {AGE_GROUP_LABELS[age]}
                    </span>
                  ))}
                  {article.topics.slice(0, 1).map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.summary}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {article.tags.length}标签
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">没有找到符合条件的文章</h3>
          <p className="text-gray-400 text-sm">试试调整筛选条件或搜索关键词</p>
        </div>
      )}
    </div>
  );
}
