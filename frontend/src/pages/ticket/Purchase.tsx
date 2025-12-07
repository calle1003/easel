import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';

// 公演情報の型定義
interface Performance {
  id: number;
  title: string;
  volume: string;
  performanceDate: string;
  performanceTime: string;
  doorsOpenTime: string;
  venueName: string;
  generalPrice: number;
  reservedPrice: number;
  generalRemaining: number;
  reservedRemaining: number;
  onSale: boolean;
  soldOut: boolean;
}

// 注文データの型定義
export interface OrderData {
  performanceId: number;
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

// 引換券バリデーション結果の型
interface CodeValidationResult {
  code: string;
  valid: boolean;
  message: string;
  performerName?: string;
}

export default function Purchase() {
  const navigate = useNavigate();
  const location = useLocation();

  // 確認画面から戻ってきた場合、前回の入力内容を復元
  const previousData = location.state as OrderData | null;

  // 公演情報
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 引換券コード
  const [hasExchangeCode, setHasExchangeCode] = useState<boolean | null>(
    previousData?.hasExchangeCode ?? null
  );
  const [exchangeCodes, setExchangeCodes] = useState<string[]>(
    previousData?.exchangeCodes ?? ['']
  );
  const [codeValidations, setCodeValidations] = useState<CodeValidationResult[]>([]);
  const [validatingCodes, setValidatingCodes] = useState(false);

  // チケット枚数
  const [generalQuantity, setGeneralQuantity] = useState(
    previousData?.generalQuantity ?? 0
  );
  const [reservedQuantity, setReservedQuantity] = useState(
    previousData?.reservedQuantity ?? 0
  );

  // 顧客情報
  const [formData, setFormData] = useState({
    name: previousData?.name ?? '',
    email: previousData?.email ?? '',
    phone: previousData?.phone ?? '',
    performanceId: previousData?.performanceId?.toString() ?? '',
  });

  // 公演情報を取得
  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        const response = await fetch('/api/performances/on-sale');
        if (!response.ok) {
          throw new Error('公演情報の取得に失敗しました');
        }
        const data = await response.json();
        setPerformances(data);

        // 前回選択した公演を復元
        if (previousData?.performanceId) {
          const prev = data.find((p: Performance) => p.id === previousData.performanceId);
          if (prev) {
            setSelectedPerformance(prev);
            setFormData((f) => ({ ...f, performanceId: prev.id.toString() }));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '公演情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, [previousData?.performanceId]);

  // 価格情報（選択した公演から取得、未選択時はデフォルト）
  const generalPrice = selectedPerformance?.generalPrice ?? 4500;
  const reservedPrice = selectedPerformance?.reservedPrice ?? 5500;

  // 有効な引換券コードの数
  const validCodeCount = codeValidations.filter((v) => v.valid).length;

  // 引換券で割引される一般席の枚数
  const discountedGeneralCount = hasExchangeCode
    ? Math.min(validCodeCount, generalQuantity)
    : 0;

  // 合計金額を計算
  const generalTotal = (generalQuantity - discountedGeneralCount) * generalPrice;
  const reservedTotal = reservedQuantity * reservedPrice;
  const total = generalTotal + reservedTotal;

  // 割引額
  const discountAmount = discountedGeneralCount * generalPrice;

  // 公演選択時の処理
  const handlePerformanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setFormData((prev) => ({ ...prev, performanceId: id }));

    if (id) {
      const perf = performances.find((p) => p.id === parseInt(id));
      setSelectedPerformance(perf || null);
    } else {
      setSelectedPerformance(null);
    }
  };

  const handleQuantityChange = (type: 'general' | 'reserved', delta: number) => {
    if (type === 'general') {
      const max = selectedPerformance?.generalRemaining ?? 10;
      setGeneralQuantity((prev) => Math.max(0, Math.min(max, prev + delta)));
    } else {
      const max = selectedPerformance?.reservedRemaining ?? 10;
      setReservedQuantity((prev) => Math.max(0, Math.min(max, prev + delta)));
    }
  };

  // 電話番号を自動フォーマット
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');

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
      newCodes[index] = value.toUpperCase();
      return newCodes;
    });
    // バリデーション結果をクリア
    setCodeValidations([]);
  };

  const addCodeField = () => {
    if (exchangeCodes.length < 10) {
      setExchangeCodes((prev) => [...prev, '']);
    }
  };

  const removeCodeField = (index: number) => {
    if (exchangeCodes.length > 1) {
      setExchangeCodes((prev) => prev.filter((_, i) => i !== index));
      setCodeValidations([]);
    }
  };

  // 引換券コードをバリデーション
  const validateExchangeCodes = async () => {
    const nonEmptyCodes = exchangeCodes.filter((code) => code.trim() !== '');
    if (nonEmptyCodes.length === 0) {
      setCodeValidations([]);
      return;
    }

    setValidatingCodes(true);
    try {
      const response = await fetch('/api/exchange-codes/validate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: nonEmptyCodes }),
      });

      if (!response.ok) {
        throw new Error('バリデーションに失敗しました');
      }

      const data = await response.json();
      setCodeValidations(data.results);
    } catch (err) {
      console.error('Code validation error:', err);
    } finally {
      setValidatingCodes(false);
    }
  };

  // コードが変更されたらバリデーション
  useEffect(() => {
    if (hasExchangeCode && exchangeCodes.some((code) => code.trim() !== '')) {
      const timer = setTimeout(() => {
        validateExchangeCodes();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [exchangeCodes, hasExchangeCode]);

  const totalQuantity = generalQuantity + reservedQuantity;

  // 引換券コードのバリデーション
  const isExchangeCodeValid =
    hasExchangeCode === false ||
    (hasExchangeCode === true &&
      exchangeCodes.length > 0 &&
      exchangeCodes.every((code) => code.trim() !== '') &&
      codeValidations.length > 0 &&
      codeValidations.every((v) => v.valid));

  // フォーム全体のバリデーション
  const isFormValid =
    formData.performanceId &&
    formData.name &&
    formData.email &&
    formData.phone &&
    hasExchangeCode !== null &&
    isExchangeCodeValid &&
    totalQuantity > 0;

  // 公演日時のラベルを生成
  const formatPerformanceLabel = (perf: Performance): string => {
    const date = new Date(perf.performanceDate);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const time = perf.performanceTime.slice(0, 5);
    return `${year}年${month}月${day}日（${weekday}） ${time}`;
  };

  // 確認画面へ遷移
  const handleSubmit = () => {
    if (!isFormValid || !selectedPerformance) return;

    const orderData: OrderData = {
      performanceId: selectedPerformance.id,
      date: `${selectedPerformance.performanceDate}-${selectedPerformance.performanceTime.slice(0, 2)}`,
      dateLabel: formatPerformanceLabel(selectedPerformance),
      hasExchangeCode: hasExchangeCode!,
      exchangeCodes: hasExchangeCode ? exchangeCodes.filter((c) => c.trim() !== '') : [],
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

  // コードのバリデーション結果を取得
  const getCodeValidation = (code: string): CodeValidationResult | undefined => {
    return codeValidations.find((v) => v.code.toUpperCase() === code.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

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
                name="performanceId"
                value={formData.performanceId}
                onChange={handlePerformanceChange}
                className="w-full p-4 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-slate-400 transition-colors"
              >
                <option value="">公演日時を選択してください</option>
                {performances.map((perf) => (
                  <option key={perf.id} value={perf.id} disabled={perf.soldOut}>
                    {formatPerformanceLabel(perf)}
                    {perf.soldOut && ' (SOLD OUT)'}
                  </option>
                ))}
              </select>
              {selectedPerformance && (
                <div className="mt-3 text-sm text-slate-500">
                  <p>会場: {selectedPerformance.venueName}</p>
                  <p className="mt-1">
                    残席: 一般席 {selectedPerformance.generalRemaining}枚 / 指定席 {selectedPerformance.reservedRemaining}枚
                  </p>
                </div>
              )}
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
                        setCodeValidations([]);
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
                    {exchangeCodes.map((code, index) => {
                      const validation = getCodeValidation(code);
                      return (
                        <div key={index}>
                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={code}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                placeholder={`引換券コード ${index + 1}`}
                                required
                                className={`w-full p-4 border rounded-lg focus:outline-none transition-colors ${
                                  validation
                                    ? validation.valid
                                      ? 'border-green-300 bg-green-50'
                                      : 'border-red-300 bg-red-50'
                                    : 'border-slate-200'
                                }`}
                              />
                              {validation && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  {validation.valid ? (
                                    <CheckCircle size={20} className="text-green-500" />
                                  ) : (
                                    <AlertCircle size={20} className="text-red-500" />
                                  )}
                                </div>
                              )}
                            </div>
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
                          {validation && (
                            <p className={`mt-1 text-sm ${validation.valid ? 'text-green-600' : 'text-red-500'}`}>
                              {validation.message}
                              {validation.performerName && ` (${validation.performerName})`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={addCodeField}
                      className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={16} />
                      <span>コードを追加</span>
                    </button>
                    {validatingCodes && (
                      <p className="text-sm text-slate-400">コードを確認中...</p>
                    )}
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
