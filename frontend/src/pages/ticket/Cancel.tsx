import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function Cancel() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto mb-10 text-amber-400" size={72} strokeWidth={1} />
        
        <h1 className="font-serif text-3xl md:text-4xl font-light tracking-[0.15em] text-slate-800 mb-8">
          決済がキャンセルされました
        </h1>
        
        <p className="text-slate-500 leading-relaxed mb-12">
          購入手続きは中断されました。<br />
          請求は発生していません。
        </p>

        <div className="space-y-4">
          <Link to="/easel-live/vol2/ticket" className="btn-primary w-full justify-center">
            チケット購入ページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
