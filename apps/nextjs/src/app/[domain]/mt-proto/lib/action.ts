"use server";

import { redirect } from "next/navigation";

import { channels, initializeClient, logout } from ".";

export async function isLoggedIn() {
  const resp = await initializeClient();
  return await resp.isUserAuthorized();
}
export async function loadChannels() {
  try {
    return await channels({});
  } catch (error) {
    console.log(error);
    return [];
    // await logoutAction();
  }
}
export async function logoutAction() {
  await logout();

  redirect("/mt-proto");
}
