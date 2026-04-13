# Task: Login redirect, Admin Coupons, GPay QR Scanner, Custom Order → Immediate Chat

## Plan Breakdown (Approved ✅)

**1. Login Redirect to Custom Order (Chat)**
- [✅] Update `app/login/page.jsx`: Change default redirect "/" → "/customorder"

**2. Admin Coupon Management**
- [✅] Create `app/api/admin/coupons/route.js` (CRUD: GET list, POST create, PUT/:id, DELETE/:id)
- [✅] Create `app/api/admin/coupons/[id]/route.js` (PUT update, DELETE)
- [✅] Create `app/admin/coupons/page.jsx` (UI: table list, create/edit forms)
- [✅] Add sidebar link in admin pages
- [✅] Test: Admin create/view/edit/delete coupons

**3. GPay Auto-generate QR Scanner**
- [✅] Backend: `app/api/payments/upi-qr/route.js` (POST: generate dynamic QR per order total)
- [✅] Frontend: Update `app/checkout/page.jsx` (dynamic QR fetch, html5-qrcode scanner on transactionId)
- [✅] Install: `npm i html5-qrcode qrcode`
- [✅] Test: Scan generates transaction ID, order verification
- [ ] Frontend: Update `app/checkout/page.jsx` (dynamic QR fetch, html5-qrcode scanner on transactionId)
- [ ] Install: `npm i html5-qrcode qrcode`
- [ ] Test: Scan generates transaction ID, order verification

**4. Replace Custom Order → Immediate Chat (HTTP Polling)**
- [ ] Model: Create `models/chat.js` (threads: userId, adminId, messages[])
- [ ] APIs: `app/api/chat/route.js` (user: POST message; admin: GET threads, POST reply)
- [ ] User UI: Replace `app/customorder/page.jsx` → Chat interface (message list, send input)
- [ ] Admin UI: Replace `app/admin/custom/page.jsx` → Chat admin (thread list, reply)
- [ ] Context: `app/context/ChatContext.jsx` (polling)
- [ ] Update: navbar.jsx, admin sidebar links "Custom Order" → "Chat"
- [ ] Migrate: Existing custom orders → chat threads (optional)
- [ ] Install: `npm i socket.io-client` (future upgrade)
- [ ] Test: User/admin send/receive messages real-time polling

## Follow-up After Edits
- [ ] Install deps: `npm i html5-qrcode qrcode`
- [ ] `npm run dev` → Test all features
- [ ] Seed test coupons/chats
- [ ] Complete → attempt_completion

**Progress: Ready to implement step-by-step.**
