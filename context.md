
# BillShield — Subscription Audit & Cancellation Assistant

## ⚠️ READ THIS FIRST (CRITICAL)

This project is being built under **extreme hackathon time constraints (~3 hours total)**.

The goal is **demo success**, not production readiness.

Every decision must prioritize:
- Speed
- Reliability
- Clear value demonstration
- A stable demo flow

Avoid overengineering at all costs.

---

## Project Summary

BillShield is a **GenAI-powered web app** that helps users identify forgotten or unused subscriptions by analyzing **bank or credit card statements**.

Users can:
- Upload a **PDF bank statement**
- OR paste **raw transaction text**
- Instantly see:
  - Detected subscriptions
  - Monthly & annual costs
  - Total annual spend
  - Potential savings
  - One or more subscriptions flagged as “possibly unused”
  - Clear cancellation steps

This is a **one-time analysis tool**, not a financial dashboard.

---

## Core User Problem

Users lose money because:
- They forget active subscriptions
- They underestimate annual costs
- They don’t know how to cancel easily

---

## Core Value Proposition

“Paste or upload your bank statement.  
We’ll show you what subscriptions you’re paying for, what you can cancel, and how much you’ll save.”

---

## Tech Stack (LOCKED)

- Framework: **Next.js (Vercel)**
- Router: **App Router**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- AI Engine: **Google Gemini API**
- Deployment: Demo-ready only (local or Vercel-style)

---

## Hard Constraints (DO NOT VIOLATE)

- Total build time: ~3 hours
- Demo-first, not production
- No authentication
- No database
- No background jobs
- No analytics
- No real payment or bank integrations
- No auto-cancellation of subscriptions

---

## Input Methods (IMPORTANT)

### 1. PDF Upload (Primary Convenience)
- User uploads a bank statement PDF
- The PDF is sent **directly to Gemini**
- No manual PDF parsing
- No OCR libraries
- No table extraction code

Gemini handles document understanding internally.

### 2. Text Paste (Guaranteed Fallback)
- User pastes transaction text copied from:
  - PDF
  - Bank app
  - Email statement

If PDF fails, text paste must always work.

---

## High-Level System Flow

```

User uploads PDF or pastes text
↓
Next.js Server Action
↓
Google Gemini API
↓
Structured JSON output
↓
Frontend renders results

````

There is **one AI pipeline**.  
PDF and text are just different inputs to the same pipeline.

---

## User Experience Flow

### Step 1: Input
- Single page
- Large textarea
- Simple PDF file input
- One CTA: “Analyze Subscriptions”

No signup. No settings. No onboarding.

---

### Step 2: Processing
Show simple loading states:
- “Scanning transactions…”
- “Detecting recurring charges…”
- “Calculating annual spend…”
- “Finding unused subscriptions…”

This builds trust and clarity.

---

### Step 3: Results (Order Matters)

1. **Total Annual Subscription Spend (₹)**
2. **Potential Annual Savings (₹)**
3. **List of detected subscriptions**
4. **Highlighted ‘Possibly Unused’ subscription**
5. **Cancellation steps**

The user should understand everything in under 30 seconds.

---

## AI Responsibilities (Gemini)

Gemini is responsible for:

- Reading raw text OR PDF documents
- Extracting transaction information
- Identifying recurring subscription charges
- Grouping similar merchant names
- Detecting billing cycles (monthly, quarterly, yearly)
- Calculating:
  - Monthly cost
  - Annual cost
  - Total annual spend
  - Potential savings
- Flagging at least one subscription as “possibly unused”
- Generating clear, generic cancellation steps

Gemini must return **STRICT JSON ONLY**.

---

## “Possibly Unused” Heuristic (Explainable)

A subscription can be flagged if:
- It appears consistently across multiple billing cycles
- There is no variation in amount or plan
- There are no clear usage indicators

This is a **conservative heuristic**, not a definitive claim.

Language must remain cautious:
- “Possibly unused”
- “May no longer be needed”

---

## Output Data Contract (MANDATORY)

Gemini must return JSON in exactly this shape:

```json
{
  "subscriptions": [
    {
      "merchant": "Netflix",
      "currency": "INR",
      "monthly_cost": 649,
      "billing_cycle": "monthly",
      "annual_cost": 7788,
      "confidence": "high",
      "unused_flag": false,
      "unused_reason": "",
      "cancellation_steps": [
        "Open Netflix app or website",
        "Go to Account > Membership",
        "Click Cancel Membership",
        "Confirm cancellation"
      ]
    }
  ],
  "total_annual_spend": 24000,
  "potential_savings": 12000
}
````

No markdown.
No explanations outside JSON.
No hallucinated merchants.

---

## Currency & Assumptions

* Default currency: **INR (₹)**
* Assume Indian bank statements
* Merchant examples:

  * Netflix
  * Spotify
  * Amazon Prime
  * Gym memberships
  * App subscriptions

---

## Failure Handling (IMPORTANT FOR DEMO)

### If PDF cannot be read:

Show message:

> “We couldn’t read this PDF. Please paste the statement text instead.”

Never show a blank screen.

---

## What NOT to Build (CRITICAL)

* No user accounts
* No dashboards
* No charts beyond basic numbers
* No PDF parsing logic outside Gemini
* No storage of user data
* No long-term history
* No extra features not tied to subscription detection

---

## Hackathon Success Criteria

The demo is successful if:

* Subscriptions are clearly detected
* Annual spend is shown
* At least one subscription is flagged as “possibly unused”
* Cancellation steps are visible
* Gemini usage is obvious and explainable

---

## Judge Explanation (One Sentence)

“BillShield uses Google Gemini to analyze bank statements, detect recurring subscriptions, calculate annual waste, and guide users on how to cancel forgotten services.”

---

## Guiding Principle

One strong, stable GenAI pipeline
is better than
many fragile features.

Clarity > Completeness
Demo stability > Feature count

```

---
\