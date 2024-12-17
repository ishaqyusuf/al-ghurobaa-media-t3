import fs from "fs";
import readline from "readline";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

import { env } from "~/env";

const sessionFilePath = "./session.txt";
// const stringSession = new StringSession(
//   fs.readFileSync(sessionFilePath, "utf-8"),
// );
const loadSessionFromFile = () => {
  if (fs.existsSync(sessionFilePath)) {
    const sessionString = fs.readFileSync(sessionFilePath, "utf-8");
    console.log(sessionString);
    return new StringSession(sessionString); // Load from file
  }
  return new StringSession(""); // Return an empty session if no file exists
};
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let telegramClient: TelegramClient = null as any;
export const initializeClient = async () => {
  if (!telegramClient) {
    const stringSession = loadSessionFromFile();

    telegramClient = new TelegramClient(
      stringSession,
      +env.TELEGRAM_APP_ID,
      env.TELEGRAM_API_HASH,
      {
        connectionRetries: 5,
      },
    );
  }
  const client = telegramClient;
  await client.connect();
  return client;
};
const CREDENTIAL = {
  apiHash: env.TELEGRAM_API_HASH,
  apiId: +env.TELEGRAM_APP_ID,
};
export const loginUser = async (phoneNumber) => {
  console.log("LOGGIN IN>>>>");
  const client = await initializeClient();
  // await client.connect();
  // stringSession.getAuthKey()
  //   if(client.sign)
  //   if(client.session.)
  const resp = await client.sendCode(CREDENTIAL, phoneNumber);

  saveSession(client.session.save());
  console.log(resp);
  return resp;
};
function saveSession(sessionString) {
  // const client = initializeClient();
  // client.connect();
  console.log({ sessionString });

  fs.writeFileSync(sessionFilePath, sessionString);
}
export const confirmCode = async (phoneNumber: string, phoneCode: string) => {
  console.log("CONFIRM CODE");
  const client = await initializeClient();
  const result = await client.signInUser(CREDENTIAL, {
    phoneNumber: async () => phoneNumber,
    phoneCode: async () => phoneCode,
    onError(e) {
      // console.log(e);
      throw Error(e.message);
    },
  });
  saveSession(client.session.save());
  return result;
};
export const __logoutUser = async () => {
  if (telegramClient) {
    telegramClient.session.delete();
    telegramClient = null as any;
    saveSession("");
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
