"use server";

import fs from "fs";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

import { env } from "~/env";

const sessionFilePath = "./session.txt";

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
const loadSessionFromFile = () => {
  if (fs.existsSync(sessionFilePath)) {
    const sessionString = fs.readFileSync(sessionFilePath, "utf-8");
    console.log(sessionString);
    return new StringSession(sessionString); // Load from file
  }
  return new StringSession(""); // Return an empty session if no file exists
};
interface ChannelsProps {
  offsetId?;
  limit?;
}
export async function channels({ offsetId = 0, limit = 100 }: ChannelsProps) {
  const client = await initializeClient();
  const dialogs = (
    await client.invoke(
      new Api.messages.GetDialogs({
        offsetDate: 0,
        offsetId: 0,
        offsetPeer: new Api.InputPeerEmpty(),
        limit: 250, // Adjust this value to fetch more dialogs
        //    hash: 0,
      }),
    )
  ).toJSON();
  if ("chats" in dialogs) {
    return dialogs.chats.map((channel, index) => ({
      id: channel,
      title: channel.title,
      className: channel.className,
      username: channel.username || null,
      isBroadcast: channel.broadcast || false, // Indicates if it's a broadcast channel
      // raw: index < 10 ? channel : null,
      photo: channel.photo?.photoId,
    }));
  }
}
export async function logout() {
  const client = await initializeClient();

  client.session.delete();
  telegramClient = null as any;
  saveSession("");
  console.log(">>>>>>>>>>>>>>>>LOGOUT");
}
function saveSession(sessionString) {
  // const client = initializeClient();
  // client.connect();
  console.log({ sessionString });

  fs.writeFileSync(sessionFilePath, sessionString);
}
export const confirmCode = async (phoneNumber: string, phoneCode: string) => {
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
  //   return result;
  return {
    id: Number(result.toJSON().id),
  };
};
export const loginUser = async (phoneNumber) => {
  const client = await initializeClient();
  const resp = await client.sendCode(CREDENTIAL, phoneNumber);
  saveSession(client.session.save());
  return resp;
};