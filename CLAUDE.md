# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ark Handyman** — a Next.js 14 (App Router) business website for a handyman service in Hamilton County, Tennessee (Ooltewah, Collegedale). Tailwind CSS for styling. Static site generation for all routes.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build (validates SSG)
npm run lint       # ESLint check
```

Deploy by pushing to GitHub; Vercel auto-deploys on push.

## Architecture

- **Framework**: Next.js 14, App Router, all pages SSG (no `'use server'` / dynamic routes fetch data from `lib/data.js` at build time via `generateStaticParams`)
- **Styling**: Tailwind CSS with custom tokens (`navy`, `ark-yellow`, `light-gray`, `charcoal`), fonts via `next/font/google` (Inter + Poppins) injected as CSS vars
- **`lib/data.js`**: Single source of truth — `services`, `serviceAreas`, `testimonials`, `faqData`, `siteConfig`. All page content lives here.
- **`components/`**: Server components by default. Client components (`'use client'`): `Header.js` (mobile menu), `FAQAccordion.js` (accordion state), `ContactForm.js` (form state)
- **Dynamic routes**: `/services/[slug]` and `/service-areas/[slug]` — both use `generateStaticParams` to pre-render all slugs from `lib/data.js`
- **SEO**: Every page exports `metadata` (or `generateMetadata`). JSON-LD structured data (LocalBusiness, Service, FAQPage) is inlined as `<script type="application/ld+json">` in page components. `app/sitemap.js` and `app/robots.js` auto-generate those files.

## Design System

| Token | Value |
|---|---|
| Primary Navy | `#1B3A5F` — `bg-navy`, `text-navy` |
| Warm Yellow | `#F2A922` — `bg-ark-yellow`, `text-ark-yellow` |
| Light Gray | `#F4F5F7` — `bg-light-gray` (section backgrounds) |
| Dark Charcoal | `#2C2C2C` — `text-charcoal` (body text) |

Headings: `font-heading` (Poppins). Body: `font-body` (Inter), 16px / 1.6 line-height. Cards use `rounded-2xl`, `shadow-sm`, `border border-gray-100`.

## Adding Content

- **New service**: Add entry to `services` array in `lib/data.js` — the service page, nav dropdown, footer, sitemap, and homepage cards all derive from this array automatically.
- **New service area**: Add entry to `serviceAreas` array — same pattern.
- **Real images**: Place at `public/images/` and update `image` fields in `lib/data.js`. Portfolio images use `next/image` with `fill` and `object-cover`.

## Contact Form

`ContactForm.js` has a placeholder `setTimeout` where the fetch call should go. Replace with a real endpoint (e.g., Formspree, Resend, or a Next.js API route at `app/api/contact/route.js`).

## Business Notes

- 9 years of experience, licensed and insured in Tennessee.
- Primary areas: Ooltewah and Collegedale (no travel fee). Signal Mountain and Soddy-Daisy may have a small travel surcharge.
- Content tone: conversational, natural language optimized for AI search engines.
- Phone/email in `lib/data.js` → `siteConfig` are placeholders — update before launch.
