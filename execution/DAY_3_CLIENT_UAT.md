# OYRU PHASE 1 - DAY 3: CLIENT UAT EXECUTION

**Date**: [Set by team]  
**Owner**: Product Manager / Client Lead  
**Duration**: Full day (8 hours) + 2 hours follow-up  
**Success Criteria**: Client approval received, major issues resolved, sign-off document completed

---

## PRE-UAT PREPARATION

### Day Before (Preparation)
- [ ] Brief client on UAT schedule
- [ ] Provide staging URL & test credentials to client
- [ ] Send test data summary (3 hotels, 20 products)
- [ ] Confirm client attendees and device list
- [ ] Prepare conference room with projector/screen
- [ ] Set up issue tracking shared with client
- [ ] Brief internal support team on standby

### Morning Of
- [ ] Verify staging environment still stable
- [ ] Confirm all test data loaded
- [ ] Test credentials validated
- [ ] Telegram bot operational
- [ ] Backup current database before UAT
- [ ] All team leads ready on Slack/call

---

## UAT AGENDA (8 hours)

### 09:00 - 09:30: KICKOFF MEETING

**Agenda**:
```
[ ] Welcome & introductions
[ ] UAT objectives & success criteria
[ ] Schedule walkthrough
[ ] Issue escalation process
[ ] Q&A
```

**Success Criteria**: Client understands objectives, committed to testing

### 09:30 - 10:30: CUSTOMER ORDERING FLOW

**Participant**: Client product/operations lead

**Scenario**: "A customer orders 20 units of vegetables for delivery"

```
[ ] Go to https://staging.oyru.example.com
[ ] Sign in as customer@test.local
[ ] Browse product catalog
[ ] Search for "vegetables"
[ ] Add 20 units to cart
[ ] Review cart (price, quantity)
[ ] Enter delivery address
[ ] Place order
[ ] Verify order confirmation
[ ] Check email for confirmation (optional)
[ ] Navigate to order tracking
[ ] Verify status "Pending"
```

**Client Observations**:
- UI intuitive? [ ] Yes [ ] No
- Product information clear? [ ] Yes [ ] No
- Ordering process smooth? [ ] Yes [ ] No
- Issues found: ________________

### 10:30 - 11:30: BULK HOTEL ORDERING

**Participant**: Client business/operations lead

**Scenario**: "Grand Palace Hotel needs to order 100 units of rice, 50 units of oil for bulk supply"

```
[ ] Sign in as hotel@test.local
[ ] Navigate to ordering section
[ ] Browse products
[ ] Add 100 units of Rice product
[ ] Add 50 units of Oil product
[ ] Review cart & total amount
[ ] Enter delivery address: "Grand Palace Hotel, New Delhi"
[ ] Select payment method: INVOICE
[ ] Place order
[ ] Verify order confirmation with order number
[ ] Check order history
[ ] Verify order shows correct items & quantities
```

**Client Feedback**:
- Is bulk ordering UI clear? [ ] Yes [ ] No
- Are prices calculated correctly? [ ] Yes [ ] No
- Invoice payment option working? [ ] Yes [ ] No
- Issues found: ________________

### 11:30 - 12:30: INVENTORY MANAGEMENT

**Participant**: Client supply chain / admin lead

**Scenario**: "Check product stock levels and verify inventory decrements when orders placed"

```
[ ] Sign in as admin@test.local
[ ] Navigate to /admin/inventory or Products page
[ ] Record stock levels:
    - Rice: __________ units
    - Oil: __________ units
    - Vegetables: __________ units
[ ] Go back to place another order as customer
[ ] Order 10 units of Rice
[ ] Go back to inventory
[ ] Verify Rice stock decreased by 10 units
[ ] Repeat for Oil & Vegetables
[ ] Check inventory logs for audit trail
[ ] Review low stock alerts (if threshold reached)
```

**Client Validation**:
- Stock levels accurate? [ ] Yes [ ] No
- Inventory decrements on order? [ ] Yes [ ] No
- Low stock alerts working? [ ] Yes [ ] No
- Audit trail visible? [ ] Yes [ ] No
- Issues found: ________________

### 12:30 - 13:30: LUNCH BREAK

---

### 13:30 - 14:30: DELIVERY ASSIGNMENT & TRACKING

**Participant**: Client logistics / operations lead

**Scenario**: "Driver accepts delivery and customer can track in real-time"

```
[ ] Sign in as driver@test.local
[ ] Navigate to available deliveries
[ ] Review delivery list
    - Pickup location: ________
    - Delivery location: ________
    - Expected fee: ________
[ ] Accept first delivery
[ ] Navigate to active deliveries
[ ] View delivery on map
[ ] Update status:
    [ ] Mark "Picked Up"
    [ ] Mark "In Transit"
    [ ] Mark "Delivered"
[ ] Verify each status update is timestamped
[ ] Sign in as customer
[ ] Check order status
[ ] Verify status matches driver's updates (real-time)
```

**Client Feedback**:
- Delivery acceptance smooth? [ ] Yes [ ] No
- Status updates real-time? [ ] Yes [ ] No
- Driver can see delivery details? [ ] Yes [ ] No
- Customer sees updates? [ ] Yes [ ] No
- Issues found: ________________

### 14:30 - 15:30: ADMIN DASHBOARD & REPORTS

**Participant**: Client admin / management lead

**Scenario**: "View all orders, inventory, and revenue reports"

```
[ ] Sign in as admin@test.local
[ ] Dashboard overview:
    [ ] Total Orders: ________
    [ ] Total Revenue: ________
    [ ] Active Hotels: ________
    [ ] Available Products: ________
[ ] Navigate to Orders Management
[ ] Verify all orders visible
[ ] View order details
[ ] Try status update (from pending to confirmed)
[ ] Navigate to Products Management
[ ] Verify 20 products listed
[ ] Navigate to Reports
    [ ] View Sales Report
    [ ] Verify revenue breakdown by date
    [ ] Export sales data as CSV
    [ ] View Inventory Report
    [ ] Verify stock levels accurate
    [ ] Download inventory CSV
[ ] Check if reports match actual data
```

**Client Validation**:
- Dashboard complete? [ ] Yes [ ] No
- All orders visible? [ ] Yes [ ] No
- Reports accurate? [ ] Yes [ ] No
- CSV export working? [ ] Yes [ ] No
- Issues found: ________________

### 15:30 - 16:00: TELEGRAM BOT DEMONSTRATION

**Participant**: Client technical / operations lead

**Scenario**: "Place order completely via Telegram bot"

```
[ ] Open Telegram
[ ] Search for @OyruStagingBot
[ ] Click Start
[ ] Verify welcome message
[ ] Type /products
[ ] Verify product list received
[ ] Type /search rice
[ ] Verify search results
[ ] Type /cart add 5
[ ] Verify "Added to cart"
[ ] Type /checkout
[ ] Complete checkout flow via Telegram
[ ] Verify order confirmation in chat
[ ] Verify order appears in customer's web dashboard
```

**Client Feedback**:
- Bot discovery easy? [ ] Yes [ ] No
- Commands intuitive? [ ] Yes [ ] No
- Checkout process clear? [ ] Yes [ ] No
- Orders sync to web? [ ] Yes [ ] No
- Issues found: ________________

### 16:00 - 16:30: LIVE ISSUES TRIAGE

**Participants**: All + technical team on standby

**Process**:
```
[ ] Review all issues captured during UAT
[ ] Categorize by severity:
    - CRITICAL (blocks go-live): ________
    - HIGH (fix in Phase 2): ________
    - MEDIUM (nice to have): ________
    - LOW (future improvement): ________

[ ] For each CRITICAL issue:
    - Reproduce with client
    - Assign to developer
    - Estimate fix time
    - Determine if fixes during UAT or after

[ ] Determine if UAT can continue or needs pause
```

### 16:30 - 17:00: SIGNOFF & NEXT STEPS

**Meeting**:
```
[ ] Review UAT completion
[ ] Discuss issue resolution plan
[ ] Confirm go-live decision:
    [ ] APPROVED FOR GO-LIVE
    [ ] APPROVED WITH CONDITIONS (list conditions)
    [ ] NEEDS REWORK (list requirements)

[ ] Client signs UAT signoff document
[ ] Schedule follow-up calls if needed
[ ] Discuss production deployment date
[ ] Confirm launch announcement plan
[ ] Thank you & celebration (if approved!)
```

---

## UAT SIGNOFF DOCUMENT

Generate and have client sign:

```markdown
# OYRU PHASE 1 - CLIENT UAT SIGNOFF

**UAT Completion Date**: [Date]
**Tested By**: [Client team names]
**Verified By**: [v0/Dev team names]

## UAT Scope
- ✓ Customer ordering flow
- ✓ Bulk hotel ordering
- ✓ Inventory management
- ✓ Delivery tracking
- ✓ Admin dashboard & reports
- ✓ Telegram bot

## Test Results

| Component | Status | Issues | Notes |
|-----------|--------|--------|-------|
| Customer Flow | PASS / FAIL | [#] | |
| Hotel Ordering | PASS / FAIL | [#] | |
| Inventory | PASS / FAIL | [#] | |
| Delivery | PASS / FAIL | [#] | |
| Admin | PASS / FAIL | [#] | |
| Telegram Bot | PASS / FAIL | [#] | |

## Issues Found

### Critical (Blocking)
[If any, must list with resolution plan]

### High (Important)
[List items]

### Medium/Low
[List items for Phase 2]

## Client Acceptance

Client acknowledges:
- ✓ Product meets specified requirements
- ✓ All critical issues resolved
- ✓ Ready for production deployment
- ✓ Will provide post-launch support

## Approvals

**Client Lead**: ________________  Date: _______

**Client Operations**: ________________  Date: _______

**Client Business**: ________________  Date: _______

**V0/Dev Lead**: ________________  Date: _______

**Product Manager**: ________________  Date: _______

## Next Steps
- [ ] Production environment preparation
- [ ] Production deployment scheduled for [Date]
- [ ] Post-launch support plan confirmed
- [ ] Phase 2 backlog prioritization meeting
```

---

## ISSUE ESCALATION PROCESS

During UAT, if critical issue found:

### IMMEDIATE (< 15 min)
1. Log issue in shared tracker
2. Notify development lead
3. Try to reproduce
4. Determine workaround if available

### SHORT-TERM (< 1 hour)
5. Developer assesses fix complexity
6. Decision: Fix now or defer
7. If fixing: Client waits while fix applied
8. Client retests fix

### IF CANNOT FIX DURING UAT
9. Document issue clearly
10. Estimate fix time for production
11. Decide if production launch delayed or happens with known issue
12. Client approves decision

---

## UAT SUCCESS CRITERIA

All of the following must be true:

- ✓ Customer ordering works end-to-end
- ✓ Hotel bulk ordering works end-to-end
- ✓ Inventory auto-decrements correctly
- ✓ Delivery tracking real-time
- ✓ Admin dashboard functional
- ✓ Reports generate accurate data
- ✓ Telegram bot operational
- ✓ Zero critical issues (or workaround documented)
- ✓ Client satisfied with system
- ✓ Client signs UAT signoff
- ✓ Client commits to launch date

---

## POST-UAT (Next 2 Hours)

### Immediately After UAT
- [ ] Debrief with dev team on findings
- [ ] Plan production prep steps
- [ ] Confirm launch date with client
- [ ] Schedule Day 4 prep meeting

### Document Generation
- [ ] Generate UAT_SIGNOFF.md
- [ ] Compile issue list with resolutions
- [ ] Create post-UAT report
- [ ] Update Phase 2 backlog from low-priority UAT findings

---

## TEAM ROLES DURING UAT

| Role | Responsibility |
|------|-----------------|
| Product Manager | Facilitate, escalate decisions |
| QA Lead | Observe, document, support client |
| Developer | On standby for hotfixes |
| DevOps | Monitor infrastructure stability |
| Support Lead | Chat/Slack support for technical questions |
| Note-taker | Document all feedback & issues |

---

## COMMON UAT QUESTIONS (Prepared Responses)

**Q: Why is this page slow?**
A: "We've optimized for production scale. Staging may have higher latency. Full optimization happens in Phase 2."

**Q: Can we change this feature?**
A: "Noted for Phase 2 backlog. This release focuses on core delivery. Let's discuss after launch."

**Q: What about mobile?**
A: "Responsive design is in Phase 2. This release is web-first."

---

## DELIVERABLES

- [ ] UAT_SIGNOFF.md (signed by client)
- [ ] UAT_EXECUTION_REPORT.md (findings & resolutions)
- [ ] Issue list with tickets
- [ ] Test data snapshots
- [ ] Client approval for launch

---

**Next**: Day 4 Production Preparation
