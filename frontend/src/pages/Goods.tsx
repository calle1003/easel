import { ExternalLink, ShoppingBag } from 'lucide-react';

export default function Goods() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-subtitle mb-4">Official</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">Goods</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="mx-auto mb-10 text-slate-200" size={72} strokeWidth={1} />
          
          <h2 className="section-title mb-10">オフィシャルグッズ</h2>
          
          <p className="text-slate-500 leading-relaxed mb-14">
            easelのオフィシャルグッズは<br />
            オンラインショップにてお買い求めいただけます。
          </p>

          <a
            href="https://hideandseek.shopselect.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary group"
          >
            <span>オンラインショップを見る</span>
            <ExternalLink size={16} className="ml-2" />
          </a>

          <p className="mt-8 text-sm text-slate-400">
            ※外部サイトへ移動します
          </p>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-28 px-6 bg-slate-50/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title mb-14 text-center">Featured Items</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
              href="https://hideandseek.shopselect.net/items/103511877"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="aspect-square bg-slate-100 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-slate-300 text-xs">IMAGE</span>
              </div>
              <p className="text-slate-700 text-center group-hover:text-slate-900 transition-colors">【Re - cored】<br />DVD・Blu-ray</p>
              <p className="text-sm text-slate-400 text-center">¥5,000</p>
            </a>
            <a
              href="https://hideandseek.shopselect.net/items/105881048"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="aspect-square bg-slate-100 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-slate-300 text-xs">IMAGE</span>
              </div>
              <p className="text-slate-700 text-center group-hover:text-slate-900 transition-colors">【easel live】<br />オーガニックコットンTシャツ（ナチュラル）</p>
              <p className="text-sm text-slate-400 text-center">¥4,000</p>
            </a>
            <a
              href="https://hideandseek.shopselect.net/items/107703869"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="aspect-square bg-slate-100 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-slate-300 text-xs">IMAGE</span>
              </div>
              <p className="text-slate-700 text-center group-hover:text-slate-900 transition-colors">【easel live】<br />オーガニックコットンTシャツ（ブラック）</p>
              <p className="text-sm text-slate-400 text-center">詳細はこちら</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

