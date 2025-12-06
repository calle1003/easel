import { Link } from 'react-router-dom';

export default function Vol2Detail() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto w-full">
          <nav className="mb-3">
            <Link to="/easel-live" className="text-xs tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              easel LIVE
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-xs tracking-wider text-slate-500">Vol.2</span>
          </nav>
          <div className="text-center">
            <p className="section-subtitle mb-4">easel LIVE</p>
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">
              VOL.2
            </h1>
          </div>
        </div>
      </section>

      {/* Flyer */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="section-title mb-10 text-center">Flyer</h2>
          <div className="aspect-[3/4] bg-slate-100 rounded-lg flex items-center justify-center">
            <p className="text-slate-300 text-sm tracking-wider">Coming Soon</p>
          </div>
        </div>
      </section>

      {/* Date */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title mb-10 text-center">Date</h2>
          <div className="text-center text-slate-400">
            <p>Coming Soon</p>
          </div>
        </div>
      </section>

      {/* Place */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title mb-10">Place</h2>
          <div className="text-slate-400">
            <p>Coming Soon</p>
          </div>
        </div>
      </section>

      {/* Price & Ticket */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title mb-10">Ticket</h2>
          <div className="mb-10">
            <p className="text-slate-400 mb-6">Coming Soon</p>
          </div>
          <Link to="/easel-live/vol2/ticket" className="btn-primary">
            チケットを購入する
          </Link>
        </div>
      </section>

      {/* Painter */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title mb-10 text-center">Painter</h2>
          <div className="text-center text-slate-400">
            <p>Coming Soon</p>
          </div>
        </div>
      </section>

      {/* Choreographer */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title mb-10 text-center">Choreographer</h2>
          <div className="text-center text-slate-400">
            <p>Coming Soon</p>
          </div>
        </div>
      </section>

      {/* Navigator & Guest */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
            <div>
              <h2 className="text-xs tracking-wider text-slate-400 uppercase mb-6">Navigator</h2>
              <p className="text-slate-400">Coming Soon</p>
            </div>
            <div>
              <h2 className="text-xs tracking-wider text-slate-400 uppercase mb-6">Guest Dancer</h2>
              <p className="text-slate-400">Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title mb-10 text-center">Staff</h2>
          <div className="text-center text-slate-400">
            <p>Coming Soon</p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="section-title mb-10">Photo Gallery</h2>
          <p className="text-slate-400">Coming Soon</p>
        </div>
      </section>
    </div>
  );
}
