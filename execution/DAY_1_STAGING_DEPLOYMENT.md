# OYRU PHASE 1 - DAY 1: STAGING DEPLOYMENT

**Date**: [Set by team]  
**Owner**: DevOps Lead  
**Duration**: 4-6 hours  
**Success Criteria**: All health checks pass, staging URL active, seed data loaded

---

## PRE-DEPLOYMENT CHECKLIST

### Infrastructure Ready
- [ ] Staging environment provisioned (Vercel/Cloud provider)
- [ ] Database server ready (Neon PostgreSQL)
- [ ] Domain DNS configured
- [ ] SSL certificate ready
- [ ] Monitoring stack deployed
- [ ] Backup system tested

### Code Ready
- [ ] Main branch current with all fixes
- [ ] No pending commits
- [ ] All migrations up to date
- [ ] Seed script verified
- [ ] Environment file template prepared

### Team Ready
- [ ] DevOps lead assigned
- [ ] Database admin available
- [ ] Security lead ready for review
- [ ] Product manager notified
- [ ] Client notified of deployment window

---

## STEP 1: ENVIRONMENT CONFIGURATION

### 1.1 Set Environment Variables

```bash
# Clone .env.example to .env.staging
cp .env.example .env.staging

# Set critical variables
export ENVIRONMENT=staging
export NODE_ENV=production
export DATABASE_URL=postgresql://user:pass@staging-db:5432/oyru_staging
export BETTER_AUTH_SECRET=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
export NEXTAUTH_URL=https://staging.oyru.example.com
export LOG_LEVEL=info
export TELEGRAM_BOT_TOKEN=<from Telegram BotFather>
export TELEGRAM_WEBHOOK_SECRET=$(openssl rand -base64 32)
```

### 1.2 Verify Environment

```bash
# Validate all required variables are set
pnpm run env:validate

# Output: All environment variables validated ✓
```

---

## STEP 2: DATABASE DEPLOYMENT

### 2.1 Run Migrations

```bash
# Ensure database exists
CREATE DATABASE oyru_staging;

# Run all migrations
pnpm run migrate:latest

# Verify migrations
SELECT name, executed_at FROM migrations ORDER BY executed_at DESC LIMIT 10;
```

### 2.2 Load Seed Data

```bash
# Run seed script
pnpm run seed

# Output:
# ✓ Categories created (5)
# ✓ Products created (20)
# ✓ Hotel accounts created (3)
# ✓ Database seeded successfully!

# Verify seed data
SELECT COUNT(*) FROM products;          -- Should be 20
SELECT COUNT(*) FROM categories_oyru;   -- Should be 5
SELECT COUNT(*) FROM hotel_accounts;    -- Should be 3
```

### 2.3 Generate Test Users

```bash
# Generate test accounts for all roles
pnpm run generate-test-users

# Output test credentials to console
```

### 2.4 Backup Database

```bash
# Create initial backup
pg_dump oyru_staging > /backups/oyru_staging_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh /backups/oyru_staging*.sql
```

---

## STEP 3: APPLICATION BUILD & DEPLOYMENT

### 3.1 Build Application

```bash
# Build Next.js app
pnpm run build

# Check build output
# ✓ Compiled successfully
# ✓ Server Functions compiled
# ✓ Ready for deployment
```

### 3.2 Deploy to Staging

**Option A: Vercel Deployment**
```bash
# Deploy via Vercel CLI
vercel deploy --prod --scope team_slug

# Output: https://staging.oyru.vercel.app
```

**Option B: Docker Deployment**
```bash
# Build Docker image
docker build -t oyru:staging .

# Push to registry
docker push registry.example.com/oyru:staging

# Deploy via Kubernetes or docker-compose
docker-compose -f docker-compose.staging.yml up -d

# Output: Services running
```

**Option C: Cloud Provider (AWS/GCP)**
```bash
# Deploy using CLI
aws apprunner create-service --image-repository oyru:staging
# or
gcloud run deploy oyru-staging --image gcr.io/project/oyru:staging
```

### 3.3 Verify Deployment

```bash
# Check application health
curl https://staging.oyru.example.com/api/health

# Expected response:
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "uptime": 45,
#   "timestamp": "2025-01-15T10:30:00Z"
# }
```

---

## STEP 4: TELEGRAM BOT CONFIGURATION

### 4.1 Set Webhook

```bash
# Configure Telegram webhook to staging environment
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -F "url=https://staging.oyru.example.com/api/telegram/webhook" \
  -F "secret_token=$TELEGRAM_WEBHOOK_SECRET"

# Response: {"ok":true,"result":true,"description":"Webhook was set"}
```

### 4.2 Verify Webhook

```bash
# Check webhook status
curl https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo

# Expected: webhook_url matches staging URL
```

### 4.3 Test Bot

```bash
# Send test message to bot
# Bot should respond with /start menu

# Check logs for webhook delivery
tail -f /var/log/oyru/telegram.log
```

---

## STEP 5: MONITORING & LOGGING SETUP

### 5.1 Configure Monitoring

```bash
# Verify monitoring dashboard
# - CPU usage
# - Memory usage
# - Disk usage
# - Request rate
# - Error rate
# - Response time

# All metrics should be collecting data
```

### 5.2 Configure Logging

```bash
# Verify log aggregation
# - Application logs flowing
# - Database logs flowing
# - Telegram webhook logs flowing

# Test log streaming
tail -f /var/log/oyru/app.log
```

### 5.3 Set Alerting

```bash
# Configure critical alerts:
# - CPU > 80%
# - Memory > 85%
# - Error rate > 1%
# - API response > 2s
# - Database connection failures

# Verify alert channels are active
# - Email
# - Slack
# - PagerDuty (if configured)
```

---

## STEP 6: VERIFICATION TESTS

### 6.1 Health Checks

```bash
# Run health check
curl -s https://staging.oyru.example.com/api/health | jq

# Status should be: "healthy"
```

### 6.2 API Smoke Tests

```bash
# Test key endpoints
curl -s https://staging.oyru.example.com/api/products | jq '.[] | .id' | head -5
curl -s https://staging.oyru.example.com/api/categories | jq '.[] | .name'
curl -s https://staging.oyru.example.com/api/health | jq '.status'

# All should return 200 OK
```

### 6.3 Database Connectivity

```bash
# Test from application
curl -X POST https://staging.oyru.example.com/api/admin/test-db \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Response: {"status": "connected", "latency_ms": 12}
```

### 6.4 Authentication Flow

```bash
# Test login
curl -X POST https://staging.oyru.example.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.local",
    "password": "Test123!@#"
  }'

# Response should include auth token
```

---

## STEP 7: DOCUMENTATION & HANDOFF

### 7.1 Generate Deployment Report

```bash
cat > DEPLOYMENT_REPORT_DAY1.md << 'EOF'
# DAY 1 DEPLOYMENT REPORT

**Date**: [Date]
**Status**: SUCCESS
**Duration**: [Duration]

## Summary
- Staging environment deployed
- Database migrations completed
- Seed data loaded
- Telegram bot configured
- All health checks passing

## URLs
- Staging App: https://staging.oyru.example.com
- Admin Dashboard: https://staging.oyru.example.com/admin
- API Base: https://staging.oyru.example.com/api

## Test Credentials
- Customer: customer@test.local / Test123!@#
- Admin: admin@test.local / Test123!@#
- Driver: driver@test.local / Test123!@#
- Hotel: hotel@test.local / Test123!@#

## Environment
- Database: oyru_staging (PostgreSQL 14)
- Region: [Region]
- Backup: oyru_staging_20250115_103000.sql
- Monitoring: Active

## Next Steps
- Day 2: Internal QA execution
- Notify team of staging URL
- Provide test credentials to QA team
EOF
```

### 7.2 Notify Team

```bash
# Send notification to Slack/Email
Staging deployment completed successfully!

Staging URL: https://staging.oyru.example.com
Admin Dashboard: https://staging.oyru.example.com/admin

Test Credentials:
- Customer: customer@test.local / Test123!@#
- Admin: admin@test.local / Test123!@#
- Driver: driver@test.local / Test123!@#
- Hotel: hotel@test.local / Test123!@#

All health checks passing.
Ready for Day 2 QA execution.
```

---

## STEP 8: ROLLBACK PLAN (If Needed)

### 8.1 Quick Rollback

```bash
# If deployment fails, rollback to previous version
vercel rollback
# or
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up -d (with previous image)
# or
gcloud run deploy oyru-staging --image gcr.io/project/oyru:previous
```

### 8.2 Database Rollback

```bash
# If migrations fail, restore from backup
psql oyru_staging < /backups/oyru_staging_pre_migration.sql
```

---

## SUCCESS CRITERIA - ALL MUST PASS ✓

- [ ] Staging URL accessible
- [ ] Health endpoint returns 200
- [ ] Database connectivity verified
- [ ] Seed data loaded (5 categories, 20 products, 3 hotels)
- [ ] All APIs responding < 500ms
- [ ] Telegram webhook configured
- [ ] Monitoring active
- [ ] Test credentials generated
- [ ] Backup created
- [ ] Team notified

---

## TROUBLESHOOTING

### Database Connection Fails
```bash
# Check connection string
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT 1"

# Check credentials in .env.staging
```

### Health Check Fails
```bash
# Check application logs
kubectl logs deployment/oyru -f
# or
docker logs oyru-app

# Common issues: Missing env vars, database connection, port binding
```

### Telegram Webhook Setup Fails
```bash
# Verify bot token
curl https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe

# Verify webhook URL is public and HTTPS
curl https://staging.oyru.example.com/api/telegram/webhook

# Check firewall rules
```

---

## SIGN-OFF

**Deployed by**: ________________  
**Date**: ________________  
**Time**: ________________  
**Verified by**: ________________  
**Status**: ⬜ PENDING | ⬜ SUCCESS | ⬜ FAILED

**Notes**: _______________________________

---

**Next**: Day 2 Internal QA Execution
