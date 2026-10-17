import type { Instrument } from '../../types/market';

export const INDIAN_INSTRUMENTS_MASTER: Instrument[] = [
  // ── INDICES ─────────────────────────────────────────────────────────────
  {
    instrument_key: 'NSE_INDEX|Nifty 50',
    tradingsymbol: 'NIFTY 50',
    name: 'NIFTY 50 Index',
    exchange: 'NSE',
    instrument_type: 'INDEX',
    lot_size: 25,
    tick_size: 0.05,
    segment: 'INDEX',
  },
  {
    instrument_key: 'NSE_INDEX|Nifty Bank',
    tradingsymbol: 'BANK NIFTY',
    name: 'NIFTY Bank Index',
    exchange: 'NSE',
    instrument_type: 'INDEX',
    lot_size: 15,
    tick_size: 0.05,
    segment: 'INDEX',
  },
  {
    instrument_key: 'NSE_INDEX|Nifty Fin Service',
    tradingsymbol: 'FINNIFTY',
    name: 'NIFTY Financial Services Index',
    exchange: 'NSE',
    instrument_type: 'INDEX',
    lot_size: 25,
    tick_size: 0.05,
    segment: 'INDEX',
  },
  {
    instrument_key: 'BSE_INDEX|SENSEX',
    tradingsymbol: 'SENSEX',
    name: 'S&P BSE SENSEX',
    exchange: 'BSE',
    instrument_type: 'INDEX',
    lot_size: 10,
    tick_size: 0.05,
    segment: 'INDEX',
  },
  {
    instrument_key: 'NSE_INDEX|Nifty IT',
    tradingsymbol: 'NIFTY IT',
    name: 'NIFTY IT Sectoral Index',
    exchange: 'NSE',
    instrument_type: 'INDEX',
    lot_size: 25,
    tick_size: 0.05,
    segment: 'INDEX',
  },
  {
    instrument_key: 'NSE_INDEX|Nifty Auto',
    tradingsymbol: 'NIFTY AUTO',
    name: 'NIFTY Auto Sectoral Index',
    exchange: 'NSE',
    instrument_type: 'INDEX',
    lot_size: 25,
    tick_size: 0.05,
    segment: 'INDEX',
  },

  // ── CASH EQUITIES (NSE & BSE) ───────────────────────────────────────────
  {
    instrument_key: 'NSE_EQ|INE002A01018',
    tradingsymbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE002A01018',
  },
  {
    instrument_key: 'NSE_EQ|INE040A01034',
    tradingsymbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE040A01034',
  },
  {
    instrument_key: 'NSE_EQ|INE467B01029',
    tradingsymbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE467B01029',
  },
  {
    instrument_key: 'NSE_EQ|INE009A01021',
    tradingsymbol: 'INFY',
    name: 'Infosys Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE009A01021',
  },
  {
    instrument_key: 'NSE_EQ|INE090A01021',
    tradingsymbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE090A01021',
  },
  {
    instrument_key: 'NSE_EQ|INE062A01020',
    tradingsymbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE062A01020',
  },
  {
    instrument_key: 'NSE_EQ|INE397D01024',
    tradingsymbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE397D01024',
  },
  {
    instrument_key: 'NSE_EQ|INE154A01025',
    tradingsymbol: 'ITC',
    name: 'ITC Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE154A01025',
  },
  {
    instrument_key: 'NSE_EQ|INE018A01030',
    tradingsymbol: 'LT',
    name: 'Larsen & Toubro Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE018A01030',
  },
  {
    instrument_key: 'NSE_EQ|INE155A01022',
    tradingsymbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE155A01022',
  },
  {
    instrument_key: 'NSE_EQ|INE296A01032',
    tradingsymbol: 'BAJFINANCE',
    name: 'Bajaj Finance Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE296A01032',
  },
  {
    instrument_key: 'NSE_EQ|INE585B01010',
    tradingsymbol: 'MARUTI',
    name: 'Maruti Suzuki India Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE585B01010',
  },
  {
    instrument_key: 'NSE_EQ|INE044A01036',
    tradingsymbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE044A01036',
  },
  {
    instrument_key: 'NSE_EQ|INE238A01034',
    tradingsymbol: 'AXISBANK',
    name: 'Axis Bank Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE238A01034',
  },
  {
    instrument_key: 'NSE_EQ|INE280A01028',
    tradingsymbol: 'TITAN',
    name: 'Titan Company Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE280A01028',
  },
  {
    instrument_key: 'NSE_EQ|INE075A01022',
    tradingsymbol: 'WIPRO',
    name: 'Wipro Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE075A01022',
  },
  {
    instrument_key: 'NSE_EQ|INE081A01020',
    tradingsymbol: 'TATASTEEL',
    name: 'Tata Steel Limited',
    exchange: 'NSE',
    instrument_type: 'EQUITY',
    lot_size: 1,
    tick_size: 0.05,
    isin: 'INE081A01020',
  },

  // ── INDEX FUTURES ───────────────────────────────────────────────────────
  {
    instrument_key: 'NSE_FO|48704',
    tradingsymbol: 'NIFTY26OCTFUT',
    name: 'NIFTY 50 Current Month Future',
    exchange: 'NFO',
    instrument_type: 'FUTIDX',
    lot_size: 65,
    tick_size: 0.1,
    expiry: '2026-10-27',
    underlying_key: 'NSE_INDEX|Nifty 50',
  },
  {
    instrument_key: 'NSE_FO|61471',
    tradingsymbol: 'NIFTY26NOVFUT',
    name: 'NIFTY 50 Next Month Future',
    exchange: 'NFO',
    instrument_type: 'FUTIDX',
    lot_size: 65,
    tick_size: 0.1,
    expiry: '2026-11-23',
    underlying_key: 'NSE_INDEX|Nifty 50',
  },
  {
    instrument_key: 'NSE_FO|48699',
    tradingsymbol: 'BANKNIFTY26OCTFUT',
    name: 'BANK NIFTY Current Month Future',
    exchange: 'NFO',
    instrument_type: 'FUTIDX',
    lot_size: 30,
    tick_size: 0.2,
    expiry: '2026-10-27',
    underlying_key: 'NSE_INDEX|Nifty Bank',
  },
  {
    instrument_key: 'NSE_FO|48702',
    tradingsymbol: 'FINNIFTY26OCTFUT',
    name: 'FINNIFTY Current Month Future',
    exchange: 'NFO',
    instrument_type: 'FUTIDX',
    lot_size: 60,
    tick_size: 0.1,
    expiry: '2026-10-27',
    underlying_key: 'NSE_INDEX|Nifty Fin Service',
  },

  // ── STOCK FUTURES ───────────────────────────────────────────────────────
  {
    instrument_key: 'NSE_FO|48987',
    tradingsymbol: 'RELIANCE26OCTFUT',
    name: 'Reliance Current Month Future',
    exchange: 'NFO',
    instrument_type: 'FUTSTK',
    lot_size: 500,
    tick_size: 0.1,
    expiry: '2026-10-27',
    underlying_key: 'NSE_EQ|INE002A01018',
  },
  {
    instrument_key: 'NSE_FO|48864',
    tradingsymbol: 'HDFCBANK26OCTFUT',
    name: 'HDFC Bank Current Month Future',
    exchange: 'NFO',
    instrument_type: 'FUTSTK',
    lot_size: 650,
    tick_size: 0.05,
    expiry: '2026-10-27',
    underlying_key: 'NSE_EQ|INE040A01034',
  },
  {
    instrument_key: 'NSE_FO|49013',
    tradingsymbol: 'TCS26OCTFUT',
    name: 'TCS Current Month Future',
    exchange: 'NFO',
    instrument_type: 'FUTSTK',
    lot_size: 225,
    tick_size: 0.1,
    expiry: '2026-10-27',
    underlying_key: 'NSE_EQ|INE467B01029',
  },

  // ── COMMODITIES (MCX) ───────────────────────────────────────────────────
  // Bullion
  {
    instrument_key: 'MCX_FO|495213',
    tradingsymbol: 'GOLD26DECFUT',
    name: 'Gold (1kg) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 1,
    tick_size: 1.0,
    expiry: '2026-12-04',
    segment: 'COMMODITY_BULLION',
  },
  {
    instrument_key: 'MCX_FO|571445',
    tradingsymbol: 'GOLDM26NOVFUT',
    name: 'Gold Mini (100g) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 100,
    tick_size: 1.0,
    expiry: '2026-11-05',
    segment: 'COMMODITY_BULLION',
  },
  {
    instrument_key: 'MCX_FO|571306',
    tradingsymbol: 'GOLDPETAL26OCTFUT',
    name: 'Gold Petal (1g) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 1,
    tick_size: 1.0,
    expiry: '2026-10-30',
    segment: 'COMMODITY_BULLION',
  },
  {
    instrument_key: 'MCX_FO|495214',
    tradingsymbol: 'SILVER26DECFUT',
    name: 'Silver (30kg) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 30,
    tick_size: 1.0,
    expiry: '2026-12-04',
    segment: 'COMMODITY_BULLION',
  },
  {
    instrument_key: 'MCX_FO|483080',
    tradingsymbol: 'SILVERM26NOVFUT',
    name: 'Silver Mini (5kg) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 5,
    tick_size: 1.0,
    expiry: '2026-11-30',
    segment: 'COMMODITY_BULLION',
  },
  {
    instrument_key: 'MCX_FO|562058',
    tradingsymbol: 'SILVERMIC26NOVFUT',
    name: 'Silver Micro (1kg) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 1,
    tick_size: 1.0,
    expiry: '2026-11-30',
    segment: 'COMMODITY_BULLION',
  },

  // Energy
  {
    instrument_key: 'MCX_FO|569900',
    tradingsymbol: 'CRUDEOIL26OCTFUT',
    name: 'Crude Oil (100 BBL) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 100,
    tick_size: 1.0,
    expiry: '2026-10-19',
    segment: 'COMMODITY_ENERGY',
  },
  {
    instrument_key: 'MCX_FO|569901',
    tradingsymbol: 'CRUDEOILM26OCTFUT',
    name: 'Crude Oil Mini (10 BBL) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 10,
    tick_size: 1.0,
    expiry: '2026-10-19',
    segment: 'COMMODITY_ENERGY',
  },
  {
    instrument_key: 'MCX_FO|570750',
    tradingsymbol: 'NATURALGAS26OCTFUT',
    name: 'Natural Gas (1250 mmBtu) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 1250,
    tick_size: 0.1,
    expiry: '2026-10-27',
    segment: 'COMMODITY_ENERGY',
  },
  {
    instrument_key: 'MCX_FO|570751',
    tradingsymbol: 'NATGASMINI26OCTFUT',
    name: 'Natural Gas Mini (250 mmBtu) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 250,
    tick_size: 0.1,
    expiry: '2026-10-27',
    segment: 'COMMODITY_ENERGY',
  },

  // Base Metals
  {
    instrument_key: 'MCX_FO|574829',
    tradingsymbol: 'COPPER26OCTFUT',
    name: 'Copper (2.5 MT) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 2500,
    tick_size: 0.05,
    expiry: '2026-10-30',
    segment: 'COMMODITY_METALS',
  },
  {
    instrument_key: 'MCX_FO|574834',
    tradingsymbol: 'ZINC26OCTFUT',
    name: 'Zinc (5 MT) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 5000,
    tick_size: 0.05,
    expiry: '2026-10-30',
    segment: 'COMMODITY_METALS',
  },
  {
    instrument_key: 'MCX_FO|574835',
    tradingsymbol: 'ZINCMINI26OCTFUT',
    name: 'Zinc Mini (1 MT) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 1000,
    tick_size: 0.05,
    expiry: '2026-10-30',
    segment: 'COMMODITY_METALS',
  },
  {
    instrument_key: 'MCX_FO|574828',
    tradingsymbol: 'ALUMINIUM26OCTFUT',
    name: 'Aluminium (5 MT) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 5000,
    tick_size: 0.05,
    expiry: '2026-10-30',
    segment: 'COMMODITY_METALS',
  },
  {
    instrument_key: 'MCX_FO|574830',
    tradingsymbol: 'LEAD26OCTFUT',
    name: 'Lead (5 MT) Future',
    exchange: 'MCX',
    instrument_type: 'FUTCOM',
    lot_size: 5000,
    tick_size: 0.05,
    expiry: '2026-10-30',
    segment: 'COMMODITY_METALS',
  },
];

export interface ExchangeContractSpec {
  lotSize: number;
  unit: string;
  pricePerUnit: string;
  multiplier: number;
  lotDescription: string;
}

/**
 * Returns exact standard exchange contract specifications for Indian indices, commodities (MCX), and equities.
 */
export function getExchangeContractSpec(
  tradingsymbol: string = '',
  instrumentType: string = 'EQUITY',
  exchange: string = 'NSE',
  fallbackLotSize: number = 1
): ExchangeContractSpec {
  const sym = tradingsymbol.toUpperCase().trim();
  const type = instrumentType.toUpperCase();
  const ex = exchange.toUpperCase();

  // 1. MCX COMMODITIES
  if (ex === 'MCX' || type === 'COMMODITY' || type === 'FUTCOM') {
    // Gold Mini
    if (sym.startsWith('GOLDM')) {
      return {
        lotSize: 100,
        unit: 'Grams',
        pricePerUnit: '₹ / 10g',
        multiplier: 0.1, // 100g / 10g = 10x price per lot
        lotDescription: '1 Lot = 100 Grams',
      };
    }
    // Gold Petal
    if (sym.startsWith('GOLDPETAL')) {
      return {
        lotSize: 1,
        unit: 'Gram',
        pricePerUnit: '₹ / 1g',
        multiplier: 1,
        lotDescription: '1 Lot = 1 Gram',
      };
    }
    // Gold Big (1 KG)
    if (sym.startsWith('GOLD')) {
      return {
        lotSize: 1,
        unit: 'KG',
        pricePerUnit: '₹ / 10g',
        multiplier: 100, // 1000g / 10g = 100x price per lot
        lotDescription: '1 Lot = 1 KG (1,000g)',
      };
    }
    // Silver Mini
    if (sym.startsWith('SILVERM') && !sym.startsWith('SILVERMIC')) {
      return {
        lotSize: 5,
        unit: 'KG',
        pricePerUnit: '₹ / kg',
        multiplier: 1,
        lotDescription: '1 Lot = 5 KGS',
      };
    }
    // Silver Micro
    if (sym.startsWith('SILVERMIC')) {
      return {
        lotSize: 1,
        unit: 'KG',
        pricePerUnit: '₹ / kg',
        multiplier: 1,
        lotDescription: '1 Lot = 1 KG',
      };
    }
    // Silver Big (30 KG)
    if (sym.startsWith('SILVER')) {
      return {
        lotSize: 30,
        unit: 'KG',
        pricePerUnit: '₹ / kg',
        multiplier: 1,
        lotDescription: '1 Lot = 30 KGS',
      };
    }
    // Crude Oil Mini
    if (sym.startsWith('CRUDEOILM')) {
      return {
        lotSize: 10,
        unit: 'Barrels',
        pricePerUnit: '₹ / BBL',
        multiplier: 1,
        lotDescription: '1 Lot = 10 Barrels (BBL)',
      };
    }
    // Crude Oil Big (100 BBL)
    if (sym.startsWith('CRUDEOIL')) {
      return {
        lotSize: 100,
        unit: 'Barrels',
        pricePerUnit: '₹ / BBL',
        multiplier: 1,
        lotDescription: '1 Lot = 100 Barrels (BBL)',
      };
    }
    // Natural Gas Mini
    if (sym.startsWith('NATGASMINI')) {
      return {
        lotSize: 250,
        unit: 'mmBtu',
        pricePerUnit: '₹ / mmBtu',
        multiplier: 1,
        lotDescription: '1 Lot = 250 mmBtu',
      };
    }
    // Natural Gas Big
    if (sym.startsWith('NATURALGAS')) {
      return {
        lotSize: 1250,
        unit: 'mmBtu',
        pricePerUnit: '₹ / mmBtu',
        multiplier: 1,
        lotDescription: '1 Lot = 1,250 mmBtu',
      };
    }
    // Copper (2.5 MT)
    if (sym.startsWith('COPPER')) {
      return {
        lotSize: 2500,
        unit: 'KG',
        pricePerUnit: '₹ / kg',
        multiplier: 1,
        lotDescription: '1 Lot = 2,500 KGS (2.5 MT)',
      };
    }
    // Zinc Mini (1 MT)
    if (sym.startsWith('ZINCMINI')) {
      return {
        lotSize: 1000,
        unit: 'KG',
        pricePerUnit: '₹ / kg',
        multiplier: 1,
        lotDescription: '1 Lot = 1,000 KGS (1 MT)',
      };
    }
    // Zinc Big (5 MT)
    if (sym.startsWith('ZINC')) {
      return {
        lotSize: 5000,
        unit: 'KG',
        pricePerUnit: '₹ / kg',
        multiplier: 1,
        lotDescription: '1 Lot = 5,000 KGS (5 MT)',
      };
    }
    // Aluminium (5 MT)
    if (sym.startsWith('ALUMINIUM')) {
      return {
        lotSize: 5000,
        unit: 'KG',
        pricePerUnit: '₹ / kg',
        multiplier: 1,
        lotDescription: '1 Lot = 5,000 KGS (5 MT)',
      };
    }
    // Lead (5 MT)
    if (sym.startsWith('LEAD')) {
      return {
        lotSize: 5000,
        unit: 'KG',
        pricePerUnit: '₹ / kg',
        multiplier: 1,
        lotDescription: '1 Lot = 5,000 KGS (5 MT)',
      };
    }
  }

  // 2. NSE & BSE DERIVATIVES / INDICES
  if (sym.includes('BANKNIFTY') || sym.includes('NIFTY BANK') || sym.includes('BANK NIFTY')) {
    return {
      lotSize: 15,
      unit: 'Qty',
      pricePerUnit: '₹ / pt',
      multiplier: 1,
      lotDescription: '1 Lot = 15 Qty',
    };
  }
  if (sym.includes('FINNIFTY')) {
    return {
      lotSize: 25,
      unit: 'Qty',
      pricePerUnit: '₹ / pt',
      multiplier: 1,
      lotDescription: '1 Lot = 25 Qty',
    };
  }
  if (sym.includes('MIDCPNIFTY')) {
    return {
      lotSize: 50,
      unit: 'Qty',
      pricePerUnit: '₹ / pt',
      multiplier: 1,
      lotDescription: '1 Lot = 50 Qty',
    };
  }
  if (sym.includes('SENSEX')) {
    return {
      lotSize: 10,
      unit: 'Qty',
      pricePerUnit: '₹ / pt',
      multiplier: 1,
      lotDescription: '1 Lot = 10 Qty',
    };
  }
  if (sym.includes('BANKEX')) {
    return {
      lotSize: 15,
      unit: 'Qty',
      pricePerUnit: '₹ / pt',
      multiplier: 1,
      lotDescription: '1 Lot = 15 Qty',
    };
  }
  if (sym.includes('NIFTY')) {
    return {
      lotSize: 25,
      unit: 'Qty',
      pricePerUnit: '₹ / pt',
      multiplier: 1,
      lotDescription: '1 Lot = 25 Qty',
    };
  }

  // 3. CASH EQUITIES
  if (type === 'EQUITY' || fallbackLotSize <= 1) {
    return {
      lotSize: 1,
      unit: 'Shares',
      pricePerUnit: '₹ / share',
      multiplier: 1,
      lotDescription: 'Qty in Shares',
    };
  }

  // Fallback for stock futures or other F&O
  return {
    lotSize: fallbackLotSize,
    unit: 'Qty',
    pricePerUnit: '₹ / unit',
    multiplier: 1,
    lotDescription: `1 Lot = ${fallbackLotSize} Qty`,
  };
}

/**
 * Backward-compatibility alias for legacy callers
 */
export const getZerodhaContractSpec = getExchangeContractSpec;


