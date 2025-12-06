import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface News {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  category: string;
}

export default function List() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch news');
        return res.json();
      })
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
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
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-subtitle mb-4">News</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">News</h1>
        </div>
      </section>

      {/* News List */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 mx-auto" />
              <p className="mt-6 text-slate-400 text-sm">読み込み中...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-slate-400">ニュースを取得できませんでした</p>
            </div>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-400">ニュースはまだありません</p>
            </div>
          )}

          {!loading && !error && news.length > 0 && (
            <div className="divide-y divide-slate-100">
              {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="group block py-8 hover:bg-slate-50/50 transition-colors duration-300 -mx-6 px-6 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <time className="text-sm text-slate-400">
                          {formatDate(item.publishedAt)}
                        </time>
                        {item.category && (
                          <span className="text-xs px-3 py-1 bg-slate-100 text-slate-500 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <h2 className="font-serif text-lg tracking-wide text-slate-700 group-hover:translate-x-1 transition-transform duration-300">
                        {item.title}
                      </h2>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-200 group-hover:text-slate-400 transition-colors duration-300 flex-shrink-0 mt-2"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

