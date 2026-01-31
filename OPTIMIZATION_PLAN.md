# Invoices Page Optimization Plan

## Current State
- Compilation time: 5.5s with 4133 modules
- Main file: `src/app/(dashboard)/invoices/invoices-client.tsx` (1024 lines)
- Heavy dependencies loaded eagerly

## Root Causes Identified

### 1. Monolithic Client Component
`invoices-client.tsx` contains everything in one file:
- `InvoicesClient` (main container)
- `InvoicesList` (list with card/table views)
- Payment dialog (embedded)
- All filtering, status badge, and utility functions

### 2. Heavy Eager Dependencies
| Import | Size Impact | Used When |
|--------|-------------|-----------|
| `@/components/whatsapp` | Medium | Only for overdue invoices in dropdown |
| `@/lib/stripe` | Large | Only `PLAN_LIMITS` constant needed |
| 15+ lucide-react icons | Medium | Various, some rarely used |
| `date-fns` (multiple imports) | Medium | Formatting dates |

### 3. Stripe SDK Coupling
`src/lib/stripe.ts` imports the full Stripe SDK but client-side only needs:
```typescript
export const PLAN_LIMITS = { FREE: {...}, PREMIUM: {...}, TRIAL: {...} }
```

### 4. WhatsApp Components Loaded Eagerly
```typescript
import { WhatsAppInvoiceButton, WhatsAppFollowUpButton } from '@/components/whatsapp';
```
These are only used in dropdown menus for specific invoice states.

## Optimization Steps

### Step 1: Extract Plan Limits (Quick Win)
Create `src/lib/plan-limits.ts` with just the constants:
```typescript
// src/lib/plan-limits.ts
export const PLAN_LIMITS = {
  FREE: { customers: 5, invoicesPerMonth: 15 },
  PREMIUM: { customers: Infinity, invoicesPerMonth: Infinity },
  TRIAL: { customers: Infinity, invoicesPerMonth: Infinity }
};

export function hasReachedLimit(...) { ... }
export function hasTrialExpired(...) { ... }
```
Update imports in `invoices-client.tsx` to use this instead of `@/lib/stripe`.

### Step 2: Extract InvoicesList Component
Move `InvoicesList` to `src/app/(dashboard)/invoices/invoices-list.tsx`:
```typescript
// invoices-list.tsx
'use client';
export function InvoicesList({ ... }) { ... }
```
Then dynamically import in `invoices-client.tsx`:
```typescript
const InvoicesList = dynamic(
  () => import('./invoices-list').then(mod => mod.InvoicesList),
  { loading: () => <InvoicesListSkeleton />, ssr: false }
);
```

### Step 3: Extract Payment Dialog
Create `src/app/(dashboard)/invoices/payment-dialog.tsx`:
```typescript
// payment-dialog.tsx
'use client';
export function PaymentDialog({ invoice, onClose, onSubmit }) { ... }
```
Dynamic import with loading state.

### Step 4: Lazy Load WhatsApp Components
Replace eager import with dynamic loading:
```typescript
// In InvoicesList, load WhatsApp buttons only when needed
const WhatsAppFollowUpButton = dynamic(
  () => import('@/components/whatsapp').then(mod => mod.WhatsAppFollowUpButton),
  { ssr: false, loading: () => null }
);
```

### Step 5: Consolidate Date Formatting
Create a single date utility export:
```typescript
// src/lib/date.ts
export { format, formatDistanceToNow } from 'date-fns';
export function formatRelativeDate(date) { ... }
export function calculateDueDays(date) { ... }
```

### Step 6: Optimize Icon Imports (Optional)
Consider creating an icons barrel file for commonly used icons:
```typescript
// src/components/icons.tsx
export { FileText, Download, MoreHorizontal, Plus } from 'lucide-react';
```

## Expected Results

| Metric | Before | After (Est.) |
|--------|--------|--------------|
| Initial bundle | ~4133 modules | ~2500 modules |
| Compile time | 5.5s | ~3s |
| First paint | Blocked by full load | Progressive |

## Implementation Priority

1. **High Impact, Low Effort:**
   - Extract `PLAN_LIMITS` to separate file
   - Dynamic import `InvoiceDetailsDialog` (already done ✓)

2. **High Impact, Medium Effort:**
   - Extract and lazy load `InvoicesList`
   - Lazy load WhatsApp components

3. **Medium Impact, Medium Effort:**
   - Extract Payment Dialog
   - Consolidate date utilities

4. **Lower Priority:**
   - Icon optimization
   - Further component splitting

## Files to Create/Modify

### New Files:
- `src/lib/plan-limits.ts`
- `src/app/(dashboard)/invoices/invoices-list.tsx`
- `src/app/(dashboard)/invoices/payment-dialog.tsx`
- `src/lib/date.ts` (optional consolidation)

### Modified Files:
- `src/app/(dashboard)/invoices/invoices-client.tsx` (major refactor)
- `src/lib/stripe.ts` (re-export from plan-limits)
