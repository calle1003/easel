import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Clock, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Ticket,
  Gift,
  Eye
} from 'lucide-react';
import { adminFetch } from '../../utils/adminApi';

// ============================================
// 型定義
// ============================================

interface TicketInfo {
  id: number;
  ticketCode: string;
  ticketType: 'GENERAL' | 'RESERVED';
  isExchanged: boolean;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
}

interface ExchangeCode {
  code: string;
  usedAt: string;
}

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
  tickets?: TicketInfo[];
  exchangeCodes?: ExchangeCode[];
  exchangeCodeList?: string[];
}

// ============================================
// メインコンポーネント
// ============================================

export default function TicketsAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PAID');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

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

  const toggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
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
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-600 rounded font-medium">
            <Check size={12} />
            支払済
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded font-medium">
            <Clock size={12} />
            決済待ち
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded font-medium">
            <X size={12} />
            キャンセル
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">
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
    totalTickets: orders
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + o.generalQuantity + o.reservedQuantity, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <Ticket size={20} className="text-slate-600" />
                <h1 className="text-xl font-medium text-slate-800">チケット管理</h1>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="更新"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">売上合計</p>
            <p className="text-xl font-medium text-slate-800">¥{stats.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">発行済みチケット</p>
            <p className="text-xl font-medium text-slate-800">{stats.totalTickets}枚</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">決済完了</p>
            <p className="text-xl font-medium text-green-600">{stats.paid}件</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">返金済</p>
            <p className="text-xl font-medium text-red-500">
              {orders.filter((o) => o.status === 'REFUNDED').length}件
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {['PAID', 'ALL', 'REFUNDED'].map((status) => (
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
               status === 'PAID' ? '発行済み' :
               status === 'REFUNDED' ? '返金済' : status}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-slate-400">読み込み中...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-400">注文がありません</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      注文ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      購入日時
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      顧客情報
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      公演日
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      購入枚数
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      合計金額
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      詳細
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <>
                      {/* Main Row */}
                      <tr 
                        key={order.id} 
                        className={`hover:bg-slate-50 transition-colors ${expandedOrderId === order.id ? 'bg-slate-50' : ''}`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-700">#{order.id}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">{formatShortDate(order.createdAt)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700">{order.customerName}</p>
                            <p className="text-xs text-slate-500">{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">
                            {order.performanceLabel || order.performanceDate}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">
                            {order.generalQuantity > 0 && (
                              <span>一般: {order.generalQuantity}枚</span>
                            )}
                            {order.generalQuantity > 0 && order.reservedQuantity > 0 && (
                              <span className="mx-1">/</span>
                            )}
                            {order.reservedQuantity > 0 && (
                              <span>指定: {order.reservedQuantity}枚</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              ¥{order.totalAmount.toLocaleString()}
                            </p>
                            {order.discountAmount > 0 && (
                              <p className="text-xs text-green-600">
                                -¥{order.discountAmount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <Eye size={16} />
                            {expandedOrderId === order.id ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {expandedOrderId === order.id && (
                        <tr key={`${order.id}-detail`}>
                          <td colSpan={8} className="px-4 py-4 bg-slate-50 border-b border-slate-200">
                            <div className="space-y-4">
                              {/* Order Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Customer Info */}
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">顧客情報</h4>
                                  <div className="space-y-1 text-sm">
                                    <p className="text-slate-700">{order.customerName}</p>
                                    <p className="text-slate-500">{order.customerEmail}</p>
                                    <p className="text-slate-500">{order.customerPhone}</p>
                                  </div>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">決済情報</h4>
                                  <div className="space-y-1 text-sm">
                                    <p className="text-slate-500">
                                      一般席: {order.generalQuantity}枚 × ¥{order.generalPrice.toLocaleString()}
                                    </p>
                                    {order.reservedQuantity > 0 && (
                                      <p className="text-slate-500">
                                        指定席: {order.reservedQuantity}枚 × ¥{order.reservedPrice.toLocaleString()}
                                      </p>
                                    )}
                                    {order.discountedGeneralCount > 0 && (
                                      <p className="text-green-600">
                                        引換券適用: {order.discountedGeneralCount}枚
                                      </p>
                                    )}
                                    {order.paidAt && (
                                      <p className="text-slate-500">
                                        決済完了: {formatDate(order.paidAt)}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">アクション</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {order.status === 'PENDING' && (
                                      <>
                                        <button
                                          onClick={() => handleStatusChange(order.id, 'PAID')}
                                          className="text-xs px-3 py-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                                        >
                                          支払済にする
                                        </button>
                                        <button
                                          onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                          className="text-xs px-3 py-1.5 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors"
                                        >
                                          キャンセル
                                        </button>
                                      </>
                                    )}
                                    {order.status === 'PAID' && (
                                      <button
                                        onClick={() => handleStatusChange(order.id, 'REFUNDED')}
                                        className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                      >
                                        返金済にする
                                      </button>
                                    )}
                                    {(order.status === 'CANCELLED' || order.status === 'REFUNDED') && (
                                      <span className="text-xs text-slate-400">操作なし</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Exchange Codes */}
                              {(order.exchangeCodeList && order.exchangeCodeList.length > 0) && (
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <Gift size={14} />
                                    使用した引換券
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {order.exchangeCodeList.map((code, idx) => (
                                      <span 
                                        key={idx}
                                        className="inline-flex items-center text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-mono"
                                      >
                                        {code}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tickets */}
                              {order.tickets && order.tickets.length > 0 && (
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <Ticket size={14} />
                                    発行済みチケット ({order.tickets.length}枚)
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {order.tickets.map((ticket) => (
                                      <div 
                                        key={ticket.id}
                                        className={`p-4 rounded-lg border ${
                                          ticket.isUsed 
                                            ? 'bg-slate-50 border-slate-200' 
                                            : 'bg-white border-slate-200'
                                        }`}
                                      >
                                        {/* Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                          <span className={`text-xs px-2 py-0.5 rounded ${
                                            ticket.ticketType === 'GENERAL'
                                              ? 'bg-blue-100 text-blue-600'
                                              : 'bg-purple-100 text-purple-600'
                                          }`}>
                                            {ticket.ticketType === 'GENERAL' ? '一般席' : '指定席'}
                                          </span>
                                          <span className={`text-xs ${
                                            ticket.isUsed ? 'text-slate-400' : 'text-green-600'
                                          }`}>
                                            {ticket.isUsed ? '入場済' : '未使用'}
                                          </span>
                                        </div>

                                        {/* QR Code */}
                                        <div className="bg-slate-50 rounded p-2 mb-3 flex items-center justify-center">
                                          <img
                                            src={`/api/qrcode/ticket/${ticket.ticketCode}`}
                                            alt="QRコード"
                                            className="w-32 h-32"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                            }}
                                          />
                                        </div>

                                        {/* Ticket Code */}
                                        <p className="text-xs font-mono text-slate-600 break-all mb-2">
                                          {ticket.ticketCode}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="space-y-1">
                                          {ticket.isExchanged && (
                                            <p className="text-xs text-amber-600 flex items-center gap-1">
                                              <Gift size={10} />
                                              引換券使用
                                            </p>
                                          )}
                                          {ticket.isUsed && ticket.usedAt && (
                                            <p className="text-xs text-slate-400">
                                              入場: {formatShortDate(ticket.usedAt)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* No Tickets Message */}
                              {(!order.tickets || order.tickets.length === 0) && order.status === 'PAID' && (
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <Ticket size={14} />
                                    チケット情報
                                  </h4>
                                  <p className="text-sm text-slate-400">
                                    チケット情報がありません（旧データまたは未発行）
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-4 text-sm text-slate-500 text-right">
          表示中: {filteredOrders.length}件 / 全{orders.length}件
        </div>
      </main>
    </div>
  );
}
