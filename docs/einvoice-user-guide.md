# Invo e-Invoice User Guide (LHDN MyInvois)

## Scope
This guide is based on the current Invo implementation in this repository.

Important: The app currently supports e-Invoice setup and readiness checks, but direct API submission to LHDN MyInvois is not implemented yet.

## What You Can Do Today
- Configure e-Invoice settings (sandbox/production, credentials, supplier identity).
- Check each invoice for e-Invoice readiness (errors/warnings).
- View existing e-Invoice document statuses if records already exist in your database.

## What Is Not Yet Live
- Clicking `Submit to LHDN` does not submit to MyInvois yet. It shows an under-development message in the UI.
- `Auto-submit on Send` is currently a saved setting only; it does not trigger submission logic.

## Step-by-Step Workflow

### 1. Complete company profile details
In `Settings`, ensure your company profile has at least:
- Legal name
- Address (street or address)
- City
- Postcode
- Country (recommended)
- Phone number (recommended)

These are used by the e-Invoice readiness checks.

### 2. Configure e-Invoice settings
Go to `Settings` > `E-Invoice` and set:
- `Enable e-Invoice`
- `Environment`: `SANDBOX` for testing, `PRODUCTION` for live mode
- `Client ID`
- `Client Secret`
- `Supplier TIN`
- `Supplier BRN` (recommended)
- `SST Registration Number` / `Tourism Tax Number` (if applicable)
- `MSIC Code` (recommended)
- `Auto-submit on Send` (can be saved, but currently not executed)

Then click `Save E-Invoice Settings`.

### 3. Prepare customer master data
For each customer used in e-Invoice flows:
- Name is required
- TIN/tax ID is recommended (especially for B2B)

### 4. Create the invoice
Create an invoice as usual and ensure:
- It has at least one item
- Each item has a product/description

### 5. Mark invoice as sent
In the invoice list/details flow, move invoice status from `DRAFT` to `SENT`.

The e-Invoice panel only allows submission attempts when invoice status is not `DRAFT` or `CANCELLED`.

### 6. Open e-Invoice panel in invoice details
In invoice details, expand `e-Invoice (LHDN)`.

You will see:
- Readiness badge (`Ready` or number of issues)
- Missing requirements list
- Warning list
- Existing document status (if any), including document IDs and verification link

### 7. Resolve readiness issues
Fix all listed `Missing Requirements` first. Warnings are non-blocking, but should still be addressed where relevant.

### 8. Current submission status (important)
Even when the panel shows `Ready`, the `Submit to LHDN` button is still placeholder behavior in the current build.

## Current Manual Workaround for Live Submission
Until native submission is implemented:
1. Generate invoice details in Invo.
2. Re-enter or upload the invoice through MyInvois Portal/API process outside this app.
3. Keep the LHDN identifiers and validation proof in your records.

## Troubleshooting Checklist
- `E-Invoice is not enabled`: enable it in settings and save.
- `Supplier TIN is required`: fill supplier TIN in e-Invoice settings.
- `MyInvois Client ID/Secret is required`: fill and save credentials.
- `Company details are required`: complete company profile fields.
- `Customer details are required`: ensure invoice is linked to a valid customer.
- `Invoice must have at least one item`: add at least one line item.

## Notes for Ops/Compliance Teams
- Production mode warning is displayed in UI, but API submission is still not active in this implementation.
- Treat this feature set as preparation/readiness tooling, not full end-to-end LHDN submission.
