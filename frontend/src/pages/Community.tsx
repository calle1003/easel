import { MessageCircle, Heart, Users } from 'lucide-react';

export default function Community() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-subtitle mb-4">Community</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">Community</h1>
        </div>
      </section>

      {/* Description */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-600 leading-loose mb-20">
            easelを応援してくださる皆様のための<br />
            コミュニティスペースです。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 border border-slate-100 rounded-xl">
              <MessageCircle className="mx-auto mb-6 text-slate-300" size={36} strokeWidth={1.5} />
              <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-2">口コミ</h3>
              <p className="text-sm text-slate-400">公演の感想を共有</p>
            </div>
            <div className="p-10 border border-slate-100 rounded-xl">
              <Heart className="mx-auto mb-6 text-slate-300" size={36} strokeWidth={1.5} />
              <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-2">応援</h3>
              <p className="text-sm text-slate-400">ファンの声を届ける</p>
            </div>
            <div className="p-10 border border-slate-100 rounded-xl">
              <Users className="mx-auto mb-6 text-slate-300" size={36} strokeWidth={1.5} />
              <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-2">交流</h3>
              <p className="text-sm text-slate-400">ファン同士のつながり</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-28 px-6 bg-slate-50/50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-serif text-2xl tracking-wider text-slate-300 mb-6">
            Coming Soon
          </p>
          <p className="text-slate-400">
            コミュニティ機能は現在準備中です。<br />
            今しばらくお待ちください。
          </p>
        </div>
      </section>
    </div>
  );
}

