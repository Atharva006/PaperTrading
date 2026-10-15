import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  CandlestickSeries, 
  HistogramSeries, 
  ColorType, 
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type Time
} from 'lightweight-charts';
import { marketDataService } from '../../services/market/MarketDataService';
import { useTradingStore } from '../../store/useTradingStore';
import type { CandleInterval } from '../../types/market';
import { Clock, RefreshCw } from 'lucide-react';

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
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [interval, setInterval] = useState<CandleInterval>('15minute');
  const [isLoading, setIsLoading] = useState(true);
  const { quotes } = useTradingStore();

  const currentQuote = quotes[instrumentKey] || quotes[tradingsymbol];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0B1424' },
        textColor: '#A1A8B3',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#14223A' },
        horzLines: { color: '#14223A' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(198, 161, 91, 0.2)',
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(198, 161, 91, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#F43F5E',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#F43F5E',
    });

    // Add Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#C6A15B',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // volume takes bottom 20%
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Resize Observer
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

  // Fetch Candles on Instrument or Interval Change
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    marketDataService
      .getHistoricalCandles(instrumentKey, interval)
      .then((candles) => {
        if (isCancelled || !candleSeriesRef.current || !volumeSeriesRef.current) return;

        const formattedCandles = candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        const formattedVolumes = candles.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)',
        }));

        const lastCandle = formattedCandles[formattedCandles.length - 1];
        if (lastCandle) {
          lastCandleTimeRef.current = Number(lastCandle.time);
        }

        candleSeriesRef.current.setData(formattedCandles);
        volumeSeriesRef.current.setData(formattedVolumes);
        chartRef.current?.timeScale().fitContent();
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

  const lastCandleTimeRef = useRef<number>(0);

  // Update latest candle in real-time on live tick
  useEffect(() => {
    if (!currentQuote || !candleSeriesRef.current) return;

    try {
      let barTime = Math.floor(Date.now() / 1000) - (Math.floor(Date.now() / 1000) % 60);
      if (lastCandleTimeRef.current > 0 && barTime < lastCandleTimeRef.current) {
        barTime = lastCandleTimeRef.current;
      }
      candleSeriesRef.current.update({
        time: barTime as Time,
        open: currentQuote.open,
        high: Math.max(currentQuote.high, currentQuote.last_price),
        low: Math.min(currentQuote.low, currentQuote.last_price),
        close: currentQuote.last_price,
      });
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

  return (
    <div className="flex flex-col h-full bg-[#0E1728] border border-[rgba(198,161,91,0.22)] rounded-xl overflow-hidden select-none shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      {/* Chart Toolbar */}
      <div className="h-10 px-4 border-b border-[rgba(198,161,91,0.18)] flex items-center justify-between bg-[#0B1424]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#F5F5F2] tracking-tight">{tradingsymbol}</span>
            <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-1.5 py-0.5 rounded font-mono font-medium hidden sm:inline">
              UPSTOX LIVE
            </span>
          </div>

          {currentQuote && (
            <div className="flex items-center gap-2 font-mono text-xs pl-2 border-l border-white/10">
              <span className="font-bold text-[#F5F5F2]">₹{currentQuote.last_price.toFixed(2)}</span>
              <span className={`text-[11px] font-medium ${currentQuote.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                {currentQuote.change >= 0 ? '+' : ''}{currentQuote.change.toFixed(2)} ({currentQuote.change_percent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1">
          {intervals.map((it) => (
            <button
              key={it.value}
              onClick={() => setInterval(it.value)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                interval === it.value
                  ? 'bg-[#C6A15B] text-[#0B1424] font-bold shadow-[0_0_10px_rgba(198,161,91,0.3)]'
                  : 'text-[#A1A8B3] hover:text-[#F5F5F2] hover:bg-[#14223A]'
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex-1 w-full min-h-[350px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B1424]/60 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0E1728] border border-[rgba(198,161,91,0.25)] rounded-lg text-xs text-[#A1A8B3]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C6A15B]" />
              <span>Loading Candlesticks...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
