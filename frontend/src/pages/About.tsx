export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-subtitle mb-4">About</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">
            <span className="font-medium">easel</span>とは
          </h1>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title mb-14 text-center">Philosophy</h2>
          <div className="text-center text-slate-600 leading-loose">
            <p>
              作品を支え、角度を変えることで<br />
              新たな見え方を引き出す＜イーゼル（画架）＞に着想を得て、<br />
              アートや表現に新しい視点を加えながら<br />
              『心が動く瞬間』を支えるユニット。
            </p>
          </div>
        </div>
      </section>

      {/* Concept */}
      <section className="py-28 px-6 bg-slate-50/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title mb-14 text-center">Concept</h2>
          <div className="space-y-8 text-center text-slate-600 leading-loose">
            <p>
              「イーゼル」とは、絵を描くときにキャンバスを立てかける画架のこと。
            </p>
            <p>
              私たちは舞台を一枚のキャンバスと捉え、<br />
              そこに観客と共に唯一無二の作品を描き上げていきます。
            </p>
            <p>
              伝統と革新、静と動、光と影——<br />
              相反する要素を調和させながら、新しい表現を探求し続けます。
            </p>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title mb-14 text-center">Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Member Placeholder 1 */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-slate-100 rounded-full mb-6" />
              <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-2">メンバー名</h3>
              <p className="text-sm text-slate-400">主宰・演出</p>
            </div>
            {/* Member Placeholder 2 */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-slate-100 rounded-full mb-6" />
              <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-2">メンバー名</h3>
              <p className="text-sm text-slate-400">俳優</p>
            </div>
            {/* Member Placeholder 3 */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-slate-100 rounded-full mb-6" />
              <h3 className="font-serif text-lg tracking-wider text-slate-700 mb-2">メンバー名</h3>
              <p className="text-sm text-slate-400">俳優</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

