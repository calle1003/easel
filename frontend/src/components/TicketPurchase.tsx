import { useState } from 'react';
import { Ticket, Armchair } from 'lucide-react';

type TicketType = 'general' | 'reserved';

export default function TicketPurchase() {
  const [isLoading, setIsLoading] = useState<TicketType | null>(null);

  const handlePurchase = async (ticketType: TicketType) => {
    setIsLoading(ticketType);

    try {
      const response = await fetch('http://localhost:8080/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '決済画面への遷移に失敗しました');
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('決済URLが取得できませんでした');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '通信エラーが発生しました';
      alert(message);
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {/* 一般席ボタン */}
        <button
          onClick={() => handlePurchase('general')}
          disabled={isLoading !== null}
          className="w-full group relative overflow-hidden rounded-xl border border-slate-200 
                     bg-white p-6 text-left transition-all duration-300
                     hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full 
                            bg-slate-50 text-slate-600 transition-colors
                            group-hover:bg-slate-100">
              <Ticket size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg text-slate-800">一般席（自由席）</h3>
              <p className="text-sm text-slate-400">¥4,500</p>
            </div>
            <div className="text-slate-300 transition-transform group-hover:translate-x-1">
              {isLoading === 'general' ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              ) : (
                <span className="text-xl">→</span>
              )}
            </div>
          </div>
        </button>

        {/* 指定席ボタン */}
        <button
          onClick={() => handlePurchase('reserved')}
          disabled={isLoading !== null}
          className="w-full group relative overflow-hidden rounded-xl border border-slate-200 
                     bg-white p-6 text-left transition-all duration-300
                     hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full 
                            bg-warm-50 text-slate-600 transition-colors
                            group-hover:bg-warm-100">
              <Armchair size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg text-slate-800">指定席</h3>
              <p className="text-sm text-slate-400">¥5,500</p>
            </div>
            <div className="text-slate-300 transition-transform group-hover:translate-x-1">
              {isLoading === 'reserved' ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              ) : (
                <span className="text-xl">→</span>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* 注意書き */}
      <p className="mt-6 text-center text-xs text-slate-400">
        ボタンをクリックすると決済画面に移動します
      </p>
    </div>
  );
}

