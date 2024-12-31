"use client";

import { useCallback, useEffect, useState } from "react";

import Button from "@acme/ui/common/button";
import { Menu } from "@acme/ui/common/menu";
import FormCheckbox from "@acme/ui/controlled/form-checkbox";
import FormInput from "@acme/ui/controlled/form-input";
import { Form, useFieldArray, useForm } from "@acme/ui/form";
import { toast } from "@acme/ui/toast";

import type { GetChannelStat } from "~/data-access/forward-chat.dta";
import Container, { Section } from "~/app/_components/container";
import Header from "~/app/_components/header";
import {
  clearChannelRecord,
  getChatStat,
} from "~/data-access/forward-chat.dta";
import { generateRandomString } from "~/utils/db-utils";
import { scrapeChannel } from "../../../lib/scrape-channel";

// @SoundBooks1
export default function Channel({ params }) {
  const username = decodeURIComponent(params.username);
  // console.log(username);

  const [data, setData] = useState<GetChannelStat>();
  useEffect(() => {
    load();
  }, []);
  const defaultValues = {
    limit: 100,
    scrapeLatest: false,
    scrapeProps: {
      document: true,
      audio: true,
      image: true,
      text: true,
    },
    scraper: {
      scraping: false,
      paused: false,
      scrapeUid: "",
      msg: null,
      count: 0,
      scrapingRecords: [],
    },
  };
  const form = useForm({
    defaultValues,
  });
  const arr = useFieldArray({
    control: form.control,
    name: "scraper.scrapingRecords",
  });
  const scraper = form.watch("scraper");

  function load() {
    getChatStat(username)
      .then((resp) => {
        setData(resp);
        if (resp?.meta?.scrapeForm)
          form.reset({
            scrapeProps: resp?.meta?.scrapeForm,
          });
        setLastMessageId({
          new: resp?.lastMessageId,
          old: null,
        });
      })
      .catch((e) => {
        toast.error("something went wrong");
      });
  }
  async function clearChannel() {
    await clearChannelRecord(username);
    load();
  }
  const [lastMessageId, setLastMessageId] = useState<{ old; new }>({
    old: null,
    new: null,
  });
  const _scrapeChannel = useCallback(async () => {
    const formData = form.getValues();
    const resp = await scrapeChannel(username, {
      ...formData.scrapeProps,
      limit: formData.limit,
      lastMessageId: lastMessageId?.new,
      scrapeLatest: formData.scrapeLatest,
    });
    toast.success(resp.status);
    setData((current) => {
      return {
        ...current,
        stat: {
          ...current?.stat,
          scraped: (current?.stat.scraped || 0) + resp.scrapped,
        },
        lastMessageId: resp.lastScrapeMessageId
          ? resp.lastScrapeMessageId
          : current?.lastMessageId,
      };
    });
    return resp;
  }, [form, lastMessageId, username]);
  const __scrape = useCallback(async () => {
    const r = await _scrapeChannel();
    console.log(r);
    form.setValue("scraper.count", scraper.count + 1);
    arr.append(r);
    let msg: string | null = null;
    if (lastMessageId == r.lastScrapeMessageId)
      msg = "Last Message id is equal";
    if (r.status == "error") msg = "Error";
    if (r.unknownFormats?.length)
      msg = `Unknown Formats: ${r.unknownFormats.join(", ")}`;
    if (msg) {
      form.setValue("scraper.paused", true);
      form.setValue("scraper.msg", msg as any);
    } //else
    setLastMessageId((old) => ({
      ...old,
      new: r.lastScrapeMessageId,
    }));
    // setTimeout(() => {
    //   form.setValue("scraper.scrapeUid", generateRandomString());
    // }, 2000);
  }, [lastMessageId, form, _scrapeChannel, arr, scraper.count]);

  useEffect(() => {
    if (scraper.scraping && !scraper.paused) {
      if (
        !lastMessageId?.new ||
        (lastMessageId?.new && lastMessageId?.new != lastMessageId?.old)
      ) {
        __scrape()
          .then((r) => {
            //
          })
          .catch((e) => {
            //
          });
      }
    }
  }, [lastMessageId, scraper.scraping, scraper.paused]);
  async function autoScrape() {
    form.setValue("scraper.scraping", true);
    const c = generateRandomString();
    form.setValue("scraper.scrapeUid", c);
    setLastMessageId((c) => ({ ...c, new: data?.lastMessageId }));
  }

  function resume() {
    form.setValue("scraper.paused", false);
    form.setValue("scraper.msg", null);
    form.setValue("scraper.scrapeUid", generateRandomString());
  }

  return (
    <Container>
      <Header
        title={`${username}`}
        back="."
        Actions={
          <>
            <Menu.Item href={`${username}/forwarder`}>Chat Forwarder</Menu.Item>
            <Menu.Item onClick={clearChannel}>Clear Channel</Menu.Item>
          </>
        }
      />
      <Section>
        <div>
          <div className="grid grid-cols-2">
            <span>Message Scraped: {data?.stat.scraped}</span>
            <span>Forwareded: {data?.stat?.forwared}</span>
            <span>Blogs: {data?.stat?.blogs}</span>
            <span>Last Scrape ID: {lastMessageId?.new}</span>
          </div>
        </div>
        <Form {...form}>
          <div className="m-4 grid grid-cols-4 gap-2">
            {["audio", "document", "image", "text"].map((a) => {
              return (
                <FormCheckbox
                  key={a}
                  label={a}
                  control={form.control}
                  name={`scrapeProps.${a}` as any}
                />
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              type="number"
              size="sm"
              name="limit"
              label="Scrape Limit"
            />
            <FormCheckbox
              control={form.control}
              name="scrapeLatest"
              label="Scrape Latest"
            />
          </div>
        </Form>
        <div className="flex gap-4">
          <Button action={_scrapeChannel}>Scrape Channel</Button>
          <Button action={autoScrape}>Auto-Scrape</Button>
          {/* <Button onClick={forwardMessage}>Forward Message</Button> */}
        </div>

        <div className="">
          {scraper.paused && (
            <>
              <p>{scraper.msg}</p>
              <Button onClick={resume}>Resume</Button>
            </>
          )}
        </div>
      </Section>
    </Container>
  );
}
