import { logger } from '@/lib/services/logger'

export interface EnvVarConfig {
  name: string
  required?: boolean
  default?: string
  validate?: (value: string) => boolean
}

const requiredEnvVars: EnvVarConfig[] = [
  { name: 'DATABASE_URL', required: true },
  { name: 'BETTER_AUTH_SECRET', required: true },
  { name: 'BETTER_AUTH_TRUST_HOST', required: true },
]

const optionalEnvVars: EnvVarConfig[] = [
  { name: 'LOG_LEVEL', default: 'info' },
  { name: 'TELEGRAM_BOT_TOKEN' },
  { name: 'NODE_ENV', default: 'development' },
]

export function validateEnvironment(): boolean {
  let isValid = true

  logger.info('Validating environment variables...')

  // Check required variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name]

    if (!value) {
      logger.error(`Missing required environment variable: ${envVar.name}`)
      isValid = false
      continue
    }

    if (envVar.validate && !envVar.validate(value)) {
      logger.error(`Invalid value for environment variable: ${envVar.name}`)
      isValid = false
    }
  }

  // Set defaults for optional variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar.name] && envVar.default) {
      process.env[envVar.name] = envVar.default
      logger.info(`Using default value for ${envVar.name}: ${envVar.default}`)
    }
  }

  if (isValid) {
    logger.info('Environment validation passed')
  } else {
    logger.error('Environment validation failed')
  }

  return isValid
}

export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name]

  if (!value) {
    if (defaultValue) {
      return defaultValue
    }
    logger.warn(`Environment variable not found: ${name}`)
    return ''
  }

  return value
}

export function getEnvAsNumber(name: string, defaultValue?: number): number {
  const value = getEnv(name, String(defaultValue))
  const num = parseInt(value, 10)

  if (isNaN(num)) {
    logger.warn(`Invalid number for environment variable: ${name}`)
    return defaultValue || 0
  }

  return num
}

export function getEnvAsBoolean(name: string, defaultValue?: boolean): boolean {
  const value = getEnv(name, String(defaultValue)).toLowerCase()
  return value === 'true' || value === '1' || value === 'yes'
}
