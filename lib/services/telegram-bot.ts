import { Telegraf, Context } from 'telegraf'
import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export interface TelegramContext extends Context {
  session?: {
    userId?: string
  }
}

export class TelegramBotService {
  private bot: Telegraf<TelegramContext>
  private readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

  constructor() {
    if (!this.BOT_TOKEN) {
      console.warn('[v0] TELEGRAM_BOT_TOKEN not set')
    }
    this.bot = new Telegraf<TelegramContext>(this.BOT_TOKEN)
  }

  public setupHandlers() {
    this.bot.start(async (ctx) => {
      await ctx.reply(
        '🎉 Welcome to *Oyru Delivery!*\n\nOrder groceries and essentials delivered to your door.',
        { parse_mode: 'Markdown' }
      )
      await this.showMainMenu(ctx)
    })

    this.bot.command('products', async (ctx) => {
      await ctx.reply('📦 Browse our products by category:')
      await this.showProductsMenu(ctx)
    })

    this.bot.command('cart', async (ctx) => {
      await ctx.reply(
        '🛒 *Your Cart*\n\n' +
        'Cart is managed in your browser session.\n' +
        'Visit the Oyru web app to view and checkout your cart.\n\n' +
        'Use /orders to see your order history.',
        { parse_mode: 'Markdown' }
      )
    })

    this.bot.command('orders', async (ctx) => {
      try {
        const recentOrders = await db
          .select({
            id: oyruOrders.id,
            orderNumber: oyruOrders.orderNumber,
            totalAmount: oyruOrders.totalAmount,
            status: oyruOrders.status,
            createdAt: oyruOrders.createdAt,
          })
          .from(oyruOrders)
          .orderBy(desc(oyruOrders.createdAt))
          .limit(5)

        if (recentOrders.length === 0) {
          await ctx.reply(
            '📋 *No orders found.*\n\nPlace your first order through the Oyru web app!',
            { parse_mode: 'Markdown' }
          )
          return
        }

        const statusEmoji: Record<string, string> = {
          pending: '⏳', confirmed: '✅', delivered: '📦',
          cancelled: '❌', in_transit: '🚚', packing: '🎁', picked_up: '🏃',
        }

        const lines = recentOrders.map(o => {
          const emoji = statusEmoji[o.status || 'pending'] || '📋'
          return `${emoji} *#${o.orderNumber}*\n   ${parseFloat(o.totalAmount).toFixed(2)} Birr — ${o.status}\n   ${new Date(o.createdAt).toLocaleDateString()}`
        }).join('\n\n')

        await ctx.reply(
          `📋 *Recent Orders*\n\n${lines}`,
          { parse_mode: 'Markdown' }
        )
      } catch (error) {
        console.error('[v0] Telegram orders command error:', error)
        await ctx.reply('Could not fetch orders. Please try again.')
      }
    })

    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        '📱 *Available Commands:*\n\n' +
        '/start — Welcome message\n' +
        '/products — Browse product categories\n' +
        '/cart — View your cart info\n' +
        '/orders — View recent orders\n' +
        '/help — Show this help message\n\n' +
        'Need help? Contact support@oyru.com',
        { parse_mode: 'Markdown' }
      )
    })

    this.bot.on('callback_query', async (ctx) => {
      const data = (ctx.callbackQuery as any).data as string
      await ctx.answerCbQuery()

      if (data === 'products') {
        await this.showProductsMenu(ctx)
      } else if (data === 'orders') {
        await ctx.reply('Use /orders to see your order history.')
      } else if (data === 'help') {
        await ctx.reply('Use /help for all commands.')
      } else if (data?.startsWith('cat_')) {
        const catMap: Record<string, string> = {
          cat_produce: '🥬 Fresh Produce', cat_dairy: '🥛 Dairy & Eggs',
          cat_beverages: '🥤 Beverages', cat_snacks: '🍪 Snacks', cat_essentials: '🛒 Essentials',
        }
        await ctx.reply(
          `${catMap[data] || 'Category'} selected.\n\nVisit the Oyru web app to browse and order.`
        )
      }
    })

    this.bot.on('text', async (ctx) => {
      await this.showMainMenu(ctx)
    })

    this.bot.catch((err, ctx) => {
      console.error('[v0] Telegram bot error:', err)
      ctx.reply('Sorry, an error occurred. Please try again.')
    })
  }

  private async showMainMenu(ctx: TelegramContext) {
    await ctx.reply('What would you like to do?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📦 Products', callback_data: 'products' },
            { text: '📋 Orders', callback_data: 'orders' },
          ],
          [{ text: '❓ Help', callback_data: 'help' }],
        ],
      },
    })
  }

  private async showProductsMenu(ctx: TelegramContext) {
    await ctx.reply('Select a category:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🥬 Fresh Produce', callback_data: 'cat_produce' },
            { text: '🥛 Dairy & Eggs', callback_data: 'cat_dairy' },
          ],
          [
            { text: '🥤 Beverages', callback_data: 'cat_beverages' },
            { text: '🍪 Snacks', callback_data: 'cat_snacks' },
          ],
          [{ text: '🛒 Essentials', callback_data: 'cat_essentials' }],
        ],
      },
    })
  }

  public async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message)
    } catch (error) {
      console.error('[v0] Error sending Telegram message:', error)
    }
  }

  public async sendOrderUpdate(chatId: number, orderNumber: string, status: string) {
    const emoji: Record<string, string> = {
      pending: '⏳', confirmed: '✅', packing: '📦',
      ready: '🟢', picked_up: '🏃', in_transit: '🚚', delivered: '🎉', cancelled: '❌',
    }
    const message =
      `${emoji[status] || '📋'} *Order Update*\n\n` +
      `Order: *#${orderNumber}*\n` +
      `Status: *${status.replace(/_/g, ' ').toUpperCase()}*`

    await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  }

  public getBot() {
    return this.bot
  }

  public async start() {
    try {
      this.setupHandlers()
      console.log('[v0] Telegram bot started')
    } catch (error) {
      console.error('[v0] Failed to start Telegram bot:', error)
    }
  }
}

let botService: TelegramBotService | null = null

export function getTelegramBot(): TelegramBotService {
  if (!botService) {
    botService = new TelegramBotService()
  }
  return botService!
}
