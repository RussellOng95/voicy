// Dependencies
const { findChat } = require('../helpers/db')
const { sendLanguage, setLanguageCode } = require('../helpers/language')
const { checkAdminLock } = require('../helpers/admins')
const { checkDate } = require('../helpers/filter')

/**
 * Setting up start command
 * @param {Telegraf:Bot} bot Bot that should get start setup
 */
function setupStart(bot) {
  // Start command
  bot.start(checkDate, async ctx => {
    // Get chat
    let chat = await findChat(ctx.chat.id)
    // Check if admin locked
    const adminLockCheck = await checkAdminLock(chat, ctx)
    if (!adminLockCheck) return
    // Check if Telegram gives us language code
    if (ctx.from && ctx.from.language_code) {
      // Set language code to the chat
      chat = await setLanguageCode(chat, ctx.from.language_code)
      sendStart(ctx, chat)
    } else {
      sendLanguage(ctx)
    }
  })
  // Enter chat
  bot.on('new_chat_members', async ctx => {
    if (
      ctx.message.new_chat_participant &&
      ctx.message.new_chat_participant.username === process.env.USERNAME
    ) {
      // Get chat
      const chat = await findChat(ctx.chat.id)
      // Check if admin locked
      const adminLockCheck = await checkAdminLock(chat, ctx)
      if (!adminLockCheck) return
      // Send language keyboard
      sendLanguage(ctx, chat)
    }
  })
}

/**
 * Sends start message
 * @param {Telegraf:Context} ctx Context to respond
 * @param {Mongoose:Chat} chat Relevant chat
 */
async function sendStart(ctx, chat) {
  // Get localization strings and set it up
  const strings = require('../helpers/strings')()
  strings.setChat(chat)
  // Send start message
  const text = strings.translate(
    "👋 Hello there! *Voicy* is a voice recognition bot that converts all voice messages and audio files (.ogg, .flac, .wav, .mp3) it gets into text.\n\n*Voicy* supports three voice recognition engines: wit.ai, Yandex SpeechKit and Google Speech. Initially it's set to use wit.ai but you can switch to Google Speech or Yandex SpeechKit anytime in /engine. More information in /help."
  )
  await ctx.replyWithMarkdown(text)
  // Log time
  console.info(
    `/start answered in ${(new Date().getTime() - ctx.timeReceived.getTime()) /
      1000}s`
  )
}

// Exports
module.exports = {
  setupStart,
  sendStart,
}
