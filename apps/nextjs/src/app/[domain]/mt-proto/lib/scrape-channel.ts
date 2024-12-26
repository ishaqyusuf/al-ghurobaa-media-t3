"use server";

import { Api } from "telegram";

import type { MimeType, ScrapedMessage } from "~/type";
import {
  getChannelWithLastScrapeMessageId,
  registerIncomingMessages,
} from "~/data-access/forward-chat.dta";
import { initializeClient } from ".";

interface Props {
  limit?;
  image?: boolean;
  video?: boolean;
  text?: boolean;
  audio?: boolean;
  document?: boolean;
  scrapeLatest?: boolean;
  lastMessageId?;
}
export async function scrapeChannel(channelName, { ...props }: Props) {
  const client = await initializeClient();
  console.log(props);

  const channel = await client.getEntity(`t.me/${channelName}`);
  const dbChannel = await getChannelWithLastScrapeMessageId(channelName);
  const response = await client.invoke(
    new Api.messages.GetHistory({
      peer: channel,
      offsetId: props.scrapeLatest ? 0 : props.lastMessageId, // || dbChannel.lastMessageId,
      // offsetId: 12003,
      limit: props.limit || 0,
    }),
  );
  if ("messages" in response) {
    let lastScrapeMessageId;
    console.log(response.messages.length);
    const unknownFormats = [];
    const formattedMessages: ScrapedMessage[] = response.messages
      .filter((msg, index) => {
        if (response.messages.length == index + 1) lastScrapeMessageId = msg.id;
        if ("media" in msg) {
          if (msg.media instanceof Api.MessageMediaPhoto) {
            return props.image;
          } else if (msg.media instanceof Api.MessageMediaDocument) {
            const mt: MimeType = (msg?.media?.document as any)?.mimeType;
            switch (mt) {
              case "application/pdf":
                return props.document;
              case "video/mp4":
                return props.video;
              case "audio/mpeg":
              case "audio/MP3":
              case "audio/mp3":
              case "audio/mp4":
              case "audio/m4a":
              case "audio/aac":
              case "audio/ogg":
              case "audio/amr":
                return props.audio;
              default:
                const [type, pr] = mt?.split("/");
                switch (type) {
                  case "audio":
                    console.log(mt);
                    return props.audio;
                  case "image":
                    console.log(mt);
                    return props.image;
                  case "video":
                    console.log(mt);
                    return props.video;
                  default:
                    unknownFormats.push(mt);
                }

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
    console.log(lastScrapeMessageId);
    console.log(formattedMessages);

    try {
      if (!formattedMessages.length) throw new Error("Nothing to scrape");
      const messageIds = await registerIncomingMessages(formattedMessages);
      // const fwrd = await forwardMessage(
      //   client,
      //   channelName,
      //   formattedMessages,
      // "@al_ghurobaa_bot",
      // );
      return {
        status: `Scraped: ${messageIds.length}`,
        scrapped: messageIds?.length,
        messageIds,
        lastScrapeMessageId,
        unknownFormats,
      };
    } catch (error) {
      // if (lastScrapeMessageId)
      //   return await scrapeChannel(channelName, {
      //     limit,
      //     ...props,
      //     lastMessageId: lastScrapeMessageId,
      //   });
    }
  }
  return {
    status: "error",
    scrapped: 0,
  };
}
