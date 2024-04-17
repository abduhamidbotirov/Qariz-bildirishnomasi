import Telegram from "node-telegram-bot-api";

// Botni boshlash
const bot = new Telegram("7110727842:AAGMBllxmoPiB6475KyZSfw3TKDqrCYxxTk", {
  polling: true,
});
let userStates = {};
let allUserData = [];
const qariz_info_channel_id = "@qariz_info";

function generateFinalMessage(userData) {
  let message = `Qariz egasi: ${userData.sourceOrDestination}\nSummasi: ${userData.summa}\nQariz: ${userData.type}\n\n`;
  return message;
}

bot.on("message", handleMessage);
bot.on("callback_query", handleCallbackQuery);
bot.on("polling_error", console.log);

function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id.toString();

  if (text !== "/start") {
    if (userStates[userId]?.state === "waiting_for_summa") {
      const qarizSummasi = text;
      userStates[userId].summa = qarizSummasi;
      bot.sendMessage(chatId, "Qariz egasining ismi");
      userStates[userId].state = "waiting_for_source_or_destination";

    } else if (userStates[userId]?.state === "waiting_for_source_or_destination") {
      const kimdanKimga = text;
      userStates[userId].sourceOrDestination = kimdanKimga;
      const userData = userStates[userId];
      const finalMessage = generateFinalMessage(userData);
      // bot.sendMessage(qariz_info_channel_id, finalMessage);
      bot.sendMessage(chatId, finalMessage, {
        reply_markup: {
          inline_keyboard: [
            [{
                text: "❌ Bekor qilish",
                callback_data: "cancel",
              },
              {
                text: "✅ Tasdiqlash",
                callback_data: "confirm",
              },
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      // delete userStates[userId];
    }

  } else {
    bot.sendMessage(
      chatId,
      `Assalomu alaykum! Xush kelibsiz!
      Bu botdan kimdan qancha qariz olgansiz va kimga qancha qariz bergansiz hammasini qayt etib borishingiz mumkun.`
    );
    bot.sendMessage(
      chatId,
      `Qariz berdingizmi yoki Qariz oldingizmi?`, {
        reply_markup: {
          inline_keyboard: [
            [{
                text: "Berdim",
                callback_data: "Berdim",
              },
              {
                text: "Oldim",
                callback_data: "Oldim",
              }
            ]
          ]
        }
      }
    );
    userStates[userId] = {
      state: "waiting_for_response"
    };
  }
}

function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const message = callbackQuery.data;
  const userId = callbackQuery.from.id.toString();

  if (message === "cancel") {
    // O'chirib yuborish
    bot.sendMessage(chatId, 'Qayta uruning Qariz berdizmi? yoki oldizmi?', {
      reply_markup: {
        inline_keyboard: [
          [{
              text: "Berdim",
              callback_data: "Berdim",
            },
            {
              text: "Oldim",
              callback_data: "Oldim",
            }
          ]
        ]
      }
    });
    userStates[userId] = {
      state: "waiting_for_response"
    };
  } else if (message === "complate") {
    // O'chirib yuborish
    bot.deleteMessage(chatId, callbackQuery.message.message_id);
  } else if (message === "confirm") {
    const userData = userStates[userId];
    allUserData.push(userData);
    const finalMessage = generateFinalMessage(userData);
    bot.sendMessage(qariz_info_channel_id, finalMessage, {
      reply_markup: {
        inline_keyboard: [
          [

            {
              text: "✅ uzildmi?",
              callback_data: "complate",
            }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    bot.sendMessage(chatId, "Yaxshi, Yana Qariz Oldizmi yoki Berdizmi", {
      reply_markup: {
        inline_keyboard: [
          [{
              text: "Berdim",
              callback_data: "Berdim",
            },
            {
              text: "Oldim",
              callback_data: "Oldim",
            }
          ]
        ]
      }
    });
    userStates[userId] = {
      state: "waiting_for_response"
    };
    // bot.deleteMessage(chatId, callbackQuery.message.message_id);

    // bot.deleteMessage(chatId, callbackQuery.message.message_id);
    // delete userStates[userId];
  } else {
    if (userStates[userId]?.state === "waiting_for_response") {
      if (message === "Berdim" || message === "Oldim") {
        userStates[userId] = {
          type: message,
          state: "waiting_for_summa"
        };
        bot.sendMessage(chatId, `Qariz summani kiriting..`);
      }
    } else if (userStates[userId]?.state === "waiting_for_summa") {
      const qarizSummasi = message;
      userStates[userId].summa = qarizSummasi;
      userStates[userId].state = "waiting_for_source_or_destination";
    } else if (userStates[userId]?.state === "waiting_for_source_or_destination") {
      const kimdanKimga = message;
      userStates[userId].sourceOrDestination = kimdanKimga;
      const userData = userStates[userId];
      const finalMessage = generateFinalMessage(userData);
      bot.sendMessage(chatId, finalMessage, {
        reply_markup: {
          inline_keyboard: [
            [{
                text: "❌ Bekor qilish",
                callback_data: "cancel",
              },
              {
                text: "✅ Tasdiqlash",
                callback_data: "confirm",
              }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      delete userStates[userId];
    }
  }
}