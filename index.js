/** Если у вас есть 
 * предложения по улучшению
 *  или вы хотите связаться со мной
 *  - @matthew_parker. */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import TelegramBot from "node-telegram-bot-api"; // Telegram Bot API
import {NFTApi,Configuration,} from 'tonapi-sdk-js'; // TON API
import TonWeb from "tonweb"; // API TON 
import fetch from 'node-fetch';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const authToken = "PASTE_HERE_YOUR_AUTH_TOKEN"; // токен для работы в TON API  https://t.me/tonapi_bot - /get_client_key
const collectionAddress = "PASTE_HERE_YOUR_COLLECTION_ADDRESS";  // адрес коллекции для поиска
let token = 'PASTE_HERE_YOUR_BOT_TOKEN'; /// токен аутетификации бота (```https://t.me/BotFather```)

const bot = new TelegramBot(token, {polling: true}); // Telegram Bot Object
const Address = TonWeb.utils.Address;
const authPhrase = 'Bearer ' + authToken; 

const nftApi = new NFTApi(new Configuration({
  headers: {
      // To get unlimited requests
      Authorization: authPhrase,
  },
  fetchApi: fetch
})); // NFT API Object

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

bot.onText(/\/start/, function onStartText(msg) // On /start message
{
    bot.sendMessage(msg.chat.id,
      "*Добро пожаловать*👋\n" +
      "\n" +
      "Для получения списка NFT, введите адрес вашего кошелька.\n", {parse_mode: 'Markdown'});
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if(msg.text === "/start") return;
  try
  {
    let nftCount = 0;
    const { nftItems } = await nftApi.getNftItemsByCollectionAddress({account: collectionAddress});
    nftItems.forEach(nftItem => {
      let address = new Address(nftItem.owner.address).toString(true, true, true);
      if(address == msg.text)
      {
        nftCount++;
        bot.sendPhoto(chatId, nftItem.metadata.image, 
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🧩 Посмотреть в Explorer 🧩', // текст на кнопке
                  url: 'https://explorer.tonnft.tools/nft/' + new Address(nftItem.address).toString(true, true, true) // данные для обработчика событий
                }
              ]
            ]
          },
          parse_mode: 'Markdown',
          caption: 
          "*Name: " + nftItem.metadata.name + "*\n" +
          "*Address: " + new Address(nftItem.address).toString(true, true, true) + "*\n" +
          "*Index: " + nftItem.index + "*\n",
        });
      }
    });
    if(nftCount == 0)
    {
      bot.sendMessage(msg.chat.id,
        "По вашему адресу кошелька не было найдено ни одного NFT из коллекции.\n", {parse_mode: 'Markdown'});
    }
  }
  catch(error)
  {
    console.log(error);
  }
});

