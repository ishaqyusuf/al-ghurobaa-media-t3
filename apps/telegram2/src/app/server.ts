"use server";

import {
  __logoutUser,
  confirmCode,
  initializeClient,
  loginUser,
} from "module/telegram-scrape";
import {
  listChannels,
  listChannels2,
  scrapeChannel,
} from "module/telegram-scrape/channel";

export async function initClientDta() {
  const resp = await initializeClient();

  return {
    signedIn: Number(resp.session.authKey?.keyId),
  };
}
export async function login(phoneNumber) {
  const s = await loginUser(phoneNumber);
  return {
    ...s,
    // scraped: await scrapeChannel(),
  };
}
export async function logoutUser() {
  const s = await __logoutUser();
  return s;
}
export async function authenticate(code, phoneNumber) {
  console.log(">>>");
  const w = await confirmCode(phoneNumber, code);
  console.log(w);

  return {
    id: Number(w.toJSON().id),
  };
}
export async function loadChannels() {
  return await scrapeChannel();
}
