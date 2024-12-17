"use client";

import { useEffect } from "react";

import { Button } from "@acme/ui/button";
import InputControl from "@acme/ui/controlled/input-control";
import { Form, useForm } from "@acme/ui/form";

import ListChannels from "./_components/list-channels";
import { authenticate, initClientDta, login, logoutUser } from "./server";

export default function TelegramPageClient({}) {
  const form = useForm({
    defaultValues: {
      signedIn: false,
      phoneNumber: "+2348186877306",
      status: null as "LOGGED_IN" | "WAITING_FOR_CODE" | "LOGGED_OUT",
      phoneCodeHash: "",
      isPhoneViaApp: false,
      confirmCode: "",
    },
  });
  const watcher = form.watch();
  useEffect(() => {
    initClientDta().then((res) => {
      //
      //   if (res.signedIn)
      form.setValue("status", res.signedIn ? "LOGGED_IN" : "LOGGED_OUT");
      console.log(res);
    });
  }, []);
  async function signIn() {
    login(watcher.phoneNumber).then((res) => {
      console.log(res);
      form.setValue("isPhoneViaApp", res.isCodeViaApp);
      form.setValue("phoneCodeHash", res.phoneCodeHash);
      if (res.isCodeViaApp) {
        form.setValue("status", "WAITING_FOR_CODE");
      }
    });
  }
  async function confirmSignIn() {
    authenticate(watcher.confirmCode, watcher.phoneNumber)
      .then((res) => {
        console.log(res);
        form.setValue("status", "LOGGED_IN");
      })
      .catch((e) => {
        console.log(e);
      });
  }
  async function logout() {
    await logoutUser();
    form.setValue("status", "LOGGED_OUT");
  }
  return (
    <div className="flex flex-col items-center justify-center">
      <div>
        <Form {...form}>
          {watcher.status == "LOGGED_OUT" && (
            <>
              <InputControl
                control={form.control}
                label="Phone Number"
                name="phoneNumber"
              />
              <Button onClick={signIn}>Sign In</Button>
            </>
          )}
          {watcher.status == "WAITING_FOR_CODE" && (
            <>
              <InputControl
                control={form.control}
                label="Confirmation Code"
                name="confirmCode"
              />
              <Button onClick={confirmSignIn}>Confirm</Button>
            </>
          )}
          {watcher.status == "LOGGED_IN" && (
            <div>
              <ListChannels />
              <Button onClick={logout}>Logout</Button>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
