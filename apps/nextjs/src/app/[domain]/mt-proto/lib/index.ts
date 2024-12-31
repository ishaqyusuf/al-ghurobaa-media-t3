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
  offsetDate?;
  offsetPeer?;
  pages?;
  results?: {
    id;
    username;
    title;
    rtl;
    photo;
    date;
  }[];
}
export async function channels({
  // offsetId = 1720712543,
  offsetId,
  limit = 150,
  pages = 1,
  // offsetDate = 1720712543,

  offsetDate,
  results = [],
  offsetPeer = new Api.InputPeerEmpty(),
}: ChannelsProps) {
  const client = await initializeClient();
  let hasMore = false;
  const result = await client.invoke(
    new Api.messages.GetDialogs({
      offsetDate,
      offsetId,
      // offsetId: 2055500106,
      offsetPeer,
      limit,
      // limit: 100, // Adjust this value to fetch more dialogs
      //    hash: 0,
    }),
  );
  // const channelDialogs = result.dialogs.filter(
  //   (dialog) => dialog.peer instanceof Api.PeerChannel,
  // );

  const dialogs = result.toJSON();

  if ("chats" in dialogs) {
    dialogs.chats.map((channel, index) => {
      if ("username" in channel)
        results?.push({
          id: channel.id,
          date: !channel.date ? null : new Date(channel.date * 1000),
          title: channel.title,
          username: channel.username || null,
          // isBroadcast: channel.broadcast || false,
          rtl: isRTL(channel.title),
          photo: (channel.photo as any)?.photoId,
        });
      return {};
    });
    const dlen = dialogs?.dialogs?.length - 1;
    if ("messages" in dialogs) {
      if (dialogs.messages.length > 0) {
        const lastMessage = dialogs.messages[dialogs.messages.length - 1];

        if (lastMessage && "date" in lastMessage) {
          offsetId = lastMessage.id;
          offsetDate = lastMessage.date;
          offsetPeer = dialogs?.dialogs?.[dlen]?.peer;
          hasMore = true;
        }
      }
    }
    console.log(hasMore, pages, results.length);
    if (hasMore && pages < 6) {
      pages += 1;

      return await channels({
        offsetPeer,
        offsetDate,
        offsetId,
        pages,
        results,
      });
    }
    return results;
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
  console.log(phoneNumber);

  const resp = await client.sendCode(CREDENTIAL, phoneNumber);
  saveSession(client.session.save());
  return resp;
};
const isRTL = (text: string) => {
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/; // Unicode range for RTL characters
  return rtlChars.test(text);
};
