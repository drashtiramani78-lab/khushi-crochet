# Fix Date Validation Error in Admin Coupon Edit

## Task: Resolve 400 Bad Request on PUT /api/admin/coupons/[id] due to date validation

**Status:** In Progress

### Steps from Approved Plan:
- [x] 1. Analyze files (frontend page.jsx, [id]/route.js, POST route.js, model) - Dates parsed as new Date(YYYY-MM-DD) creating UTC midnight, but DB dates may have timezone offset causing validator failure.
- [ ] 2. Update TODO.md with checklist (current step)
- [ ] 3. Edit app/api/admin/coupons/[id]/route.js:
  |  - Normalize dates to UTC start-of-day: \`new Date(\`\${body.validFrom}T00:00:00Z\`) \`
  |  - Enhance ValidationError handling for specific date errors
  |  - Add console.log for parsed dates
- [ ] 4. Verify consistency in POST endpoint (app/api/admin/coupons/route.js) - similar date handling already present
- [ ] 5. Test:
  |  - \`npm run dev\`
  |  - Admin login, /admin/coupons
  |  - Edit existing coupon (ID 69ddd9331784cbb6b48cad19), set dates e.g. validFrom '2024-12-20', validTill '2024-12-31'
  |  - Verify no 400, check network/console
- [ ] 6. Optional: Minor frontend improvements if needed
- [ ] 7. Mark complete, attempt_completion

**Notes:** 
- Root cause: Timezone mismatch in Date parsing vs DB stored dates.
- No model changes needed.

## Previous TODO (completed):
[Prior content about general 400 fixes]
