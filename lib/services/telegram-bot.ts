import { Telegraf, Context } from 'telegraf'
import { db } from '@/lib/db'
import { usersProfile } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface TelegramContext extends Context {
  session?: {
    userId?: string
    cartItems?: any[]
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
    // Start command
    this.bot.start(async (ctx) => {
      const chatId = ctx.chat?.id
      console.log('[v0] Telegram /start from chat:', chatId)

      await ctx.reply(`
🎉 Welcome to Oyru Delivery!

Select an option below:
      `)

      await this.showMainMenu(ctx)
    })

    // Products command
    this.bot.command('products', async (ctx) => {
      await ctx.reply('📦 Browse our products by category:')
      await this.showProductsMenu(ctx)
    })

    // Search command
    this.bot.command('search', async (ctx) => {
      const searchQuery = ctx.message.text?.replace('/search', '').trim()
      if (!searchQuery) {
        await ctx.reply('Please provide a search term: /search <product_name>')
        return
      }

      await ctx.reply(`Searching for products: "${searchQuery}"...`)
      // TODO: Implement product search
    })

    // Cart command
    this.bot.command('cart', async (ctx) => {
      await ctx.reply('🛒 Your Cart:')
      // TODO: Implement cart display
    })

    // Orders command
    this.bot.command('orders', async (ctx) => {
      await ctx.reply('📋 Your Orders:')
      // TODO: Implement orders display
    })

    // Help command
    this.bot.command('help', async (ctx) => {
      await ctx.reply(`
📱 Available Commands:

/start - Start the bot
/products - Browse products
/search <query> - Search products
/cart - View your cart
/orders - View your orders
/help - Show this help message

Need assistance? Contact our support team!
      `)
    })

    // Handle text messages
    this.bot.on('text', async (ctx) => {
      const text = ctx.message.text

      if (text?.includes('📦 Products')) {
        await this.showProductsMenu(ctx)
      } else if (text?.includes('🛒 Cart')) {
        await ctx.reply('Your cart is empty. Start shopping to add items!')
      } else if (text?.includes('📋 Orders')) {
        await ctx.reply('You have no orders yet.')
      } else {
        await this.showMainMenu(ctx)
      }
    })

    // Error handler
    this.bot.catch((err, ctx) => {
      console.error('[v0] Telegram bot error:', err)
      ctx.reply('Sorry, an error occurred. Please try again.')
    })
  }

  private async showMainMenu(ctx: TelegramContext) {
    await ctx.reply(
      'What would you like to do?',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📦 Products', callback_data: 'products' },
              { text: '🛒 Cart', callback_data: 'cart' },
            ],
            [
              { text: '📋 Orders', callback_data: 'orders' },
              { text: '❓ Help', callback_data: 'help' },
            ],
          ],
        },
      }
    )
  }

  private async showProductsMenu(ctx: TelegramContext) {
    await ctx.reply(
      'Select a category:',
      {
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
      }
    )
  }

  public async linkTelegramUser(telegramChatId: number, userId: string) {
    try {
      const profile = await db
        .select()
        .from(usersProfile)
        .where(eq(usersProfile.userId, userId))
        .limit(1)

      if (profile.length) {
        // TODO: Update profile with telegramChatId when schema supports it
        console.log('[v0] Linked Telegram user:', telegramChatId, 'to userId:', userId)
      }
    } catch (error) {
      console.error('[v0] Error linking Telegram user:', error)
    }
  }

  public async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message)
    } catch (error) {
      console.error('[v0] Error sending Telegram message:', error)
    }
  }

  public async sendOrderUpdate(chatId: number, orderNumber: string, status: string) {
    const message = `
📦 Order Update

Order #${orderNumber}
Status: ${status}

Track your order with /orders
    `
    await this.sendMessage(chatId, message)
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

// Singleton instance
let botService: TelegramBotService | null = null

export function getTelegramBot(): TelegramBotService {
  if (!botService) {
    botService = new TelegramBotService()
  }
  return botService
}
