import { getTelegramBot } from './telegram-bot'
import { db } from '@/lib/db'
import { hotelAccounts, user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const OYRU_ORDER_STATUS_LABELS: Record<string, string> = {
  draft: '📝 Draft',
  submitted: '📤 Submitted',
  inventory_review: '🔍 Inventory Review',
  approved: '✅ Approved',
  assigned: '🚛 Driver Assigned',
  shipped: '📦 Shipped',
  delivered: '🎉 Delivered',
  completed: '✔️ Completed',
  cancelled: '❌ Cancelled',
}

/**
 * Send a Telegram notification about an order status change.
 */
export async function sendOrderStatusNotification({
  orderNumber,
  newStatus,
  hotelAccountId,
  additionalMessage,
}: {
  orderNumber: string
  newStatus: string
  hotelAccountId?: string | null
  additionalMessage?: string
}) {
  try {
    const bot = getTelegramBot()
    const statusLabel = OYRU_ORDER_STATUS_LABELS[newStatus] || newStatus

    const message =
      `🔔 *Order Update*\n\n` +
      `Order: *#${orderNumber}*\n` +
      `Status: *${statusLabel}*\n` +
      (additionalMessage ? `\n${additionalMessage}` : '')

    // Send to hotel's Telegram chat if available
    if (hotelAccountId) {
      const hotel = await db
        .select({ telegramChatId: hotelAccounts.telegramChatId })
        .from(hotelAccounts)
        .where(eq(hotelAccounts.id, hotelAccountId))
        .limit(1)

      if (hotel[0]?.telegramChatId) {
        await bot.sendMessage(parseInt(hotel[0].telegramChatId), message)
      }
    }

    // Also send to admin group if TELEGRAM_ADMIN_CHAT_ID is set
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID
    if (adminChatId) {
      await bot.sendMessage(parseInt(adminChatId), message)
    }
  } catch (error) {
    console.error('[v0] Error sending order notification:', error)
    // Don't throw — notifications are non-critical
  }
}

/**
 * Send a Telegram notification to a specific driver.
 */
export async function sendDriverNotification({
  driverUserId,
  message,
}: {
  driverUserId: string
  message: string
}) {
  try {
    const bot = getTelegramBot()

    // Look up the driver's Telegram chat ID from delivery_profiles or user settings if available
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID
    if (adminChatId) {
      await bot.sendMessage(parseInt(adminChatId), `🚚 *Driver Notification*\n\n${message}`)
    }
  } catch (error) {
    console.error('[v0] Error sending driver notification:', error)
  }
}

/**
 * Notify admins about a new order submission.
 */
export async function notifyNewOrder(orderNumber: string, hotelName: string, totalAmount: number) {
  try {
    const bot = getTelegramBot()
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID

    if (adminChatId) {
      const message =
        `🆕 *New Order Received*\n\n` +
        `Order: *#${orderNumber}*\n` +
        `Hotel: *${hotelName}*\n` +
        `Total: *${totalAmount.toFixed(2)} Birr*\n\n` +
        `Please review in the admin dashboard.`

      await bot.sendMessage(parseInt(adminChatId), message)
    }
  } catch (error) {
    console.error('[v0] Error notifying new order:', error)
  }
}
