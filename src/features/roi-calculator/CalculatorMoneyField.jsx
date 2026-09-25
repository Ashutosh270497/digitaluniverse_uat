import { MAX_MONTHLY_AMOUNT } from './roiScenario.js';
import { formatScenarioMoney } from './calculatorConfig.js';

const CalculatorMoneyField = ({ id, label, value, settings, currency, onChange }) => {
  const numericValue = Number(value);
  const valid = value !== '' && Number.isFinite(numericValue) && numericValue >= 0;
  const sliderMax = valid ? Math.max(settings.max, Math.min(numericValue, MAX_MONTHLY_AMOUNT)) : settings.max;
  const sliderValue = valid ? Math.min(numericValue, sliderMax) : 0;
  const progress = `${sliderValue / sliderMax * 100}%`;

  return (
    <div className="growth-money-field">
      <div className="growth-field-heading">
        <label htmlFor={id}>{label}</label>
        <div className="growth-amount-input">
          <span aria-hidden="true">{currency.symbol}</span>
          <input id={id} name={id} type="number" inputMode="decimal" min="0" max={MAX_MONTHLY_AMOUNT} step="0.01" required value={value} onChange={event => onChange(event.target.value)} aria-describedby={`${id}-hint`} />
        </div>
      </div>
      <input id={`${id}-slider`} aria-label={`Adjust ${label.toLowerCase()}`} aria-valuetext={formatScenarioMoney(sliderValue, currency)} type="range" min="0" max={sliderMax} step="0.01" value={sliderValue} onChange={event => onChange(event.target.value)} className="growth-slider" style={{ '--range-progress': progress }} />
      <div className="growth-range-limits" aria-hidden="true"><span>{formatScenarioMoney(0, currency)}</span><span>{formatScenarioMoney(sliderMax, currency)}</span></div>
      <p id={`${id}-hint`} className="sr-only">Enter an amount in {currency.key}, or adjust the slider. Amounts must be between zero and one billion.</p>
    </div>
  );
};

export default CalculatorMoneyField;
