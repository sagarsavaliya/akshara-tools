import { Helmet } from 'react-helmet-async';
import StockAnalyzer from '../tools/StockAnalyzer/StockAnalyzer';

export default function StockAnalyzerPage() {
  return (
    <>
      <Helmet>
        <title>Stock Analyzer — PE, PEG, ROE, Dividend Score | Akshara Tools</title>
        <meta
          name="description"
          content="Analyze Indian stocks with PE ratio, PEG ratio, ROE, ROCE, dividend yield and safety scores. Compare multiple stocks and get long term and short term verdicts. Free tool for study purposes."
        />
        <meta name="keywords" content="stock analyzer india, PE ratio calculator, PEG ratio, ROE ROCE analysis, dividend yield score, long term stock investment, screener.in analysis" />
        <link rel="canonical" href="https://tools.aksharatech.com/stock-analyzer" />
        <meta property="og:title" content="Stock Analyzer — PE, PEG, Dividend Score | Akshara Tools" />
        <meta property="og:description" content="Analyze Indian stocks with comprehensive scoring — quality, valuation, dividend safety and momentum. Compare and rank stocks side by side." />
        <meta property="og:url" content="https://tools.aksharatech.com/stock-analyzer" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Stock Analyzer",
          "url": "https://tools.aksharatech.com/stock-analyzer",
          "description": "Free Indian stock analysis tool — PE, PEG, ROE, ROCE, dividend score, long term and short term verdicts.",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
          "author": { "@type": "Organization", "name": "Akshara Technologies", "url": "https://aksharatech.com" }
        })}</script>
      </Helmet>
      <StockAnalyzer />
    </>
  );
}
