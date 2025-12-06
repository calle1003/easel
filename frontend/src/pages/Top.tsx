import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface News {
  id: number;
  title: string;
  publishedAt: string;
  category: string;
}

export default function Top() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch news');
        return res.json();
      })
      .then((data) => {
        // 最新3件のみ取得
        setNews(data.slice(0, 3));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-warm-50">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-warm-100/50" />
        <div className="relative z-10 text-center px-6 py-32">
          <p className="section-subtitle mb-6">Theater Company</p>
          <img src="/easel_logo.png" alt="easel" className="h-32 md:h-44 w-auto mx-auto mb-8" />
          <Link
            to="/about"
            className="btn-secondary group"
          >
            <span>ABOUT US</span>
            <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Latest Performance */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-subtitle mb-4">Latest</p>
          <h2 className="section-title mb-8">VOL.2</h2>
          <p className="text-slate-500 leading-relaxed mb-14">
            easelの新作公演情報をお届けします。<br />
            チケットのご予約を受付中です。
          </p>
          <Link to="/easel-live/vol2" className="btn-primary">
            詳細を見る
          </Link>
        </div>
      </section>

      {/* News Section */}
      <section className="py-28 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-14">
            <h2 className="section-title">News</h2>
            <Link
              to="/news"
              className="text-sm tracking-wider text-slate-400 hover:text-slate-700 transition-colors duration-300 flex items-center gap-2"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-300 mx-auto" />
            </div>
          )}

          {!loading && news.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">
                最新のお知らせはありません
              </p>
            </div>
          )}

          {!loading && news.length > 0 && (
            <div className="divide-y divide-slate-200/50">
              {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="group block py-6 hover:bg-white/50 transition-colors duration-300 -mx-4 px-4 rounded-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <time className="text-xs text-slate-400">
                          {formatDate(item.publishedAt)}
                        </time>
                        {item.category && (
                          <span className="text-xs px-2 py-0.5 bg-slate-200/50 text-slate-500 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-slate-700 group-hover:translate-x-1 transition-transform duration-300">
                        {item.title}
                      </h3>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-slate-400 transition-colors duration-300 flex-shrink-0"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Links Section */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/easel-live"
            className="group p-10 border border-slate-100 rounded-2xl hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-300"
          >
            <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-3 group-hover:translate-x-1 transition-transform duration-300">
              easel LIVE
            </h3>
            <p className="text-sm text-slate-400">過去の公演アーカイブ</p>
          </Link>
          <Link
            to="/goods"
            className="group p-10 border border-slate-100 rounded-2xl hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-300"
          >
            <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-3 group-hover:translate-x-1 transition-transform duration-300">
              Goods
            </h3>
            <p className="text-sm text-slate-400">オフィシャルグッズ</p>
          </Link>
          <Link
            to="/contact"
            className="group p-10 border border-slate-100 rounded-2xl hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-300"
          >
            <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-3 group-hover:translate-x-1 transition-transform duration-300">
              Contact
            </h3>
            <p className="text-sm text-slate-400">お問い合わせ</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

