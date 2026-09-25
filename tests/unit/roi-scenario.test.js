import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRoiScenario, MAX_MONTHLY_AMOUNT } from '../../src/features/roi-calculator/roiScenario.js';
import { CALCULATOR_CURRENCIES, formatPeriod, formatScenarioMoney } from '../../src/features/roi-calculator/calculatorConfig.js';

const input = { monthlyRevenue: 50_000, monthlyAdSpend: 5_000, revenueMultiplier: 3, periodMonths: 12 };

test('screenshot example yields correct monthly figures and annual totals', () => {
  const result = calculateRoiScenario(input);
  assert.equal(result.monthlyScenarioRevenue, 65_000);
  assert.equal(result.monthlyIncrementalRevenue, 15_000);
  assert.equal(result.scenarioRevenue, 780_000);
  assert.equal(result.baselineRevenue, 600_000);
  assert.equal(result.adSpend, 60_000);
  assert.equal(result.incrementalRevenue, 180_000);
  assert.equal(result.revenueToSpendPercent, 300);
  assert.equal(result.revenueGrowthPercent, 30);
  assert.equal('illustrativeRoi' in result, false);
});

test('year presets and custom months scale the same monthly scenario without compounding', () => {
  for (const [months, revenue, gain, adSpend] of [[1,65_000,15_000,5_000], [18,1_170_000,270_000,90_000], [24,1_560_000,360_000,120_000], [36,2_340_000,540_000,180_000], [120,7_800_000,1_800_000,600_000]]) {
    const result = calculateRoiScenario({ ...input, periodMonths: months });
    assert.equal(result.scenarioRevenue, revenue);
    assert.equal(result.incrementalRevenue, gain);
    assert.equal(result.adSpend, adSpend);
    assert.equal(result.revenueToSpendPercent, 300);
  }
});

test('the editable multiplier changes only additional revenue, not the ad budget', () => {
  const result = calculateRoiScenario({ ...input, revenueMultiplier: 1.5 });
  assert.equal(result.scenarioRevenue, 690_000);
  assert.equal(result.incrementalRevenue, 90_000);
  assert.equal(result.revenueToSpendPercent, 150);
  assert.equal(result.adSpend, 60_000);
});

test('zero ad spend keeps baseline revenue and gives no undefined numeric ratio', () => {
  const result = calculateRoiScenario({ ...input, monthlyAdSpend: 0 });
  assert.equal(result.scenarioRevenue, 600_000);
  assert.equal(result.incrementalRevenue, 0);
  assert.equal(result.revenueToSpendPercent, null);
});

test('zero uplift and zero baseline are handled without Infinity or NaN', () => {
  const zeroUplift = calculateRoiScenario({ ...input, revenueMultiplier: 0 });
  assert.equal(zeroUplift.scenarioRevenue, 600_000);
  assert.equal(zeroUplift.revenueToSpendPercent, 0);
  const zeroBaseline = calculateRoiScenario({ ...input, monthlyRevenue: 0 });
  assert.equal(zeroBaseline.scenarioRevenue, 180_000);
  assert.equal(zeroBaseline.revenueGrowthPercent, null);
});

test('fractional money rounds monthly uplift to cents before totaling the period', () => {
  const result = calculateRoiScenario({ ...input, monthlyRevenue: 100.10, monthlyAdSpend: 10.01, revenueMultiplier: 1.5, periodMonths: 3 });
  assert.equal(result.monthlyIncrementalRevenue, 15.02);
  assert.equal(result.monthlyScenarioRevenue, 115.12);
  assert.equal(result.baselineRevenue, 300.30);
  assert.equal(result.incrementalRevenue, 45.06);
  assert.equal(result.scenarioRevenue, 345.36);
  assert.equal(result.adSpend, 30.03);
});

test('invalid inputs are rejected instead of silently calculating fabricated defaults', () => {
  for (const key of ['monthlyRevenue', 'monthlyAdSpend']) {
    for (const value of [NaN, Infinity, -1, '', '50000', undefined, MAX_MONTHLY_AMOUNT + 1]) {
      assert.throws(() => calculateRoiScenario({ ...input, [key]: value }), RangeError);
    }
  }
  for (const value of [0, -1, 12.5, 121, NaN, Infinity, '12']) assert.throws(() => calculateRoiScenario({ ...input, periodMonths: value }), RangeError);
  for (const value of [-1, 20.1, NaN, Infinity, '3']) assert.throws(() => calculateRoiScenario({ ...input, revenueMultiplier: value }), RangeError);
});

test('maximum supported inputs stay finite with consistent totals', () => {
  const result = calculateRoiScenario({ monthlyRevenue: MAX_MONTHLY_AMOUNT, monthlyAdSpend: MAX_MONTHLY_AMOUNT, revenueMultiplier: 20, periodMonths: 120 });
  assert.equal(result.scenarioRevenue, 2_520_000_000_000);
  assert.equal(result.adSpend, 120_000_000_000);
  assert.equal(result.revenueToSpendPercent, 2000);
});

test('currency formatting uses USD, Indian grouping and GBP without converting values', () => {
  assert.equal(formatScenarioMoney(780_000, CALCULATOR_CURRENCIES[0]), '$780,000');
  assert.equal(formatScenarioMoney(780_000, CALCULATOR_CURRENCIES[1]), '₹7,80,000');
  assert.equal(formatScenarioMoney(780_000, CALCULATOR_CURRENCIES[2]), '£780,000');
  assert.equal(formatScenarioMoney(345.36, CALCULATOR_CURRENCIES[0]), '$345.36');
  assert.equal(formatPeriod(12), '1 year');
  assert.equal(formatPeriod(24), '2 years');
  assert.equal(formatPeriod(1), '1 month');
  assert.equal(formatPeriod(18), '18 months');
});
