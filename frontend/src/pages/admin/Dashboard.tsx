import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, Ticket, ShoppingCart, TrendingUp, LogOut, User, Scan } from 'lucide-react';
import { adminFetch, logout, getCurrentUser } from '../../utils/adminApi';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalTickets: number;
  totalGeneralTickets: number;
  totalReservedTickets: number;
  totalDiscountedTickets: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminFetch('/api/orders/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    {
      title: '入場チェック',
      description: 'QRコードスキャンで入場処理',
      icon: Scan,
      path: '/admin/check-in',
      color: 'bg-red-500',
      featured: true,
    },
    {
      title: 'ニュース管理',
      description: 'ニュース記事の作成・編集・削除',
      icon: Newspaper,
      path: '/admin/news',
      color: 'bg-blue-500',
    },
    {
      title: '公演管理',
      description: '公演情報の作成・編集・削除',
      icon: Calendar,
      path: '/admin/performances',
      color: 'bg-purple-500',
    },
    {
      title: '引換券コード管理',
      description: '引換券コードの発行・確認',
      icon: Ticket,
      path: '/admin/exchange-codes',
      color: 'bg-green-500',
    },
    {
      title: 'チケット管理',
      description: '発行済みチケットの確認',
      icon: Ticket,
      path: '/admin/tickets',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-slate-800">easel 管理画面</h1>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User size={16} />
                  <span>{user.name}</span>
                </div>
              )}
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
                サイトに戻る
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        {!loading && stats && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              売上概要
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">売上合計</p>
                <p className="text-2xl font-medium text-slate-800">
                  ¥{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">注文数</p>
                <p className="text-2xl font-medium text-slate-800">{stats.totalOrders}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">販売チケット数</p>
                <p className="text-2xl font-medium text-slate-800">{stats.totalTickets}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">引換券使用</p>
                <p className="text-2xl font-medium text-slate-800">{stats.totalDiscountedTickets}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <h2 className="text-sm font-medium text-slate-500 mb-4">管理メニュー</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`bg-white p-6 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all flex items-start gap-4 ${
                item.featured ? 'md:col-span-2 border-red-200 bg-red-50' : ''
              }`}
            >
              <div className={`${item.color} p-3 rounded-lg`}>
                <item.icon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 flex items-center gap-2">
                  {item.title}
                  {item.featured && (
                    <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded">NEW</span>
                  )}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
