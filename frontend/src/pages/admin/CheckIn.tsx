import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Ticket,
  ArrowLeft,
  Keyboard,
  RotateCcw
} from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { adminFetch } from '../../utils/adminApi';

interface TicketInfo {
  id: number;
  ticketCode: string;
  ticketType: 'GENERAL' | 'RESERVED';
  isExchanged: boolean;
  isUsed: boolean;
  usedAt: string | null;
  order?: {
    id: number;
    customerName: string;
    performanceLabel: string;
  };
}

interface Stats {
  totalCheckedIn: number;
  generalCheckedIn: number;
  reservedCheckedIn: number;
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'already-used';

export default function CheckIn() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [stats, setStats] = useState<Stats>({ totalCheckedIn: 0, generalCheckedIn: 0, reservedCheckedIn: 0 });
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  // 統計情報を取得
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // 10秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  // カメラ初期化
  useEffect(() => {
    if (!isManualMode) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isManualMode]);

  const fetchStats = async () => {
    try {
      const response = await adminFetch('/api/tickets/stats/today');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const startCamera = async () => {
    try {
      if (!videoRef.current) return;

      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        setErrorMessage('カメラが見つかりません');
        return;
      }

      // 背面カメラを優先的に選択
      const backCamera = videoInputDevices.find((device: { label: string }) => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || videoInputDevices[0];

      await codeReader.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current,
        (result: any) => {
          if (result) {
            const ticketCode = result.getText();
            handleScan(ticketCode);
          }
          // エラーは無視（継続的にスキャン）
        }
      );
    } catch (error) {
      console.error('Camera error:', error);
      setErrorMessage('カメラの起動に失敗しました');
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current = null;
    }
    // ビデオ要素のストリームを停止
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleScan = async (ticketCode: string) => {
    if (scanStatus === 'scanning') return; // 処理中は無視

    setScanStatus('scanning');
    setTicketInfo(null);
    setErrorMessage('');

    try {
      // まず検証
      const verifyResponse = await adminFetch('/api/tickets/verify', {
        method: 'POST',
        body: JSON.stringify({ ticketCode }),
      });

      if (!verifyResponse.ok) {
        throw new Error('検証に失敗しました');
      }

      const verifyData = await verifyResponse.json();

      if (!verifyData.valid) {
        // 無効なチケット
        setScanStatus('error');
        setErrorMessage(verifyData.error || '無効なチケットです');
        setTicketInfo(verifyData.ticket || null);
        playErrorSound();
        vibrate([200, 100, 200]);
        
        // 既に使用済みの場合
        if (verifyData.error && verifyData.error.includes('使用済み')) {
          setScanStatus('already-used');
        }
        
        setTimeout(() => {
          setScanStatus('idle');
          setTicketInfo(null);
        }, 3000);
        return;
      }

      // 有効なチケット - 入場処理
      const checkInResponse = await adminFetch('/api/tickets/check-in', {
        method: 'POST',
        body: JSON.stringify({ ticketCode }),
      });

      if (!checkInResponse.ok) {
        throw new Error('入場処理に失敗しました');
      }

      const checkInData = await checkInResponse.json();

      if (!checkInData.success) {
        setScanStatus('error');
        setErrorMessage(checkInData.error || '入場処理に失敗しました');
        playErrorSound();
        vibrate([200, 100, 200]);
        setTimeout(() => {
          setScanStatus('idle');
        }, 3000);
        return;
      }

      // 成功
      setScanStatus('success');
      setTicketInfo(checkInData.ticket);
      playSuccessSound();
      vibrate([100]);
      fetchStats(); // 統計を更新

      setTimeout(() => {
        setScanStatus('idle');
        setTicketInfo(null);
      }, 3000);

    } catch (error) {
      console.error('Check-in error:', error);
      setScanStatus('error');
      setErrorMessage('エラーが発生しました');
      playErrorSound();
      vibrate([200, 100, 200]);
      setTimeout(() => {
        setScanStatus('idle');
      }, 3000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput('');
    }
  };

  // 音声フィードバック
  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const playErrorSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 300;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // 振動フィードバック
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const resetScan = () => {
    setScanStatus('idle');
    setTicketInfo(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white">
          <ArrowLeft size={20} />
          <span className="text-sm">戻る</span>
        </Link>
        <h1 className="text-lg font-medium">入場チェック</h1>
        <button
          onClick={() => setIsManualMode(!isManualMode)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {isManualMode ? <Camera size={20} /> : <Keyboard size={20} />}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-slate-400 mb-1">本日の入場</div>
            <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
              <Users size={20} />
              {stats.totalCheckedIn}
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">一般席</div>
            <div className="text-xl font-medium text-blue-400">{stats.generalCheckedIn}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1">指定席</div>
            <div className="text-xl font-medium text-purple-400">{stats.reservedCheckedIn}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!isManualMode ? (
          // Camera Mode
          <div className="flex-1 relative">
            {/* Camera View */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />

            {/* QR Code Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-white rounded-lg opacity-50"></div>
            </div>

            {/* Scan Overlay */}
            {scanStatus !== 'idle' && (
              <div className={`absolute inset-0 flex items-center justify-center ${
                scanStatus === 'success' ? 'bg-green-500/90' :
                scanStatus === 'already-used' ? 'bg-yellow-500/90' :
                scanStatus === 'error' ? 'bg-red-500/90' :
                'bg-blue-500/90'
              }`}>
                <div className="text-center p-8">
                  {scanStatus === 'scanning' && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
                      <p className="text-xl font-medium">検証中...</p>
                    </div>
                  )}

                  {scanStatus === 'success' && ticketInfo && (
                    <div className="flex flex-col items-center gap-4">
                      <CheckCircle size={64} strokeWidth={2} />
                      <p className="text-2xl font-bold">入場OK</p>
                      <div className="bg-white/20 rounded-lg p-4 mt-2">
                        <p className="text-lg font-medium">{ticketInfo.order?.customerName}</p>
                        <p className="text-sm mt-1">{ticketInfo.order?.performanceLabel}</p>
                        <p className="text-xs mt-2 opacity-80">
                          {ticketInfo.ticketType === 'GENERAL' ? '一般席' : '指定席'}
                          {ticketInfo.isExchanged && ' (引換券使用)'}
                        </p>
                      </div>
                    </div>
                  )}

                  {scanStatus === 'already-used' && (
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle size={64} strokeWidth={2} />
                      <p className="text-2xl font-bold">使用済み</p>
                      <p className="text-lg">{errorMessage}</p>
                      {ticketInfo && (
                        <div className="bg-white/20 rounded-lg p-4 mt-2">
                          <p className="text-sm">{ticketInfo.order?.customerName}</p>
                          <p className="text-xs mt-1 opacity-80">
                            {ticketInfo.usedAt && new Date(ticketInfo.usedAt).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {scanStatus === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                      <X size={64} strokeWidth={2} />
                      <p className="text-2xl font-bold">エラー</p>
                      <p className="text-lg">{errorMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            {scanStatus === 'idle' && (
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <div className="inline-block bg-black/60 backdrop-blur-sm rounded-full px-6 py-3">
                  <p className="text-sm">QRコードを枠内に合わせてください</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Manual Input Mode
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="text-center mb-6">
                  <Ticket size={48} className="mx-auto mb-4 text-slate-400" />
                  <h2 className="text-xl font-medium">手動入力</h2>
                  <p className="text-sm text-slate-400 mt-2">
                    チケットコードを入力してください
                  </p>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="チケットコード (UUID)"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim() || scanStatus === 'scanning'}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium text-lg transition-colors"
                  >
                    {scanStatus === 'scanning' ? '検証中...' : '入場処理'}
                  </button>
                </form>

                {/* Result Display */}
                {scanStatus !== 'idle' && scanStatus !== 'scanning' && (
                  <div className={`mt-6 p-4 rounded-lg ${
                    scanStatus === 'success' ? 'bg-green-500/20 border border-green-500' :
                    scanStatus === 'already-used' ? 'bg-yellow-500/20 border border-yellow-500' :
                    'bg-red-500/20 border border-red-500'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {scanStatus === 'success' ? (
                        <CheckCircle size={24} className="text-green-400" />
                      ) : (
                        <AlertCircle size={24} className="text-red-400" />
                      )}
                      <p className="font-medium">
                        {scanStatus === 'success' ? '入場OK' :
                         scanStatus === 'already-used' ? '使用済み' :
                         'エラー'}
                      </p>
                    </div>
                    {errorMessage && (
                      <p className="text-sm text-slate-300">{errorMessage}</p>
                    )}
                    {ticketInfo && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <p className="text-sm">{ticketInfo.order?.customerName}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {ticketInfo.ticketType === 'GENERAL' ? '一般席' : '指定席'}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={resetScan}
                      className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} />
                      リセット
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

