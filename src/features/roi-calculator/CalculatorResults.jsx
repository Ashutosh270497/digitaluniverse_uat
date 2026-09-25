import { ArrowRight, Calculator, CircleDollarSign, TrendingUp } from 'lucide-react';
import { formatPeriod, formatScenarioMoney } from './calculatorConfig.js';
import { activatePrimaryAuditForm, PRIMARY_CTA_LABEL } from '../lead-capture/primaryCta.js';

const CalculatorResults = ({ calculation, resultRef }) => {
  if (!calculation) return (
    <div className="growth-empty" data-calculator-empty>
      <span className="growth-empty-icon"><Calculator size={30} aria-hidden="true" /></span>
      <h3>Your next growth scenario starts here.</h3>
      <p>Enter your monthly numbers, choose a period and select <strong>Calculate My Potential</strong> to see the breakdown.</p>
      <div className="growth-empty-steps"><span>Revenue potential</span><span>Ad spend</span><span>Revenue gain</span></div>
    </div>
  );
  const money = value => formatScenarioMoney(value, calculation.currency);
  const period = formatPeriod(calculation.periodMonths);
  return (
    <div ref={resultRef} id="growth-calculator-results" className="growth-results" tabIndex={-1} aria-labelledby="growth-results-heading" data-calculator-results>
      <div className="growth-result-heading"><h3 id="growth-results-heading">Your {period} scenario</h3><span>Illustrative estimate</span></div>
      <article className="growth-result-card growth-revenue-card">
        <h4><span className="growth-result-icon"><TrendingUp aria-hidden="true" /></span>Revenue over {period}</h4>
        <p className="growth-result-value" data-result="revenue">{money(calculation.scenarioRevenue)}</p>
        <p className="growth-result-detail">From a {money(calculation.baselineRevenue)} baseline <span className="growth-result-tag">+{calculation.revenueMultiplier}× ad spend assumed</span></p>
        <p className="growth-monthly-context">{money(calculation.monthlyScenarioRevenue)} per month, up from {money(calculation.monthlyRevenue)}</p>
      </article>
      <article className="growth-result-card growth-ad-card">
        <h4><span className="growth-result-icon"><CircleDollarSign aria-hidden="true" /></span>Ad spend over {period}</h4>
        <p className="growth-result-value" data-result="ad-spend">{money(calculation.adSpend)}<span className="growth-result-tag">No change</span></p>
        <p className="growth-result-detail">Maintained at {money(calculation.monthlyAdSpend)} per month.</p>
      </article>
      <article className="growth-result-card growth-impact-card">
        <h4>Your {period} impact</h4>
        <dl>
          <div><dt>Additional revenue</dt><dd data-result="gain">{money(calculation.incrementalRevenue)}</dd></div>
          <div><dt>Revenue gain / ad spend</dt><dd data-result="ratio">{calculation.revenueToSpendPercent === null ? 'N/A' : `${Number(calculation.revenueToSpendPercent.toFixed(2))}%`}</dd></div>
        </dl>
        <p className="growth-result-detail">{calculation.adSpend === 0 ? 'A return ratio cannot be calculated with zero ad spend. ' : ''}This ratio measures revenue, not profit ROI. Product costs, fees, taxes and service costs are not included.</p>
      </article>
      <button type="button" data-calculator-cta onClick={() => activatePrimaryAuditForm({ ctaLocation: 'roi_calculator' })} className="growth-result-cta">{PRIMARY_CTA_LABEL}<ArrowRight size={18} aria-hidden="true" /></button>
    </div>
  );
};

export default CalculatorResults;
