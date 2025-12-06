import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Image } from 'lucide-react';

const flyers = [
  { src: '/easelLiveVol1/easel_live_vol1_flyer_IguchiMaiko.jpg', alt: 'Iguchi Maiko', name: '井口舞子' },
  { src: '/easelLiveVol1/easel_live_vol1_flyer_KikuchiTakumi.jpg', alt: 'Kikuchi Takumi', name: '菊地匠' },
  { src: '/easelLiveVol1/easel_live_vol1_flyer_MatsumuraSaki.jpg', alt: 'Matsumura Saki', name: '松村咲希' },
];

export default function Vol1Detail() {
  const [currentFlyer, setCurrentFlyer] = useState(0);

  const prevFlyer = () => {
    setCurrentFlyer((prev) => (prev === 0 ? flyers.length - 1 : prev - 1));
  };

  const nextFlyer = () => {
    setCurrentFlyer((prev) => (prev === flyers.length - 1 ? 0 : prev + 1));
  };

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
            <span className="text-xs tracking-wider text-slate-500">Vol.1</span>
          </nav>
          <div className="text-center">
            <p className="section-subtitle mb-4">easel LIVE</p>
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">
              VOL.1
            </h1>
          </div>
        </div>
      </section>

      {/* Flyer */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="section-title mb-10 text-center">Flyer</h2>
          
          <div className="relative">
            {/* Image with fade transition */}
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              {flyers.map((flyer, index) => (
                <img 
                  key={index}
                  src={flyer.src}
                  alt={flyer.alt}
                  className={`w-full h-auto transition-all duration-500 ${
                    index === currentFlyer 
                      ? 'opacity-100 scale-100 relative' 
                      : 'opacity-0 scale-95 absolute inset-0'
                  }`}
                />
              ))}
            </div>
            
            {/* Name */}
            <p className="text-center text-sm text-slate-500 mt-6">{flyers[currentFlyer].name}</p>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevFlyer}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="前へ"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={nextFlyer}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="次へ"
            >
              <ChevronRight size={32} />
            </button>
            
            {/* Dots */}
            <div className="flex justify-center gap-3 mt-6">
              {flyers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFlyer(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFlyer 
                      ? 'bg-slate-700 w-6' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`スライド ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Date */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title mb-10 text-center">Date</h2>
          
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-6 text-center">
              <p className="font-serif text-lg text-slate-700 mb-2">2025/5/10 (Sat)</p>
              <p className="text-sm text-slate-500">
                ロビー開場 17:00 / 客席開場 17:30 / 開演 17:50
              </p>
            </div>
            <div className="border-b border-slate-100 pb-6 text-center">
              <p className="font-serif text-lg text-slate-700 mb-2">2025/5/11 (Sun)</p>
              <p className="text-sm text-slate-500">
                ロビー開場 11:00 / 客席開場 11:30 / 開演 12:00
              </p>
            </div>
            <div className="border-b border-slate-100 pb-6 text-center">
              <p className="font-serif text-lg text-slate-700 mb-2">2025/5/11 (Sun)</p>
              <p className="text-sm text-slate-500">
                ロビー開場 15:00 / 客席開場 15:30 / 開演 16:00
              </p>
            </div>
            <p className="text-sm text-slate-400 text-center">*全3回公演</p>
          </div>
        </div>
      </section>

      {/* Place */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title mb-10">Place</h2>
          
          <div>
            <p className="font-serif text-xl text-slate-700 mb-3">IMAホール</p>
            <p className="text-slate-500 mb-2">東京都練馬区光が丘5-1-1 光が丘IMA中央館4F</p>
            <p className="text-sm text-slate-400">最寄り：都営地下鉄大江戸線 光が丘駅</p>
          </div>
        </div>
      </section>

      {/* Price */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title mb-10">Price</h2>
          
          <div className="flex justify-center gap-12">
            <div>
              <p className="text-slate-500 text-sm mb-2">自由席</p>
              <p className="font-serif text-2xl text-slate-700">¥4,500</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-2">指定席</p>
              <p className="font-serif text-2xl text-slate-700">¥5,500</p>
            </div>
          </div>
        </div>
      </section>

      {/* Painter */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title mb-10 text-center">Painter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <p className="font-serif text-lg text-slate-700 mb-1">井口舞子</p>
              <a href="https://instagram.com/maiko_iguchi" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">@maiko_iguchi</a>
            </div>
            <div className="p-6">
              <p className="font-serif text-lg text-slate-700 mb-1">菊地匠</p>
              <a href="https://instagram.com/kikuchi_.takumi" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">@kikuchi_.takumi</a>
            </div>
            <div className="p-6">
              <p className="font-serif text-lg text-slate-700 mb-1">松村咲希</p>
              <a href="https://instagram.com/sakimatsumura_" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">@sakimatsumura_</a>
            </div>
          </div>
        </div>
      </section>

      {/* Choreographer */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title mb-10 text-center">Choreographer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">燦</p>
              <a href="https://instagram.com/aki_5651" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@aki_5651</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">池上直子</p>
              <p className="text-xs text-slate-500 mb-1">Dance Marché</p>
              <a href="https://instagram.com/naoko.ikegami" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@naoko.ikegami</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">伊藤蘭</p>
              <p className="text-xs text-slate-500 mb-1">Dance Company MKMDC</p>
              <a href="https://instagram.com/ran_itoh.airamonea" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@ran_itoh.airamonea</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">井上菜々子</p>
              <a href="https://instagram.com/naaako_02.28" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@naaako_02.28</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">関口佳絵</p>
              <a href="https://instagram.com/seki_.0._44a" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@seki_.0._44a</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">たむ</p>
              <a href="https://instagram.com/tamtam0624" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@tamtam0624</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">森政博</p>
              <a href="https://instagram.com/passosupremori" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@passosupremori</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">DaHLia × Mag</p>
              <div className="text-xs text-slate-400 space-x-1">
                <a href="https://instagram.com/yumiho___" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">@yumiho___</a>
                <a href="https://instagram.com/___isono" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">@___isono</a>
                <a href="https://instagram.com/kami_kke" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">@kami_kke</a>
                <a href="https://instagram.com/sugitaaaa_" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">@sugitaaaa_</a>
              </div>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">dayo</p>
              <a href="https://instagram.com/dayo._.dayo" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@dayo._.dayo</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">Hashimi!i!i!</p>
              <a href="https://instagram.com/hashim.i.i.i" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@hashim.i.i.i</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">JURI</p>
              <a href="https://instagram.com/jurrrrii" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@jurrrrii</a>
            </div>
            <div className="p-4 text-center">
              <p className="font-serif text-slate-700 mb-1">miotchery</p>
              <p className="text-xs text-slate-500 mb-1">Dance Company MKMDC</p>
              <a href="https://instagram.com/miotchery" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@miotchery</a>
            </div>
          </div>
          <p className="text-center text-sm text-slate-400 mt-6">*順不同</p>
        </div>
      </section>

      {/* Navigator & Guest */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
            <div>
              <h2 className="text-xs tracking-wider text-slate-400 uppercase mb-6">Navigator</h2>
              <p className="font-serif text-xl text-slate-700">下田麻美</p>
            </div>
            <div>
              <h2 className="text-xs tracking-wider text-slate-400 uppercase mb-6">Guest Dancer</h2>
              <p className="font-serif text-xl text-slate-700 mb-2">YOH UENO</p>
              <p className="text-sm text-slate-500 mb-1">KEMURI</p>
              <a href="https://instagram.com/yoh_ueno.kemuri" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@yoh_ueno.kemuri</a>
              <p className="text-xs text-slate-400 mt-3">※5/10 17:50公演のみ出演</p>
            </div>
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title mb-10 text-center">Staff</h2>
          <div className="space-y-6 text-center">
            <div>
              <p className="text-xs tracking-wider text-slate-400 uppercase mb-2">企画・運営</p>
              <p className="text-slate-700">easel（岡嶋秀介、古川理奈）</p>
            </div>
            <div>
              <p className="text-xs tracking-wider text-slate-400 uppercase mb-2">広報</p>
              <p className="text-slate-700">関根舞</p>
            </div>
            <div>
              <p className="text-xs tracking-wider text-slate-400 uppercase mb-2">デザイン</p>
              <p className="text-slate-700">Ricky</p>
              <a href="https://instagram.com/ricky__56" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@ricky__56</a>
            </div>
            <div>
              <p className="text-xs tracking-wider text-slate-400 uppercase mb-2">制作</p>
              <p className="text-slate-700">株式会社HIDE&SEEK</p>
              <a href="https://instagram.com/hideandseek2012" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">@hideandseek2012</a>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Link */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            to="/easel-live/vol1/gallery"
            className="group inline-flex items-center gap-4 px-10 py-5 border border-slate-200 rounded-full hover:border-slate-300 hover:bg-white transition-all duration-300"
          >
            <Image size={22} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-300" />
            <span className="tracking-wider text-slate-600">Photo Gallery</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

