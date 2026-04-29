export function calcScores(s) {
  let qual = 0, val = 0, div = 0, safety = 0;

  // Quality (100 pts)
  if (s.roe3yr >= 25) qual += 25; else if (s.roe3yr >= 15) qual += 18; else if (s.roe3yr >= 10) qual += 10;
  if (s.roce >= 30) qual += 20; else if (s.roce >= 15) qual += 14; else if (s.roce >= 10) qual += 8;
  if (s.pg3 >= 20) qual += 20; else if (s.pg3 >= 12) qual += 14; else if (s.pg3 >= 8) qual += 8;
  if (s.sg3 >= 15) qual += 15; else if (s.sg3 >= 8) qual += 10; else if (s.sg3 >= 5) qual += 5;
  if (s.de <= 0.1) qual += 20; else if (s.de <= 0.5) qual += 14; else if (s.de <= 1) qual += 8;

  // Valuation (100 pts)
  const peg = s.pg3 > 0 ? s.pe / s.pg3 : 99;
  if (peg < 1) val += 30; else if (peg < 1.5) val += 24; else if (peg < 2) val += 16; else if (peg < 3) val += 10; else if (peg < 5) val += 5;
  if (s.pe < 20) val += 25; else if (s.pe < 30) val += 20; else if (s.pe < 40) val += 14; else if (s.pe < 50) val += 8; else if (s.pe < 60) val += 4;
  if (s.ret3yr > 40) val += 25; else if (s.ret3yr > 20) val += 18; else if (s.ret3yr > 10) val += 12; else if (s.ret3yr > 0) val += 6;
  val = Math.min(val, 100);

  // Dividend (100 pts)
  if (s.divYld >= 5) div += 30; else if (s.divYld >= 3) div += 24; else if (s.divYld >= 2) div += 16; else if (s.divYld >= 1) div += 8;
  if (s.payout >= 15 && s.payout <= 70) div += 35; else if (s.payout > 70 && s.payout <= 85) div += 20; else if (s.payout > 85) div += 5;
  if (s.pg3 >= 10) div += 20; else if (s.pg3 >= 5) div += 12;
  if (s.de <= 0.3) div += 15; else if (s.de <= 0.75) div += 10;
  div = Math.min(div, 100);

  // Safety (100 pts)
  if (s.de <= 0.5) safety += 25; else if (s.de <= 1) safety += 15;
  if (s.roce >= 20) safety += 25; else if (s.roce >= 12) safety += 16; else safety += 8;
  if (s.pg3 >= 10) safety += 25; else if (s.pg3 >= 5) safety += 15; else safety += 5;
  if (s.divYld > 0 && s.divYld < 15) safety += 15; else safety += 5;
  if (s.payout <= 80) safety += 10; else safety += 3;
  safety = Math.min(safety, 100);

  // Long term composite
  const lt = Math.round((qual * 0.35) + (val * 0.25) + (div * 0.20) + (safety * 0.20));

  // Short term momentum
  let mom = 0;
  if (s.dma200 > 0 && s.cmp > s.dma200) mom += 30; else if (!s.dma200) mom += 10;
  if (s.wh52 > 0) {
    const r = s.cmp / s.wh52;
    if (r > 0.9) mom += 25; else if (r > 0.8) mom += 15; else mom += 5;
  } else mom += 10;
  if (s.qtrProfitVar >= 25) mom += 20; else if (s.qtrProfitVar >= 15) mom += 14; else if (s.qtrProfitVar >= 5) mom += 8;
  if (s.qtrSalesVar >= 15) mom += 15; else if (s.qtrSalesVar >= 8) mom += 10; else if (s.qtrSalesVar >= 2) mom += 5;
  if (s.mcap >= 5000) mom += 10; else if (s.mcap >= 1000) mom += 7; else mom += 3;
  const st = Math.round(Math.min(mom, 100));

  const eps = s.mcap > 0 && s.cmp > 0 ? s.pat12m / (s.mcap / s.cmp) : 0;
  const fairPE = s.pg3 > 0 ? s.pg3 * 2.5 : 0;
  const fairPrice = eps > 0 && fairPE > 0 ? eps * fairPE : 0;

  const flags = [];
  const greens = [];
  if (s.de > 1) flags.push('High debt (D/E ' + s.de.toFixed(2) + ')');
  if (s.payout > 90) flags.push('Payout ratio very high (' + s.payout.toFixed(0) + '%)');
  if (s.divYld > 15) flags.push('Dividend yield suspicious (' + s.divYld.toFixed(1) + '%)');
  if (peg > 4) flags.push('PEG very high (' + peg.toFixed(1) + ')');
  if (s.pg3 < 5 && s.pg3 >= 0) flags.push('Slow profit growth (' + s.pg3.toFixed(1) + '% 3yr)');
  if (s.roce < 10) flags.push('ROCE below 10%');
  if (s.promo > 0 && s.promo < 25) flags.push('Low promoter holding (' + s.promo.toFixed(0) + '%)');
  if (s.roe3yr >= 20) greens.push('Strong ROE ' + s.roe3yr.toFixed(1) + '%');
  if (s.de <= 0.3) greens.push('Near debt-free');
  if (s.roce >= 30) greens.push('Exceptional ROCE ' + s.roce.toFixed(0) + '%');
  if (s.divYld >= 3 && s.divYld < 15) greens.push('Dividend yield ' + s.divYld.toFixed(2) + '%');
  if (peg < 1.5 && peg > 0 && peg !== 99) greens.push('Attractive PEG ' + peg.toFixed(2));
  if (s.pg3 >= 15) greens.push('Strong profit growth ' + s.pg3.toFixed(1) + '%');
  if (s.promo >= 50) greens.push('High promoter holding ' + s.promo.toFixed(0) + '%');

  return { lt, st, qual, val, div, safety, peg: parseFloat(peg.toFixed(2)), eps: parseFloat(eps.toFixed(2)), fairPE: parseFloat(fairPE.toFixed(1)), fairPrice: parseFloat(fairPrice.toFixed(0)), flags, greens };
}

export function getVerdict(score, type) {
  if (type === 'lt') {
    if (score >= 70) return { label: 'Strong buy', color: 'success', short: 'BUY' };
    if (score >= 55) return { label: 'Buy on dip', color: 'success', short: 'BUY' };
    if (score >= 40) return { label: 'Watch — wait', color: 'warning', short: 'WATCH' };
    return { label: 'Avoid', color: 'danger', short: 'AVOID' };
  }
  if (score >= 70) return { label: 'Good momentum', color: 'success', short: 'BUY' };
  if (score >= 50) return { label: 'Moderate setup', color: 'warning', short: 'WATCH' };
  return { label: 'Weak — avoid', color: 'danger', short: 'AVOID' };
}

export function parseScreenerRow(raw) {
  const parts = raw.split(/\t/).map(s => s.trim());
  if (parts.length < 3) {
    const csvParts = raw.split(',').map(s => s.trim());
    if (csvParts.length >= 3) return mapParts(csvParts);
    return null;
  }
  return mapParts(parts);
}

function mapParts(p) {
  const f = (i) => parseFloat(p[i]) || 0;
  return {
    name: p[0] || 'Unknown',
    cmp: f(1), pe: f(2), mcap: f(3), sales: f(4),
    salesQtr: f(5), qtrSalesVar: f(6), divYld: f(7),
    npQtr: f(8), qtrProfitVar: f(9), sg3: f(10),
    pg3: f(11), pat12m: f(12), ret3yr: f(13),
    de: f(14), roce: f(15), roe3yr: f(16), payout: f(17),
    wh52: 0, dma200: 0, promo: 0,
  };
}
