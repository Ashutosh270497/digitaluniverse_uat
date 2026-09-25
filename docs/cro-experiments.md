# Digital Universe Pro controlled CRO framework

Status as of 2026-08-27: **framework implemented; every production experiment dormant**

## Decision summary

No experiment should start yet. The repository contains a complete funnel event taxonomy,
but it contains no production funnel observations. Analytics provider IDs are blank, the
new funnel is not deployed, production lead delivery is not configured, the calendar is
not configured, and the legal policies are unpublished. “Unavailable” must not be treated
as a zero-percent conversion rate.

The first activity is a baseline-only measurement period on the approved production
funnel. After that period, choose the first experiment from the observed bottleneck. If
management requires a provisional queue before data exists, `primary_cta_copy` is the
lowest-risk first candidate; that is an implementation-risk recommendation, not a result
supported by measured funnel data.

## Existing control and quantitative baseline

The current control experience is:

- problem-focused H1: “Struggling to Scale Your Amazon Business?”;
- primary CTA: “Request My Free Amazon Audit”;
- embedded four-field audit form;
- official Amazon SPN proof above the fold;
- required monthly Amazon revenue range.

| Funnel stage | Existing event | Production baseline |
| --- | --- | --- |
| Eligible landing | `page_view` | Unavailable — no configured production provider/data export |
| Primary CTA | `primary_cta_click` | Unavailable |
| Form start | `audit_form_start` | Unavailable |
| Valid form submit | `audit_form_submit` | Unavailable |
| Confirmed lead delivery | `audit_form_success` | Unavailable — real destination is not configured |
| Confirmed booking | `calendar_booked` | Unavailable — calendar/callback is not configured |
| Qualified or sales-accepted lead | CRM disposition | Unavailable — no approved CRM field/export supplied |

Local QA measurements such as 90 passing tests and Lighthouse scores are product-quality
evidence, not conversion measurements. They cannot select an experiment or a winner.

### Baseline collection gate

Before assigning production visitors:

1. Close the legal, lead-delivery, calendar, analytics and deployment blockers in
   `docs/archive/release-readiness.md`.
2. Configure consent-approved analytics and verify that no lead-field values appear in
   event payloads.
3. Define one CRM field for an opaque experiment ID/variant and approved lead-quality
   dispositions. Do not use PII as an analytics join key.
4. Run an A/A or control-only instrumentation check and confirm event ordering, dedupe,
   consent, UTM attribution, and downstream lead counts.
5. Collect at least four complete weeks and enough confirmed leads to calculate the
   required sample size. Four weeks alone is not sufficient if volume remains small.
6. Freeze the baseline rates, planned minimum detectable effect, two-sided significance
   threshold, target power, maximum run time, exclusions and guardrail thresholds before
   starting a treatment.

## Framework controls

- `VITE_CRO_APPROVED=true` and exactly one `VITE_CRO_ACTIVE_EXPERIMENT_ID` are both
  required. Blank/default values render the current control.
- Only one experiment ID exists in runtime configuration, preventing simultaneous major
  funnel tests.
- Treatment allocation defaults to 50% and can be set from 1–99 with
  `VITE_CRO_TREATMENT_PERCENT` before the start. Do not change it while a test is running.
- Assignment is generated once and stored in `sessionStorage`, so reloads and full-page
  navigation cannot change the variant during the same browser-tab visit.
- `experiment_id` and `experiment_variant` are added to every consented analytics event
  through the strict non-sensitive context allowlist.
- Localhost, configured internal hostnames, automated browsers, test mode, and visits
  marked with `?cro_internal=1` are excluded. The exclusion persists for that session.
- Configure provider-side office-IP and staff/test-user filters as an additional control;
  client code cannot reliably identify every internal visitor.
- `VITE_CRO_PREVIEW_VARIANT` can render `control` or `treatment` only in development/test
  mode. Preview traffic emits no experiment context.
- `above_fold_proof` is code-blocked until a publishable verified case study exists.
- The revenue-field treatment additionally requires matching server settings:
  `CRO_EXPERIMENT_APPROVED=true` and
  `CRO_ACTIVE_EXPERIMENT_ID=revenue_range_field`. Client configuration alone cannot make
  revenue optional.

To remove the framework, remove `src/experiments/`, its imports in the hero, form and
analytics modules, the CRO environment variables, and the CRO-specific tests. The
control copy and four-field form remain explicit fallbacks.

## Measurement and decision rules

An eligible session is a non-internal, non-test session assigned by the framework. An
analytics rate uses only eligible sessions that granted the required measurement consent.
Report consent rate by variant to detect bias; do not count visitors who decline as
non-converters.

Before each start, calculate the required sample from the frozen control rate, approved
minimum detectable effect, 5% two-sided significance level, and at least 80% power. A test
may end only when:

- it has covered at least four complete weeks and the precomputed sample for both variants;
- no sample-ratio mismatch or material instrumentation loss remains unexplained;
- the primary effect and confidence interval are stable across the final two reporting
  checkpoints and are not driven by one campaign, marketplace or device segment;
- lead-quality data has reached the agreed completeness threshold;
- no accessibility, legal, delivery, spam or lead-quality guardrail has breached its
  pre-agreed stop threshold.

Do not stop after an early uplift, repeatedly peek and reset significance, or declare a
winner when the planned sample is not feasible. If the maximum run time expires without
adequate power, record the result as inconclusive and retain the control.

### Shared lead-quality guardrails

Use the same definitions for every experiment:

- sales-accepted lead rate per confirmed lead;
- qualified-fit rate using an approved CRM definition for established seller, entering
  brand, or India/global expansion fit;
- confirmed calendar booking rate per confirmed lead;
- invalid, spam and duplicate lead rate;
- lead-delivery failure rate;
- follow-up contactability and meeting no-show rate, if consistently recorded.

Guardrails must be aggregated by variant in the CRM or approved reporting layer. Do not
send names, emails, telephone numbers, Amazon URLs, or free text to analytics.

## Experiment 1 — Hero positioning

- **ID:** `hero_positioning`
- **Hypothesis:** An outcome-focused headline will increase confirmed audit requests by
  making the desired commercial result clearer without changing the offer or form.
- **Control:** “Struggling to Scale Your Amazon Business?”
- **Treatment:** “Build Profitable Amazon Growth Across India and Global Marketplaces.”
- **Primary metric:** Eligible homepage sessions with `audit_form_success` / eligible
  homepage landing sessions.
- **Guardrail metrics:** Shared lead-quality guardrails; CTA click rate; form-start rate;
  bounce/engagement diagnostic; consent rate; device and marketplace-fit mix.
- **Start date:** Not scheduled.
- **End criteria:** Global decision rules above; headline is the only positioning variable.
- **Result:** Not run.
- **Decision:** Hold until baseline identifies landing-to-CTA or landing-to-lead weakness.

## Experiment 2 — Primary CTA wording

- **ID:** `primary_cta_copy`
- **Hypothesis:** “Get My Amazon Growth Plan” will generate more qualified CTA engagement
  than “Request My Free Amazon Audit” without reducing confirmed-lead quality.
- **Control:** “Request My Free Amazon Audit.”
- **Treatment:** “Get My Amazon Growth Plan.”
- **Primary metric:** Eligible homepage sessions with `primary_cta_click` / eligible
  homepage landing sessions.
- **Guardrail metrics:** Form start per CTA click; form success per CTA click; all shared
  lead-quality guardrails; misunderstanding observed in sales follow-up.
- **Start date:** Not scheduled.
- **End criteria:** Global decision rules above; all identical audit actions use the
  assigned label consistently.
- **Result:** Not run.
- **Decision:** Provisional first candidate after baseline only if landing-to-CTA is the
  measured bottleneck and downstream quality is measurable.

## Experiment 3 — Form presentation

- **ID:** `form_presentation`
- **Hypothesis:** Requiring an intentional CTA before revealing the short form will improve
  confirmed lead quality enough to offset any completion loss.
- **Control:** Four-field form embedded in the hero.
- **Treatment:** Accessible CTA-triggered inline reveal of the same form; focus moves to
  the first field, with the same validation, consent and delivery behavior.
- **Primary metric:** Eligible homepage sessions with `audit_form_success` / eligible
  homepage landing sessions.
- **Guardrail metrics:** Shared lead-quality guardrails; CTA-to-form-start rate; form-start
  to-success rate; keyboard completion; mobile completion; validation-error rate.
- **Start date:** Not scheduled.
- **End criteria:** Global decision rules plus an accessibility smoke test for reveal,
  focus, keyboard and screen-reader behavior in both variants.
- **Result:** Not run.
- **Decision:** Hold until the baseline can show whether form visibility or completion is
  the larger constraint.

## Experiment 4 — Above-the-fold proof

- **ID:** `above_fold_proof`
- **Hypothesis:** A verified, decision-useful case study above the fold will increase
  confirmed audit requests more than official Amazon SPN listings for qualified sellers.
- **Control:** Official Amazon SPN service-listing proof.
- **Treatment:** One published, client-approved, evidence-gated case study with a verified
  result and disclosure.
- **Primary metric:** Eligible homepage sessions with `audit_form_success` / eligible
  homepage landing sessions.
- **Guardrail metrics:** Shared lead-quality guardrails; SPN/case-study evidence clicks;
  case-study detail views; mobile LCP; consent rate.
- **Start date:** Blocked and not scheduled.
- **End criteria:** A case study must first pass `isCaseStudyPublishable`, have publication
  permission, and pass accessibility/performance QA; then apply the global decision rules.
- **Result:** Not run; treatment evidence does not exist in the repository.
- **Decision:** Do not activate and do not substitute an unverified claim or screenshot.

## Experiment 5 — Revenue-range field

- **ID:** `revenue_range_field`
- **Hypothesis:** Removing the required revenue-range field will increase completed audit
  requests without materially reducing qualified-fit or sales-accepted lead rates.
- **Control:** Monthly Amazon revenue range is visible and required on client and server.
- **Treatment:** Revenue range is absent and optional on the server only for the matching,
  approved treatment assignment.
- **Primary metric:** `audit_form_success` sessions / `audit_form_start` sessions.
- **Guardrail metrics:** Shared lead-quality guardrails; qualified-fit and sales-accepted
  rate; follow-up time needed to determine scale; contactability; spam/duplicate rate;
  revenue-data completeness after qualification.
- **Start date:** Not scheduled.
- **End criteria:** Global decision rules plus complete downstream lead-quality disposition
  for the agreed threshold of confirmed leads. Form success alone cannot determine a winner.
- **Result:** Not run.
- **Decision:** Hold until CRM qualification outcomes are reliable; this test can increase
  volume while silently lowering fit.

## Selecting the first experiment from the baseline

Use this decision order after baseline collection:

| Measured bottleneck | First eligible experiment |
| --- | --- |
| Low landing → primary CTA | `primary_cta_copy`, then `hero_positioning` |
| Healthy CTA clicks but low CTA → form start | `form_presentation` |
| Healthy form starts but low form start → success | `revenue_range_field` |
| Strong intent but proof engagement/lead trust is weak, with verified evidence available | `above_fold_proof` |

Current recommendation: **run no CRO treatment first**. Collect the production baseline.
If the baseline confirms weak landing-to-CTA performance, run `primary_cta_copy` first;
otherwise follow the measured bottleneck rather than the provisional queue.

## Implementation verification

- Dormant control build: lint, type-check, 90 tests, production build, 14-entry SEO
  verification, six-viewport responsive audit, and browser integration pass.
- `hero_positioning`, `primary_cta_copy`, `form_presentation`, and
  `revenue_range_field`: each treatment was built and browser-tested separately. Route,
  CTA, keyboard, form error/retry, consent, reduced-motion and responsive checks passed
  without combining experiment IDs.
- `above_fold_proof`: not rendered or browser-tested as a treatment because there is no
  publishable verified case study. Its production assignment remains code-blocked.
- No experiment was deployed or activated in the ordinary production build.
