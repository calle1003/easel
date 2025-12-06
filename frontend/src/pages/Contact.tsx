import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 実際の送信処理は後で実装
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <CheckCircle className="mx-auto mb-10 text-slate-300" size={72} strokeWidth={1} />
          <h1 className="section-title mb-8">送信完了</h1>
          <p className="text-slate-500 leading-relaxed">
            お問い合わせいただきありがとうございます。<br />
            内容を確認の上、担当者よりご連絡いたします。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-subtitle mb-4">Contact</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">Contact</h1>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-xl mx-auto">
          <p className="text-center text-slate-500 mb-14">
            easelへのお問い合わせは、下記フォームよりお送りください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm text-slate-500 mb-2">お名前 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="山田 太郎"
                className="w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-2">メールアドレス *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="example@email.com"
                className="w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-2">件名 *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full p-4 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 transition-colors"
              >
                <option value="">選択してください</option>
                <option value="ticket">チケットについて</option>
                <option value="performance">公演について</option>
                <option value="media">メディア・取材について</option>
                <option value="collaboration">コラボレーション・出演依頼</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-2">お問い合わせ内容 *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="お問い合わせ内容をご記入ください"
                className="w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors resize-none"
              />
            </div>

            <div className="pt-6">
              <button type="submit" className="btn-primary w-full justify-center group">
                <span>送信する</span>
                <Send size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

