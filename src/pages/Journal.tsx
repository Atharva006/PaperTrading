import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { uploadScreenshot } from '../lib/storage';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Search, Filter, Camera, Upload, Image as ImageIcon, Pencil, Trash2, Eye } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Trade, TradeDirection, TradeResult, ExecutionQuality } from '../data/mockData';

const getEmotionBadge = (emotion?: string) => {
  if (!emotion) return null;
  const map: Record<string, string> = {
    'Calm': '😌', 'Anxious': '😰', 'FOMO': '🥺', 'Confident': '😎',
    'Patient': '🧘', 'Nervous': '😬', 'Fearful': '😨', 'Greedy': '🤑',
    'Satisfied': '😊', 'Relieved': '😮‍💨', 'Frustrated': '😤', 'Angry': '😡'
  };
  return <span className="flex items-center gap-1"><span className="text-[10px]">{map[emotion] || '😐'}</span> {emotion}</span>;
};

export default function Journal() {
  const navigate = useNavigate();
  const { trades, addTrade, deleteTrade, accounts, activeAccountId, user, editingTradeId, setEditingTradeId, updateTrade } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('Trade Details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (editingTradeId) {
      const trade = trades.find(t => t.id === editingTradeId);
      if (trade) {
        setInstrument(trade.instrument);
        setDate(format(new Date(trade.date), 'yyyy-MM-dd'));
        setEntryTime(format(new Date(trade.date), 'HH:mm'));
        setDirection(trade.direction as any);
        setEntryPrice(trade.entry);
        setStopLoss(trade.stopLoss || 0);
        setTakeProfit(trade.takeProfit || 0);
        setExitPrice(trade.exit || '');
        setQuantity(trade.quantity || 0);
        setCommission(trade.commission || 0);
        setFees(trade.fees || 0);
        setPointValue(trade.pointValue || 0);
        setStrategy(trade.strategy || '');
        setSetup(trade.setup || '');
        setTimeframe(trade.timeframe || '');
        setSession(trade.session || '');
        setTags(trade.tags || '');
        setEmotionBefore(trade.emotionBefore || '');
        setEmotionDuring(trade.emotionDuring || '');
        setEmotionAfter(trade.emotionAfter || '');
        setConfidence(trade.confidence || 0);
        setExecutionQuality(trade.executionQuality || 'Good');
        setPreTradeThesis(trade.preTradeThesis || '');
        setPostTradeReview(trade.postTradeReview || '');
        setMistakes(trade.mistakes || '');
        setLesson(trade.lesson || '');
        setIsAdding(true);
      }
    }
  }, [editingTradeId, trades]);

  const handleCloseModal = () => {
    setIsAdding(false);
    setEditingTradeId(null);
  };

  
  // Trade Details State
  const [accountId, setAccountId] = useState(activeAccountId || (accounts[0]?.id || ''));
  const [instrument, setInstrument] = useState('Gold (XAUUSD)');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entryTime, setEntryTime] = useState('09:30');
  const [exitTime, setExitTime] = useState('');
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [entryPrice, setEntryPrice] = useState<number | ''>('');
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [takeProfit, setTakeProfit] = useState<number | ''>('');
  const [exitPrice, setExitPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [commission, setCommission] = useState<number | ''>(0);
  const [fees, setFees] = useState<number | ''>(0);
  const [pointValue, setPointValue] = useState<number | ''>(100);
  const [strategy, setStrategy] = useState('Breakout');
  const [setup, setSetup] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [session, setSession] = useState('New York');
  const [tags, setTags] = useState('');

  // Psychology & Review State
  const [emotionBefore, setEmotionBefore] = useState('');
  const [emotionDuring, setEmotionDuring] = useState('');
  const [emotionAfter, setEmotionAfter] = useState('');
  const [confidence, setConfidence] = useState<number>(5);
  const [executionQuality, setExecutionQuality] = useState<ExecutionQuality>('Average');
  const [preTradeThesis, setPreTradeThesis] = useState('');
  const [postTradeReview, setPostTradeReview] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [lesson, setLesson] = useState('');
  const [notes, setNotes] = useState('');

  // Screenshots State
  const [screenshotBeforeFile, setScreenshotBeforeFile] = useState<File | null>(null);
  const [screenshotBeforePreview, setScreenshotBeforePreview] = useState<string | null>(null);
  const [screenshotDuringFile, setScreenshotDuringFile] = useState<File | null>(null);
  const [screenshotDuringPreview, setScreenshotDuringPreview] = useState<string | null>(null);
  const [screenshotAfterFile, setScreenshotAfterFile] = useState<File | null>(null);
  const [screenshotAfterPreview, setScreenshotAfterPreview] = useState<string | null>(null);

  // Live calculations
  const stats = useMemo(() => {
    const entry = Number(entryPrice) || 0;
    const exit = Number(exitPrice) || 0;
    const sl = Number(stopLoss) || 0;
    const tp = Number(takeProfit) || 0;
    const qty = Number(quantity) || 0;
    const ptVal = Number(pointValue) || 1;
    const comm = Number(commission) || 0;
    const fee = Number(fees) || 0;

    let pointsGained = 0;
    if (entry > 0 && exit > 0) {
      pointsGained = direction === 'Long' ? (exit - entry) : (entry - exit);
    }
    const grossPnl = pointsGained * qty * ptVal;
    const netPnl = grossPnl - comm - fee;
    
    let risk = 0;
    if (entry > 0 && sl > 0) {
      risk = Math.abs(entry - sl) * qty * ptVal;
    }
    
    let rr = 0;
    if (entry > 0 && sl > 0 && tp > 0) {
      const riskPts = Math.abs(entry - sl);
      if (riskPts > 0) rr = Math.abs(tp - entry) / riskPts;
    }

    let rMultiple = 0;
    if (risk > 0 && (entry > 0 && exit > 0)) {
      rMultiple = netPnl / risk;
    }

    return { grossPnl, netPnl, risk, rr, rMultiple };
  }, [entryPrice, exitPrice, stopLoss, takeProfit, quantity, pointValue, commission, fees, direction]);

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Must be logged in to save trades");
    setIsSubmitting(true);
    
    try {
      const existingTrade = editingTradeId ? trades.find(t => t.id === editingTradeId) : null;
      let sbUrl = existingTrade ? existingTrade.screenshotBefore : null;
      let sdUrl = existingTrade ? existingTrade.screenshotDuring : null;
      let saUrl = existingTrade ? existingTrade.screenshotAfter : null;
      
      if (screenshotBeforeFile) sbUrl = await uploadScreenshot(screenshotBeforeFile, user.id);
      if (screenshotDuringFile) sdUrl = await uploadScreenshot(screenshotDuringFile, user.id);
      if (screenshotAfterFile) saUrl = await uploadScreenshot(screenshotAfterFile, user.id);

      let result: TradeResult = 'Break Even';
      if (stats.netPnl > 0) result = 'Win';
      if (stats.netPnl < 0) result = 'Loss';

      const tradeData = {
        user_id: user.id,
        date: new Date(`${date}T${entryTime || '00:00'}`).toISOString(),
        instrument, direction, setup: setup || strategy,
        entry_price: Number(entryPrice) || 0,
        stop_loss: Number(stopLoss) || 0, take_profit: Number(takeProfit) || 0, exit_price: Number(exitPrice) || 0,
        risk_amount: stats.risk, pnl: stats.netPnl, rr: Number(stats.rMultiple.toFixed(2)), result,
        quantity: Number(quantity) || 0, commission: Number(commission) || 0, fees: Number(fees) || 0, point_value: Number(pointValue) || 100,
        strategy, timeframe, session, tags: tags || '', emotion_before: emotionBefore, emotion_during: emotionDuring, emotion_after: emotionAfter,
        confidence, execution_quality: executionQuality, pre_trade_thesis: preTradeThesis, post_trade_review: postTradeReview,
        mistakes, lesson, screenshot_before: sbUrl, screenshot_during: sdUrl, screenshot_after: saUrl,
      };

      
      let data, error;
      if (editingTradeId) {
        const res = await supabase.from('trades').update(tradeData).eq('id', editingTradeId).select().single();
        data = res.data;
        error = res.error;
      } else {
        const res = await supabase.from('trades').insert([tradeData]).select().single();
        data = res.data;
        error = res.error;
      }

      if (error) throw error;

      
      if (editingTradeId) {
        updateTrade({
          ...data, id: data.id, entry: data.entry_price, exit: data.exit_price, stopLoss: data.stop_loss, takeProfit: data.take_profit,
          screenshotBefore: data.screenshot_before, screenshotDuring: data.screenshot_during, screenshotAfter: data.screenshot_after,
          pointValue: data.point_value, riskAmount: data.risk_amount
        });
      } else {
        addTrade({

        ...data, id: data.id, entry: data.entry_price, exit: data.exit_price, stopLoss: data.stop_loss, takeProfit: data.take_profit,
        screenshotBefore: data.screenshot_before, screenshotDuring: data.screenshot_during, screenshotAfter: data.screenshot_after,
        pointValue: data.point_value, riskAmount: data.risk_amount
      });
      }
      handleCloseModal();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error saving trade: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setInstrument('Gold (XAUUSD)'); setEntryPrice(''); setStopLoss(''); setTakeProfit(''); setExitPrice('');
    setQuantity(1); setCommission(0); setFees(0); setPointValue(100); setSetup(''); setTags('');
    setEmotionBefore(''); setEmotionDuring(''); setEmotionAfter(''); setConfidence(5); setExecutionQuality('Average');
    setPreTradeThesis(''); setPostTradeReview(''); setMistakes(''); setLesson(''); setNotes('');
    setScreenshotBeforeFile(null); setScreenshotBeforePreview(null);
    setScreenshotDuringFile(null); setScreenshotDuringPreview(null);
    setScreenshotAfterFile(null); setScreenshotAfterPreview(null);
    setActiveTab('Trade Details');
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5 pb-12 max-w-[1400px] mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-1">Trading Journal</p>
          <h1 className="text-2xl font-medium tracking-tight text-[#e5e5e5]">Trade Log</h1>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[#d97757] hover:bg-[#c46547] text-[#131314] px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(217,119,87,0.3)]"
        >
          <Plus className="w-4 h-4" /> Log Trade
        </button>
      </div>

      {/* ── Live Stats Bar ───────────────────────────────────────────────── */}
      {trades.length > 0 && (() => {
        const wins = trades.filter(t => t.result === 'Win').length;
        const losses = trades.filter(t => t.result === 'Loss').length;
        const total = wins + losses;
        const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
        const winRate = total > 0 ? (wins / total) * 100 : 0;
        const grossWin = trades.filter(t => t.result === 'Win').reduce((s, t) => s + t.pnl, 0);
        const grossLoss = Math.abs(trades.filter(t => t.result === 'Loss').reduce((s, t) => s + t.pnl, 0));
        const pf = grossLoss > 0 ? grossWin / grossLoss : Infinity;
        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total Trades', value: trades.length, color: '#e5e5e5' },
              { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: winRate >= 50 ? '#10b981' : '#ef4444' },
              { label: 'Wins', value: wins, color: '#10b981' },
              { label: 'Losses', value: losses, color: '#ef4444' },
              { label: 'Net P&L', value: `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: totalPnl >= 0 ? '#10b981' : '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-[#8c8c8c] uppercase tracking-wider font-semibold mb-1">{s.label}</p>
                <p className="text-xl font-medium tracking-tight" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-xl flex items-center gap-3 px-4 py-3">
        <Search className="w-4 h-4 text-[#8c8c8c] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by instrument, strategy, session..."
          className="w-full bg-transparent text-sm text-[#e5e5e5] placeholder:text-[#8c8c8c] focus:outline-none"
        />
      </div>

      {/* ── Trade List ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#18181b]/40 backdrop-blur-xl border border-white/5 rounded-2xl gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <Plus className="w-7 h-7 text-[#8c8c8c]" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-[#e5e5e5] mb-1">No trades logged yet</p>
              <p className="text-sm text-[#8c8c8c]">Start your journal by recording your first trade.</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 px-5 py-2.5 bg-[#d97757] hover:bg-[#c46547] text-[#131314] rounded-xl text-sm font-semibold transition-colors"
            >
              Log First Trade
            </button>
          </div>
        ) : (
          [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(trade => {
            const imgUrl = trade.screenshotBefore || trade.screenshotDuring || trade.screenshotAfter;
            const isWin = trade.pnl >= 0;
            return (
              <div
                key={trade.id}
                onClick={() => navigate(`/dashboard/trade/${trade.id}`)}
                className="group bg-[#18181b]/40 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:bg-[#18181b]/60"
              >
                {/* Color bar at top */}
                <div className={`h-0.5 w-full ${isWin ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} />

                <div className="flex gap-0 p-0">
                  {/* Screenshot thumbnail */}
                  {imgUrl && (
                    <div className="w-36 flex-shrink-0 bg-black/30 overflow-hidden relative">
                      <img src={imgUrl} alt="chart" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#18181b]/60" />
                    </div>
                  )}

                  <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest border ${trade.direction === 'Long' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/25' : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/25'}`}>
                          {trade.direction.toUpperCase()}
                        </span>
                        <span className="text-base font-semibold text-[#e5e5e5] tracking-tight">{trade.instrument}</span>
                        <span className="text-xs text-[#8c8c8c]">{format(new Date(trade.date), 'MMM d, yyyy · h:mm a')}</span>
                        {trade.strategy && (
                          <span className="px-2 py-0.5 text-[10px] font-medium text-[#d97757] bg-[#d97757]/10 border border-[#d97757]/20 rounded-md">
                            {trade.strategy}
                          </span>
                        )}
                        {trade.session && (
                          <span className="px-2 py-0.5 text-[10px] font-medium text-[#8c8c8c] bg-white/5 border border-white/10 rounded-md">
                            {trade.session}
                          </span>
                        )}
                      </div>
                      {/* P&L + R */}
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <div className="text-right">
                          <p className={`text-xl font-semibold tracking-tight ${isWin ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                            {isWin ? '+' : ''}${Math.abs(trade.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                          {trade.rr !== 0 && (
                            <p className={`text-xs font-medium ${trade.rr > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                              {trade.rr > 0 ? '+' : ''}{trade.rr.toFixed(2)}R
                            </p>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                          trade.result === 'Win' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' :
                          trade.result === 'Loss' ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20' :
                          'bg-white/5 text-[#8c8c8c] border-white/10'
                        }`}>
                          {trade.result}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-[#8c8c8c]">
                        <span>Entry <span className="text-[#e5e5e5] font-medium">{trade.entry}</span></span>
                        {trade.exit > 0 && <span>Exit <span className="text-[#e5e5e5] font-medium">{trade.exit}</span></span>}
                        {trade.stopLoss > 0 && <span>SL <span className="text-[#ef4444] font-medium">{trade.stopLoss}</span></span>}
                        {trade.quantity && <span>Qty <span className="text-[#e5e5e5] font-medium">{trade.quantity}</span></span>}
                        {trade.emotionBefore && (
                          <span className="flex items-center gap-1">
                            {getEmotionBadge(trade.emotionBefore)}
                          </span>
                        )}
                      </div>
                      {/* Hover actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/dashboard/trade/${trade.id}`); }}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-[#8c8c8c] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setEditingTradeId(trade.id); }}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-[#8c8c8c] hover:text-[#d97757] px-3 py-1.5 rounded-lg hover:bg-[#d97757]/5 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this trade?')) deleteTrade(trade.id);
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-[#8c8c8c] hover:text-[#ef4444] px-3 py-1.5 rounded-lg hover:bg-[#ef4444]/5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d24] border border-[#2d323e] rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center p-4 border-b border-[#2d323e]">
              <h2 className="text-lg font-bold text-white">{editingTradeId ? 'Edit Trade' : 'Log New Trade'}</h2>
              <button onClick={() => handleCloseModal()} className="text-textMuted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex px-4 border-b border-[#2d323e]">
              {[
                { name: 'Trade Details', label: 'Trade Details' },
                { name: 'Psychology & Review', label: 'Psychology & Review' },
                { name: 'Screenshots', label: `Screenshots (${[screenshotBeforeFile, screenshotDuringFile, screenshotAfterFile].filter(Boolean).length})` }
              ].map(tab => (
                <button 
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.name ? 'border-primary text-white' : 'border-transparent text-textMuted hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <form id="tradeForm" onSubmit={handleAddTrade} className="space-y-6">
                
                {activeTab === 'Trade Details' && (
                  <>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Account <span className="text-danger">*</span></label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Instrument <span className="text-danger">*</span></label>
                        <select value={instrument} onChange={e => setInstrument(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          <option value="Gold (XAUUSD)">Gold (XAUUSD)</option>
                          <option value="NQ">NQ</option>
                          <option value="ES">ES</option>
                          <option value="EURUSD">EURUSD</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Date <span className="text-danger">*</span></label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" required  />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Entry Time <span className="text-danger">*</span></label>
                        <input type="time" value={entryTime} onChange={e => setEntryTime(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" required  />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Exit Time</label>
                        <input type="time" value={exitTime} onChange={e => setExitTime(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Direction <span className="text-danger">*</span></label>
                        <select value={direction} onChange={e => setDirection(e.target.value as TradeDirection)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          <option value="Long">Long</option>
                          <option value="Short">Short</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Entry Price <span className="text-danger">*</span></label>
                        <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" required  />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Stop Loss</label>
                        <input type="number" step="any" value={stopLoss} onChange={e => setStopLoss(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Take Profit</label>
                        <input type="number" step="any" value={takeProfit} onChange={e => setTakeProfit(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Exit Price</label>
                        <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Quantity / Contracts <span className="text-danger">*</span></label>
                        <input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" required  />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Commission</label>
                        <input type="number" step="any" value={commission} onChange={e => setCommission(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Fees</label>
                        <input type="number" step="any" value={fees} onChange={e => setFees(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Point Value Override</label>
                        <input type="number" step="any" value={pointValue} onChange={e => setPointValue(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Strategy <span className="text-danger">*</span></label>
                        <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          <option value="Breakout">Breakout</option>
                          <option value="Pullback">Pullback</option>
                          <option value="Reversal">Reversal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Setup</label>
                        <input type="text" placeholder="e.g. Opening range breakout" value={setup} onChange={e => setSetup(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Timeframe</label>
                        <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          <option value="—">—</option>
                          <option value="1m">1m</option>
                          <option value="5m">5m</option>
                          <option value="15m">15m</option>
                          <option value="1H">1H</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Session</label>
                        <select value={session} onChange={e => setSession(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          <option value="New York">New York</option>
                          <option value="London">London</option>
                          <option value="Tokyo">Tokyo</option>
                          <option value="Sydney">Sydney</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-textMuted mb-1.5">Notes / Tags</label>
                      <input type="text" placeholder="Write some quick notes or tags..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none" />
                    </div>
                  </>
                )}

                {activeTab === 'Psychology & Review' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Emotion Before Trade</label>
                        <select value={emotionBefore} onChange={e => setEmotionBefore(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          <option value="">—</option>
                          <option value="Calm">Calm</option>
                          <option value="Anxious">Anxious</option>
                          <option value="FOMO">FOMO</option>
                          <option value="Confident">Confident</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Emotion During Trade</label>
                        <select value={emotionDuring} onChange={e => setEmotionDuring(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          <option value="">—</option>
                          <option value="Patient">Patient</option>
                          <option value="Nervous">Nervous</option>
                          <option value="Fearful">Fearful</option>
                          <option value="Greedy">Greedy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Emotion After Trade</label>
                        <select value={emotionAfter} onChange={e => setEmotionAfter(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none">
                          <option value="">—</option>
                          <option value="Satisfied">Satisfied</option>
                          <option value="Relieved">Relieved</option>
                          <option value="Frustrated">Frustrated</option>
                          <option value="Angry">Angry</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Confidence ({confidence}/10)</label>
                        <input type="range" min="1" max="10" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full accent-primary mt-2" />
                        <div className="flex justify-between text-[10px] text-textMuted mt-1">
                          <span>Low (1)</span><span>High (10)</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Execution Quality</label>
                        <div className="flex gap-2 mt-1">
                          {['Poor', 'Average', 'Good', 'Excellent'].map(quality => (
                            <button
                              key={quality}
                              type="button"
                              onClick={() => setExecutionQuality(quality as ExecutionQuality)}
                              className={`flex-1 py-2 rounded border text-xs font-medium transition-colors ${executionQuality === quality ? 'border-primary bg-primary/10 text-primary' : 'border-[#2d323e] bg-[#13151a] text-textMuted hover:text-white hover:border-gray-500'}`}
                            >
                              {quality}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Pre-Trade Thesis</label>
                        <textarea rows={3} value={preTradeThesis} onChange={e => setPreTradeThesis(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Post-Trade Review</label>
                        <textarea rows={3} value={postTradeReview} onChange={e => setPostTradeReview(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Mistakes</label>
                        <textarea rows={2} value={mistakes} onChange={e => setMistakes(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-textMuted mb-1.5">Lesson</label>
                        <textarea rows={2} value={lesson} onChange={e => setLesson(e.target.value)} className="w-full bg-[#13151a] border border-[#2d323e] rounded-md px-3 py-2.5 text-sm text-white focus:border-primary outline-none resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Screenshots' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Before Entry */}
                    <div className="flex flex-col border border-[#2d323e] bg-[#13151a] rounded-lg overflow-hidden">
                      <div className="p-3 border-b border-[#2d323e] flex justify-between items-center bg-[#1a1d24]">
                        <span className="text-sm font-semibold text-white">Before Entry</span>
                        {screenshotBeforePreview && (
                          <button type="button" onClick={() => { setScreenshotBeforeFile(null); setScreenshotBeforePreview(null); }} className="text-textMuted hover:text-danger"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[200px]">
                        {screenshotBeforePreview ? (
                          <img src={screenshotBeforePreview} alt="Before Entry" className="max-h-48 object-contain rounded" />
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-textMuted hover:text-white transition-colors border-2 border-dashed border-[#2d323e] rounded-lg p-6 hover:border-primary hover:bg-primary/5">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium text-center">Click to upload or drag image here</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setScreenshotBeforeFile, setScreenshotBeforePreview)} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* During Entry */}
                    <div className="flex flex-col border border-[#2d323e] bg-[#13151a] rounded-lg overflow-hidden">
                      <div className="p-3 border-b border-[#2d323e] flex justify-between items-center bg-[#1a1d24]">
                        <span className="text-sm font-semibold text-white">During Entry</span>
                        {screenshotDuringPreview && (
                          <button type="button" onClick={() => { setScreenshotDuringFile(null); setScreenshotDuringPreview(null); }} className="text-textMuted hover:text-danger"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[200px]">
                        {screenshotDuringPreview ? (
                          <img src={screenshotDuringPreview} alt="During Entry" className="max-h-48 object-contain rounded" />
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-textMuted hover:text-white transition-colors border-2 border-dashed border-[#2d323e] rounded-lg p-6 hover:border-primary hover:bg-primary/5">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium text-center">Click to upload or drag image here</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setScreenshotDuringFile, setScreenshotDuringPreview)} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* After Entry */}
                    <div className="flex flex-col border border-[#2d323e] bg-[#13151a] rounded-lg overflow-hidden">
                      <div className="p-3 border-b border-[#2d323e] flex justify-between items-center bg-[#1a1d24]">
                        <span className="text-sm font-semibold text-white">After Entry</span>
                        {screenshotAfterPreview && (
                          <button type="button" onClick={() => { setScreenshotAfterFile(null); setScreenshotAfterPreview(null); }} className="text-textMuted hover:text-danger"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[200px]">
                        {screenshotAfterPreview ? (
                          <img src={screenshotAfterPreview} alt="After Entry" className="max-h-48 object-contain rounded" />
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-textMuted hover:text-white transition-colors border-2 border-dashed border-[#2d323e] rounded-lg p-6 hover:border-primary hover:bg-primary/5">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium text-center">Click to upload or drag image here</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setScreenshotAfterFile, setScreenshotAfterPreview)} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Bottom Bar Stats & Save */}
            <div className="p-4 border-t border-[#2d323e] bg-[#1a1d24] mt-auto">
              <div className="flex justify-between items-center bg-[#13151a] rounded-lg border border-[#2d323e] px-6 py-4 mb-4">
                <div>
                  <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Gross P&L</p>
                  <p className={`text-lg font-bold ${stats.grossPnl > 0 ? 'text-success' : stats.grossPnl < 0 ? 'text-danger' : 'text-textMuted'}`}>
                    {stats.grossPnl > 0 ? '+' : ''}${stats.grossPnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Net P&L</p>
                  <p className={`text-lg font-bold ${stats.netPnl > 0 ? 'text-success' : stats.netPnl < 0 ? 'text-danger' : 'text-textMuted'}`}>
                    {stats.netPnl > 0 ? '+' : ''}${stats.netPnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Risk</p>
                  <p className="text-lg font-bold text-white">
                    {stats.risk > 0 ? `$${stats.risk.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">R:R</p>
                  <p className="text-lg font-bold text-white">
                    {stats.rr > 0 ? `1:${stats.rr.toFixed(2)}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">R-Multiple</p>
                  <p className={`text-lg font-bold ${stats.rMultiple > 0 ? 'text-success' : stats.rMultiple < 0 ? 'text-danger' : 'text-textMuted'}`}>
                    {stats.rMultiple !== 0 ? `${stats.rMultiple > 0 ? '+' : ''}${stats.rMultiple.toFixed(2)}R` : '—'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => handleCloseModal()} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-textMain hover:text-white transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" form="tradeForm" disabled={isSubmitting} className="btn-cendrix-gold px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Trade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
