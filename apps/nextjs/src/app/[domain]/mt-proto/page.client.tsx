"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import InputControl from "@acme/ui/controlled/input-control";
import { Form, useForm } from "@acme/ui/form";
import { toast } from "@acme/ui/toast";

import { confirmCode, loginUser } from "./lib";

export default function PageClient({}) {
  const form = useForm({
    defaultValues: {
      phoneNumber: "+2348186877306",
      state: "number" as "number" | "code",
      code: "",
    },
  });
  const state = form.watch("state");
  async function signIn() {
    const resp = await loginUser(form.getValues("phoneNumber"));
    if (resp.isCodeViaApp) form.setValue("state", "code");
    else {
      console.log(resp);
      toast.error("Something went wrong");
    }
  }
  const route = useRouter();
  async function verifyCode() {
    const data = form.getValues();
    const res = await confirmCode(data.code, data.phoneNumber);
    if (res.id) route.push("/mt-proto/channels");
  }
  return (
    <Form {...form}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="grid gap-4">
          {state == "number" ? (
            <>
              <InputControl
                control={form.control}
                label="Phone Number"
                name="phoneNumber"
              />
              <Button onClick={signIn}>Verify</Button>
            </>
          ) : (
            <>
              <InputControl
                control={form.control}
                label="Phone Number"
                name="phoneNumber"
              />
              <Button onClick={verifyCode}>Verify</Button>
            </>
          )}
        </div>
      </div>
    </Form>
  );
}
