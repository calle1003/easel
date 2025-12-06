import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

// 各フォルダの画像データ
const galleryData = [
  { folder: 'M1', files: Array.from({ length: 10 }, (_, i) => `M1_${i + 1}.jpg`) },
  { folder: 'M2', files: Array.from({ length: 10 }, (_, i) => `M2_${i + 1}.jpg`) },
  { folder: 'M3', files: Array.from({ length: 10 }, (_, i) => `M3_${i + 1}.jpg`) },
  { folder: 'M4', files: Array.from({ length: 10 }, (_, i) => `M4_${i + 1}.jpg`) },
  { folder: 'M5', files: Array.from({ length: 10 }, (_, i) => `M5_${i + 1}.jpg`) },
  { folder: 'M6', files: Array.from({ length: 10 }, (_, i) => `M6_${i + 1}.jpg`) },
  { folder: 'M6.5', files: Array.from({ length: 10 }, (_, i) => `M6.5_${i + 1}.jpg`) },
  { folder: 'M7', files: Array.from({ length: 10 }, (_, i) => `M7_${i + 1}.jpg`) },
  { folder: 'M8', files: Array.from({ length: 10 }, (_, i) => `M8_${i + 1}.jpg`) },
  { folder: 'M9', files: Array.from({ length: 10 }, (_, i) => `M9_${i + 1}.jpg`) },
  { folder: 'M10', files: Array.from({ length: 10 }, (_, i) => `M10_${i + 1}.jpg`) },
  { folder: 'M11', files: Array.from({ length: 10 }, (_, i) => `M11_${i + 1}.jpg`) },
  { folder: 'M12', files: Array.from({ length: 10 }, (_, i) => `M12_${i + 1}.jpg`) },
];

// ランダムに3つ選ぶ関数
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Vol1Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 各フォルダから3つずつランダムにピック
  const images = useMemo(() => {
    return galleryData.flatMap(({ folder, files }) => {
      const picked = pickRandom(files, 3);
      return picked.map((file) => ({
        src: `/easelLiveVol1/${folder}/${file}`,
        alt: `${folder} - ${file}`,
      }));
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-5xl mx-auto w-full">
          <nav className="mb-3">
            <Link to="/easel-live" className="text-xs tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              easel LIVE
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <Link to="/easel-live/vol1" className="text-xs tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              Vol.1
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-xs tracking-wider text-slate-500">Gallery</span>
          </nav>
          <div className="text-center">
            <p className="section-subtitle mb-4">Vol.1</p>
            <h1 className="section-title">Photo Gallery</h1>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(image.src)}
                className="aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity duration-300"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            aria-label="閉じる"
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="拡大画像"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
