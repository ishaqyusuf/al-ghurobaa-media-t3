import { Api } from "telegram";

import { registerIncomingMessages } from "~/data-access/forward-chat.dta";
import { ScrapedMessage } from "~/type";

export async function forwardMessage(
  client,
  fromChat,
  toChat,
  messages: ScrapedMessage[],
) {
  try {
    const messageIds = await registerIncomingMessages(messages);
    if (!messageIds.length) throw new Error("All messages previously regisred");
    const result = await client.invoke(
      new Api.messages.ForwardMessages({
        fromPeer: await client.getEntity(fromChat),
        toPeer: await client.getEntity(toChat),
        id: messageIds,
        noforwards: true,
      }),
    );
    console.log("Message forwarded successfully:");
    return messageIds;
  } catch (error) {
    console.error("Error forwarding message:", error);
  }
}
