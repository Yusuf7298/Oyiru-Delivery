import { getTelegramBot } from '@/lib/services/telegram-bot'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('[v0] Telegram webhook received:', body)

    const bot = getTelegramBot()

    // Initialize bot handlers if not already done
    bot.setupHandlers()

    // Handle the webhook
    await bot.getBot().handleUpdate(body)

    return Response.json({ ok: true })
  } catch (error) {
    console.error('[v0] Telegram webhook error:', error)
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return Response.json({ ok: true, message: 'Telegram webhook is running' })
}
