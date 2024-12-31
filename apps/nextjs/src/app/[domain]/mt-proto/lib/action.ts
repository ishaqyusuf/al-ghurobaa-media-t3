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
    if ("code" in error && error.code == 401) {
      console.log(error);
    }
    return [];
    // await logoutAction();
  }
}
export async function logoutAction() {
  try {
    await logout();
    redirect("/mt-proto");
  } catch (error) {
    console.log(error);
  }
}
