import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function EaselLiveTop() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-subtitle mb-4">Live</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">
            easel LIVE
          </h1>
        </div>
      </section>

      {/* About easel Live */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title mb-14 text-center">easel Liveとは</h2>
          <div className="text-center text-slate-600 leading-loose space-y-6">
            <p className="font-serif text-xl text-slate-700">
              『踊りだす絵画、響きあう感性』
            </p>
            <p>
              ダンス×絵画、表現の魅力を深めるひととき。
            </p>
            <p>
              第一線で活躍する現代アーティストとダンサーが共鳴し、<br />
              絵画から生まれるダンスパフォーマンスで彩る、<br />
              展覧会型ダンス公演。
            </p>
          </div>
        </div>
      </section>

      {/* Archive */}
      <section className="py-28 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title mb-14 text-center">Archive</h2>
          
          <div className="space-y-6">
            {/* Vol.2 */}
            <Link
              to="/easel-live/vol2"
              className="group block p-8 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-wider text-slate-400 mb-2">2025</p>
                  <h3 className="font-serif text-2xl tracking-wider text-slate-700 mb-2">Vol.2</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-slate-700 transition-colors duration-300">
                  <span className="tracking-wider">NOW ON SALE</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Vol.1 */}
            <Link
              to="/easel-live/vol1"
              className="group block p-8 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-wider text-slate-400 mb-2">2024</p>
                  <h3 className="font-serif text-2xl tracking-wider text-slate-700 mb-2">Vol.1</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-slate-700 transition-colors duration-300">
                  <span className="tracking-wider">ARCHIVE</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

