import { useState, useCallback } from 'react';
import { calcScores, getVerdict, parseScreenerRow } from './stockEngine';
import './StockAnalyzer.css';

const COLGATE_SAMPLE = 'Colgate-Palmoliv\t2128.65\t43.45\t57896.25\t5902.20\t1486.13\t1.66\t2.39\t323.86\t2.25\t5.80\t10.03\t1333.18\t10.04\t0.04\t105.34\t72.39\t96.55';

const EMPTY_MANUAL = {
  name: '', cmp: '', pe: '', mcap: '', sales: '', salesQtr: '',
  qtrSalesVar: '', divYld: '', npQtr: '', qtrProfitVar: '',
  sg3: '', pg3: '', pat12m: '', ret3yr: '', de: '',
  roce: '', roe3yr: '', payout: '', wh52: '', dma200: '', promo: '',
};

const f = (v, d = 2) => (v == null || isNaN(v) || v === 0) ? '—' : Number(v).toFixed(d);
const pct = (v) => (v == null || isNaN(v)) ? '—' : Number(v).toFixed(2) + '%';
const scoreColor = (s) => s >= 70 ? 'good' : s >= 50 ? 'warn' : 'bad';

export default function StockAnalyzer() {
  const [stocks, setStocks] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [inputMode, setInputMode] = useState('paste');
  const [pasteVal, setPasteVal] = useState('');
  const [manual, setManual] = useState(EMPTY_MANUAL);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [analyzeIdx, setAnalyzeIdx] = useState(0);
  const [sortKey, setSortKey] = useState('lt');

  const showMsg = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const addStock = useCallback((s) => {
    s.id = Date.now() + Math.random();
    s.scores = calcScores(s);
    setStocks(prev => [...prev, s]);
    setAnalyzeIdx(0);
  }, []);

  const removeStock = (id) => setStocks(prev => prev.filter(s => s.id !== id));

  const handleParse = () => {
    if (!pasteVal.trim()) { showMsg('Paste data first', 'bad'); return; }
    const s = parseScreenerRow(pasteVal.trim());
    if (!s) { showMsg('Could not parse — use tab-separated screener.in data', 'bad'); return; }
    addStock(s);
    showMsg(s.name + ' added!', 'good');
    setPasteVal('');
  };

  const handleManual = () => {
    if (!manual.name || !manual.cmp || !manual.pe) { showMsg('Name, Price and PE are required', 'bad'); return; }
    const s = Object.fromEntries(Object.entries(manual).map(([k, v]) => [k, k === 'name' ? v : parseFloat(v) || 0]));
    addStock(s);
    showMsg(s.name + ' added!', 'good');
    setManual(EMPTY_MANUAL);
  };

  const sorted = [...stocks].sort((a, b) => b.scores[sortKey] - a.scores[sortKey]);

  return (
    <div className="sa-wrap">
      <div className="sa-header">
        <div>
          <h1 className="sa-title">Stock Analyzer</h1>
          <p className="sa-sub">Analyze, score and compare Indian stocks for long term &amp; short term investment study</p>
        </div>
        {stocks.length > 0 && (
          <div className="sa-stock-count">{stocks.length} stock{stocks.length > 1 ? 's' : ''} added</div>
        )}
      </div>

      <nav className="sa-nav">
        {[['add', 'Add stock'], ['analyze', 'Analysis'], ['compare', 'Compare'], ['ranking', 'Ranking']].map(([k, l]) => (
          <button key={k} className={`sa-nav-btn${activeTab === k ? ' active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
        ))}
      </nav>

      {activeTab === 'add' && (
        <div>
          <div className="sa-mode-toggle">
            <button className={`sa-mode-btn${inputMode === 'paste' ? ' active' : ''}`} onClick={() => setInputMode('paste')}>Paste screener row</button>
            <button className={`sa-mode-btn${inputMode === 'manual' ? ' active' : ''}`} onClick={() => setInputMode('manual')}>Manual entry</button>
          </div>

          {inputMode === 'paste' && (
            <div className="sa-card">
              <label className="sa-label">Paste tab-separated row from screener.in export</label>
              <div className="sa-label" style={{ marginBottom: 6, color: 'var(--color-text-tertiary)', fontSize: 11 }}>
                Columns: Name · CMP · PE · MarCap · Sales · SalesQtr · QtrSalesVar% · DivYld% · NPQtr · QtrProfitVar% · Sales3yr% · Profit3yr% · PAT12M · 3yrReturn% · D/E · ROCE% · ROE3yr% · Payout%
              </div>
              <textarea
                className="sa-textarea"
                value={pasteVal}
                onChange={e => setPasteVal(e.target.value)}
                placeholder="Paste data row here..."
                rows={3}
              />
              <div className="sa-btn-row">
                <button className="sa-btn sa-btn-primary" onClick={handleParse}>Parse and add</button>
                <button className="sa-btn" onClick={() => setPasteVal(COLGATE_SAMPLE)}>Load Colgate example</button>
              </div>
              {msg.text && <div className={`sa-msg sa-msg-${msg.type}`}>{msg.text}</div>}
            </div>
          )}

          {inputMode === 'manual' && (
            <div className="sa-card">
              <div className="sa-grid-2">
                {[
                  ['name', 'Stock name *', 'text', 'e.g. Colgate-Palmolive'],
                  ['cmp', 'Current price ₹ *', 'number', '2128.65'],
                  ['pe', 'P/E ratio *', 'number', '43.45'],
                  ['mcap', 'Market cap ₹ Cr', 'number', '57896'],
                  ['sales', 'Annual sales ₹ Cr', 'number', '5902'],
                  ['divYld', 'Dividend yield %', 'number', '2.39'],
                  ['qtrProfitVar', 'Qtr profit growth %', 'number', '2.25'],
                  ['qtrSalesVar', 'Qtr sales growth %', 'number', '1.66'],
                  ['sg3', 'Sales growth 3yr %', 'number', '5.80'],
                  ['pg3', 'Profit growth 3yr %', 'number', '10.03'],
                  ['pat12m', 'PAT 12M ₹ Cr', 'number', '1333'],
                  ['ret3yr', '3yr stock return %', 'number', '10.04'],
                  ['de', 'Debt / Equity', 'number', '0.04'],
                  ['roce', 'ROCE %', 'number', '105.34'],
                  ['roe3yr', 'ROE 3yr avg %', 'number', '72.39'],
                  ['payout', 'Dividend payout %', 'number', '96.55'],
                  ['wh52', '52W high ₹ (optional)', 'number', ''],
                  ['dma200', '200 DMA ₹ (optional)', 'number', ''],
                  ['promo', 'Promoter holding % (optional)', 'number', ''],
                ].map(([key, lbl, type, ph]) => (
                  <div className="sa-form-row" key={key}>
                    <label className="sa-label">{lbl}</label>
                    <input
                      type={type}
                      className="sa-input"
                      placeholder={ph}
                      value={manual[key]}
                      onChange={e => setManual(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div className="sa-btn-row" style={{ marginTop: 12 }}>
                <button className="sa-btn sa-btn-primary" onClick={handleManual}>Add stock</button>
                <button className="sa-btn" onClick={() => setManual(EMPTY_MANUAL)}>Clear</button>
              </div>
              {msg.text && <div className={`sa-msg sa-msg-${msg.type}`}>{msg.text}</div>}
            </div>
          )}

          {stocks.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="sa-section-label">Added stocks</div>
              {stocks.map(s => (
                <div key={s.id} className="sa-stock-pill">
                  <div>
                    <span className="sa-stock-name">{s.name}</span>
                    <span className="sa-stock-cmp">₹{f(s.cmp)}</span>
                    <span className={`sa-badge sa-badge-${scoreColor(s.scores.lt)}`}>LT {s.scores.lt}</span>
                    <span className={`sa-badge sa-badge-${scoreColor(s.scores.st)}`} style={{ marginLeft: 4 }}>ST {s.scores.st}</span>
                  </div>
                  <button className="sa-btn sa-btn-remove" onClick={() => removeStock(s.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}

          {stocks.length === 0 && (
            <div className="sa-empty">Add at least one stock to start analysis. Use "Load Colgate example" to try it out.</div>
          )}
        </div>
      )}

      {activeTab === 'analyze' && (
        <div>
          {stocks.length === 0 ? (
            <div className="sa-empty">Add stocks first to see analysis.</div>
          ) : (
            <>
              {stocks.length > 1 && (
                <div className="sa-stock-tabs">
                  {stocks.map((s, i) => (
                    <button key={s.id} className={`sa-stock-tab${analyzeIdx === i ? ' active' : ''}`} onClick={() => setAnalyzeIdx(i)}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              <StockCard s={stocks[analyzeIdx]} />
            </>
          )}
        </div>
      )}

      {activeTab === 'compare' && (
        <div>
          {stocks.length < 2 ? (
            <div className="sa-empty">Add at least two stocks to compare.</div>
          ) : (
            <CompareTable stocks={stocks} />
          )}
        </div>
      )}

      {activeTab === 'ranking' && (
        <div>
          {stocks.length === 0 ? (
            <div className="sa-empty">Add stocks to see rankings.</div>
          ) : (
            <RankingView stocks={stocks} sortKey={sortKey} setSortKey={setSortKey} sorted={sorted} />
          )}
        </div>
      )}

      <div className="sa-disclaimer">
        For study and educational purposes only. Not financial advice. Always consult a SEBI-registered advisor before investing.
      </div>
    </div>
  );
}

function StockCard({ s }) {
  const sc = s.scores;
  const ltV = getVerdict(sc.lt, 'lt');
  const stV = getVerdict(sc.st, 'st');

  return (
    <div className="sa-card">
      <div className="sa-card-head">
        <div>
          <div className="sa-card-title">{s.name}</div>
          <div className="sa-card-meta">CMP ₹{f(s.cmp)} &nbsp;·&nbsp; MCap ₹{f(s.mcap, 0)} Cr &nbsp;·&nbsp; P/E {f(s.pe)}</div>
        </div>
        <div className="sa-rings">
          {[['lt', 'LT', sc.lt], ['st', 'ST', sc.st]].map(([k, lbl, score]) => (
            <div key={k} className={`sa-ring sa-ring-${scoreColor(score)}`}>
              <span className="sa-ring-score">{score}</span>
              <span className="sa-ring-label">{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sa-section-label">Key metrics</div>
      <div className="sa-metrics-grid">
        {[
          ['P/E ratio', f(s.pe), s.pe < 30 ? 'good' : s.pe < 45 ? 'warn' : 'bad'],
          ['PEG ratio', f(sc.peg), sc.peg < 1.5 ? 'good' : sc.peg < 3 ? 'warn' : 'bad'],
          ['ROE 3yr', pct(s.roe3yr), s.roe3yr >= 20 ? 'good' : s.roe3yr >= 12 ? 'warn' : 'bad'],
          ['ROCE', pct(s.roce), s.roce >= 20 ? 'good' : s.roce >= 12 ? 'warn' : 'bad'],
          ['Div yield', pct(s.divYld), s.divYld >= 3 ? 'good' : s.divYld >= 1 ? 'warn' : 'neutral'],
          ['Payout', pct(s.payout), s.payout <= 70 ? 'good' : s.payout <= 85 ? 'warn' : 'bad'],
          ['Debt/Equity', f(s.de), s.de <= 0.5 ? 'good' : s.de <= 1 ? 'warn' : 'bad'],
          ['3yr return', pct(s.ret3yr), s.ret3yr >= 30 ? 'good' : s.ret3yr >= 10 ? 'warn' : 'bad'],
          ['Profit growth 3yr', pct(s.pg3), s.pg3 >= 12 ? 'good' : s.pg3 >= 6 ? 'warn' : 'bad'],
          ['Sales growth 3yr', pct(s.sg3), s.sg3 >= 8 ? 'good' : s.sg3 >= 4 ? 'warn' : 'bad'],
          ['EPS (calc)', '₹' + f(sc.eps), 'neutral'],
          ['Fair PE (2.5×g)', f(sc.fairPE, 1), 'neutral'],
        ].map(([lbl, val, cls]) => (
          <div key={lbl} className="sa-metric-card">
            <div className="sa-metric-label">{lbl}</div>
            <div className={`sa-metric-val sa-${cls}`}>{val}</div>
          </div>
        ))}
      </div>

      {sc.fairPrice > 0 && (
        <div className="sa-fair-price-box">
          <span>Fair price estimate (EPS × fair PE):</span>
          <strong> ₹{sc.fairPrice.toLocaleString('en-IN')}</strong>
          <span className="sa-fair-note"> &nbsp;·&nbsp; Current: ₹{f(s.cmp)} &nbsp;·&nbsp;
            {s.cmp > sc.fairPrice
              ? <span className="sa-bad"> Overvalued by {(((s.cmp - sc.fairPrice) / sc.fairPrice) * 100).toFixed(0)}%</span>
              : <span className="sa-good"> Undervalued by {(((sc.fairPrice - s.cmp) / sc.fairPrice) * 100).toFixed(0)}%</span>
            }
          </span>
        </div>
      )}

      <div className="sa-section-label" style={{ marginTop: 14 }}>Score breakdown</div>
      <div className="sa-score-bars">
        {[['Quality', sc.qual], ['Valuation', sc.val], ['Dividend', sc.div], ['Safety', sc.safety]].map(([lbl, v]) => (
          <div key={lbl} className="sa-score-row">
            <div className="sa-score-meta">
              <span className="sa-score-name">{lbl}</span>
              <span className={`sa-score-num sa-${scoreColor(v)}`}>{v}/100</span>
            </div>
            <div className="sa-prog"><div className={`sa-prog-fill sa-fill-${scoreColor(v)}`} style={{ width: v + '%' }} /></div>
          </div>
        ))}
      </div>

      <div className="sa-section-label" style={{ marginTop: 14 }}>Verdict</div>
      <div className="sa-verdict-grid">
        {[['Long term', ltV, sc.lt], ['Short term', stV, sc.st]].map(([lbl, v, score]) => (
          <div key={lbl} className={`sa-verdict sa-verdict-${v.color}`}>
            <div className="sa-verdict-label">{lbl}</div>
            <div className={`sa-verdict-tag sa-badge-${v.color === 'success' ? 'good' : v.color === 'warning' ? 'warn' : 'bad'}`}>{v.label}</div>
            <div className="sa-verdict-score">Score: {score}/100</div>
          </div>
        ))}
      </div>

      {sc.greens.length > 0 && (
        <>
          <div className="sa-section-label" style={{ marginTop: 12 }}>Strengths</div>
          <div className="sa-flags">{sc.greens.map(g => <span key={g} className="sa-flag-green">{g}</span>)}</div>
        </>
      )}
      {sc.flags.length > 0 && (
        <>
          <div className="sa-section-label" style={{ marginTop: 8 }}>Risk flags</div>
          <div className="sa-flags">{sc.flags.map(f => <span key={f} className="sa-flag-red">{f}</span>)}</div>
        </>
      )}
    </div>
  );
}

function CompareTable({ stocks }) {
  const metrics = [
    ['CMP ₹', s => '₹' + f(s.cmp), () => 'neutral'],
    ['P/E', s => f(s.pe), s => s.pe < 30 ? 'good' : s.pe < 45 ? 'warn' : 'bad'],
    ['PEG', s => f(s.scores.peg), s => s.scores.peg < 1.5 ? 'good' : s.scores.peg < 3 ? 'warn' : 'bad'],
    ['ROE 3yr', s => pct(s.roe3yr), s => s.roe3yr >= 20 ? 'good' : s.roe3yr >= 12 ? 'warn' : 'bad'],
    ['ROCE', s => pct(s.roce), s => s.roce >= 20 ? 'good' : s.roce >= 12 ? 'warn' : 'bad'],
    ['Profit 3yr', s => pct(s.pg3), s => s.pg3 >= 12 ? 'good' : s.pg3 >= 6 ? 'warn' : 'bad'],
    ['Sales 3yr', s => pct(s.sg3), s => s.sg3 >= 8 ? 'good' : s.sg3 >= 4 ? 'warn' : 'bad'],
    ['Div yield', s => pct(s.divYld), s => s.divYld >= 3 ? 'good' : s.divYld >= 1 ? 'warn' : 'neutral'],
    ['Payout', s => pct(s.payout), s => s.payout <= 70 ? 'good' : s.payout <= 85 ? 'warn' : 'bad'],
    ['D/E', s => f(s.de), s => s.de <= 0.5 ? 'good' : s.de <= 1 ? 'warn' : 'bad'],
    ['3yr return', s => pct(s.ret3yr), s => s.ret3yr >= 30 ? 'good' : s.ret3yr >= 10 ? 'warn' : 'bad'],
    ['LT score', s => s.scores.lt + '/100', s => scoreColor(s.scores.lt)],
    ['ST score', s => s.scores.st + '/100', s => scoreColor(s.scores.st)],
    ['Div score', s => s.scores.div + '/100', s => scoreColor(s.scores.div)],
  ];

  return (
    <div className="sa-card sa-compare-wrap">
      <div className="sa-compare-scroll">
        <table className="sa-cmp-table">
          <thead>
            <tr>
              <th>Metric</th>
              {stocks.map(s => <th key={s.id}>{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {metrics.map(([lbl, valFn, clsFn]) => (
              <tr key={lbl}>
                <td className="sa-cmp-label">{lbl}</td>
                {stocks.map(s => <td key={s.id} className={`sa-${clsFn(s)}`}>{valFn(s)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RankingView({ stocks, sortKey, setSortKey, sorted }) {
  const categories = [
    { key: 'lt', label: 'Long term', metaFn: s => `ROE ${f(s.roe3yr)}% · ROCE ${f(s.roce)}%` },
    { key: 'st', label: 'Short term', metaFn: s => `Qtr profit ${f(s.qtrProfitVar)}% · Sales ${f(s.qtrSalesVar)}%` },
    { key: 'div', label: 'Dividend income', metaFn: s => `Yield ${f(s.divYld)}% · Payout ${f(s.payout, 0)}%` },
  ];

  return (
    <div>
      <div className="sa-sort-row">
        <span className="sa-label" style={{ margin: 0 }}>Sort by:</span>
        {categories.map(c => (
          <button key={c.key} className={`sa-mode-btn${sortKey === c.key ? ' active' : ''}`} onClick={() => setSortKey(c.key)}>{c.label}</button>
        ))}
      </div>
      {categories.map(cat => {
        const catSorted = [...stocks].sort((a, b) => b.scores[cat.key] - a.scores[cat.key]);
        return (
          <div key={cat.key} style={{ marginBottom: 20 }}>
            <div className="sa-section-label">{cat.label} ranking</div>
            <div className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
              {catSorted.map((s, i) => {
                const v = getVerdict(s.scores[cat.key], cat.key === 'div' ? 'lt' : cat.key);
                return (
                  <div key={s.id} className="sa-rank-row">
                    <div className={`sa-rank-num ${i === 0 ? 'sa-good' : i === 1 ? 'sa-warn' : 'sa-neutral'}`}>#{i + 1}</div>
                    <div className="sa-rank-info">
                      <div className="sa-rank-name">{s.name}</div>
                      <div className="sa-rank-meta">{cat.metaFn(s)}</div>
                    </div>
                    <div className="sa-rank-score-wrap">
                      <div className={`sa-rank-score sa-${scoreColor(s.scores[cat.key])}`}>{s.scores[cat.key]}/100</div>
                      <div className="sa-prog" style={{ width: 80 }}>
                        <div className={`sa-prog-fill sa-fill-${scoreColor(s.scores[cat.key])}`} style={{ width: s.scores[cat.key] + '%' }} />
                      </div>
                    </div>
                    <div className={`sa-badge sa-badge-${v.color === 'success' ? 'good' : v.color === 'warning' ? 'warn' : 'bad'}`}>{v.short}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
