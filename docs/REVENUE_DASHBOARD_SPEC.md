# Revenue Dashboard Specification (Bounty #18)

## Overview
This document provides the **canonical definitions**, **data interfaces**, and **acceptance test commands** required to implement the **Revenue Dashboard** bounty (#18) referenced in `BOUNTIES.md`. It serves as the scaffold for contributors to start work without ambiguity.

---

## 1. Canonical Metric Definitions

| Metric | Definition | Formula |
|--------|------------|---------|
| **Monthly Recurring Revenue (MRR)** | Total subscription revenue recognized for the current month. | `Σ (active_subscriptions × monthly_price)` |
| **Annual Recurring Revenue (ARR)** | Projected yearly revenue based on current MRR. | `MRR × 12` |
| **Churn Rate** | Percentage of recurring revenue lost from cancellations or downgrades in a given period. | ` (MRR_start - MRR_end + New_MRR) / MRR_start ` |
| **Customer Lifetime Value (LTV)** | Estimated net profit from a customer over the entire relationship. | ` (ARPU × Gross_Margin) / Churn_Rate` where **ARPU** = `MRR / Active_Customers` |

All monetary values are in **USD** and rounded to two decimal places.

---

## 2. Required Data Interfaces (TypeScript)

The dashboard must consume data from the existing API layer. Below are the **exact TypeScript interfaces** expected by the UI components.

