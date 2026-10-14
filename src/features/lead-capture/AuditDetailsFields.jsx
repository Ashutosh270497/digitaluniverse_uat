import { Check } from 'lucide-react';
import {
  CHALLENGES,
  DETAILS_LIMITS,
  MARKETPLACES,
  SELLER_TYPES,
  getAdSpendOptions,
} from '../../../shared/leadSchema.js';
import {
  chipClassName,
  errorClassName,
  hintClassName,
  inputClassName,
  labelClassName,
  optionClassName,
} from './formStyles.js';
import { detailFieldIds } from './useAuditForm.js';

const describedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

const ChipGroup = ({ name, legend, options, selected, onToggle, error, idPrefix }) => (
  <fieldset aria-describedby={error ? `${idPrefix}-error` : undefined}>
    <legend className={labelClassName}>{legend}</legend>
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = selected.includes(option.value);
        return (
          <label key={option.value} className="relative">
            <input
              type="checkbox"
              id={`${idPrefix}-${option.value}`}
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onToggle(name, option.value)}
              className="peer sr-only"
            />
            <span className={chipClassName}>
              {checked && <Check className="h-4 w-4" aria-hidden="true" />}
              {option.flag && <span aria-hidden="true">{option.flag}</span>}
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
    {error && <p id={`${idPrefix}-error`} className={errorClassName}>{error}</p>}
  </fieldset>
);

// Optional Step 2 answers. Rendered inside the audit form after the lead is delivered.
const AuditDetailsFields = ({ details, errors, revenueCurrency, onChange, onToggle }) => (
  <div className="space-y-4">
    <div>
      <label htmlFor={detailFieldIds.storeUrl} className={labelClassName}>
        Amazon store or brand URL / top ASIN
      </label>
      <input
        type="text"
        id={detailFieldIds.storeUrl}
        name="storeUrl"
        inputMode="url"
        autoComplete="url"
        autoCapitalize="none"
        spellCheck="false"
        enterKeyHint="next"
        maxLength={DETAILS_LIMITS.storeUrl}
        placeholder="amazon.in/stores/YourBrand or B0XXXXXXXX"
        value={details.storeUrl}
        onChange={onChange}
        aria-invalid={Boolean(errors.storeUrl)}
        aria-describedby={describedBy('audit-details-store-hint', errors.storeUrl ? 'audit-details-store-error' : '')}
        className={inputClassName(errors.storeUrl)}
      />
      <p id="audit-details-store-hint" className={hintClassName}>A storefront link, product link or ASIN is enough.</p>
      {errors.storeUrl && <p id="audit-details-store-error" className={errorClassName}>{errors.storeUrl}</p>}
    </div>

    <ChipGroup
      name="marketplaces"
      legend="Where do you sell? (choose all that apply)"
      options={MARKETPLACES}
      selected={details.marketplaces}
      onToggle={onToggle}
      error={errors.marketplaces}
      idPrefix="audit-details-marketplace"
    />

    <fieldset aria-describedby={errors.sellerType ? 'audit-details-seller-error' : undefined}>
      <legend className={labelClassName}>What best describes you?</legend>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {SELLER_TYPES.map((type) => (
          <label key={type.value} className="relative cursor-pointer">
            <input
              type="radio"
              id={`audit-details-seller-${type.value}`}
              name="sellerType"
              value={type.value}
              checked={details.sellerType === type.value}
              onChange={onChange}
              className="peer sr-only"
            />
            <span className={optionClassName}>{type.label}</span>
          </label>
        ))}
      </div>
      {errors.sellerType && <p id="audit-details-seller-error" className={errorClassName}>{errors.sellerType}</p>}
    </fieldset>

    <div>
      <label htmlFor={detailFieldIds.adSpend} className={labelClassName}>Monthly Amazon ad spend</label>
      <select
        id={detailFieldIds.adSpend}
        name="adSpend"
        value={details.adSpend}
        onChange={onChange}
        aria-invalid={Boolean(errors.adSpend)}
        aria-describedby={describedBy('audit-details-ad-spend-hint', errors.adSpend ? 'audit-details-ad-spend-error' : '')}
        className={inputClassName(errors.adSpend)}
      >
        <option value="">Select a range (optional)</option>
        {getAdSpendOptions(revenueCurrency).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <p id="audit-details-ad-spend-hint" className={hintClassName}>Shown in {revenueCurrency}, the currency you chose in Step 1.</p>
      {errors.adSpend && <p id="audit-details-ad-spend-error" className={errorClassName}>{errors.adSpend}</p>}
    </div>

    <ChipGroup
      name="challenges"
      legend="Biggest challenges right now"
      options={CHALLENGES}
      selected={details.challenges}
      onToggle={onToggle}
      error={errors.challenges}
      idPrefix="audit-details-challenge"
    />

    <div>
      <label htmlFor={detailFieldIds.notes} className={labelClassName}>Anything else? (optional)</label>
      <textarea
        id={detailFieldIds.notes}
        name="notes"
        rows={3}
        maxLength={DETAILS_LIMITS.notes}
        placeholder="e.g. our best seller dropped in rankings last month…"
        value={details.notes}
        onChange={onChange}
        aria-invalid={Boolean(errors.notes)}
        aria-describedby={errors.notes ? 'audit-details-notes-error' : undefined}
        className={`${inputClassName(errors.notes)} resize-y`}
      />
      {errors.notes && <p id="audit-details-notes-error" className={errorClassName}>{errors.notes}</p>}
    </div>
  </div>
);

export default AuditDetailsFields;
