# Oyru Delivery MVP - Deployment Guide

This guide covers deploying the Oyru Delivery MVP to production environments.

## Prerequisites

- Node.js 18+ or Docker
- PostgreSQL database (Neon recommended)
- Better Auth secret key
- (Optional) Telegram Bot Token for notifications

## Environment Setup

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Required Variables

Update `.env.local` with your production values:

```env
# Database - Use your production database URL
DATABASE_URL=postgresql://user:password@your-host:5432/oyru

# Auth - Generate a secure secret
BETTER_AUTH_SECRET=your-generated-secret-key
BETTER_AUTH_TRUST_HOST=true

# Environment
NODE_ENV=production
LOG_LEVEL=info

# Optional - Telegram Bot for notifications
TELEGRAM_BOT_TOKEN=your-bot-token
```

To generate `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless Next.js deployment with automatic scaling.

1. **Connect Repository**
   ```bash
   # Link your GitHub/GitLab repository to Vercel
   vercel link
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add BETTER_AUTH_SECRET
   vercel env add BETTER_AUTH_TRUST_HOST
   ```

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

### Option 2: Docker (Any Cloud Provider)

#### Build Docker Image

```bash
docker build -t oyru-delivery:1.0.0 .
```

#### Run Locally

```bash
docker run -d \
  --name oyru-delivery \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e BETTER_AUTH_SECRET=your-secret \
  -e BETTER_AUTH_TRUST_HOST=true \
  oyru-delivery:1.0.0
```

#### Push to Registry

```bash
# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag oyru-delivery:1.0.0 your-account.dkr.ecr.us-east-1.amazonaws.com/oyru-delivery:1.0.0
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/oyru-delivery:1.0.0

# Docker Hub
docker tag oyru-delivery:1.0.0 your-username/oyru-delivery:1.0.0
docker push your-username/oyru-delivery:1.0.0
```

### Option 3: Railway / Render / Fly.io

These platforms offer one-click deployments from GitHub:

1. Connect your repository
2. Set environment variables in the dashboard
3. Deploy automatically on git push

## Database Migration

### Neon (Recommended)

```bash
# The database schema is already created via SQL migrations
# Just ensure DATABASE_URL points to your Neon project
vercel env add DATABASE_URL
```

### Self-Hosted PostgreSQL

```bash
# Connect to your database
psql postgresql://user:password@host:5432/oyru

# The application creates tables automatically on first run
# For manual setup, run:
# psql -f scripts/init-db.sql
```

## Health Checks

After deployment, verify the application is healthy:

```bash
curl https://your-domain.com/api/health

# Response:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-22T10:30:00Z",
#   "checks": {
#     "database": { "status": "ok", "responseTime": "45ms" },
#     "api": { "status": "ok" }
#   }
# }
```

## Scaling Considerations

### Database
- Neon auto-scales connections
- Monitor query performance via database admin panel
- Set connection pool limits if needed

### Application
- Vercel scales automatically
- Docker: use load balancer + multiple replicas
- Monitor logs for performance issues

### Caching
- Implement Redis for session/cache (future enhancement)
- Use CDN for static assets

## Monitoring & Logs

### Vercel
```bash
vercel logs your-project-name
```

### Docker / Self-Hosted
```bash
# View logs
docker logs oyru-delivery

# Stream logs
docker logs -f oyru-delivery

# Check health
curl http://localhost:3000/api/health
```

## Environment Variables Checklist

- [ ] DATABASE_URL set and working
- [ ] BETTER_AUTH_SECRET configured
- [ ] BETTER_AUTH_TRUST_HOST=true
- [ ] NODE_ENV=production
- [ ] LOG_LEVEL configured (info/warn/error)
- [ ] (Optional) TELEGRAM_BOT_TOKEN for notifications

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Health Check Failing
```bash
# Check logs
vercel logs your-project

# Verify database is accessible
curl https://your-domain.com/api/health
```

### High Memory Usage
```bash
# Review application logs
# Check database query performance
# Consider enabling caching
```

## Production Best Practices

1. **Security**
   - Rotate BETTER_AUTH_SECRET periodically
   - Use HTTPS only
   - Enable database encryption
   - Keep dependencies updated

2. **Monitoring**
   - Set up error tracking (Sentry recommended)
   - Monitor database performance
   - Track API response times
   - Alert on health check failures

3. **Backups**
   - Enable daily database backups
   - Test backup restoration monthly
   - Keep backup retention policy

4. **Updates**
   - Test updates in staging first
   - Use semantic versioning
   - Document breaking changes

## Support

For deployment issues, check:
- Application logs at `/api/health`
- Database connectivity via psql
- Environment variables are set correctly
- Firewall rules allow inbound traffic

## Next Steps

After successful deployment:
1. Run QA test suite (see QA_CHECKLIST.md)
2. Configure monitoring and alerts
3. Set up automated backups
4. Document any custom configurations
5. Train operations team on deployment process
