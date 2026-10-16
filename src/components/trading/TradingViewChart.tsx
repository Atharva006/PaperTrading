import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  CandlestickSeries, 
  HistogramSeries, 
  LineSeries,
  AreaSeries,
  ColorType, 
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type Time
} from 'lightweight-charts';
import { marketDataService } from '../../services/market/MarketDataService';
import { useTradingStore } from '../../store/useTradingStore';
import type { CandleInterval, OHLCV } from '../../types/market';
import { 
  RefreshCw, 
  Maximize2, 
  TrendingUp, 
  Sliders, 
  BarChart2, 
  Activity,
  Layers
} from 'lucide-react';

interface TradingViewChartProps {
  instrumentKey: string;
  tradingsymbol: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  instrumentKey,
  tradingsymbol,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [interval, setInterval] = useState<CandleInterval>('15minute');
  const [chartType, setChartType] = useState<'candles' | 'area'>('candles');
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Hover telemetry state (O, H, L, C, Vol)
  const [hoverData, setHoverData] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    change?: number;
    changePercent?: number;
  } | null>(null);

  const { quotes } = useTradingStore();
  const currentQuote = quotes[instrumentKey] || quotes[tradingsymbol];

  // Helper to calculate SMA
  const calculateSMA = (data: { time: Time; close: number }[], period = 20) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push({ time: data[i].time, value: Math.round((sum / period) * 100) / 100 });
    }
    return result;
  };

  // Helper to calculate EMA
  const calculateEMA = (data: { time: Time; close: number }[], period = 50) => {
    if (data.length < period) return [];
    const k = 2 / (period + 1);
    const result = [];
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i].close;
    let ema = sum / period;
    result.push({ time: data[period - 1].time, value: Math.round(ema * 100) / 100 });
    for (let i = period; i < data.length; i++) {
      ema = data[i].close * k + ema * (1 - k);
      result.push({ time: data[i].time, value: Math.round(ema * 100) / 100 });
    }
    return result;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create Chart with modern Deep Blue Fintech styling
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090e1a' },
        textColor: '#94a3b8',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#1d283f',
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#1d283f',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        autoScale: true,
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 12, // Distinct, visible candle thickness
        minBarSpacing: 4,
        rightOffset: 12,
      },
    });

    // 1. High-Contrast Vivid Candlesticks Series (Vibrant Green & Red with Borders & Wicks)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: true,
      borderUpColor: '#10b981',
      borderDownColor: '#f43f5e',
      wickVisible: true,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.05,
      },
    });

    // 2. Area Series (For Area view mode)
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(59, 130, 246, 0.4)',
      bottomColor: 'rgba(59, 130, 246, 0.0)',
      lineColor: '#3b82f6',
      lineWidth: 2,
      visible: false,
    });

    // 3. Technical Indicator: 20 SMA
    const smaSeries = chart.addSeries(LineSeries, {
      color: '#38bdf8', // Sky blue
      lineWidth: 2,
      priceLineVisible: false,
      title: 'SMA 20',
      visible: showSMA,
    });

    // 4. Technical Indicator: 50 EMA
    const emaSeries = chart.addSeries(LineSeries, {
      color: '#a855f7', // Purple
      lineWidth: 2,
      priceLineVisible: false,
      title: 'EMA 50',
      visible: showEMA,
    });

    // 5. Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3b82f6',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Overlay on bottom
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    areaSeriesRef.current = areaSeries;
    smaSeriesRef.current = smaSeries;
    emaSeriesRef.current = emaSeries;
    volumeSeriesRef.current = volumeSeries;

    // Crosshair hover listener for real-time OHLC telemetry
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }

      const candleData = param.seriesData.get(candleSeries) as any;
      const volData = param.seriesData.get(volumeSeries) as any;

      if (candleData && candleData.open !== undefined) {
        const change = candleData.close - candleData.open;
        const changePercent = candleData.open > 0 ? (change / candleData.open) * 100 : 0;
        setHoverData({
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volData?.value || 0,
          change,
          changePercent,
        });
      }
    });

    // Resize Observer to keep chart perfectly fitted
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Update visibility on state changes
  useEffect(() => {
    if (candleSeriesRef.current && areaSeriesRef.current) {
      candleSeriesRef.current.applyOptions({ visible: chartType === 'candles' });
      areaSeriesRef.current.applyOptions({ visible: chartType === 'area' });
    }
  }, [chartType]);

  useEffect(() => {
    if (smaSeriesRef.current) {
      smaSeriesRef.current.applyOptions({ visible: showSMA });
    }
  }, [showSMA]);

  useEffect(() => {
    if (emaSeriesRef.current) {
      emaSeriesRef.current.applyOptions({ visible: showEMA });
    }
  }, [showEMA]);

  useEffect(() => {
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({ visible: showVolume });
    }
  }, [showVolume]);

  const rawCandlesRef = useRef<OHLCV[]>([]);
  const lastCandleTimeRef = useRef<number>(0);

  // Fetch Candles on Instrument or Interval Change
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    marketDataService
      .getHistoricalCandles(instrumentKey, interval)
      .then((candles) => {
        if (isCancelled || !chartRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return;

        rawCandlesRef.current = candles;

        const formattedCandles = candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        const formattedAreas = candles.map((c) => ({
          time: c.time as Time,
          value: c.close,
        }));

        const formattedVolumes = candles.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
        }));

        if (formattedCandles.length > 0) {
          lastCandleTimeRef.current = Number(formattedCandles[formattedCandles.length - 1].time);
        }

        candleSeriesRef.current.setData(formattedCandles);
        if (areaSeriesRef.current) areaSeriesRef.current.setData(formattedAreas);
        volumeSeriesRef.current.setData(formattedVolumes);

        // Technical Indicators calculation
        if (smaSeriesRef.current) {
          const smaData = calculateSMA(formattedCandles, 20);
          smaSeriesRef.current.setData(smaData);
        }

        if (emaSeriesRef.current) {
          const emaData = calculateEMA(formattedCandles, 50);
          emaSeriesRef.current.setData(emaData);
        }

        chartRef.current.timeScale().fitContent();
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load chart data:', err);
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [instrumentKey, interval]);

  // Update latest candle in real-time on live tick
  useEffect(() => {
    if (!currentQuote || !candleSeriesRef.current || currentQuote.last_price <= 0) return;

    try {
      let barTime = Math.floor(Date.now() / 1000) - (Math.floor(Date.now() / 1000) % 60);
      if (lastCandleTimeRef.current > 0 && barTime < lastCandleTimeRef.current) {
        barTime = lastCandleTimeRef.current;
      }

      const openVal = currentQuote.open > 0 ? currentQuote.open : currentQuote.last_price;
      const highVal = Math.max(currentQuote.high || currentQuote.last_price, currentQuote.last_price);
      const lowVal = Math.min(currentQuote.low || currentQuote.last_price, currentQuote.last_price);

      candleSeriesRef.current.update({
        time: barTime as Time,
        open: openVal,
        high: highVal,
        low: lowVal,
        close: currentQuote.last_price,
      });

      if (areaSeriesRef.current) {
        areaSeriesRef.current.update({
          time: barTime as Time,
          value: currentQuote.last_price,
        });
      }
    } catch {
      // Ignore sequencing warnings
    }
  }, [currentQuote]);

  const intervals: { label: string; value: CandleInterval }[] = [
    { label: '1m', value: '1minute' },
    { label: '5m', value: '5minute' },
    { label: '15m', value: '15minute' },
    { label: '30m', value: '30minute' },
    { label: '1h', value: '1hour' },
    { label: '1D', value: 'day' },
  ];

  const handleFitContent = () => {
    chartRef.current?.timeScale().fitContent();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#090e1a] border border-[#1e293b] rounded-xl overflow-hidden select-none shadow-2xl text-[#f1f5f9]">
      
      {/* ── Top Bar: Symbol, Live Ticks & Interactive OHLC Telemetry ─────── */}
      <div className="px-4 py-2.5 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3 bg-[#0d1424]">
        
        {/* Left: Symbol & Live Quote */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#f1f5f9] tracking-tight">{tradingsymbol}</span>
            <span className="text-[10px] bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>

          {currentQuote && (
            <div className="flex items-center gap-2 font-mono text-xs pl-3 border-l border-[#1e293b]">
              <span className="font-bold text-[#f1f5f9] text-sm">
                ₹{currentQuote.last_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-[11px] font-semibold ${currentQuote.change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                {currentQuote.change >= 0 ? '+' : ''}{currentQuote.change.toFixed(2)} ({currentQuote.change_percent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Center: Live Hover OHLC Tooltip */}
        {hoverData && (
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-[#94a3b8] bg-[#090e1a] px-3 py-1 rounded-md border border-[#1e293b]">
            <span>O: <strong className="text-[#f1f5f9]">₹{hoverData.open?.toFixed(2)}</strong></span>
            <span>H: <strong className="text-[#10b981]">₹{hoverData.high?.toFixed(2)}</strong></span>
            <span>L: <strong className="text-[#f43f5e]">₹{hoverData.low?.toFixed(2)}</strong></span>
            <span>C: <strong className="text-[#f1f5f9]">₹{hoverData.close?.toFixed(2)}</strong></span>
            {hoverData.change !== undefined && (
              <span className={hoverData.change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}>
                {hoverData.change >= 0 ? '+' : ''}{hoverData.change.toFixed(2)} ({hoverData.changePercent?.toFixed(2)}%)
              </span>
            )}
          </div>
        )}

        {/* Right: Controls & Timeframe Selector */}
        <div className="flex items-center gap-2">
          {/* Timeframes */}
          <div className="flex items-center bg-[#090e1a] p-0.5 rounded-md border border-[#1e293b]">
            {intervals.map((it) => (
              <button
                key={it.value}
                onClick={() => setInterval(it.value)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  interval === it.value
                    ? 'bg-[#3b82f6] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>

          {/* Indicators dropdown/toggle buttons */}
          <div className="flex items-center gap-1 pl-2 border-l border-[#1e293b]">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
                showSMA ? 'bg-[#38bdf8]/15 border-[#38bdf8]/40 text-[#38bdf8]' : 'bg-[#090e1a] border-[#1e293b] text-[#64748b] hover:text-[#94a3b8]'
              }`}
              title="Toggle 20 SMA"
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
                showEMA ? 'bg-[#a855f7]/15 border-[#a855f7]/40 text-[#a855f7]' : 'bg-[#090e1a] border-[#1e293b] text-[#64748b] hover:text-[#94a3b8]'
              }`}
              title="Toggle 50 EMA"
            >
              EMA 50
            </button>
            <button
              onClick={() => setChartType(chartType === 'candles' ? 'area' : 'candles')}
              className="p-1.5 rounded bg-[#090e1a] border border-[#1e293b] text-[#94a3b8] hover:text-white transition-colors"
              title={chartType === 'candles' ? 'Switch to Area View' : 'Switch to Candlesticks'}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitContent}
              className="p-1.5 rounded bg-[#090e1a] border border-[#1e293b] text-[#94a3b8] hover:text-white transition-colors"
              title="Reset Zoom / Fit Content"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Chart Canvas Studio ─────────────────────────────────────────── */}
      <div className="relative flex-1 w-full min-h-[460px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#090e1a]/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#0d1424] border border-[#1e293b] rounded-lg text-xs font-semibold text-[#3b82f6] shadow-xl">
              <RefreshCw className="w-4 h-4 animate-spin text-[#3b82f6]" />
              <span>Streaming Market Candlesticks...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full min-h-[460px]" />
      </div>

    </div>
  );
};
