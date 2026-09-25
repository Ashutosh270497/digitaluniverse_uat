export const GROWTH_ASSUMPTION = Object.freeze({ min: 0, max: 20, initial: 3 });
export const PERIOD_LIMITS = Object.freeze({ min: 1, max: 120 });
export const MAX_MONTHLY_AMOUNT = 1_000_000_000;

// This models additional revenue at unchanged ad spend, not profit or investment ROI.
export const calculateRoiScenario = ({ monthlyRevenue, monthlyAdSpend, revenueMultiplier, periodMonths }) => {
  for (const [name, value] of Object.entries({ monthlyRevenue, monthlyAdSpend })) {
    if (!Number.isFinite(value) || value < 0 || value > MAX_MONTHLY_AMOUNT) {
      throw new RangeError(`${name} must be between 0 and ${MAX_MONTHLY_AMOUNT}.`);
    }
  }
  if (!Number.isFinite(revenueMultiplier) || revenueMultiplier < GROWTH_ASSUMPTION.min || revenueMultiplier > GROWTH_ASSUMPTION.max) {
    throw new RangeError('The additional revenue multiplier must be between 0 and 20.');
  }
  if (!Number.isInteger(periodMonths) || periodMonths < PERIOD_LIMITS.min || periodMonths > PERIOD_LIMITS.max) {
    throw new RangeError('Choose a period of 1 to 120 whole months.');
  }
  const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const monthlyIncrementalRevenue = money(monthlyAdSpend * revenueMultiplier);
  const monthlyScenarioRevenue = money(monthlyRevenue + monthlyIncrementalRevenue);
  const baselineRevenue = money(monthlyRevenue * periodMonths);
  const incrementalRevenue = money(monthlyIncrementalRevenue * periodMonths);
  const adSpend = money(monthlyAdSpend * periodMonths);

  return {
    monthlyRevenue,
    monthlyAdSpend,
    monthlyIncrementalRevenue,
    monthlyScenarioRevenue,
    baselineRevenue,
    incrementalRevenue,
    scenarioRevenue: money(baselineRevenue + incrementalRevenue),
    adSpend,
    revenueToSpendPercent: adSpend > 0 ? (incrementalRevenue / adSpend) * 100 : null,
    revenueGrowthPercent: baselineRevenue > 0 ? (incrementalRevenue / baselineRevenue) * 100 : null,
    revenueMultiplier,
    periodMonths,
  };
};
