import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Play, Pause } from 'lucide-react';
import { adminFetch } from '../../utils/adminApi';

interface Performance {
  id: number;
  title: string;
  volume: string;
  performanceDate: string;
  performanceTime: string;
  venueName: string;
  generalPrice: number;
  reservedPrice: number;
  generalCapacity: number;
  reservedCapacity: number;
  generalSold: number;
  reservedSold: number;
  saleStatus: string;
  generalRemaining: number;
  reservedRemaining: number;
}

export default function PerformancesAdmin() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    volume: '',
    performanceDate: '',
    performanceTime: '',
    venueName: '',
    generalPrice: 4500,
    reservedPrice: 5500,
    generalCapacity: 100,
    reservedCapacity: 30,
  });

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    try {
      const response = await adminFetch('/api/performances');
      if (response.ok) {
        const data = await response.json();
        setPerformances(data);
      }
    } catch (error) {
      console.error('Failed to fetch performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId ? `/api/performances/${editingId}` : '/api/performances';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await adminFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          saleStatus: 'NOT_ON_SALE',
        }),
      });

      if (response.ok) {
        fetchPerformances();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save performance:', error);
    }
  };

  const handleEdit = (perf: Performance) => {
    setEditingId(perf.id);
    setFormData({
      title: perf.title,
      volume: perf.volume || '',
      performanceDate: perf.performanceDate,
      performanceTime: perf.performanceTime.slice(0, 5),
      venueName: perf.venueName,
      generalPrice: perf.generalPrice,
      reservedPrice: perf.reservedPrice,
      generalCapacity: perf.generalCapacity,
      reservedCapacity: perf.reservedCapacity,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この公演を削除しますか？')) return;

    try {
      const response = await adminFetch(`/api/performances/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchPerformances();
      }
    } catch (error) {
      console.error('Failed to delete performance:', error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await adminFetch(`/api/performances/${id}/sale-status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchPerformances();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      volume: '',
      performanceDate: '',
      performanceTime: '',
      venueName: '',
      generalPrice: 4500,
      reservedPrice: 5500,
      generalCapacity: 100,
      reservedCapacity: 30,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_SALE':
        return <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">販売中</span>;
      case 'NOT_ON_SALE':
        return <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded">未販売</span>;
      case 'SOLD_OUT':
        return <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">完売</span>;
      case 'ENDED':
        return <span className="text-xs px-2 py-1 bg-slate-200 text-slate-500 rounded">終了</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-medium text-slate-800">公演管理</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="font-medium text-slate-800 mb-4">
                {editingId ? '公演を編集' : '新規公演作成'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">タイトル</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    placeholder="easel LIVE vol.2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">ボリューム</label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    placeholder="vol.2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">公演日</label>
                    <input
                      type="date"
                      value={formData.performanceDate}
                      onChange={(e) => setFormData({ ...formData, performanceDate: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">開演時間</label>
                    <input
                      type="time"
                      value={formData.performanceTime}
                      onChange={(e) => setFormData({ ...formData, performanceTime: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">会場</label>
                  <input
                    type="text"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    placeholder="○○劇場"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">一般席価格</label>
                    <input
                      type="number"
                      value={formData.generalPrice}
                      onChange={(e) => setFormData({ ...formData, generalPrice: parseInt(e.target.value) })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">指定席価格</label>
                    <input
                      type="number"
                      value={formData.reservedPrice}
                      onChange={(e) => setFormData({ ...formData, reservedPrice: parseInt(e.target.value) })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">一般席定員</label>
                    <input
                      type="number"
                      value={formData.generalCapacity}
                      onChange={(e) => setFormData({ ...formData, generalCapacity: parseInt(e.target.value) })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">指定席定員</label>
                    <input
                      type="number"
                      value={formData.reservedCapacity}
                      onChange={(e) => setFormData({ ...formData, reservedCapacity: parseInt(e.target.value) })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    {editingId ? '更新' : '作成'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-medium text-slate-800">公演一覧</h2>
              </div>
              {loading ? (
                <div className="p-6 text-center text-slate-400">読み込み中...</div>
              ) : performances.length === 0 ? (
                <div className="p-6 text-center text-slate-400">公演がありません</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {performances.map((perf) => (
                    <div key={perf.id} className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(perf.saleStatus)}
                            <span className="text-sm text-slate-500">
                              {formatDate(perf.performanceDate)} {perf.performanceTime.slice(0, 5)}
                            </span>
                          </div>
                          <h3 className="font-medium text-slate-700">{perf.title}</h3>
                          <p className="text-sm text-slate-500">{perf.venueName}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(perf)}
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(perf.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                          一般席: {perf.generalSold}/{perf.generalCapacity} 
                          <span className="mx-2">|</span>
                          指定席: {perf.reservedSold}/{perf.reservedCapacity}
                        </div>
                        <div className="flex gap-2">
                          {perf.saleStatus !== 'ON_SALE' && (
                            <button
                              onClick={() => handleStatusChange(perf.id, 'ON_SALE')}
                              className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                            >
                              <Play size={12} />
                              販売開始
                            </button>
                          )}
                          {perf.saleStatus === 'ON_SALE' && (
                            <button
                              onClick={() => handleStatusChange(perf.id, 'NOT_ON_SALE')}
                              className="text-xs px-3 py-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
                            >
                              <Pause size={12} />
                              販売停止
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

