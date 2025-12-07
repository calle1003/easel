import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, RefreshCw } from 'lucide-react';
import { adminFetch } from '../../utils/adminApi';

interface Order {
  id: number;
  stripeSessionId: string;
  performanceDate: string;
  performanceLabel: string;
  generalQuantity: number;
  reservedQuantity: number;
  generalPrice: number;
  reservedPrice: number;
  discountedGeneralCount: number;
  discountAmount: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminFetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await adminFetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
            <Check size={12} />
            支払済
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded">
            <Clock size={12} />
            決済待ち
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded">
            <X size={12} />
            キャンセル
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
            <RefreshCw size={12} />
            返金済
          </span>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ALL') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.status === 'PAID').length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
    revenue: orders
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-medium text-slate-800">注文管理</h1>
            </div>
            <button
              onClick={fetchOrders}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="更新"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">売上合計</p>
            <p className="text-xl font-medium text-slate-800">¥{stats.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">総注文数</p>
            <p className="text-xl font-medium text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">支払済</p>
            <p className="text-xl font-medium text-green-600">{stats.paid}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">決済待ち</p>
            <p className="text-xl font-medium text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">キャンセル</p>
            <p className="text-xl font-medium text-slate-400">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {['ALL', 'PAID', 'PENDING', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === status
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'すべて' : 
               status === 'PAID' ? '支払済' :
               status === 'PENDING' ? '決済待ち' :
               status === 'CANCELLED' ? 'キャンセル' : status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg border border-slate-200">
          {loading ? (
            <div className="p-6 text-center text-slate-400">読み込み中...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-400">注文がありません</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(order.status)}
                        <span className="text-xs text-slate-400">
                          #{order.id} | {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <p className="font-medium text-slate-700">{order.customerName}</p>
                      <p className="text-sm text-slate-500">{order.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-800">
                        ¥{order.totalAmount.toLocaleString()}
                      </p>
                      {order.discountAmount > 0 && (
                        <p className="text-xs text-green-600">
                          割引: -¥{order.discountAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div>
                      <p>{order.performanceLabel || order.performanceDate}</p>
                      <p>
                        一般席 {order.generalQuantity}枚
                        {order.reservedQuantity > 0 && ` / 指定席 ${order.reservedQuantity}枚`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order.id, 'PAID')}
                            className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                          >
                            支払済にする
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                            className="text-xs px-3 py-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors"
                          >
                            キャンセル
                          </button>
                        </>
                      )}
                      {order.status === 'PAID' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'REFUNDED')}
                          className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          返金済にする
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

