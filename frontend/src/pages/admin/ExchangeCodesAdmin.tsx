import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Check, X, Copy } from 'lucide-react';
import { adminFetch } from '../../utils/adminApi';

interface ExchangeCode {
  id: number;
  code: string;
  performerName: string;
  used: boolean;
  usedAt: string | null;
  orderId: number | null;
  createdAt: string;
}

export default function ExchangeCodesAdmin() {
  const [codes, setCodes] = useState<ExchangeCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    performerName: '',
  });
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [batchData, setBatchData] = useState({
    performerName: '',
    count: 5,
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await adminFetch('/api/exchange-codes');
      if (response.ok) {
        const data = await response.json();
        setCodes(data);
      }
    } catch (error) {
      console.error('Failed to fetch codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await adminFetch('/api/exchange-codes', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchCodes();
        setFormData({ code: '', performerName: '' });
      }
    } catch (error) {
      console.error('Failed to create code:', error);
    }
  };

  const handleBatchGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingBatch(true);

    try {
      const response = await adminFetch('/api/exchange-codes/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
      });

      if (response.ok) {
        fetchCodes();
        setBatchData({ performerName: '', count: 5 });
      }
    } catch (error) {
      console.error('Failed to generate batch:', error);
    } finally {
      setGeneratingBatch(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const unusedCodes = codes.filter((c) => !c.used);
  const usedCodes = codes.filter((c) => c.used);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-medium text-slate-800">引換券コード管理</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forms */}
          <div className="lg:col-span-1 space-y-6">
            {/* Single Code Form */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="font-medium text-slate-800 mb-4">コードを追加</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">コード</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono"
                    placeholder="ABCD1234"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">出演者名</label>
                  <input
                    type="text"
                    value={formData.performerName}
                    onChange={(e) => setFormData({ ...formData, performerName: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    placeholder="山田太郎"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  追加
                </button>
              </form>
            </div>

            {/* Batch Generate Form */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="font-medium text-slate-800 mb-4">一括生成</h2>
              <form onSubmit={handleBatchGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">出演者名</label>
                  <input
                    type="text"
                    value={batchData.performerName}
                    onChange={(e) => setBatchData({ ...batchData, performerName: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    placeholder="山田太郎"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">生成数</label>
                  <input
                    type="number"
                    value={batchData.count}
                    onChange={(e) => setBatchData({ ...batchData, count: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={50}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={generatingBatch}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  {generatingBatch ? '生成中...' : '一括生成'}
                </button>
              </form>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="font-medium text-slate-800 mb-4">統計</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">総コード数</span>
                  <span className="font-medium text-slate-700">{codes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">未使用</span>
                  <span className="font-medium text-green-600">{unusedCodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">使用済み</span>
                  <span className="font-medium text-slate-400">{usedCodes.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-medium text-slate-800">コード一覧</h2>
              </div>
              {loading ? (
                <div className="p-6 text-center text-slate-400">読み込み中...</div>
              ) : codes.length === 0 ? (
                <div className="p-6 text-center text-slate-400">コードがありません</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">コード</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">出演者</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">状態</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-6 py-3">使用日</th>
                        <th className="text-left text-xs text-slate-500 font-medium px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {codes.map((code) => (
                        <tr key={code.id} className={code.used ? 'bg-slate-50' : ''}>
                          <td className="px-6 py-3 font-mono text-sm text-slate-700">{code.code}</td>
                          <td className="px-6 py-3 text-sm text-slate-600">{code.performerName}</td>
                          <td className="px-6 py-3">
                            {code.used ? (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                <X size={12} />
                                使用済み
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                <Check size={12} />
                                有効
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-500">{formatDate(code.usedAt)}</td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => copyToClipboard(code.code)}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                              title="コピー"
                            >
                              <Copy size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

