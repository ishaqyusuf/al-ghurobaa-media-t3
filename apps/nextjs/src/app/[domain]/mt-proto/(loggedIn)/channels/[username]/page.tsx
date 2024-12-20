"use client";

import { useEffect, useState } from "react";

import { Button } from "@acme/ui/button";
import { Form, useForm } from "@acme/ui/form";
import { toast } from "@acme/ui/toast";

import type { GetChatHistory } from "~/data-access/forward-chat.dta";
import {
  clearChannelRecord,
  getChatHistory,
} from "~/data-access/forward-chat.dta";
import { scrapeChannel } from "../../../lib/scrape-channel";

export default function Channel({ params }) {
  const username = decodeURIComponent(params.username);
  console.log(username);

  const [data, setData] = useState<GetChatHistory>(null);
  useEffect(() => {
    load();
  }, []);
  const defaultValues = {
    scrapeProps: {
      document: false,
      audio: false,
      image: false,
      text: false,
    },
  };
  const form = useForm({
    defaultValues,
  });
  async function forwardMessage() {
    const resp = await scrapeChannel(username, {});
    load();
  }
  function load() {
    getChatHistory(username)
      .then((resp) => {
        setData(resp);
      })
      .catch((e) => {
        toast.error("something went wrong");
      });
  }
  async function clearChannel() {
    await clearChannelRecord(username);
    load();
  }
  return (
    <>
      {username}
      <div>
        <div>
          <div className="grid grid-cols-2">
            <span>Message Scraped: {data?.forwards?.length}</span>
            <span>Blogs: {data?.blogs?.length}</span>
          </div>
        </div>
        <Form {...form}>
          <div></div>
        </Form>
        <Button onClick={forwardMessage}>Forward Message</Button>
        <Button onClick={clearChannel}>Clear Channel</Button>
      </div>
    </>
  );
}
