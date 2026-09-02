# Features

Code-derived inventory of what this repo implements. Bullets and key file paths —
the mechanism lives in `docs/how-it-works.md`, the walkthrough in `docs/demo-script.md`.

_Last generated: 2026-09-02 by feature-doc._

Discounts Preview is a commercetools **Merchant Center Custom Application** (React,
`@commercetools-frontend`/uikit) that lets a merchandiser pick a customer's cart and see,
before touching a single discount, which cart discounts already apply, which ones are
close but not yet qualified, and which discount codes are worth handing to the shopper.
It is deployed via commercetools Connect (`connect.yaml`, `deployAs: merchant-center-custom-application`
only) and is built from scratch for this purpose — it is not a fork of any storefront
starter, so bullets below carry no provenance tags. The repo also contains a `service/`
directory (a Connect service-extension scaffold); see "Unused scaffold" below — it is not
part of the deployed application.

## Cart discount predicate evaluator (the distinctive piece)

The core of the tool is a client-side reimplementation of commercetools' cart-predicate
language, used to answer "why does/doesn't this discount apply" without needing the
platform to actually try applying it.

- Parses a discount's `cartPredicate` string into an AST with a generated Peggy grammar,
  then walks the AST against live cart data (`utils/discount/predicate.ts`,
  `utils/discount/generated-parser/parser.js`, `utils/discount/evaluator.ts`)
- Evaluates logical `and`/`or`/`not` nesting, field conditions (`totalPrice`,
  `shippingAddress.*`, `categories.id`, `sku`, custom fields), and predicate functions
  `lineItemExists`, `lineItemCount`, `lineItemTotal`/`lineItemGrossTotal`,
  `lineItemNetTotal`, and `forAllLineItems` (`utils/discount/evaluator.ts`)
- Supports the predicate comparison operators `=`, `!=`/`<>`, `>`, `>=`, `<`, `<=`,
  `contains`, `contains any`, `contains all`, `in`, `not in`, `is (not) defined`,
  `is (not) empty`, including Money-aware numeric/equality comparison
  (`utils/discount/evaluator-helpers.ts`)
- Produces a per-discount qualification status of `QUALIFIED`, `PENDING`,
  `NOT_APPLICABLE`, or `UNKNOWN`, plus a human-readable message such as "Spend $20.00
  more on Shoes products to qualify" (`utils/discount/evaluator-helpers.ts`,
  `formatQualificationMessage`)
- **Known gaps in the evaluator**: `customLineItemExists/Count/Total*` predicate
  functions are recognized but not evaluated (return `UNKNOWN`); any
  `customer.customerGroup`-based condition is always reported `NOT_APPLICABLE` rather
  than checked against the selected customer's actual group; category-based conditions
  only resolve a name/count if the cart line items happen to carry `categories` data,
  which the app's own cart fetch does not currently request via `expand`
  (`hooks/use-cart-analysis.ts`, `contexts/current-cart-context.tsx`)

## Cart loading and selection

- Merchandiser picks a customer, then one of that customer's active carts, from
  paginated select dropdowns (`components/cart-id-form/cart-id-form.tsx`,
  `hooks/use-customer-fetcher.ts`, `hooks/use-cart-fetcher.ts`)
- Deep link from the selected cart straight to its record in the Merchant Center
  Orders › Carts view (`components/cart-id-form/cart-id-form.tsx`)
- "Apply best promo" toggle that, once promotions are calculated, auto-applies the
  highest-value discount code to the real cart (`components/cart-id-form/cart-id-form.tsx`,
  `components/available-promotions/available-promotions.tsx`)

## Cart breakdown and line-item discounts

- Full line-item list with product image, retail vs. discounted unit price, and an
  expandable per-item discount breakdown showing product-discount and cart-discount
  amounts separately (`components/cart-content/lineitem-card.tsx`,
  `components/cart-content/discounts-breakdown.tsx`)
- In-tool quantity adjustment per line item, calling the standard
  `changeLineItemQuantity` cart update action and re-rendering the recalculated cart
  (`components/cart-content/quantity-controls.tsx`, `hooks/use-cart-fetcher.ts`)
- Aggregated view of every applied discount code and computed product-discount vs.
  cart-discount subtotals and grand total, with a one-click remove on any applied code
  via `removeDiscountCode` (`components/cart-content/applied-discounts-section.tsx`)
- Cart totals section showing subtotal before discounts, total discount amount, and
  final cart total (`components/cart-content/cart-total-section.tsx`)

## Auto-triggered (non-code) discount qualification

- Loads every cart discount that does **not** require a code
  (`requiresDiscountCode=false`) and lists it with pagination
  (`hooks/use-cart-discounts.ts`, `components/auto-triggered-promotions/`)
- Runs each one through the predicate evaluator against the selected cart and groups
  the results into Qualified / Pending / Not Applicable-or-Special panels with status
  stamps (`components/cart-content/discount-analysis-section.tsx`)
- Surfaces a dedicated "what would make this cart qualify" panel listing only the
  pending discounts and their qualification message
  (`components/cart-content/potential-discounts-section.tsx`)

## Available promotion codes and best-deal ranking

- Loads every active discount code (`isActive=true`) with pagination
  (`hooks/use-promotions.ts`, `components/available-promotions/`)
- For each code, creates a throwaway **shadow cart** — a clone of the real cart's line
  items and existing discount codes plus the candidate code — reads the resulting
  `discountOnTotalPrice` and `discountedPricePerQuantity` discount amounts, then deletes
  the shadow cart, to compute the code's actual monetary value without mutating the
  shopper's real cart (`hooks/use-shadow-cart.ts`, `hooks/use-promotions.ts`)
- Ranks codes by computed discount value, flags a "Best Deal" badge, and separates
  applicable from not-applicable codes into a collapsible section
  (`components/available-promotions/available-promotions.tsx`,
  `components/available-promotions/promotion-card.tsx`)
- Per-code breakdown of which cart-level and line-item-level discounts contributed to
  the total, plus stamps for auto vs. code-triggered and stacking mode
  (`components/available-promotions/promotion-breakdown.tsx`,
  `components/available-promotions/promotion-card.tsx`)
- One-click "Apply Discount" adds the code to the real cart via `addDiscountCode`
  (`hooks/use-cart-fetcher.ts`, `contexts/current-cart-context.tsx`)

## All Discounts directory

- A second app screen (`overview` route) listing every Product Discount and Cart
  Discount in the project side by side in one sortable, paginated table — name, key,
  type stamp, active/inactive icon, valid-from/valid-until dates, created date
  (`components/overview/discounts.tsx`)
- Row click navigates to the discount's own detail page in Merchant Center
  (`components/overview/discounts.tsx`)

## Merchant Center integration

- Registers two menu entries: the cart discount-preview calculator (main link) and the
  All Discounts directory (`overview` submenu link)
  (`custom-application-config.mjs`)
- OAuth scopes requested: view on products, customers, cart discounts, discount codes,
  and orders; manage on cart discounts, discount codes, and orders — the manage scopes
  back the in-tool quantity changes and discount-code apply/remove actions
  (`custom-application-config.mjs`)
- All commercetools reads/writes go through the MC API proxy
  (`MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM`) via the application-shell SDK dispatch
  hooks rather than a separate backend (`hooks/use-cart-fetcher.ts`,
  `hooks/use-cart-discounts.ts`, `hooks/use-product-discounts.ts`,
  `hooks/use-promotions.ts`)

## Unused scaffold — `service/`

- A commercetools Connect **service-extension** application (Express, `client/`,
  `controllers/`, `connector/actions.ts`) lives alongside the Custom Application, but
  `connect.yaml` only deploys `merchant-center-custom-application` — this service is not
  part of the deployed app
- Its controllers are unfinished template code, not demo logic: `cartController`'s
  `create` handler just re-fetches the first line item's product and returns a generic
  `recalculate` update action (`service/src/controllers/cart.controller.ts`);
  `payments.controller.ts` and the POST handler in `service/src/routes/service.route.ts`
  are stubbed out/commented; `connector/actions.ts` only declares two unused constant
  names. Git history includes a "remove service" commit, but the directory is still
  present in the working tree.
