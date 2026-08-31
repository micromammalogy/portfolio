# Project Portfolio — Shawn Roah

Solutions Engineer @ [Zonos](https://zonos.com) — cross-border commerce (landed cost, international checkout, duty & tax) across WooCommerce, Magento, BigCommerce, and Shopify.

*A running log of engineering work I've delivered, kept current from my GitHub activity. Some client-specific white-label builds are described by platform only, for confidentiality.*

---

## Selected professional work

**Apps built**

**White-label cross-border checkout app — BigCommerce** · `NestJS · TypeScript · Prisma/PostgreSQL · federated GraphQL` · Apr–Jun 2026
A merchant-facing BigCommerce app built from the ground up: full OAuth install/load/uninstall lifecycle, a live carrier rate callback wired to a federated GraphQL API, configurable flat-rate and rate-chart shipping, service-level sync, and order webhooks.

**Features shipped**

**White-label WooCommerce checkout — product-field mapping** · `PHP · WordPress · Saloon` · Jul 2026
Custom product-field → carrier item-attribute mapping so merchant-defined product data flows through to the cross-border rate/customs engine.

**Zonos Checkout for WooCommerce — add-on fields & amount-path mapping** · `PHP · Zonos PHP SDK` · May–Jun 2026
Added add-on-field attribute types and an opt-in custom amount-path mapping for cart-level priced items, plus the paired changes in the Zonos PHP SDK. Shipped across releases v1.5.5–v1.5.9.

**Shopify Duty & Tax — cross-border data mapping** · `TypeScript · Remix · Shopify` · Apr–Jul 2026
Mapped Shopify metafields and variant options to cross-border dimensions and attributes, and forwarded customer tags as item metadata, feeding richer product data into duty/tax calculation.

**Merchant dashboard — orders CSV export** · `TypeScript · React` · Jul 2026 · in review
Added CSV export for filtered and selected orders in the merchant dashboard.

**Web components — per-country custom messaging** · `Stencil · TypeScript` · Apr 2026
Country-selection-driven custom messaging in Zonos's shared web-component library, so checkout messaging adapts to the shopper's destination.

**Documentation — white-label checkout integrations** · `Docs` · Jun 2026
Authored and rewrote public documentation for white-label BigCommerce and WooCommerce checkout integrations, aligning it with the shipped product.

**Bug fixes**

**Zonos Checkout for WooCommerce — compatibility & scheduler regressions** · `PHP · Composer` · Jun 2026
Resolved a Saloon / PHP 8.1 compatibility regression and an Action Scheduler issue that were affecting the release pipeline.

**Shopify Duty & Tax — customs toggle persistence** · `TypeScript · Remix · Shopify` · Jul 2026
Fixed persistence and application of the "Use Trade Item Description" customs toggle.

---

## Internal tools & side projects

**Merchant Onboarding Wizard** · `Next.js · React`
An internal tool I built while leading onboarding, to expedite merchant onboarding tasks and reduce time-to-value (TTV) for merchant go-lives.

**Zonos product demo** · `Next.js · React · Vercel`
A sales and onboarding tool that demonstrates four Zonos products end to end — Checkout, Landed Cost, Classify, and Vision — running the full demo flow, plus detailed API analysis for integration planning.

**AI Fluency Framework** · `React · TypeScript`
An interactive 2D enterprise AI-fluency framework with a guided AI-project journey, including a RAG walkthrough.

---

<sub>Auto-updated weekly from GitHub activity · last updated: 2026-08-31</sub>
