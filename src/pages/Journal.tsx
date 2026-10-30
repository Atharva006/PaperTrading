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
    <div className="space-y-5 pb-12 max-w-[1400px] mx-auto text-[#111114]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D9E2F2] pb-5">
        <div>
          <p className="text-[10px] text-[#536CF0] uppercase tracking-wider font-semibold font-mono mb-1">Trading Journal</p>
          <h1 className="text-2xl font-bold font-display tracking-tight text-[#00225A]">Trade Log</h1>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[#00225A] hover:bg-[#536CF0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
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
              { label: 'Total Trades', value: trades.length, color: '#00225A' },
              { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: winRate >= 50 ? '#12B76A' : '#D92D20' },
              { label: 'Wins', value: wins, color: '#12B76A' },
              { label: 'Losses', value: losses, color: '#D92D20' },
              { label: 'Net P&L', value: `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: totalPnl >= 0 ? '#12B76A' : '#D92D20' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-[#D9E2F2] rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
                <p className="text-[10px] text-[#6B7A90] uppercase tracking-wider font-semibold mb-1">{s.label}</p>
                <p className="text-xl font-bold font-mono tracking-tight" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E2F2] rounded-xl flex items-center gap-3 px-4 py-3 shadow-xs">
        <Search className="w-4 h-4 text-[#6B7A90] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by instrument, strategy, session..."
          className="w-full bg-transparent text-sm text-[#111114] placeholder:text-[#6B7A90]/60 focus:outline-none"
        />
      </div>

      {/* ── Trade List ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-[#D9E2F2] rounded-2xl gap-4 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F8FA] border border-[#D9E2F2] flex items-center justify-center">
              <Plus className="w-7 h-7 text-[#6B7A90]" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold font-display text-[#00225A] mb-1">No trades logged yet</p>
              <p className="text-sm text-[#6B7A90]">Start your journal by recording your first trade.</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 px-5 py-2.5 bg-[#00225A] hover:bg-[#536CF0] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
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
                className="group bg-white border border-[#D9E2F2] hover:border-[#536CF0]/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,34,90,0.06)]"
              >
                {/* Color bar at top */}
                <div className={`h-0.5 w-full ${isWin ? 'bg-[#12B76A]' : 'bg-[#D92D20]'}`} />

                <div className="flex gap-0 p-0">
                  {/* Screenshot thumbnail */}
                  {imgUrl && (
                    <div className="w-36 flex-shrink-0 bg-[#F7F8FA] border-r border-[#D9E2F2] overflow-hidden relative">
                      <img src={imgUrl} alt="chart" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest border ${trade.direction === 'Long' ? 'bg-[#12B76A]/10 text-[#12B76A] border-[#12B76A]/25' : 'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/25'}`}>
                          {trade.direction.toUpperCase()}
                        </span>
                        <span className="text-base font-bold font-display text-[#00225A] tracking-tight">{trade.instrument}</span>
                        <span className="text-xs text-[#6B7A90] font-mono">{format(new Date(trade.date), 'MMM d, yyyy · h:mm a')}</span>
                        {trade.strategy && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold text-[#00225A] bg-[#EEF3FF] border border-[#D9E2F2] rounded-md font-mono">
                            {trade.strategy}
                          </span>
                        )}
                        {trade.session && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold text-[#6B7A90] bg-[#F7F8FA] border border-[#D9E2F2] rounded-md font-mono">
                            {trade.session}
                          </span>
                        )}
                      </div>
                      {/* P&L + R */}
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <div className="text-right font-mono">
                          <p className={`text-xl font-bold tracking-tight ${isWin ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                            {isWin ? '+' : ''}${Math.abs(trade.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                          {trade.rr !== 0 && (
                            <p className={`text-xs font-semibold ${trade.rr > 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                              {trade.rr > 0 ? '+' : ''}{trade.rr.toFixed(2)}R
                            </p>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border font-mono ${
                          trade.result === 'Win' ? 'bg-[#12B76A]/10 text-[#12B76A] border-[#12B76A]/20' :
                          trade.result === 'Loss' ? 'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/20' :
                          'bg-[#F7F8FA] text-[#6B7A90] border-[#D9E2F2]'
                        }`}>
                          {trade.result}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-[#6B7A90] font-mono">
                        <span>Entry <span className="text-[#00225A] font-semibold">{trade.entry}</span></span>
                        {trade.exit > 0 && <span>Exit <span className="text-[#00225A] font-semibold">{trade.exit}</span></span>}
                        {trade.stopLoss > 0 && <span>SL <span className="text-[#D92D20] font-semibold">{trade.stopLoss}</span></span>}
                        {trade.quantity && <span>Qty <span className="text-[#00225A] font-semibold">{trade.quantity}</span></span>}
                        {trade.emotionBefore && (
                          <span className="flex items-center gap-1 font-sans">
                            {getEmotionBadge(trade.emotionBefore)}
                          </span>
                        )}
                      </div>
                      {/* Hover actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/dashboard/trade/${trade.id}`); }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7A90] hover:text-[#00225A] px-3 py-1.5 rounded-lg hover:bg-[#F7F8FA] transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setEditingTradeId(trade.id); }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7A90] hover:text-[#536CF0] px-3 py-1.5 rounded-lg hover:bg-[#EEF3FF] transition-all cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this trade?')) deleteTrade(trade.id);
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7A90] hover:text-[#D92D20] px-3 py-1.5 rounded-lg hover:bg-[#D92D20]/5 transition-all cursor-pointer"
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
        <div className="fixed inset-0 bg-[#00225A]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E2F2] rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] text-[#111114]">
            <div className="flex justify-between items-center p-4 border-b border-[#D9E2F2] bg-[#F7F8FA]">
              <h2 className="text-lg font-bold font-display text-[#00225A]">{editingTradeId ? 'Edit Trade' : 'Log New Trade'}</h2>
              <button onClick={() => handleCloseModal()} className="text-[#6B7A90] hover:text-[#00225A] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex px-4 border-b border-[#D9E2F2] bg-[#F7F8FA]">
              {[
                { name: 'Trade Details', label: 'Trade Details' },
                { name: 'Psychology & Review', label: 'Psychology & Review' },
                { name: 'Screenshots', label: `Screenshots (${[screenshotBeforeFile, screenshotDuringFile, screenshotAfterFile].filter(Boolean).length})` }
              ].map(tab => (
                <button 
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === tab.name ? 'border-[#00225A] text-[#00225A]' : 'border-transparent text-[#6B7A90] hover:text-[#00225A]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-6 bg-white">
              <form id="tradeForm" onSubmit={handleAddTrade} className="space-y-6">
                
                {activeTab === 'Trade Details' && (
                  <>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Account <span className="text-[#D92D20]">*</span></label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
                          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Instrument <span className="text-[#D92D20]">*</span></label>
                        <select value={instrument} onChange={e => setInstrument(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
                          <option value="Gold (XAUUSD)">Gold (XAUUSD)</option>
                          <option value="NQ">NQ</option>
                          <option value="ES">ES</option>
                          <option value="EURUSD">EURUSD</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Date <span className="text-[#D92D20]">*</span></label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" required  />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Entry Time <span className="text-[#D92D20]">*</span></label>
                        <input type="time" value={entryTime} onChange={e => setEntryTime(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" required  />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Exit Time</label>
                        <input type="time" value={exitTime} onChange={e => setExitTime(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Direction <span className="text-[#D92D20]">*</span></label>
                        <select value={direction} onChange={e => setDirection(e.target.value as TradeDirection)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
                          <option value="Long">Long</option>
                          <option value="Short">Short</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Entry Price <span className="text-[#D92D20]">*</span></label>
                        <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" required  />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Stop Loss</label>
                        <input type="number" step="any" value={stopLoss} onChange={e => setStopLoss(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Take Profit</label>
                        <input type="number" step="any" value={takeProfit} onChange={e => setTakeProfit(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Exit Price</label>
                        <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Quantity / Contracts <span className="text-[#D92D20]">*</span></label>
                        <input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" required  />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Commission</label>
                        <input type="number" step="any" value={commission} onChange={e => setCommission(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Fees</label>
                        <input type="number" step="any" value={fees} onChange={e => setFees(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Point Value Override</label>
                        <input type="number" step="any" value={pointValue} onChange={e => setPointValue(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Strategy <span className="text-[#D92D20]">*</span></label>
                        <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
                          <option value="Breakout">Breakout</option>
                          <option value="Pullback">Pullback</option>
                          <option value="Reversal">Reversal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Setup</label>
                        <input type="text" placeholder="e.g. Opening range breakout" value={setup} onChange={e => setSetup(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Timeframe</label>
                        <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
                          <option value="—">—</option>
                          <option value="1m">1m</option>
                          <option value="5m">5m</option>
                          <option value="15m">15m</option>
                          <option value="1H">1H</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Session</label>
                        <select value={session} onChange={e => setSession(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
                          <option value="New York">New York</option>
                          <option value="London">London</option>
                          <option value="Tokyo">Tokyo</option>
                          <option value="Sydney">Sydney</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Notes / Tags</label>
                      <input type="text" placeholder="Write some quick notes or tags..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none" />
                    </div>
                  </>
                )}

                {activeTab === 'Psychology & Review' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Emotion Before Trade</label>
                        <select value={emotionBefore} onChange={e => setEmotionBefore(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
                          <option value="">—</option>
                          <option value="Calm">Calm</option>
                          <option value="Anxious">Anxious</option>
                          <option value="FOMO">FOMO</option>
                          <option value="Confident">Confident</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Emotion During Trade</label>
                        <select value={emotionDuring} onChange={e => setEmotionDuring(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
                          <option value="">—</option>
                          <option value="Patient">Patient</option>
                          <option value="Nervous">Nervous</option>
                          <option value="Fearful">Fearful</option>
                          <option value="Greedy">Greedy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Emotion After Trade</label>
                        <select value={emotionAfter} onChange={e => setEmotionAfter(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none">
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
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Confidence ({confidence}/10)</label>
                        <input type="range" min="1" max="10" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full accent-[#00225A] mt-2 cursor-pointer" />
                        <div className="flex justify-between text-[10px] text-[#6B7A90] mt-1 font-mono">
                          <span>Low (1)</span><span>High (10)</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Execution Quality</label>
                        <div className="flex gap-2 mt-1">
                          {['Poor', 'Average', 'Good', 'Excellent'].map(quality => (
                            <button
                              key={quality}
                              type="button"
                              onClick={() => setExecutionQuality(quality as ExecutionQuality)}
                              className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${executionQuality === quality ? 'border-[#00225A] bg-[#EEF3FF] text-[#00225A]' : 'border-[#D9E2F2] bg-[#F7F8FA] text-[#6B7A90] hover:text-[#00225A] hover:border-[#00225A]'}`}
                            >
                              {quality}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Pre-Trade Thesis</label>
                        <textarea rows={3} value={preTradeThesis} onChange={e => setPreTradeThesis(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Post-Trade Review</label>
                        <textarea rows={3} value={postTradeReview} onChange={e => setPostTradeReview(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Mistakes</label>
                        <textarea rows={2} value={mistakes} onChange={e => setMistakes(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">Lesson</label>
                        <textarea rows={2} value={lesson} onChange={e => setLesson(e.target.value)} className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3 py-2.5 text-sm text-[#111114] focus:border-[#536CF0] focus:bg-white outline-none resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Screenshots' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Before Entry */}
                    <div className="flex flex-col border border-[#D9E2F2] bg-[#F7F8FA] rounded-xl overflow-hidden">
                      <div className="p-3 border-b border-[#D9E2F2] flex justify-between items-center bg-white">
                        <span className="text-sm font-semibold text-[#00225A]">Before Entry</span>
                        {screenshotBeforePreview && (
                          <button type="button" onClick={() => { setScreenshotBeforeFile(null); setScreenshotBeforePreview(null); }} className="text-[#6B7A90] hover:text-[#D92D20] cursor-pointer"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[200px]">
                        {screenshotBeforePreview ? (
                          <img src={screenshotBeforePreview} alt="Before Entry" className="max-h-48 object-contain rounded-xl" />
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-[#6B7A90] hover:text-[#00225A] transition-colors border-2 border-dashed border-[#D9E2F2] rounded-xl p-6 hover:border-[#536CF0] hover:bg-white">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium text-center">Click to upload or drag image here</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setScreenshotBeforeFile, setScreenshotBeforePreview)} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* During Entry */}
                    <div className="flex flex-col border border-[#D9E2F2] bg-[#F7F8FA] rounded-xl overflow-hidden">
                      <div className="p-3 border-b border-[#D9E2F2] flex justify-between items-center bg-white">
                        <span className="text-sm font-semibold text-[#00225A]">During Entry</span>
                        {screenshotDuringPreview && (
                          <button type="button" onClick={() => { setScreenshotDuringFile(null); setScreenshotDuringPreview(null); }} className="text-[#6B7A90] hover:text-[#D92D20] cursor-pointer"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[200px]">
                        {screenshotDuringPreview ? (
                          <img src={screenshotDuringPreview} alt="During Entry" className="max-h-48 object-contain rounded-xl" />
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-[#6B7A90] hover:text-[#00225A] transition-colors border-2 border-dashed border-[#D9E2F2] rounded-xl p-6 hover:border-[#536CF0] hover:bg-white">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium text-center">Click to upload or drag image here</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setScreenshotDuringFile, setScreenshotDuringPreview)} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* After Entry */}
                    <div className="flex flex-col border border-[#D9E2F2] bg-[#F7F8FA] rounded-xl overflow-hidden">
                      <div className="p-3 border-b border-[#D9E2F2] flex justify-between items-center bg-white">
                        <span className="text-sm font-semibold text-[#00225A]">After Entry</span>
                        {screenshotAfterPreview && (
                          <button type="button" onClick={() => { setScreenshotAfterFile(null); setScreenshotAfterPreview(null); }} className="text-[#6B7A90] hover:text-[#D92D20] cursor-pointer"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[200px]">
                        {screenshotAfterPreview ? (
                          <img src={screenshotAfterPreview} alt="After Entry" className="max-h-48 object-contain rounded-xl" />
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-[#6B7A90] hover:text-[#00225A] transition-colors border-2 border-dashed border-[#D9E2F2] rounded-xl p-6 hover:border-[#536CF0] hover:bg-white">
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
            <div className="p-4 border-t border-[#D9E2F2] bg-[#F7F8FA] mt-auto">
              <div className="flex justify-between items-center bg-white rounded-xl border border-[#D9E2F2] px-6 py-4 mb-4 shadow-xs font-mono">
                <div>
                  <p className="text-[10px] text-[#6B7A90] uppercase font-bold tracking-wider mb-1">Gross P&L</p>
                  <p className={`text-lg font-bold ${stats.grossPnl > 0 ? 'text-[#12B76A]' : stats.grossPnl < 0 ? 'text-[#D92D20]' : 'text-[#6B7A90]'}`}>
                    {stats.grossPnl > 0 ? '+' : ''}${stats.grossPnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7A90] uppercase font-bold tracking-wider mb-1">Net P&L</p>
                  <p className={`text-lg font-bold ${stats.netPnl > 0 ? 'text-[#12B76A]' : stats.netPnl < 0 ? 'text-[#D92D20]' : 'text-[#6B7A90]'}`}>
                    {stats.netPnl > 0 ? '+' : ''}${stats.netPnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7A90] uppercase font-bold tracking-wider mb-1">Risk</p>
                  <p className="text-lg font-bold text-[#00225A]">
                    {stats.risk > 0 ? `$${stats.risk.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7A90] uppercase font-bold tracking-wider mb-1">R:R</p>
                  <p className="text-lg font-bold text-[#00225A]">
                    {stats.rr > 0 ? `1:${stats.rr.toFixed(2)}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7A90] uppercase font-bold tracking-wider mb-1">R-Multiple</p>
                  <p className={`text-lg font-bold ${stats.rMultiple > 0 ? 'text-[#12B76A]' : stats.rMultiple < 0 ? 'text-[#D92D20]' : 'text-[#6B7A90]'}`}>
                    {stats.rMultiple !== 0 ? `${stats.rMultiple > 0 ? '+' : ''}${stats.rMultiple.toFixed(2)}R` : '—'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => handleCloseModal()} disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-[#6B7A90] hover:text-[#00225A] transition-colors disabled:opacity-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" form="tradeForm" disabled={isSubmitting} className="bg-[#00225A] hover:bg-[#536CF0] text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer">
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
