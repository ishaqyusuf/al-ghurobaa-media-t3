"use server";

import { Api } from "telegram";

import type { MimeType, ScrapedMessage } from "~/type";
import { getChannelWithLastScrapeMessageId } from "~/data-access/forward-chat.dta";
import { initializeClient } from ".";
import { forwardMessage } from "./forward-chat";

interface Props {
  limit?;
  photo?: boolean;
  video?: boolean;
  text?: boolean;
  audio?: boolean;
  document?: boolean;
  lastMessageId?;
}
export async function scrapeChannel(
  channelName,
  { limit = 1, ...props }: Props,
) {
  const client = await initializeClient();

  const channel = await client.getEntity(`t.me/${channelName}`);
  const dbChannel = await getChannelWithLastScrapeMessageId(channelName);
  const response = await client.invoke(
    new Api.messages.GetHistory({
      peer: channel,
      offsetId: props.lastMessageId || dbChannel.lastMessageId,
      limit,
    }),
  );
  if ("messages" in response) {
    let lastScrapeMessageId;
    const formattedMessages: ScrapedMessage[] = response.messages
      .filter((msg, index) => {
        if (response.messages.length == index + 1) lastScrapeMessageId = msg.id;
        if ("media" in msg) {
          if (msg.media instanceof Api.MessageMediaPhoto) {
            return props.photo;
          } else if (msg.media instanceof Api.MessageMediaDocument) {
            const mt: MimeType = (msg?.media?.document as any)?.mimeType;
            switch (mt) {
              case "application/pdf":
                return props.document;
              case "video/mp4":
                return props.video;
              case "audio/mpeg":
                return props.audio;
              default:
                return false;
            }
          }
        }
        return props.text;
      })
      .map((msg) => {
        return {
          messageId: msg.id,
          publishedDate: new Date((msg as any).date * 1000),
          channelId: dbChannel.channel.id,
        };
      });
    try {
      if (!formattedMessages.length) throw new Error("Nothing to scrape");
      const fwrd = await forwardMessage(
        client,
        channelName,
        "@al_ghurobaa_bot",
        formattedMessages,
      );
      return {
        status: "success",
        scrapped: fwrd?.length,
      };
    } catch (error) {
      if (lastScrapeMessageId)
        return await scrapeChannel(channelName, {
          limit,
          ...props,
          lastMessageId: lastScrapeMessageId,
        });
    }
  }
  return {
    status: "error",
    scrapped: 0,
  };
}
