# Oyru Delivery MVP - Operations Guide

## For Platform Operators

This guide provides step-by-step instructions for daily operations, monitoring, and maintenance.

## Dashboard Overview

### Admin Dashboard (`/admin`)

**Key Metrics**
- **Total Orders**: All orders placed on platform
- **Total Revenue**: Sum of all order amounts
- **Available Products**: Active products in catalog
- **Active Drivers**: Drivers online and available

**Quick Actions**
- Add new product
- View pending orders
- Assign drivers
- Check inventory

## Daily Operations Schedule

### 6:00 AM - Morning Standup
1. **Check Overnight Orders**
   - Go to `/admin/oyru-orders`
   - Filter by status: "pending", "confirmed"
   - Note high-value orders
   - Assign drivers if needed

2. **Verify Inventory**
   - Go to `/admin/inventory`
   - Check for low stock alerts
   - Order stock if needed
   - Update any adjustments

3. **Driver Readiness**
   - Go to `/admin/delivery-partners`
   - Verify all drivers online
   - Check vehicle status
   - Brief team on day's plan

### 9:00 AM - Mid-Morning Check
1. **Order Status**
   - Review orders placed since morning
   - Confirm receipt with customers
   - Mark confirmed orders to "packing"

2. **Driver Assignment**
   - Review available deliveries
   - Assign to closest drivers
   - Optimize routes if possible

3. **Customer Issues**
   - Check support messages
   - Respond to inquiries
   - Resolve urgent issues

### 1:00 PM - Afternoon Check
1. **Lunch Hour**
   - Expect peak orders during lunch
   - Monitor for delays
   - Prepare extra drivers if needed

2. **Performance Check**
   - Average delivery time
   - Customer satisfaction
   - Driver performance
   - System health

### 5:00 PM - Evening Wrap-Up
1. **Order Summary**
   - Count delivered orders
   - Note issues/complaints
   - Revenue total for day
   - Next day planning

2. **Inventory Reconciliation**
   - Count physical stock
   - Update system
   - Flag discrepancies
   - Plan restocking

3. **Driver Payment**
   - Calculate earnings
   - Review performance ratings
   - Plan bonuses if applicable

### 8:00 PM - Close of Business
1. **Final Check**
   - All orders assigned
   - No pending support issues
   - Backup completed
   - System health verified

## Order Management

### Order Status Workflow

```
Customer places order
        ↓
    PENDING ← Admin reviews
        ↓
  CONFIRMED ← Items prepared
        ↓
    PACKING
        ↓
   ASSIGNED ← Driver accepts
        ↓
   IN TRANSIT ← Driver shows as out
        ↓
   DELIVERED ← Customer receives
```

### Managing Orders

**Step 1: Review New Order**
```
1. Go to /admin/oyru-orders
2. Click on pending order
3. Check items, address, customer info
4. Verify inventory has stock
```

**Step 2: Confirm Order**
```
1. Click "Update Status" button
2. Select "CONFIRMED"
3. Save
4. Customer receives confirmation
```

**Step 3: Prepare Order**
```
1. Print order or view on screen
2. Gather items from shelves
3. Quality check
4. Package securely
```

**Step 4: Assign Driver**
```
1. View available drivers
2. Select closest driver
3. Click "Assign"
4. Driver gets notification
5. Update status to "ASSIGNED"
```

**Step 5: Track Delivery**
```
1. Monitor driver status
2. Check customer contact
3. Handle issues if needed
4. Confirm delivery
```

### Handling Order Issues

**Customer Not Home**
```
1. Driver calls customer
2. Reschedule delivery
3. Update order notes
4. Notify customer via app
5. Update status
```

**Out of Stock**
```
1. Check order before confirmation
2. If out of stock:
   - Contact customer
   - Offer alternative
   - Cancel if needed
   - Full refund
3. Prevent ordering out-of-stock items
```

**Damaged Items**
```
1. Driver reports issue
2. Photograph damage
3. Contact customer
4. Offer:
   - Replacement
   - Refund
   - Store credit
5. Update order notes
```

**Wrong Address**
```
1. Customer calls with issue
2. Verify correct address
3. If driver hasn't left:
   - Update address
4. If driver on way:
   - Contact driver
   - Get redirected
5. If delivered:
   - Send driver to get
   - Redeliver

## Inventory Management

### Daily Stock Count

**Morning** (Before 9 AM)
```
1. Physical count of products
2. Compare to system
3. Adjust discrepancies
4. Note reason (damage, waste, etc.)
```

**Evening** (After 6 PM)
```
1. Final count
2. Update system
3. Calculate next day needs
4. Place orders if needed
```

### Low Stock Alerts

**Automatic Alert** (Stock < 10)
- Red flag in `/admin/inventory`
- Email alert sent
- Dashboard notification

**Response**
1. Click alert
2. Review stock level
3. Click "Reorder"
4. Contact supplier
5. Update when received

### Stock Adjustments

**Reasons**
- **Damaged**: Item physically damaged
- **Waste**: Expired or spoiled
- **Theft**: Inventory loss
- **Adjustment**: Correction to count
- **Return**: Customer return

**Process**
```
1. Go to /admin/inventory
2. Click product
3. Enter quantity change
4. Select reason
5. Add notes
6. Save
7. Record in log
```

## Driver Management

### Driver Verification

**Initial Onboarding**
- [ ] Verify identity (ID card)
- [ ] Check driving license
- [ ] Criminal background check
- [ ] Vehicle inspection
- [ ] Insurance verification
- [ ] Create account
- [ ] Training session

**Ongoing Verification**
- Monthly performance review
- Quarterly background check
- Annual license renewal
- Vehicle maintenance check

### Assigning Deliveries

**Best Practices**
1. Assign to closest driver
2. Balance workload across drivers
3. Group nearby deliveries (batching)
4. Consider driver ratings
5. Respect driver capacity (15 orders/day max)

**Process**
```
1. View available drivers
2. See their current load
3. Click "Assign"
4. Select driver
5. Confirm assignment
6. Driver gets notification
```

### Monitoring Drivers

**Real-Time**
- Active deliveries map
- Driver location
- Customer address
- Route suggestions
- Estimated arrival

**Performance**
- Delivery time
- Customer ratings
- Issue reports
- Earnings
- Completion rate

### Driver Issues

**Late Delivery**
```
1. Check traffic/issues
2. Notify customer
3. Update ETA
4. Support driver if needed
5. Document reason
```

**Poor Rating**
```
1. Review customer feedback
2. Discuss with driver
3. Create improvement plan
4. Monitor closely
5. Consider suspension if continues
```

**Absenteeism**
```
1. Check reason
2. Discuss availability
3. Create schedule
4. Consider disciplinary action
```

## Monitoring & Alerts

### System Health

**Daily Check** (`/api/health`)
```
1. Database: Connected
2. API: Responding
3. Memory: Normal
4. Disk: Not full
5. Errors: None
```

**Response to Issues**
- [ ] Database down: Restart service
- [ ] High memory: Restart app
- [ ] Disk full: Clean logs, upgrade
- [ ] API slow: Check load, optimize

### Performance Monitoring

**Target Metrics**
- Homepage: < 2 seconds
- Search: < 500ms
- API: < 500ms
- Order creation: < 1 second

**Monitoring**
- Check dashboard performance
- Review slow queries
- Analyze user feedback
- Monitor logs for errors

**Optimization**
- If slow: Check database
- If errors: Review logs
- If high load: Scale infrastructure
- If capacity: Add resources

### Alerts to Watch For

**Critical**
- [ ] Database down
- [ ] API not responding
- [ ] Disk space full
- [ ] High error rate

**Warning**
- [ ] Slow response times
- [ ] High memory usage
- [ ] Database slow
- [ ] Many failed requests

## Reporting

### Daily Report

```
Date: [Date]
Orders: [Count]
Revenue: ₹[Amount]
Deliveries: [Count]
Drivers Active: [Count]
Issues: [Count]
Avg Delivery Time: [Minutes]
Customer Satisfaction: [%]
```

### Weekly Report

- Total orders
- Total revenue
- Top products
- Top drivers
- Issues/complaints
- Inventory adjustments
- Performance metrics
- Recommendations

### Monthly Report

See `/admin/reports` for:
- Sales trends
- Top products
- Driver performance
- Customer analysis
- Inventory movement
- Revenue breakdown
- Growth metrics

## Backup & Recovery

### Daily Backup

**Automatic** (Neon handles)
- Runs daily at off-peak hours
- Full backup retained
- Point-in-time recovery available

**Manual Backup** (Weekly)
```bash
# Export database
pg_dump --url [DATABASE_URL] > backup-$(date +%Y%m%d).sql

# Store safely
aws s3 cp backup-$(date +%Y%m%d).sql s3://oyru-backups/
```

### Recovery Process

**If Data Lost**
1. Contact Neon support
2. Request restore from backup
3. Specify point in time
4. Verify data restored
5. Monitor for issues

**Testing Recovery**
- Monthly: Test restore process
- Document time to restore
- Verify data integrity

## Team Management

### Roles & Responsibilities

**Manager**
- [ ] Oversee all operations
- [ ] Handle escalations
- [ ] Review reports
- [ ] Plan improvements

**Order Processing**
- [ ] Confirm orders
- [ ] Check inventory
- [ ] Assign drivers

**Inventory**
- [ ] Stock count
- [ ] Receive stock
- [ ] Track usage
- [ ] Reorder

**Customer Support**
- [ ] Handle inquiries
- [ ] Resolve issues
- [ ] Update customers

**Driver Coordinator**
- [ ] Driver onboarding
- [ ] Assign deliveries
- [ ] Monitor performance
- [ ] Handle issues

### Team Meetings

**Daily** (10 min)
- Overnight issues
- Day plan
- Driver briefing

**Weekly** (1 hour)
- Performance review
- Problem solving
- Planning

**Monthly** (2 hours)
- Results review
- Strategy discussion
- Team training

## Troubleshooting Common Issues

### Platform Issues

**Order Not Showing**
```
1. Refresh page (Ctrl+Shift+R)
2. Check database status
3. Review error logs
4. Restart application
```

**Slow Performance**
```
1. Check server load
2. Check database queries
3. Optimize slow queries
4. Scale if needed
```

**Driver Can't Login**
```
1. Check account exists
2. Verify password
3. Check IP restrictions
4. Reset if needed
```

### Operational Issues

**Inventory Mismatch**
```
1. Physical count
2. System count
3. Find discrepancy
4. Adjust system
5. Investigate cause
```

**Delivery Delay**
```
1. Check traffic
2. Contact driver
3. Update customer
4. Support as needed
5. Document issue
```

**Customer Complaint**
```
1. Listen carefully
2. Apologize
3. Investigate
4. Resolve
5. Follow up
```

## Compliance & Regulations

### Data Protection
- GDPR compliance
- Data privacy policy
- Customer consent
- Secure data storage

### Tax & Accounting
- Sales tax collection
- Invoice generation
- Accounting reconciliation
- Tax filing

### Employment
- Driver agreements
- Insurance coverage
- Safety requirements
- Labor laws compliance

### Food/Product Safety (if applicable)
- Storage requirements
- Handling procedures
- Quality standards
- Certifications

## Success Metrics

### Track These Daily
- Total orders
- Total revenue
- Average order value
- Delivery time (avg)
- Customer satisfaction
- Driver performance

### Monthly Goals
- Order growth: +10%
- Revenue growth: +10%
- Customer satisfaction: >4.5/5
- On-time delivery: >95%
- Driver retention: >80%

### Annual Targets
- Revenue: [Target]
- Orders: [Target]
- Customer base: [Target]
- Geographic expansion: [Target]

## Emergency Procedures

### System Down

**Action**
```
1. Notify all users
2. Restart server
3. Check database
4. Restore from backup if needed
5. Verify functionality
6. Document incident
```

**Communication**
- Email: notify customers
- Telegram: alert drivers
- Website: status page
- Social: post update

### Security Incident

**Response**
```
1. Isolate affected system
2. Assess damage
3. Notify affected users
4. Take remedial action
5. Review logs
6. Implement fixes
```

**Prevention**
- Regular security audits
- Penetration testing
- Access control reviews
- Staff training

---

**Document Version**: 1.0
**Last Updated**: [Date]
**Next Review**: [Date + 30 days]

For questions: support@oyru.delivery
