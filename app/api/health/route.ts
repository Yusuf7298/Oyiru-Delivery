import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { logger } from '@/lib/services/logger'

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    // Check database connectivity
    await db.select().from(user).limit(1)

    const duration = Date.now() - startTime

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'ok',
          responseTime: `${duration}ms`,
        },
        api: {
          status: 'ok',
        },
      },
    }

    logger.debug('Health check passed', { duration })
    return Response.json(healthStatus, { status: 200 })
  } catch (error) {
    logger.error('Health check failed', error as Error)

    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        api: {
          status: 'ok',
        },
      },
    }

    return Response.json(healthStatus, { status: 503 })
  }
}
