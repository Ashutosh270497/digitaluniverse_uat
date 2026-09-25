import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Calculator, RotateCcw } from 'lucide-react';
import { calculateRoiScenario, GROWTH_ASSUMPTION, PERIOD_LIMITS } from './roiScenario.js';
import { CALCULATOR_CURRENCIES, CALCULATOR_PERIODS, formatPeriod, formatScenarioMoney } from './calculatorConfig.js';
import CalculatorMoneyField from './CalculatorMoneyField.jsx';
import CalculatorResults from './CalculatorResults.jsx';
import './calculator.css';

const ROICalculator = () => {
  const [currencyKey, setCurrencyKey] = useState('USD');
  const currency = CALCULATOR_CURRENCIES.find(item => item.key === currencyKey);
  const [monthlyRevenue, setMonthlyRevenue] = useState(String(currency.revenue.initial));
  const [monthlyAdSpend, setMonthlyAdSpend] = useState(String(currency.adSpend.initial));
  const [revenueMultiplier, setRevenueMultiplier] = useState(String(GROWTH_ASSUMPTION.initial));
  const [period, setPeriod] = useState(12);
  const [customMonths, setCustomMonths] = useState('6');
  const [calculation, setCalculation] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const resultRef = useRef(null);

  useEffect(() => {
    if (!calculation) return;
    resultRef.current?.focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 1023px)').matches) {
      resultRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }, [calculation]);

  const update = setter => value => {
    setter(value);
    setCalculation(null);
    setAnnouncement('Inputs updated. Select Calculate My Potential for a new result.');
  };
  const selectCurrency = key => {
    if (key === currencyKey) return;
    const next = CALCULATOR_CURRENCIES.find(item => item.key === key);
    setCurrencyKey(key);
    setMonthlyRevenue(String(next.revenue.initial));
    setMonthlyAdSpend(String(next.adSpend.initial));
    setCalculation(null);
    setAnnouncement(`Example amounts loaded in ${next.key}. Currencies are not converted.`);
  };
  const reset = () => {
    setMonthlyRevenue(String(currency.revenue.initial));
    setMonthlyAdSpend(String(currency.adSpend.initial));
    setRevenueMultiplier(String(GROWTH_ASSUMPTION.initial));
    setPeriod(12);
    setCustomMonths('6');
    setCalculation(null);
    setAnnouncement('Example values restored. Select Calculate My Potential to see the result.');
  };
  const calculate = event => {
    event.preventDefault();
    const result = calculateRoiScenario({
      monthlyRevenue: Number(monthlyRevenue),
      monthlyAdSpend: Number(monthlyAdSpend),
      revenueMultiplier: Number(revenueMultiplier),
      periodMonths: period === 'custom' ? Number(customMonths) : period,
    });
    setCalculation({ ...result, currency });
    setAnnouncement(`Calculation complete. Revenue over ${formatPeriod(result.periodMonths)}: ${formatScenarioMoney(result.scenarioRevenue, currency)}. Additional revenue: ${formatScenarioMoney(result.incrementalRevenue, currency)}.`);
  };

  return (
    <section id="roi-calculator" aria-labelledby="roi-calculator-heading" className="growth-calculator section-space text-white">
      <div className="section-shell">
        <div className="growth-calculator-heading">
          <p className="growth-calculator-badge"><Calculator size={16} aria-hidden="true" />Plan your Amazon growth</p>
          <h2 id="roi-calculator-heading">See Your <span>Potential Growth</span></h2>
          <p>Turn your monthly numbers into a clear growth scenario.<br className="hidden sm:block" /> Adjust the assumptions and see how the numbers add up.</p>
        </div>
        <div className="growth-calculator-grid">
          <form onSubmit={calculate} className="growth-input-panel" aria-labelledby="growth-input-heading">
            <div className="growth-panel-heading"><h3 id="growth-input-heading">Enter Your Current Numbers</h3><button type="button" onClick={reset} className="growth-reset" aria-label="Reset calculator to example values"><RotateCcw size={16} aria-hidden="true" /><span>Reset</span></button></div>
            <fieldset className="growth-fieldset"><legend>Currency</legend>
              <div className="growth-currency-options">
                {CALCULATOR_CURRENCIES.map(item => <button type="button" key={item.key} data-currency={item.key} aria-pressed={item.key === currencyKey} onClick={() => selectCurrency(item.key)} className="growth-choice"><span aria-hidden="true">{item.symbol}</span> {item.label}<span className="sr-only"> ({item.key})</span></button>)}
              </div>
              <p className="growth-input-hint">Switching currency loads example amounts, not an exchange conversion.</p>
            </fieldset>
            <CalculatorMoneyField id="roi-monthly-revenue" label="Monthly revenue" value={monthlyRevenue} settings={currency.revenue} currency={currency} onChange={update(setMonthlyRevenue)} />
            <CalculatorMoneyField id="roi-monthly-ad-spend" label="Monthly ad spend" value={monthlyAdSpend} settings={currency.adSpend} currency={currency} onChange={update(setMonthlyAdSpend)} />
            <fieldset className="growth-fieldset"><legend>Time period</legend>
              <div className="growth-period-options">
                {CALCULATOR_PERIODS.map(item => <button type="button" key={item.months} data-period={item.months} aria-pressed={period === item.months} onClick={() => update(setPeriod)(item.months)} className="growth-choice">{item.label}</button>)}
                <button type="button" data-period="custom" aria-pressed={period === 'custom'} onClick={() => update(setPeriod)('custom')} className="growth-choice">Custom</button>
              </div>
              {period === 'custom' && <div className="growth-custom-period"><label htmlFor="roi-custom-months">Number of months</label><input id="roi-custom-months" type="number" inputMode="numeric" min={PERIOD_LIMITS.min} max={PERIOD_LIMITS.max} step="1" required value={customMonths} onChange={event => update(setCustomMonths)(event.target.value)} aria-describedby="roi-custom-months-hint" /><p id="roi-custom-months-hint" className="growth-input-hint">Choose 1–120 whole months.</p></div>}
            </fieldset>
            <div className="growth-assumption">
              <div className="growth-field-heading"><label htmlFor="roi-revenue-multiplier">Extra revenue assumption</label><div className="growth-multiplier-input"><input id="roi-revenue-multiplier" type="number" inputMode="decimal" required min={GROWTH_ASSUMPTION.min} max={GROWTH_ASSUMPTION.max} step="0.1" value={revenueMultiplier} onChange={event => update(setRevenueMultiplier)(event.target.value)} aria-describedby="roi-multiplier-hint" /><span aria-hidden="true">×</span></div></div>
              <p id="roi-multiplier-hint" className="growth-input-hint">Extra monthly revenue = monthly ad spend × this multiplier. Edit the 3× example to match your assumption.</p>
            </div>
            <button type="submit" className="growth-calculate-button" data-calculate-potential><Calculator size={18} aria-hidden="true" />Calculate My Potential<ArrowRight size={18} aria-hidden="true" /></button>
          </form>
          <div className="growth-output-panel"><CalculatorResults calculation={calculation} resultRef={resultRef} /></div>
        </div>
        <p className="growth-method-note">Illustrative scenario, not a forecast or guarantee. Monthly revenue and ad spend stay constant across the selected period; the assumed uplift applies each month without compounding. No account information is sent by this calculator.</p>
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</p>
      </div>
    </section>
  );
};

export default ROICalculator;
