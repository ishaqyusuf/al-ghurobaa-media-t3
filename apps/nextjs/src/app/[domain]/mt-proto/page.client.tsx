"use client";

import { useRouter } from "next/navigation";

import Button from "@acme/ui/common/button";
import FormInput from "@acme/ui/controlled/form-input";
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
    const data = form.getValues();
    const resp = await loginUser(data.phoneNumber);
    console.log(resp);

    if (resp.isCodeViaApp) form.setValue("state", "code");
    else {
      console.log(resp);
      toast.error("Something went wrong");
    }
  }
  const route = useRouter();
  async function verifyCode() {
    const data = form.getValues();
    const res = await confirmCode(data.phoneNumber, data.code);
    if (res.id) route.push("/mt-proto/channels");
  }
  return (
    <Form {...form}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="grid gap-4">
          {state == "number" ? (
            <>
              <FormInput
                control={form.control}
                label="Phone Number"
                name="phoneNumber"
              />
              <Button onClick={signIn}>Verify</Button>
            </>
          ) : (
            <>
              <FormInput
                control={form.control}
                label="Login Code"
                name="code"
              />
              <Button action={verifyCode}>Verify</Button>
            </>
          )}
        </div>
      </div>
    </Form>
  );
}
