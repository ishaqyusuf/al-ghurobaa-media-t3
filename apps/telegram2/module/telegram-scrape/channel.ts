"use server";

import { Api } from "telegram";

import { initializeClient } from ".";

const channelName = "Almashwry";
// const channelName = "almshwrey"
export async function scrapeChannel() {
  const client = await initializeClient();

  const channel = await client.getEntity(`t.me/${channelName}`);

  // const messages = await client.getMessages(channel, {});
  const messages = await client.invoke(
    new Api.messages.GetHistory({
      peer: channel,

      limit: 10, // Specify how many messages you want to fetch (e.g., 10 latest messages)
      // offsetId: 0, // Start from the latest message
      // addOffset: 0,
      // maxId: 0,
      // minId: 0,
      // id: []  // You can specify a list of message IDs to fetch, leave empty to fetch latest
    }),
  );

  // Format the messages with relevant information
  const data: {
    messages: Api.TypeMessage[];
    chats: Api.TypeChat[];
    users: Api.TypeUser[];
  } = messages.toJSON();
  const formattedMessages = data.messages.map((msg) => ({
    messageId: msg.id,
    type: msg.media ? msg.media.className : "text", // Check if the message has media
    audioId: msg.media && msg.media.className === "Audio" ? msg.media.id : null, // For audio messages
    replyId: msg.replyToMsgId || null, // If the message is a reply to another
    date: new Date(msg.date * 1000), // Date of the message
    text: msg.message || null, // Text content of the message (if it's a text message)
    senderId: msg.fromId, // Who sent the message
    isBroadcast: msg.peerId?.channelId ? true : false, // Check if it's from a channel
    hasMedia: msg.media !== null, // Whether the message has media
    raw: msg,
  }));
  await forwardMessage(
    channelName,
    "@al_ghurobaa_bot",
    formattedMessages?.[0]?.messageId,
  );

  return formattedMessages;
}
export async function forwardMessage(fromChat, toChat, messageId) {
  try {
    const client = await initializeClient();

    // Forward the message
    const result = await client.invoke(
      new Api.messages.ForwardMessages({
        fromPeer: await client.getEntity(fromChat), // Source chat/channel
        toPeer: await client.getEntity(toChat), // Target chat/channel
        id: [messageId], // Message ID(s) to forward
        withMyScore: false, // Use for forwarding game score messages
        randomId: [BigInt(Math.floor(Math.random() * 1e10))], // Random ID for uniqueness
      }),
    );

    console.log("Message forwarded successfully:", result);
  } catch (error) {
    console.error("Error forwarding message:", error);
  } finally {
    // await client.disconnect();
  }
}

export async function channelList() {
  const client = await initializeClient();

  // Fetch all dialogs (chats, groups, channels)
  const dialogs: {
    dialogs: Api.TypeDialog[];
    messages: Api.TypeMessage[];
    chats: Api.TypeChat[];
    users: Api.TypeUser[];
  } = (
    await client.invoke(
      new Api.messages.GetDialogs({
        offsetDate: 0,
        offsetId: 0,
        offsetPeer: new Api.InputPeerEmpty(),
        limit: 100, // Adjust this value to fetch more dialogs
        hash: 0,
      }),
    )
  ).toJSON();

  // Filter for channels only
  const channels = dialogs.chats.filter(
    Boolean,
    // (chat) => chat.className === "Channel" && !chat.isMegagroup, // Optional: exclude mega-groups if you want channels only
  );

  // Convert to JSON or return as needed
  return channels.map((channel, index) => ({
    id: channel.id,
    title: channel.title,
    className: channel.className,
    username: channel.username || null,
    isBroadcast: channel.broadcast || false, // Indicates if it's a broadcast channel
    // raw: index < 10 ? channel : null,
    photo: channel.photo?.photoId,
  }));
}
