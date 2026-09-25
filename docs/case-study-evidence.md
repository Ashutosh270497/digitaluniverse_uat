# Case-study evidence and publication workflow

## Current publication status

No client case study, testimonial, client logo, or Seller Central screenshot currently meets the publication gate.

Three legacy result sets remain in the private evidence-review inventory through their claim IDs. Their public values are not rendered because the repository does not contain source exports, metric definitions, agency-attribution methodology, or client publication permissions.

The existing Amazon Service Provider Network URLs are the only first-party partner/service evidence used in the rebuilt case-study section. They link directly to the Digital Universe Pro listings on Amazon Seller Central.

## Source of truth

`src/content/caseStudies.ts` defines the reusable typed model and publication filters. A study needs all of the following before `getPublishedCaseStudies()` can return it:

1. `publicationStatus: 'published'`.
2. `verification.status: 'verified'`.
3. A performance-evidence reference.
4. A documented agency-impact methodology.
5. A client publication-permission reference.
6. At least one ending metric with a value, time period, verified status, and evidence reference.
7. For an anonymous study, this exact approved disclosure:

   `Client identity withheld with permission; performance data verified from Seller Central.`

Homepage selection is limited to the first three publishable studies by `strengthRank`.

## Metric requirements

Every study includes before and after records for:

- ACoS
- TACoS
- Revenue
- Conversion rate
- Organic sales share

Each metric stores its value, time period, verification status, evidence reference, and missing-data explanation. Unknown values remain `null` and render as `Not provided`; they must not be estimated.

Revenue needs a documented currency and definition, such as ordered-product sales, shipped sales, gross revenue, or net revenue. A revenue screenshot alone does not demonstrate that agency work caused the result.

## Asset and testimonial rules

- A client logo, product image, or Seller Central screenshot renders only when it has an approval flag and a non-empty permission reference.
- Seller Central screenshots must be real, client-approved, and redacted. The model rejects an unredacted Seller Central screenshot even when another approval flag is present.
- Screenshots are described as source evidence, not standalone agency-impact proof.
- Testimonials render only from a publishable case study and require exact attribution, a quotation-source explanation, and a permission reference.
- The former generic `Verified` badge is not used. Each published testimonial explains how the quotation was checked.
- Both legacy client-logo components remain disabled, so a logo cannot appear in a duplicate carousel.

## Inputs required for each proposed study

Supply the following for the three homepage candidates:

1. Approved client name or anonymised label, plus the written publication-permission reference.
2. Product category and exact Amazon marketplace or marketplaces.
3. The initial commercial problem and the specific work Digital Universe Pro performed.
4. Exact start and end dates, including any comparison-period logic.
5. Source-dated before and after values for ACoS, TACoS, revenue, conversion rate, and organic sales share.
6. Metric definitions, currency, and Seller Central or Amazon Ads source/export references.
7. A short agency-impact methodology that covers major concurrent changes such as price, inventory, promotions, seasonality, reviews, and off-Amazon traffic.
8. The person who reviewed the evidence and the review date.
9. The exact testimonial, attribution, role, original source, and publication permission.
10. Written permission for each client logo, product image, or screenshot.
11. Real redacted Seller Central screenshots, if screenshots are to be shown. Do not send recreated dashboards as evidence.

## Future detail-page workflow

The current multi-page Vite build creates:

- `/case-studies`
- `/case-studies/template`

The template is intentionally `noindex, nofollow` and contains no client result. For each approved SEO case study:

1. Add a complete record to `src/content/caseStudies.ts`.
2. Store approved redacted assets in a public case-study evidence directory and reference only those files.
3. Change the record to `published` only after the verification gate passes.
4. Create `case-studies/<slug>/src/index.html` from the template entry and add it to the Vite build inputs.
5. Replace the static entry's title and description with approved case-specific metadata.
6. Remove `noindex` only after the built URL renders the approved study and all evidence links have been manually checked.

Dynamic routing already resolves `/case-studies/<slug>` and refuses to render a detail page when the matching record is not publishable.
