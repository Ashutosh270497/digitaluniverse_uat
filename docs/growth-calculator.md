# Growth calculator — 25 September 2026

The screenshot-inspired calculator is visible on the homepage at `/#growth-calculator`, with a footer link. Its JavaScript is deferred until the section approaches the viewport. It uses the site's yellow/charcoal theme, editable monthly values, synchronized sliders, currency buttons, period controls and a results panel that appears after **Calculate My Potential**.

## Approved calculation

The user explicitly chose an editable 3× additional-revenue assumption, correctly totaled yearly results and an accurate revenue-to-spend label. The screenshot's monthly numbers are not presented as yearly totals, and its 300% revenue ratio is not presented as profit ROI.

For monthly revenue `R`, monthly ad spend `A`, additional-revenue multiplier `M` and period `N` months:

- Monthly additional revenue = `A × M`, rounded to two decimal places.
- Monthly scenario revenue = `R + monthly additional revenue`.
- Baseline revenue = `R × N`.
- Additional revenue over the period = `monthly additional revenue × N`.
- Scenario revenue over the period = `baseline revenue + additional revenue`.
- Ad spend over the period = `A × N`.
- Revenue gain / ad spend = `additional revenue ÷ period ad spend × 100`.

With $50,000 monthly revenue, $5,000 monthly ad spend, 3× and one year, the result is **$780,000 revenue**, **$60,000 ad spend**, **$180,000 additional revenue** and a **300% revenue-to-spend ratio**. The revenue card also shows **$65,000 per month**, up from $50,000.

The uplift applies in every selected month without compounding, with ad spend held constant. It is an adjustable scenario, not an agency performance forecast. Product costs, fees, service costs and taxes are not included; this does not calculate profit ROI. Zero ad spend produces zero additional revenue and an unavailable return ratio rather than dividing by zero.

## Controls and behavior

- USD, INR and GBP use their appropriate symbols and number grouping. Switching currency loads clearly disclosed example amounts; it does not perform exchange-rate conversion.
- Preset periods are 12, 24 and 36 months. Custom periods accept 1–120 whole months.
- Monetary inputs accept 0–1,000,000,000, in increments of 0.01. Sliders expand their scale for a larger valid typed amount.
- The multiplier accepts 0–20 in increments of 0.1; its default is 3.
- Empty, negative and out-of-range inputs are blocked by native form validation. The calculation function also rejects invalid values.
- Input changes clear previous results. Reset restores the selected currency's example amounts, 3× and one year.
- Enter submits the calculator. Results receive focus and are announced; mobile layouts scroll the results into view, respecting reduced motion.
- The result CTA opens and focuses the existing Amazon audit form. Calculation itself sends no account data or lead submission.

## Files

- `src/pages/home/sections/GrowthCalculatorSection.jsx`: viewport loading and stable anchor.
- `src/features/roi-calculator/ROICalculator.jsx`: input state, validation flow and results announcement.
- `CalculatorMoneyField.jsx`, `CalculatorResults.jsx`, `calculator.css`: controls, result cards and responsive layout.
- `roiScenario.js`: pure arithmetic and input guards.
- `calculatorConfig.js`: currency examples, periods and formatting.

## Verification

`npm run check` covers lint, type checks, 121 tests, the production build and 14 HTML entry checks. Calculation tests cover the supplied example, all periods, edited multipliers, zero values, decimal rounding, invalid inputs, upper bounds and currency formatting.

`npm run calculator:verify` tests the local production preview with real Chrome input and keyboard events, all controls, stale-result clearing, validation, the enquiry CTA, and five widths from 320 to 1440 px. It includes the largest supported amounts and verifies that calculation makes no POST requests. Screenshots are saved as `artifacts/audits/growth-calculator-1440.png` and `growth-calculator-390.png`.

Site-wide responsive and integration audits cover the calculator in the surrounding homepage and the new footer link. The pre-change calculator source is backed up in `artifacts/checkpoints/pre-calculator-refresh/source.tar.gz`. This change has not been committed, pushed or deployed.
