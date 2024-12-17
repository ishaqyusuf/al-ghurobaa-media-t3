import readline from "readline";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

import { env } from "~/env";

const stringSession = new StringSession("");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let telegramClient: TelegramClient = null as any;
export const initializeClient = () => {
  if (!telegramClient)
    telegramClient = new TelegramClient(
      stringSession,
      +env.TELEGRAM_APP_ID,
      env.TELEGRAM_API_HASH,
      {
        connectionRetries: 5,
      },
    );
  return telegramClient;
};
const CREDENTIAL = {
  apiHash: env.TELEGRAM_API_HASH,
  apiId: +env.TELEGRAM_APP_ID,
};
export const loginUser = async (phoneNumber) => {
  const client = initializeClient();
  await client.connect();
  //   if(client.sign)
  //   if(client.session.)
  return await client.sendCode(CREDENTIAL, phoneNumber);
};

export const confirmCode = async (phoneNumber, phoneCode) => {
  const client = initializeClient();

  const result = await client.signInUser(CREDENTIAL, {
    phoneNumber,
    phoneCode,
    onError(e) {
      //
    },
    // phoneNumber: client.phoneNumber,
    // phoneCode: phoneCode,
  });
  return result;
};
export const logoutUser = async () => {
  if (telegramClient) {
    telegramClient.session.delete();
    telegramClient = null;
  }
};
// const client = new TelegramClient(
//   stringSession,
//   +env.TELEGRAM_APP_ID,
//   env.TELEGRAM_API_HASH,
//   {
//     connectionRetries: 5,
//   },
// );
// async function load() {
//   await client.start({
//     phoneNumber: async () => {
//       // rl.question('Please enter your number:')
//       return "+2348186877306";
//     },
//     // password: async () => ""
//     phoneCode: async () => {
//       return prompt("Check your Telegram app for the code.");
//     },
//   });
//   //   })
// }
