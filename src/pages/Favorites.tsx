import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Clock,
  Tag,
  Search,
  ChevronRight,
  Eye,
  BookOpen,
  Trash2,
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

export default function Favorites() {
  const navigate = useNavigate();
  const { favoriteArticles, readArticles, toggleFavoriteArticle } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<ArticleTopic | 'all'>('all');

  const favoriteArticleList = useMemo(() => {
    const articles = PARENTING_ARTICLES.filter((a) => favoriteArticles.includes(a.id));

    return articles.filter((article) => {
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
      return true;
    });
  }, [searchQuery, selectedAge, selectedTopic, favoriteArticles]);

  const stats = useMemo(() => {
    const total = favoriteArticles.length;
    const read = favoriteArticles.filter((id) => readArticles.includes(id)).length;
    const topics = new Set<string>();
    favoriteArticles.forEach((id) => {
      const article = PARENTING_ARTICLES.find((a) => a.id === id);
      if (article) article.topics.forEach((t) => topics.add(t));
    });
    return { total, read, unread: total - read, topics: topics.size };
  }, [favoriteArticles, readArticles]);

  const handleRemoveFavorite = (e: React.MouseEvent, article: ParentingArticle) => {
    e.stopPropagation();
    if (confirm(`确定要取消收藏《${article.title}》吗？`)) {
      toggleFavoriteArticle(article.id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl text-white shadow-lg">
            <Heart className="w-6 h-6" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">我的收藏</h1>
            <p className="text-gray-500 text-sm">随时回顾你收藏的优质育儿知识</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">收藏总数</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-xs text-gray-400 mt-1">篇文章</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">已阅读</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Eye className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.read}</div>
          <div className="text-xs text-gray-400 mt-1">篇 · 完成度 {stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0}%</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">待阅读</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.unread}</div>
          <div className="text-xs text-gray-400 mt-1">篇 · 点击即可阅读</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-violet-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">覆盖主题</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Tag className="w-4 h-4 text-violet-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.topics}</div>
          <div className="text-xs text-gray-400 mt-1">个育儿主题</div>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索收藏的文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value as AgeGroup | 'all')}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none bg-white text-sm"
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
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none bg-white text-sm"
              >
                {TOPIC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => navigate('/parenting')}
                className="px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all text-sm flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                浏览更多
              </button>
            </div>
          </div>
        </div>
      )}

      {stats.total === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-7xl mb-4">💝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">收藏夹还是空的</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            在育儿百科中看到感兴趣的文章，点击文章卡片右上角的爱心图标，就可以把它收藏到这里，方便以后随时查阅。
          </p>
          <button
            onClick={() => navigate('/parenting')}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2 mx-auto"
          >
            <BookOpen className="w-5 h-5" />
            去浏览育儿百科
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : favoriteArticleList.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">没有找到符合条件的收藏文章</h3>
          <p className="text-gray-400 text-sm">试试调整筛选条件或搜索关键词</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteArticleList.map((article) => {
            const isRead = readArticles.includes(article.id);
            return (
              <div
                key={article.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer border border-rose-50"
                onClick={() => navigate(`/parenting/article/${article.id}`)}
              >
                <div className="h-32 bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 flex items-center justify-center relative overflow-hidden">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {article.coverEmoji}
                  </span>
                  {isRead && (
                    <div className="absolute top-3 left-3 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      已读
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button
                      onClick={(e) => handleRemoveFavorite(e, article)}
                      className="p-2 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                      title="取消收藏"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {article.ageGroups.slice(0, 2).map((age) => (
                      <span
                        key={age}
                        className="text-xs px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-medium"
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
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
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
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
