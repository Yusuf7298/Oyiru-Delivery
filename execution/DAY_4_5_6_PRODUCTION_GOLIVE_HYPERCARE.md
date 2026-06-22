# OYRU PHASE 1 - DAY 4-6+: PRODUCTION GO-LIVE & HYPERCARE

---

# DAY 4: PRODUCTION PREPARATION

**Owner**: DevOps Lead  
**Duration**: 6-8 hours  
**Success Criteria**: Production environment ready, all health checks pass, rollback plan tested

---

## PRE-PRODUCTION CHECKLIST

- [ ] Client UAT approved (DAY 3 signoff received)
- [ ] All critical issues resolved
- [ ] Production environment allocated & configured
- [ ] SSL certificates ready
- [ ] Domain DNS ready to point to production
- [ ] Database backups tested
- [ ] Monitoring stack configured
- [ ] Team notified of production deployment window

---

## STEP 1: PRODUCTION DATABASE SETUP

### 1.1 Create Production Database

```bash
# Create production database
CREATE DATABASE oyru_production;

# Verify creation
\l oyru_production
```

### 1.2 Configure Backups

```bash
# Set up automated backups (daily at 2 AM UTC)
# For Neon: Configure via dashboard
# For AWS RDS: Enable automated backups (7 days retention)
# For self-hosted: Configure pg_dump cronjob

# Test backup & restore
pg_dump oyru_production > /backups/oyru_prod_test.sql
createdb oyru_production_test
psql oyru_production_test < /backups/oyru_prod_test.sql

# Verify restore succeeded
SELECT COUNT(*) FROM oyru_production_test.products;

# Clean up test database
dropdb oyru_production_test
```

### 1.3 Run Migrations

```bash
# Apply all migrations to production
pnpm run migrate:latest --env production

# Verify migrations applied
SELECT name, executed_at FROM migrations ORDER BY executed_at DESC;

# Expected: All migrations applied successfully
```

### 1.4 Load Production Seed Data

```bash
# Run seed script for production
pnpm run seed --env production

# This should create:
# - 5 product categories
# - 20 initial products
# - 3+ hotel accounts

# Verify seed data
SELECT COUNT(*) FROM products;              -- Should be 20
SELECT COUNT(*) FROM categories_oyru;       -- Should be 5
SELECT COUNT(*) FROM hotel_accounts;        -- Should be 3+
```

### 1.5 Set Database Parameters

```bash
# Configure for production workload
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET random_page_cost = 1.1;

# Apply changes
SELECT pg_reload_conf();
```

---

## STEP 2: PRODUCTION ENVIRONMENT CONFIGURATION

### 2.1 Set Environment Variables

```bash
# Create .env.production with all critical variables
cat > .env.production << 'EOF'
# Environment
ENVIRONMENT=production
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:securepass@prod-db.internal:5432/oyru_production

# Next.js
NEXTAUTH_URL=https://oyru.com
NEXT_PUBLIC_APP_URL=https://oyru.com

# Authentication
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Telegram
TELEGRAM_BOT_TOKEN=<production-bot-token>
TELEGRAM_WEBHOOK_SECRET=$(openssl rand -base64 32)

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DESTINATION=/var/log/oyru/app.log

# Monitoring
SENTRY_DSN=<sentry-dsn-if-configured>
DATADOG_API_KEY=<datadog-key-if-configured>

# Features
ENABLE_TELEGRAM_BOT=true
ENABLE_REPORTING=true
MAINTENANCE_MODE=false
EOF

# Encrypt sensitive variables
# Option 1: Use Vercel Secret Manager
vercel env add --production DATABASE_URL
vercel env add --production BETTER_AUTH_SECRET
# ... etc

# Option 2: Use AWS Secrets Manager / GCP Secret Manager
aws secretsmanager create-secret --name oyru/prod/env --secret-string file:///path/to/.env.production

# Verify variables are set
pnpm run env:validate --env production
```

### 2.2 Configure CDN & SSL

```bash
# For Vercel
vercel domains add oyru.com

# For self-hosted
# 1. Add SSL certificate to load balancer
# 2. Configure HTTPS redirect (HTTP -> HTTPS)
# 3. Set HSTS headers

# Verify SSL
curl -I https://oyru.com
# Should return: HTTP/2 200
```

### 2.3 Configure Monitoring & Alerting

```bash
# Deploy monitoring stack
kubectl apply -f monitoring/production.yaml
# or
docker-compose -f docker-compose.monitoring.yml up -d

# Verify dashboards accessible
# - Grafana: https://monitoring.internal.oyru.com
# - Prometheus: https://prometheus.internal.oyru.com

# Configure alert rules
# CPU > 80% → Alert
# Memory > 85% → Alert
# Error rate > 1% → Alert
# API latency > 2s → Alert
```

### 2.4 Configure Logging

```bash
# Deploy log aggregation
# Option 1: ELK Stack
kubectl apply -f logging/elk.yaml

# Option 2: Datadog
# Configure Datadog agent on all servers

# Option 3: CloudWatch / Stackdriver
# Configure cloud-native logging

# Verify logs flowing
# Tail production logs to verify real-time collection
```

---

## STEP 3: PRODUCTION BUILD & DEPLOYMENT

### 3.1 Build for Production

```bash
# Production build (optimized)
pnpm run build

# Output should show:
# ✓ Compiled successfully
# ✓ Optimized bundle
# ✓ Ready for deployment

# Verify bundle size
# Next.js auto-optimizes for production
```

### 3.2 Deploy to Production

**Option A: Vercel (Recommended for Next.js)**
```bash
# Deploy to production
vercel deploy --prod

# Output: https://oyru.vercel.app
# Auto-configured domain: https://oyru.com (if configured)
```

**Option B: Docker to Production**
```bash
# Build Docker image
docker build -t oyru:1.0.0 .

# Tag for registry
docker tag oyru:1.0.0 registry.example.com/oyru:1.0.0

# Push to registry
docker push registry.example.com/oyru:1.0.0

# Deploy via Kubernetes
kubectl set image deployment/oyru oyru=registry.example.com/oyru:1.0.0

# Verify deployment
kubectl rollout status deployment/oyru
```

**Option C: Cloud Provider**
```bash
# AWS Elastic Beanstalk
eb deploy

# Google Cloud Run
gcloud run deploy oyru --image gcr.io/project/oyru:1.0.0

# Azure App Service
az webapp deployment source config-zip --resource-group oyru --name oyru-prod --src dist.zip
```

### 3.3 Verify Production Deployment

```bash
# Test health endpoint
curl -s https://oyru.com/api/health | jq

# Expected: {"status": "healthy", "version": "1.0.0"}

# Test key APIs
curl -s https://oyru.com/api/products | jq '.[0]'
curl -s https://oyru.com/api/categories | jq '.[0]'

# All should return 200 OK with data
```

---

## STEP 4: PRODUCTION VERIFICATION

### 4.1 Smoke Tests

```bash
# Run smoke test suite
pnpm run test:smoke:production

# Should test:
# - API health
# - Database connectivity
# - Authentication
# - Core business flows

# All tests must pass
```

### 4.2 Security Verification

```bash
# Verify HTTPS
curl -I https://oyru.com
# Should have: Strict-Transport-Security

# Verify CORS
curl -H "Origin: https://evil.com" https://oyru.com/api/products
# Should deny if CORS not configured

# Verify no debug mode
curl https://oyru.com/api/debug
# Should return 404

# Verify secrets not in code
grep -r "password\|secret\|token" build/ --exclude-dir=node_modules
# Should find nothing
```

### 4.3 Load Testing

```bash
# Simulate production load
artillery run load-test.yml

# Test scenario:
# - 100 concurrent users
# - 5 minutes duration
# - Ramp up gradually

# Success criteria:
# - p99 latency < 2s
# - Error rate < 0.1%
# - No timeout errors
```

---

## STEP 5: PRODUCTION DATABASE MIGRATION FROM STAGING

### 5.1 Backup Staging Data (Optional)

```bash
# If you want to migrate real staging data to production
pg_dump oyru_staging > /backups/oyru_staging_final.sql

# Copy to production
scp /backups/oyru_staging_final.sql prod-db:/backups/
```

### 5.2 Production Readiness Checklist

```
✓ Environment variables set and verified
✓ Database created and migrations applied
✓ Seed data loaded
✓ SSL certificates configured
✓ Monitoring active
✓ Backups tested
✓ CDN configured
✓ Domain DNS updated (ready to point)
✓ All health checks pass
✓ Load testing successful
✓ Security verification passed
✓ Team on standby
```

---

## STEP 6: DNS CUTOVER PREPARATION

### 6.1 DNS Configuration

```bash
# Current state: DNS points to staging
# oyru.com → staging.oyru.vercel.app

# Production DNS record ready
# A record: oyru.com → production.oyru.vercel.app
# TTL: 300 (5 minutes, for easy rollback)

# Verify production DNS resolves
nslookup oyru.com
# Should show production IP

# But don't activate yet! Keep TTL low for easy rollback
```

### 6.2 Rollback Plan Tested

```bash
# In case production deployment fails:

# OPTION 1: Quick DNS rollback (< 5 minutes)
# Change DNS to point back to staging

# OPTION 2: Vercel instant rollback
# vercel rollback

# OPTION 3: Database rollback
# Restore from pre-production backup
pg_restore oyru_production < /backups/oyru_prod_pre_golive.sql

# All rollback scenarios must be tested and working
```

---

## DELIVERABLES - DAY 4

- [ ] PRODUCTION_READINESS_CHECKLIST.md (all items checked)
- [ ] Production environment URL
- [ ] Database backup confirmed
- [ ] Monitoring dashboards active
- [ ] Team notification sent
- [ ] Rollback plan tested & documented

---

---

# DAY 5: GO LIVE

**Owner**: Product Manager / DevOps Lead  
**Duration**: 2-3 hours (deployment + initial monitoring)  
**Success Criteria**: Production live, health checks pass, no critical issues

---

## PRE-GO-LIVE (30 minutes before)

### Final Checklist

```
[ ] Production environment stable
[ ] All health checks passing
[ ] Team in war room / on Slack call
[ ] Client notified & ready
[ ] Support team briefed
[ ] Rollback plan ready
[ ] Monitoring dashboard open
[ ] Backup created
[ ] DNS TTL set to 300 seconds
```

### Team Assignments

| Role | Responsibility | Escalation |
|------|---|---|
| DevOps Lead | Deploy, monitor infra | CTO |
| Product Manager | Customer communication | CEO |
| QA Lead | Validate flows post-deploy | Product Manager |
| Support Lead | Monitor support channels | Product Manager |
| Database Admin | DB health & backups | DevOps Lead |

---

## GO LIVE EXECUTION

### STEP 1: ANNOUNCE LAUNCH (5 min)

```bash
# 9:55 AM: Send announcement to team
# "Oyru Delivery Platform going live in 5 minutes"

# Update status page
# Status: "Deployment in progress"

# Notify key stakeholders
# - Slack: @channel Oyru going live now!
# - Email: Production launch started
# - Internal status: DEPLOYING
```

### STEP 2: POINT DNS (10 min)

```bash
# CRITICAL: This is the actual "go live" moment

# Update DNS to point to production
# oyru.com → production.oyru.example.com

# For Vercel: Update domain in dashboard
# For DNS provider: Update A/CNAME records

# Verify DNS propagation
nslookup oyru.com
# Should show production IP within 60 seconds

# Test in browser
open https://oyru.com
# Should load production app

# Verify in multiple browsers/locations
# Use online DNS checker to confirm global propagation
```

### STEP 3: INITIAL HEALTH CHECKS (10 min)

```bash
# Verify production is live and healthy
curl -s https://oyru.com/api/health | jq

# Expected output:
# {
#   "status": "healthy",
#   "database": "connected",
#   "version": "1.0.0",
#   "uptime": 45
# }

# Check key metrics
# - API response time: ____________ ms
# - Error rate: ____________%
# - Active connections: ____________

# All should be green
```

### STEP 4: VALIDATE KEY FLOWS (15 min)

```bash
# QA Lead validates core flows from production

# Customer flow
[ ] Load https://oyru.com
[ ] Sign in
[ ] Browse products
[ ] Add to cart
[ ] Place order
[ ] Order confirmation received

# Admin flow
[ ] Admin dashboard loads
[ ] Orders visible
[ ] Can update order status
[ ] Reports accessible

# Telegram bot
[ ] Bot responsive
[ ] /products command works
[ ] Checkout functional

# ALL MUST WORK - if any fails, initiate ROLLBACK immediately
```

### STEP 5: ANNOUNCE GO LIVE (5 min)

```bash
# Update status page
# Status: "✓ Live and operational"

# Send announcement email
Subject: Oyru Delivery Platform is now LIVE!

Dear Oyru Team & Customers,

Oyru Delivery Platform is now live at https://oyru.com

Key features:
- Customer ordering
- Bulk hotel ordering
- Real-time delivery tracking
- Admin dashboard with reports
- Telegram bot support

Get started: Sign in at https://oyru.com

Questions? Contact support@oyru.com

Thanks,
The Oyru Team

# Post to social media (if applicable)
# Notify customer base
```

### STEP 6: ENABLE MONITORING ALERTS (5 min)

```bash
# Activate all production alerts
# These were silent during deployment

# Enable alerts for:
[ ] High CPU usage
[ ] High memory usage
[ ] Database connection failures
[ ] High error rate
[ ] Slow API responses
[ ] Failed deliveries
[ ] Support ticket spike
[ ] Telegram bot failures
```

---

## IF PRODUCTION ISSUES FOUND

### IMMEDIATE RESPONSE (< 15 min)

```
1. Pause any customer-facing announcements
2. Assess issue severity
3. If CRITICAL: Initiate ROLLBACK (see below)
4. If HIGH: Try hotfix while keeping options open
5. If MEDIUM/LOW: Keep live, plan fix
```

### ROLLBACK DECISION TREE

```
Is production down?
├─ YES: ROLLBACK immediately (< 5 min)
│   └─ Revert DNS to staging
│   └─ Restore database backup if needed
│   └─ Notify customer & team
│   └─ Investigate root cause
│   └─ Fix in staging
│   └─ Plan re-deployment
│
└─ NO: Production up but issues?
    ├─ Customer can't order: ROLLBACK
    ├─ Admin dashboard broken: ROLLBACK
    ├─ Data corruption: ROLLBACK
    ├─ Delivery tracking broken: ROLLBACK
    │
    └─ Minor UI issue: Keep live, hotfix
```

### ROLLBACK EXECUTION

```bash
# 1. Immediate DNS revert
# Point DNS back to staging
# oyru.com → staging.oyru.vercel.app

# 2. Verify staging works
curl -s https://oyru.com/api/health

# 3. Announce to team
# Slack: @channel Production issue detected, rolled back to staging. ETA fix: [X] hours

# 4. Investigate root cause
# Check logs, database, monitoring

# 5. Plan retry
# Schedule re-deployment after fix tested in staging
```

---

## GO LIVE SIGN-OFF

After production stable for 1 hour:

```markdown
# PRODUCTION GO LIVE - SIGN-OFF

**Go Live Date**: [Date]
**Go Live Time**: [Time] UTC
**Duration**: [Duration]

## Deployment Status
- [x] DNS pointed to production
- [x] Health checks passing
- [x] Key flows validated
- [x] No critical issues
- [x] Team briefed

## Approvals

**DevOps Lead**: ________________ Date: _______
**Product Manager**: ________________ Date: _______
**QA Lead**: ________________ Date: _______
**Client Lead**: ________________ Date: _______

**PRODUCTION GO LIVE APPROVED**
```

---

## DELIVERABLES - DAY 5

- [ ] Production URL: https://oyru.com
- [ ] GO_LIVE_REPORT.md
- [ ] Team announcement sent
- [ ] Customer notification sent
- [ ] Monitoring active
- [ ] Alerts configured

---

---

# DAY 6-14: HYPERCARE PERIOD

**Owner**: Support Lead + Dev Team  
**Duration**: 9 days of elevated support  
**Success Criteria**: Platform stable, no critical issues, team confident

---

## HYPERCARE OBJECTIVES

```
1. Monitor production 24/7
2. Respond to issues within 1 hour (24/7)
3. Track all error patterns
4. Optimize performance based on real data
5. Support customer onboarding
6. Document learnings
7. Plan Phase 2 improvements
```

---

## DAILY HYPERCARE PROCEDURES

### Morning Standup (9:00 AM)

```
Attendees: DevOps, QA, Support, Product Manager

Review:
[ ] Overnight error rate
[ ] Customer issues from Slack/email
[ ] Performance metrics
[ ] Database health
[ ] Telegram bot activity
[ ] Any alerts triggered

Actions:
[ ] Assign issues to developers
[ ] Plan hotfixes if needed
[ ] Update status dashboard
[ ] Communicate to customers (if relevant)
```

### Throughout Day

```
Monitoring Dashboard:
[ ] Error rate < 0.5%
[ ] API response time < 500ms
[ ] Database latency < 50ms
[ ] Uptime > 99%
[ ] Disk space > 20%
[ ] Memory usage < 80%

Alerts:
[ ] Check every alert received
[ ] Investigate root cause
[ ] Document in incident log
[ ] Fix or mark as expected

Support:
[ ] Monitor Slack #support channel
[ ] Respond to customer issues within 1 hour
[ ] Escalate bugs to dev team
[ ] Track support ticket metrics
```

### Evening Report (6:00 PM)

```
Daily Hypercare Report:
- Errors encountered: ________
- Critical issues: ________
- Customer support tickets: ________
- Performance metrics: ________
- Planned fixes: ________
- Team observations: ________

Status: ✓ STABLE / ⚠ ISSUES / ✗ CRITICAL
```

---

## HYPERCARE METRICS

Track daily:

| Metric | Target | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |
|--------|--------|-------|-------|-------|-------|-------|-------|-------|
| Uptime | >99% | ___% | ___% | ___% | ___% | ___% | ___% | ___% |
| Error Rate | <0.5% | ___% | ___% | ___% | ___% | ___% | ___% | ___% |
| API Latency | <500ms | ___ | ___ | ___ | ___ | ___ | ___ | ___ |
| Support Tickets | <10 | ___ | ___ | ___ | ___ | ___ | ___ | ___ |
| Critical Issues | 0 | ___ | ___ | ___ | ___ | ___ | ___ | ___ |

---

## COMMON PRODUCTION ISSUES & RESPONSES

### ISSUE: High Error Rate (>1%)

```
Immediate Actions:
1. Check error logs
2. Identify common error pattern
3. If database: Check connection pool
4. If API: Check specific endpoint
5. If client: Check for JavaScript errors
6. If Telegram: Check bot webhook delivery

Response:
- If fixable in 30 min: Fix immediately
- If needs investigation: Investigate while keeping live
- If critical: Hotfix in production
- If complex: Plan for next release
```

### ISSUE: Slow APIs (> 2s response)

```
Immediate Actions:
1. Check database query performance
2. Check database connection pool
3. Check system resources (CPU, memory)
4. Check for traffic spike

Response:
- Optimize N+1 queries
- Add database indexes
- Implement caching
- Scale infrastructure if needed
```

### ISSUE: Customer Can't Order

```
Immediate Actions:
1. Test ordering in staging
2. Check if issue is widespread or single user
3. Check if inventory issue
4. Check if payment issue

Response:
- If payment processor down: Notify customers
- If inventory issue: Fix inventory consistency
- If app issue: Hotfix immediately
- If isolated to user: Support handles directly
```

### ISSUE: Delivery Tracking Not Updating

```
Immediate Actions:
1. Check Telegram webhook delivery
2. Check driver app connectivity
3. Check location update logs
4. Check if deliveries stuck in transit

Response:
- Verify webhook configured
- Restart bot if needed
- Manual update if driver app issue
- Database fix if state inconsistency
```

---

## HYPERCARE SIGN-OFF (End of Day 6)

After 1 week of stable operation:

```markdown
# HYPERCARE PERIOD - WEEK 1 SIGN-OFF

**Period**: Day 1-7 of production
**Status**: ✓ STABLE / ⚠ MONITORING / ✗ ISSUES

## Metrics
- Uptime: ____%
- Error Rate: ____%
- Critical Issues: _____
- Support Tickets: _____

## Issues Encountered
1. [Issue]: Severity: Priority:
2. [Issue]: Severity: Priority:
3. [Issue]: Severity: Priority:

## Resolutions
- Critical issues: 100% resolved
- High issues: ___% resolved
- Medium issues: ___% resolved

## Recommendations for Phase 2
- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

## Conclusion
Production platform is STABLE and performing as expected.
Team confidence: HIGH
Ready to reduce hypercare support level.

**Approved by**: ________________
```

---

## END OF HYPERCARE (Day 14)

### Final Report

```markdown
# POST-LAUNCH REPORT - PHASE 1 COMPLETION

**Launch Date**: [Date]
**Hypercare Period**: 14 days
**Status**: PRODUCTION READY

## Production Statistics
- Total uptime: ____%
- Average response time: ___ ms
- Total orders placed: _____
- Total customers: _____
- Support tickets resolved: _____
- Critical issues: 0
- Hot fixes deployed: _____

## Achievements
- Successfully launched Oyru Delivery Platform
- Zero data loss incidents
- Maintained >99% uptime
- Processed _____ orders
- _____ customers onboarded
- _____ support tickets handled

## Issues & Learnings
- [Key issue 1]: [Resolution]
- [Key issue 2]: [Resolution]
- [Optimization opportunity 1]
- [Optimization opportunity 2]

## Phase 2 Priorities (Backlog)
1. Mobile app development
2. Performance optimizations
3. Advanced reporting
4. Payment processor integration
5. International expansion
6. [Other items from UAT]

## Team Recognition
- Special mention: [Team member contributions]
- Appreciation: Customer support, development team, operations

## Formal Sign-Off
Phase 1 is COMPLETE and SUCCESSFUL.
Platform is production ready for ongoing support and Phase 2 development.

**CEO**: ________________ Date: _______
**Product Manager**: ________________ Date: _______
**DevOps Lead**: ________________ Date: _______
**Client**: ________________ Date: _______
```

---

## TRANSITION TO NORMAL OPERATIONS (Day 15+)

After hypercare period:

```
- Move from 24/7 support to standard support hours
- Transfer support tickets to dedicated support team
- Shift focus from stabilization to optimization
- Begin Phase 2 planning & development
- Schedule Phase 2 kickoff meeting
- Archive hypercare logs & learnings
- Team celebration & retrospective
```

---

## PHASE 1 EXIT CRITERIA - ALL MET ✓

- [x] Production deployment successful
- [x] Zero critical issues in first week
- [x] Platform stable (>99% uptime)
- [x] Customer orders processed successfully
- [x] Client satisfied and signed off
- [x] Operational procedures documented
- [x] Team trained on production support
- [x] Phase 2 backlog created
- [x] No new features allowed (Phase 1 lock)
- [x] Formal go-live sign-off completed

---

**OYRU PHASE 1 - COMPLETE & SUCCESSFUL** 🎉
