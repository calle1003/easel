import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';

// 公演日時のオプション
const dateOptions = [
  { value: '2025-01-01-14', label: '2025年1月1日（水） 14:00' },
  { value: '2025-01-01-18', label: '2025年1月1日（水） 18:00' },
  { value: '2025-01-02-14', label: '2025年1月2日（木） 14:00' },
];

// 注文データの型定義
export interface OrderData {
  date: string;
  dateLabel: string;
  hasExchangeCode: boolean;
  exchangeCodes: string[];
  generalQuantity: number;
  reservedQuantity: number;
  generalPrice: number;
  reservedPrice: number;
  discountedGeneralCount: number;
  discountAmount: number;
  total: number;
  name: string;
  email: string;
  phone: string;
}

export default function Purchase() {
  const navigate = useNavigate();
  const location = useLocation();

  // 確認画面から戻ってきた場合、前回の入力内容を復元
  const previousData = location.state as OrderData | null;

  const [hasExchangeCode, setHasExchangeCode] = useState<boolean | null>(
    previousData?.hasExchangeCode ?? null
  );
  const [exchangeCodes, setExchangeCodes] = useState<string[]>(
    previousData?.exchangeCodes ?? ['']
  );
  const [generalQuantity, setGeneralQuantity] = useState(
    previousData?.generalQuantity ?? 0
  );
  const [reservedQuantity, setReservedQuantity] = useState(
    previousData?.reservedQuantity ?? 0
  );
  const [formData, setFormData] = useState({
    name: previousData?.name ?? '',
    email: previousData?.email ?? '',
    phone: previousData?.phone ?? '',
    date: previousData?.date ?? '',
  });

  const generalPrice = 4500; // 一般席（自由席）
  const reservedPrice = 5500; // 指定席

  // 有効な引換券コードの数（空でないもの）
  const validCodeCount = exchangeCodes.filter(
    (code) => code.trim() !== ''
  ).length;

  // 引換券で割引される一般席の枚数（コード数を上限とする）
  const discountedGeneralCount = hasExchangeCode
    ? Math.min(validCodeCount, generalQuantity)
    : 0;

  // 合計金額を計算
  const generalTotal =
    (generalQuantity - discountedGeneralCount) * generalPrice;
  const reservedTotal = reservedQuantity * reservedPrice;
  const total = generalTotal + reservedTotal;

  // 割引額
  const discountAmount = discountedGeneralCount * generalPrice;

  const handleQuantityChange = (
    type: 'general' | 'reserved',
    delta: number
  ) => {
    if (type === 'general') {
      setGeneralQuantity((prev) => Math.max(0, Math.min(10, prev + delta)));
    } else {
      setReservedQuantity((prev) => Math.max(0, Math.min(10, prev + delta)));
    }
  };

  // 電話番号を自動フォーマット（携帯電話番号の場合のみ）
  // 携帯電話: 090-1234-5678 (3-4-4形式)
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');

    // 携帯電話番号（070/080/090）の場合のみフォーマット
    if (/^0[789]0/.test(digits)) {
      if (digits.length <= 3) {
        return digits;
      } else if (digits.length <= 7) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else if (digits.length <= 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      }
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }

    // 携帯電話番号でない場合はそのまま（ハイフンは手動入力）
    return value;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    setExchangeCodes((prev) => {
      const newCodes = [...prev];
      newCodes[index] = value;
      return newCodes;
    });
  };

  const addCodeField = () => {
    if (exchangeCodes.length < 10) {
      setExchangeCodes((prev) => [...prev, '']);
    }
  };

  const removeCodeField = (index: number) => {
    if (exchangeCodes.length > 1) {
      setExchangeCodes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const totalQuantity = generalQuantity + reservedQuantity;

  // 引換券コードのバリデーション（「あり」の場合、すべての入力欄に値が必要）
  const isExchangeCodeValid =
    hasExchangeCode === false ||
    (hasExchangeCode === true &&
      exchangeCodes.length > 0 &&
      exchangeCodes.every((code) => code.trim() !== ''));

  // フォーム全体のバリデーション
  const isFormValid =
    formData.date &&
    formData.name &&
    formData.email &&
    formData.phone &&
    hasExchangeCode !== null &&
    isExchangeCodeValid &&
    totalQuantity > 0;

  // 確認画面へ遷移
  const handleSubmit = () => {
    if (!isFormValid) return;

    const dateLabel =
      dateOptions.find((opt) => opt.value === formData.date)?.label ?? '';

    const orderData: OrderData = {
      date: formData.date,
      dateLabel,
      hasExchangeCode: hasExchangeCode!,
      exchangeCodes: hasExchangeCode ? exchangeCodes : [],
      generalQuantity,
      reservedQuantity,
      generalPrice,
      reservedPrice,
      discountedGeneralCount,
      discountAmount,
      total,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    navigate('/easel-live/vol2/ticket/confirm', { state: orderData });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="min-h-[300px] flex flex-col justify-center px-6 bg-warm-50">
        <div className="max-w-3xl mx-auto w-full">
          <nav className="mb-3">
            <Link to="/easel-live" className="text-xs tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              easel LIVE
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <Link to="/easel-live/vol2" className="text-xs tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              Vol.2
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-xs tracking-wider text-slate-500">Ticket</span>
          </nav>
          <div className="text-center">
            <p className="section-subtitle mb-4">Vol.2</p>
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-[0.2em] text-slate-800">チケット購入</h1>
          </div>
        </div>
      </section>

      {/* Form */}
      <div className="py-20 px-6">
        <div className="max-w-2xl mx-auto">

          <form className="space-y-14" onSubmit={(e) => e.preventDefault()}>
            {/* Date Selection */}
            <section>
              <h2 className="text-xs tracking-wider text-slate-400 mb-4 uppercase">
                公演日時 <span className="text-red-400">*</span>
              </h2>
              <select
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-4 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-slate-400 transition-colors"
              >
                <option value="">公演日時を選択してください</option>
                {dateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </section>

            {/* Exchange Code Section */}
            <section>
              <h2 className="text-xs tracking-wider text-slate-400 mb-4 uppercase">
                引換券コード（出演者から購入）{' '}
                <span className="text-red-400">*</span>
              </h2>
              <div className="space-y-6">
                {/* Radio buttons */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="hasExchangeCode"
                      checked={hasExchangeCode === false}
                      onChange={() => {
                        setHasExchangeCode(false);
                        setExchangeCodes(['']);
                      }}
                      className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
                    />
                    <span className="text-slate-700">引換券なし</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="hasExchangeCode"
                      checked={hasExchangeCode === true}
                      onChange={() => setHasExchangeCode(true)}
                      className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
                    />
                    <span className="text-slate-700">引換券あり</span>
                  </label>
                </div>

                {/* Code input fields */}
                {hasExchangeCode && (
                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-slate-500">
                      出演者から受け取った引換券コードを入力してください。
                      <span className="text-red-400">*</span>
                      <br />
                      <span className="text-slate-400">
                        ※引換券1枚につき一般席1枚分が無料になります。
                      </span>
                    </p>
                    {exchangeCodes.map((code, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          placeholder={`引換券コード ${index + 1}`}
                          required
                          className="flex-1 p-4 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                        />
                        {exchangeCodes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCodeField(index)}
                            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <X size={16} className="text-slate-400" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCodeField}
                      className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={16} />
                      <span>コードを追加</span>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Ticket Quantity */}
            <section>
              <h2 className="text-xs tracking-wider text-slate-400 mb-4 uppercase">
                枚数 <span className="text-red-400">*</span>
              </h2>
              <div className="space-y-4">
                {/* General Ticket */}
                <div className="flex items-center justify-between p-5 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-slate-700">一般席（自由席）</p>
                    <p className="text-sm text-slate-400">
                      ¥{generalPrice.toLocaleString()} / 枚
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('general', -1)}
                      className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
                      disabled={generalQuantity === 0}
                    >
                      <Minus size={16} className="text-slate-500" />
                    </button>
                    <span className="w-8 text-center text-lg text-slate-700">
                      {generalQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('general', 1)}
                      className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={16} className="text-slate-500" />
                    </button>
                  </div>
                </div>

                {/* Reserved Ticket */}
                <div className="flex items-center justify-between p-5 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-slate-700">指定席</p>
                    <p className="text-sm text-slate-400">
                      ¥{reservedPrice.toLocaleString()} / 枚
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('reserved', -1)}
                      className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
                      disabled={reservedQuantity === 0}
                    >
                      <Minus size={16} className="text-slate-500" />
                    </button>
                    <span className="w-8 text-center text-lg text-slate-700">
                      {reservedQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('reserved', 1)}
                      className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={16} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Personal Info */}
            <section>
              <h2 className="text-xs tracking-wider text-slate-400 mb-4 uppercase">
                お客様情報 <span className="text-red-400">*</span>
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    お名前 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="山田 太郎"
                    className="w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    メールアドレス *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    電話番号 *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="090-1234-5678"
                    className="w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Total */}
            <section className="pt-8 border-t border-slate-100">
              <div className="space-y-4 mb-10">
                {/* Breakdown */}
                {generalQuantity > 0 && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>一般席 × {generalQuantity}</span>
                    <span>
                      ¥{(generalQuantity * generalPrice).toLocaleString()}
                    </span>
                  </div>
                )}
                {reservedQuantity > 0 && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>指定席 × {reservedQuantity}</span>
                    <span>¥{reservedTotal.toLocaleString()}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>引換券割引（{discountedGeneralCount}枚分）</span>
                    <span>-¥{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-slate-700 font-medium">合計</span>
                  <span className="font-serif text-2xl text-slate-800">
                    ¥{total.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`btn-primary w-full justify-center ${
                  !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                確認画面へ進む
              </button>
              {!isFormValid && (
                <p className="text-center text-sm text-slate-400 mt-4">
                  すべての必須項目を入力してください
                </p>
              )}
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}
