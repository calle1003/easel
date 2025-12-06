import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <CheckCircle className="mx-auto mb-10 text-green-400" size={72} strokeWidth={1} />
        
        <h1 className="font-serif text-3xl md:text-4xl font-light tracking-[0.15em] text-slate-800 mb-8">
          ご購入ありがとうございます
        </h1>
        
        <p className="text-slate-500 leading-relaxed mb-6">
          決済が正常に完了しました。
        </p>
        
        <p className="text-slate-500 leading-relaxed mb-12">
          ご登録いただいたメールアドレスに確認メールをお送りしました。<br />
          当日会場でお待ちしております。
        </p>

        <div className="space-y-6">
          <Link to="/" className="btn-primary inline-flex items-center justify-center">
            トップページに戻る
          </Link>
        </div>

        {/* デバッグ用: session_id表示 */}
        {sessionId && (
          <p className="mt-16 text-xs text-slate-300 break-all">
            注文ID: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
}
