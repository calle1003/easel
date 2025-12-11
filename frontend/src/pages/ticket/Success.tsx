import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Ticket as TicketIcon, Mail, Loader2, Gift } from 'lucide-react';

interface TicketInfo {
  id: number;
  ticketCode: string;
  ticketType: 'GENERAL' | 'RESERVED';
  isExchanged: boolean;
  isUsed: boolean;
}

interface OrderInfo {
  id: number;
  customerName: string;
  customerEmail: string;
  performanceLabel: string;
  generalQuantity: number;
  reservedQuantity: number;
  totalAmount: number;
  discountAmount: number;
  status: string;
  tickets: TicketInfo[];
}

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchOrderInfo(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchOrderInfo = async (sessionId: string) => {
    try {
      // Session IDから注文情報を取得
      const response = await fetch(`/api/orders/by-session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderInfo(data);
      } else {
        setError('注文情報の取得に失敗しました');
      }
    } catch (err) {
      console.error('Failed to fetch order info:', err);
      setError('注文情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="min-h-[400px] bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          <CheckCircle className="mx-auto mb-8 text-green-500" size={72} strokeWidth={1.5} />
          
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-[0.15em] text-slate-800 mb-6">
            ご購入ありがとうございます
          </h1>
          
          <p className="text-slate-600 leading-relaxed mb-4">
            決済が正常に完了しました。
          </p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-green-200 rounded-lg text-sm text-green-700">
            <Mail size={16} />
            <span>ご登録いただいたメールアドレスに確認メールをお送りしました</span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      {!error && orderInfo && (
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Order Summary */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
              注文情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">注文番号</p>
                <p className="text-slate-800 font-medium">#{orderInfo.id}</p>
              </div>
              <div>
                <p className="text-slate-500">お名前</p>
                <p className="text-slate-800 font-medium">{orderInfo.customerName}</p>
              </div>
              <div>
                <p className="text-slate-500">公演日時</p>
                <p className="text-slate-800 font-medium">{orderInfo.performanceLabel}</p>
              </div>
              <div>
                <p className="text-slate-500">お支払い金額</p>
                <p className="text-slate-800 font-medium text-lg">
                  ¥{orderInfo.totalAmount.toLocaleString()}
                  {orderInfo.discountAmount > 0 && (
                    <span className="text-green-600 text-sm ml-2">
                      (-¥{orderInfo.discountAmount.toLocaleString()})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Tickets */}
          {orderInfo.tickets && orderInfo.tickets.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                <TicketIcon size={16} />
                発行済みチケット ({orderInfo.tickets.length}枚)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orderInfo.tickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-xs px-3 py-1 rounded font-medium ${
                        ticket.ticketType === 'GENERAL'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {ticket.ticketType === 'GENERAL' ? '一般席' : '指定席'}
                      </span>
                      {ticket.isExchanged && (
                        <span className="text-xs px-3 py-1 rounded font-medium bg-amber-100 text-amber-600 flex items-center gap-1">
                          <Gift size={12} />
                          引換券使用
                        </span>
                      )}
                    </div>

                    {/* QR Code */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                      <img
                        src={`/api/qrcode/ticket/${ticket.ticketCode}`}
                        alt="QRコード"
                        className="w-48 h-48"
                        onError={(e) => {
                          // QRコード読み込み失敗時は非表示
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Ticket Code */}
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">チケットコード</p>
                      <p className="font-mono text-xs text-slate-600 break-all bg-slate-50 px-3 py-2 rounded border border-slate-200">
                        {ticket.ticketCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notice */}
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ ご注意</p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>このQRコードまたはチケットコードは入場時に必要です</li>
                  <li>スクリーンショットを保存するか、メールをご確認ください</li>
                  <li>チケットコードは他の方に共有しないでください</li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-12 text-center space-y-4">
            <Link 
              to="/" 
              className="inline-block px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
            >
              トップページに戻る
            </Link>
            <p className="text-sm text-slate-400">
              当日会場でお待ちしております
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-slate-500 mb-8">{error}</p>
          <Link 
            to="/" 
            className="inline-block px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      )}

      {/* No Session ID */}
      {!sessionId && !loading && (
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-slate-500 mb-4">
            決済が正常に完了しました。<br />
            確認メールをご確認ください。
          </p>
          <Link 
            to="/" 
            className="inline-block px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      )}
    </div>
  );
}
