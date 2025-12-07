import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { OrderData } from './Purchase';

export default function Confirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state as OrderData | null;
  const [isLoading, setIsLoading] = useState(false);

  // 注文データがない場合は購入ページにリダイレクト
  if (!orderData) {
    return <Navigate to="/easel-live/vol2/ticket" replace />;
  }

  const {
    performanceId,
    date,
    dateLabel,
    hasExchangeCode,
    exchangeCodes,
    generalQuantity,
    reservedQuantity,
    generalPrice,
    reservedPrice,
    discountedGeneralCount,
    discountAmount,
    total,
    name,
    email,
    phone,
  } = orderData;

  // 入力画面に戻る（データを保持）
  const handleBack = () => {
    navigate('/easel-live/vol2/ticket', { state: orderData });
  };

  // Stripe決済セッションを作成してリダイレクト
  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 公演情報
          date,
          dateLabel,
          // チケット情報
          generalQuantity,
          reservedQuantity,
          discountedGeneralCount,
          // 引換券コード
          exchangeCodes: hasExchangeCode ? exchangeCodes : [],
          // 顧客情報
          name,
          email,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '決済セッションの作成に失敗しました');
      }

      // Stripe Checkoutページにリダイレクト
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : '決済処理中にエラーが発生しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto w-full">
          <nav className="mb-3">
            <Link to="/easel-live" className="text-xs tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              easel LIVE
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <Link to="/easel-live/vol2" className="text-xs tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              Vol.2
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <button onClick={handleBack} className="text-xs tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              Ticket
            </button>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-xs tracking-wider text-slate-500">確認</span>
          </nav>
          <div className="text-center">
            <p className="section-subtitle mb-4">Vol.2</p>
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">ご注文内容の確認</h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-slate-500 mb-14">
            以下の内容でよろしければ、決済へお進みください。
          </p>

          {/* Order Summary - Ticket Info */}
          <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h2 className="text-xs tracking-wider text-slate-500 uppercase">
                チケット情報
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-500">公演日時</span>
                <span className="text-slate-700">{dateLabel}</span>
              </div>
              {generalQuantity > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">一般席（自由席）</span>
                  <span className="text-slate-700">
                    {generalQuantity}枚 × ¥{generalPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {reservedQuantity > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">指定席</span>
                  <span className="text-slate-700">
                    {reservedQuantity}枚 × ¥{reservedPrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Exchange Code Info */}
          {hasExchangeCode && exchangeCodes.length > 0 && (
            <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <h2 className="text-xs tracking-wider text-slate-500 uppercase">
                  引換券コード
                </h2>
              </div>
              <div className="p-6 space-y-2">
                {exchangeCodes.map((code, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-slate-500">コード {index + 1}</span>
                    <span className="text-slate-700 font-mono">{code}</span>
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    ※引換券 {discountedGeneralCount}枚分の一般席が無料になります
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h2 className="text-xs tracking-wider text-slate-500 uppercase">
                お客様情報
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-500">お名前</span>
                <span className="text-slate-700">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">メールアドレス</span>
                <span className="text-slate-700">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">電話番号</span>
                <span className="text-slate-700">{phone}</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h2 className="text-xs tracking-wider text-slate-500 uppercase">
                お支払い金額
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {generalQuantity > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>一般席 × {generalQuantity}</span>
                  <span>
                    ¥{(generalQuantity * generalPrice).toLocaleString()}
                  </span>
                </div>
              )}
              {reservedQuantity > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>指定席 × {reservedQuantity}</span>
                  <span>
                    ¥{(reservedQuantity * reservedPrice).toLocaleString()}
                  </span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>引換券割引（{discountedGeneralCount}枚分）</span>
                  <span>-¥{discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="p-6 bg-slate-800 text-white rounded-xl mb-8">
            <div className="flex items-center justify-between">
              <span>お支払い合計</span>
              <span className="font-serif text-3xl">
                ¥{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading}
              className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '処理中...' : '決済へ進む（Stripe）'}
            </button>
            <p className="text-center text-sm text-slate-400">
              ※決済はStripeによる安全なクレジットカード決済です
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-4 text-center text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← 入力画面に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
